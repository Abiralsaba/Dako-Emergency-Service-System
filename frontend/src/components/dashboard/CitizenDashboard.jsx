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
import ServiceTypeSelector from '../ui/ServiceTypeCard';
import StatusStepper from '../ui/StatusStepper';
import EmergencyCard from '../ui/EmergencyCard';
import { Phone, User, Car, MapPin, X, Clock, AlertTriangle, RefreshCw, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { latitude, longitude, error: geoError, loading: geoLoading, permissionState, retry: retryGeo, hasRealLocation } = useGeolocation();
  const { subscribe } = useWebSocket();

  const [emergencyType, setEmergencyType] = useState('');
  const [description, setDescription] = useState('');
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responderPos, setResponderPos] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
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
  }, [activeEmergency?.id]);

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
    if (!latitude || !longitude) { toast.error('Waiting for GPS location...'); return; }

    setLoading(true);
    try {
      const res = await emergencyService.create({
        emergencyType,
        description,
        latitude,
        longitude,
      });
      setActiveEmergency(res.data);
      toast.success('Emergency dispatched! Searching for responders...');
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
        <AnimatePresence mode="wait">
          {activeEmergency ? (
            <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0' }}>
                  <span style={{ color: '#e11d48' }}>🚨</span> Emergency Active
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={handleCancel}
                  style={{
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                    fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                    fontFamily: "'Orbitron', monospace",
                  }}
                >
                  <X size={12} /> CANCEL
                </motion.button>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                {activeEmergency.status === 'SEARCHING' || activeEmergency.status === 'OFFER_SENT'
                  ? 'Searching for available responders nearby...'
                  : activeEmergency.status === 'UNASSIGNED'
                  ? 'No responder available. Admin has been notified.'
                  : 'Help is navigating to your location. Stay safe.'}
              </p>

              <StatusStepper currentStatus={activeEmergency.status} />

              {/* Searching animation */}
              {(activeEmergency.status === 'SEARCHING' || activeEmergency.status === 'OFFER_SENT') && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    marginTop: '20px', padding: '16px', borderRadius: '12px',
                    background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <Clock size={24} color="#00f0ff" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', color: '#00f0ff', fontWeight: 600 }}>
                    Finding nearby responders...
                  </div>
                </motion.div>
              )}

              {/* No responder available */}
              {activeEmergency.status === 'UNASSIGNED' && (
                <div style={{
                  marginTop: '20px', padding: '16px', borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
                    No available responders nearby. Admin has been notified for manual dispatch.
                  </div>
                </div>
              )}

              {/* Responder info card */}
              {activeEmergency.responderName && (
                <div style={{
                  marginTop: '24px', padding: '16px', borderRadius: '12px',
                  background: 'rgba(0, 240, 255, 0.04)', border: '1px solid rgba(0, 240, 255, 0.15)',
                }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px', fontFamily: "'Orbitron', monospace" }}>
                    Assigned Responder
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <User size={16} color="#00f0ff" />
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>{activeEmergency.responderName}</span>
                  </div>
                  {activeEmergency.responderPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Phone size={16} color="#64748b" />
                      <span style={{ fontSize: '14px', color: '#94a3b8' }}>{activeEmergency.responderPhone}</span>
                    </div>
                  )}
                  {activeEmergency.responderVehicle && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Car size={16} color="#64748b" />
                      <span style={{ fontSize: '14px', color: '#94a3b8' }}>{activeEmergency.responderVehicle}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="sos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', color: '#e2e8f0' }}>Request Emergency</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                Select type and hit SOS. We'll find the nearest responder.
              </p>

              <ServiceTypeSelector selected={emergencyType} onSelect={setEmergencyType} />

              <textarea
                placeholder="Describe your situation briefly (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-field"
                style={{ resize: 'none', height: '80px', marginBottom: '16px' }}
              />

              {/* GPS Status */}
              {geoLoading && !hasRealLocation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                  <Loader size={14} className="spin" /> Acquiring GPS signal...
                </div>
              )}
              {geoError && !hasRealLocation && (
                <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 600, marginBottom: '6px' }}>
                    <AlertTriangle size={14} /> {geoError}
                  </div>
                  {permissionState === 'denied' && (
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
                      Open your browser/device settings and allow location access for this site.
                    </div>
                  )}
                  <button
                    onClick={retryGeo}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
                      color: '#00f0ff', background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)',
                      borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    <RefreshCw size={12} /> Retry GPS
                  </button>
                </div>
              )}
              {hasRealLocation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                  <MapPin size={14} /> GPS locked: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </div>
              )}

              <SOSButton onClick={handleSOS} disabled={loading || !emergencyType} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Orbitron', monospace" }}>
              History
            </h4>
            {history.slice(0, 5).map(e => <EmergencyCard key={e.id} emergency={e} />)}
          </div>
        )}
      </motion.div>

      {/* Right side — Google Map */}
      <div className="dashboard-map">
        <EmergencyMap center={mapCenter} directions={directions} routeInfo={routeInfo}>
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
