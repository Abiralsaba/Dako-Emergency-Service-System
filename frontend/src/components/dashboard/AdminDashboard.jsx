import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/AuthContext';
import useWebSocket from '../../hooks/useWebSocket';
import emergencyService from '../../services/emergencyService';
import EmergencyCard from '../ui/EmergencyCard';
import {
  Shield, Users, Activity, AlertTriangle, CheckCircle, XCircle,
  Clock, ChevronRight, Zap, UserCheck, Search, Siren
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { subscribe } = useWebSocket();

  const [metrics, setMetrics] = useState({ activeEmergencies: 0, unassignedEmergencies: 0, pendingApprovals: 0, totalResponders: 0 });
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [pendingResponders, setPendingResponders] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [allResponders, setAllResponders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAll();
    subscribe('/topic/admin/feed', () => loadAll());
    const interval = setInterval(loadAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadAll = async () => {
    try {
      const [m, active, pending, u, resp] = await Promise.all([
        emergencyService.getMetrics(),
        emergencyService.getAllActive(),
        emergencyService.getPendingResponders(),
        emergencyService.getUnassigned(),
        emergencyService.getAllResponders(),
      ]);
      setMetrics(m.data);
      setActiveEmergencies(active.data);
      setPendingResponders(pending.data);
      setUnassigned(u.data);
      setAllResponders(resp.data);
    } catch (e) { console.error(e); }
  };

  const handleApprove = async (id) => {
    try {
      await emergencyService.approveResponder(id);
      toast.success('Responder approved');
      loadAll();
    } catch (e) { toast.error('Approval failed'); }
  };

  const handleReject = async (id) => {
    try {
      await emergencyService.rejectResponder(id);
      toast.success('Responder rejected');
      loadAll();
    } catch (e) { toast.error('Rejection failed'); }
  };

  const handleManualAssign = async (emergencyId, responderId) => {
    try {
      await emergencyService.manualAssign(emergencyId, responderId);
      toast.success('Manually assigned!');
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Assignment failed'); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'approvals', label: 'Approvals', icon: UserCheck, badge: pendingResponders.length },
    { id: 'unassigned', label: 'Unassigned', icon: AlertTriangle, badge: unassigned.length },
    { id: 'responders', label: 'Responders', icon: Users },
  ];

  const statCards = [
    { label: 'Active Emergencies', value: metrics.activeEmergencies, icon: Siren, color: '#ef4444' },
    { label: 'Unassigned', value: metrics.unassignedEmergencies, icon: AlertTriangle, color: '#f59e0b' },
    { label: 'Pending Approvals', value: metrics.pendingApprovals, icon: Clock, color: '#D4A853' },
    { label: 'Total Responders', value: metrics.totalResponders, icon: Shield, color: '#006A4E' },
  ];

  const serviceTypeColor = (type) => {
    switch(type) {
      case 'POLICE': return '#3b82f6';
      case 'AMBULANCE': return '#10b981';
      case 'FIRE_SERVICE': return '#ef4444';
      case 'EMERGENCY_CAR': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <div style={{
      height: 'calc(100vh - 56px)', display: 'flex', background: 'rgba(9,9,11,0.98)', overflow: 'hidden',
    }}>
      {/* Sidebar navigation */}
      <div style={{
        width: '240px', padding: '20px 12px', borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', gap: '4px',
      }}>
        <div style={{
          padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #006A4E, #D4A853)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={18} color="#030712" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>Admin Panel</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{user.fullName}</div>
          </div>
        </div>

        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: active ? 'rgba(0,106,78,0.08)' : 'transparent',
                color: active ? '#006A4E' : '#94a3b8',
                fontSize: '13px', fontWeight: active ? 700 : 500,
                textAlign: 'left', width: '100%', position: 'relative',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  marginLeft: 'auto', fontSize: '11px', fontWeight: 800,
                  background: '#ef4444', color: '#fff', padding: '2px 7px',
                  borderRadius: '10px', minWidth: '20px', textAlign: 'center',
                }}>{tab.badge}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {statCards.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      padding: '20px', borderRadius: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {card.label}
                      </span>
                      <card.icon size={18} color={card.color} />
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: card.color, fontFamily: "'Poppins', sans-serif" }}>
                      {card.value}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Active Emergencies */}
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px', fontFamily: "'Poppins', sans-serif" }}>
                <Zap size={16} color="#006A4E" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Active Emergencies
              </h3>
              {activeEmergencies.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                  No active emergencies
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {activeEmergencies.map(e => <EmergencyCard key={e.id} emergency={e} showDetails />)}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'approvals' && (
            <motion.div key="approvals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '20px' }}>
                Pending Responder Approvals
              </h3>
              {pendingResponders.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                  No pending approvals
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {pendingResponders.map(r => (
                    <div key={r.id} style={{
                      padding: '16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
                          {r.fullName}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
                          <span>{r.phoneNumber}</span>
                          <span style={{ color: serviceTypeColor(r.serviceType), fontWeight: 700 }}>{r.serviceType}</span>
                          {r.vehicleReg && <span>🚗 {r.vehicleReg}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(r.id)}
                          style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '12px', fontWeight: 700,
                          }}
                        >
                          <CheckCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(r.id)}
                          style={{
                            padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.1)', cursor: 'pointer',
                            color: '#ef4444', fontSize: '12px', fontWeight: 700,
                          }}
                        >
                          <XCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Reject
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'unassigned' && (
            <motion.div key="unassigned" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '20px' }}>
                Unassigned Emergencies — Manual Dispatch Required
              </h3>
              {unassigned.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                  All emergencies are assigned
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {unassigned.map(e => (
                    <div key={e.id} style={{
                      padding: '20px', borderRadius: '14px',
                      background: 'rgba(245,158,11,0.05)',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}>
                      <EmergencyCard emergency={e} showDetails />
                      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, marginBottom: '4px', display: 'block', width: '100%' }}>
                          Available Responders:
                        </span>
                        {allResponders
                          .filter(r => r.approvalStatus === 'APPROVED' && (r.currentStatus === 'ONLINE'))
                          .slice(0, 5)
                          .map(r => (
                            <motion.button
                              key={r.id}
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                              onClick={() => handleManualAssign(e.id, r.id)}
                              style={{
                                padding: '6px 12px', borderRadius: '8px',
                                background: 'rgba(0,106,78,0.08)',
                                border: '1px solid rgba(0,106,78,0.2)',
                                color: '#006A4E', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                              }}
                            >
                              {r.fullName} ({r.serviceType})
                            </motion.button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'responders' && (
            <motion.div key="responders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '20px' }}>
                All Responders
              </h3>
              <div style={{
                borderRadius: '12px', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                      {['Name', 'Phone', 'Type', 'Status', 'Approval', 'Reliability', 'Responses'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allResponders.map((r, i) => (
                      <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                        <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 600 }}>{r.fullName}</td>
                        <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{r.phoneNumber}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: serviceTypeColor(r.serviceType), fontWeight: 700, fontSize: '11px' }}>{r.serviceType}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                            background: r.currentStatus === 'ONLINE' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                            color: r.currentStatus === 'ONLINE' ? '#10b981' : '#64748b',
                          }}>{r.currentStatus}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                            background: r.approvalStatus === 'APPROVED' ? 'rgba(16,185,129,0.15)' : r.approvalStatus === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                            color: r.approvalStatus === 'APPROVED' ? '#10b981' : r.approvalStatus === 'REJECTED' ? '#ef4444' : '#f59e0b',
                          }}>{r.approvalStatus}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{r.reliabilityScore}</td>
                        <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{r.totalResponses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
