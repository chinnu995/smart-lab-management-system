import axios from 'axios';
const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';
let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';
if (!import.meta.env.VITE_API_URL && typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  apiHost = `${protocol}//${window.location.hostname}:5005`;
}
const cleanHost = apiHost.replace(/\/+$/, '').replace(/\/api$/, '');
const baseURL = `${cleanHost}/api`;
const api = axios.create({ baseURL });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    const publicAuthPages = ['/login', '/signup', '/reset-password'];
    const isPublicAuthPage = publicAuthPages.some(p => location.pathname.startsWith(p));
    if (!isPublicAuthPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.href = '/login';
    }
  }
  return Promise.reject(err);
});

export default api;
