import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>{children}</AuthContext.Provider>;
}
