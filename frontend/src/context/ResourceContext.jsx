import React, { createContext, useState, useContext, useEffect } from 'react';
import { resourceService } from '../services/resources';

const ResourceContext = createContext();

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within ResourceProvider');
  }
  return context;
};

export const ResourceProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load resources on mount
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getAll();
      setResources(data);
      setError(null);
    } catch (err) {
      setError(err.error || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (resourceData) => {
    try {
      setLoading(true);
      const result = await resourceService.create(resourceData);
      setResources([...resources, result.resource]);
      return result;
    } catch (err) {
      setError(err.error || 'Failed to create resource');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateResource = async (resourceId, resourceData) => {
    try {
      setLoading(true);
      const updated = await resourceService.update(resourceId, resourceData);
      setResources(resources.map(r => 
        r._id === resourceId ? updated : r
      ));
      return updated;
    } catch (err) {
      setError(err.error || 'Failed to update resource');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      setLoading(true);
      await resourceService.delete(resourceId);
      setResources(resources.filter(r => r._id !== resourceId));
    } catch (err) {
      setError(err.error || 'Failed to delete resource');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateResourceStatus = async (resourceId, status) => {
    try {
      setLoading(true);
      await resourceService.updateStatus(resourceId, status);
      setResources(resources.map(r => 
        r._id === resourceId ? { ...r, status } : r
      ));
    } catch (err) {
      setError(err.error || 'Failed to update resource status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    resources,
    loading,
    error,
    addResource,
    updateResource,
    deleteResource,
    updateResourceStatus,
    refreshResources: loadResources
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
};