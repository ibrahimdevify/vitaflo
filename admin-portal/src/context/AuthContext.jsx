import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
          setModules([]);
          setUnauthorized(true);
          if (window.location.pathname !== '/unauthorized') {
            window.location.href = '/unauthorized';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI
        .me()
        .then((res) => {
          setUser(res.data.user || res.data);
          // Assumes /me (whatever authAPI.me() hits) also returns `modules`,
          // the same way /login now does. If that endpoint hasn't been
          // updated yet, this falls back to [], meaning every module-gated
          // page will show Forbidden on refresh even right after a
          // successful login with correct permissions — update that
          // controller the same way login's was (reuse
          // roleService.getRolePermissions(user.ut_id_fk)).
          setModules(res.data.modules || []);
          setUnauthorized(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUnauthorized(true);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    const { access_token, user: userData, modules: moduleData } = res.data;
    localStorage.setItem('token', access_token);
    setUser(userData);
    setModules(moduleData || []);
    setUnauthorized(false);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setModules([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, modules, login, logout, loading, unauthorized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);