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

export const authService = {
  async login(username, password) {
    const response = await api.post('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  async register(username, password) {
    const response = await api.post('/api/auth/register', {
      username,
      password,
    });
    return response.data;
  },
};
