// frontend/src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Custom hook to easily consume the global authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be consumed within an active AuthProvider context wrapper.');
  }
  
  return context;
};