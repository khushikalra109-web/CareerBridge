import api from './api';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = (token) => {
  if (!token) throw new Error('Token missing');
  return api.get('/users/me');
};
export const updateProfile = (data) => api.put('/users/me', data);
export const uploadResume = (formData) => api.put('/users/me/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
