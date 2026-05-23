import api from './api';

export const fetchJobs = (params) => api.get('/jobs', { params });
export const fetchJobById = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const fetchJobApplicants = (jobId) => api.get(`/jobs/${jobId}/applicants`);
