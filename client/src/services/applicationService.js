import api from './api';

export const applyJob = (formData) => api.post('/applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getStudentApplications = () => api.get('/applications/student');
export const getApplicationsForJob = (jobId) => api.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (id, status) => api.put(`/applications/${id}/status`, { status });
