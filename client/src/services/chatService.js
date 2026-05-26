import api from './api';

export const fetchChats = () => api.get('/chat');
export const fetchChatMessages = (chatId) => api.get(`/chat/${chatId}/messages`);
export const sendMessage = (payload) => api.post('/chat/send', payload);
export const fetchContacts = (role) => api.get(`/users/contacts?role=${role}`);
