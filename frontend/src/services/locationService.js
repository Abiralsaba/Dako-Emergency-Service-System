import api from './api';

// Location service — updates only use JWT-authenticated user
const locationService = {
  update: (lat, lng) =>
    api.post('/location/update', { latitude: lat, longitude: lng }),
};

export default locationService;
