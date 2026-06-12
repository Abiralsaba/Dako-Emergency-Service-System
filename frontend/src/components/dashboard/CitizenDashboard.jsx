import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/AuthContext';
import useGeolocation from '../../hooks/useGeolocation';
import useWebSocket from '../../hooks/useWebSocket';
import emergencyService from '../../services/emergencyService';
import locationService from '../../services/locationService';
import EmergencyMap from '../map/EmergencyMap';
import ServiceMarker from '../map/ServiceMarker';
import SOSButton from '../ui/SOSButton';
import ServiceTypeSelector, { AMBULANCE_OPTIONS } from '../ui/ServiceTypeCard';
import StatusStepper from '../ui/StatusStepper';
import EmergencyCard from '../ui/EmergencyCard';
import FirePhotoCapture from '../ui/FirePhotoCapture';
import { Phone, User, Car, MapPin, X, Clock, AlertTriangle, RefreshCw, Loader, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { latitude, longitude, error: geoError, loading: geoLoading, permissionState, retry: retryGeo, hasRealLocation, setManualLocation } = useGeolocation();
  const { subscribe } = useWebSocket();

  const [emergencyType, setEmergencyType] = useState(null);
  const [ambulanceType, setAmbulanceType] = useState(null);
  const [description, setDescription] = useState('');
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responderPos, setResponderPos] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showFireCapture, setShowFireCapture] = useState(false);
  const [fireAnalyzing, setFireAnalyzing] = useState(false);
  const directionsServiceRef = useRef(null);

  useEffect(() => {
    loadEmergencies();
  }, []);

  useEffect(() => {
    if (!latitude || !longitude) return;
    locationService.update(latitude, longitude).catch(() => {});
    const interval = setInterval(() => {
      locationService.update(latitude, longitude).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  useEffect(() => {
    if (!activeEmergency) return;
    subscribe(`/topic/emergency/${activeEmergency.id}`, (data) => {
      setActiveEmergency(data);
      if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
        toast.success('Emergency ' + data.status.toLowerCase() + '!');
        setActiveEmergency(null);
        setDirections(null);
        setRouteInfo(null);
        setResponderPos(null);
        loadEmergencies();
      }
    });

    subscribe(`/topic/location/${activeEmergency.id}`, (data) => {
      setResponderPos({ lat: data.latitude, lng: data.longitude });
    });
  }, [activeEmergency, subscribe]);

  useEffect(() => {
    if (geoError) {
      toast.error(`Browser GPS Error: ${geoError}`, { duration: 5000 });
    }
  }, [geoError]);

  // Compute route when positions change
  useEffect(() => {
    if (!window.google) return;

    const citizenLoc = (latitude && longitude) ? { lat: latitude, lng: longitude } : null;
    const respLoc = responderPos || (
      activeEmergency?.responderLatitude && activeEmergency?.responderLongitude
        ? { lat: activeEmergency.responderLatitude, lng: activeEmergency.responderLongitude }
        : null
    );

    if (citizenLoc && respLoc && activeEmergency) {
      if (!directionsServiceRef.current) {
        directionsServiceRef.current = new window.google.maps.DirectionsService();
      }
      if (Math.abs(respLoc.lat - citizenLoc.lat) < 0.0001 && Math.abs(respLoc.lng - citizenLoc.lng) < 0.0001) {
        setDirections(null);
        setRouteInfo({ duration: 'Arrived', distance: '0 km' });
        return;
      }

      directionsServiceRef.current.route(
        {
          origin: respLoc,
          destination: citizenLoc,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg) {
              setRouteInfo({
                duration: leg.duration.text,
                distance: leg.distance.text,
              });
            }
          } else {
            setDirections(null);
            setRouteInfo(null);
          }
        }
      );
    } else {
      setDirections(null);
      setRouteInfo(null);
    }
  }, [latitude, longitude, responderPos?.lat, responderPos?.lng, activeEmergency?.id, activeEmergency?.responderLatitude]);

  const loadEmergencies = async () => {
    try {
      const res = await emergencyService.getCitizenEmergencies();
      const emergencies = res.data;
      const active = emergencies.find(e =>
        ['SEARCHING', 'OFFER_SENT', 'ACCEPTED', 'RESPONDER_EN_ROUTE', 'RESPONDER_ARRIVED', 'IN_PROGRESS'].includes(e.status)
      );
      setActiveEmergency(active || null);
      if (active?.responderLatitude) {
        setResponderPos({ lat: active.responderLatitude, lng: active.responderLongitude });
      }
      setHistory(emergencies.filter(e => e.status === 'COMPLETED' || e.status === 'CANCELLED'));
    } catch (err) {
      console.error('Failed to load emergencies', err);
    }
  };

  const handleSOS = async () => {
    if (!emergencyType) { toast.error('Select emergency type first!'); return; }
    if (!latitude || !longitude) {
      toast.error('Location is required to dispatch help');
      return;
    }

    if (emergencyType === 'MEDICAL' && !ambulanceType) {
      toast.error('Please select an ambulance type');
      return;
    }

    // 🔥 Intercept FIRE type — require photo verification
    if (emergencyType === 'FIRE') {
      setShowFireCapture(true);
      return;
    }

    let finalDescription = description;
    let baseFare = null;
    let perKmFare = null;

    if (emergencyType === 'GENERAL') {
      baseFare = 0;
      perKmFare = 50;
    } else if (emergencyType === 'POLICE' || emergencyType === 'FIRE') {
      baseFare = 0;
      perKmFare = 0;
    }

    if (emergencyType === 'MEDICAL' && ambulanceType) {
      const amb = AMBULANCE_OPTIONS.find(a => a.id === ambulanceType);
      if (amb) {
        finalDescription = `[Requested: ${amb.label} - ${amb.price}] ${description}`;
        baseFare = amb.base;
        perKmFare = amb.perKm;
      }
    }

    setLoading(true);
    try {
      const res = await emergencyService.create({
        emergencyType,
        description: finalDescription,
        latitude,
        longitude,
        baseFare,
        perKmFare
      });
      setActiveEmergency(res.data);
      toast.success('Emergency dispatched! Searching for responders...');
      setDescription('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create emergency');
    }
    setLoading(false);
  };

  // 🔥 Fire detection — send image to AI for analysis
  const handleFireDetected = async (formData) => {
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    if (description) formData.append('description', description);

    try {
      const res = await emergencyService.detectFire(formData);
      const result = res.data;

      if (result.fire_detected && result.emergency_created) {
        // Fire confirmed AND emergency auto-created
        toast.success('🔥 Fire confirmed! Emergency dispatched as CRITICAL!');
        setActiveEmergency(result.emergency);
        setShowFireCapture(false);
        setDescription('');
      } else if (result.fire_detected && !result.emergency_created) {
        // Fire detected but auto-dispatch failed — fallback to standard creation
        toast.loading('🔥 Fire confirmed! Creating emergency...', { duration: 2000 });
        try {
          const fallbackRes = await emergencyService.create({
            emergencyType: 'FIRE',
            description: (description ? description + ' | ' : '') +
              '🔥 AI Fire Detection (Confidence: ' + Math.round((result.confidence || 0) * 100) + '%)',
            latitude,
            longitude,
          });
          setActiveEmergency(fallbackRes.data);
          setShowFireCapture(false);
          setDescription('');
          toast.success('🔥 Fire emergency dispatched!');
        } catch (fallbackErr) {
          toast.error('Failed to create emergency: ' + (fallbackErr.response?.data?.message || fallbackErr.message));
        }
      }

      return result;
    } catch (err) {
      toast.error('Fire analysis failed: ' + (err.response?.data?.message || err.message));
      throw err;
    }
  };

  // 🔥 Manual fire submit — when AI doesn't detect but citizen insists
  const handleManualFireSubmit = async () => {
    setShowFireCapture(false);
    setLoading(true);
    try {
      const res = await emergencyService.create({
        emergencyType: 'FIRE',
        description: (description ? description + ' | ' : '') + '⚠️ Manual submission — AI did not detect fire',
        latitude,
        longitude,
      });
      setActiveEmergency(res.data);
      toast.success('Fire emergency submitted for manual review.');
      setDescription('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create emergency');
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!activeEmergency) return;
    try {
      await emergencyService.cancelEmergency(activeEmergency.id, 'Cancelled by citizen');
      toast.success('Emergency cancelled');
      setActiveEmergency(null);
      setDirections(null);
      setRouteInfo(null);
      setResponderPos(null);
      loadEmergencies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const mapCenter = responderPos || (latitude && longitude ? { lat: latitude, lng: longitude } : null);

  return (
    <div className="dashboard-layout">
      {/* Left sidebar — controls */}
      <motion.div
        initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}
        className="dashboard-sidebar"
      >
        {/* ── Welcome Header ── */}
        <div style={{
          marginBottom: '28px', paddingBottom: '20px',
          borderBottom: '1px solid rgba(0,106,78,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <div style={{
                fontFamily: "'Poppins', sans-serif", fontSize: '11px', fontWeight: 600,
                color: '#D4A853', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px',
              }}>
                DAKO Emergency
              </div>
              <h2 style={{
                fontFamily: "'Poppins', sans-serif", fontSize: '22px', fontWeight: 700,
                color: '#f1f5f9', margin: 0, lineHeight: 1.2,
              }}>
                Welcome, <span style={{ color: '#00C896' }}>{user?.fullName?.split(' ')[0] || 'Citizen'}</span>
              </h2>
            </div>
            {/* GPS status pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '20px',
              background: hasRealLocation ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
              border: `1px solid ${hasRealLocation ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
            }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: hasRealLocation ? '#10b981' : '#f59e0b',
                boxShadow: hasRealLocation ? '0 0 8px rgba(16,185,129,0.6)' : 'none',
                animation: hasRealLocation ? 'pulse-glow 2s infinite' : 'none',
              }} />
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.3px',
                color: hasRealLocation ? '#10b981' : '#f59e0b',
              }}>
                {hasRealLocation ? 'GPS ACTIVE' : geoLoading ? 'ACQUIRING...' : 'USING FALLBACK'}
              </span>
            </div>
          </div>
          {hasRealLocation && (
            <div style={{ fontSize: '11px', color: '#5A6A7A', fontFamily: "'Inter', sans-serif" }}>
              📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </div>
          )}
        </div>


        <AnimatePresence mode="wait">
          {activeEmergency ? (
            <motion.div key="tracking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Active emergency header card */}
              <div style={{
                padding: '18px', borderRadius: '14px', marginBottom: '20px',
                background: 'linear-gradient(135deg, rgba(244,42,65,0.08), rgba(244,42,65,0.02))',
                border: '1px solid rgba(244,42,65,0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(244,42,65,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <AlertTriangle size={18} color="#F42A41" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', margin: 0, fontFamily: "'Poppins', sans-serif" }}>
                        Emergency Active
                      </h3>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {activeEmergency.emergencyType?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    style={{
                      background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                      color: '#ef4444', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                      fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                      fontFamily: "'Poppins', sans-serif", letterSpacing: '0.5px',
                    }}
                  >
                    <X size={11} /> CANCEL
                  </motion.button>
                </div>
                <p style={{ fontSize: '12px', color: '#8899AA', margin: 0, lineHeight: 1.5 }}>
                  {activeEmergency.status === 'SEARCHING' || activeEmergency.status === 'OFFER_SENT'
                    ? 'Searching for available responders nearby...'
                    : activeEmergency.status === 'UNASSIGNED'
                    ? 'No responder available. Admin has been notified.'
                    : 'Help is navigating to your location. Stay safe.'}
                </p>
              </div>

              <StatusStepper currentStatus={activeEmergency.status} />

              {/* Searching animation */}
              {(activeEmergency.status === 'SEARCHING' || activeEmergency.status === 'OFFER_SENT') && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    marginTop: '20px', padding: '20px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(0,106,78,0.06), rgba(212,168,83,0.03))',
                    border: '1px solid rgba(0,106,78,0.15)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 12px',
                    background: 'rgba(0,106,78,0.1)', border: '2px solid rgba(0,106,78,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Clock size={22} color="#006A4E" />
                  </div>
                  <div style={{ fontSize: '13px', color: '#006A4E', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                    Finding nearby responders...
                  </div>
                  <div style={{ fontSize: '11px', color: '#5A6A7A', marginTop: '6px' }}>
                    This usually takes less than 30 seconds
                  </div>
                </motion.div>
              )}

              {/* No responder available */}
              {activeEmergency.status === 'UNASSIGNED' && (
                <div style={{
                  marginTop: '20px', padding: '20px', borderRadius: '14px',
                  background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
                    No available responders nearby
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                    Admin has been notified for manual dispatch
                  </div>
                </div>
              )}

              {/* Responder info card */}
              {activeEmergency.responderName && (
                <div style={{
                  marginTop: '24px', padding: '16px', borderRadius: '16px',
                  background: '#1A1D21', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      background: 'rgba(0,106,78,0.2)', border: '1px solid rgba(0,106,78,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <User size={28} color="#00C896" />
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#F1F5F9', fontFamily: "'Inter', sans-serif" }}>
                        {activeEmergency.responderName}
                      </div>
                      {activeEmergency.responderPhone && (
                        <div style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px', fontFamily: "'Inter', sans-serif" }}>
                          {activeEmergency.responderPhone}
                        </div>
                      )}
                    </div>
                  </div>
                  {activeEmergency.responderVehicle && (
                    <div style={{
                      fontSize: '16px', fontWeight: 600, color: '#F1F5F9', fontFamily: "'Inter', sans-serif",
                      background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px'
                    }}>
                      {activeEmergency.responderVehicle}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="sos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Section title */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '24px', fontWeight: 600, color: '#f1f5f9', margin: '0 0 6px',
                  fontFamily: "'Inter', sans-serif", letterSpacing: '-0.5px'
                }}>
                  Emergency Services
                </h3>
                <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                  Units we think are best for you
                </p>
              </div>

              {/* Service type selector in a card */}
              <div style={{
                marginBottom: '16px',
              }}>
                <ServiceTypeSelector 
                  selected={emergencyType} 
                  onSelect={(t) => {
                    setEmergencyType(t);
                    if (t !== 'MEDICAL') setAmbulanceType(null);
                  }} 
                  subSelected={ambulanceType}
                  onSubSelect={setAmbulanceType}
                />
              </div>

              {/* Description area */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '10px', fontWeight: 700, color: '#8899AA', textTransform: 'uppercase',
                  letterSpacing: '1px', marginBottom: '8px', fontFamily: "'Poppins', sans-serif",
                }}>
                  Situation Details
                </div>
                <textarea
                  placeholder="Describe your situation briefly (optional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-field"
                  style={{ resize: 'none', height: '80px', marginBottom: '0' }}
                />
              </div>

              {/* GPS Status — more compact */}
              {geoLoading && !hasRealLocation && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)',
                  fontSize: '12px', color: '#f59e0b', fontWeight: 600,
                }}>
                  <Loader size={14} className="spin" /> Acquiring GPS signal...
                </div>
              )}
              {geoError && !hasRealLocation && (
                <div style={{
                  marginBottom: '16px', padding: '14px', borderRadius: '12px',
                  background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 600, marginBottom: '6px' }}>
                    <AlertTriangle size={14} /> {geoError}
                  </div>
                  {permissionState === 'denied' && (
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px', lineHeight: 1.4 }}>
                      Open your browser/device settings and allow location access for this site.
                    </div>
                  )}
                  <motion.button
                    onClick={retryGeo}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px',
                      color: '#006A4E', background: 'rgba(0,106,78,0.08)', border: '1px solid rgba(0,106,78,0.15)',
                      borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    <RefreshCw size={12} /> Retry GPS
                  </motion.button>
                </div>
              )}

              {/* 🔥 Fire Photo Capture — shown when FIRE type selected and SOS pressed */}
              {showFireCapture ? (
                <FirePhotoCapture
                  onFireDetected={handleFireDetected}
                  onManualSubmit={handleManualFireSubmit}
                  onCancel={() => setShowFireCapture(false)}
                  analyzing={fireAnalyzing}
                  setAnalyzing={setFireAnalyzing}
                />
              ) : (
                <SOSButton 
                  onClick={handleSOS} 
                  disabled={loading || !emergencyType || (emergencyType === 'MEDICAL' && !ambulanceType)} 
                  typeLabel={emergencyType ? emergencyType.replace('_', ' ') : ''} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── History Section ── */}
        {history.length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,106,78,0.15), transparent)' }} />
              <h4 style={{
                fontSize: '10px', fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase',
                letterSpacing: '1.5px', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap',
              }}>
                Recent History
              </h4>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,106,78,0.15), transparent)' }} />
            </div>
            {history.slice(0, 5).map(e => <EmergencyCard key={e.id} emergency={e} />)}
          </div>
        )}
      </motion.div>

      {/* Right side — Google Map */}
      <div className="dashboard-map">
        {/* Hint overlay for users */}
        <div style={{
          position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(10, 15, 30, 0.8)', backdropFilter: 'blur(10px)',
          padding: '8px 16px', borderRadius: '20px', zIndex: 10,
          border: '1px solid rgba(0, 106, 78, 0.3)', color: '#00C896',
          fontSize: '11px', fontWeight: 700, fontFamily: "'Poppins', sans-serif",
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)', pointerEvents: 'none'
        }}>
          🎯 Tap anywhere on the map to set your exact location
        </div>

        <EmergencyMap 
          center={mapCenter} 
          directions={directions} 
          routeInfo={routeInfo}
          onMapClick={(coords) => {
            if (!activeEmergency) {
              setManualLocation(coords.lat, coords.lng);
              toast.success('Location updated manually');
            }
          }}
        >
          {/* Citizen's position */}
          {latitude && longitude && (
            <ServiceMarker
              position={{ lat: latitude, lng: longitude }}
              type="CITIZEN" label="Your Location" details="You are here"
            />
          )}
          {/* Responder's live position */}
          {responderPos && (
            <ServiceMarker
              position={responderPos}
              type={activeEmergency?.responderServiceType || 'DEFAULT'}
              label={activeEmergency?.responderName || 'Responder'}
              details={activeEmergency?.status?.replace(/_/g, ' ')}
            />
          )}
          {/* Active emergency SOS point fallback */}
          {activeEmergency && activeEmergency.responderLatitude && activeEmergency.responderLongitude && !responderPos && (
            <ServiceMarker
              position={{ lat: activeEmergency.responderLatitude, lng: activeEmergency.responderLongitude }}
              type={activeEmergency.responderServiceType || 'DEFAULT'}
              label={activeEmergency.responderName}
            />
          )}
        </EmergencyMap>
      </div>
    </div>
  );
}
