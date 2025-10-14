import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiUserLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';
import { MdInfo, MdWarning, MdError, MdCheckCircle } from 'react-icons/md';
import { apiService } from '../services/api';

const SignatoryManagement = () => {
  const navigate = useNavigate();
  const [signatories, setSignatories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSignatory, setEditingSignatory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'confirm', // 'confirm', 'error', 'success'
    onConfirm: null,
    onCancel: null
  });
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    role: 'technical_manager',
    customRole: '',
    is_active: true
  });

  useEffect(() => {
    fetchSignatories();
  }, []);

  const showConfirmationModal = (message, title = 'Confirm Action', type = 'confirm', onConfirm = null, onCancel = null) => {
    setConfirmationModal({
      show: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setConfirmationModal(prev => ({ ...prev, show: false }))),
      onCancel: onCancel || (() => setConfirmationModal(prev => ({ ...prev, show: false })))
    });
  };

  const fetchSignatories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSignatories();
      if (response.data.success) {
        setSignatories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching signatories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return; // Prevent double submission
    
    // Validation
    if (!formData.name.trim()) {
      showConfirmationModal('Please enter a name for the signatory.', 'Validation Error', 'error');
      return;
    }
    
    if (!formData.title.trim()) {
      showConfirmationModal('Please enter a title for the signatory.', 'Validation Error', 'error');
      return;
    }
    
    // Validate custom role if "Other" is selected
    if (formData.role === 'other' && !formData.customRole.trim()) {
      showConfirmationModal('Please enter a custom role name.', 'Validation Error', 'error');
      return;
    }
    
    // Additional validation for technical manager
    if (formData.role === 'technical_manager' && formData.is_active) {
      const existingActiveTM = signatories.find(s => 
        s.role === 'technical_manager' && s.is_active && s.id !== editingSignatory?.id
      );
      
      if (existingActiveTM) {
        const confirmMessage = `There is already an active technical manager: "${existingActiveTM.name}".\n\nSetting this signatory as active will deactivate the current technical manager. Continue?`;
        showConfirmationModal(
          confirmMessage,
          'Confirm Technical Manager Change',
          'confirm',
          () => {
            setConfirmationModal(prev => ({ ...prev, show: false }));
            proceedWithSubmit();
          },
          () => setConfirmationModal(prev => ({ ...prev, show: false }))
        );
        return;
      }
    }
    
    // Confirmation for updates
    if (editingSignatory) {
      const confirmMessage = `Are you sure you want to update "${editingSignatory.name}"?\n\nThis will change the signatory information and may affect certificate generation.`;
      showConfirmationModal(
        confirmMessage,
        'Confirm Update',
        'confirm',
        () => {
          setConfirmationModal(prev => ({ ...prev, show: false }));
          proceedWithSubmit();
        },
        () => setConfirmationModal(prev => ({ ...prev, show: false }))
      );
      return;
    }
    
    proceedWithSubmit();
  };

  const proceedWithSubmit = async () => {
    
    setSubmitting(true);
    try {
      // Prepare data for API
      const submitData = {
        name: formData.name,
        title: formData.title,
        role: formData.role === 'other' ? formData.customRole : formData.role,
        is_active: formData.is_active
      };
      
      if (editingSignatory) {
        await apiService.updateSignatory(editingSignatory.id, submitData);
      } else {
        await apiService.createSignatory(submitData);
      }
      await fetchSignatories();
      setShowModal(false);
      setEditingSignatory(null);
      setFormData({ name: '', title: '', role: 'technical_manager', customRole: '', is_active: true });
    } catch (error) {
      console.error('Error saving signatory:', error);
      showConfirmationModal('Error saving signatory. Please try again.', 'Error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (signatory) => {
    setEditingSignatory(signatory);
    const isCustomRole = signatory.role !== 'technical_manager';
    setFormData({
      name: signatory.name,
      title: signatory.title,
      role: isCustomRole ? 'other' : signatory.role,
      customRole: isCustomRole ? signatory.role : '',
      is_active: signatory.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const signatory = signatories.find(s => s.id === id);
    if (!signatory) return;
    
    const confirmMessage = `Are you sure you want to delete "${signatory.name}"?\n\nThis action cannot be undone and may affect certificate generation if this is the active technical manager.`;
    
    showConfirmationModal(
      confirmMessage,
      'Confirm Delete',
      'confirm',
      async () => {
        setConfirmationModal(prev => ({ ...prev, show: false }));
        try {
          await apiService.deleteSignatory(id);
          await fetchSignatories();
        } catch (error) {
          console.error('Error deleting signatory:', error);
          showConfirmationModal('Error deleting signatory. Please try again.', 'Error', 'error');
        }
      },
      () => setConfirmationModal(prev => ({ ...prev, show: false }))
    );
  };

  const handleAddNew = () => {
    setEditingSignatory(null);
    setFormData({ name: '', title: '', role: 'technical_manager', customRole: '', is_active: true });
    setShowModal(true);
  };

  const handleBackToSettings = () => {
    localStorage.setItem('reopenSettings', '1'); // Flag to reopen settings modal
    navigate('/dashboard'); // Navigate back to dashboard where settings modal will auto-open
  };

  const getRoleDisplayName = (role) => {
    if (role === 'technical_manager') {
      return 'Technical Manager';
    }
    return role; // For custom roles, display the actual role name
  };

  const getRoleColor = (role) => {
    if (role === 'technical_manager') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'; // For custom roles
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back and Add buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center ml-8">
          <button
            onClick={handleBackToSettings}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a9dab] text-white hover:bg-[#217a8c] rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Signatory Management</h2>
        </div>
        
        <div className="flex items-center mr-8">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-sm hover:shadow-md"
          >
            <RiAddLine className="w-5 h-5" />
            Add Signatory
          </button>
        </div>
      </div>

      {/* Signatories List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {signatories.map((signatory) => (
                <tr key={signatory.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <RiUserLine className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {signatory.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {signatory.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(signatory.role)}`}>
                      {getRoleDisplayName(signatory.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      signatory.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {signatory.is_active ? (
                        <>
                          <RiCheckLine className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <RiCloseLine className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(signatory)}
                        className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                        title="Edit signatory"
                      >
                        <RiEditLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(signatory.id)}
                        className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        title="Delete signatory"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingSignatory ? 'Edit Signatory' : 'Add New Signatory'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, customRole: e.target.value === 'other' ? formData.customRole : '' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="technical_manager">Technical Manager</option>
                  <option value="other">Other (Custom)</option>
                </select>
              </div>
              
              {formData.role === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Role Name
                  </label>
                  <input
                    type="text"
                    value={formData.customRole}
                    onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                    placeholder="Enter custom role name (e.g., Quality Manager, Lab Director)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 rounded-xl transition-all duration-200 font-semibold shadow-lg flex items-center gap-2 ${
                    submitting 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50' 
                      : 'bg-[#2a9dab] text-white hover:bg-[#238a91] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2a9dab] hover:shadow-md transform hover:-translate-y-0.5'
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingSignatory ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingSignatory ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-2 border-blue-200 dark:border-blue-700">
                {confirmationModal.type === 'error' ? (
                  <MdError className="w-6 h-6 text-red-500" />
                ) : confirmationModal.type === 'success' ? (
                  <MdCheckCircle className="w-6 h-6 text-[#2a9dab]" />
                ) : (
                  <MdInfo className="w-6 h-6 text-[#2a9dab]" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-6">
                  {confirmationModal.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {confirmationModal.message}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={confirmationModal.onCancel}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmationModal.onConfirm}
                className={`px-6 py-2.5 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  confirmationModal.type === 'error' 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                    : 'bg-[#2a9dab] hover:bg-[#238a91] focus:ring-[#2a9dab]'
                }`}
              >
                {confirmationModal.type === 'error' ? 'OK' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatoryManagement;
