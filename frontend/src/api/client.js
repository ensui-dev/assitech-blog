import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication API
export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (username, email, password) => {
    const response = await apiClient.post('/api/auth/register', { username, email, password });
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

// Articles API
export const articlesApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/articles');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/articles/${id}`);
    return response.data;
  },

  create: async (articleData) => {
    const response = await apiClient.post('/api/articles', articleData);
    return response.data;
  },

  update: async (id, articleData) => {
    const response = await apiClient.put(`/api/articles/${id}`, articleData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/articles/${id}`);
    return response.data;
  },

  generate: async (topic) => {
    const response = await apiClient.post('/api/articles/generate', { topic });
    return response.data;
  },

  generateRandom: async () => {
    const response = await apiClient.post('/api/articles/generate-random');
    return response.data;
  },

  getTopicSuggestions: async (count = 10) => {
    const response = await apiClient.get(`/api/articles/topics?count=${count}`);
    return response.data;
  },
};

export default apiClient;
