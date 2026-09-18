import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('smartmed_access_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(({ data }) => { setUser(data.user); setDoctorProfile(data.doctorProfile); })
      .catch(() => {
        localStorage.removeItem('smartmed_access_token');
        localStorage.removeItem('smartmed_refresh_token');
      })
      .finally(() => setLoading(false));
  }, []);

  function persist({ user, doctorProfile, accessToken, refreshToken }) {
    localStorage.setItem('smartmed_access_token', accessToken);
    localStorage.setItem('smartmed_refresh_token', refreshToken);
    setUser(user);
    setDoctorProfile(doctorProfile || null);
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data);
    return data;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    persist(data);
    return data;
  }

  async function logout() {
    try { await api.post('/auth/logout', {}); } catch (e) { /* ignore */ }
    localStorage.removeItem('smartmed_access_token');
    localStorage.removeItem('smartmed_refresh_token');
    setUser(null);
    setDoctorProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, doctorProfile, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
