import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('admin_info');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token') || null);
  const [loading, setLoading] = useState(true);

  // State cleanup helper
  const logoutStateClear = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('admin_info');
  };

  // Helper to update admin state across app & localStorage
  const updateAdminState = (newAdminData) => {
    setAdmin(newAdminData);
    localStorage.setItem('admin_info', JSON.stringify(newAdminData));
  };

  // Validate existing token when the app initializes
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('jwt_token');
      if (storedToken) {
        try {
          // Verify token against backend API
          const response = await api.get('/api/admin/me');
          if (response.data) {
            // Update admin info if backend returns user details
            const userData = response.data.admin || response.data;
            setAdmin(userData);
            localStorage.setItem('admin_info', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Authentication verification failed:', error);
          // Handled globally by Axios 401 interceptor, but cleanup state here as fallback
          logoutStateClear();
        }
      } else {
        logoutStateClear();
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/api/admin/login', { email, password });
    
    if (response.data && response.data.token) {
      const jwtToken = response.data.token;
      const adminData = response.data.admin;

      // Save state
      setToken(jwtToken);
      setAdmin(adminData);

      // Save to localStorage
      localStorage.setItem('jwt_token', jwtToken);
      localStorage.setItem('admin_info', JSON.stringify(adminData));

      return response.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/api/admin/logout');
    } catch (error) {
      console.warn('Logout API call failed or session expired:', error);
    } finally {
      logoutStateClear();
    }
  };

  const value = {
    admin,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    updateAdminState, // Added function here
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};