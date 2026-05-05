import api from './api';

// Emergency API calls — the core dispatch lifecycle
const emergencyService = {
  create: (data) =>
    api.post('/emergency', data),

  getById: (id) =>
    api.get(`/emergency/${id}`),

  updateStatus: (id, status) =>
    api.put(`/emergency/${id}/status`, { status }),

  acceptOffer: (emergencyId) =>
    api.post(`/emergency/${emergencyId}/accept`),

  declineOffer: (emergencyId) =>
    api.post(`/emergency/${emergencyId}/decline`),

  cancelEmergency: (id, reason) =>
    api.post(`/emergency/${id}/cancel`, { reason }),

  getCitizenEmergencies: () =>
    api.get('/emergency/citizen/history'),

  getResponderJobs: () =>
    api.get('/emergency/responder/active'),

  getAllActive: () =>
    api.get('/emergency/active'),

  // Responder endpoints
  toggleStatus: () =>
    api.post('/responder/toggle-status'),

  getResponderStatus: () =>
    api.get('/responder/status'),

  getPendingOffers: () =>
    api.get('/responder/offers'),

  // Admin endpoints
  getPendingResponders: () =>
    api.get('/admin/responders/pending'),

  getAllResponders: () =>
    api.get('/admin/responders'),

  approveResponder: (id) =>
    api.post(`/admin/responders/${id}/approve`),

  rejectResponder: (id) =>
    api.post(`/admin/responders/${id}/reject`),

  getUnassigned: () =>
    api.get('/admin/emergencies/unassigned'),

  manualAssign: (emergencyId, responderId) =>
    api.post(`/admin/emergencies/${emergencyId}/assign/${responderId}`),

  getMetrics: () =>
    api.get('/admin/metrics'),
};

export default emergencyService;
