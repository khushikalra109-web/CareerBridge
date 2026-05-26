import api from './api';

export const fetchJobs = (params) => api.get('/jobs', { params });
export const fetchCompanyJobs = () => api.get('/company/jobs');
export const fetchJobById = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const fetchJobApplicants = (jobId) => api.get(`/jobs/${jobId}/applicants`);
export const fetchSavedJobs = () => api.get('/users/me/saved-jobs');
export const toggleSavedJob = (jobId) => api.post(`/users/me/save-job/${jobId}`);
export const fetchRecommendedJobs = () => api.get('/users/me/recommended');
export const fetchCompanyAnalytics = () => api.get('/company/analytics');
export const fetchAdminStats = () => api.get('/admin/stats');
