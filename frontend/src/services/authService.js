import api from './api';

// Auth API calls — login and registration
const authService = {
  login: (phoneNumber, password) =>
    api.post('/auth/login', { phoneNumber, password }),

  registerCitizen: (data) =>
    api.post('/auth/register/citizen', data),

  registerAdmin: (data) =>
    api.post('/auth/register/admin', data),

  registerResponder: (data) =>
    api.post('/auth/register/responder', data),
};

export default authService;
