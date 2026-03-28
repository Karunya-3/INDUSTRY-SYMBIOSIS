import { useAuth } from '../context/AuthContext';

export const useAuth = () => {
  const context = useAuth();
  return context;
};