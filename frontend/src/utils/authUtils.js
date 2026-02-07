// authUtils.js - Place this in src/utils/ folder

const API_URL = 'http://localhost:5000/api';

/**
 * Get the current access token
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Get the current refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Refresh the access token using the refresh token
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (data.success && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    } else {
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    // Clear tokens if refresh fails
    logout();
    throw error;
  }
};

/**
 * Make an authenticated API request with automatic token refresh
 */
export const authenticatedFetch = async (url, options = {}) => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  // Add authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
  };

  try {
    // Make the request
    let response = await fetch(url, { ...options, headers });

    // If token expired, refresh and retry
    if (response.status === 401) {
      const data = await response.json();
      
      if (data.code === 'TOKEN_EXPIRED') {
        console.log('🔄 Token expired, refreshing...');
        
        // Refresh the token
        const newAccessToken = await refreshAccessToken();
        
        // Retry with new token
        headers.Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
};

/**
 * Logout - clear all auth data
 */
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('token'); // Old token
  localStorage.removeItem('authToken'); // Old token
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAccessToken() && !!getRefreshToken();
};

/**
 * Get current user info
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};