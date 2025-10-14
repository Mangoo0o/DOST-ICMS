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
        console.log('User login response:', response.data);
        
        // Check if login was successful
        if (response.data && response.data.jwt) {
          // Store user data from the response
          const userData = {
            id: response.data.id || response.data.data?.id,
            email: response.data.email || response.data.data?.email,
            role: response.data.role || response.data.data?.role,
            first_name: response.data.first_name || response.data.data?.first_name,
            last_name: response.data.last_name || response.data.data?.last_name,
            full_name: response.data.full_name || response.data.data?.full_name,
            require_password_change: !!response.data.require_password_change
          };
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('token', response.data.jwt);
          return userData;
        } else {
          throw new Error(response.data?.message || 'Login failed');
        }
      } catch (userError) {
        console.log('User login failed, trying client login:', userError.response?.data?.message);
        
        // If user login fails, try client login
        try {
          const clientResponse = await apiService.clientLogin(credentials);
          console.log('Client login response:', clientResponse.data);
          
          // Check if client login was successful
          if (clientResponse.data && clientResponse.data.jwt) {
            // Store client data from the response
            const clientData = {
              id: clientResponse.data.id || clientResponse.data.data?.id,
              email: clientResponse.data.email || clientResponse.data.data?.email,
              role: clientResponse.data.role || clientResponse.data.data?.role,
              first_name: clientResponse.data.first_name || clientResponse.data.data?.first_name,
              last_name: clientResponse.data.last_name || clientResponse.data.data?.last_name,
              full_name: clientResponse.data.full_name || clientResponse.data.data?.full_name,
              client_id: clientResponse.data.client_id || clientResponse.data.data?.id,
              require_password_change: !!clientResponse.data.require_password_change
            };
            setUser(clientData);
            setIsAuthenticated(true);
            localStorage.setItem('token', clientResponse.data.jwt);
            return clientData;
          } else {
            throw new Error(clientResponse.data?.message || 'Client login failed');
          }
        } catch (clientError) {
          console.log('Client login also failed:', clientError.response?.data?.message);
          throw clientError;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      // Extract the error message from the response
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
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