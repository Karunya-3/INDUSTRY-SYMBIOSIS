import api from './api';

export const resourceService = {
  // Create new resource
  create: async (resourceData) => {
    try {
      const response = await api.post('/resources', resourceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all resources for current user
  getAll: async () => {
    try {
      const response = await api.get('/resources');
      return response.data.resources;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single resource
  getById: async (resourceId) => {
    try {
      const response = await api.get(`/resources/${resourceId}`);
      return response.data.resource;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update resource
  update: async (resourceId, resourceData) => {
    try {
      const response = await api.put(`/resources/${resourceId}`, resourceData);
      return response.data.resource;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete resource
  delete: async (resourceId) => {
    try {
      const response = await api.delete(`/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update resource status
  updateStatus: async (resourceId, status) => {
    try {
      const response = await api.patch(`/resources/${resourceId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};