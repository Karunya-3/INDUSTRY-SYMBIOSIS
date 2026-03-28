import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/auth';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setAccessToken(token);
          } else {
            // Token expired, try to refresh
            await refreshToken();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      const { access_token } = response;
      localStorage.setItem('access_token', access_token);
      setAccessToken(access_token);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const login = async (email, password, remember = false) => {
    const response = await authService.login(email, password);
    const { access_token, refresh_token, user: userData } = response;
    
    if (remember) {
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
    } else {
      sessionStorage.setItem('access_token', access_token);
      sessionStorage.setItem('refresh_token', refresh_token);
    }
    
    setAccessToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
    setAccessToken(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};