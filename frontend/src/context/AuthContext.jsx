// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/config.js';

// Create the Context instance
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch the secure JWT token from Firebase Client SDK
        const token = await firebaseUser.getIdToken();
        
        // Store the token to localStorage for backend Axios/Fetch API authorization
        localStorage.setItem('token', token);
        
        // Set the active user state
        setUser(firebaseUser);
      } else {
        // Clear tokens and user context on sign-out
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Login with Email and Password
   */
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Register a new account
   */
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  /**
   * Log out of the current session
   */
  const logout = () => {
    return signOut(auth);
  };

  /**
   * Send a password reset recovery email
   */
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};