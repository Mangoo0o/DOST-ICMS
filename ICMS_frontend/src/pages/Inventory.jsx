import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaEdit, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { apiService } from '../services/api';
import { motion } from 'framer-motion';
import { InventoryTabContext } from '../components/Sidebar';

function validateAndFormatNomval(nomvalStr) {
  if (!nomvalStr || isNaN(nomvalStr)) return null;
  const num = parseFloat(nomvalStr);
  // Always keep two decimal places for display
  return num.toFixed(2);
}

function truncateText(text, maxLength = 30) {
  if (!text) return '';
  let truncated = text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  // Capitalize the first letter of each word
  return truncated.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function formatNumber(value) {
  return (value !== null && value !== '' && !isNaN(value))
    ? parseFloat(value).toString()
    : value;
}

const AddItemModal = ({ isOpen, onClose, onSubmit, selectedType }) => {
  const isThermometer = selectedType === 'thermometer';
  const isThermohygrometer = selectedType === 'thermohygrometer';
  const isSphygmomanometer = selectedType === 'sphygmomanometer';

  const getInitialFormData = () => {
    if (isSphygmomanometer) {
      return { name: '', sampleNo: '', modelNo: '', measurement_range: '', accuracy: '', lastCalibrationDate: '' };
    }
    if (isThermohygrometer) {
      return { name: '', minTemperature: '', maxTemperature: '', humidity: '', class: 'None', sampleNo: '', modelNo: '', lastCalibrationDate: '' };
    }
    if (isThermometer) {
      return { name: '', minTemperature: '', maxTemperature: '' };
    }
    if (selectedType === 'weighing-scale') {
      return { name: '', sampleNo: '', modelNo: '', minCapacity: '', minCapacityUnit: 'kg', maxCapacity: '', maxCapacityUnit: 'kg', lastCalibrationDate: '' };
    }
    return { 
      sticker: '', 
      nomval: '', 
      conventionalMass: '', 
      class: 'M1',
      uncertaintyOfMeasurement: '',
      maximumPermissibleError: '',
      correctionValue: '0.00000000',
      lastCalibrationDate: new Date().toISOString().split('T')[0],
      serialNo: 'None'
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
    }
  }, [isOpen, selectedType]);

  useEffect(() => {
    if (
      formData.conventionalMass !== undefined &&
      formData.nomval !== undefined &&
      formData.conventionalMass !== '' &&
      formData.nomval !== '' &&
      !isNaN(formData.conventionalMass) &&
      !isNaN(formData.nomval)
    ) {
      setFormData((prev) => ({
        ...prev,
        correctionValue: (parseFloat(formData.conventionalMass) - parseFloat(formData.nomval)).toFixed(6)
      }));
    }
  }, [formData.conventionalMass, formData.nomval]);

  const validateForm = () => {
    const newErrors = {};
    if (isSphygmomanometer) {
      if (!formData.name || !formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.measurement_range || !formData.measurement_range.trim()) newErrors.measurement_range = 'Measurement range is required';
      if (!formData.accuracy || !formData.accuracy.trim()) newErrors.accuracy = 'Accuracy is required';
    } else if (isThermometer || isThermohygrometer) {
      if (!formData.name || !formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.minTemperature || !formData.minTemperature.trim()) newErrors.minTemperature = 'Minimum temperature is required';
      if (!formData.maxTemperature || !formData.maxTemperature.trim()) newErrors.maxTemperature = 'Maximum temperature is required';
      if (isThermohygrometer) {
        if (!formData.humidity || !formData.humidity.trim()) newErrors.humidity = 'Humidity is required';
      }
    } else if (selectedType === 'weighing-scale') {
      if (!formData.name || !formData.name.trim()) newErrors.name = 'Name is required';
      if (formData.minCapacity == null || String(formData.minCapacity).trim() === '') newErrors.minCapacity = 'Minimum capacity is required';
      if (formData.maxCapacity == null || String(formData.maxCapacity).trim() === '') newErrors.maxCapacity = 'Maximum capacity is required';
      if (!formData.lastCalibrationDate || !formData.lastCalibrationDate.trim()) newErrors.lastCalibrationDate = 'Last calibration date is required';
    } else {
      if (!formData.sticker || !formData.sticker.trim()) newErrors.sticker = 'Sticker ID is required';
      if (!formData.nomval || !formData.nomval.trim()) newErrors.nomval = 'Nomval value is required';
      if (!formData.conventionalMass || !formData.conventionalMass.trim()) newErrors.conventionalMass = 'Conventional mass is required';
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
    setShowConfirmation(false);
    onClose();
    setIsSubmitting(true);
    try {
      if (isThermometer) {
        await onSubmit({
          name: formData.name,
          minTemperature: parseFloat(formData.minTemperature),
          maxTemperature: parseFloat(formData.maxTemperature),
          sampleNo: formData.sampleNo,
          modelNo: formData.modelNo,
          readability: formData.readability,
          lastCalibrationDate: formData.lastCalibrationDate,
          category: 'Thermometer'
        });
        return;
      } else if (isThermohygrometer) {
        await onSubmit({
          name: formData.name,
          minTemperature: parseFloat(formData.minTemperature),
          maxTemperature: parseFloat(formData.maxTemperature),
          humidity: parseFloat(formData.humidity),
          class: formData.class,
          sampleNo: formData.sampleNo,
          modelNo: formData.modelNo,
          lastCalibrationDate: formData.lastCalibrationDate,
          category: 'Thermohygrometer'
        });
        return;
      } else if (isSphygmomanometer) {
        await onSubmit({
          name: formData.name,
          sampleNo: formData.sampleNo,
          modelNo: formData.modelNo,
          measurement_range: formData.measurement_range,
          accuracy: formData.accuracy,
          lastCalibrationDate: formData.lastCalibrationDate,
          category: 'Sphygmomanometer'
        });
        return;
      } else if (selectedType === 'weighing-scale') {
        await onSubmit({
          name: formData.name,
          sampleNo: formData.sampleNo,
          modelNo: formData.modelNo,
          minCapacity: formData.minCapacity,
          minCapacityUnit: formData.minCapacityUnit,
          maxCapacity: formData.maxCapacity,
          maxCapacityUnit: formData.maxCapacityUnit,
          lastCalibrationDate: formData.lastCalibrationDate,
          category: 'Weighing-Scale'
        });
        return;
      } else {
        const formattedNomval = validateAndFormatNomval(formData.nomval);
        if (formattedNomval === null) {
          setErrors({ nomval: 'Invalid value' });
          return;
        }
        const serialNoToSend = formData.serialNo && formData.serialNo.trim() !== '' ? formData.serialNo : 'None';
        await onSubmit({
          sticker: formData.sticker,
          serialNo: serialNoToSend,
          nomval: parseFloat(formattedNomval),
          conventionalMass: parseFloat(formData.conventionalMass),
          class: formData.class,
          uncertaintyOfMeasurement: formData.uncertaintyOfMeasurement,
          maximumPermissibleError: formData.maximumPermissibleError,
          correctionValue: parseFloat(formData.correctionValue),
          lastCalibrationDate: formData.lastCalibrationDate
        });
      }
      setFormData(getInitialFormData());
      setErrors({});
      toast.success('Item has been successfully added!', {
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
      console.log(error);
      toast.error(error.message || 'Failed to add item', {
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
          <h2 className="text-xl font-semibold">Add New Item</h2>
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
          {isThermometer || isThermohygrometer ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Temperature</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.minTemperature}
                      onChange={(e) => setFormData({ ...formData, minTemperature: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg pr-8 ${errors.minTemperature ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">°C</span>
                  </div>
                  {errors.minTemperature && <p className="text-red-500 text-xs mt-1">{errors.minTemperature}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Temperature</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.maxTemperature}
                      onChange={(e) => setFormData({ ...formData, maxTemperature: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg pr-8 ${errors.maxTemperature ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">°C</span>
                  </div>
                  {errors.maxTemperature && <p className="text-red-500 text-xs mt-1">{errors.maxTemperature}</p>}
                </div>
              </div>
              {isThermohygrometer && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Humidity</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.humidity}
                          onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg pr-8 ${errors.humidity ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
                      </div>
                      {errors.humidity && <p className="text-red-500 text-xs mt-1">{errors.humidity}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select
                        value={formData.class}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="None">None</option>
                        <option value="In/Out">In/Out</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sample No</label>
                    <input
                      type="text"
                      value={formData.sampleNo || ''}
                      onChange={e => setFormData({ ...formData, sampleNo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model No</label>
                    <input
                      type="text"
                      value={formData.modelNo || ''}
                      onChange={e => setFormData({ ...formData, modelNo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date</label>
                    <input
                      type="date"
                      value={formData.lastCalibrationDate || ''}
                      onChange={e => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
              {isThermometer && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sample No</label>
                    <input
                      type="text"
                      value={formData.sampleNo || ''}
                      onChange={e => setFormData({ ...formData, sampleNo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model No</label>
                    <input
                      type="text"
                      value={formData.modelNo || ''}
                      onChange={e => setFormData({ ...formData, modelNo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Readability</label>
                    <input
                      type="text"
                      value={formData.readability || ''}
                      onChange={e => setFormData({ ...formData, readability: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date</label>
                    <input
                      type="date"
                      value={formData.lastCalibrationDate || ''}
                      onChange={e => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </>
          ) : isSphygmomanometer ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sample No.</label>
                  <input
                    type="text"
                    value={formData.sampleNo || ''}
                    onChange={(e) => setFormData({ ...formData, sampleNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model No.</label>
                  <input
                    type="text"
                    value={formData.modelNo || ''}
                    onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Range</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.measurement_range}
                    onChange={(e) => setFormData({ ...formData, measurement_range: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-12"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">mmHg</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accuracy (% FS)</label>
                <input
                  type="text"
                  value={formData.accuracy}
                  onChange={(e) => setFormData({ ...formData, accuracy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date</label>
                <input
                  type="date"
                  value={formData.lastCalibrationDate || ''}
                  onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300"
                />
              </div>
            </>
          ) : selectedType === 'weighing-scale' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sample No.</label>
                  <input
                    type="text"
                    value={formData.sampleNo || ''}
                    onChange={(e) => setFormData({ ...formData, sampleNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model No.</label>
                  <input
                    type="text"
                    value={formData.modelNo || ''}
                    onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Capacity</label>
                  <div className="flex relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.minCapacity}
                      onChange={(e) => setFormData({ ...formData, minCapacity: e.target.value.replace(/[^0-9]/g, '') })}
                      className={`w-full px-3 py-2 border rounded-lg pr-16 ${errors.minCapacity ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <select
                      value={formData.minCapacityUnit}
                      onChange={e => setFormData({ ...formData, minCapacityUnit: e.target.value })}
                      className="absolute right-0 top-0 h-full px-2 border-l border-gray-300 bg-white rounded-r-lg text-gray-700 focus:outline-none"
                      style={{ minWidth: '60px' }}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="mg">mg</option>
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                  {errors.minCapacity && <p className="text-red-500 text-xs mt-1">{errors.minCapacity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Capacity</label>
                  <div className="flex relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value.replace(/[^0-9]/g, '') })}
                      className={`w-full px-3 py-2 border rounded-lg pr-16 ${errors.maxCapacity ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <select
                      value={formData.maxCapacityUnit}
                      onChange={e => setFormData({ ...formData, maxCapacityUnit: e.target.value })}
                      className="absolute right-0 top-0 h-full px-2 border-l border-gray-300 bg-white rounded-r-lg text-gray-700 focus:outline-none"
                      style={{ minWidth: '60px' }}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="mg">mg</option>
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                  {errors.maxCapacity && <p className="text-red-500 text-xs mt-1">{errors.maxCapacity}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date</label>
                <input
                  type="date"
                  value={formData.lastCalibrationDate || ''}
                  onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.lastCalibrationDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.lastCalibrationDate && <p className="text-red-500 text-xs mt-1">{errors.lastCalibrationDate}</p>}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID/Sticker</label>
                <input
                  type="text"
                  value={formData.sticker}
                  onChange={(e) => setFormData({ ...formData, sticker: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.sticker ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.sticker && <p className="text-red-500 text-xs mt-1">{errors.sticker}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomval</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.nomval}
                    onChange={(e) => setFormData({ ...formData, nomval: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.nomval ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.nomval && <p className="text-red-500 text-xs mt-1">{errors.nomval}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conventional Mass</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={formData.conventionalMass}
                    onChange={(e) => setFormData({ ...formData, conventionalMass: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.conventionalMass ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.conventionalMass && <p className="text-red-500 text-xs mt-1">{errors.conventionalMass}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="M1">M1</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uncertainty of Measurement</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.uncertaintyOfMeasurement}
                    onChange={e => setFormData({ ...formData, uncertaintyOfMeasurement: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.uncertaintyOfMeasurement ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.uncertaintyOfMeasurement && <p className="text-red-500 text-xs mt-1">{errors.uncertaintyOfMeasurement}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Permissible Error</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.maximumPermissibleError}
                    onChange={e => setFormData({ ...formData, maximumPermissibleError: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.maximumPermissibleError ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.maximumPermissibleError && <p className="text-red-500 text-xs mt-1">{errors.maximumPermissibleError}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correction Value</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={formData.correctionValue}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-100 ${errors.correctionValue ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.correctionValue && <p className="text-red-500 text-xs mt-1">{errors.correctionValue}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date</label>
                  <input
                    type="date"
                    value={formData.lastCalibrationDate}
                    onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.lastCalibrationDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.lastCalibrationDate && <p className="text-red-500 text-xs mt-1">{errors.lastCalibrationDate}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial No.</label>
                <input
                  type="text"
                  value={formData.serialNo || ''}
                  onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-red-100 hover:border-red-400 hover:text-red-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Are you sure you want to cancel?</h3>
              <p className="mb-6 text-gray-900 font-normal">Any unsaved changes will be lost.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  No, Go Back
                </button>
                <button
                  onClick={() => { setShowCancelConfirm(false); onClose(); }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 text-center">Confirm New Item</h3>
              <p className="mb-6 text-gray-900 font-normal">Are you sure you want to add this item?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-red-100 hover:border-red-400 hover:text-red-600"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EditItemModal = ({ isOpen, onClose, onEdit, item, selectedType }) => {
  const isThermometer = selectedType === 'thermometer';
  const isThermohygrometer = selectedType === 'thermohygrometer';
  const isSphygmomanometer = selectedType === 'sphygmomanometer';
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (item) {
      if (isThermohygrometer) {
        setFormData({
          name: item.name || '',
          minTemperature: item.minTemperature?.toString() || '',
          maxTemperature: item.maxTemperature?.toString() || '',
          humidity: item.humidity?.toString() || '',
          class: item.class || 'None',
          sampleNo: item.sampleNo || '',
          modelNo: item.modelNo || '',
          lastCalibrationDate: item.lastCalibrationDate || ''
        });
      } else if (isThermometer) {
        setFormData({
          name: item.name || '',
          minTemperature: item.minTemperature?.toString() || '',
          maxTemperature: item.maxTemperature?.toString() || '',
          sampleNo: item.sampleNo || '',
          modelNo: item.modelNo || '',
          readability: item.readability || '',
          lastCalibrationDate: item.lastCalibrationDate || ''
        });
      } else       if (isSphygmomanometer) {
        setFormData({
          name: item.name || '',
          sampleNo: item.sampleNo || '',
          modelNo: item.modelNo || '',
          measurement_range: item.measurement_range || '',
          accuracy: item.accuracy || '',
          lastCalibrationDate: item.lastCalibrationDate || ''
        });
      } else if (selectedType === 'weighing-scale') {
        setFormData({
          name: item.name || '',
          sampleNo: item.sampleNo || '',
          modelNo: item.modelNo || '',
          minCapacity: item.minCapacity || '',
          minCapacityUnit: item.minCapacityUnit || 'kg',
          maxCapacity: item.maxCapacity || '',
          maxCapacityUnit: item.maxCapacityUnit || 'kg',
          lastCalibrationDate: item.lastCalibrationDate || ''
        });
      } else {
        setFormData({
          sticker: item.sticker || '',
          nomval: item.nomval?.toString() || '',
          conventionalMass: item.conventionalMass?.toString() || '',
          class: item.class || 'M1',
          uncertaintyOfMeasurement: item.uncertaintyOfMeasurement?.toString() || '',
          maximumPermissibleError: item.maximumPermissibleError?.toString() || '',
          correctionValue: item.correctionValue?.toString() || '0.00000000',
          lastCalibrationDate: item.lastCalibrationDate || new Date().toISOString().split('T')[0],
          serialNo: item.serialNo && item.serialNo.trim() !== '' ? item.serialNo : 'None'
        });
      }
    }
  }, [item, isThermometer, isThermohygrometer, isSphygmomanometer, selectedType]);

  useEffect(() => {
    if (
      formData.conventionalMass !== undefined &&
      formData.nomval !== undefined &&
      formData.conventionalMass !== '' &&
      formData.nomval !== '' &&
      !isNaN(formData.conventionalMass) &&
      !isNaN(formData.nomval)
    ) {
      setFormData((prev) => ({
        ...prev,
        correctionValue: (parseFloat(formData.conventionalMass) - parseFloat(formData.nomval)).toFixed(6)
      }));
    }
  }, [formData.conventionalMass, formData.nomval]);

  const validateForm = () => {
    const newErrors = {};
    if (isSphygmomanometer) {
      if (!formData.name || !formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.measurement_range || !formData.measurement_range.trim()) newErrors.measurement_range = 'Measurement range is required';
      if (!formData.accuracy || !formData.accuracy.trim()) newErrors.accuracy = 'Accuracy is required';
    } else if (isThermometer || isThermohygrometer) {
      if (!formData.name || !formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.minTemperature || !formData.minTemperature.trim()) newErrors.minTemperature = 'Minimum temperature is required';
      if (!formData.maxTemperature || !formData.maxTemperature.trim()) newErrors.maxTemperature = 'Maximum temperature is required';
      if (isThermohygrometer) {
        if (!formData.humidity || !formData.humidity.trim()) newErrors.humidity = 'Humidity is required';
      }
    } else if (selectedType === 'weighing-scale') {
      if (!formData.name || !formData.name.trim()) newErrors.name = 'Name is required';
      if (formData.minCapacity == null || String(formData.minCapacity).trim() === '') newErrors.minCapacity = 'Minimum capacity is required';
      if (formData.maxCapacity == null || String(formData.maxCapacity).trim() === '') newErrors.maxCapacity = 'Maximum capacity is required';
      if (!formData.lastCalibrationDate || !formData.lastCalibrationDate.trim()) newErrors.lastCalibrationDate = 'Last calibration date is required';
    } else {
      if (!formData.sticker || !formData.sticker.trim()) newErrors.sticker = 'ID/STICKER is required';
      if (!formData.nomval || !formData.nomval.trim()) newErrors.nomval = 'Nominal value is required';
      if (!formData.conventionalMass || !formData.conventionalMass.trim()) newErrors.conventionalMass = 'Conventional mass is required';
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
    setShowConfirmation(false);
    onClose();
    setIsSubmitting(true);
    try {
      let dataToSubmit = { id: item.id };
      if (isSphygmomanometer) {
        dataToSubmit = {
          ...dataToSubmit,
          name: formData.name,
          sampleNo: formData.sampleNo,
          modelNo: formData.modelNo,
          measurement_range: formData.measurement_range,
          accuracy: formData.accuracy,
          lastCalibrationDate: formData.lastCalibrationDate,
          category: 'Sphygmomanometer'
        };
      } else if (isThermohygrometer) {
        dataToSubmit = {
          ...dataToSubmit,
          name: formData.name,
          minTemperature: parseFloat(formData.minTemperature),
          maxTemperature: parseFloat(formData.maxTemperature),
          humidity: parseFloat(formData.humidity),
          class: formData.class,
          sampleNo: formData.sampleNo,
          modelNo: formData.modelNo,
          lastCalibrationDate: formData.lastCalibrationDate,
          category: 'Thermohygrometer'
        };
      } else if (isThermometer) {
        dataToSubmit = {
          ...dataToSubmit,
          name: formData.name,
          sampleNo: formData.sampleNo,
          modelNo: formData.modelNo,
          readability: formData.readability,
          minTemperature: parseFloat(formData.minTemperature),
          maxTemperature: parseFloat(formData.maxTemperature),
          lastCalibrationDate: formData.lastCalibrationDate,
          category: 'Thermometer'
        };
      } else if (selectedType === 'weighing-scale') {
        dataToSubmit = {
          ...dataToSubmit,
          name: formData.name,
          sampleNo: formData.sampleNo,
          modelNo: formData.modelNo,
          minCapacity: formData.minCapacity,
          minCapacityUnit: formData.minCapacityUnit,
          maxCapacity: formData.maxCapacity,
          maxCapacityUnit: formData.maxCapacityUnit,
          lastCalibrationDate: formData.lastCalibrationDate,
          category: 'Weighing-Scale'
        };
      } else {
        const formattedNomval = validateAndFormatNomval(formData.nomval);
        if (formattedNomval === null) {
          setErrors({ nomval: 'Invalid value' });
          setIsSubmitting(false);
          return;
        }
        const serialNoToSendEdit = formData.serialNo && formData.serialNo.trim() !== '' ? formData.serialNo : 'None';
        dataToSubmit = {
          ...dataToSubmit,
          sticker: formData.sticker,
          serialNo: serialNoToSendEdit,
          nomval: parseFloat(formattedNomval),
          conventionalMass: parseFloat(formData.conventionalMass),
          class: formData.class,
          uncertaintyOfMeasurement: formData.uncertaintyOfMeasurement,
          maximumPermissibleError: formData.maximumPermissibleError,
          correctionValue: parseFloat(formData.correctionValue),
          lastCalibrationDate: formData.lastCalibrationDate
        };
      }
      await onEdit(dataToSubmit);
      toast.success('Item has been successfully updated!', {
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
      console.log(error);
      toast.error(error.message || 'Failed to update item', {
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
          <h2 className="text-xl font-semibold">Edit Item</h2>
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
          {isThermometer || isThermohygrometer ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Temperature</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.minTemperature || ''}
                      onChange={(e) => setFormData({ ...formData, minTemperature: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg pr-8 ${errors.minTemperature ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">°C</span>
                  </div>
                  {errors.minTemperature && <p className="text-red-500 text-xs mt-1">{errors.minTemperature}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Temperature</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.maxTemperature || ''}
                      onChange={(e) => setFormData({ ...formData, maxTemperature: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg pr-8 ${errors.maxTemperature ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">°C</span>
                  </div>
                  {errors.maxTemperature && <p className="text-red-500 text-xs mt-1">{errors.maxTemperature}</p>}
                </div>
              </div>
              {isThermohygrometer && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Humidity</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.humidity || ''}
                          onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg pr-8 ${errors.humidity ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
                      </div>
                      {errors.humidity && <p className="text-red-500 text-xs mt-1">{errors.humidity}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select
                        value={formData.class || 'None'}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="None">None</option>
                        <option value="In/Out">In/Out</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sample No</label>
                    <input
                      type="text"
                      value={formData.sampleNo || ''}
                      onChange={e => setFormData({ ...formData, sampleNo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model No</label>
                    <input
                      type="text"
                      value={formData.modelNo || ''}
                      onChange={e => setFormData({ ...formData, modelNo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date</label>
                    <input
                      type="date"
                      value={formData.lastCalibrationDate || ''}
                      onChange={e => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
              {isThermometer && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sample No</label>
                    <input
                      type="text"
                      value={formData.sampleNo || ''}
                      onChange={e => setFormData({ ...formData, sampleNo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model No</label>
                    <input
                      type="text"
                      value={formData.modelNo || ''}
                      onChange={e => setFormData({ ...formData, modelNo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Readability</label>
                    <input
                      type="text"
                      value={formData.readability || ''}
                      onChange={e => setFormData({ ...formData, readability: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date</label>
                    <input
                      type="date"
                      value={formData.lastCalibrationDate || ''}
                      onChange={e => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </>
          ) : isSphygmomanometer ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sample No.</label>
                  <input
                    type="text"
                    value={formData.sampleNo || ''}
                    onChange={(e) => setFormData({ ...formData, sampleNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model No.</label>
                  <input
                    type="text"
                    value={formData.modelNo || ''}
                    onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Range</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.measurement_range}
                    onChange={(e) => setFormData({ ...formData, measurement_range: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-12"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">mmHg</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accuracy (% FS)</label>
                <input
                  type="text"
                  value={formData.accuracy}
                  onChange={(e) => setFormData({ ...formData, accuracy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date</label>
                <input
                  type="date"
                  value={formData.lastCalibrationDate || ''}
                  onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300"
                />
              </div>
            </>
          ) : selectedType === 'weighing-scale' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sample No.</label>
                  <input
                    type="text"
                    value={formData.sampleNo || ''}
                    onChange={(e) => setFormData({ ...formData, sampleNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model No.</label>
                  <input
                    type="text"
                    value={formData.modelNo || ''}
                    onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Capacity</label>
                  <div className="flex relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.minCapacity}
                      onChange={(e) => setFormData({ ...formData, minCapacity: e.target.value.replace(/[^0-9]/g, '') })}
                      className={`w-full px-3 py-2 border rounded-lg pr-16 ${errors.minCapacity ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <select
                      value={formData.minCapacityUnit}
                      onChange={e => setFormData({ ...formData, minCapacityUnit: e.target.value })}
                      className="absolute right-0 top-0 h-full px-2 border-l border-gray-300 bg-white rounded-r-lg text-gray-700 focus:outline-none"
                      style={{ minWidth: '60px' }}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="mg">mg</option>
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                  {errors.minCapacity && <p className="text-red-500 text-xs mt-1">{errors.minCapacity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Capacity</label>
                  <div className="flex relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value.replace(/[^0-9]/g, '') })}
                      className={`w-full px-3 py-2 border rounded-lg pr-16 ${errors.maxCapacity ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <select
                      value={formData.maxCapacityUnit}
                      onChange={e => setFormData({ ...formData, maxCapacityUnit: e.target.value })}
                      className="absolute right-0 top-0 h-full px-2 border-l border-gray-300 bg-white rounded-r-lg text-gray-700 focus:outline-none"
                      style={{ minWidth: '60px' }}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="mg">mg</option>
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                  {errors.maxCapacity && <p className="text-red-500 text-xs mt-1">{errors.maxCapacity}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date</label>
                <input
                  type="date"
                  value={formData.lastCalibrationDate || ''}
                  onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.lastCalibrationDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.lastCalibrationDate && <p className="text-red-500 text-xs mt-1">{errors.lastCalibrationDate}</p>}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID/Sticker</label>
                <input
                  type="text"
                  value={formData.sticker}
                  onChange={(e) => setFormData({ ...formData, sticker: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.sticker ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.sticker && <p className="text-red-500 text-xs mt-1">{errors.sticker}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomval</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.nomval}
                    onChange={(e) => setFormData({ ...formData, nomval: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.nomval ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.nomval && <p className="text-red-500 text-xs mt-1">{errors.nomval}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conventional Mass</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={formData.conventionalMass}
                    onChange={(e) => setFormData({ ...formData, conventionalMass: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.conventionalMass ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.conventionalMass && <p className="text-red-500 text-xs mt-1">{errors.conventionalMass}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="M1">M1</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uncertainty of Measurement</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.uncertaintyOfMeasurement}
                    onChange={e => setFormData({ ...formData, uncertaintyOfMeasurement: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.uncertaintyOfMeasurement ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.uncertaintyOfMeasurement && <p className="text-red-500 text-xs mt-1">{errors.uncertaintyOfMeasurement}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Permissible Error</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.maximumPermissibleError}
                    onChange={e => setFormData({ ...formData, maximumPermissibleError: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.maximumPermissibleError ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.maximumPermissibleError && <p className="text-red-500 text-xs mt-1">{errors.maximumPermissibleError}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correction Value</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={formData.correctionValue}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-100 ${errors.correctionValue ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.correctionValue && <p className="text-red-500 text-xs mt-1">{errors.correctionValue}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Calibration Date</label>
                  <input
                    type="date"
                    value={formData.lastCalibrationDate}
                    onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.lastCalibrationDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.lastCalibrationDate && <p className="text-red-500 text-xs mt-1">{errors.lastCalibrationDate}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial No.</label>
                <input
                  type="text"
                  value={formData.serialNo || ''}
                  onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-red-100 hover:border-red-400 hover:text-red-600"
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
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Are you sure you want to cancel?</h3>
              <p className="mb-6 text-gray-900 font-normal">Any unsaved changes will be lost.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  No, Go Back
                </button>
                <button
                  onClick={() => { setShowCancelConfirm(false); onClose(); }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 text-center">Confirm Changes</h3>
              <p className="mb-6 text-gray-900">Are you sure you want to save these changes?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-red-100 hover:border-red-400 hover:text-red-600"
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

const ViewItemModal = ({ isOpen, onClose, item, onEdit }) => {
  if (!isOpen || !item) return null;
  // Determine main identifier
  const mainId = item.name || item.sticker || item.id || 'Item';
  // Group fields
  const generalFields = ['name', 'sticker', 'id', 'category', 'class'];
  const isThermometer = item.category === 'Thermometer';
  const specFields = Object.keys(item).filter(
    key => !generalFields.includes(key) && key !== 'description'
  );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-10 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-3xl font-bold">Item Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>
        <div className="overflow-y-auto p-2">
          <div className="mb-4">
            <span className="text-2xl font-extrabold text-gray-800">{mainId}</span>
            {item.category && (
              <span className="ml-3 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-base font-semibold align-middle">{item.category}</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-gray-700 mb-3">General Information</h4>
              <div className="space-y-2 text-lg">
                {generalFields.map(key => (
                  item[key] && key !== 'id' && (
                    <div key={key} className="flex justify-between">
                      <span className="font-semibold text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                      <span className="text-gray-900 text-right break-all font-medium">{String(item[key])}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-700 mb-3">Specifications</h4>
              <div className="space-y-2 text-lg">
                {specFields.map(key => (
                  item[key] && (
                    <div key={key} className="flex justify-between">
                      <span className="font-semibold text-gray-600 capitalize">{key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                      <span className="text-gray-900 text-right break-all font-medium">
                        {key === 'correctionValue'
                          ? Number(item[key]).toFixed(6)
                          : ['nomval','conventionalMass','uncertaintyOfMeasurement','maximumPermissibleError','minCapacity','maxCapacity','minTemperature','maxTemperature','humidity','measurement_range','accuracy'].includes(key)
                            ? formatNumber(item[key])
                            : key === 'uncertaintyOfMeasurement' || key === 'maximumPermissibleError'
                              ? (item[key] !== undefined && item[key] !== null && item[key] !== ''
                                  ? Number(item[key]).toFixed(3)
                                  : 'N/A')
                              : key === 'status'
                                ? String(item[key]).charAt(0).toUpperCase() + String(item[key]).slice(1)
                                : String(item[key])}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3 p-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Close</button>
          <button onClick={() => { onEdit(item); onClose(); }}  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Edit</button>
        </div>
      </div>
    </div>
  );
};

const ITEM_TYPES = [
  { key: 'test-weight', label: 'Test-Weight' },
  { key: 'thermometer', label: 'Thermometer' },
  { key: 'thermohygrometer', label: 'Thermohygrometer' },
  { key: 'weighing-scale', label: 'Weighing-Scale' },
  { key: 'sphygmomanometer', label: 'Sphygmomanometer' },
];

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nominalFilter, setNominalFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { selectedTab, setSelectedTab } = useContext(InventoryTabContext);
  const [selectedType, setSelectedType] = useState(ITEM_TYPES[0].key);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    setSelectedType(selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await apiService.getInventory();
        if (response.data && Array.isArray(response.data.records)) {
          setItems(response.data.records);
          setError(null);
        } else {
          setError('No inventory items found');
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError(err.response?.data?.message || 'Failed to fetch inventory');
        toast.error('Failed to load inventory items');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const editItem = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleEditItem = async (updatedItem) => {
    try {
      await apiService.updateInventoryItem(updatedItem);
      setItems(items.map(item => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)));
      setIsEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(error.response?.data?.message || 'Failed to update item');
      throw new Error(error.response?.data?.message || 'Failed to update item');
    }
  };

  const addItem = async (newItem) => {
    try {
      // Only add category if not already present
      const itemWithCategory = newItem.category
        ? newItem
        : { ...newItem, category: selectedTypeLabel };
      const response = await apiService.createInventoryItem(itemWithCategory);
      if (response.data && response.data.id) {
        setItems([...items, { ...itemWithCategory, id: response.data.id }]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setErrors({ submit: error.message });
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to create item');
    }
  };

  // Get the label for the selected tab
  const selectedTypeLabel = ITEM_TYPES.find(t => t.key === selectedType)?.label;
  // Filter items by category from backend
  let filteredItems;
  if (selectedType === 'test-weight') {
    filteredItems = items.filter(item => item.category === 'Test-Weight' || item.category === 'Calibration Weight');
  } else if (selectedType === 'weighing-scale') {
    filteredItems = items.filter(item => item.category === 'Weighing-Scale');
  } else {
    filteredItems = items.filter(item => 
      item.category && selectedTypeLabel &&
      item.category.toLowerCase() === selectedTypeLabel.toLowerCase()
    );
  }

  // Filter inventory items based on search term and nominal filter
  const filteredItemsByCriteria = filteredItems.filter(item => {
    if (selectedType === 'thermometer' || selectedType === 'thermohygrometer') {
      // For thermometers, search by name and ignore nominal filter
      const matchesSearch = item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    } else {
      // Existing logic for other types
      const matchesSearch = item.sticker && item.sticker.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesNominal = nominalFilter === 'all' || 
                         (nominalFilter === '50000' && parseFloat(item.nomval) === 50000) ||
                         (nominalFilter === '25000' && parseFloat(item.nomval) === 25000) ||
                         (nominalFilter === '10000' && parseFloat(item.nomval) === 10000) ||
                         (nominalFilter === '5000' && parseFloat(item.nomval) === 5000) ||
                         (nominalFilter === '1000' && parseFloat(item.nomval) === 1000) ||
                         (nominalFilter === 'other' && item.nomval && ![50000, 25000, 10000, 5000, 1000].includes(parseFloat(item.nomval)));
      return matchesSearch && matchesNominal;
    }
  });

  // Sort inventory items by creation time (oldest first)
  const sortedItems = [...filteredItemsByCriteria].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateA - dateB;
  });
  
  // Pagination logic
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  console.log('Filtered items:', filteredItems);
  console.log('Selected type:', selectedType);
  console.log('Selected type label:', selectedTypeLabel);

  return (
    <InventoryTabContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className="p-6 bg-gray-100 h-full pb-8 py-1">
        <Toaster />
        {/* Inventory Table for selected type */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">{ITEM_TYPES.find(t => t.key === selectedType)?.label} Inventory</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors"
            >
              Add Item
            </button>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <div className="mb-2 flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder={
                  selectedType === 'weighing-scale' || selectedType === 'thermometer' || selectedType === 'thermohygrometer' || selectedType === 'sphygmomanometer'
                    ? "Search by Name..."
                    : "Search by ID/STICKER..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors"
              />
            </div>
            {selectedType === 'test-weight' ? (
              <select
                value={nominalFilter}
                onChange={(e) => setNominalFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors"
              >
                <option value="all">All Nomval Values</option>
                <option value="50000">50000</option>
                <option value="25000">25000</option>
                <option value="10000">10000</option>
                <option value="5000">5000</option>
                <option value="1000">1000</option>
                <option value="other">Other</option>
              </select>
            ) : null}
          </div>
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2a9dab] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading inventory items...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No inventory items found matching your criteria.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {selectedType === 'sphygmomanometer' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Measurement Range</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy (% FS)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Calibration Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </>
                      ) : selectedType === 'thermohygrometer' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Temp (°C)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Temp (°C)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity (%)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Calibration Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </>
                      ) : selectedType === 'thermometer' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Readability</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Temp (°C)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Temp (°C)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Calibration Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </>
                      ) : selectedType === 'weighing-scale' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum Capacity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maximum Capacity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Calibration Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID/Sticker</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No.</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomval</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conventional mass</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uncertainty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Error</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correction</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Calibration Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedType === 'sphygmomanometer' ? (
                      filteredItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.sampleNo || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.modelNo || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.measurement_range ? `${item.measurement_range} mmHg` : ''}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.accuracy}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.lastCalibrationDate || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => { setViewItem(item); setIsViewModalOpen(true); }}
                              className="px-3 py-1 rounded text-xs font-semibold focus:outline-none transition-colors duration-200 border bg-[#2a9dab]/20 text-[#2a9dab] border-[#2a9dab]/30 hover:bg-[#2a9dab]/30 mr-2"
                            >
                              View Details
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : selectedType === 'thermohygrometer' ? (
                      filteredItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.sampleNo || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.modelNo || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.minTemperature ? formatNumber(item.minTemperature) + '°C' : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.maxTemperature ? formatNumber(item.maxTemperature) + '°C' : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.humidity ? formatNumber(item.humidity) + '%' : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.class || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.lastCalibrationDate || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setViewItem(item); setIsViewModalOpen(true); }}
                                className="px-3 py-1 rounded text-xs font-semibold focus:outline-none transition-colors duration-200 border bg-[#2a9dab]/20 text-[#2a9dab] border-[#2a9dab]/30 hover:bg-[#2a9dab]/30 mr-2"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : selectedType === 'thermometer' ? (
                      filteredItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.sampleNo || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.modelNo || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.readability ? item.readability + '°C' : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.minTemperature ? formatNumber(item.minTemperature) + '°C' : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.maxTemperature ? formatNumber(item.maxTemperature) + '°C' : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.lastCalibrationDate || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setViewItem(item); setIsViewModalOpen(true); }}
                                className="px-3 py-1 rounded text-xs font-semibold focus:outline-none transition-colors duration-200 border bg-[#2a9dab]/20 text-[#2a9dab] border-[#2a9dab]/30 hover:bg-[#2a9dab]/30 mr-2"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : selectedType === 'weighing-scale' ? (
                      filteredItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.sampleNo || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.modelNo || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.minCapacity ? formatNumber(item.minCapacity) + (item.minCapacityUnit || 'kg') : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.maxCapacity ? formatNumber(item.maxCapacity) + (item.maxCapacityUnit || 'kg') : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.lastCalibrationDate || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setViewItem(item); setIsViewModalOpen(true); }}
                                className="px-3 py-1 rounded text-xs font-semibold focus:outline-none transition-colors duration-200 border bg-[#2a9dab]/20 text-[#2a9dab] border-[#2a9dab]/30 hover:bg-[#2a9dab]/30 mr-2"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      paginatedItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-white"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.sticker}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.serialNo && item.serialNo.trim() !== '' ? item.serialNo : 'None'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.nomval ? formatNumber(item.nomval) : 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.conventionalMass ? formatNumber(item.conventionalMass) : 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.class}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.uncertaintyOfMeasurement !== undefined && item.uncertaintyOfMeasurement !== null && item.uncertaintyOfMeasurement !== '' ? item.uncertaintyOfMeasurement : 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.maximumPermissibleError !== undefined && item.maximumPermissibleError !== null && item.maximumPermissibleError !== '' ? item.maximumPermissibleError : 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.correctionValue !== undefined && item.correctionValue !== null && item.correctionValue !== '' ? Number(item.correctionValue).toFixed(6) : 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.lastCalibrationDate || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setViewItem(item); setIsViewModalOpen(true); }}
                                className="px-3 py-1 rounded text-xs font-semibold focus:outline-none transition-colors duration-200 border bg-[#2a9dab]/20 text-[#2a9dab] border-[#2a9dab]/30 hover:bg-[#2a9dab]/30 mr-2"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-1 mt-4 pb-4 select-none">
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToPage(idx + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition ${currentPage === idx + 1 ? 'bg-[#2a9dab] text-white border-[#2a9dab] font-bold shadow' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                      aria-current={currentPage === idx + 1 ? 'page' : undefined}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={addItem}
          selectedType={selectedType}
        />

        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onEdit={handleEditItem}
          item={selectedItem}
          selectedType={selectedType}
        />

        <ViewItemModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} item={viewItem} onEdit={editItem} />
      </div>
    </InventoryTabContext.Provider>
  );
};

export default Inventory;
