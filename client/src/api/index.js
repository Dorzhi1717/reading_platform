import axios from 'axios';
baseURL: 'https://reading-platform-api.onrender.com/api',
const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
};

export const clubsAPI = {
  getAll: (search) => API.get('/clubs', { params: search ? { search } : {} }),
  getMy: () => API.get('/clubs/my'),
  getById: (id) => API.get(`/clubs/${id}`),
  create: (data) => API.post('/clubs', data),
  join: (id) => API.post(`/clubs/${id}/join`),
  leave: (id) => API.delete(`/clubs/${id}/leave`),
};

export const booksAPI = {
  getMy: () => API.get('/books'),
  add: (data) => API.post('/books', data),
  remove: (id) => API.delete(`/books/${id}`),
};

export const chatAPI = {
  getMessages: (clubId) => API.get(`/chat/${clubId}`),
};

export const statsAPI = {
  get: () => API.get('/stats'),
};

export default API;