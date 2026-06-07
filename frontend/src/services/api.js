import axios from 'axios';
let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';
if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  apiHost = `http://${window.location.hostname}:5005`;
}
const baseURL = apiHost + '/api';
const api = axios.create({ baseURL });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (location.pathname !== '/login') location.href = '/login';
  }
  return Promise.reject(err);
});

export default api;
