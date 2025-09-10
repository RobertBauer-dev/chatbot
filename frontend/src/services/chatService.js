import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatService = {
  async sendMessage(message, sessionId = null) {
    const response = await api.post('/api/chat/message', {
      message,
      sessionId,
    });
    return response.data;
  },

  async sendMessagePublic(message, sessionId = null) {
    const response = await api.post('/api/chat/message/public', {
      message,
      sessionId,
    });
    return response.data;
  },

  async createSession() {
    const response = await api.post('/api/sessions');
    return response.data;
  },

  async getSession(sessionId) {
    const response = await api.get(`/api/sessions/${sessionId}`);
    return response.data;
  },

  async getUserSessions() {
    const response = await api.get('/api/sessions');
    return response.data;
  },
};
