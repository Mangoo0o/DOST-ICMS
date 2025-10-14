import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { apiService } from '../services/api';
// import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../pages/custom-datepicker.css';
import ConfirmationModal from '../components/ConfirmationModal';
import { samplePricingService } from '../utils/samplePricing';
// import { getProvinces, getCities, getBarangays } from '../data/philippineLocations';

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

const ViewRequestModal = ({ isOpen, onClose, reservation }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && reservation) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError('');
        try {
          const response = await apiService.getRequestDetails(reservation.reference_number);
          setDetails(response.data);
        } catch (err) {
          setError('Failed to fetch reservation details.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, reservation]);

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
                  {details.status}
                </span>
              </div>
              
              <hr />

              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Client Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <p><span className="font-medium text-gray-600">Name:</span> {details.client_name}</p>
                  <p><span className="font-medium text-gray-600">Company:</span> {details.client_company}</p>
                  <p><span className="font-medium text-gray-600">Email:</span> {details.client_email}</p>
                  <p><span className="font-medium text-gray-600">Contact:</span> {details.client_contact}</p>
                </div>
              </div>
              
              <hr />

              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-2">Sample</h3>
                <div className="space-y-3">
                  {details.sample && details.sample.length > 0 ? (
                    details.sample.map(item => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{item.type}</p>
                          <p className="text-xs text-gray-500">S/N: {item.serial_no || 'N/A'} | Section: {item.section}</p>
                        </div>
                        <span className={`capitalize px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No samples listed for this reservation.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddRequestModal = ({ isOpen, onClose, user }) => {
  // --- Equipment and Client Info State ---
  const [equipments, setEquipments] = useState([
    { id: Date.now(), section: '', type: '', range: '', serialNo: '', serialNumbers: [''], qty: 1, price: '0.00', basePrice: '' }
  ]);
  const [clientInfo, setClientInfo] = useState(null);
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(null);
  const [isExpectedCompletionManuallySet, setIsExpectedCompletionManuallySet] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-set expected completion date to 5 days from scheduled date
  useEffect(() => {
    if (scheduledDate && !isExpectedCompletionManuallySet) {
      const fiveDaysLater = new Date(scheduledDate);
      fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
      setExpectedCompletionDate(fiveDaysLater);
    }
  }, [scheduledDate, isExpectedCompletionManuallySet]);

  // Load sample pricing data when component mounts
  useEffect(() => {
    const loadPricingData = async () => {
      try {
        await samplePricingService.getAllPricing();
      } catch (error) {
        console.error('Failed to load sample pricing data:', error);
      }
    };
    
    if (isOpen) {
      loadPricingData();
    }
  }, [isOpen]);

  // --- Equipment Options ---
  const sectionOptions = [
    'Volume Standards',
    'Mass Standards',
    'Calibration of Non-Automatic Weighing Instrument',
    'Length Standards',
    'Thermometer and Hygrometer Standards',
    'Pressure Standard'
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

  // --- Fetch Client Info ---
  useEffect(() => {
    if (isOpen && user?.client_id) {
      const fetchClientDetails = async () => {
        setIsLoadingClient(true);
        try {
          const response = await apiService.getClientDetails(user.client_id);
          const clientData = response.data;
          setClientInfo({
            id: clientData.id,
            name: (clientData.first_name && clientData.last_name)
              ? clientData.first_name + ' ' + clientData.last_name
              : '',
            contact_number: clientData.contact_number || '',
            email: clientData.email || '',
            industry_type: clientData.industry_type || '',
            company: clientData.company || '',
            company_head: clientData.company_head || '',
          });
          setProvince(clientData.province || '');
          setCity(clientData.city || '');
          setBarangay(clientData.barangay || '');
        } catch (error) {
          toast.error('Could not load client details.');
        } finally {
          setIsLoadingClient(false);
        }
      };
      fetchClientDetails();
    }
  }, [isOpen, user]);

  // --- Equipment Handlers (copied and adapted from Reservations.jsx) ---
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
        const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        updated.price = numericValue.toFixed(2);
        updated.basePrice = numericValue;
        return updated;
      }
      
      // Dynamic pricing logic for different sample types
      if (field === 'type') {
        // Get pricing from cache or fallback to hardcoded values
        const pricing = samplePricingService.getPricingWithFallback(updated.section, value);
        
        if (pricing && pricing.isActive) {
          updated.basePrice = pricing.basePrice;
        } else {
          updated.basePrice = '';
        }
        
        // Calculate total price
        if (updated.basePrice && updated.qty) {
          updated.price = (updated.basePrice * updated.qty).toFixed(2);
        } else if (updated.basePrice) {
          updated.price = updated.basePrice.toFixed(2);
        } else {
          updated.price = '0.00';
        }
      }
      
      // Handle quantity changes
      if (field === 'qty') {
        const newQty = Math.max(1, parseInt(value) || 1);
        updated.qty = newQty;
        if (updated.basePrice) {
          updated.price = (updated.basePrice * newQty).toFixed(2);
        }
      }
      
      // Clear pricing when sample type changes away from dropdown-enabled samples
      if (field === 'section' && value !== 'Weighing Scale' && value !== 'Test-Weights' && value !== 'Thermometer' && value !== 'Sphygmomanometer' && value !== 'Thermohygrometer') {
        updated.price = '0.00';
        updated.basePrice = '';
        updated.type = ''; // Clear the type field when changing away from dropdown-enabled samples
      }
      
      return updated;
    }));
  };
  const handleSerialNumberChange = (id, index, value) => {
    setEquipments(equipments.map(eq => {
      if (eq.id !== id) return eq;
      const serialNumbers = Array.isArray(eq.serialNumbers) ? [...eq.serialNumbers] : [];
      // Ensure array has correct length
      while (serialNumbers.length < (eq.qty || 1)) serialNumbers.push('');
      serialNumbers[index] = value;
      return { ...eq, serialNumbers };
    }));
  };
  const handleQtyChange = (id, amount) => {
    setEquipments(equipments.map(eq => {
      if (eq.id !== id) return eq;
      const newQty = Math.max(1, eq.qty + amount);
      let updated = { ...eq, qty: newQty };
      
      // Update serial numbers array length
      const serialNumbers = Array.isArray(eq.serialNumbers) ? [...eq.serialNumbers] : [];
      while (serialNumbers.length < newQty) serialNumbers.push('');
      while (serialNumbers.length > newQty) serialNumbers.pop();
      updated.serialNumbers = serialNumbers;
      
      // Recalculate price if base price exists
      if (updated.basePrice) {
        updated.price = (updated.basePrice * newQty).toFixed(2);
      }
      
      return updated;
    }));
  };
  const handleRemoveEquipment = (id) => {
    setEquipments(equipments.filter(eq => eq.id !== id));
  };

  // --- Total Price Calculation ---
  const totalPrice = equipments.reduce((sum, eq) => {
    const priceNum = parseFloat((eq.price || '0').toString().replace(/,/g, ''));
    return sum + (isNaN(priceNum) ? 0 : priceNum);
  }, 0);

  // --- Validation and Submit ---
  const handleSubmit = async () => {
    if (!clientInfo?.id) {
      toast.error('Client information is missing.');
      return;
    }
    if (!scheduledDate || !expectedCompletionDate) {
      toast.error('Please select both scheduled and expected completion dates.');
      return;
    }
    const isEquipmentValid = equipments.every(eq => {
      const serials = Array.isArray(eq.serialNumbers) ? eq.serialNumbers : [];
      const serialsComplete = serials.length === (eq.qty || 1) && serials.every(s => (s || '').toString().trim() !== '');
      return eq.section && eq.type && eq.range && serialsComplete && eq.price;
    });
    if (!isEquipmentValid) {
      toast.error('Please fill in all equipment details');
      return;
    }
    // Check for duplicate serial numbers within the current request
    const allSerials = equipments.flatMap(eq => (Array.isArray(eq.serialNumbers) ? eq.serialNumbers : [])).map(s => (s || '').toString().trim()).filter(Boolean);
    const seen = new Set();
    const duplicates = new Set();
    for (const s of allSerials) {
      if (seen.has(s)) duplicates.add(s);
      seen.add(s);
    }
    if (duplicates.size > 0) {
      toast.error(`Duplicate serial numbers found: ${Array.from(duplicates).join(', ')}`);
      return;
    }
    setIsSubmitting(true);
    try {
      const addressString = [barangay, city, province].filter(Boolean).join(', ');
      const reservationData = {
        client_id: clientInfo.id,
        address: addressString,
        date_scheduled: scheduledDate ? scheduledDate.toISOString() : null,
        date_expected_completion: expectedCompletionDate ? expectedCompletionDate.toISOString() : null,
      };
      const requestResponse = await apiService.createRequest(reservationData);
      const referenceNumber = requestResponse.data.reference_number;
      // Create each equipment sequentially to catch which serial fails (e.g., 409 Conflict)
      for (const equipment of equipments) {
        const serials = Array.isArray(equipment.serialNumbers) ? equipment.serialNumbers : [];
        for (let i = 0; i < equipment.qty; i++) {
          const priceToUse = equipment.basePrice || parseFloat(equipment.price.toString().replace(/,/g, ''));
          const serial = (serials[i] || '').toString().trim();
          try {
            await apiService.createSample({
              reservation_ref_no: referenceNumber,
              section: equipment.section,
              type: equipment.type,
              range: equipment.range,
              serial_no: serial,
              price: priceToUse.toString(),
              is_calibrated: false,
              date_completed: null
            });
          } catch (err) {
            if (err?.response?.status === 409) {
              toast.error(`Serial number already exists: ${serial}`);
            }
            throw err;
          }
        }
      }
      
      // Send email notification after all samples are created
      try {
        await apiService.sendRequestCreationEmail({
          reference_number: referenceNumber
        });
        console.log('Email notification sent successfully');
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
        // Don't fail the entire request if email fails
      }
      
      toast.success('Request submitted successfully');
      setIsExpectedCompletionManuallySet(false);
      onClose();
    } catch (error) {
      if (error?.response?.status === 409) {
        toast.error('One or more serial numbers already exist. Please correct them and retry.');
      } else {
        toast.error('Failed to submit request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Submit Confirmation ---
  const handleSubmitAttempt = () => {
    console.log('Submit button clicked');
    setIsSubmitConfirmOpen(true);
  };
  const handleConfirmSubmit = () => {
    console.log('Confirm submit clicked');
    setIsSubmitConfirmOpen(false);
    handleSubmit();
  };

  // --- Cancel Modal ---
  const handleAttemptClose = () => {
    console.log('Cancel button clicked');
    setIsCancelConfirmOpen(true);
  };
  const handleConfirmClose = () => {
    setEquipments([{ id: Date.now(), section: '', type: '', range: '', serialNo: '', serialNumbers: [''], qty: 1, price: '0.00', basePrice: '' }]);
    setScheduledDate(new Date());
    setExpectedCompletionDate(null);
    setIsExpectedCompletionManuallySet(false);
    onClose();
    setIsCancelConfirmOpen(false);
  };

  if (!isOpen) return null;

  // --- UI ---
  return (
    <>
      {/* Loading Screen Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <svg className="animate-spin h-16 w-16 text-[#2a9dab] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Submitting Request</h3>
            <p className="text-gray-600 mb-4">Please wait while we process your request...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-[#2a9dab] h-2 rounded-full animate-pulse" style={{
                width: '60%',
                animation: 'progressBar 2s ease-in-out infinite'
              }}></div>
            </div>
            <style jsx>{`
              @keyframes progressBar {
                0% { width: 0%; }
                50% { width: 60%; }
                100% { width: 0%; }
              }
            `}</style>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleConfirmClose}
        title="Cancel Request?"
        message="Are you sure you want to cancel this reservation?"
        type="warning"
        confirmText="Yes, Cancel"
        cancelText="No"
        zIndex="z-[60]"
      />
      <ConfirmationModal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Request?"
        message="Are you sure you want to submit this calibration request?"
        type="info"
        confirmText="Yes, Submit"
        cancelText="No"
        zIndex="z-[60]"
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-7xl max-h-[90vh] font-sans flex flex-col justify-center border border-gray-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 whitespace-nowrap">Add New Request</h2>
            <button onClick={handleAttemptClose} className="text-gray-400 hover:text-[#2a9dab] text-xl font-bold transition-colors">✕</button>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
              {/* Client Information */}
              <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Client Information</h3>
                {isLoadingClient ? (
                  <div className="text-center">Loading client information...</div>
                ) : !clientInfo ? (
                  <div className="text-center text-red-500">Failed to load client information.</div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" value={clientInfo.name || ''} readOnly className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input type="text" value={clientInfo.contact_number || ''} readOnly className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={clientInfo.email || ''} readOnly className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <input type="text" value={clientInfo.company || ''} readOnly className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type of Industry</label>
                        <input type="text" value={clientInfo.industry_type || ''} readOnly className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Company Head</label>
                        <input type="text" value={clientInfo.company_head || ''} readOnly className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100" />
                      </div>
                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Province</label>
                          <input type="text" value={province || ''} readOnly className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <input type="text" value={city || ''} readOnly className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Barangay</label>
                          <input type="text" value={barangay || ''} readOnly className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Schedule Dates Section */}
              <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col max-w-xs w-60 justify-center mx-auto">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Schedule</h3>
                <div className="flex-1 flex flex-col gap-4 justify-start">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                    <DatePicker
                      selected={scheduledDate}
                      onChange={date => setScheduledDate(date)}
                      minDate={new Date()}
                      className="mt-1 w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Scheduled date"
                      popperPlacement="bottom"
                      popperProps={{
                        strategy: 'fixed',
                        modifiers: [
                          {
                            name: 'preventOverflow',
                            options: { boundary: 'viewport' },
                          },
                          {
                            name: 'zIndex',
                            enabled: true,
                            phase: 'write',
                            fn: ({ state }) => {
                              state.styles.popper.zIndex = 9999;
                            },
                          },
                        ],
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expected Completion</label>
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
                      popperPlacement="bottom"
                      popperProps={{
                        strategy: 'fixed',
                        modifiers: [
                          {
                            name: 'preventOverflow',
                            options: { boundary: 'viewport' },
                          },
                          {
                            name: 'zIndex',
                            enabled: true,
                            phase: 'write',
                            fn: ({ state }) => {
                              state.styles.popper.zIndex = 9999;
                            },
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Equipment Information */}
            <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
              <h3 className="text-lg font-medium mb-3">Sample Details</h3>
              <div className="max-h-[170px] overflow-y-auto" style={{ scrollbarGutter: 'stable', scrollBehavior: 'smooth' }}>
                <div className="grid grid-cols-[3fr_2fr_2fr_2fr_minmax(120px,_1fr)_1fr_auto] gap-x-3 items-center font-bold text-xs text-gray-700 px-3 py-2 sticky top-0 bg-white z-10 border-b">
                  <span>Sample</span>
                  <span>Test Request/Calibration</span>
                  <span>Calibration Test/Method</span>
                  <span>Serial Number(s)</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-center">Price</span>
                  <span className="w-8"></span>
                </div>
                <div className="space-y-2 py-1">
                  {equipments.map((equip) => (
                    <div key={equip.id} className="grid grid-cols-[3fr_2fr_2fr_2fr_minmax(120px,_1fr)_1fr_auto] gap-x-3 items-center px-3">
                      <select
                        value={equip.section}
                        onChange={e => handleEquipmentChange(equip.id, 'section', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                      >
                        <option value="">Select Sample</option>
                        <option value="Weighing Scale">Weighing Scale</option>
                        <option value="Test-Weights">Test-Weights</option>
                        <option value="Thermometer">Thermometer</option>
                        <option value="Sphygmomanometer">Sphygmomanometer</option>
                        <option value="Thermohygrometer">Thermohygrometer</option>
                      </select>
                      {equip.section === 'Weighing Scale' ? (
                        <select
                          value={equip.type}
                          onChange={e => handleEquipmentChange(equip.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                        >
                          <option value="">Select Test Request/Calibration</option>
                          <option value="Special Accuracy I (Nawi)">Special Accuracy I (Nawi)</option>
                          <option value="High Accuracy II (Nawi)">High Accuracy II (Nawi)</option>
                          <option value="Medium Accuracy III (Nawi)">Medium Accuracy III (Nawi)</option>
                          <option value="Ordinary III (Nawi)">Ordinary III (Nawi)</option>
                          <option value="Weighing Scale Ordinary III (platform balance)">Weighing Scale Ordinary III (platform balance)</option>
                        </select>
                      ) : equip.section === 'Test-Weights' ? (
                        <select
                          value={equip.type}
                          onChange={e => handleEquipmentChange(equip.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                        >
                          <option value="">Select Test Request/Calibration</option>
                          <option value="1 kg to 10 kg (OIML Class F2)">1 kg to 10 kg (OIML Class F2)</option>
                          <option value="10 kg to 20 kg (OIML Class F2)">10 kg to 20 kg (OIML Class F2)</option>
                          <option value="20 kg to 50 kg (OIML Class F2)">20 kg to 50 kg (OIML Class F2)</option>
                          <option value="up to 5 kg (OIML Class M1/M2/M3)">up to 5 kg (OIML Class M1/M2/M3)</option>
                          <option value="10 kg to 20 kg (OIML Class M1/M2/M3)">10 kg to 20 kg (OIML Class M1/M2/M3)</option>
                          <option value="25 kg to 50 kg (OIML Class M1/M2/M3)">25 kg to 50 kg (OIML Class M1/M2/M3)</option>
                        </select>
                      ) : equip.section === 'Thermometer' ? (
                        <select
                          value={equip.type}
                          onChange={e => handleEquipmentChange(equip.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                        >
                          <option value="">Select Test Request/Calibration</option>
                          <option value="-20°C to +80°C (Digital Thermometer)">-20°C to +80°C (Digital Thermometer)</option>
                          <option value="-30°C to +100°C (Wall / Refrigerator / Bimetallic Thermometer)">-30°C to +100°C (Wall / Refrigerator / Bimetallic Thermometer)</option>
                          <option value="0°C to 45°C (Room, Max & Min Liquid, Thermograph Dial Type & Electronics)">0°C to 45°C (Room, Max & Min Liquid, Thermograph Dial Type & Electronics)</option>
                        </select>
                      ) : equip.section === 'Sphygmomanometer' ? (
                        <select
                          value={equip.type}
                          onChange={e => handleEquipmentChange(equip.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                        >
                          <option value="">Select Test Request/Calibration</option>
                          <option value="0 bar to 1 bar mmHg to 750 mmHg">0 bar to 1 bar mmHg to 750 mmHg</option>
                        </select>
                      ) : equip.section === 'Thermohygrometer' ? (
                        <select
                          value={equip.type}
                          onChange={e => handleEquipmentChange(equip.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                        >
                          <option value="">Select Test Request/Calibration</option>
                          <option value="0-100% Rh, 0-100°C (Electronic and Dial Thermohygrometer)">0-100% Rh, 0-100°C (Electronic and Dial Thermohygrometer)</option>
                        </select>
                      ) : (
                        <select
                          value={equip.type}
                          onChange={e => handleEquipmentChange(equip.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                        >
                          <option value="">Select Test Request/Calibration</option>
                        </select>
                      )}
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
                            placeholder={`Serial Number #${index + 1}`}
                            value={equip.serialNumbers ? equip.serialNumbers[index] || '' : (index === 0 ? equip.serialNo || '' : '')}
                            onChange={e => handleSerialNumberChange(equip.id, index, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab]"
                          />
                        ))}
                      </div>
                      <div className="flex flex-row items-center justify-center gap-1">
                        <button onClick={() => handleQtyChange(equip.id, -1)} className="px-3 py-2 border border-red-500 rounded-l text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100">-</button>
                        <span className="px-4 py-2 border-t border-b text-sm font-semibold text-gray-700 bg-white w-12 text-center block">{equip.qty}</span>
                        <button onClick={() => handleQtyChange(equip.id, 1)} className="px-3 py-2 border border-green-500 rounded-r text-sm font-semibold text-green-600 bg-green-50 hover:bg-green-100">+</button>
                      </div>
                      <div className="flex items-center justify-center">
                        {equip.basePrice ? (
                          <span className="text-base font-semibold text-gray-800 text-center w-24 flex-shrink-0">{equip.price || '0.00'}</span>
                        ) : (
                          <input
                            type="number"
                            placeholder="Price"
                            value={equip.price.toString().replace(/,/g, '')}
                            onChange={e => handleEquipmentChange(equip.id, 'price', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] text-center"
                          />
                        )}
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
              <button onClick={handleAddEquipment} className="mt-2 text-sm text-blue-600 hover:text-blue-800">+ Add another equipment</button>
            </div>
          </div>
          <div className="flex justify-between items-center gap-4 mt-8">
            <div className="text-2xl font-bold text-gray-700">
              Total Fee: <span className="text-2xl font-bold text-[#2a9dab]">₱ {totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={handleAttemptClose} className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 font-semibold">Cancel</button>
              <button
                onClick={handleSubmitAttempt}
                disabled={isLoadingClient || !clientInfo || isSubmitting}
                className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#217a8c] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
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
          </div>
        </div>
      </div>
    </>
  );
};

const FrontRequest = () => {
  const [reservations, setReservations] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isTableAnimating, setIsTableAnimating] = useState(false);
  const { user } = useAuth();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  // TODO: Get client ID from auth context or route
  const clientId = user?.client_id;

  const fetchReservations = async () => {
    if (!clientId) {
        setReservations([]);
        return;
    }
    setIsTableAnimating(true);
    try {
      // We will use a hardcoded client ID for now
      const response = await apiService.getRequestsByClientId(clientId);
      if (response.data && response.data.records) {
        setReservations(response.data.records);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to fetch reservations.');
    } finally {
        setTimeout(() => setIsTableAnimating(false), 500);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchReservations();
    }
  }, [clientId]);

  // Reset to first page when reservations change
  useEffect(() => {
    setCurrentPage(1);
  }, [reservations.length]);

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsViewModalOpen(true);
  };

  // Pagination calculations
  const totalPages = Math.ceil(reservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations = reservations.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-6 bg-gray-100 h-full">
        <Toaster />
        <AddRequestModal 
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            fetchReservations();
          }}
          user={user}
        />
        <ViewRequestModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          reservation={selectedReservation}
        />
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Requests</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#2a9dab] text-white px-4 py-2 rounded-lg hover:bg-[#217a8c] transition-colors"
            >
              Add Request
            </button>
          </div>
          <div className={isTableAnimating ? "overflow-visible" : "overflow-visible"}>
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentReservations.length > 0 ? currentReservations.map((reservation, index) => (
                  <tr 
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(reservation.date_created).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.status && reservation.status.toLowerCase() === 'pending' ? (
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-xs">Pending</span>
                      ) : reservation.status && reservation.status.toLowerCase() === 'in_progress' ? (
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">In Progress</span>
                      ) : reservation.status && reservation.status.toLowerCase() === 'completed' ? (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-xs">Completed</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-semibold text-xs">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => handleViewDetails(reservation)}
                        className="px-3 py-1 rounded text-xs font-semibold focus:outline-none transition-colors duration-200 border bg-[#2a9dab]/20 text-[#2a9dab] border-[#2a9dab]/30 hover:bg-[#2a9dab]/30">
                        View Details
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-500">
                      You have no reservations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {reservations.length > itemsPerPage && (
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
                Showing {startIndex + 1}-{Math.min(endIndex, reservations.length)} of {reservations.length} results
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default FrontRequest; 