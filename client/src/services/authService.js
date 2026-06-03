import api from './api';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = (token) => {
  if (!token) throw new Error('Token missing');
  return api.get('/users/me');
};
export const updateProfile = (data) => api.put('/users/me', data);
export const uploadResume = (formData) => api.post('/users/me/resume', formData);
export const fetchResumeInsights = () => api.get('/users/me/ai-insights');
