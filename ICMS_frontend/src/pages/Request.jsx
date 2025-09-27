import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import api, { apiService } from '../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-datepicker.css';
import { getProvinces, getCities, getBarangays } from '../data/philippineLocations';
import { FaRegCalendarAlt } from 'react-icons/fa';
import '../styles/no-scrollbar.css';
import { extractPdfTextFromFile, parsePdfFields } from '../utils/pdfUtils';

const CustomDateInput = React.forwardRef(({ value, onClick, onClear, placeholder }, ref) => (
  <div className="relative w-full">
    <input
      type="text"
      readOnly
      value={value || ''}
      onClick={onClick}
      ref={ref}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full px-10 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] cursor-pointer"
      style={{ backgroundImage: 'none' }}
    />
    <FaRegCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
));

const ConfirmCancelModal = ({ isOpen, onConfirm, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg p-6 w-96"
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Cancellation</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to cancel the request?</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                        Confirm
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const ClientInfoModal = ({ isOpen, onClose, onConfirm, clientInfo, onClientInfoChange }) => {
    console.log('ClientInfoModal render - isOpen:', isOpen, 'clientInfo:', clientInfo);
    console.log('ClientInfoModal - clientInfo.email:', clientInfo?.email);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto"
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Client Information</h2>
                <p className="text-gray-600 mb-6">Please review and complete the client information extracted from the PDF:</p>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={clientInfo.name || ''}
                                onChange={(e) => onClientInfoChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                                placeholder="Enter client name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                            <input
                                type="text"
                                value={clientInfo.contact_number || ''}
                                onChange={(e) => onClientInfoChange('contact_number', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                                placeholder="Enter contact number"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={clientInfo.email || ''}
                            onChange={(e) => onClientInfoChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                            placeholder="Enter email address"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                            type="text"
                            value={clientInfo.company || ''}
                            onChange={(e) => onClientInfoChange('company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                            placeholder="Enter company name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Province</label>
                                <select
                                    value={clientInfo.province || ''}
                                    onChange={(e) => onClientInfoChange('province', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] text-sm"
                                >
                                    <option value="">Select Province</option>
                                    {getProvinces().map((prov) => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">City/Municipality</label>
                                <select
                                    value={clientInfo.city || ''}
                                    onChange={(e) => onClientInfoChange('city', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] text-sm"
                                    disabled={!clientInfo.province}
                                >
                                    <option value="">Select City/Municipality</option>
                                    {getCities(clientInfo.province).map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Barangay</label>
                                <select
                                    value={clientInfo.barangay || ''}
                                    onChange={(e) => onClientInfoChange('barangay', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] text-sm"
                                    disabled={!clientInfo.province || !clientInfo.city}
                                >
                                    <option value="">Select Barangay</option>
                                    {getBarangays(clientInfo.province, clientInfo.city).map((brgy) => (
                                        <option key={brgy} value={brgy}>{brgy}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#238a96] font-medium"
                    >
                        Continue with Request
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const ConfirmEditModal = ({ isOpen, onConfirm, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg p-6 w-96"
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Edit</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to save these changes?</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Confirm
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const ConfirmSubmitModal = ({ isOpen, onConfirm, onClose, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg p-6 w-96"
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Submission</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to submit this request? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#217a8c] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Choice modal for Add Request
const AddRequestChoiceModal = ({ isOpen, onClose, onChooseAttach, onChooseAddNew }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Request</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>
        <p className="text-sm text-gray-600 mb-6">Choose how you want to proceed.</p>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={onChooseAttach}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-[#2a9dab] hover:bg-[#e0f7fa] text-gray-800 font-medium text-left"
          >
            Attach a file
            <span className="block text-xs text-gray-500">Upload a document related to your request</span>
          </button>
          <button
            onClick={onChooseAddNew}
            className="w-full px-4 py-3 rounded-lg bg-[#2a9dab] text-white hover:bg-[#217a8c] font-medium text-left"
          >
            Add New Request
            <span className="block text-xs opacity-90">Fill out the request form</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const FilePreviewModal = ({ isOpen, file, url, onConfirm, onClose }) => {
  if (!isOpen || !file) return null;

  const isImage = file.type && file.type.startsWith('image/');
  const isPdf = (file.type && file.type === 'application/pdf') || (file.name && file.name.toLowerCase().endsWith('.pdf'));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] border border-gray-200 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Preview Attachment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>
        <div className="flex-1 overflow-auto no-scrollbar rounded-lg border bg-gray-50">
          {isImage && (
            <img src={url} alt={file.name} className="w-auto max-w-full max-h-[75vh] mx-auto object-contain" />
          )}
          {isPdf && (
            <iframe src={url} title="File preview" className="w-full h-[75vh]" scrolling="no" />
          )}
          {!isImage && !isPdf && (
            <div className="p-6 text-center text-gray-600">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm mt-1">Preview not available. You can open the file to verify.</p>
              <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-block px-3 py-2 rounded bg-[#2a9dab] text-white hover:bg-[#217a8c]">Open file</a>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#217a8c] font-medium">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const AddSampleDetailsModal = ({ isOpen, onClose, onConfirm, fileName, isSubmitting }) => {
  const sectionOptions = [
    'Volume Standards',
    'Mass Standards',
    'Calibration of Non-Automatic Weighing Instrument',
    'Length Standards',
    'Thermometer and Hygrometer Standards', 'Pressure Standard'
  ];
  const defaultTypeOptions = ['Weighing Scale', 'Thermometer', 'Thermohygrometer', 'Test Weights', 'Sphygmomanometer'];
  const volumeTypeOptions = ['Proving Tanks', 'Test Measure', 'Fuel Dispensing Pump', 'Road Tankers'];
  const defaultRangeOptions = ['0-10kg', '10-50kg', '50-100kg', '100-500kg', 'Other'];
  const provingTankRangeOptions = ['100L to 400L', '500L to 2000L', '2500L to 4000L'];
  const testMeasureRangeOptions = ['70L'];
  const fuelDispensingPumpRangeOptions = ['Per Muzzle'];
  const roadTankerRangeOptions = [
    '5000L and below',
    '6000 to 10000L',
    '11000L to 15000L',
    '16000 to 20000L',
    '21000 to 25000L',
    '26000 to 30000L',
    '31000 to 35000L',
    '36000 to 40000L',
    '41000 to 45000L',
    '46000 to 50000L'
  ];
  const massStandardTypeOptions = ['OIML F2', 'OIML Class M1/M2/M3'];
  const oimlF2RangeOptions = ['1kg to 10kg', '10kg to 20kg', '20kg to 50kg'];

  const emptyRow = { section: '', type: '', range: '', serialNo: '', price: '', basePrice: '' };
  const [rows, setRows] = React.useState([emptyRow]);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = React.useState(false);
  const [rowIndexToRemove, setRowIndexToRemove] = React.useState(null);

  const handleRowChange = (rowIndex, field, value) => {
    setRows(prevRows => {
      const current = prevRows[rowIndex];
      let updated = { ...current, [field]: value };
      if (updated.type === 'Proving Tanks' && field === 'range') {
        if (value === '100L to 400L') updated.basePrice = 1500;
        else if (value === '500L to 2000L') updated.basePrice = 5000;
        else if (value === '2500L to 4000L') updated.basePrice = 4000;
        else updated.basePrice = '';
        updated.price = updated.basePrice ? updated.basePrice.toLocaleString() : '';
      }
      if (field === 'type' && value !== 'Proving Tanks' && current.type === 'Proving Tanks') {
        updated.price = '';
        updated.basePrice = '';
        updated.range = '';
      }
      if (updated.type === 'Test Measure' && field === 'range') {
        if (value === '70L') updated.basePrice = 500;
        else updated.basePrice = '';
        updated.price = updated.basePrice ? updated.basePrice.toLocaleString() : '';
      }
      if (field === 'type' && value !== 'Test Measure' && current.type === 'Test Measure') {
        updated.price = '';
        updated.basePrice = '';
        updated.range = '';
      }
      if (updated.type === 'Fuel Dispensing Pump' && field === 'range') {
        if (value === 'Per Muzzle') updated.basePrice = 700;
        else updated.basePrice = '';
        updated.price = updated.basePrice ? updated.basePrice.toLocaleString() : '';
      }
      if (field === 'type' && value !== 'Fuel Dispensing Pump' && current.type === 'Fuel Dispensing Pump') {
        updated.price = '';
        updated.basePrice = '';
        updated.range = '';
      }
      if (updated.type === 'Road Tankers' && field === 'range') {
        if (value === '5000L and below') updated.basePrice = 1000;
        else if (value === '6000 to 10000L') updated.basePrice = 1500;
        else if (value === '11000L to 15000L') updated.basePrice = 2000;
        else if (value === '16000 to 20000L') updated.basePrice = 2500;
        else if (value === '21000 to 25000L') updated.basePrice = 3000;
        else if (value === '26000 to 30000L') updated.basePrice = 3500;
        else if (value === '31000 to 35000L') updated.basePrice = 4000;
        else if (value === '36000 to 40000L') updated.basePrice = 4500;
        else if (value === '41000 to 45000L') updated.basePrice = 5000;
        else if (value === '46000 to 50000L') updated.basePrice = 5500;
        else updated.basePrice = '';
        updated.price = updated.basePrice ? updated.basePrice.toLocaleString() : '';
      }
      if (field === 'type' && value !== 'Road Tankers' && current.type === 'Road Tankers') {
        updated.price = '';
        updated.basePrice = '';
        updated.range = '';
      }
      if (updated.type === 'OIML F2' && field === 'range') {
        if (value === '1kg to 10kg') updated.basePrice = 600;
        else if (value === '10kg to 20kg') updated.basePrice = 800;
        else if (value === '20kg to 50kg') updated.basePrice = 1000;
        else updated.basePrice = '';
        updated.price = updated.basePrice ? updated.basePrice.toLocaleString() : '';
      }
      if (field === 'type' && value !== 'OIML F2' && current.type === 'OIML F2') {
        updated.price = '';
        updated.basePrice = '';
        updated.range = '';
      }
      const next = [...prevRows];
      next[rowIndex] = updated;
      return next;
    });
  };

  const handleAddRow = () => {
    setRows(prev => [...prev, { ...emptyRow }]);
  };

  const handleSave = () => {
    const serials = rows
      .map(r => (r.serialNo || '').trim().toLowerCase())
      .filter(s => s.length > 0);
    if (serials.length !== new Set(serials).size) {
      toast.error('Duplicate sample codes found. Each sample must have a unique sample code.');
      return;
    }
    onConfirm(rows);
  };

  const handlePromptRemoveRow = (index) => {
    const row = rows[index];
    const isEmpty = !row.section && !row.type && !row.range && !row.serialNo && !row.price && !row.basePrice;
    if (isEmpty) {
      setRows(prev => {
        const next = prev.filter((_, i) => i !== index);
        return next.length > 0 ? next : [{ ...emptyRow }];
      });
      return;
    }
    setRowIndexToRemove(index);
    setIsRemoveConfirmOpen(true);
  };

  const handleConfirmRemoveRow = () => {
    setRows(prev => {
      if (rowIndexToRemove === null || rowIndexToRemove === undefined) return prev;
      const next = prev.filter((_, i) => i !== rowIndexToRemove);
      return next.length > 0 ? next : [{ ...emptyRow }];
    });
    setRowIndexToRemove(null);
    setIsRemoveConfirmOpen(false);
  };

  const handleCancelRemoveRow = () => {
    setRowIndexToRemove(null);
    setIsRemoveConfirmOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Sample Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>
        <div className="space-y-2 mb-4">
          {fileName && (
            <p className="text-sm text-gray-600 mb-4">Attached file: <span className="font-medium">{fileName}</span></p>
          )}
        </div>
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-[3fr_2fr_2fr_2fr_minmax(120px,_1fr)_auto] gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Sample</label>
                <input
                  type="text"
                  value={row.section}
                  onChange={e => handleRowChange(index, 'section', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Sample"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type of Sample</label>
                <input
                  type="text"
                  value={row.type}
                  onChange={e => handleRowChange(index, 'type', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Type of Sample"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Range/Capacity</label>
                <input
                  type="text"
                  value={row.range}
                  onChange={e => handleRowChange(index, 'range', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Range/Capacity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sample Code</label>
                <input
                  type="text"
                  value={row.serialNo}
                  onChange={e => handleRowChange(index, 'serialNo', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Sample Code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <div className="mt-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 font-semibold">{row.price || '0.00'}</div>
              </div>
              <div className="flex items-end justify-end">
                {rows.length > 1 ? (
                  <button
                    onClick={() => handlePromptRemoveRow(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700"
                    aria-label="Remove sample"
                  >
                    ✕
                  </button>
                ) : (
                  <span className="px-3 py-2 text-transparent select-none">✕</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleAddRow} className="mt-3 text-sm text-blue-600 hover:text-blue-800">+ Add another sample</button>
        {isRemoveConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
            <div className="bg-white rounded-xl p-5 w-full max-w-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Remove sample?</h3>
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to remove this sample row?</p>
              <div className="flex justify-end gap-3">
                <button onClick={handleCancelRemoveRow} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button onClick={handleConfirmRemoveRow} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Remove</button>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
          <button onClick={handleSave} disabled={isSubmitting} className={`px-4 py-2 rounded-lg font-medium text-white ${isSubmitting ? 'bg-[#2a9dab]/60 cursor-not-allowed' : 'bg-[#2a9dab] hover:bg-[#217a8c]'}`}>{isSubmitting ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

const AddReservationModal = ({ isOpen, onClose, clients, onAdd, reservationData }) => {
  const { user } = useAuth();
  const isEditMode = !!reservationData;

  const initialClientInfo = {
    id: null,
    name: '',
    contact_number: '',
    email: '',
    industry_type: '',
    company: '',
    company_head: '',
  };
  const initialEquipments = [{ id: Date.now(), section: '', type: '', range: '', serialNo: '', serialNumbers: [''], qty: 1, price: '0.00', basePrice: '' }];

  const [equipments, setEquipments] = useState(initialEquipments);
  const [clientInfo, setClientInfo] = useState(initialClientInfo);
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(null);
  const [isExpectedCompletionManuallySet, setIsExpectedCompletionManuallySet] = useState(false);

  // Auto-set expected completion date to 1 week from scheduled date
  useEffect(() => {
    if (scheduledDate && !isExpectedCompletionManuallySet) {
      const oneWeekLater = new Date(scheduledDate);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      setExpectedCompletionDate(oneWeekLater);
    }
  }, [scheduledDate, isExpectedCompletionManuallySet]);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && reservationData) {
      // Pre-fill form for editing
      const client = clients.find(c => c.id === reservationData.client_id);
      setClientInfo({
        id: reservationData.client_id,
        name: reservationData.client_name || '',
        contact_number: reservationData.client_contact || '',
        email: reservationData.client_email || '',
        industry_type: client?.industry_type || '',
        company: reservationData.client_company || '',
        company_head: client?.company_head || '',
      });

      const addressParts = reservationData.address ? reservationData.address.split(', ').reverse() : [];
      setProvince(addressParts[0] || '');
      setCity(addressParts[1] || '');
      setBarangay(addressParts[2] || '');
      
      setScheduledDate(reservationData.date_scheduled ? new Date(reservationData.date_scheduled) : new Date());
      setExpectedCompletionDate(reservationData.date_expected_completion ? new Date(reservationData.date_expected_completion) : null);
      setIsExpectedCompletionManuallySet(true); // Mark as manually set when editing
      
      setEquipments(reservationData.sample.map(eq => ({
        id: eq.id,
        section: eq.section,
        type: eq.type,
        range: eq.range,
        serialNo: eq.serial_no,
        serialNumbers: [eq.serial_no || ''], // Initialize with existing serial number
        qty: eq.quantity, // Assuming quantity is stored in equipment record
        price: eq.price,
        basePrice: '' // Base price is not stored
      })));
    }
  }, [reservationData, isEditMode, clients]);

  const resetForm = () => {
    setClientInfo(initialClientInfo);
    setEquipments(initialEquipments);
    setProvince('');
    setCity('');
    setBarangay('');
    setScheduledDate(new Date());
    setExpectedCompletionDate(null);
  };

  const provinces = getProvinces();
  const cities = getCities(province);
  const barangays = getBarangays(province, city);

  const sectionOptions = [
    'Volume Standards',
    'Mass Standards',
    'Calibration of Non-Automatic Weighing Instrument',
    'Length Standards',
    'Thermometer and Hygrometer Standards', 'Pressure Standard'
  ];
  const defaultTypeOptions = ['Weighing Scale', 'Thermometer', 'Thermohygrometer', 'Test Weights', 'Sphygmomanometer'];
  const volumeTypeOptions = ['Proving Tanks', 'Test Measure', 'Fuel Dispensing Pump', 'Road Tankers'];
  const defaultRangeOptions = ['0-10kg', '10-50kg', '50-100kg', '100-500kg', 'Other'];
  const provingTankRangeOptions = ['100L to 400L', '500L to 2000L', '2500L to 4000L'];
  const testMeasureRangeOptions = ['70L'];
  const fuelDispensingPumpRangeOptions = ['Per Muzzle'];
  const roadTankerRangeOptions = [
    '5000L and below',
    '6000 to 10000L',
    '11000L to 15000L',
    '16000 to 20000L',
    '21000 to 25000L',
    '26000 to 30000L',
    '31000 to 35000L',
    '36000 to 40000L',
    '41000 to 45000L',
    '46000 to 50000L'
  ];
  const massStandardTypeOptions = ['OIML F2', 'OIML Class M1/M2/M3'];
  const oimlF2RangeOptions = ['1kg to 10kg', '10kg to 20kg', '20kg to 50kg'];

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({ ...prev, [name]: value }));

    if (name === 'name' && value) {
      const filteredSuggestions = clients.filter(client =>
        client.fullname.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setIsSuggestionsOpen(true);
    } else {
      setIsSuggestionsOpen(false);
    }
  };
  
  const toggleSuggestionsDropdown = () => {
    if (isSuggestionsOpen) {
      setIsSuggestionsOpen(false);
    } else {
      setSuggestions(clients);
      setIsSuggestionsOpen(true);
    }
  };

  const handleSuggestionClick = (client) => {
    setClientInfo({
      id: client.id,
      name: client.fullname || '',
      contact_number: client.contact_number || '',
      email: client.email || '',
      industry_type: client.industry_type || '',
      company: client.company || '',
      company_head: client.company_head || '',
    });
    setProvince(client.province || '');
    setCity(client.city || '');
    setBarangay(client.barangay || '');
    setIsSuggestionsOpen(false);
  };

  const handleAddEquipment = () => {
    setEquipments([
      ...equipments,
      { id: Date.now() + Math.random(), section: '', type: '', range: '', serialNo: '', serialNumbers: [''], qty: 1, price: '0.00', basePrice: '' }
    ]);
  };

  const handleEquipmentChange = (id, field, value) => {
    setEquipments(equipments.map(eq => {
      if (eq.id !== id) return eq;
      let updated = { ...eq, [field]: value };
      
      // Handle manual price changes - don't override if user is manually setting price
      if (field === 'price') {
        // Validate and format price input
        const priceValue = value.trim();
        if (priceValue === '' || priceValue === '0' || priceValue === '0.00') {
          updated.price = '0.00';
        } else {
          // Check if it's a valid number
          const numValue = parseFloat(priceValue.replace(/,/g, ''));
          if (!isNaN(numValue) && numValue >= 0) {
            updated.price = numValue.toFixed(2);
          } else {
            // Keep the original price if invalid input
            updated.price = eq.price || '0.00';
          }
        }
        return updated;
      }
      
      // In handleEquipmentChange, always store the unit price (not multiplied by qty)
      if (updated.type === 'Proving Tanks' && field === 'range') {
        if (value === '100L to 400L') updated.basePrice = 1500;
        else if (value === '500L to 2000L') updated.basePrice = 5000;
        else if (value === '2500L to 4000L') updated.basePrice = 4000;
        else updated.basePrice = '';
        updated.price = updated.basePrice ? updated.basePrice.toLocaleString() : '';
      }
      if (field === 'type' && value !== 'Proving Tanks') {
        updated.price = '';
        updated.basePrice = '';
      }
      if (updated.type === 'Test Measure' && field === 'range') {
        if (value === '70L') updated.basePrice = 500;
        else updated.basePrice = '';
        updated.price = updated.basePrice ? updated.basePrice.toLocaleString() : '';
      }
      if (field === 'type' && value !== 'Test Measure' && eq.type === 'Test Measure') {
        updated.price = '';
        updated.basePrice = '';
        updated.range = '';
      }
      if (updated.type === 'Fuel Dispensing Pump' && field === 'range') {
        if (value === 'Per Muzzle') updated.basePrice = 700;
        else updated.basePrice = '';
        updated.price = updated.basePrice ? updated.basePrice.toLocaleString() : '';
      }
      if (field === 'type' && value !== 'Fuel Dispensing Pump' && eq.type === 'Fuel Dispensing Pump') {
        updated.price = '';
        updated.basePrice = '';
        updated.range = '';
      }
      if (updated.type === 'Road Tankers' && field === 'range') {
        if (value === '5000L and below') updated.basePrice = 1000;
        else if (value === '6000 to 10000L') updated.basePrice = 1500;
        else if (value === '11000L to 15000L') updated.basePrice = 2000;
        else if (value === '16000 to 20000L') updated.basePrice = 2500;
        else if (value === '21000 to 25000L') updated.basePrice = 3000;
        else if (value === '26000 to 30000L') updated.basePrice = 3500;
        else if (value === '31000 to 35000L') updated.basePrice = 4000;
        else if (value === '36000 to 40000L') updated.basePrice = 4500;
        else if (value === '41000 to 45000L') updated.basePrice = 5000;
        else if (value === '46000 to 50000L') updated.basePrice = 5500;
        else updated.basePrice = '';
        updated.price = updated.basePrice ? updated.basePrice.toLocaleString() : '';
      }
      if (field === 'type' && value !== 'Road Tankers' && eq.type === 'Road Tankers') {
        updated.price = '';
        updated.basePrice = '';
        updated.range = '';
      }
      if (updated.type === 'OIML F2' && field === 'range') {
        if (value === '1kg to 10kg') updated.basePrice = 600;
        else if (value === '10kg to 20kg') updated.basePrice = 800;
        else if (value === '20kg to 50kg') updated.basePrice = 1000;
        else updated.basePrice = '';
        updated.price = updated.basePrice ? updated.basePrice.toLocaleString() : '';
      }
      if (field === 'type' && value !== 'OIML F2' && eq.type === 'OIML F2') {
        updated.price = '';
        updated.basePrice = '';
        updated.range = '';
      }
      return updated;
    }));
  };

  const handleRemoveEquipment = (id) => {
    setEquipments(equipments.filter(eq => eq.id !== id));
  };

  const handleQtyChange = (id, amount) => {
    setEquipments(equipments.map(eq => {
      if (eq.id !== id) return eq;
      const newQty = Math.max(1, (eq.qty || 1) + amount);
      let updated = { ...eq, qty: newQty };
      
      // Update serialNumbers array based on new quantity
      const currentSerialNumbers = eq.serialNumbers || [eq.serialNo || ''];
      if (amount > 0) {
        // Adding quantity - add empty sample code fields
        const newSerialNumbers = [...currentSerialNumbers];
        for (let i = currentSerialNumbers.length; i < newQty; i++) {
          newSerialNumbers.push('');
        }
        updated.serialNumbers = newSerialNumbers;
      } else if (amount < 0) {
        // Reducing quantity - remove last sample code fields
        updated.serialNumbers = currentSerialNumbers.slice(0, newQty);
      }
      
      // Update price if needed (if price depends on qty)
      if (eq.basePrice) {
        updated.price = (eq.basePrice * newQty).toLocaleString();
      }
      return updated;
    }));
  };

  const handleSerialNumberChange = (id, index, value) => {
    setEquipments(equipments.map(eq => {
      if (eq.id !== id) return eq;
      const updated = { ...eq };
      if (!updated.serialNumbers) {
        updated.serialNumbers = [updated.serialNo || ''];
      }
      updated.serialNumbers[index] = value;
      
      // Update the main serialNo field with the first sample code for backward compatibility
      if (index === 0) {
        updated.serialNo = value;
      }
      
      return updated;
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    if (name === 'province') {
      setProvince(value);
      setCity('');
      setBarangay('');
    } else if (name === 'city') {
      setCity(value);
      setBarangay('');
    } else if (name === 'barangay') {
      setBarangay(value);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    // Validate client information
    if (!clientInfo.id) {
      errors.push('Please select an existing client from the list.');
    }
    if (!clientInfo.name || !clientInfo.contact_number || !clientInfo.email || !clientInfo.company) {
      errors.push('Please fill in all required client information (Name, Contact Number, Email, Company).');
    }
    
    // Validate date fields
    if (!scheduledDate || !expectedCompletionDate) {
      errors.push('Please select both scheduled and expected completion dates.');
    }
    
    // Validate equipment information
    const equipmentErrors = [];
    equipments.forEach((eq, index) => {
      const equipmentErrors = [];
      
      if (!eq.section) equipmentErrors.push('Section');
      if (!eq.type) equipmentErrors.push('Type');
      if (!eq.range) equipmentErrors.push('Range');
      
      // Get sample codes array, ensuring it's properly initialized
      let serialNumbers = eq.serialNumbers;
      if (!serialNumbers || serialNumbers.length === 0) {
        serialNumbers = eq.serialNo ? [eq.serialNo] : [''];
      }
      
      const expectedCount = eq.qty || 1;
      while (serialNumbers.length < expectedCount) {
        serialNumbers.push('');
      }
      
      const emptySerials = serialNumbers.filter(s => s.trim().length === 0);
      if (emptySerials.length > 0) {
        equipmentErrors.push('Sample Codes');
      }
      
      if (eq.price === undefined || eq.price === null || eq.price === '') {
        equipmentErrors.push('Price');
      }
      
      if (equipmentErrors.length > 0) {
        errors.push(`Sample ${index + 1}: Missing ${equipmentErrors.join(', ')}`);
      }
    });
    
    // Check for duplicate sample codes
    const allSerials = equipments.flatMap(eq => {
      let serialNumbers = eq.serialNumbers;
      if (!serialNumbers || serialNumbers.length === 0) {
        serialNumbers = eq.serialNo ? [eq.serialNo] : [''];
      }
      
      const expectedCount = eq.qty || 1;
      while (serialNumbers.length < expectedCount) {
        serialNumbers.push('');
      }
      
      return serialNumbers.map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
    });
    
    if (new Set(allSerials).size !== allSerials.length) {
      errors.push('Duplicate sample codes found. Please ensure each sample code is unique.');
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const addressString = [barangay, city, province].filter(Boolean).join(', ');

      if (isEditMode) {
        // UPDATE LOGIC
        const updatedReservationData = {
          client_id: clientInfo.id,
          address: addressString,
          date_scheduled: scheduledDate ? scheduledDate.toISOString().split('T')[0] : null,
          date_expected_completion: expectedCompletionDate ? expectedCompletionDate.toISOString().split('T')[0] : null,
          status: reservationData.status, // Preserve original status or allow change
          samples: equipments.flatMap(e => {
            // Get sample codes array, ensuring it's properly initialized
            let serialNumbers = e.serialNumbers;
            if (!serialNumbers || serialNumbers.length === 0) {
              // If no serialNumbers array, create one from serialNo
              serialNumbers = e.serialNo ? [e.serialNo] : [''];
            }
            
            // Ensure we have the right number of sample code fields based on quantity
            const expectedCount = e.qty || 1;
            while (serialNumbers.length < expectedCount) {
              serialNumbers.push('');
            }
            
            return serialNumbers.map(serialNo => {
              const eq = {
                // Map admin UI fields to backend schema
                section: e.type, // Test Request/Calibration stored in 'type' input in admin table
                type: e.section, // Sample stored in 'section' input in admin table
                range: e.range,  // Calibration Test/Method already in 'range' input
                serial_no: serialNo,
                price: e.price,
                id: e.id || undefined
              };
              if (!eq.id) delete eq.id;
              return eq;
            });
          })
        };
        await apiService.updateRequest(reservationData.reference_number, updatedReservationData);
        toast.success('Reservation updated successfully');
      } else {
        // CREATE LOGIC
        const newReservationData = {
          client_id: clientInfo.id,
          address: addressString,
          date_scheduled: scheduledDate ? scheduledDate.toISOString().split('T')[0] : null,
          date_expected_completion: expectedCompletionDate ? expectedCompletionDate.toISOString().split('T')[0] : null,
          status: user?.role !== 'client' ? 'in_progress' : 'pending'
        };
  
        const requestResponse = await apiService.createRequest(newReservationData);
        const requestId = requestResponse.data.id;
        const referenceNumber = requestResponse.data.reference_number;
  
        // Create equipment records - one for each sample code
        const equipmentPromises = equipments.flatMap(equipment => {
          // Get sample codes array, ensuring it's properly initialized
          let serialNumbers = equipment.serialNumbers;
          if (!serialNumbers || serialNumbers.length === 0) {
            // If no serialNumbers array, create one from serialNo
            serialNumbers = equipment.serialNo ? [equipment.serialNo] : [''];
          }
          
          // Ensure we have the right number of sample code fields based on quantity
          const expectedCount = equipment.qty || 1;
          while (serialNumbers.length < expectedCount) {
            serialNumbers.push('');
          }
          
          return serialNumbers.map(serialNo =>
            apiService.createSample({
              reservation_ref_no: referenceNumber,
              section: equipment.section,
              type: equipment.type,
              range: equipment.range,
              serial_no: serialNo,
              price: (equipment.basePrice || equipment.price || '0').toString().replace(/,/g, ''),
              quantity: 1,
              is_calibrated: false,
              date_completed: null
            })
          );
        });
  
        await Promise.all(equipmentPromises);
        // If status is in_progress, immediately create a transaction
        if (newReservationData.status === 'in_progress') {
          try {
            await apiService.createTransaction({ reservation_ref_no: referenceNumber });
            toast.success('Transaction created for new reservation');
          } catch (err) {
            if (err?.response?.data?.message?.includes('Duplicate entry')) {
              // Transaction already exists, do nothing
            } else {
              toast.error('Transaction creation failed');
            }
          }
        }
        toast.success('Reservation submitted successfully');
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting reservation:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'submit'} reservation. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total price of all equipment
  const totalPrice = equipments.reduce((sum, eq) => {
    // Remove commas and parse as number
    const priceNum = parseFloat((eq.price || '0').toString().replace(/,/g, ''));
    return sum + (isNaN(priceNum) ? 0 : priceNum);
  }, 0);

  const handleAttemptClose = () => {
    setIsCancelConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    resetForm();
    onClose();
    setIsCancelConfirmOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <ConfirmCancelModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleConfirmClose}
      />
      <ConfirmEditModal
        isOpen={isEditConfirmOpen}
        onClose={() => setIsEditConfirmOpen(false)}
        onConfirm={handleSubmit}
      />
      <ConfirmSubmitModal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onConfirm={handleSubmit}
        isLoading={isSubmitting}
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-7xl max-h-[90vh] font-sans flex flex-col justify-center border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 whitespace-nowrap">{isEditMode ? 'Edit Request' : 'Add New Request'}</h2>
            <button onClick={handleAttemptClose} className="text-gray-400 hover:text-[#2a9dab] text-xl font-bold transition-colors">✕</button>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
              {/* Client Information */}
              <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Client Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="relative md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input 
                          type="text" 
                          name="name" 
                          value={clientInfo.name} 
                          onChange={handleClientInfoChange}
                          onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 200)}
                          autoComplete="off"
                          className="mt-1 w-full px-3 py-2 border rounded-lg pr-10" 
                        />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={toggleSuggestionsDropdown}
                          className="absolute inset-y-0 right-0 top-1 flex items-center px-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      {isSuggestionsOpen && suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto">
                          {suggestions.map(suggestion => (
                            <li 
                              key={suggestion.id} 
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {suggestion.fullname}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Number <span className="text-red-500">*</span></label>
                      <input type="text" name="contact_number" value={clientInfo.contact_number} onChange={handleClientInfoChange} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={clientInfo.email} onChange={handleClientInfoChange} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-700">Company <span className="text-red-500">*</span></label>
                      <input type="text" name="company" value={clientInfo.company} onChange={handleClientInfoChange} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type of Industry</label>
                      <input type="text" name="industry_type" value={clientInfo.industry_type} onChange={handleClientInfoChange} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Head</label>
                      <input type="text" name="company_head" value={clientInfo.company_head} onChange={handleClientInfoChange} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Province</label>
                        <select
                          name="province"
                          value={province}
                          onChange={handleAddressChange}
                          className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value="">Select Province</option>
                          {provinces.map((prov) => (
                            <option key={prov} value={prov}>{prov}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <select
                          name="city"
                          value={city}
                          onChange={handleAddressChange}
                          className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                          disabled={!province}
                        >
                          <option value="">Select City</option>
                          {cities.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Barangay</label>
                        <select
                          name="barangay"
                          value={barangay}
                          onChange={handleAddressChange}
                          className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                          disabled={!city}
                        >
                          <option value="">Select Barangay</option>
                          {barangays.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Schedule Dates Section */}
              <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col max-w-xs w-60 justify-center mx-auto">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Schedule</h3>
                <div className="flex-1 flex flex-col gap-4 justify-start">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scheduled Date <span className="text-red-500">*</span></label>
                    <DatePicker
                      selected={scheduledDate}
                      onChange={date => setScheduledDate(date)}
                      minDate={new Date()}
                      className="mt-1 w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Scheduled date"
                      calendarClassName="modern-datepicker font-sans text-sm"
                      popperClassName="modern-datepicker-popper"
                      customInput={
                        <CustomDateInput
                          placeholder="Scheduled date"
                          value={scheduledDate ? scheduledDate.toLocaleDateString() : ''}
                        />
                      }
                      renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                        <div className="flex justify-between items-center px-2 py-1">
                          <button onClick={decreaseMonth} className="text-[#2a9dab] px-2 py-1 rounded hover:bg-[#e0f7fa]">{'<'}</button>
                          <span className="font-semibold">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                          <button onClick={increaseMonth} className="text-[#2a9dab] px-2 py-1 rounded hover:bg-[#e0f7fa]">{'>'}</button>
                        </div>
                      )}
                      highlightDates={[]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expected Completion <span className="text-red-500">*</span></label>
                    <DatePicker
                      selected={expectedCompletionDate}
                      onChange={date => {
                        setExpectedCompletionDate(date);
                        setIsExpectedCompletionManuallySet(true);
                      }}
                      minDate={scheduledDate || new Date()}
                      className="mt-1 w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Completion date"
                      calendarClassName="modern-datepicker font-sans text-sm"
                      popperClassName="modern-datepicker-popper"
                      customInput={
                        <CustomDateInput
                          placeholder="Completion date"
                          value={expectedCompletionDate ? expectedCompletionDate.toLocaleDateString() : ''}
                        />
                      }
                      renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                        <div className="flex justify-between items-center px-2 py-1">
                          <button onClick={decreaseMonth} className="text-[#2a9dab] px-2 py-1 rounded hover:bg-[#e0f7fa]">{'<'}</button>
                          <span className="font-semibold">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                          <button onClick={increaseMonth} className="text-[#2a9dab] px-2 py-1 rounded hover:bg-[#e0f7fa]">{'>'}</button>
                        </div>
                      )}
                      highlightDates={[]}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Equipment Information */}
            <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
              <h3 className="text-lg font-medium mb-3">Sample Details</h3>
              <div className="max-h-[170px] overflow-y-auto" style={{ scrollbarGutter: 'stable', scrollBehavior: 'smooth' }}>
                {/* Sample Details Header Row */}
                <div className="grid grid-cols-[3fr_2fr_2fr_2fr_minmax(120px,_1fr)_auto] gap-x-3 items-center font-bold text-xs text-gray-700 px-3 py-2 sticky top-0 bg-white z-10 border-b">
                  <span>Sample</span>
                  <span>Test Request/Calibration</span>
                  <span>Calibration Test/Method</span>
                  <span>Sample Code</span>
                  <span className="text-center">Price</span>
                  <span className="w-8"></span> {/* Spacer for remove button */}
                </div>
                <div className="space-y-2 py-1">
                  {equipments.map((equip, index) => (
                    <div key={equip.id ?? index} className="grid grid-cols-[3fr_2fr_2fr_2fr_minmax(120px,_1fr)_auto] gap-x-3 items-center px-3">
                      <input
                        type="text"
                        placeholder="Sample"
                        value={equip.section}
                        onChange={e => handleEquipmentChange(equip.id, 'section', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                      />
                      <input
                        type="text"
                        placeholder="Test Request/Calibration"
                        value={equip.type}
                        onChange={e => handleEquipmentChange(equip.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                      />
                      <input
                        type="text"
                        placeholder="Calibration Test/Method"
                        value={equip.range}
                        onChange={e => handleEquipmentChange(equip.id, 'range', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                      />
                      <div className="space-y-1">
                        {Array.from({ length: equip.qty || 1 }, (_, index) => (
                          <input
                            key={index}
                            type="text"
                            placeholder={`Sample Code #${index + 1}`}
                            value={equip.serialNumbers ? equip.serialNumbers[index] || '' : (index === 0 ? equip.serialNo || '' : '')}
                            onChange={e => handleSerialNumberChange(equip.id, index, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-center">
                        <input
                          type="text"
                          placeholder="0.00"
                          value={equip.price || '0.00'}
                          onChange={e => handleEquipmentChange(equip.id, 'price', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] text-center"
                        />
                      </div>
                      
                      <div className="flex items-center justify-center">
                        {equipments.length > 1 ? (
                          <button onClick={() => handleRemoveEquipment(equip.id)} className="text-red-500 text-sm font-semibold h-8 w-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors">✕</button>
                        ) : (
                          <span className="text-red-500 text-sm font-semibold invisible h-8 w-8 flex items-center justify-center">✕</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Add button is outside the scrollable area */}
              <button onClick={handleAddEquipment} className="mt-2 text-sm text-blue-600 hover:text-blue-800">+ Add another sample</button>
            </div>
          </div>
          <div className="flex justify-between items-center gap-4 mt-8">
            <div className="text-2xl font-bold text-gray-700">
              Total Fee: <span className="text-2xl font-bold text-[#2a9dab]">₱ {totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={handleAttemptClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
              <button
                onClick={isEditMode ? () => setIsEditConfirmOpen(true) : () => setIsSubmitConfirmOpen(true)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#217a8c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  isEditMode ? 'Update Request' : 'Submit Request'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const getStatusBadge = (status) => {
  if (!status) return 'bg-gray-400';
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-yellow-500';
    case 'pending':
      return 'bg-blue-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

const getStatusText = (status) => {
  if (!status) return '';
  switch (status.toLowerCase()) {
    case 'in_progress': return 'In Progress';
    case 'pending': return 'Pending';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const ViewReservationModal = ({ isOpen, onClose, reservation, onEdit, onAccept, user }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    if (isOpen && reservation) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError('');
        try {
          const response = await apiService.getRequestDetails(reservation.reference_number);
          setDetails(response.data);
        } catch (err) {
          setError('Failed to fetch request details.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, reservation]);
  const openPdfPreview = async () => {
    if (!details?.reference_number) return;
    setPdfError('');
    setPdfLoading(true);
    setIsPdfModalOpen(true);
    try {
      const response = await api.get(`/api/request/get_attachment.php?ref=${encodeURIComponent(details.reference_number)}` , { responseType: 'blob' });
      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    } catch (e) {
      console.error('Failed to load PDF blob', e);
      setPdfError('Failed to load PDF. You can try opening it in a new tab.');
    } finally {
      setPdfLoading(false);
    }
  };

  const closePdfPreview = () => {
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
    }
    setPdfBlobUrl(null);
    setIsPdfModalOpen(false);
    setPdfError('');
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold">Request Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>
        <div className="overflow-y-auto p-2">
          {isLoading && <p className="text-center">Loading...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {details && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Reference #: {details.reference_number}</h3>
                  <p className="text-sm text-gray-500">Created on {new Date(details.date_created).toLocaleDateString()}</p>
                </div>
                <span className={`capitalize px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusBadge(details.status)}`}>
                  {getStatusText(details.status)}
                </span>
              </div>
              
              <hr />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Client Information</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium text-gray-600">Name:</span> {details.client_name}</p>
                    <p><span className="font-medium text-gray-600">Company:</span> {details.client_company || 'N/A'}</p>
                    <p><span className="font-medium text-gray-600">Email:</span> {details.client_email}</p>
                    <p><span className="font-medium text-gray-600">Contact:</span> {details.client_contact}</p>
                    <p><span className="font-medium text-gray-600">Address:</span> {details.address || 'N/A'}</p>
                  </div>
                </div>
                 <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Schedule</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium text-gray-600">Date Scheduled:</span> {details.date_scheduled || 'Not Set'}</p>
                    <p><span className="font-medium text-gray-600">Expected Completion:</span> {details.date_expected_completion || 'Not Set'}</p>
                    <p><span className="font-medium text-gray-600">Date Finished:</span> {details.date_finished || 'Not yet completed'}</p>
                  </div>
                </div>
              </div>
              
              <hr />

              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2">Sample</h3>
                <div className="space-y-3">
                  {details.sample && details.sample.length > 0 ? (
                    details.sample.map(item => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-4 gap-4 items-center">
                        <div className="col-span-2">
                          <p className="font-semibold text-gray-800">{item.type} ({item.range})</p>
                          <p className="text-xs text-gray-500">Section: {item.section}</p>
                          <p className="text-xs text-gray-500">S/N: {item.serial_no || 'N/A'}</p>
                        </div>
                        <p className="font-semibold text-gray-800 text-right">₱{Number(item.price).toLocaleString()}</p>
                        <span className={`capitalize px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusBadge(item.status)} justify-self-end`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No samples listed for this request.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between p-2">
          <div>
            {details?.attachment_file_path && details?.reference_number && (
              <button
                onClick={openPdfPreview}
                className="inline-flex items-center px-4 py-2 text-[#2a9dab] border border-[#2a9dab] rounded-lg hover:bg-[#e0f7fa] font-medium"
              >
                View PDF
              </button>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Close</button>
            {user?.role !== 'client' && details?.status === 'pending' && onAccept && (
              <button 
                  onClick={() => {
                    onAccept(details.id);
                    onClose();
                  }} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  disabled={isLoading}
              >
                  Accept
              </button>
            )}
            <button 
                onClick={() => onEdit(details)} 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                disabled={isLoading}
            >
                Edit
            </button>
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      {isPdfModalOpen && details?.reference_number && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Attachment Preview</h3>
              <button onClick={closePdfPreview} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {pdfLoading && (
                <div className="h-[80vh] w-full flex items-center justify-center text-gray-600">Loading PDF...</div>
              )}
              {!pdfLoading && pdfError && (
                <div className="h-[80vh] w-full flex flex-col items-center justify-center text-red-600 text-sm">
                  <p className="mb-3">{pdfError}</p>
                  <a
                    href={`${api.defaults.baseURL}/api/request/get_attachment.php?ref=${encodeURIComponent(details.reference_number)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-4 py-2 text-[#2a9dab] border border-[#2a9dab] rounded-lg hover:bg-[#e0f7fa] font-medium"
                  >
                    Open in new tab
                  </a>
                </div>
              )}
              {!pdfLoading && !pdfError && pdfBlobUrl && (
                <iframe title="Attachment PDF" src={pdfBlobUrl} className="w-full h-[80vh]" />
              )}
            </div>
            <div className="px-4 py-3 flex justify-end">
              <button onClick={closePdfPreview} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Reservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('in_progress');
  const [isTableAnimating, setIsTableAnimating] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // New: choice modal + file attach state
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isSampleDetailsModalOpen, setIsSampleDetailsModalOpen] = useState(false);
  const [attachedSampleDetails, setAttachedSampleDetails] = useState(null);
  const [isSubmittingAttach, setIsSubmittingAttach] = useState(false);
  
  // PDF parsing state variables
  const [attachedPdfText, setAttachedPdfText] = useState('');
  const [parsedClientFromPdf, setParsedClientFromPdf] = useState(null);
  const [parsedAddressFromPdf, setParsedAddressFromPdf] = useState(null);
  const [parsedScheduleFromPdf, setParsedScheduleFromPdf] = useState(null);
  const [parsedSamplesFromPdf, setParsedSamplesFromPdf] = useState([]);
  const [parsedPdfReferenceNumber, setParsedPdfReferenceNumber] = useState('');
  
  // Client info modal state
  const [isClientInfoModalOpen, setIsClientInfoModalOpen] = useState(false);
  const [editableClientInfo, setEditableClientInfo] = useState({});
  
  // Confirmation dialog states
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);

  const fetchReservations = async () => {
    setIsTableAnimating(true);
    try {
      const response = await apiService.getRequests();
      if (response.data && response.data.records) {
        setReservations(response.data.records);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to fetch reservations.');
    }

    const fetchClients = async () => {
      try {
        const response = await apiService.getClients();
        if (response.data && response.data.records) {
          setClients(response.data.records);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Reset to first page when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (reservationData) => {
    setReservationToEdit(reservationData);
    setIsViewModalOpen(false); // Close view modal
    setIsAddModalOpen(true); // Open add/edit modal
  };

  const handleAcceptReservation = (reservationId) => {
    setSelectedReservationId(reservationId);
    setShowAcceptConfirm(true);
  };

  const confirmAcceptReservation = async () => {
    try {
      await apiService.updateRequestStatus({ id: selectedReservationId, status: 'in_progress' });
      toast.success('Reservation accepted!');
      // Create transaction after acceptance
      const reservation = reservations.find(r => r.id === selectedReservationId);
      if (reservation) {
        try {
          await apiService.createTransaction({ reservation_ref_no: reservation.reference_number });
          toast.success('Transaction created for accepted reservation');
        } catch (err) {
          // If duplicate, ignore; otherwise, show error
          if (err?.response?.data?.message?.includes('Duplicate entry')) {
            // Transaction already exists, do nothing
          } else {
            toast.error('Transaction creation failed');
          }
        }
      }
      fetchReservations();
      window.dispatchEvent(new Event('reservation-updated'));
    } catch (error) {
      toast.error('Failed to accept reservation.');
    } finally {
      setShowAcceptConfirm(false);
      setSelectedReservationId(null);
    }
  };


  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch =
      (reservation.client_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (reservation.reference_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (reservation.client_email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && reservation.status === 'pending') ||
      (statusFilter === 'in_progress' && reservation.status === 'in_progress');

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations = filteredReservations.slice(startIndex, endIndex);

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
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle selection from choice modal
  const handleAttachFileClick = () => {
    // Reset previous selection and trigger picker
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
    setIsChoiceModalOpen(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      console.log('File selected:', file);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      const url = URL.createObjectURL(file);
      setAttachedFile(file);
      setFilePreviewUrl(url);
      setIsFilePreviewOpen(true);
      console.log('File preview modal should now be open');
      
      // Extract text from PDF and parse fields
      try {
        console.log('Starting PDF processing...');
        const pdfText = await extractPdfTextFromFile(file);
        console.log('PDF text extraction completed');
        setAttachedPdfText(pdfText);
        console.log('Extracted PDF text length:', pdfText.length);
        console.log('First 1000 characters:', pdfText.substring(0, 1000));
        
        if (pdfText && pdfText.trim()) {
          console.log('Parsing PDF fields...');
          const parsed = parsePdfFields(pdfText);
          console.log('PDF parsing completed');
          setParsedClientFromPdf(parsed.client);
          setParsedAddressFromPdf(parsed.address);
          setParsedScheduleFromPdf(parsed.schedule);
          setParsedSamplesFromPdf(parsed.samples || []);
          if (parsed.pdf_reference_number) {
            setParsedPdfReferenceNumber(parsed.pdf_reference_number);
          } else {
            setParsedPdfReferenceNumber('');
          }
          console.log('Parsed PDF fields:', parsed);
          console.log('Samples found:', parsed.samples?.length || 0);
        } else {
          console.warn('No text extracted from PDF');
          toast.error('No text could be extracted from the PDF file');
        }
      } catch (error) {
        console.error('Error processing PDF:', error);
        toast.error(`Failed to process PDF file: ${error.message}`);
      }
    }
  };

  // Helper function to find the best matching address option
  const findBestAddressMatch = (parsedValue, availableOptions) => {
    if (!parsedValue || !availableOptions.length) return '';
    
    const normalized = parsedValue.toLowerCase().trim();
    
    // First try exact match
    const exactMatch = availableOptions.find(option => 
      option.toLowerCase() === normalized
    );
    if (exactMatch) return exactMatch;
    
    // Try partial match (contains)
    const partialMatch = availableOptions.find(option => 
      option.toLowerCase().includes(normalized) || 
      normalized.includes(option.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    // Try fuzzy matching for common variations
    const fuzzyMatch = availableOptions.find(option => {
      const optionNorm = option.toLowerCase();
      // Remove common words and compare
      const parsedClean = normalized.replace(/\b(province|city|municipality|barangay|brgy)\b/g, '').trim();
      const optionClean = optionNorm.replace(/\b(province|city|municipality|barangay|brgy)\b/g, '').trim();
      return parsedClean === optionClean || 
             parsedClean.includes(optionClean) || 
             optionClean.includes(parsedClean);
    });
    
    return fuzzyMatch || '';
  };

  const handleConfirmAttach = () => {
    console.log('handleConfirmAttach called');
    console.log('parsedClientFromPdf:', parsedClientFromPdf);
    console.log('parsedAddressFromPdf:', parsedAddressFromPdf);
    
    setIsFilePreviewOpen(false);
    
    // Get available address options
    const availableProvinces = getProvinces();
    
    // Find best matching province
    const matchedProvince = findBestAddressMatch(
      parsedAddressFromPdf?.province || '', 
      availableProvinces
    );
    
    // Get cities for the matched province
    const availableCities = matchedProvince ? getCities(matchedProvince) : [];
    const matchedCity = findBestAddressMatch(
      parsedAddressFromPdf?.city || '', 
      availableCities
    );
    
    // Get barangays for the matched province and city
    const availableBarangays = matchedProvince && matchedCity ? 
      getBarangays(matchedProvince, matchedCity) : [];
    const matchedBarangay = findBestAddressMatch(
      parsedAddressFromPdf?.barangay || '', 
      availableBarangays
    );
    
    console.log('Address matching results:', {
      original: parsedAddressFromPdf,
      matched: {
        province: matchedProvince,
        city: matchedCity,
        barangay: matchedBarangay
      }
    });
    
    // Prepare editable client info from parsed data
    const clientInfo = {
      name: parsedClientFromPdf?.name || '',
      contact_number: parsedClientFromPdf?.contact_number || '',
      email: parsedClientFromPdf?.email || '',
      company: parsedClientFromPdf?.company || '',
      province: matchedProvince,
      city: matchedCity,
      barangay: matchedBarangay
    };
    
    console.log('Prepared clientInfo:', clientInfo);
    setEditableClientInfo(clientInfo);
    console.log('About to open ClientInfoModal, current isClientInfoModalOpen:', isClientInfoModalOpen);
    setIsClientInfoModalOpen(true);
    console.log('Client info modal should now be open');
  };

  const handleClientInfoChange = (field, value) => {
    console.log('handleClientInfoChange called - field:', field, 'value:', value);
    setEditableClientInfo(prev => {
      let newInfo = {
        ...prev,
        [field]: value
      };
      
      // Handle address field cascading (reset dependent fields when parent changes)
      if (field === 'province') {
        newInfo.city = '';
        newInfo.barangay = '';
      } else if (field === 'city') {
        newInfo.barangay = '';
      }
      
      console.log('Updated editableClientInfo:', newInfo);
      return newInfo;
    });
  };

  const handleClientInfoConfirm = () => {
    // Update the parsed client data with edited values
    setParsedClientFromPdf(prev => ({
      ...prev,
      name: editableClientInfo.name,
      contact_number: editableClientInfo.contact_number,
      email: editableClientInfo.email,
      company: editableClientInfo.company
    }));
    
    // Update the parsed address data
    const province = editableClientInfo.province || '';
    const city = editableClientInfo.city || '';
    const barangay = editableClientInfo.barangay || '';
    const parts = [barangay, city, province].filter(Boolean);
    const addressLine = parts.join(', ');

    setParsedAddressFromPdf(prev => ({
      ...prev,
      province,
      city,
      barangay,
      address_line: addressLine
    }));
    
    setIsClientInfoModalOpen(false);
    
    // Now submit the data
    handleSubmitParsedData();
  };

  const handleClientInfoCancel = () => {
    setIsClientInfoModalOpen(false);
    // Reset the file attachment
    setAttachedFile(null);
    setParsedClientFromPdf(null);
    setParsedAddressFromPdf(null);
    setParsedSamplesFromPdf([]);
    setParsedPdfReferenceNumber('');
  };

  const handleSubmitParsedData = async () => {
    if (!attachedFile || !parsedSamplesFromPdf.length) {
      toast.error('No file or sample data to submit');
      return;
    }

    const formData = new FormData();
    const status = user?.role !== 'client' ? 'in_progress' : 'pending';

    // For attach flow, auto-include client_id for client users
    if (user?.role === 'client' && user?.client_id) {
      formData.append('client_id', String(user.client_id));
    }

    // Add parsed data - use editableClientInfo if available, otherwise fall back to parsedClientFromPdf
    const clientData = editableClientInfo && Object.keys(editableClientInfo).length > 0 ? editableClientInfo : parsedClientFromPdf;
    console.log('Using client data for FormData:', clientData);
    
    if (clientData) {
      if (clientData.name) formData.append('client_name', clientData.name);
      if (clientData.first_name) formData.append('first_name', clientData.first_name);
      if (clientData.last_name) formData.append('last_name', clientData.last_name);
      if (clientData.contact_number) formData.append('client_contact_number', clientData.contact_number);
      if (clientData.email) formData.append('client_email', clientData.email);
      if (clientData.company) formData.append('client_company', clientData.company);
      if (clientData.industry_type) formData.append('client_industry_type', clientData.industry_type);
      if (clientData.company_head) formData.append('client_company_head', clientData.company_head);
      if (clientData.gender) formData.append('gender', clientData.gender);
      if (clientData.age) formData.append('age', clientData.age);
      if (typeof clientData.is_pwd !== 'undefined') formData.append('is_pwd', String(clientData.is_pwd));
      if (typeof clientData.is_4ps !== 'undefined') formData.append('is_4ps', String(clientData.is_4ps));
    }

    if (parsedAddressFromPdf) {
      if (parsedAddressFromPdf.province) formData.append('province', parsedAddressFromPdf.province);
      if (parsedAddressFromPdf.city) formData.append('city', parsedAddressFromPdf.city);
      if (parsedAddressFromPdf.barangay) formData.append('barangay', parsedAddressFromPdf.barangay);
      if (parsedAddressFromPdf.address_line) formData.append('address', parsedAddressFromPdf.address_line);
    }

    if (parsedScheduleFromPdf) {
      if (parsedScheduleFromPdf.date_scheduled) formData.append('date_scheduled', parsedScheduleFromPdf.date_scheduled);
      if (parsedScheduleFromPdf.date_expected_completion) formData.append('date_expected_completion', parsedScheduleFromPdf.date_expected_completion);
      console.log('Parsed schedule to send:', parsedScheduleFromPdf);
    }

    // Note: Client data and schedule data are already added above, no need to duplicate
    if (parsedSamplesFromPdf?.length) formData.append('samples', JSON.stringify(parsedSamplesFromPdf));
    if (parsedPdfReferenceNumber) {
      formData.append('external_reference_number', parsedPdfReferenceNumber);
      formData.append('reference_number', parsedPdfReferenceNumber);
      formData.append('pdf_reference_number', parsedPdfReferenceNumber);
    }
    formData.append('status', status);
    formData.append('attachment', attachedFile);
    
    // Debug: Log what we're sending
    console.log('Sending FormData with samples:', parsedSamplesFromPdf);
    console.log('Samples JSON:', JSON.stringify(parsedSamplesFromPdf));
    console.log('Client email being sent:', clientData?.email);
    console.log('Client company being sent:', clientData?.company);
    try {
      const debugEntries = [];
      formData.forEach((value, key) => {
        debugEntries.push([key, typeof value === 'object' && value?.name ? value.name : value]);
      });
      console.log('FormData entries:', debugEntries);
      console.log('PDF reference number being sent:', parsedPdfReferenceNumber);
      console.log('External reference number being sent:', formData.get('external_reference_number'));
      console.log('Reference number being sent:', formData.get('reference_number'));
      console.log('date_scheduled in FormData:', formData.get('date_scheduled'));
      console.log('date_expected_completion in FormData:', formData.get('date_expected_completion'));
    } catch (e) {
      // ignore logging failures
    }

    try {
      const resp = await apiService.createRequestWithAttachment({ formData });
      console.log('Request creation response:', resp.data);
      toast.success('Reservation submitted successfully');
      
      // If in_progress, create transaction
      if (status === 'in_progress' && resp.data.reference_number) {
        try {
          console.log('Creating transaction for reference:', resp.data.reference_number);
          await apiService.createTransaction({ reservation_ref_no: resp.data.reference_number });
          toast.success('Transaction created for new reservation');
        } catch (err) {
          console.error('Transaction creation error:', err.response?.data);
          if (!err?.response?.data?.message?.includes('Duplicate entry')) {
            toast.error('Transaction creation failed: ' + (err.response?.data?.message || 'Unknown error'));
          }
        }
      } else if (status === 'in_progress') {
        console.warn('No reference number returned from request creation, skipping transaction creation');
      }
      
      // Reset local state
      setAttachedFile(null);
      setFilePreviewUrl(null);
      setParsedSamplesFromPdf([]);
      setParsedClientFromPdf(null);
      setParsedAddressFromPdf(null);
      setParsedScheduleFromPdf(null);
      setAttachedPdfText('');
      setParsedPdfReferenceNumber('');
      fetchReservations();
    } catch (error) {
      console.error('Error submitting reservation:', error);
      if (error.response?.status === 409) {
        toast.error('Reference number already exists. Please use a different PDF or contact support.');
      } else {
        toast.error('Failed to submit reservation with attachment: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const handleCancelPreview = () => {
    setIsFilePreviewOpen(false);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setFilePreviewUrl(null);
    setAttachedFile(null);
  };

  const handleConfirmSampleDetails = (details) => {
    setAttachedSampleDetails(details);
    setIsSampleDetailsModalOpen(false);
    // Build FormData and submit to backend if a file is attached
    if (attachedFile && details && Array.isArray(details)) {
      const chosenClientId = user?.role === 'client' ? null : null; // never require selection; backend/JWT handles client users
      const formData = new FormData();
      const addressString = '';
      const scheduled = '';
      const expected = '';
      const status = user?.role !== 'client' ? 'in_progress' : 'pending';

      // For attach flow, auto-include client_id for client users
      if (user?.role === 'client' && user?.client_id) {
        formData.append('client_id', String(user.client_id));
      }
      formData.append('address', addressString);
      formData.append('date_scheduled', scheduled);
      formData.append('date_expected_completion', expected);
      formData.append('status', status);
      formData.append('samples', JSON.stringify(details));
      formData.append('attachment', attachedFile);

      (async () => {
        setIsSubmittingAttach(true);
        try {
          const resp = await apiService.createRequestWithAttachment({ formData });
          toast.success('Reservation submitted successfully');
          // If in_progress, create transaction
          if (status === 'in_progress') {
            try {
              await apiService.createTransaction({ reservation_ref_no: resp.data.reference_number });
              toast.success('Transaction created for new reservation');
            } catch (err) {
              if (!err?.response?.data?.message?.includes('Duplicate entry')) {
                toast.error('Transaction creation failed');
              }
            }
          }
          // Reset local state
          setAttachedFile(null);
          setAttachedSampleDetails(null);
          setFilePreviewUrl(null);
          fetchReservations();
        } catch (error) {
          const statusCode = error?.response?.status;
          const message = error?.response?.data?.message;
          if (statusCode === 409) {
            toast.error(message || 'Duplicate sample codes in samples');
            // Reopen the modal for correction
            setIsSampleDetailsModalOpen(true);
          } else if (statusCode === 400) {
            toast.error(message || 'Invalid data. Please review your inputs.');
            setIsSampleDetailsModalOpen(true);
          } else {
            // Fallback: create reservation and equipment without attachment
            try {
              const newReservationData = {
                ...(user?.role === 'client' && user?.client_id ? { client_id: user.client_id } : {}),
                address: null,
                date_scheduled: null,
                date_expected_completion: null,
                status,
              };
              const resCreate = await apiService.createRequest(newReservationData);
              const referenceNumber = resCreate.data.reference_number;
              const equipmentPromises = details.map(sample =>
                apiService.createSample({
                  reservation_ref_no: referenceNumber,
                  section: sample.section,
                  type: sample.type,
                  range: sample.range,
                  serial_no: sample.serialNo,
                  price: (sample.price || '0').toString().replace(/,/g, ''),
                  quantity: 1,
                  is_calibrated: false,
                  date_completed: null,
                })
              );
              await Promise.all(equipmentPromises);
              if (status === 'in_progress') {
                try {
                  await apiService.createTransaction({ reservation_ref_no: referenceNumber });
                  toast.success('Transaction created for new reservation');
                } catch (err2) {
                  if (!err2?.response?.data?.message?.includes('Duplicate entry')) {
                    toast.error('Transaction creation failed');
                  }
                }
              }
              toast.success('Reservation submitted (without file upload)');
              setAttachedFile(null);
              setAttachedSampleDetails(null);
              setFilePreviewUrl(null);
              fetchReservations();
            } catch (fallbackErr) {
              toast.error(message || 'Failed to submit reservation with attachment');
              setIsSampleDetailsModalOpen(true);
            }
          }
        } finally {
          setIsSubmittingAttach(false);
        }
      })();
    } else {
      toast.success('Sample details saved');
    }
  };

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  return (
    <div className="p-6 bg-gray-100 h-full">
      <main className="flex-1">
        <Toaster />
        {/* Hidden file input for Attach flow */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        />
        {/* Choice modal */}
        <AddRequestChoiceModal
          isOpen={isChoiceModalOpen}
          onClose={() => setIsChoiceModalOpen(false)}
          onChooseAttach={handleAttachFileClick}
          onChooseAddNew={() => {
            setIsChoiceModalOpen(false);
            setIsAddModalOpen(true);
          }}
        />
        <FilePreviewModal
          isOpen={isFilePreviewOpen}
          file={attachedFile}
          url={filePreviewUrl}
          onConfirm={handleConfirmAttach}
          onClose={handleCancelPreview}
        />
        <ClientInfoModal
          isOpen={isClientInfoModalOpen}
          onClose={handleClientInfoCancel}
          onConfirm={handleClientInfoConfirm}
          clientInfo={editableClientInfo}
          onClientInfoChange={handleClientInfoChange}
        />
        {/* Removed Add Sample Details modal per requirement */}
        <AddReservationModal 
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setReservationToEdit(null); // Clear editing state
            fetchReservations(); // Refetch reservations when modal closes
          }}
          clients={clients}
          reservationData={reservationToEdit}
        />
        <ViewReservationModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          reservation={selectedReservation}
          onEdit={handleOpenEditModal}
          onAccept={handleAcceptReservation}
          user={user}
        />
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Request Management</h1>
            <button 
              onClick={() => setIsChoiceModalOpen(true)}
              className="bg-[#2a9dab] text-white px-4 py-2 rounded-lg hover:bg-[#217a8c] transition-colors"
            >
              Add Request
            </button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex bg-[#e0f7fa] rounded-lg h-10 gap-1 w-fit">
              {[
                { key: 'pending', label: 'Pending' },
                { key: 'in_progress', label: 'Ongoing' },
                { key: 'all', label: 'All' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setStatusFilter(option.key)}
                  className={`flex-1 px-5 h-10 text-sm rounded-md font-medium transition-colors text-center border-none focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${statusFilter === option.key
                      ? 'bg-[#2a9dab] text-white shadow'
                      : 'bg-transparent text-[#2a9dab] hover:bg-[#b2ebf2]'}
                `}
                  style={{ minWidth: '110px' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <input 
              type="text"
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg h-10"
            />
          </div>
          <div className={isTableAnimating ? "overflow-hidden" : "overflow-auto"}>
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Scheduled
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Completion
                  </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentReservations.map((reservation, index) => (
                  <motion.tr 
                    key={reservation.reference_number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onAnimationComplete={
                      () => {
                        if (index === currentReservations.length - 1) {
                          setIsTableAnimating(false);
                        }
                      }
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reservation.reference_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.client_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.date_scheduled || 'Not Set'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.date_expected_completion || 'Not Set'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`capitalize px-3 py-1 text-xs font-semibold text-white rounded-full ${getStatusBadge(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => handleViewDetails(reservation)}
                        className="px-3 py-1 rounded text-xs font-semibold focus:outline-none transition-colors duration-200 border bg-[#2a9dab]/20 text-[#2a9dab] border-[#2a9dab]/30 hover:bg-[#2a9dab]/30">
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredReservations.length > itemsPerPage && (
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
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#2a9dab] text-white hover:bg-[#238a91]'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                Showing {startIndex + 1}-{Math.min(endIndex, filteredReservations.length)} of {filteredReservations.length} results
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Accept Confirmation Dialog */}
      {showAcceptConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Accept Request</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to accept this request? This will move it to "In Progress" status and create a transaction.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAcceptConfirm(false);
                  setSelectedReservationId(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAcceptReservation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reservations;