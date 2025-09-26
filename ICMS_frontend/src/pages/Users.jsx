import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { getProvinces, getCities, getBarangays } from '../data/philippineLocations';
import { industries } from '../data/industries';
import { motion } from 'framer-motion';

// Helper function to capitalize first letter of each word
const capitalizeName = (name) => {
  return name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const AddUserModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userLevel: 'Admin'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const validateForm = () => {
    const errors = [];
    
    // Validate required fields
    if (!formData.firstName.trim()) {
      errors.push('First name is required');
    }
    if (!formData.lastName.trim()) {
      errors.push('Last name is required');
    }
    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    if (errors.length > 0) {
      toast.error(`Please fix the following issues:\n• ${errors.join('\n• ')}`, {
        duration: 6000,
        style: {
          whiteSpace: 'pre-line'
        }
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onAdd({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        userLevel: formData.userLevel
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        userLevel: 'Admin'
      });
      setErrors({});
      setShowConfirmation(false);
      onClose();
      toast.success('User has been successfully added!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '16px',
          minWidth: '300px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    } catch (error) {
      setErrors({ submit: error.message });
      toast.error(error.message || 'Failed to add user', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '16px',
          minWidth: '300px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errors.submit}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Level</label>
            <select
              value={formData.userLevel}
              onChange={(e) => setFormData({ ...formData, userLevel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="admin">Admin</option>
              <option value="calibration_engineers">Calibration Engineers</option>
              <option value="it_programmer">IT Programmer</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add User'
              )}
            </button>
          </div>
        </form>
        
        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm User Creation</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to create a new user with the following details?
                <br /><br />
                <strong>Name:</strong> {formData.firstName} {formData.lastName}<br />
                <strong>Email:</strong> {formData.email}<br />
                <strong>User Level:</strong> {formData.userLevel}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#217a8c] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EditUserModal = ({ isOpen, onClose, onEdit, user }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    userLevel: '',
    status: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (user) {
      const [firstName, lastName] = user.fullname.split(' ');
      setFormData({
        firstName,
        lastName,
        email: user.email,
        userLevel: user.userlvl || user.userLevel || 'admin',
        status: user.status
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      setShowConfirmation(true);
    } else {
      setErrors(newErrors);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onEdit({
        id: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        userLevel: formData.userLevel,
        status: formData.status
      });
      setShowConfirmation(false);
      onClose();
      toast.success('User has been successfully updated!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '16px',
          minWidth: '300px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    } catch (error) {
      setErrors({ submit: error.message });
      toast.error(error.message || 'Failed to update user', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '16px',
          minWidth: '300px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errors.submit}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-5 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">User Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Level</label>
                <select
                  value={formData.userLevel}
                  onChange={(e) => setFormData({ ...formData, userLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="admin">Admin</option>
                  <option value="calibration_engineers">Calibration Engineers</option>
                  <option value="it_programmer">IT Programmer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={String(formData.status)}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 mt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-center">Confirm Changes</h3>
              <p className="mb-6">Are you sure you want to save these changes?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AddClientModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
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
    is_4ps: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get available options for dropdowns
  const provinces = getProvinces();
  const cities = getCities(formData.province);
  const barangays = getBarangays(formData.province, formData.city);

  const validateForm = () => {
    const newErrors = {};
    
    // Personal information validation
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.age || formData.age < 1 || formData.age > 120) newErrors.age = 'Please enter a valid age (1-120)';
    if (!formData.gender) newErrors.gender = 'Please select a gender';

    // Address validation
    if (!formData.province) newErrors.province = 'Please select a province';
    if (!formData.city) newErrors.city = 'Please select a city';
    if (!formData.barangay) newErrors.barangay = 'Please select a barangay';

    // Contact validation
    if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    
    // Philippine phone number validation
    const contactNumber = formData.contact_number.trim();
    if (contactNumber) {
      const digitsOnly = contactNumber.replace(/\D/g, '');
      const isMobile = /^09\d{9}$/.test(digitsOnly);
      const isLandlineMetro = /^02\d{8}$/.test(digitsOnly);
      const isLandlineProvince = /^0[3-9]\d{8}$/.test(digitsOnly);
      const isLandlineWithArea = /^[3-9]\d{8}$/.test(digitsOnly);
      
      if (!isMobile && !isLandlineMetro && !isLandlineProvince && !isLandlineWithArea) {
        newErrors.contact_number = 'Please enter a valid Philippine phone number';
      }
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Company validation
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.company_head.trim()) newErrors.company_head = 'Company head is required';
    if (!formData.industry_type.trim()) newErrors.industry_type = 'Industry type is required';
    if (!formData.service_line.trim()) newErrors.service_line = 'Service line is required';

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Auto-set Citizen Classification based on age
    if (name === 'age') {
      const ageValue = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        age: value,
        service_line: ageValue >= 60 ? 'Senior' : prev.service_line === 'Senior' ? '' : prev.service_line
      }));
      return;
    }
    
    // Reset dependent fields when province or city changes
    if (name === 'province') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value, 
        city: '', 
        barangay: '' 
      }));
      setErrors(prev => ({ 
        ...prev, 
        city: null, 
        barangay: null 
      }));
    } else if (name === 'city') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value, 
        barangay: '' 
      }));
      setErrors(prev => ({ 
        ...prev, 
        barangay: null 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onAdd(formData);
        setFormData({
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
          is_4ps: false
        });
        setErrors({});
        onClose();
        toast.success('Client has been successfully added!', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '16px',
            minWidth: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        });
      } catch (error) {
        setErrors({ submit: error.message });
        toast.error(error.message || 'Failed to add client', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '16px',
            minWidth: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Client</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errors.submit}
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
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                  min="1"
                  max="120"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <div className="flex gap-3 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      className="text-[#2a9dab] focus:ring-[#2a9dab]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      className="text-[#2a9dab] focus:ring-[#2a9dab]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Female</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === 'other'}
                      onChange={handleChange}
                      className="text-[#2a9dab] focus:ring-[#2a9dab]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Other</span>
                  </label>
                </div>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Industry</label>
                <select
                  name="industry_type"
                  value={formData.industry_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.industry_type ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {errors.industry_type && <p className="text-red-500 text-xs mt-1">{errors.industry_type}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Citizen Classification</label>
                <select
                  name="service_line"
                  value={formData.service_line}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.service_line ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Citizen Classification</option>
                  <option value="Student">Student</option>
                  <option value="Regular">Regular</option>
                  <option value="Senior">Senior</option>
                </select>
                {errors.service_line && <p className="text-red-500 text-xs mt-1">{errors.service_line}</p>}
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
                    checked={formData.is_pwd}
                    onChange={(e) => setFormData({ ...formData, is_pwd: e.target.checked })}
                    className="h-4 w-4 text-[#2a9dab] focus:ring-[#2a9dab] border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Person with Disability (PWD)</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_4ps"
                    checked={formData.is_4ps}
                    onChange={(e) => setFormData({ ...formData, is_4ps: e.target.checked })}
                    className="h-4 w-4 text-[#2a9dab] focus:ring-[#2a9dab] border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">4Ps Beneficiary</label>
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={!formData.province}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                <select
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.barangay ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={!formData.city}
                >
                  <option value="">Select Barangay</option>
                  {barangays.map((barangay) => (
                    <option key={barangay} value={barangay}>{barangay}</option>
                  ))}
                </select>
                {errors.barangay && <p className="text-red-500 text-xs mt-1">{errors.barangay}</p>}
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
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="e.g., 09123456789, 02-1234567, 032-1234567"
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.contact_number ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                  value={formData.company}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.company ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Head</label>
                <input
                  type="text"
                  name="company_head"
                  value={formData.company_head}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.company_head ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.company_head && <p className="text-red-500 text-xs mt-1">{errors.company_head}</p>}
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditClientModal = ({ isOpen, onClose, onEdit, client }) => {
  const [formData, setFormData] = useState({
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
    is_pwd: false,
    is_4ps: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available options for dropdowns
  const provinces = getProvinces();
  const cities = getCities(formData.province);
  const barangays = getBarangays(formData.province, formData.city);

  useEffect(() => {
    if (client) {
      setFormData({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        age: client.age || '',
        gender: client.gender || '',
        province: client.province || '',
        city: client.city || '',
        barangay: client.barangay || '',
        contact_number: client.contact_number || '',
        email: client.email || '',
        company: client.company || '',
        industry_type: client.industry_type || '',
        service_line: client.service_line || '',
        company_head: client.company_head || '',
        is_pwd: client.is_pwd || false,
        is_4ps: client.is_4ps || false
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors = {};
    
    // Personal information validation
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.age || formData.age < 1 || formData.age > 120) newErrors.age = 'Please enter a valid age (1-120)';
    if (!formData.gender) newErrors.gender = 'Please select a gender';

    // Address validation
    if (!formData.province) newErrors.province = 'Please select a province';
    if (!formData.city) newErrors.city = 'Please select a city';
    if (!formData.barangay) newErrors.barangay = 'Please select a barangay';

    // Contact validation
    if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    
    // Philippine phone number validation
    const contactNumber = formData.contact_number.trim();
    if (contactNumber) {
      const digitsOnly = contactNumber.replace(/\D/g, '');
      const isMobile = /^09\d{9}$/.test(digitsOnly);
      const isLandlineMetro = /^02\d{8}$/.test(digitsOnly);
      const isLandlineProvince = /^0[3-9]\d{8}$/.test(digitsOnly);
      const isLandlineWithArea = /^[3-9]\d{8}$/.test(digitsOnly);
      
      if (!isMobile && !isLandlineMetro && !isLandlineProvince && !isLandlineWithArea) {
        newErrors.contact_number = 'Please enter a valid Philippine phone number';
      }
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Company validation
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.company_head.trim()) newErrors.company_head = 'Company head is required';
    if (!formData.industry_type.trim()) newErrors.industry_type = 'Industry type is required';
    if (!formData.service_line.trim()) newErrors.service_line = 'Service line is required';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Reset dependent fields when province or city changes
    if (name === 'province') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value, 
        city: '', 
        barangay: '' 
      }));
      setErrors(prev => ({ 
        ...prev, 
        city: null, 
        barangay: null 
      }));
    } else if (name === 'city') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value, 
        barangay: '' 
      }));
      setErrors(prev => ({ 
        ...prev, 
        barangay: null 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onEdit({
          id: client.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          age: parseInt(formData.age),
          gender: formData.gender,
          province: formData.province,
          city: formData.city,
          barangay: formData.barangay,
          contact_number: formData.contact_number,
          email: formData.email,
          company: formData.company,
          industry_type: formData.industry_type,
          service_line: formData.service_line,
          company_head: formData.company_head,
          is_pwd: formData.is_pwd,
          is_4ps: formData.is_4ps
        });
        onClose();
        toast.success('Client has been successfully updated!', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '16px',
            minWidth: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        });
      } catch (error) {
        setErrors({ submit: error.message });
        toast.error(error.message || 'Failed to update client', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '16px',
            minWidth: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Client</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errors.submit}
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
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                  min="1"
                  max="120"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <div className="flex gap-3 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      className="text-[#2a9dab] focus:ring-[#2a9dab]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      className="text-[#2a9dab] focus:ring-[#2a9dab]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Female</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === 'other'}
                      onChange={handleChange}
                      className="text-[#2a9dab] focus:ring-[#2a9dab]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Other</span>
                  </label>
                </div>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Industry</label>
                <select
                  name="industry_type"
                  value={formData.industry_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.industry_type ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {errors.industry_type && <p className="text-red-500 text-xs mt-1">{errors.industry_type}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Citizen Classification</label>
                <select
                  name="service_line"
                  value={formData.service_line}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.service_line ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Citizen Classification</option>
                  <option value="Student">Student</option>
                  <option value="Regular">Regular</option>
                  <option value="Senior">Senior</option>
                </select>
                {errors.service_line && <p className="text-red-500 text-xs mt-1">{errors.service_line}</p>}
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
                    checked={formData.is_pwd}
                    onChange={(e) => setFormData({ ...formData, is_pwd: e.target.checked })}
                    className="h-4 w-4 text-[#2a9dab] focus:ring-[#2a9dab] border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Person with Disability (PWD)</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_4ps"
                    checked={formData.is_4ps}
                    onChange={(e) => setFormData({ ...formData, is_4ps: e.target.checked })}
                    className="h-4 w-4 text-[#2a9dab] focus:ring-[#2a9dab] border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">4Ps Beneficiary</label>
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={!formData.province}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                <select
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.barangay ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={!formData.city}
                >
                  <option value="">Select Barangay</option>
                  {barangays.map((barangay) => (
                    <option key={barangay} value={barangay}>{barangay}</option>
                  ))}
                </select>
                {errors.barangay && <p className="text-red-500 text-xs mt-1">{errors.barangay}</p>}
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
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="e.g., 09123456789, 02-1234567, 032-1234567"
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.contact_number ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                  value={formData.company}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.company ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Head</label>
                <input
                  type="text"
                  name="company_head"
                  value={formData.company_head}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.company_head ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.company_head && <p className="text-red-500 text-xs mt-1">{errors.company_head}</p>}
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ViewClientModal = ({ isOpen, onClose, client, onEditClick }) => {
  if (!isOpen || !client) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Client Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <p className="text-sm text-gray-900 mt-1">{client.first_name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <p className="text-sm text-gray-900 mt-1">{client.last_name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <p className="text-sm text-gray-900 mt-1">{client.age || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{client.gender || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Province</label>
                <p className="text-sm text-gray-900 mt-1">{client.province || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <p className="text-sm text-gray-900 mt-1">{client.city || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Barangay</label>
                <p className="text-sm text-gray-900 mt-1">{client.barangay || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900 mt-1">{client.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <p className="text-sm text-gray-900 mt-1">{client.contact_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <p className="text-sm text-gray-900 mt-1">{client.company || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Head</label>
                <p className="text-sm text-gray-900 mt-1">{client.company_head || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Industry Type</label>
                <p className="text-sm text-gray-900 mt-1">{client.industry_type || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Citizen Classification</label>
                <p className="text-sm text-gray-900 mt-1">{client.service_line || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">PWD Status</label>
                <p className="text-sm text-gray-900 mt-1">{client.is_pwd ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">4Ps Beneficiary</label>
                <p className="text-sm text-gray-900 mt-1">{client.is_4ps ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              onEditClick(client);
              onClose();
            }}
            className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors"
          >
            Edit Client
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userLevelFilter, setUserLevelFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isViewClientModalOpen, setIsViewClientModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('employees'); // 'employees' or 'clients'
  const [isTableAnimating, setIsTableAnimating] = useState(false);
  
  // Confirmation dialog states
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [userToAction, setUserToAction] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    if (viewMode === 'employees') {
      fetchUsers();
    } else {
      fetchClients();
    }
  }, [viewMode]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, userLevelFilter, viewMode]);

  const fetchUsers = async () => {
    setIsTableAnimating(true);
    try {
      console.log('Fetching users...');
      const response = await apiService.getUsers();
      console.log('API Response:', response);
      
      if (response.data && response.data.records) {
        console.log('User data:', response.data.records);
        setUsers(response.data.records);
        setError(null); // Clear any previous errors
      } else {
        console.log('No records found in response:', response.data);
        setError('No users found');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
    }
  };

  const fetchClients = async () => {
    setIsTableAnimating(true);
    try {
      console.log('Fetching clients...');
      const response = await apiService.getClients();
      console.log('Clients API Response:', response);
      
      if (response.data && response.data.records) {
        console.log('Client data:', response.data.records);
        setClients(response.data.records);
        setError(null); // Clear any previous errors
      } else {
        console.log('No records found in response:', response.data);
        setError('No clients found');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError(error.response?.data?.message || 'Failed to fetch clients');
    }
  };





  const editUser = (user) => {
    setUserToAction(user);
    setShowEditConfirm(true);
  };

  const confirmEditUser = () => {
    setSelectedUser(userToAction);
    setIsEditModalOpen(true);
    setShowEditConfirm(false);
    setUserToAction(null);
  };

  const handleEditUser = async (updatedUser) => {
    try {
      console.log('Sending update data:', updatedUser); // Debug log
      
      const response = await apiService.updateUser({
        id: updatedUser.id,
        first_name: updatedUser.firstName,
        last_name: updatedUser.lastName,
        email: updatedUser.email,
        role: (updatedUser.userLevel || 'admin').toLowerCase(),
        status: Boolean(updatedUser.status)
      });

      console.log('Update response:', response); // Debug log

      if (response.data) {
        // Update the local state with the response from the server
        setUsers(users.map(user => 
          user.id === updatedUser.id 
            ? {
                ...user,
                fullname: `${response.data.first_name} ${response.data.last_name}`,
                email: response.data.email,
                userlvl: response.data.role,
                status: response.data.status
              }
            : user
        ));
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleEditClient = async (updatedClient) => {
    try {
      console.log('Sending client update data:', updatedClient); // Debug log
      
      const response = await apiService.updateClient({
        id: updatedClient.id,
        first_name: updatedClient.first_name,
        last_name: updatedClient.last_name,
        age: parseInt(updatedClient.age),
        gender: updatedClient.gender,
        province: updatedClient.province,
        city: updatedClient.city,
        barangay: updatedClient.barangay,
        contact_number: updatedClient.contact_number,
        email: updatedClient.email,
        company: updatedClient.company,
        industry_type: updatedClient.industry_type,
        service_line: updatedClient.service_line,
        company_head: updatedClient.company_head,
        is_pwd: updatedClient.is_pwd,
        is_4ps: updatedClient.is_4ps
      });

      console.log('Client update response:', response); // Debug log

      if (response.data && response.data.data) {
        // Update the local state with the response from the server
        const updatedData = response.data.data;
        setClients(clients.map(client => 
          client.id === updatedClient.id 
            ? {
                ...client,
                first_name: updatedData.first_name,
                last_name: updatedData.last_name,
                fullname: `${updatedData.first_name} ${updatedData.last_name}`,
                age: updatedData.age,
                gender: updatedData.gender,
                province: updatedData.province,
                city: updatedData.city,
                barangay: updatedData.barangay,
                email: updatedData.email,
                contact_number: updatedData.contact_number,
                company: updatedData.company,
                industry_type: updatedData.industry_type,
                service_line: updatedData.service_line,
                company_head: updatedData.company_head
              }
            : client
        ));
        setIsEditClientModalOpen(false);
        setSelectedClient(null);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      throw new Error(error.response?.data?.message || 'Failed to update client');
    }
  };

  const editClient = (client) => {
    setSelectedClient(client);
    setIsEditClientModalOpen(true);
  };

  const addUser = async (newUser) => {
    try {
      console.log('Sending user data:', newUser); // Debug log
      
      const response = await apiService.createUser({
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.userLevel.toLowerCase() // Convert to lowercase to match backend expectations
      });
      
      console.log('API Response:', response); // Debug log
      
      if (response.data) {
        // Create a new user object with the response data
        const createdUser = {
          id: response.data.id || Date.now(), // Fallback to timestamp if no ID
          fullname: `${response.data.first_name} ${response.data.last_name}`,
          email: response.data.email,
          userlvl: response.data.role,
          status: response.data.status
        };
        
        setUsers(prevUsers => [...prevUsers, createdUser]);
        return response.data; // Return the response data to trigger success modal
      }
    } catch (error) {
      console.error('Error creating user:', error.response || error); // Enhanced error logging
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const addClient = async (newClient) => {
    try {
      console.log('Sending client data:', newClient); // Debug log
      
      // Create the client profile directly (no user account needed)
      const clientData = {
        first_name: newClient.first_name,
        last_name: newClient.last_name,
        age: parseInt(newClient.age),
        gender: newClient.gender,
        province: newClient.province,
        city: newClient.city,
        barangay: newClient.barangay,
        contact_number: newClient.contact_number,
        email: newClient.email,
        company: newClient.company,
        industry_type: newClient.industry_type,
        service_line: newClient.service_line,
        company_head: newClient.company_head,
        password: newClient.password,
        is_pwd: newClient.is_pwd,
        is_4ps: newClient.is_4ps
      };
      
      console.log('Creating client profile:', clientData); // Debug log
      
      const clientRes = await apiService.createClient(clientData);
      
      console.log('Client creation response:', clientRes); // Debug log
      
      if (clientRes.data) {
        // Create a new client object with the response data
        const createdClient = {
          id: clientRes.data.id || Date.now(),
          client_id: clientRes.data.client_id || clientRes.data.id,
          fullname: `${newClient.first_name} ${newClient.last_name}`,
          email: newClient.email,
          contact_number: newClient.contact_number,
          company: newClient.company
        };
        
        setClients(prevClients => [...prevClients, createdClient]);
        return clientRes.data;
      }
    } catch (error) {
      console.error('Error creating client:', error.response || error);
      console.error('Error response data:', error.response?.data); // Debug log
      console.error('Error response status:', error.response?.status); // Debug log
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage && errorMessage.includes('Email already exists')) {
          throw new Error('A client with this email already exists. Please use a different email address.');
        } else if (errorMessage) {
          throw new Error(errorMessage);
        } else {
          throw new Error('Invalid data provided. Please check your input and try again.');
        }
      } else if (error.response?.status === 409) {
        throw new Error('A client with this email already exists. Please use a different email address.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to create client. Please try again.');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.status) ||
                         (statusFilter === 'inactive' && !user.status);
    const matchesUserLevel = userLevelFilter === 'all' || user.userlvl === userLevelFilter;
    return matchesSearch && matchesStatus && matchesUserLevel;
  });

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate pagination for employees
  const totalPagesEmployees = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndexEmployees = (currentPage - 1) * itemsPerPage;
  const endIndexEmployees = startIndexEmployees + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndexEmployees, endIndexEmployees);

  // Calculate pagination for clients
  const totalPagesClients = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndexClients = (currentPage - 1) * itemsPerPage;
  const endIndexClients = startIndexClients + itemsPerPage;
  const currentClients = filteredClients.slice(startIndexClients, endIndexClients);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = viewMode === 'employees' ? totalPagesEmployees : totalPagesClients;
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="p-6 bg-gray-100 h-full">
      <Toaster />
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
          {viewMode === 'employees' ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors"
            >
              Add User
            </button>
          ) : (
            <button
              onClick={() => setIsAddClientModalOpen(true)}
              className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors"
            >
              Add Client
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-4 items-center">
          {/* Toggle between Clients and Employees */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('employees')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'employees'
                  ? 'bg-[#2a9dab] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setViewMode('clients')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'clients'
                  ? 'bg-[#2a9dab] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              Clients
            </button>
          </div>
          
          <div className="flex-1">
            <input
              type="text"
              placeholder={viewMode === 'employees' ? "Search users..." : "Search clients..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors"
            />
          </div>
          {viewMode === 'employees' && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={userLevelFilter}
                onChange={(e) => setUserLevelFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors"
              >
                <option value="all">All User Levels</option>
                <option value="admin">Admin</option>
                <option value="calibration_engineers">Calibration Engineers</option>
                <option value="it_programmer">IT Programmer</option>
              </select>
            </>
          )}
        </div>

        <div className={isTableAnimating ? "overflow-hidden" : "overflow-auto"}>
          {viewMode === 'employees' ? (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  {viewMode === 'employees' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user, index) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onAnimationComplete={() => {
                      if (index === currentUsers.length - 1) {
                        setIsTableAnimating(false);
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{capitalizeName(user.fullname)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    {viewMode === 'employees' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.userlvl === 'admin' ? 'Admin' :
                           user.userlvl === 'calibration_engineers' ? 'Calibration Engineers' :
                           user.userlvl === 'it_programmer' ? 'IT Programmer' : user.userlvl}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">{user.contact_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.company}</td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => editUser(user)}
                          className="px-3 py-1 rounded text-xs font-semibold focus:outline-none transition-colors duration-200 border bg-[#2a9dab]/20 text-[#2a9dab] border-[#2a9dab]/30 hover:bg-[#2a9dab]/30"
                        >
                          Edit User
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentClients.map((client, index) => (
                  <motion.tr 
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onAnimationComplete={() => {
                      if (index === currentClients.length - 1) {
                        setIsTableAnimating(false);
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{capitalizeName(client.fullname)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.contact_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => { setSelectedClient(client); setIsViewClientModalOpen(true); }}
                        className="px-3 py-1 rounded text-xs font-semibold focus:outline-none transition-colors duration-200 border bg-[#2a9dab]/20 text-[#2a9dab] border-[#2a9dab]/30 hover:bg-[#2a9dab]/30"
                      >
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Controls */}
        {viewMode === 'employees' && filteredUsers.length > itemsPerPage && (
          <div className="mt-4 w-full flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2a9dab] text-white hover:bg-[#238a91]'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPagesEmployees}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPagesEmployees}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentPage === totalPagesEmployees
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2a9dab] text-white hover:bg-[#238a91]'
                }`}
              >
                Next
              </button>
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPagesEmployees }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentPage === page
                      ? 'bg-[#2a9dab] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Showing {startIndexEmployees + 1}-{Math.min(endIndexEmployees, filteredUsers.length)} of {filteredUsers.length} results
            </div>
          </div>
        )}
        
        {viewMode === 'clients' && filteredClients.length > itemsPerPage && (
          <div className="mt-4 w-full flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2a9dab] text-white hover:bg-[#238a91]'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPagesClients}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPagesClients}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentPage === totalPagesClients
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2a9dab] text-white hover:bg-[#238a91]'
                }`}
              >
                Next
              </button>
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPagesClients }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentPage === page
                      ? 'bg-[#2a9dab] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Showing {startIndexClients + 1}-{Math.min(endIndexClients, filteredClients.length)} of {filteredClients.length} results
            </div>
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addUser}
      />

      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onAdd={addClient}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onEdit={handleEditUser}
        user={selectedUser}
      />

      <EditClientModal
        isOpen={isEditClientModalOpen}
        onClose={() => {
          setIsEditClientModalOpen(false);
          setSelectedClient(null);
        }}
        onEdit={handleEditClient}
        client={selectedClient}
      />

      <ViewClientModal
        isOpen={isViewClientModalOpen}
        onClose={() => setIsViewClientModalOpen(false)}
        client={selectedClient}
        onEditClick={editClient}
      />

      {/* Edit User Confirmation Dialog */}
      {showEditConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Edit User</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to edit user "{userToAction?.fullname}"?
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditConfirm(false);
                  setUserToAction(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmEditUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

export default Users;