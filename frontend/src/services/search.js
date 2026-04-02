import api from './api';

export const searchService = {
  // Search for matches using natural language
  search: async (query, filters = {}) => {
    try {
      const response = await api.post('/search', {
        query,
        ...filters
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Find matches for a specific resource
  findMatchesForResource: async (resourceId) => {
    try {
      const response = await api.get(`/search/resource/${resourceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get matches for dashboard
  getDashboardMatches: async () => {
    try {
      const response = await api.get('/search/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};