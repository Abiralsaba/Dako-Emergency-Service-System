// Format a timestamp into a human-readable "time ago" string
export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Haversine distance between two GPS points (in km)
export function calculateDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
          + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * (Math.PI / 180); }

// Color palette for each service type
export function getServiceColor(type) {
  const colors = {
    POLICE: '#3b82f6',
    MEDICAL: '#10b981',
    AMBULANCE: '#10b981',
    FIRE: '#ef4444',
    FIRE_SERVICE: '#ef4444',
    EMERGENCY_CAR: '#f59e0b',
    GENERAL: '#8b5cf6',
  };
  return colors[type] || '#94a3b8';
}

// Status badge colors — matches the new lifecycle
export function getStatusColor(status) {
  const colors = {
    SEARCHING: '#f59e0b',
    OFFER_SENT: '#f59e0b',
    ACCEPTED: '#3b82f6',
    RESPONDER_EN_ROUTE: '#8b5cf6',
    RESPONDER_ARRIVED: '#06b6d4',
    IN_PROGRESS: '#f97316',
    COMPLETED: '#10b981',
    CANCELLED: '#6b7280',
    EXPIRED: '#6b7280',
    UNASSIGNED: '#ef4444',
    // Legacy
    PENDING: '#f59e0b',
    DISPATCHED: '#3b82f6',
    EN_ROUTE: '#8b5cf6',
    ARRIVED: '#06b6d4',
    RESOLVED: '#10b981',
  };
  return colors[status] || '#94a3b8';
}
