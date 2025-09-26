import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import api from '../services/api';
import * as jwt_decode from 'jwt-decode';
const decode = jwt_decode.default || jwt_decode;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Make a request to validate the token and get user data
        const response = await api.get('/api/auth/validate_token.php');
        if (response.data && !response.data.message) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          // If we get a message, it means there was an error
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
    // Auto-refresh token logic
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = decode(token);
          const exp = decoded.exp;
          const now = Math.floor(Date.now() / 1000);
          // If less than 10 minutes left, refresh
          if (exp - now < 600) {
            const response = await api.post('/api/auth/refresh_token.php');
            if (response.data && response.data.jwt) {
              localStorage.setItem('token', response.data.jwt);
            } else {
              // If refresh fails, do not force logout; optionally log a warning
              console.warn('Token refresh failed, but not logging out.');
            }
          }
        } catch (e) {
          // If decode fails, do not force logout; optionally log a warning
          console.warn('Token decode failed, but not logging out.');
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const login = async (credentials) => {
    try {
      // First try user login
      try {
        const response = await apiService.loginUser(credentials);
        // Store user data from the response
        const userData = {
          id: response.data.id,
          email: response.data.email,
          role: response.data.role,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          full_name: response.data.full_name
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.data.jwt);
        return userData;
      } catch (userError) {
        // If user login fails, try client login
        const clientResponse = await apiService.clientLogin(credentials);
        // Store client data from the response
        const clientData = {
          id: clientResponse.data.id,
          email: clientResponse.data.email,
          role: clientResponse.data.role,
          first_name: clientResponse.data.first_name,
          last_name: clientResponse.data.last_name,
          full_name: clientResponse.data.full_name,
          client_id: clientResponse.data.client_id
        };
        setUser(clientData);
        setIsAuthenticated(true);
        localStorage.setItem('token', clientResponse.data.jwt);
        return clientData;
      }
    } catch (error) {
      // Extract the error message from the response
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2a9dab] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
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