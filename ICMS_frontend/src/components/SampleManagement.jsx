import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSaveLine, RiCloseLine, RiArrowDownSLine, RiArrowRightSLine, RiPriceTag3Line } from 'react-icons/ri';
import ConfirmationModal from './ConfirmationModal';

const SampleManagement = () => {
    const [pricing, setPricing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const [currentView, setCurrentView] = useState('categories'); // 'categories', 'details'
    const [selectedSection, setSelectedSection] = useState(null);
    const [formData, setFormData] = useState({
        section: '',
        type: '',
        range: '',
        price: '',
        is_active: true
    });
    const [formErrors, setFormErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        loadPricing();
    }, []);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && (isAddingNew || editingId)) {
                resetForm();
            }
        };
        
        if (isAddingNew || editingId) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isAddingNew, editingId]);

    const loadPricing = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('No authentication token found. Please login again.');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:8000/api/settings/sample_pricing.php', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setPricing(data.data);
            } else {
                console.error('API Error:', data);
                if (response.status === 401) {
                    toast.error('Authentication failed. Please login again.');
                } else if (response.status === 500) {
                    toast.error('Server error: ' + (data.message || 'Unknown error'));
                } else {
                    toast.error('Failed to load sample pricing: ' + (data.message || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Error loading pricing:', error);
            toast.error('Network error loading sample pricing');
        } finally {
            setLoading(false);
        }
    };

    const groupedPricing = pricing.reduce((acc, item) => {
        if (!acc[item.section]) {
            acc[item.section] = [];
        }
        acc[item.section].push(item);
        return acc;
    }, {});

    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditingId(null);
        setFormData({
            section: '',
            type: '',
            range: '',
            price: '',
            is_active: true
        });
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setIsAddingNew(false);
        setFormData({
            section: item.section,
            type: item.type,
            range: item.range,
            price: item.price,
            is_active: item.is_active
        });
    };

    const handleSave = async () => {
        // Validation
        const errors = {};
        
        if (!formData.section.trim()) {
            errors.section = 'Please select a section';
        }
        
        if (!formData.type.trim()) {
            errors.type = 'Please enter a sample type';
        }
        
        if (!formData.range.trim()) {
            errors.range = 'Please enter specifications/range';
        }
        
        if (!formData.price || parseFloat(formData.price) <= 0) {
            errors.price = 'Please enter a valid price greater than 0';
        }

        // If there are validation errors, set them and return
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error('Please fix the validation errors');
            return;
        }

        // Clear any existing errors
        setFormErrors({});

        // Show confirmation modal
        setShowConfirmation(true);
    };

    const handleConfirmSave = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('No authentication token found. Please login again.');
                return;
            }

            const url = editingId 
                ? `http://localhost:8000/api/settings/sample_pricing.php?id=${editingId}`
                : 'http://localhost:8000/api/settings/sample_pricing.php';
            
            const method = editingId ? 'PUT' : 'POST';

            // Include id in request body for PUT requests
            const requestData = editingId 
                ? { ...formData, id: editingId }
                : formData;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                toast.success(editingId ? 'Pricing updated successfully!' : 'Pricing added successfully!');
                loadPricing();
                resetForm();
                setShowConfirmation(false);
            } else {
                console.error('API Error:', data);
                toast.error('Failed to save pricing: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving pricing:', error);
            toast.error('Network error saving pricing');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const item = pricing.find(p => p.id === id);
        setItemToDelete(item);
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('No authentication token found. Please login again.');
                return;
            }

            const response = await fetch(`http://localhost:8000/api/settings/sample_pricing.php?id=${itemToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                toast.success('Pricing deleted successfully!');
                loadPricing();
                setShowDeleteConfirmation(false);
                setItemToDelete(null);
            } else {
                console.error('API Error:', data);
                toast.error('Failed to delete pricing: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting pricing:', error);
            toast.error('Network error deleting pricing');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setIsAddingNew(false);
        setFormData({
            section: '',
            type: '',
            range: '',
            price: '',
            is_active: true
        });
        setFormErrors({});
        setShowConfirmation(false);
        setShowDeleteConfirmation(false);
        setItemToDelete(null);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleSectionClick = (section) => {
        setSelectedSection(section);
        setCurrentView('details');
    };

    const handleBack = () => {
        setCurrentView('categories');
        setSelectedSection(null);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 h-full overflow-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                            <RiPriceTag3Line className="w-5 h-5 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-800">Sample Pricing Management</h1>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 transition-colors"
                    >
                        <RiAddLine className="w-4 h-4" />
                        Add New Pricing
                    </button>
                </div>

                {/* Navigation */}
                {currentView !== 'categories' && (
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 transition-colors font-medium"
                        >
                            <RiArrowRightSLine className="w-5 h-5 rotate-180" />
                            <span className="font-medium">Back</span>
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {selectedSection} Pricing Details
                        </h2>
                    </div>
                )}

                {/* Main Content */}
                {currentView === 'categories' && (
                    <div className="space-y-3">
                        {Object.entries(groupedPricing).map(([section, items]) => (
                            <button
                                key={section}
                                onClick={() => handleSectionClick(section)}
                                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                        <RiPriceTag3Line className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-gray-800 group-hover:text-gray-600 transition-colors">
                                            {section}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {items.length} {items.length === 1 ? 'pricing item' : 'pricing items'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        ₱{items.reduce((sum, item) => sum + parseFloat(item.price), 0).toLocaleString()}
                                    </span>
                                    <RiArrowRightSLine className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {currentView === 'details' && selectedSection && (
                    <div className="space-y-4">
                        {/* Pricing Table */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Sample Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Specifications
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {groupedPricing[selectedSection]?.map((item, index) => (
                                            <tr key={item.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex items-center">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                        {item.type}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div className="max-w-xs">
                                                        <div className="text-xs text-gray-500 mb-1">Specifications:</div>
                                                        <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                            {item.range}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    <span className="text-lg font-bold text-green-600">
                                                        ₱{parseFloat(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors border border-blue-200"
                                                            title="Edit pricing"
                                                        >
                                                            <RiEditLine className="w-3 h-3" />
                                                            <span className="text-xs">Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors border border-red-200"
                                                            title="Delete pricing"
                                                        >
                                                            <RiDeleteBinLine className="w-3 h-3" />
                                                            <span className="text-xs">Delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {pricing.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <RiPriceTag3Line className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing configurations found</h3>
                        <p className="text-gray-500 mb-4">Get started by adding your first pricing configuration</p>
                        <button
                            onClick={handleAddNew}
                            className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 transition-colors"
                        >
                            Add First Pricing Configuration
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Form Modal */}
            {(isAddingNew || editingId) && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            resetForm();
                        }
                    }}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-semibold text-gray-800">
                                    {editingId ? 'Edit Pricing' : 'Add New Pricing'}
                                </h4>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Close"
                                >
                                    <RiCloseLine className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.section}
                                onChange={(e) => handleInputChange('section', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                    formErrors.section ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select Section</option>
                                <option value="Weighing Scale">Weighing Scale</option>
                                <option value="Test-Weights">Test-Weights</option>
                                <option value="Thermometer">Thermometer</option>
                                <option value="Sphygmomanometer">Sphygmomanometer</option>
                                <option value="Thermohygrometer">Thermohygrometer</option>
                            </select>
                            {formErrors.section && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.section}</p>
                            )}
                        </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sample Type <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.type}
                                        onChange={(e) => handleInputChange('type', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                            formErrors.type ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g., Ordinary III (Nawi)"
                                    />
                                    {formErrors.type && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.type}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specifications/Range <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.range}
                                        onChange={(e) => handleInputChange('range', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                            formErrors.range ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g., Ordinary III (Nawi)"
                                    />
                                    {formErrors.range && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.range}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (₱) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                            formErrors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="0.00"
                                    />
                                    {formErrors.price && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                                
                                <div className="flex gap-3 ml-auto">
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 transition-colors"
                                    >
                                        <RiSaveLine className="w-4 h-4" />
                                        Save
                                    </button>
                                    <button
                                        onClick={resetForm}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <RiCloseLine className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmSave}
                title={editingId ? "Confirm Pricing Update" : "Confirm New Pricing"}
                message={editingId 
                    ? "Are you sure you want to update this pricing configuration?"
                    : "Are you sure you want to add this new pricing configuration?"
                }
                type="info"
                confirmText={isSubmitting ? (editingId ? "Updating..." : "Adding...") : (editingId ? "Update Pricing" : "Add Pricing")}
                cancelText="Cancel"
                isLoading={isSubmitting}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteConfirmation}
                onClose={() => {
                    setShowDeleteConfirmation(false);
                    setItemToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this pricing configuration?"
                type="warning"
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default SampleManagement;