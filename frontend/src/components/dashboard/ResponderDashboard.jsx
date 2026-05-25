import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/AuthContext';
import useGeolocation from '../../hooks/useGeolocation';
import useWebSocket from '../../hooks/useWebSocket';
import emergencyService from '../../services/emergencyService';
import locationService from '../../services/locationService';
import EmergencyMap from '../map/EmergencyMap';
import ServiceMarker from '../map/ServiceMarker';
import StatusStepper from '../ui/StatusStepper';
import EmergencyCard from '../ui/EmergencyCard';
import { Phone, User, MapPin, Navigation, CheckCircle, AlertTriangle, Power, Clock, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResponderDashboard() {
  const { user } = useAuth();
  const { latitude, longitude } = useGeolocation();
  const { subscribe } = useWebSocket();

  const [activeJob, setActiveJob] = useState(null);
  const [history, setHistory] = useState([]);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(user?.approvalStatus || 'PENDING');
  const [pendingOffer, setPendingOffer] = useState(null);
  const [offerCountdown, setOfferCountdown] = useState(0);
  const directionsServiceRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    loadJobs();
    loadStatus();
  }, []);

  useEffect(() => {
    if (!latitude || !longitude) return;
    locationService.update(latitude, longitude).catch(() => {});
    const interval = setInterval(() => {
      locationService.update(latitude, longitude).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  // Listen for offers and updates
  useEffect(() => {
    subscribe(`/topic/responder/${user.id}`, (data) => {
      if (data.type === 'OFFER') {
        setPendingOffer(data);
        const expiresAt = new Date(data.expiresAt);
        const secondsLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        setOfferCountdown(secondsLeft);

        // Start countdown
        clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
          setOfferCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownRef.current);
              setPendingOffer(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast('🚨 New emergency offer!', { icon: '🔔' });
      } else {
        setActiveJob(data);
        toast('🚨 Emergency update!', { icon: '🔔' });
      }
    });
    return () => clearInterval(countdownRef.current);
  }, [user?.id]);

  useEffect(() => {
    if (!activeJob) return;
    subscribe(`/topic/emergency/${activeJob.id}`, (data) => {
      setActiveJob(data);
      if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
        toast.success('Emergency ' + data.status.toLowerCase() + '!');
        setActiveJob(null);
        setDirections(null);
        setRouteInfo(null);
        loadJobs();
      }
    });
  }, [activeJob?.id]);

  // Compute route from responder to citizen
  useEffect(() => {
    if (!window.google) return;
    const origin = (latitude && longitude) ? { lat: latitude, lng: longitude } : null;
    const destination = activeJob ? { lat: activeJob.latitude, lng: activeJob.longitude } : null;

    if (origin && destination && activeJob) {
      if (!directionsServiceRef.current) {
        directionsServiceRef.current = new window.google.maps.DirectionsService();
      }
      // If practically the same location, skip routing
      if (Math.abs(origin.lat - destination.lat) < 0.0001 && Math.abs(origin.lng - destination.lng) < 0.0001) {
        setDirections(null);
        setRouteInfo({ duration: 'Arrived', distance: '0 km' });
        return;
      }

      directionsServiceRef.current.route(
        { origin, destination, travelMode: window.google.maps.TravelMode.DRIVING },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg) {
              setRouteInfo({ duration: leg.duration.text, distance: leg.distance.text });
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
  }, [latitude, longitude, activeJob?.latitude, activeJob?.longitude]);

  const loadStatus = async () => {
    try {
      const res = await emergencyService.getResponderStatus();
      setIsOnline(res.data.status === 'ONLINE' || res.data.status === 'OFFERED' ||
                   res.data.status === 'ASSIGNED' || res.data.status === 'EN_ROUTE' ||
                   res.data.status === 'ARRIVED' || res.data.status === 'BUSY');
      setApprovalStatus(res.data.approvalStatus);
    } catch (e) {}
  };

  const loadJobs = async () => {
    try {
      const res = await emergencyService.getResponderJobs();
      const jobs = res.data;
      const active = jobs.find(j => ['ACCEPTED', 'RESPONDER_EN_ROUTE', 'RESPONDER_ARRIVED', 'IN_PROGRESS'].includes(j.status));
      setActiveJob(active || null);
    } catch (err) {}
  };

  const handleToggle = async () => {
    try {
      const res = await emergencyService.toggleStatus();
      const newStatus = res.data.status;
      setIsOnline(newStatus === 'ONLINE');
      toast.success(newStatus === 'ONLINE' ? 'You are now ONLINE' : 'You are now OFFLINE');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Toggle failed');
    }
  };

  const handleAcceptOffer = async () => {
    if (!pendingOffer) return;
    try {
      const res = await emergencyService.acceptOffer(pendingOffer.emergencyId);
      setActiveJob(res.data);
      setPendingOffer(null);
      clearInterval(countdownRef.current);
      toast.success('Offer accepted! Navigate to citizen.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Accept failed');
    }
  };

  const handleDeclineOffer = async () => {
    if (!pendingOffer) return;
    try {
      await emergencyService.declineOffer(pendingOffer.emergencyId);
      setPendingOffer(null);
      clearInterval(countdownRef.current);
      toast('Offer declined');
    } catch (err) {
      toast.error('Decline failed');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!activeJob) return;
    try {
      const res = await emergencyService.updateStatus(activeJob.id, newStatus);
      setActiveJob(res.data);
      toast.success(`Status: ${newStatus.replace(/_/g, ' ')}`);
      if (newStatus === 'COMPLETED') {
        setActiveJob(null);
        setDirections(null);
        setRouteInfo(null);
        loadJobs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const getNextActions = () => {
    if (!activeJob) return [];
    switch (activeJob.status) {
      case 'ACCEPTED': return [{ label: 'Start Navigation', status: 'RESPONDER_EN_ROUTE', icon: Navigation, color: '#8b5cf6' }];
      case 'RESPONDER_EN_ROUTE': return [{ label: 'Arrived', status: 'RESPONDER_ARRIVED', icon: MapPin, color: '#0ea5e9' }];
      case 'RESPONDER_ARRIVED': return [{ label: 'Start Service', status: 'IN_PROGRESS', icon: Zap, color: '#f59e0b' }];
      case 'IN_PROGRESS': return [{ label: 'Complete', status: 'COMPLETED', icon: CheckCircle, color: '#10b981' }];
      default: return [];
    }
  };

  const citizenPos = activeJob ? { lat: activeJob.latitude, lng: activeJob.longitude } : null;
  const myPos = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  return (
    <div className="dashboard-layout">
      {/* Left sidebar */}
      <motion.div
        initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className="dashboard-sidebar"
      >
        {/* Online/Offline toggle */}
        {approvalStatus === 'APPROVED' && !activeJob && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleToggle}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: isOnline
                ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))'
                : 'rgba(255,255,255,0.04)',
              color: isOnline ? '#10b981' : '#64748b',
              fontSize: '13px', fontWeight: 700, marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              border: `1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
              fontFamily: "'Poppins', sans-serif", letterSpacing: '2px', textTransform: 'uppercase',
            }}
          >
            <Power size={18} />
            {isOnline ? 'ONLINE — READY' : 'GO ONLINE'}
          </motion.button>
        )}

        {/* Pending approval message */}
        {approvalStatus === 'PENDING' && (
          <div style={{
            padding: '20px', borderRadius: '12px', marginBottom: '24px',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
            textAlign: 'center',
          }}>
            <Clock size={28} color="#f59e0b" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b', marginBottom: '6px' }}>
              Pending Approval
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Your account is awaiting admin verification. You'll be notified once approved.
            </div>
          </div>
        )}

        {approvalStatus === 'REJECTED' && (
          <div style={{
            padding: '20px', borderRadius: '12px', marginBottom: '24px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            textAlign: 'center',
          }}>
            <X size={28} color="#ef4444" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>
              Account Rejected
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
              Contact admin for more information.
            </div>
          </div>
        )}

        {/* Offer Modal */}
        <AnimatePresence>
          {pendingOffer && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{
                padding: '20px', borderRadius: '16px', marginBottom: '24px',
                background: 'rgba(0, 106, 78, 0.06)',
                border: '2px solid rgba(0, 106, 78, 0.4)',
                boxShadow: '0 0 40px rgba(0, 106, 78, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#006A4E" />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#006A4E', fontFamily: "'Poppins', sans-serif" }}>
                    INCOMING
                  </span>
                </div>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  border: '3px solid #006A4E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 800, color: '#006A4E',
                  fontFamily: "'Poppins', sans-serif",
                }}>
                  {offerCountdown}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                  {pendingOffer.emergencyType} Emergency
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {pendingOffer.description || 'No description'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '13px' }}>
                <div style={{ color: '#64748b' }}>
                  <User size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {pendingOffer.citizenName}
                </div>
                <div style={{ color: '#10b981' }}>
                  📍 {typeof pendingOffer.distanceKm === 'number' ? pendingOffer.distanceKm.toFixed(1) : '?'} km
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleAcceptOffer}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff', fontSize: '13px', fontWeight: 800,
                    fontFamily: "'Poppins', sans-serif", letterSpacing: '1px',
                  }}
                >
                  ACCEPT
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleDeclineOffer}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.1)', cursor: 'pointer',
                    color: '#ef4444', fontSize: '13px', fontWeight: 800,
                    fontFamily: "'Poppins', sans-serif", letterSpacing: '1px',
                  }}
                >
                  DECLINE
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeJob ? (
          <div>
            {/* Alert header */}
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(0,106,78,0)', '0 0 20px rgba(0,106,78,0.15)', '0 0 0px rgba(0,106,78,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                padding: '16px', borderRadius: '12px', marginBottom: '24px',
                background: 'rgba(0, 106, 78, 0.05)', border: '1px solid rgba(0, 106, 78, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={18} color="#006A4E" />
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#006A4E', fontFamily: "'Poppins', sans-serif" }}>
                  {activeJob.emergencyType} Emergency
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                {activeJob.description || 'No description provided'}
              </p>
            </motion.div>

            <StatusStepper currentStatus={activeJob.status} />

            {/* Citizen info */}
            <div style={{
              padding: '16px', borderRadius: '12px', marginTop: '24px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>
                Citizen Details
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <User size={16} color="#006A4E" />
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>{activeJob.citizenName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="#64748b" />
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>{activeJob.citizenPhone}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getNextActions().map(action => (
                <motion.button
                  key={action.status}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleStatusUpdate(action.status)}
                  style={{
                    padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: `linear-gradient(135deg, ${action.color}30, ${action.color}10)`,
                    color: action.color, fontSize: '13px', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    textTransform: 'uppercase', letterSpacing: '2px',
                    border: `1px solid ${action.color}40`,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <action.icon size={18} /> {action.label}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          !pendingOffer && approvalStatus === 'APPROVED' && (
            <div style={{ textAlign: 'center', paddingTop: '60px' }}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 20px',
                  background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                  border: `2px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isOnline ? <CheckCircle size={32} color="#10b981" /> : <Power size={32} color="#64748b" />}
              </motion.div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#e2e8f0' }}>
                {isOnline ? 'Standing By' : 'Offline'}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                {isOnline ? "You'll be notified when a new emergency is nearby." : 'Go online to start receiving requests.'}
              </p>
            </div>
          )
        )}
      </motion.div>

      {/* Right — Map */}
      <div className="dashboard-map">
        <EmergencyMap center={myPos || citizenPos} directions={directions} routeInfo={routeInfo}>
          {myPos && (
            <ServiceMarker position={myPos} type="DEFAULT" label="Your Position" details="You are here" />
          )}
          {citizenPos && (
            <ServiceMarker position={citizenPos} type="CITIZEN" label={activeJob?.citizenName} details="SOS Location" />
          )}
        </EmergencyMap>
      </div>
    </div>
  );
}
