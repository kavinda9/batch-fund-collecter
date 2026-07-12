// File: /frontend/src/pages/Portal.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Portal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccessAndRoute = async () => {
      try {
        // First check if the role has already been saved to localStorage by login/register processes
        let currentRole = localStorage.getItem('batchFundUserRole');

        // Fallback: If localStorage is clear but user is authenticated, ping verification endpoint directly
        if (!currentRole) {
          const response = await api.post('/api/auth/verify');

          /* CRITICAL FIX HERE:
             Target the nested data tier instead of evaluating userProfile.role directly
          */
          currentRole = response.data?.user?.role;

          if (currentRole) {
            localStorage.setItem('batchFundUserRole', currentRole);
          }
        }

        // Direct users dynamically based on clean, structural string variables
        if (currentRole === 'admin') {
          navigate('/admin', { replace: true });
        } else if (currentRole === 'member' || currentRole === 'contributor') {
          navigate('/landing', { replace: true });
        } else {
          // If role matches neither or is undefined, force home reload
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Portal access evaluation aborted:", error);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndRoute();
  }, [navigate]);

  if (loading) {
    return <div className="loading-spinner">Verifying account access permissions...</div>;
  }

  return null;
}