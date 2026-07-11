// frontend/src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Unified API Request wrapper that automatically injects Firebase Authorization tokens
 * @param {string} endpoint - Target route path (e.g., '/api/campaigns')
 * @param {Object} options - Custom fetch options (method, body, headers)
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Pull the current JWT token saved by AuthContext during login updates
  const token = localStorage.getItem('token');
  
  const headers = { ...options.headers };

  // If the body is standard JSON data, apply the appropriate header configuration
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Inject token into Authorization header if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchConfig = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...fetchConfig });

  // Handle systemic failures directly
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API request execution failed with status code ${response.status}`);
  }

  return response.json();
};