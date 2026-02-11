import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitbyte_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/register/', data);
export const loginUser = (data) => API.post('/login/', data);
export const getMe = () => API.get('/me/');
export const forgotPassword = (data) => API.post('/forgot-password/', data);

// Module 2
export const getClothingTypes = (gender) => API.get(`/clothing-types/?gender=${gender}`);
export const getFabrics = () => API.get('/fabrics/');
export const getFabricColors = () => API.get('/fabric-colors/');
export const getPatterns = () => API.get('/patterns/');

// Module 3
export const getMeasurementFields = (clothingTypeId) =>
  API.get(`/measurement-fields/?clothing_type_id=${clothingTypeId}`);
export const getSavedMeasurements = () => API.get('/saved-measurements/');
export const saveMeasurement = (data) => API.post('/saved-measurements/', data);
export const updateMeasurement = (id, data) => API.put(`/saved-measurements/${id}/`, data);
export const deleteMeasurement = (id) => API.delete(`/saved-measurements/${id}/`);

// Admin
export const getAdminStats = () => API.get('/admin/stats/');
export const getAdminUsers = (role) => API.get(`/admin/users/${role ? `?role=${role}` : ''}`);
export const updateAdminUser = (id, data) => API.put(`/admin/users/${id}/`, data);
export const deleteAdminUser = (id) => API.delete(`/admin/users/${id}/delete/`);
export const addClothingType = (data) => API.post('/admin/clothing-types/', data);
export const updateClothingType = (id, data) => API.put(`/admin/clothing-types/${id}/`, data);
export const deleteClothingType = (id) => API.delete(`/admin/clothing-types/${id}/`);
export const addFabric = (data) => API.post('/admin/fabrics/', data);
export const updateFabric = (id, data) => API.put(`/admin/fabrics/${id}/`, data);
export const deleteFabricItem = (id) => API.delete(`/admin/fabrics/${id}/`);

// Admin - Customers
export const getAdminCustomers = () => API.get('/tailor/customers/');
export const getCustomerMeasurements = (customerId) =>
  API.get(`/tailor/customers/${customerId}/measurements/`);

export default API;
