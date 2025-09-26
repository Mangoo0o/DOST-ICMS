import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dostLogo from '../assets/dost logo.svg';
import { getProvinces, getCities, getBarangays } from '../data/philippineLocations';
import { industries } from '../data/industries';

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

const initialState = {
  first_name: '',
  last_name: '',
  age: '',
  gender: '',
  province: '',
  city: '',
  barangay: '',
  contact_number: '',
  email: '',
  company: '',
  industry_type: '',
  service_line: '',
  company_head: '',
  password: '',
  confirmPassword: '',
  is_pwd: false,
  is_4ps: false,
  privacy_terms: false
};

// Validation functions
const validateForm = (form) => {
  const errors = [];

  // Personal information validation
  if (!form.first_name.trim()) errors.push('First name is required');
  if (!form.last_name.trim()) errors.push('Last name is required');
  if (!form.age || form.age < 1 || form.age > 120) errors.push('Please enter a valid age (1-120)');
  if (!form.gender) errors.push('Please select a gender');

  // Address validation
  if (!form.province) errors.push('Please select a province');
  if (!form.city) errors.push('Please select a city');
  if (!form.barangay) errors.push('Please select a barangay');

  // Contact validation
  if (!form.contact_number.trim()) errors.push('Contact number is required');
  
  // Philippine phone number validation
  const contactNumber = form.contact_number.trim();
  if (contactNumber) {
    // Remove all non-digit characters for validation
    const digitsOnly = contactNumber.replace(/\D/g, '');
    
    // Check if it's a valid Philippine mobile number (09XXXXXXXXX - 11 digits)
    const isMobile = /^09\d{9}$/.test(digitsOnly);
    
    // Check if it's a valid Philippine landline number (02XXXXXXXX - 10 digits for Metro Manila)
    const isLandlineMetro = /^02\d{8}$/.test(digitsOnly);
    
    // Check if it's a valid Philippine landline number (0XX-XXXXXXX - 10 digits for provinces)
    const isLandlineProvince = /^0[3-9]\d{8}$/.test(digitsOnly);
    
    // Check if it's a valid Philippine landline number with area code (XX-XXXXXXX - 9 digits)
    const isLandlineWithArea = /^[3-9]\d{8}$/.test(digitsOnly);
    
    if (!isMobile && !isLandlineMetro && !isLandlineProvince && !isLandlineWithArea) {
      errors.push('Please enter a valid Philippine phone number (e.g., 09123456789, 02-1234567, 032-1234567)');
    }
  }
  
  if (!form.email.trim()) errors.push('Email is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push('Please enter a valid email address');

  // Company validation
  if (!form.company.trim()) errors.push('Company name is required');
  if (!form.company_head.trim()) errors.push('Company head is required');
  if (!form.industry_type.trim()) errors.push('Industry type is required');
  if (!form.service_line.trim()) errors.push('Service line is required');

  // Password validation
  if (form.password.length < 6) errors.push('Password must be at least 6 characters long');
  if (form.password !== form.confirmPassword) errors.push('Passwords do not match');

  // Privacy terms validation
  if (!form.privacy_terms) errors.push('You must agree to the privacy terms and conditions');

  return errors;
};

const ClientRegistration = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // Get available options for dropdowns
  const provinces = getProvinces();
  const cities = getCities(form.province);
  const barangays = getBarangays(form.province, form.city);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }

    // Auto-set Citizen Classification based on age
    if (name === 'age') {
      const ageValue = parseInt(value, 10);
      setForm(prev => ({
        ...prev,
        age: value,
        service_line: ageValue >= 60 ? 'Senior' : prev.service_line === 'Senior' ? '' : prev.service_line
      }));
      return;
    }
    
    // Reset dependent fields when province or city changes
    if (name === 'province') {
      setForm(prev => ({ 
        ...prev, 
        [name]: value, 
        city: '', 
        barangay: '' 
      }));
      // Clear related field errors
      setFieldErrors(prev => ({ 
        ...prev, 
        city: null, 
        barangay: null 
      }));
    } else if (name === 'city') {
      setForm(prev => ({ 
        ...prev, 
        [name]: value, 
        barangay: '' 
      }));
      setFieldErrors(prev => ({ 
        ...prev, 
        barangay: null 
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const clearMessages = () => {
    setMessage(null);
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    
    // Validate form
    const validationErrors = validateForm(form);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the client profile directly (no user account needed)
      const clientRes = await fetch('http://localhost:8000/api/clients/create_client.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          age: parseInt(form.age),
          gender: form.gender,
          province: form.province,
          city: form.city,
          barangay: form.barangay,
          contact_number: form.contact_number.trim(),
          email: form.email.trim().toLowerCase(),
          company: form.company.trim(),
          industry_type: form.industry_type.trim(),
          service_line: form.service_line.trim(),
          company_head: form.company_head.trim(),
          password: form.password,
          is_pwd: form.is_pwd,
          is_4ps: form.is_4ps
        }),
      });
      
      const clientData = await clientRes.json();
      
      if (clientRes.ok) {
        setMessage('Client registered successfully! You can now log in.');
        setForm(initialState);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        if (clientRes.status === 400) {
          throw new Error(clientData.message || 'Invalid client data provided');
        } else if (clientRes.status === 409) {
          throw new Error('A client with this email already exists. Please use a different email address.');
        } else {
          throw new Error(clientData.message || 'Client profile creation failed');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle network errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err.name === 'SyntaxError') {
        setError('Server error: Invalid response from server. Please try again later.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validationErrors = validateForm({ ...form, [name]: value });
    
    // Find field-specific error
    const fieldError = validationErrors.find(error => {
      if (name === 'first_name' && error.includes('First name')) return true;
      if (name === 'last_name' && error.includes('Last name')) return true;
      if (name === 'age' && error.includes('age')) return true;
      if (name === 'gender' && error.includes('gender')) return true;
      if (name === 'province' && error.includes('province')) return true;
      if (name === 'city' && error.includes('city')) return true;
      if (name === 'barangay' && error.includes('barangay')) return true;
      if (name === 'contact_number' && error.includes('Philippine phone number')) return true;
      if (name === 'email' && error.includes('email')) return true;
      if (name === 'company' && error.includes('Company name')) return true;
      if (name === 'company_head' && error.includes('Company head')) return true;
      if (name === 'industry_type' && error.includes('Industry type')) return true;
      if (name === 'service_line' && error.includes('Service line')) return true;
      if (name === 'password' && error.includes('Password')) return true;
      if (name === 'confirmPassword' && error.includes('Passwords')) return true;
      if (name === 'privacy_terms' && error.includes('privacy terms')) return true;
      return false;
    });
    
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError || null
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a9dab]/20 to-[#2a9dab]/30 py-4">
      <style>{styles}</style>
      <div className="max-w-3xl w-full mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] min-h-[95vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-800">Client Registration Form</h2>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[#2a9dab] hover:text-[#2a9dab]/80 font-medium text-sm flex items-center gap-1 transition-colors bg-gray-50 px-4 py-2 rounded-lg"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-fadeIn text-sm">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fadeIn text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      name="first_name" 
                      value={form.first_name} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.first_name 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                    />
                    {fieldErrors.first_name && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.first_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      name="last_name" 
                      value={form.last_name} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.last_name 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                    />
                    {fieldErrors.last_name && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.last_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input 
                      type="number" 
                      name="age" 
                      value={form.age} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.age 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                      min="1" 
                      max="120"
                    />
                    {fieldErrors.age && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.age}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <div className="flex gap-3 mt-1">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="gender" 
                          value="male" 
                          checked={form.gender === 'male'} 
                          onChange={handleChange} 
                          className="text-[#2a9dab] focus:ring-[#2a9dab]" 
                          required 
                        />
                        <span className="ml-2 text-sm text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="gender" 
                          value="female" 
                          checked={form.gender === 'female'} 
                          onChange={handleChange} 
                          className="text-[#2a9dab] focus:ring-[#2a9dab]" 
                          required 
                        />
                        <span className="ml-2 text-sm text-gray-700">Female</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="gender" 
                          value="other" 
                          checked={form.gender === 'other'} 
                          onChange={handleChange} 
                          className="text-[#2a9dab] focus:ring-[#2a9dab]" 
                          required 
                        />
                        <span className="ml-2 text-sm text-gray-700">Other</span>
                      </label>
                    </div>
                    {fieldErrors.gender && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.gender}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of Industry</label>
                    <select 
                      name="industry_type" 
                      value={form.industry_type} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.industry_type 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                    >
                      <option value="">Select Industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                    {fieldErrors.industry_type && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.industry_type}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Citizen Classification</label>
                    <select 
                      name="service_line" 
                      value={form.service_line} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.service_line 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                    >
                      <option value="">Select Citizen Classification</option>
                      <option value="Student">Student</option>
                      <option value="Regular">Regular</option>
                      <option value="Senior">Senior</option>
                    </select>
                    {fieldErrors.service_line && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.service_line}</p>
                    )}
                  </div>
                </div>
                
                {/* Additional Information within Personal Information */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_pwd"
                        checked={form.is_pwd}
                        onChange={(e) => setForm({ ...form, is_pwd: e.target.checked })}
                        className="h-4 w-4 text-[#2a9dab] focus:ring-[#2a9dab] border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Person with Disability (PWD)</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_4ps"
                        checked={form.is_4ps}
                        onChange={(e) => setForm({ ...form, is_4ps: e.target.checked })}
                        className="h-4 w-4 text-[#2a9dab] focus:ring-[#2a9dab] border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">4Ps Beneficiary</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <select 
                      name="province" 
                      value={form.province} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.province 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                    >
                      <option value="">Select Province</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {fieldErrors.province && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.province}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <select 
                      name="city" 
                      value={form.city} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.city 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                      disabled={!form.province}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {fieldErrors.city && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                    <select 
                      name="barangay" 
                      value={form.barangay} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.barangay 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                      disabled={!form.city}
                    >
                      <option value="">Select Barangay</option>
                      {barangays.map((barangay) => (
                        <option key={barangay} value={barangay}>{barangay}</option>
                      ))}
                    </select>
                    {fieldErrors.barangay && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.barangay}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input 
                      type="text" 
                      name="contact_number" 
                      value={form.contact_number} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      placeholder="e.g., 09123456789, 02-1234567, 032-1234567"
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.contact_number 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                    />
                    {fieldErrors.contact_number && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.contact_number}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.email 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input 
                      type="text" 
                      name="company" 
                      value={form.company} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.company 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                    />
                    {fieldErrors.company && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.company}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Head</label>
                    <input 
                      type="text" 
                      name="company_head" 
                      value={form.company_head} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        fieldErrors.company_head 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                      }`}
                      required 
                    />
                    {fieldErrors.company_head && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.company_head}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        name="password" 
                        value={form.password} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors pr-10 text-sm ${
                          fieldErrors.password 
                            ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                        }`}
                        required 
                        minLength={6} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        name="confirmPassword" 
                        value={form.confirmPassword} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors pr-10 text-sm ${
                          fieldErrors.confirmPassword 
                            ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]'
                        }`}
                        required 
                        minLength={6} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
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
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Privacy Terms Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="privacy_terms"
                    checked={form.privacy_terms}
                    onChange={(e) => {
                      setForm({ ...form, privacy_terms: e.target.checked });
                      if (fieldErrors.privacy_terms) {
                        setFieldErrors(prev => ({ ...prev, privacy_terms: null }));
                      }
                    }}
                    onBlur={handleBlur}
                    className="h-4 w-4 text-[#2a9dab] focus:ring-[#2a9dab] border-gray-300 rounded mt-1"
                    required
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      className="text-[#2a9dab] hover:underline font-medium"
                      onClick={() => {
                        // You can implement a modal or redirect to privacy policy here
                        alert('Privacy Policy: This system collects personal information for calibration services. Your data will be used solely for service delivery and will not be shared with third parties without consent.');
                      }}
                    >
                      Privacy Policy
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      className="text-[#2a9dab] hover:underline font-medium"
                      onClick={() => {
                        // You can implement a modal or redirect to terms of service here
                        alert('Terms of Service: By using this system, you agree to provide accurate information and comply with all applicable regulations for calibration services.');
                      }}
                    >
                      Terms of Service
                    </button>
                    . I understand that my information will be used for calibration service purposes only.
                  </label>
                </div>
                {fieldErrors.privacy_terms && (
                  <p className="mt-2 text-xs text-red-600">{fieldErrors.privacy_terms}</p>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-white sticky bottom-0 z-10 rounded-b-2xl">
            <button
              type="submit"
              form="client-registration-form"
              disabled={loading}
              className={"w-full bg-[#2a9dab] text-white py-2 px-4 rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors font-medium " + (loading ? 'opacity-75 cursor-not-allowed' : '')}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                'Submit Client Information'
              )}
            </button>
            <div className="mt-4 text-center">
              <span className="text-gray-600 text-sm">Already have an account?</span>
              <button
                type="button"
                className="ml-2 text-[#2a9dab] hover:underline text-sm font-medium bg-gray-50 px-3 py-1 rounded"
                onClick={() => navigate('/login')}
              >
                Login Here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRegistration; 