import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ Search ============
export const startSearch = (keyword) => api.post('/search', { keyword });

// ============ Recruiters ============
export const getRecruiters = () => api.get('/recruiters');
export const getRecruiter = (id) => api.get(`/recruiters/${id}`);
export const deleteRecruiter = (id) => api.delete(`/recruiters/${id}`);
export const updateRecruiterStatus = (id, status) =>
  api.patch(`/recruiters/${id}/status`, { status });

// ============ Resume ============
export const uploadResume = (formData) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getResumes = () => api.get('/resumes');
export const deleteResume = (id) => api.delete(`/resumes/${id}`);

// ============ Email ============
export const sendEmail = (data) => api.post('/email/send', data);
export const getEmailTemplate = () => api.get('/email/template');

// ============ History & Analytics ============
export const getHistory = () => api.get('/history');
export const getEmailHistory = () => api.get('/history/emails');
export const getAnalytics = () => api.get('/analytics');

// ============ Settings ============
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.post('/settings', data);

export default api;
