import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/auth';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

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
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      // Check both localStorage and sessionStorage for token
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            // Token is valid
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setAccessToken(token);
            
            // Fetch user data
            const userData = await authService.getCurrentUser();
            setUser(userData);
            console.log('Auth initialized, user:', userData);
          } else {
            // Token expired, try to refresh
            console.log('Token expired, attempting refresh...');
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
      
      // Store in same location as original token
      const isLocalStorage = localStorage.getItem('refresh_token');
      if (isLocalStorage) {
        localStorage.setItem('access_token', access_token);
      } else {
        sessionStorage.setItem('access_token', access_token);
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setAccessToken(access_token);
      
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Refresh token failed:', error);
      logout();
      return false;
    }
  };

  // FIXED: Accept object parameter instead of separate parameters
  const login = async (credentials) => {
    try {
      const { email, password, remember = false } = credentials;
      const response = await authService.login(email, password, remember);
      
      console.log('Login response:', response);
      
      const { access_token, refresh_token, user: userData } = response.data ?? response;
      
      if (!access_token) {
        throw new Error('No access token received');
      }
      
      // Store tokens based on remember preference
      if (remember) {
        localStorage.setItem('access_token', access_token);
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
      } else {
        sessionStorage.setItem('access_token', access_token);
        if (refresh_token) sessionStorage.setItem('refresh_token', refresh_token);
      }
      
      // Set authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setAccessToken(access_token);
      setUser(userData);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setAccessToken(null);
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user && !!accessToken, // FIXED: Check both user and token
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};