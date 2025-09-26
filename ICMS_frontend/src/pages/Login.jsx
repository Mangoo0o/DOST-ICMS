import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dostLogo from '../assets/dost logo.svg';

// Add animation styles
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!credentials.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: '', password: '' });
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(credentials);
      if (user.role === 'cashier') {
        navigate('/dashboard');
      } else if (user.role === 'admin') {
        navigate('/dashboard');
      } else if (user.role === 'client') {
        navigate('/front-reservation');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Check if error is related to user status
      if (error.message.toLowerCase().includes('not found') || 
          error.message.toLowerCase().includes('inactive')) {
        setErrors({ email: error.message, password: '' });
      } else {
        setErrors({ email: '', password: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2a9dab]/20 to-[#2a9dab]/30">
      <style>{styles}</style>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center bg-white">
            <div className="flex items-center justify-start gap-3 mb-4 pl-6">
              <div className="bg-white rounded-full p-3 shadow-lg ring-2 ring-white/20 flex-shrink-0">
                <img src={dostLogo} alt="DOST Logo" className="w-12 h-12" />
              </div>
              <div className="text-left">
                <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight tracking-wide whitespace-nowrap">Integrated Calibration</h1>
                <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight tracking-wide">Management System</h2>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={credentials.email}
                    onChange={(e) => {
                      setCredentials({ ...credentials, email: e.target.value });
                      setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors`}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <div className="mt-1 flex items-center text-red-500 text-sm animate-fadeIn">
                    <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={credentials.password}
                    onChange={(e) => {
                      setCredentials({ ...credentials, password: e.target.value });
                      setErrors({ ...errors, password: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors pr-16`}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-gray-500 focus:outline-none bg-transparent"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .105 0 .21.002.315.004L13.875 18.825z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.243 14.243a3 3 0 11-4.243-4.243M1.99 1.99l20 20" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="mt-1 flex items-center text-red-500 text-sm animate-fadeIn">
                    <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </div>
                )}
              </div>


              <button
                type="submit"
                disabled={isLoading}
                className={"w-full bg-[#2a9dab] text-white py-3 px-4 rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors font-medium " + (isLoading ? 'opacity-75 cursor-not-allowed' : '')}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600 text-sm">Don't have an account?</span>
              <button
                type="button"
                className="ml-2 text-blue-600 hover:underline text-sm font-medium"
                onClick={() => navigate('/register-client')}
              >
                Register as Client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 