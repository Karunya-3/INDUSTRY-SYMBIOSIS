import api from './api';

export const register = async (userData) => {
  // Map frontend camelCase to backend snake_case
  const mappedData = {
    email: userData.email,
    password: userData.password,
    user_type: userData.userType,      // Map userType -> user_type
    company_name: userData.companyName, // Map companyName -> company_name
    industry: userData.industry,
    location: userData.location,
    phone: userData.phone || null
  };
  
  console.log('📤 Sending to backend:', mappedData);
  
  const response = await api.post('/auth/register', mappedData);
  return response.data.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.data.user;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};