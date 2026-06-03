import api from './api';

export const applyJob = (formData) => api.post('/applications', formData);
export const getStudentApplications = () => api.get('/applications/student');
export const getApplicationsForJob = (jobId) => api.get(`/applications/job/${jobId}`);
export const getCompanyApplications = () => api.get('/company/applications');
export const updateApplicationStatus = (id, status) => api.put(`/company/applications/${id}/status`, { status });
