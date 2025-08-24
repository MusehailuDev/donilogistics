import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => {
    return axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
  },

  register: (userData) => {
    return axios.post(`${API_BASE_URL}/rest/services/doni_UserRegistrationService/registerUser`, userData, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  verifyEmail: (token) => {
    return axios.post(`${API_BASE_URL}/rest/services/doni_UserRegistrationService/verifyEmail`, { token }, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  getOrganizations: () => {
    return axios.get(`${API_BASE_URL}/rest/services/doni_UserRegistrationService/getActiveOrganizations`);
  },
};

// User API
export const userAPI = {
  getCurrentUser: () => api.get('/rest/userInfo'),
  updateProfile: (userData) => api.put(`/rest/entities/doni_User/${userData.id}`, userData),
};

// Organization API
export const organizationAPI = {
  getAll: () => api.get('/rest/entities/doni_Organization'),
  getById: (id) => api.get(`/rest/entities/doni_Organization/${id}`),
  create: (data) => api.post('/rest/entities/doni_Organization', data),
  update: (id, data) => api.put(`/rest/entities/doni_Organization/${id}`, data),
  delete: (id) => api.delete(`/rest/entities/doni_Organization/${id}`),
};

// Vehicle API
export const vehicleAPI = {
  getAll: () => api.get('/rest/entities/doni_Vehicle'),
  getById: (id) => api.get(`/rest/entities/doni_Vehicle/${id}`),
  create: (data) => api.post('/rest/entities/doni_Vehicle', data),
  update: (id, data) => api.put(`/rest/entities/doni_Vehicle/${id}`, data),
  delete: (id) => api.delete(`/rest/entities/doni_Vehicle/${id}`),
  getByOrganization: (orgId) => api.get(`/rest/entities/doni_Vehicle?filter={"conditions":[{"property":"organization.id","operator":"=","value":"${orgId}"}]}`),
};

// Shipment API
export const shipmentAPI = {
  getAll: () => api.get('/rest/entities/doni_Shipment'),
  getById: (id) => api.get(`/rest/entities/doni_Shipment/${id}`),
  create: (data) => api.post('/rest/services/doni_LogisticsService/createShipment', data),
  update: (id, data) => api.put(`/rest/entities/doni_Shipment/${id}`, data),
  delete: (id) => api.delete(`/rest/entities/doni_Shipment/${id}`),
  updateStatus: (id, status) => api.post('/rest/services/doni_LogisticsService/updateShipmentStatus', { shipmentId: id, status }),
  assignVehicle: (shipmentId, vehicleId) => api.post('/rest/services/doni_LogisticsService/assignVehicleToShipment', { shipmentId, vehicleId }),
  assignDriver: (shipmentId, driverId) => api.post('/rest/services/doni_LogisticsService/assignDriverToShipment', { shipmentId, driverId }),
  getByOrganization: (orgId) => api.get(`/rest/entities/doni_Shipment?filter={"conditions":[{"property":"organization.id","operator":"=","value":"${orgId}"}]}`),
  getByStatus: (status) => api.get(`/rest/entities/doni_Shipment?filter={"conditions":[{"property":"status","operator":"=","value":"${status}"}]}`),
};

// Admin API (dev-only with static bearer)
const DEV_ADMIN_HEADERS = { Authorization: 'Bearer dev-admin-token' };
export const adminAPI = {
  listOrganizations: () => axios.get(`${API_BASE_URL}/api/admin/organizations`, { headers: DEV_ADMIN_HEADERS }),
  createOrganization: (data) => axios.post(`${API_BASE_URL}/api/admin/organizations`, data, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
  updateOrganization: (id, data) => axios.put(`${API_BASE_URL}/api/admin/organizations/${id}`, data, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
  deleteOrganization: (id) => axios.delete(`${API_BASE_URL}/api/admin/organizations/${id}`, { headers: DEV_ADMIN_HEADERS }),
  listUsers: () => axios.get(`${API_BASE_URL}/api/admin/users`, { headers: DEV_ADMIN_HEADERS }),
  setUserRole: (id, userRole) => axios.post(`${API_BASE_URL}/api/admin/users/${id}/role`, { userRole }, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
  setUserOrganization: (id, organizationId) => axios.post(`${API_BASE_URL}/api/admin/users/${id}/organization`, { organizationId }, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
  activateUser: (id) => axios.post(`${API_BASE_URL}/api/admin/users/${id}/activate`, {}, { headers: DEV_ADMIN_HEADERS }),
  deactivateUser: (id) => axios.post(`${API_BASE_URL}/api/admin/users/${id}/deactivate`, {}, { headers: DEV_ADMIN_HEADERS }),
  deleteUser: (id) => axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, { headers: DEV_ADMIN_HEADERS }),
  listShipments: () => axios.get(`${API_BASE_URL}/api/admin/shipments`, { headers: DEV_ADMIN_HEADERS }),
  acceptShipment: (id, driverUserId) => axios.post(`${API_BASE_URL}/api/admin/shipments/${id}/accept`, { driverUserId }, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
  rejectShipment: (id) => axios.post(`${API_BASE_URL}/api/admin/shipments/${id}/reject`, {}, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
  listVehicles: () => axios.get(`${API_BASE_URL}/api/admin/vehicles`, { headers: DEV_ADMIN_HEADERS }),
  createVehicle: (data) => axios.post(`${API_BASE_URL}/api/admin/vehicles`, data, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
  updateVehicle: (id, data) => axios.put(`${API_BASE_URL}/api/admin/vehicles/${id}`, data, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
  deleteVehicle: (id) => axios.delete(`${API_BASE_URL}/api/admin/vehicles/${id}`, { headers: DEV_ADMIN_HEADERS }),
  listDrivers: () => axios.get(`${API_BASE_URL}/api/admin/drivers`, { headers: DEV_ADMIN_HEADERS }),
  createDriver: (data) => axios.post(`${API_BASE_URL}/api/admin/drivers`, data, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
  updateDriver: (id, data) => axios.put(`${API_BASE_URL}/api/admin/drivers/${id}`, data, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
  deleteDriver: (id) => axios.delete(`${API_BASE_URL}/api/admin/drivers/${id}`, { headers: DEV_ADMIN_HEADERS }),
  updateDriverLocation: (id, lat, lon) => axios.post(`${API_BASE_URL}/api/admin/drivers/${id}/location`, { latitude: lat, longitude: lon }, { headers: { ...DEV_ADMIN_HEADERS, 'Content-Type': 'application/json' } }),
};

// Organization Admin API (scoped to their org)
const ORG_ADMIN_HEADERS = () => ({
  Authorization: 'Bearer org-admin-token',
  'X-Admin-User-Id': (JSON.parse(localStorage.getItem('user') || '{}').id || ''),
});

export const orgAdminAPI = {
  listUsers: () => axios.get(`${API_BASE_URL}/api/org/users`, { headers: ORG_ADMIN_HEADERS() }),
  activateUser: (id) => axios.post(`${API_BASE_URL}/api/org/users/${id}/activate`, {}, { headers: ORG_ADMIN_HEADERS() }),
  deactivateUser: (id) => axios.post(`${API_BASE_URL}/api/org/users/${id}/deactivate`, {}, { headers: ORG_ADMIN_HEADERS() }),
  deleteUser: (id) => axios.delete(`${API_BASE_URL}/api/org/users/${id}`, { headers: ORG_ADMIN_HEADERS() }),
  listShipments: () => axios.get(`${API_BASE_URL}/api/org/shipments`, { headers: ORG_ADMIN_HEADERS() }),
  acceptShipment: (id, driverUserId) => axios.post(`${API_BASE_URL}/api/org/shipments/${id}/accept`, { driverUserId }, { headers: { ...ORG_ADMIN_HEADERS(), 'Content-Type': 'application/json' } }),
  rejectShipment: (id) => axios.post(`${API_BASE_URL}/api/org/shipments/${id}/reject`, {}, { headers: { ...ORG_ADMIN_HEADERS(), 'Content-Type': 'application/json' } }),
  listDrivers: () => axios.get(`${API_BASE_URL}/api/org/drivers`, { headers: ORG_ADMIN_HEADERS() }),
  updateDriverLocation: (id, lat, lon) => axios.post(`${API_BASE_URL}/api/org/drivers/${id}/location`, { latitude: lat, longitude: lon }, { headers: ORG_ADMIN_HEADERS() }),
  listVehicles: () => axios.get(`${API_BASE_URL}/api/org/vehicles`, { headers: ORG_ADMIN_HEADERS() }),
  listWarehouses: () => axios.get(`${API_BASE_URL}/api/org/warehouses`, { headers: ORG_ADMIN_HEADERS() }),
  listContainers: () => axios.get(`${API_BASE_URL}/api/org/containers`, { headers: ORG_ADMIN_HEADERS() }),
  listAddresses: () => axios.get(`${API_BASE_URL}/api/org/addresses`, { headers: ORG_ADMIN_HEADERS() }),
};

export default api;
