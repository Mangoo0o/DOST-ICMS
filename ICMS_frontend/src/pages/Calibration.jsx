import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { MdScience, MdScale, MdStraighten, MdThermostat, MdSpeed } from 'react-icons/md';
import { FaFlask, FaBalanceScale, FaThermometerHalf, FaWeightHanging, FaSearch } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../pages/custom-datepicker.css';
import { useNavigate } from 'react-router-dom';
import dostLogo from '../assets/dost logo.svg';
import Modal from '../components/Modal';

// Add scrollbar hiding styles
const scrollbarStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Map section types to icons
const sectionIcons = {
  'Volume Standards': <FaFlask className="text-blue-500 w-10 h-10" />,
  'Mass Standards': <FaWeightHanging className="text-green-500 w-10 h-10" />,
  'Calibration of Non-Automatic Weighing Instrument': <MdScale className="text-yellow-500 w-10 h-10" />,
  'Length Standards': <MdStraighten className="text-purple-500 w-10 h-10" />,
  'Thermometer and Hygrometer Standards': <FaThermometerHalf className="text-red-500 w-10 h-10" />,
  'Pressure Standard': <MdSpeed className="text-pink-500 w-10 h-10" />,
};

// Step counts and step names for each calibration type
const calibrationTypeStepNames = {
  'Weighing Scale': [
    'Equipment & Environment',
    'Reference Weights',
    'Linearity Test',
    'Eccentricity Test',
    'Repeatability Test',
    'Uncertainty & Certification',
  ],
  'Thermometer': [
    'Reference Standard',
    'Repeatability',
    'Readability',
    'Calculation',
    'Results',
  ],
  'Thermohygrometer': [
    'Test Point Readings',
    'Uncertainty Components',
    'Results',
  ],
  // Add more as needed
};

const calibrationTypeSteps = Object.fromEntries(
  Object.entries(calibrationTypeStepNames).map(([type, steps]) => [type, steps.length])
);

function getSectionIcon(section) {
  return sectionIcons[section] || <MdScience className="text-gray-400 w-10 h-10" />;
}

// Normalize common variations to canonical calibration type names
function normalizeCalibrationType(rawType) {
  if (!rawType) return '';
  const t = String(rawType).trim().toLowerCase();
  if (t.includes('weighing') && t.includes('scale')) return 'Weighing Scale';
  if (t === 'thermometer') return 'Thermometer';
  if (t.includes('thermo') && t.includes('hygro')) return 'Thermohygrometer';
  if (t.includes('test') && t.includes('weight')) return 'Test Weights';
  if (t.includes('sphyg')) return 'Sphygmomanometer';
  return rawType; // fallback to original
}

// Centralized router for calibration pages
function navigateToCalibration(navigate, type, sample, currentStep) {
  const normalized = normalizeCalibrationType(type);
  const serialNumber = sample.serial_no;
  const equipmentId = sample.id;
  switch (normalized) {
    case 'Weighing Scale':
      navigate('/uncertainty-calculation', { state: { serialNumber, equipmentId, currentStep } });
      return true;
    case 'Thermometer':
      navigate('/thermometer-uncertainty-calculator', { state: { serialNumber, equipmentId, currentStep } });
      return true;
    case 'Thermohygrometer':
      navigate('/thermohygrometer-uncertainty-calculator', { state: { serialNumber, equipmentId, currentStep } });
      return true;
    case 'Test Weights':
      navigate('/test-weights-calibration', { state: { serialNumber, equipmentId, currentStep } });
      return true;
    case 'Sphygmomanometer':
      navigate('/sphygmomanometer-calibration', { state: { serialNumber, equipmentId, currentStep } });
      return true;
    default:
      return false;
  }
}

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

function getProgress(scheduled, expected) {
  const now = new Date();
  const start = new Date(scheduled);
  const end = new Date(expected);
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

// Add a circular progress bar component
function CircularProgressBar({ progress }) {
  const size = 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb" // Tailwind gray-200
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2a9dab" // Teal accent
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        fontSize="1.5rem"
        fill="#2a9dab"
        fontWeight="bold"
      >
        {progress}%
      </text>
    </svg>
  );
}

// --- ViewReservationModal copied from FrontReservation.jsx ---
const getStatusBadge = (status) => {
  if (!status) return 'bg-gray-400';
  switch (status?.toLowerCase()) {
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

const ViewReservationModal = ({ isOpen, onClose, reservation, onViewDetails, sampleId }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sampleStepStatus, setSampleStepStatus] = useState({});
  const navigate = useNavigate();

  const handleCalibrateClick = async (sample) => {
    try {
      const res = await apiService.getCalibrationRecordBySampleId(sample.id);
      if (res.data && res.data.calibration_type && res.data.has_calibration !== false) {
        // There is existing calibration data
        let input = res.data.input_data;
        if (typeof input === 'string') {
          try { input = JSON.parse(input); } catch { input = {}; }
        }
        const currentStep = input.currentStep || 1;
        const calibrationType = res.data.calibration_type;

        // Navigate based on calibration type
        if (calibrationType === 'Weighing Scale') {
          navigate('/uncertainty-calculation', {
            state: {
              serialNumber: sample.serial_no,
              equipmentId: sample.id,
              currentStep
            }
          });
          return;
        }
        if (calibrationType === 'Thermometer') {
          navigate('/thermometer-uncertainty-calculator', {
            state: {
              serialNumber: sample.serial_no,
              equipmentId: sample.id,
              currentStep
            }
          });
          return;
        }
        if (calibrationType === 'Thermohygrometer') {
          navigate('/thermohygrometer-uncertainty-calculator', {
            state: {
              serialNumber: sample.serial_no,
              equipmentId: sample.id,
              currentStep
            }
          });
          return;
        }
        if (calibrationType === 'Test Weights') {
          navigate('/test-weights-calibration', {
            state: {
              serialNumber: sample.serial_no,
              equipmentId: sample.id,
              currentStep
            }
          });
          return;
        }
        if (calibrationType === 'Sphygmomanometer') {
          navigate('/sphygmomanometer-calibration', {
            state: {
              serialNumber: sample.serial_no,
              equipmentId: sample.id,
              currentStep
            }
          });
          return;
        }
        // Add more types as needed
        toast.error('Calibration for this equipment type is not supported.');
        return;
      }
      // No calibration data: route based on the sample type
      if (navigateToCalibration(navigate, sample.type, sample)) return;
      toast.error('No calibration data found and equipment type is not supported.');
    } catch (e) {
      // On error, still try to route based on sample type
      if (navigateToCalibration(navigate, sample.type, sample)) return;
      console.error('Error fetching calibration record:', e);
      toast.error('Unable to load calibration data. Please try again.');
    }
  };

  useEffect(() => {
    if (isOpen && reservation) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError('');
        try {
          const response = await apiService.getRequestDetails(reservation.reference_number);
          setDetails(response.data);
          
          // Fetch calibration step for each sample/sample (handle both cases)
          const sampleData = response.data?.sample || response.data?.sample;
          if (response.data && sampleData) {
            const statusObj = {};
            await Promise.all(
              sampleData.map(async (item) => {
                try {
                  const rec = await apiService.getCalibrationRecordBySampleId(item.id);
                  if (rec.data && rec.data.has_calibration === false) {
                    // No calibration record exists for this sample
                    statusObj[item.id] = { currentStep: null, status: item.status, calibrationType: null };
                  } else if (rec.data && rec.data.input_data) {
                    let input = rec.data.input_data;
                    if (typeof input === 'string') {
                      try { input = JSON.parse(input); } catch { input = {}; }
                    }
                    if (input.currentStep) {
                      statusObj[item.id] = {
                        currentStep: input.currentStep,
                        status: rec.data.status || item.status,
                        calibrationType: rec.data.calibration_type
                      };
                    } else {
                      statusObj[item.id] = { currentStep: null, status: rec.data.status || item.status, calibrationType: rec.data.calibration_type };
                    }
                  } else {
                    statusObj[item.id] = { currentStep: null, status: item.status, calibrationType: null };
                  }
                } catch (err) {
                  // Log unexpected errors
                  console.warn(`Error loading calibration record for sample ${item.id}:`, err);
                  statusObj[item.id] = { currentStep: null, status: item.status, calibrationType: null };
                }
              })
            );
            setSampleStepStatus(statusObj);
          }
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
          <h2 className="text-2xl font-bold">Reservation Details</h2>
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
                  {details.date_expected_completion && (
                    <p className="text-sm text-gray-500">Expected Completion: {new Date(details.date_expected_completion).toLocaleDateString()}</p>
                  )}
                </div>
                <span className={`capitalize px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusBadge(details.status)}`}>
                  {getStatusText(details.status)}
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
                {(details.sample || details.sample) && (details.sample || details.sample).length > 0 ? (
                  <div className="overflow-x-auto scrollbar-hide hover:scrollbar-show">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Type of Equipment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Range/Capacity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Serial Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Status</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(sampleId
                          ? (details.sample || details.sample).filter(item => item.id === sampleId)
                          : (details.sample || details.sample)
                        ).map((item, index) => (
                          <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: index * 0.05,
                              ease: "easeOut"
                            }}
                            className="transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-lg"
                            whileHover={{ 
                              backgroundColor: "#f9fafb",
                              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                            }}
                          >
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap transition-colors duration-200">{item.type}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap transition-colors duration-200">{item.range}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap transition-colors duration-200">{item.serial_no || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              {/* Show stepper-based status if available and not completed */}
                              {sampleStepStatus[item.id] && sampleStepStatus[item.id].currentStep && sampleStepStatus[item.id].status !== 'completed' ? (
                                (() => {
                                  const calibrationType = sampleStepStatus[item.id].calibrationType || item.type || '';
                                  const stepNames = calibrationTypeStepNames[calibrationType] || [];
                                  const stepIdx = sampleStepStatus[item.id].currentStep - 1;
                                  const stepName = stepNames[stepIdx] || '';
                                  return stepName ? (
                                    <motion.span 
                                      className="capitalize px-2 py-1 text-xs font-semibold text-white rounded-full bg-blue-500"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {stepName}
                                    </motion.span>
                                  ) : (
                                    <motion.span 
                                      className={`capitalize px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusBadge(item.status)}`}
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {getStatusText(item.status)}
                                    </motion.span>
                                  );
                                })()
                              ) : (
                                <motion.span 
                                  className={`capitalize px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusBadge(item.status)}`}
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {getStatusText(item.status)}
                                </motion.span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              {item.status === 'completed' ? (
                                <motion.button
                                  className="px-3 py-1 rounded border border-green-600 bg-green-50 text-green-700 font-semibold text-xs hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200"
                                  onClick={() => onViewDetails(item.id)}
                                  whileHover={{ 
                                    scale: 1.05,
                                    backgroundColor: "#dcfce7",
                                    boxShadow: "0 2px 4px rgba(34, 197, 94, 0.2)"
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  View Details
                                </motion.button>
                              ) : (
                                <motion.button
                                  className="px-3 py-1 rounded border border-[#2a9dab] bg-[#e0f7fa] text-[#2a9dab] font-semibold text-xs hover:bg-[#d0f0f7] focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-all duration-200"
                                  onClick={() => handleCalibrateClick(item)}
                                  whileHover={{ 
                                    scale: 1.05,
                                    backgroundColor: "#d0f0f7",
                                    boxShadow: "0 2px 4px rgba(42, 197, 171, 0.2)"
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Calibrate
                                </motion.button>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No sample listed for this reservation.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// --- End ViewReservationModal ---

const Calibration = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isViewCalibModalOpen, setIsViewCalibModalOpen] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [calibRecord, setCalibRecord] = useState(null);
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmButtonText, setConfirmButtonText] = useState('');
  const [confirmButtonColor, setConfirmButtonColor] = useState('');
  const [sampleProgress, setEquipmentProgress] = useState({}); // { reservationRef: avgProgress }
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  


  const fetchReservations = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Add cache busting parameter if force refresh
      const url = forceRefresh ? `/api/request/read.php?t=${Date.now()}` : '/api/request/read.php';
      const response = await apiService.getRequests(forceRefresh);
      if (response.data && response.data.records) {
        // Filter for accepted/in_progress/completed reservations
        const accepted = response.data.records.filter(r => 
          r.status === 'in_progress' || r.status === 'completed'
        );
        setReservations(accepted);

          // Fetch calibration progress for each reservation's sample
          const progressObj = {};
          await Promise.all(accepted.map(async (reservation) => {
            if (reservation.sample && reservation.sample.length > 0) {
              let totalProgress = 0;
              let count = 0;
              let allCompleted = true;
              await Promise.all(reservation.sample.map(async (eq) => {
                try {
                  const rec = await apiService.getCalibrationRecordBySampleId(eq.id);
                  let input = rec.data && rec.data.input_data;
                  if (typeof input === 'string') {
                    try { input = JSON.parse(input); } catch { input = {}; }
                  }
                  let progress = 0;
                  const stepCount = calibrationTypeSteps[rec.data?.calibration_type] || 1;
                  if ((rec.data && (rec.data.status === 'completed' || eq.status === 'completed'))) {
                    progress = 100;
                  } else if (input && input.currentStep && stepCount > 1) {
                    progress = Math.round((input.currentStep / stepCount) * 100);
                    allCompleted = false;
                  } else {
                    allCompleted = false;
                  }
                  totalProgress += progress;
                  count++;
                } catch {
                  // No calibration record, progress is 0
                  totalProgress += 0;
                  allCompleted = false;
                  count++;
                }
              }));
              progressObj[reservation.reference_number] = (allCompleted && count > 0) ? 100 : (count > 0 ? Math.round(totalProgress / count) : 0);
            } else {
              progressObj[reservation.reference_number] = 0;
            }
          }));
          setEquipmentProgress(progressObj);
        } else {
          setReservations([]);
        }
      } catch (error) {
        toast.error('Failed to fetch requests.');
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Refresh data when page becomes visible (user returns from calibration)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchReservations();
      }
    };

    // Also listen for custom calibration completion events
    const handleCalibrationCompleted = () => {
      fetchReservations(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('calibration-completed', handleCalibrationCompleted);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('calibration-completed', handleCalibrationCompleted);
    };
  }, []);

  // Reset to first page when search or date filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate]);

  // Filter reservations based on search and date
  const filteredReservations = reservations.filter(r => {
    const clientName = (r.client_name || '').toLowerCase();
    const referenceNumber = String(r.reference_number || '').toLowerCase();
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = clientName.includes(term) || referenceNumber.includes(term);
    const matchesDate = !selectedDate || (r.date_scheduled && new Date(r.date_scheduled).toDateString() === selectedDate.toDateString());
    return matchesSearch && matchesDate;
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

  const handleCardClick = (reservation) => {
    setSelectedReservation(reservation);
  };

  const handleBack = () => {
    setSelectedReservation(null);
  };

  const handleViewDetails = async (sampleId) => {
    setSelectedSampleId(sampleId);
    setIsViewCalibModalOpen(true);
    try {
      const res = await apiService.getCalibrationRecordBySampleId(sampleId);
      
      // Check if the response indicates no calibration record exists
      if (res.data && res.data.has_calibration === false) {
        setCalibRecord(null);
      } else {
        setCalibRecord(res.data);
      }
    } catch (e) {
      setCalibRecord(null);
    }
  };

  const handleCloseCalibModal = () => {
    setIsViewCalibModalOpen(false);
    setSelectedSampleId(null);
    setCalibRecord(null);
  };

  // Confirmation handlers
  const showConfirmation = (action, message, buttonText, buttonColor = 'bg-red-500') => {
    setConfirmAction(() => action); // Wrap in function to prevent immediate execution
    setConfirmMessage(message);
    setConfirmButtonText(buttonText);
    setConfirmButtonColor(buttonColor);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Toaster />
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="w-full mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md w-full mb-8 flex flex-col">
          {/* Page Header */}
          {!selectedReservation && (
            <div className="flex items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Calibration Management</h1>
            </div>
          )}
          
          {/* Search Bar */}
          {!selectedReservation ? (
            <>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Reference #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Requested At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Expected Completion</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Completed Equipment</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Not Completed Equipment</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentReservations.map((reservation, index) => {
                      const completedCount = reservation.sample ? reservation.sample.filter(eq => eq.status === 'completed').length : 0;
                      const notCompletedCount = reservation.sample ? reservation.sample.filter(eq => eq.status !== 'completed').length : 0;
                      return (
                        <motion.tr 
                          key={reservation.reference_number} 
                          className="hover:bg-gray-50 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-lg"
                          onClick={() => handleCardClick(reservation)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.05,
                            ease: "easeOut"
                          }}
                          whileHover={{ 
                            backgroundColor: "#f9fafb",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap font-semibold transition-colors duration-200 hover:text-[#2a9dab]">{reservation.reference_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap transition-colors duration-200">{reservation.date_scheduled ? new Date(reservation.date_scheduled).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap transition-colors duration-200">{reservation.date_expected_completion ? new Date(reservation.date_expected_completion).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-6 py-4 text-center text-sm text-green-600 font-bold whitespace-nowrap transition-all duration-200 hover:text-green-700 hover:scale-110">{completedCount}</td>
                          <td className="px-6 py-4 text-center text-sm text-red-600 font-bold whitespace-nowrap transition-all duration-200 hover:text-red-700 hover:scale-110">{notCompletedCount}</td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <motion.button
                              className="px-3 py-1 rounded border border-[#2a9dab] bg-[#e0f7fa] text-[#2a9dab] font-semibold text-xs hover:bg-[#d0f0f7] focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-all duration-200"
                              onClick={e => { 
                                e.stopPropagation(); 
                                handleCardClick(reservation);
                              }}
                              whileHover={{ 
                                scale: 1.05,
                                backgroundColor: "#d0f0f7",
                                boxShadow: "0 2px 4px rgba(42, 157, 171, 0.2)"
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View Details
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    })}
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
            </>
          ) : (
            <ReservationDetailsCard
              reservation={selectedReservation}
              onBack={handleBack}
              onViewDetails={handleViewDetails}
              sampleId={selectedSampleId}
            />
          )}
        </div>
      </div>
      {isViewCalibModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] border border-[#2a9dab] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0 p-6 pb-0">
              <h2 className="text-2xl font-bold text-[#2a9dab]">Calibration Record Details</h2>
              <button
                onClick={handleCloseCalibModal}
                className="text-gray-500 hover:text-gray-700 text-lg print:hidden"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Print Certificate Layout (hidden except for print) */}
              <div id="print-certificate" className="hidden print:block print:bg-white print:p-0 print:m-0 print:shadow-none print:rounded-none">
              <div className="p-8 print:p-0" style={{ fontFamily: 'Arial, sans-serif', color: '#222', minWidth: '700px' }}>
                {/* Header */}
                <div className="flex items-center mb-2">
                  <img src={dostLogo} alt="DOST Logo" style={{ width: 70, height: 70, marginRight: 16 }} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 18 }}>Republic of the Philippines</div>
                    <div style={{ color: '#0099cc', fontWeight: 'bold', fontSize: 20 }}>DEPARTMENT OF SCIENCE AND TECHNOLOGY</div>
                    <div style={{ fontWeight: 'bold', fontSize: 16 }}>Regional Office No. I</div>
                    <div style={{ fontWeight: 'bold', fontSize: 15 }}>Regional Standards and Testing Laboratory</div>
                  </div>
                </div>
                <hr className="my-2" />
                {/* Certificate Title */}
                <div className="text-center font-bold text-lg mb-2" style={{ letterSpacing: 1 }}>CALIBRATION CERTIFICATE</div>
                {/* Details Section */}
                <div className="grid grid-cols-2 gap-x-8 mb-4" style={{ fontSize: 15 }}>
                  <div>
                    <div>Reference No.: <b>{calibRecord?.calDetails?.referenceNo || ''}</b></div>
                    <div>Sample No.: <b>{calibRecord?.calDetails?.sampleNo || ''}</b></div>
                    <div>Date Submitted: <b>{calibRecord?.calDetails?.dateSubmitted || ''}</b></div>
                    <div>Date Calibrated: <b>{calibRecord?.calDetails?.dateCalibrated || ''}</b></div>
                    <div>Calibration Item: <b>{calibRecord?.calDetails?.type || ''}</b></div>
                    <div>Make: <b>{calibRecord?.calDetails?.manufacturer || ''}</b></div>
                    <div>Model: <b>{calibRecord?.calDetails?.model || ''}</b></div>
                    <div>Serial No.: <b>{calibRecord?.calDetails?.serialNo || ''}</b></div>
                  </div>
                  <div>
                    <div>Customer: <b>{calibRecord?.calDetails?.customer || ''}</b></div>
                    <div>Address: <b>{calibRecord?.calDetails?.address || ''}</b></div>
                  </div>
                </div>
                {/* Measurement Results */}
                <div className="font-bold mb-1" style={{ fontSize: 16 }}>MEASUREMENT RESULTS:</div>
                {/* Temperature Table */}
                <div className="mb-2"><b>A. Temperature Indicator Test</b></div>
                <table className="w-full mb-4 table-auto" style={{ borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#f3f3f3' }}>
                      <th className="border px-2 py-1">Reference Temperature</th>
                      <th className="border px-2 py-1">Digital Thermo-Hygrometer under Calibration Reading</th>
                      <th className="border px-2 py-1">Uncertainty of Calibration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[0,1,2].map(i => {
                      if (!calibRecord || !calibRecord.input_data || !calibRecord.result_data) return null;
                      let input = calibRecord.input_data;
                      let result = calibRecord.result_data;
                      try { input = typeof input === 'string' ? JSON.parse(input) : input; } catch { input = {}; }
                      try { result = typeof result === 'string' ? JSON.parse(result) : result; } catch { result = {}; }
                      const ref = input?.refReadings?.temp?.[i] || [0,0,0];
                      const uuc = input?.uucReadings?.temp?.[i] || [0,0,0];
                      const avg = arr => arr && arr.length ? arr.reduce((a,b) => a+b,0)/arr.length : 0;
                      let U_arr = result?.U_temp_arr || result?.U_temp || [];
                      if (!Array.isArray(U_arr)) U_arr = [U_arr,U_arr,U_arr];
                      return (
                        <tr key={i}>
                          <td className="border px-2 py-1">{avg(ref).toFixed(2)} &#8451;</td>
                          <td className="border px-2 py-1">{avg(uuc).toFixed(2)} &#8451;</td>
                          <td className="border px-2 py-1">{U_arr[i] !== undefined && !isNaN(U_arr[i]) ? Number(U_arr[i]).toFixed(2) : ''} &#8451;</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Humidity Table */}
                <div className="mb-2"><b>B. Humidity Indicator Test</b></div>
                <table className="w-full mb-4 table-auto" style={{ borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#f3f3f3' }}>
                      <th className="border px-2 py-1">Reference Rel. Humidity</th>
                      <th className="border px-2 py-1">Digital Thermo-Hygrometer under Calibration Reading</th>
                      <th className="border px-2 py-1">Uncertainty of Calibration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[0,1,2].map(i => {
                      if (!calibRecord || !calibRecord.input_data || !calibRecord.result_data) return null;
                      let input = calibRecord.input_data;
                      let result = calibRecord.result_data;
                      try { input = typeof input === 'string' ? JSON.parse(input) : input; } catch { input = {}; }
                      try { result = typeof result === 'string' ? JSON.parse(result) : result; } catch { result = {}; }
                      const ref = input?.refReadings?.humidity?.[i] || [0,0,0];
                      const uuc = input?.uucReadings?.humidity?.[i] || [0,0,0];
                      const avg = arr => arr && arr.length ? arr.reduce((a,b) => a+b,0)/arr.length : 0;
                      let U_arr = result?.U_humidity_arr || result?.U_humidity || [];
                      if (!Array.isArray(U_arr)) U_arr = [U_arr,U_arr,U_arr];
                      return (
                        <tr key={i}>
                          <td className="border px-2 py-1">{avg(ref).toFixed(2)} %rh</td>
                          <td className="border px-2 py-1">{avg(uuc).toFixed(2)} %rh</td>
                          <td className="border px-2 py-1">{U_arr[i] !== undefined && !isNaN(U_arr[i]) ? Number(U_arr[i]).toFixed(2) : ''} %rh</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Uncertainty Statement */}
                <div className="font-bold mt-4 mb-1">UNCERTAINTY OF MEASUREMENT:</div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  The uncertainty stated is the expanded uncertainty obtained by multiplying the standard uncertainty by the coverage factor k=2, as determined in accordance with the "Guide to the Expression of Uncertainty (GUM)". The value of the measurand lies within the assigned range of values with a probability of 95%.
                </div>
                {/* Standards Used and Traceability */}
                <div className="font-bold mt-4 mb-1">STANDARDS USED AND TRACEABILITY</div>
                <table className="w-full mb-4 table-auto" style={{ borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#f3f3f3' }}>
                      <th className="border px-2 py-1">Name of Standard</th>
                      <th className="border px-2 py-1">Calibration Certificate No.</th>
                      <th className="border px-2 py-1">Issuing Lab/Traceability</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-2 py-1">Humidity and Temperature Transmitter</td>
                      <td className="border px-2 py-1">MIRDC-102023-INS-0809E</td>
                      <td className="border px-2 py-1">MIRDC</td>
                    </tr>
                  </tbody>
                </table>
                {/* Procedure, Conditions, Remarks, Signatories (Page 2) */}
                <div className="page-break-before print:block" style={{ pageBreakBefore: 'always' }}></div>
                <div className="flex items-center mb-2 mt-2">
                  <img src={dostLogo} alt="DOST Logo" style={{ width: 70, height: 70, marginRight: 16 }} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 18 }}>Republic of the Philippines</div>
                    <div style={{ color: '#0099cc', fontWeight: 'bold', fontSize: 20 }}>DEPARTMENT OF SCIENCE AND TECHNOLOGY</div>
                    <div style={{ fontWeight: 'bold', fontSize: 16 }}>Regional Office No. I</div>
                    <div style={{ fontWeight: 'bold', fontSize: 15 }}>Regional Standards and Testing Laboratory</div>
                  </div>
                </div>
                <hr className="my-2" />
                <table className="w-full mb-4 table-auto" style={{ borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#f3f3f3' }}>
                      <th className="border px-2 py-1">Name of Standard</th>
                      <th className="border px-2 py-1">Calibration Certificate No.</th>
                      <th className="border px-2 py-1">Issuing Lab/Traceability</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-2 py-1">Humidity and Temperature Transmitter</td>
                      <td className="border px-2 py-1">MIRDC-102023-INS-0809E</td>
                      <td className="border px-2 py-1">MIRDC</td>
                    </tr>
                  </tbody>
                </table>
                <div className="font-bold mt-2 mb-1">CALIBRATION PROCEDURE:</div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  The procedure used is the comparison between the Unit Under Calibration reading against the reference temperature reading within controlled temperature and humidity controlled chamber;12 100 27534 TMS.
                </div>
                <div className="font-bold mt-2 mb-1">MEASUREMENT CONDITIONS:</div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  Prior to performing any calibration tests, the item need to be acclimated to the ambient conditions of the laboratory. In particular, all readings are taken after stabilization of reference and Unit under test.
                </div>
                <div className="font-bold mt-2 mb-1">ENVIRONMENTAL CONDITIONS</div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  Ambient Temperature: <b>25.5 &#8451;</b><br />
                  Relative Humidity: <b>53 % RH</b>
                </div>
                <div className="font-bold mt-2 mb-1">REMARKS:</div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  1. The results given in this report are obtained at the time of the test and refer only to the particular instrument submitted. This report shall not be reproduced except in full, without the written approval of the laboratory.<br />
                  2. This instrument was calibrated using reference standard traceable to SI Units of measurement through National Metrology Laboratory.<br />
                  3. The End user should determine the suitability of sample for its intended use.<br />
                  4. No adjustments were performed on the thermo-hygrometer/sensor.
                </div>
                {/* Signatories */}
                <div className="flex justify-between mt-8" style={{ fontSize: 15 }}>
                  <div>
                    <div className="font-bold">Calibrated by:</div>
                    <div style={{ marginTop: 32, fontWeight: 'bold', textDecoration: 'underline' }}>JULIUS R. ALVIOR</div>
                    <div>Calibration Engineer</div>
                  </div>
                  <div>
                    <div className="font-bold">Certified by:</div>
                    <div style={{ marginTop: 32, fontWeight: 'bold', textDecoration: 'underline' }}>BERNADINE P. SUNIEGA</div>
                    <div>Technical Manager</div>
                  </div>
                </div>
                {/* Footer */}
                <div className="mt-8 pt-4 border-t text-xs text-gray-700 flex flex-col print:fixed print:bottom-0 print:left-0 print:w-full" style={{ fontSize: 12 }}>
                  <div className="flex justify-between">
                    <div>
                      Postal Address: Government Center, Sevilla<br />
                      City of San Fernando, La Union<br />
                      e-mail address: rml@region1.dost.gov.ph
                    </div>
                    <div>
                      Tel./Fax No.: (072) 242-0663<br />
                      Mobile No.: +63 968 443 5399<br />
                      URL: http://region1.dost.gov.ph
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div>CORE VALUES</div>
                    <div className="text-blue-700 font-bold">INNOVATION • EXCELLENCE • LEADERSHIP • INTEGRITY • TEAMWORK • EMPOWERMENT</div>
                  </div>
                  <div className="text-right mt-1">Page 1 of 2</div>
                </div>
              </div>
            </div>
            {calibRecord ? (
              <>
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div><span className="font-semibold text-gray-700">Calibration Type:</span> <span className="text-gray-900">{calibRecord.calibration_type || 'Not specified'}</span></div>
                  <div><span className="font-semibold text-gray-700">Date:</span> <span className="text-gray-900">{calibRecord.created_at ? new Date(calibRecord.created_at).toLocaleString() : calibRecord.date_completed ? new Date(calibRecord.date_completed).toLocaleString() : 'Not available'}</span></div>
                </div>
                

                <div className="overflow-x-auto">
                  {calibRecord.calibration_type === 'Thermohygrometer' ? (
                    <div>
                      {/* Temperature Results Table */}
                      <h3 className="font-semibold mb-2">A. TEMPERATURE INDICATOR TEST</h3>
                      <table className="w-full border text-xs mb-6 table-auto">
                        <thead>
                          <tr>
                            <th className="border p-1">REFERENCE TEMPERATURE</th>
                            <th className="border p-1">THERMO-HYGROMETER UNDER CALIBRATION READING</th>
                            <th className="border p-1">UNCERTAINTY OF CALIBRATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[0,1,2].map(i => {
                            // Defensive: parse input_data/result_data
                            if (!calibRecord || !calibRecord.input_data || !calibRecord.result_data) return null;
                            let input = calibRecord.input_data;
                            let result = calibRecord.result_data;
                            try { input = typeof input === 'string' ? JSON.parse(input) : input; } catch { input = {}; }
                            try { result = typeof result === 'string' ? JSON.parse(result) : result; } catch { result = {}; }
                            // Get reference and UUC readings
                            const ref = input?.refReadings?.temp?.[i] || [0,0,0];
                            const uuc = input?.uucReadings?.temp?.[i] || [0,0,0];
                            // Use average for display
                            const avg = arr => arr && arr.length ? arr.reduce((a,b) => a+b,0)/arr.length : 0;
                            // Get U value from result_data if available (array or single value)
                            let U_arr = result?.U_temp_arr || result?.U_temp || [];
                            if (!Array.isArray(U_arr)) U_arr = [U_arr,U_arr,U_arr];
                            return (
                              <tr key={i}>
                                <td className="border p-1">{avg(ref).toFixed(2)} °C</td>
                                <td className="border p-1">{avg(uuc).toFixed(2)} °C</td>
                                <td className="border p-1">{U_arr[i] !== undefined && !isNaN(U_arr[i]) ? Number(U_arr[i]).toFixed(2) : ''} °C</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {/* Humidity Results Table */}
                      <h3 className="font-semibold mb-2">B. HUMIDITY INDICATOR TEST</h3>
                      <table className="w-full border text-xs mb-2 table-auto">
                        <thead>
                          <tr>
                            <th className="border p-1">REFERENCE HUMIDITY @ 23°C</th>
                            <th className="border p-1">THERMO-HYGROMETER UNDER CALIBRATION READING</th>
                            <th className="border p-1">UNCERTAINTY OF CALIBRATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[0,1,2].map(i => {
                            if (!calibRecord || !calibRecord.input_data || !calibRecord.result_data) return null;
                            let input = calibRecord.input_data;
                            let result = calibRecord.result_data;
                            try { input = typeof input === 'string' ? JSON.parse(input) : input; } catch { input = {}; }
                            try { result = typeof result === 'string' ? JSON.parse(result) : result; } catch { result = {}; }
                            const ref = input?.refReadings?.humidity?.[i] || [0,0,0];
                            const uuc = input?.uucReadings?.humidity?.[i] || [0,0,0];
                            const avg = arr => arr && arr.length ? arr.reduce((a,b) => a+b,0)/arr.length : 0;
                            let U_arr = result?.U_humidity_arr || result?.U_humidity || [];
                            if (!Array.isArray(U_arr)) U_arr = [U_arr,U_arr,U_arr];
                            return (
                              <tr key={i}>
                                <td className="border p-1">{avg(ref).toFixed(2)} %rh</td>
                                <td className="border p-1">{avg(uuc).toFixed(2)} %rh</td>
                                <td className="border p-1">{U_arr[i] !== undefined && !isNaN(U_arr[i]) ? Number(U_arr[i]).toFixed(2) : ''} %rh</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          onClick={() => {
                            console.log('Print Certificate clicked for sample_id:', calibRecord.sample_id);
                            const certUrl = `http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/calibration/generate_certificate.php?sample_id=${calibRecord.sample_id}`;
                            console.log('Certificate URL:', certUrl);
                            
                            showConfirmation(
                              () => {
                                console.log('Opening certificate URL:', certUrl);
                                const newWindow = window.open(certUrl, '_blank');
                                if (!newWindow) {
                                  alert('Popup blocked! Please allow popups for this site and try again.');
                                } else {
                                  console.log('Certificate window opened successfully');
                                }
                                handleCloseCalibModal();
                              },
                              'Are you sure you want to print the calibration certificate?',
                              'Print Certificate',
                              'bg-[#2a9dab]'
                            );
                          }}
                          className="px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm bg-[#2a9dab] text-white hover:bg-[#238a91] print:hidden"
                        >
                          Print Certificate
                        </button>
                      </div>
                    </div>
                  ) : calibRecord.calibration_type === 'Thermometer' ? (
                    <div>
                      {/* Thermometer Results Table */}
                      <h3 className="font-semibold mb-2">UNCERTAINTY RESULTS</h3>
                      <table className="w-full border text-xs mb-6 table-auto">
                        <thead>
                          <tr>
                            <th className="border p-1">Parameter</th>
                            <th className="border p-1">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calibRecord.result_data && (() => {
                            try {
                              const result = typeof calibRecord.result_data === 'string' ? JSON.parse(calibRecord.result_data) : calibRecord.result_data;
                              return [
                                { label: 'Combined Standard Uncertainty (Uc)', value: result.u_c || result.uc || 'N/A' },
                                { label: 'Uncertainty of Calibration (Ue)', value: result.u_e || result.ue || 'N/A' },
                                { label: 'Effective Degrees of Freedom (Veff)', value: result.veff || result.v_eff || 'N/A' },
                                { label: 'Coverage Factor (k)', value: result.k || 'N/A' }
                              ];
                            } catch {
                              return [
                                { label: 'Combined Standard Uncertainty (Uc)', value: 'N/A' },
                                { label: 'Uncertainty of Calibration (Ue)', value: 'N/A' },
                                { label: 'Effective Degrees of Freedom (Veff)', value: 'N/A' },
                                { label: 'Coverage Factor (k)', value: 'N/A' }
                              ];
                            }
                          })().map((row, i) => (
                            <tr key={i}>
                              <td className="border p-1">{row.label}</td>
                              <td className="border p-1">{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          onClick={() => showConfirmation(
                            () => {
                              window.open(`http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/calibration/generate_certificate_thermometer.php?sample_id=${calibRecord.sample_id}`, '_blank');
                              handleCloseCalibModal();
                            },
                            'Are you sure you want to print the calibration certificate?',
                            'Print Certificate',
                            'bg-[#2a9dab]'
                          )}
                          className="px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm bg-[#2a9dab] text-white hover:bg-[#238a91] print:hidden"
                        >
                          Print Certificate
                        </button>
                      </div>
                    </div>
                  ) : calibRecord.calibration_type === 'Weighing Scale' ? (
                    <div className="flex flex-col min-h-[400px]"> {/* Ensure vertical space for bottom alignment */}
                      {/* Show the weighing scale results table */}
                      {renderCombinedTable(calibRecord.input_data, calibRecord.result_data, calibRecord.calibration_type, calibRecord)}
                      <div className="flex-1"></div> {/* Spacer to push button to bottom */}
                      <div className="flex justify-end items-end mt-6"> {/* Bottom right alignment */}
                        <button
                          onClick={() => {
                            const certUrl = `http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/calibration/generate_certificate_weighing_scale.php?sample_id=${calibRecord.sample_id}`;
                            
                            showConfirmation(
                              () => {
                                // Try multiple methods to open the certificate
                                try {
                                  // Method 1: Direct window.open
                                  const newWindow = window.open(certUrl, '_blank');
                                  
                                  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                                    // Method 2: Create a temporary link and click it
                                    const link = document.createElement('a');
                                    link.href = certUrl;
                                    link.target = '_blank';
                                    link.rel = 'noopener noreferrer';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                } catch (error) {
                                  console.error('Error opening certificate:', error);
                                  alert('Unable to open certificate. Please check your browser settings and try again.');
                                }
                                
                                handleCloseCalibModal();
                              },
                              'Are you sure you want to print the weighing scale certificate?',
                              'Print Certificate',
                              'bg-[#2a9dab]'
                            );
                          }}
                          className="px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm bg-[#2a9dab] text-white hover:bg-[#238a91] print:hidden"
                        >
                          Print Certificate
                        </button>
                      </div>
                    </div>
                  ) : calibRecord.calibration_type === 'Test Weights' ? (
                    <div className="flex flex-col min-h-[400px]"> {/* Ensure vertical space for bottom alignment */}
                      {/* Test Weights specific formatted table */}
                      <div className="mb-6">
                        {renderCombinedTable(calibRecord.input_data, calibRecord.result_data, calibRecord.calibration_type, calibRecord)}
                      </div>
                      <div className="flex-1"></div> {/* Spacer to push button to bottom */}
                      <div className="flex justify-end items-end mt-6"> {/* Bottom right alignment */}
                        <button
                          onClick={() => {
                            const certUrl = `http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/calibration/generate_certificate_testweights.php?sample_id=${calibRecord.sample_id}`;
                            
                            showConfirmation(
                              () => {
                                // Try multiple methods to open the certificate
                                try {
                                  // Method 1: Direct window.open
                                  const newWindow = window.open(certUrl, '_blank');
                                  
                                  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                                    // Method 2: Create a temporary link and click it
                                    const link = document.createElement('a');
                                    link.href = certUrl;
                                    link.target = '_blank';
                                    link.rel = 'noopener noreferrer';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                } catch (error) {
                                  console.error('Error opening certificate:', error);
                                  alert('Unable to open certificate. Please check your browser settings and try again.');
                                }
                                
                                handleCloseCalibModal();
                              },
                              'Are you sure you want to print the test weights certificate?',
                              'Print Certificate',
                              'bg-[#2a9dab]'
                            );
                          }}
                          className="px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm bg-[#2a9dab] text-white hover:bg-[#238a91] print:hidden"
                        >
                          Print Certificate
                        </button>
                      </div>
                    </div>
                  ) : calibRecord.calibration_type === 'Sphygmomanometer' ? (
                    <div className="flex flex-col min-h-[400px]"> {/* Ensure vertical space for bottom alignment */}
                      {/* Sphygmomanometer specific formatted table */}
                      <div className="mb-6">
                        {renderCombinedTable(calibRecord.input_data, calibRecord.result_data, calibRecord.calibration_type, calibRecord)}
                      </div>
                      <div className="flex-1"></div> {/* Spacer to push button to bottom */}
                      <div className="flex justify-end items-end mt-6"> {/* Bottom right alignment */}
                        <button
                          onClick={() => {
                            const certUrl = `http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/calibration/generate_certificate_sphygmomanometer.php?sample_id=${calibRecord.sample_id}`;
                            
                            showConfirmation(
                              () => {
                                // Try multiple methods to open the certificate
                                try {
                                  // Method 1: Direct window.open
                                  const newWindow = window.open(certUrl, '_blank');
                                  
                                  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                                    // Method 2: Create a temporary link and click it
                                    const link = document.createElement('a');
                                    link.href = certUrl;
                                    link.target = '_blank';
                                    link.rel = 'noopener noreferrer';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                } catch (error) {
                                  console.error('Error opening certificate:', error);
                                  alert('Unable to open certificate. Please check your browser settings and try again.');
                                }
                                
                                handleCloseCalibModal();
                              },
                              'Are you sure you want to print the sphygmomanometer certificate?',
                              'Print Certificate',
                              'bg-[#2a9dab]'
                            );
                          }}
                          className="px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm bg-[#2a9dab] text-white hover:bg-[#238a91] print:hidden"
                        >
                          Print Certificate
                        </button>
                      </div>
                    </div>
                  ) : (
                    renderCombinedTable(calibRecord.input_data, calibRecord.result_data, calibRecord.calibration_type, calibRecord)
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Calibration Record Found</h3>
                  <p className="text-gray-600 mb-6">This equipment doesn't have a calibration record yet. You can start the calibration process by clicking the "Calibrate" button.</p>
                </div>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handleCloseCalibModal}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleCloseCalibModal();
                      // Navigate to calibration page
                      navigate('/calibration');
                    }}
                    className="px-6 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#238a91] transition-colors"
                  >
                    Start Calibration
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 10001 }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Action</h3>
              <p className="text-gray-600 mb-6">{confirmMessage}</p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleCancelConfirm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonColor}`}
                >
                  {confirmButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline ReservationDetailsCard (uses ViewReservationModal content, but inline)
function ReservationDetailsCard({ reservation, onBack, onViewDetails, sampleId }) {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCalibModalOpen, setIsCalibModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [sampleStepStatus, setSampleStepStatus] = useState({}); // { [sampleId]: { currentStep, status } }
  const navigate = useNavigate();

  // Pagination for sample table
  const [currentEquipPage, setCurrentEquipPage] = useState(1);
  const itemsPerEquipPage = 5;
  


  useEffect(() => {
    setCurrentEquipPage(1); // Reset page when reservation changes
  }, [reservation]);

  useEffect(() => {
    if (reservation) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError('');
        try {
          const response = await apiService.getRequestDetails(reservation.reference_number);
          setDetails(response.data);
          // Fetch calibration step for each sample/sample (handle both cases)
          const sampleData = response.data?.sample || response.data?.sample;
          if (response.data && sampleData) {
            const statusObj = {};
            await Promise.all(
              sampleData.map(async (item) => {
                try {
                  const rec = await apiService.getCalibrationRecordBySampleId(item.id);
                  if (rec.data && rec.data.has_calibration === false) {
                    // No calibration record exists for this sample
                    statusObj[item.id] = { currentStep: null, status: item.status, calibrationType: null };
                  } else if (rec.data && rec.data.input_data) {
                    let input = rec.data.input_data;
                    if (typeof input === 'string') {
                      try { input = JSON.parse(input); } catch { input = {}; }
                    }
                    if (input.currentStep) {
                      statusObj[item.id] = {
                        currentStep: input.currentStep,
                        status: rec.data.status || item.status,
                        calibrationType: rec.data.calibration_type // Store calibration type
                      };
                    } else {
                      statusObj[item.id] = { currentStep: null, status: rec.data.status || item.status, calibrationType: rec.data.calibration_type };
                    }
                  } else {
                    statusObj[item.id] = { currentStep: null, status: item.status, calibrationType: null };
                  }
                } catch (err) {
                  // Only log if it's not a 404 (which is expected for sample without calibration records)
                  if (err.response?.status !== 404) {
                    console.warn(`Error loading calibration record for sample ${item.id}:`, err);
                  }
                  statusObj[item.id] = { currentStep: null, status: item.status, calibrationType: null };
                }
              })
            );
            setSampleStepStatus(statusObj);
          }
        } catch (err) {
          setError('Failed to fetch reservation details.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [reservation]);

  const handleCalibrateClick = async (sample) => {
    try {
      const res = await apiService.getCalibrationRecordBySampleId(sample.id);
      if (res.data && res.data.calibration_type && res.data.has_calibration !== false) {
        // There is existing calibration data
        let input = res.data.input_data;
        if (typeof input === 'string') {
          try { input = JSON.parse(input); } catch { input = {}; }
        }
        const currentStep = input.currentStep || 1;
        const calibrationType = res.data.calibration_type;

        // Navigate based on calibration type
        if (calibrationType === 'Weighing Scale') {
          navigate('/uncertainty-calculation', {
            state: {
              serialNumber: sample.serial_no,
              equipmentId: sample.id,
              currentStep
            }
          });
          return;
        }
        if (calibrationType === 'Thermometer') {
          navigate('/thermometer-uncertainty-calculator', {
            state: {
              serialNumber: sample.serial_no,
              equipmentId: sample.id,
              currentStep
            }
          });
          return;
        }
        if (calibrationType === 'Thermohygrometer') {
          navigate('/thermohygrometer-uncertainty-calculator', {
            state: {
              serialNumber: sample.serial_no,
              equipmentId: sample.id,
              currentStep
            }
          });
          return;
        }
        if (calibrationType === 'Test Weights') {
          navigate('/test-weights-calibration', {
            state: {
              serialNumber: sample.serial_no,
              equipmentId: sample.id,
              currentStep
            }
          });
          return;
        }
        if (calibrationType === 'Sphygmomanometer') {
          navigate('/sphygmomanometer-calibration', {
            state: {
              serialNumber: sample.serial_no,
              equipmentId: sample.id,
              currentStep
            }
          });
          return;
        }
        // Add more types as needed
        toast.error('Calibration for this equipment type is not supported.');
        return;
      }
      // No calibration data: navigate by sample type
      if (navigateToCalibration(navigate, sample.type, sample)) return;
      setSelectedEquipment(sample);
      setIsCalibModalOpen(true);
    } catch (e) {
      // On error: attempt to navigate by type, otherwise show modal
      if (navigateToCalibration(navigate, sample.type, sample)) return;
      setSelectedEquipment(sample);
      setIsCalibModalOpen(true);
    }
  };

  const handleCalibModalClose = () => {
    setIsCalibModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleEquipmentTypeSelect = (type) => {
    if (!selectedEquipment) return;
    const sampleId = selectedEquipment.id;
    const serialNumber = selectedEquipment.serial_no;
    if (type === 'Sphygmomanometer') {
      setIsCalibModalOpen(false);
      navigate('/sphygmomanometer-calibration', {
        state: { serialNumber, equipmentId: sampleId }
      });
      setSelectedEquipment(null);
      return;
    }
    if (type === 'Test Weights') {
      setIsCalibModalOpen(false);
      navigate('/test-weights-calibration', {
        state: { serialNumber, equipmentId: sampleId }
      });
      setSelectedEquipment(null);
      return;
    }
    if (type === 'Thermometer') {
      setIsCalibModalOpen(false);
      navigate('/thermometer-uncertainty-calculator', {
        state: { serialNumber, equipmentId: sampleId }
      });
      setSelectedEquipment(null);
      return;
    }
    if (type === 'Thermohygrometer') {
      setIsCalibModalOpen(false);
      navigate('/thermohygrometer-uncertainty-calculator', {
        state: { serialNumber, equipmentId: sampleId }
      });
      setSelectedEquipment(null);
      return;
    }
    if (type === 'Weighing Scale') {
      setIsCalibModalOpen(false);
      navigate('/uncertainty-calculation', {
        state: { serialNumber, equipmentId: sampleId }
      });
      setSelectedEquipment(null);
      return;
    }
    // Add more types as needed
    setIsCalibModalOpen(false);
    setSelectedEquipment(null);
    toast.error('Calibration for this equipment type is not supported.');
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Request Details</h1>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-200 hover:scale-110"
          aria-label="Back to calibrations"
        >
          ✕
        </button>
      </div>
      {isLoading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {details && (
        <div className="space-y-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-gray-800">{details.reference_number}</h3>
                <span className={`capitalize px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusBadge(details.status)}`}> 
                  {getStatusText(details.status)}
                </span>
              </div>
              <p className="text-sm text-gray-500">Created on {new Date(details.date_created).toLocaleDateString()}</p>
              {details.date_expected_completion && (
                <p className="text-sm text-gray-500">Expected Completion: {new Date(details.date_expected_completion).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Client Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><span className="font-medium text-gray-600">Name:</span> {details.client_name}</p>
              <p><span className="font-medium text-gray-600">Company:</span> {details.client_company}</p>
              <p><span className="font-medium text-gray-600">Email:</span> {details.client_email}</p>
              <p><span className="font-medium text-gray-600">Contact:</span> {details.client_contact}</p>
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-2">Sample</h3>
            {(details.sample || details.sample) && (details.sample || details.sample).length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide hover:scrollbar-show">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Type of Equipment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Range/Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Serial Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b transition-colors duration-200 hover:bg-gray-100">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sampleId
                      ? (details.sample || details.sample).filter(item => item.id === sampleId)
                      : (details.sample || details.sample)
                    ).map((item, index) => (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.05,
                          ease: "easeOut"
                        }}
                        className="transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-lg"
                        whileHover={{ 
                          backgroundColor: "#f9fafb",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                        }}
                      >
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap transition-colors duration-200">{item.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap transition-colors duration-200">{item.range}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap transition-colors duration-200">{item.serial_no || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          {/* Show stepper-based status if available and not completed */}
                          {sampleStepStatus[item.id] && sampleStepStatus[item.id].currentStep && sampleStepStatus[item.id].status !== 'completed' ? (
                            (() => {
                              const calibrationType = sampleStepStatus[item.id].calibrationType || item.type || '';
                              const stepNames = calibrationTypeStepNames[calibrationType] || [];
                              const stepIdx = sampleStepStatus[item.id].currentStep - 1;
                              const stepName = stepNames[stepIdx] || '';
                              return stepName ? (
                                <motion.span 
                                  className="capitalize px-2 py-1 text-xs font-semibold text-white rounded-full bg-blue-500"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {stepName}
                                </motion.span>
                              ) : (
                                <motion.span 
                                  className={`capitalize px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusBadge(item.status)}`}
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {getStatusText(item.status)}
                                </motion.span>
                              );
                            })()
                          ) : (
                            <motion.span 
                              className={`capitalize px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusBadge(item.status)}`}
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              {getStatusText(item.status)}
                            </motion.span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {item.status === 'completed' ? (
                            <motion.button
                              className="px-3 py-1 rounded border border-green-600 bg-green-50 text-green-700 font-semibold text-xs hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200"
                              onClick={() => onViewDetails(item.id)}
                              whileHover={{ 
                                scale: 1.05,
                                backgroundColor: "#dcfce7",
                                boxShadow: "0 2px 4px rgba(34, 197, 94, 0.2)"
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View Details
                            </motion.button>
                          ) : (
                            <motion.button
                              className="px-3 py-1 rounded border border-[#2a9dab] bg-[#e0f7fa] text-[#2a9dab] font-semibold text-xs hover:bg-[#d0f0f7] focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-all duration-200"
                              onClick={() => handleCalibrateClick(item)}
                              whileHover={{ 
                                scale: 1.05,
                                backgroundColor: "#d0f0f7",
                                boxShadow: "0 2px 4px rgba(42, 157, 171, 0.2)"
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Calibrate
                            </motion.button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination Controls for sample table */}
                {!sampleId && (details.sample || details.sample).length > itemsPerEquipPage && (
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setCurrentEquipPage(p => Math.max(1, p-1))}
                      disabled={currentEquipPage === 1}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${currentEquipPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#2a9dab] text-white hover:bg-[#238a91]'}`}
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.ceil((details.sample || details.sample).length/itemsPerEquipPage) }, (_, i) => i+1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentEquipPage(page)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${currentEquipPage === page ? 'bg-[#2a9dab] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentEquipPage(p => Math.min(Math.ceil((details.sample || details.sample).length/itemsPerEquipPage), p+1))}
                      disabled={currentEquipPage === Math.ceil((details.sample || details.sample).length/itemsPerEquipPage)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${currentEquipPage === Math.ceil((details.sample || details.sample).length/itemsPerEquipPage) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#2a9dab] text-white hover:bg-[#238a91]'}`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No sample listed for this reservation.</p>
            )}
          </div>
        </div>
      )}
      <Modal
        isOpen={isCalibModalOpen}
        onClose={handleCalibModalClose}
        title="Choose Equipment Type"
        message={
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sphygmomanometer */}
            <button
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow hover:bg-blue-100 transition border border-blue-200 focus:outline-none"
              onClick={() => handleEquipmentTypeSelect('Sphygmomanometer')}
            >
              <MdSpeed className="text-pink-500 w-10 h-10 mb-2" />
              <span className="font-semibold text-gray-700">Sphygmomanometer</span>
            </button>
            {/* Test Weights */}
            <button
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg shadow hover:bg-green-100 transition border border-green-200 focus:outline-none"
              onClick={() => handleEquipmentTypeSelect('Test Weights')}
            >
              <FaWeightHanging className="text-green-500 w-10 h-10 mb-2" />
              <span className="font-semibold text-gray-700">Test Weights</span>
            </button>
            {/* Thermometer */}
            <button
              className="flex flex-col items-center p-4 bg-red-50 rounded-lg shadow hover:bg-red-100 transition border border-red-200 focus:outline-none"
              onClick={() => handleEquipmentTypeSelect('Thermometer')}
            >
              <FaThermometerHalf className="text-red-500 w-10 h-10 mb-2" />
              <span className="font-semibold text-gray-700">Thermometer</span>
            </button>
            {/* Thermohygrometer */}
            <button
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg shadow hover:bg-purple-100 transition border border-purple-200 focus:outline-none"
              onClick={() => handleEquipmentTypeSelect('Thermohygrometer')}
            >
              <FaThermometerHalf className="text-purple-500 w-10 h-10 mb-2" />
              <span className="font-semibold text-gray-700">Thermohygrometer</span>
            </button>
            {/* Weighing Scale */}
            <button
              className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg shadow hover:bg-yellow-100 transition border border-yellow-200 focus:outline-none"
              onClick={() => handleEquipmentTypeSelect('Weighing Scale')}
            >
              <MdScale className="text-yellow-500 w-10 h-10 mb-2" />
              <span className="font-semibold text-gray-700">Weighing Scale</span>
            </button>
          </div>
        }
        onConfirm={handleCalibModalClose}
      />


    </>
  );
}

// Add a function to map status codes to display text
function getStatusText(status) {
  if (!status) return '';
  switch (status.toLowerCase()) {
    case 'in_progress': return 'In Progress';
    case 'pending': return 'Pending';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function formatValue(value) {
  if (value === null || value === undefined) return <span className="text-gray-400">N/A</span>;
  if (typeof value === 'number') return value.toFixed(4);
  if (Array.isArray(value)) {
    // Compact table for array of objects
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])) {
      const keys = Object.keys(value[0]);
      return (
        <table className="min-w-full text-xs bg-gray-50 rounded border my-1">
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k} className="px-1 py-1 font-semibold text-gray-700 whitespace-nowrap">{prettifyKey(k)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.map((obj, idx) => (
              <tr key={idx}>
                {keys.map((k) => (
                  <td key={k} className="px-1 py-1 whitespace-nowrap">{formatValue(obj[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    // Otherwise, render as a compact list
    return (
      <ul className="list-disc pl-4 text-xs">
        {value.map((v, i) => (
          <li key={i}>{typeof v === 'number' ? v.toFixed(4) : formatValue(v)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    return (
      <table className="bg-gray-100 rounded p-1 text-xs mb-1">
        <tbody>
          {Object.entries(value).map(([k, v]) => (
            <tr key={k}>
              <td className="font-semibold pr-2 align-top">{prettifyKey(k)}:</td>
              <td>{formatValue(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return value;
}

function prettifyKey(key) {
  // Map common calibration/uncertainty keys to full labels
  const labelMap = {
    uc: 'Combined Standard Uncertainty (Uc)',
    ue: 'Expanded Uncertainty (Ue)',
    k: 'Coverage Factor (k)',
    verffVal: 'Effective Degrees of Freedom (veff)',
    veffVal: 'Effective Degrees of Freedom (veff)',
    u_std: 'Reference Standard Uncertainty (Ustd)',
    u_std_temp: 'Reference Standard Uncertainty (Temp)',
    u_std_humidity: 'Reference Standard Uncertainty (Humidity)',
    u_drift_cal: 'Drift Uncertainty',
    u_res_uuc: 'UUC Resolution Uncertainty',
    u_res_std: 'Standard Resolution Uncertainty',
    s_uuc: 'UUC Std. Deviation',
    u_rep_uuc: 'UUC Repeatability',
    s_ref: 'Reference Std. Deviation',
    u_rep_ref: 'Reference Repeatability',
    u_hyst: 'Hysteresis Uncertainty',
    u_unif: 'Uniformity Uncertainty',
    tempError: 'Temperature Error/Deviation',
    humidityError: 'Humidity Error/Deviation',
    U_temp: 'Expanded Uncertainty (Temp)',
    U_humidity: 'Expanded Uncertainty (Humidity)',
    refReadings: 'Reference Readings',
    uucReadings: 'UUC Readings',
    drift: 'Drift',
    resolution: 'Resolution',
    hysteresis: 'Hysteresis',
    uniformity: 'Uniformity',
    repeatability: 'Repeatability',
    sc1: 'Sensitivity Coefficient (sc1)',
    df1: 'Degrees of Freedom (df1)',
    rg: 'Resolution (rg)',
    rd: 'Readability Multiplier (rd)',
    us: 'Reference Standard Uncertainty (us)',
    mpe: 'Maximum Permissible Error (MPE)',
    eccRows: 'Eccentricity Test Rows',
    linearityRows: 'Linearity Test Rows',
    referenceWeights: 'Reference Weights',
    sample: 'Equipment Info',
    meanRepeat: 'Mean (Repeatability)',
    stddevRepeat: 'Std. Deviation (Repeatability)',
    U_expanded: 'Expanded Uncertainty (U)',
    u_combined: 'Combined Standard Uncertainty (u)',
    nRepeat: 'Number of Repeatability Readings',
    d: 'Readability (d)',
    Imax: 'Maximum Eccentricity (Imax)',
    u_ref: 'Reference Weight Uncertainty',
    u_air: 'Air Buoyancy Uncertainty',
    u_drift: 'Drift of Weights Uncertainty',
    u_conv: 'Convection Uncertainty',
    u_round: 'Rounding Error Uncertainty',
    u_ecc: 'Eccentricity Uncertainty',
    u_rep: 'Repeatability Uncertainty',
    k_std: 'Coverage Factor (k) for Standard',
  };
  if (labelMap[key]) return labelMap[key];
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, str => str.toUpperCase());
}

function renderKeyValueRows(data) {
  let obj;
  try {
    obj = typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return (
      <tr><td colSpan={2}><pre className="text-xs bg-gray-100 p-2 rounded">{String(data)}</pre></td></tr>
    );
  }
  if (!obj || typeof obj !== 'object') {
    return (
      <tr><td colSpan={2}><pre className="text-xs bg-gray-100 p-2 rounded">{String(data)}</pre></td></tr>
    );
  }
  return Object.entries(obj).map(([key, value]) => (
    <tr key={key}>
      <td className="font-semibold pr-2 align-top w-1/3">{prettifyKey(key)}:</td>
      <td>{formatValue(value)}</td>
    </tr>
  ));
}

function renderCombinedTable(inputData, resultData, calibrationType, calibRecord = null) {
  let inputObj, resultObj;
  
  // Parse JSON data
  try { 
    inputObj = typeof inputData === 'string' ? JSON.parse(inputData) : inputData; 
  } catch (e) { 
    inputObj = {}; 
  }
  
  try { 
    resultObj = typeof resultData === 'string' ? JSON.parse(resultData) : resultData; 
  } catch (e) { 
    resultObj = {}; 
  }

  // Check if we have any meaningful data
  const hasInputData = inputObj && Object.keys(inputObj).length > 0;
  const hasResultData = resultObj && Object.keys(resultObj).length > 0;
  const hasCalibRecord = calibRecord && calibRecord.id;
  const hasRawData = (inputData && inputData !== '{}' && inputData !== 'null') || (resultData && resultData !== '{}' && resultData !== 'null');
  
  if (!hasInputData && !hasResultData && !hasCalibRecord && !hasRawData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No calibration data available for this equipment.</p>
        <p className="text-sm mt-2">The calibration process may not have been completed yet.</p>
      </div>
    );
  }

  
  if ((inputObj?.preparation || inputObj?.abbaRows) && (calibrationType === 'Test Weights' || (inputObj?.calibration_type === 'Test Weights'))) {
    // Test Weights custom grouped table
    return (
      <table className="w-full text-xs bg-white rounded-lg border border-[#2a9dab] table-auto">
        <tbody>
          <tr className="bg-gray-100"><th colSpan="2" className="text-left px-2 py-1">Conventional Mass Calculation</th></tr>
          <tr><td className="border px-2 py-1">Conventional Mass of Reference (mc_r)</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj?.mc_r)}</td></tr>
          <tr><td className="border px-2 py-1">Mean Dmci</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj?.meanDmci)}</td></tr>
          <tr><td className="border px-2 py-1">Buoyancy Correction</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj?.buoyancyCorrection)}</td></tr>
          <tr><td className="border px-2 py-1">Conventional Mass of Test Weight (mc_t)</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj?.mc_t)}</td></tr>
          <tr className="bg-gray-100"><th colSpan="2" className="text-left px-2 py-1">Uncertainty Calculation</th></tr>
          <tr><td className="border px-2 py-1">u(mc_r) [from reference, mg → g]</td><td className="border px-2 py-1 font-mono">{formatValue(inputObj?.uncertainties?.u_mc_r)}</td></tr>
          <tr><td className="border px-2 py-1">u(meanDmci) [stddev of Dmci, g]</td><td className="border px-2 py-1 font-mono">{formatValue(inputObj?.uncertainties?.u_meanDmci)}</td></tr>
          <tr><td className="border px-2 py-1">u_b</td><td className="border px-2 py-1 font-mono">{formatValue(inputObj?.uncertainties?.u_b)}</td></tr>
          <tr><td className="border px-2 py-1">u_ba</td><td className="border px-2 py-1 font-mono">{formatValue(inputObj?.uncertainties?.u_ba)}</td></tr>
          <tr><td className="border px-2 py-1">Coverage Factor (k)</td><td className="border px-2 py-1 font-mono">{formatValue(inputObj?.uncertainties?.k)}</td></tr>
          <tr><td className="border px-2 py-1">Combined Standard Uncertainty (u)</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj?.u_mc_t)}</td></tr>
          <tr><td className="border px-2 py-1">Expanded Uncertainty (U)</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj?.U_mc_t)}</td></tr>
          <tr className="bg-gray-100"><th colSpan="2" className="text-left px-2 py-1">MPE Check</th></tr>
          <tr><td className="border px-2 py-1">Correction (mc_t - m)</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj?.correction)}</td></tr>
          <tr><td className="border px-2 py-1">MPE (from OIML table)</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj?.mpeOIML ?? inputObj?.mpeOIML)}</td></tr>
          <tr><td className="border px-2 py-1">MPE Result</td><td className="border px-2 py-1 font-bold">
            <span className={
              (resultObj?.mpeResult || (resultObj?.passesMPE ? 'PASS' : 'FAIL')) === 'PASS' ? 'text-green-600' : 'text-red-500'
            }>
              {resultObj?.mpeResult || (resultObj?.passesMPE ? 'PASS' : 'FAIL')}
            </span>
          </td></tr>
        </tbody>
      </table>
    );
  }
  if (calibrationType === 'Weighing Scale' && (inputObj || resultObj)) {
    // Simplified Weighing Scale display
    return (
      <div className="space-y-6">
        {/* Uncertainty Estimation */}
        {resultObj && (
          <div>
            <h3 className="font-semibold mb-3 text-[#2a9dab]">Uncertainty Estimation</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border text-xs mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Component</th>
                    <th className="border px-2 py-1">Formula</th>
                    <th className="border px-2 py-1">Value (g)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Reference weight</td>
                    <td className="border px-2 py-1">MPE / 3</td>
                    <td className="border px-2 py-1">{resultObj.u_ref ? Number(resultObj.u_ref).toExponential(6) : '0.000000e+0'}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Air buoyancy</td>
                    <td className="border px-2 py-1">MPE / 4 / 3</td>
                    <td className="border px-2 py-1">{resultObj.u_air ? Number(resultObj.u_air).toExponential(6) : '0.000000e+0'}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Drift of weights</td>
                    <td className="border px-2 py-1">MPE / 3 / 3</td>
                    <td className="border px-2 py-1">{resultObj.u_drift ? Number(resultObj.u_drift).toExponential(6) : '0.000000e+0'}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Convection</td>
                    <td className="border px-2 py-1">MPE / 3 / 3</td>
                    <td className="border px-2 py-1">{resultObj.u_conv ? Number(resultObj.u_conv).toExponential(6) : '0.000000e+0'}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Rounding error</td>
                    <td className="border px-2 py-1">d / 2 / 3</td>
                    <td className="border px-2 py-1">{resultObj.u_round ? Number(resultObj.u_round).toExponential(6) : '0.000000e+0'}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Eccentricity</td>
                    <td className="border px-2 py-1">Imax / 2 / 3</td>
                    <td className="border px-2 py-1">{resultObj.u_ecc ? Number(resultObj.u_ecc).toExponential(6) : '0.000000e+0'}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Repeatability</td>
                    <td className="border px-2 py-1">s</td>
                    <td className="border px-2 py-1">{resultObj.u_rep ? Number(resultObj.u_rep).toExponential(6) : '0.000000e+0'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Results & Certification */}
        {resultObj && (
          <div>
            <h3 className="font-semibold mb-3 text-[#2a9dab]">Results & Certification</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 shadow border border-gray-200">
              <div className="mb-2 text-base">
                <span className="font-semibold">Combined Standard Uncertainty (u): </span>
                <span className="font-mono">{resultObj.u_combined ? Number(resultObj.u_combined).toExponential(6) : '0.000000e+0'} g</span>
              </div>
              <div className="mb-2 text-base">
                <span className="font-semibold">Coverage Factor (k): </span>
                <span className="font-mono">{resultObj.k || '2'}</span>
              </div>
              <div className="mb-2 text-base font-bold">
                <span className="font-semibold">Expanded Uncertainty (U): </span>
                <span className="font-mono">{resultObj.U_expanded ? Number(resultObj.U_expanded).toExponential(6) : '0.000000e+0'} g</span>
              </div>
            </div>
            
          </div>
        )}

      </div>
    );
  }
  if (calibrationType === 'Thermometer' && resultObj) {
    return (
      <table className="w-full text-xs bg-white rounded-lg border border-[#2a9dab] table-auto">
        <tbody>
          <tr className="bg-gray-100"><th colSpan="2" className="text-left px-2 py-1">Uncertainty Results</th></tr>
          <tr><td className="border px-2 py-1">Combined Standard Uncertainty (Uc)</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj.uc)}</td></tr>
          <tr><td className="border px-2 py-1">Uncertainty of Calibration (Ue)</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj.ue)}</td></tr>
          <tr><td className="border px-2 py-1">Effective Degrees of Freedom (Veff)</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj.veffVal)}</td></tr>
          <tr><td className="border px-2 py-1">Coverage Factor (k)</td><td className="border px-2 py-1 font-mono">{formatValue(resultObj.k)}</td></tr>
        </tbody>
      </table>
    );
  }
  
  if (calibrationType === 'Sphygmomanometer' && (inputObj || resultObj)) {
    // Sphygmomanometer specific display - show only necessary report data
    return (
      <div className="space-y-6">
        {/* Calibration Summary */}
        <div>
          <h3 className="font-semibold mb-3 text-[#2a9dab]">Calibration Summary</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border text-xs mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Parameter</th>
                  <th className="border px-2 py-1">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">Reference No</td>
                  <td className="border px-2 py-1">{formatValue(inputObj?.calDetails?.referenceNo || resultObj?.referenceNo)}</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Sample No</td>
                  <td className="border px-2 py-1">{formatValue(inputObj?.calDetails?.sampleNo || resultObj?.sampleNo)}</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Serial No</td>
                  <td className="border px-2 py-1">{formatValue(inputObj?.calDetails?.serialNo || resultObj?.serialNo)}</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Customer</td>
                  <td className="border px-2 py-1">{formatValue(inputObj?.calDetails?.customer || resultObj?.customer)}</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Date Calibrated</td>
                  <td className="border px-2 py-1">{formatValue(inputObj?.calDetails?.dateCalibrated || resultObj?.dateCalibrated)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Information */}
        {(inputObj?.deviceInfo || resultObj?.deviceInfo) && (
          <div>
            <h3 className="font-semibold mb-3 text-[#2a9dab]">Device Information</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border text-xs mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Parameter</th>
                    <th className="border px-2 py-1">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Cuff Size</td>
                    <td className="border px-2 py-1">{formatValue(inputObj?.deviceInfo?.cuffSize || resultObj?.deviceInfo?.cuffSize)}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Measurement Range (Sys)</td>
                    <td className="border px-2 py-1">{formatValue(inputObj?.deviceInfo?.measurementRangeSys || resultObj?.deviceInfo?.measurementRangeSys)}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Measurement Range (Dia)</td>
                    <td className="border px-2 py-1">{formatValue(inputObj?.deviceInfo?.measurementRangeDia || resultObj?.deviceInfo?.measurementRangeDia)}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Resolution</td>
                    <td className="border px-2 py-1">{formatValue(inputObj?.deviceInfo?.resolution || resultObj?.deviceInfo?.resolution)}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">K Factor</td>
                    <td className="border px-2 py-1">{formatValue(inputObj?.deviceInfo?.kFactor || resultObj?.deviceInfo?.kFactor)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calibration Results */}
        {(inputObj?.results || resultObj?.results) && (
          <div>
            <h3 className="font-semibold mb-3 text-[#2a9dab]">Calibration Results</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border text-xs mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Parameter</th>
                    <th className="border px-2 py-1">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Systolic Average</td>
                    <td className="border px-2 py-1">{formatValue(inputObj?.results?.sysAverage || resultObj?.results?.sysAverage)}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Diastolic Average</td>
                    <td className="border px-2 py-1">{formatValue(inputObj?.results?.diaAverage || resultObj?.results?.diaAverage)}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Systolic Uncertainty</td>
                    <td className="border px-2 py-1">{formatValue(inputObj?.results?.sysUncertainty || resultObj?.results?.sysUncertainty)}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Diastolic Uncertainty</td>
                    <td className="border px-2 py-1">{formatValue(inputObj?.results?.diaUncertainty || resultObj?.results?.diaUncertainty)}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Calibration Status</td>
                    <td className="border px-2 py-1">
                      <span className={`font-bold ${(inputObj?.results?.status || resultObj?.results?.status) === 'PASS' ? 'text-green-600' : 'text-red-500'}`}>
                        {formatValue(inputObj?.results?.status || resultObj?.results?.status || 'N/A')}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Default fallback for other types
  const allKeys = Array.from(new Set([...Object.keys(inputObj || {}), ...Object.keys(resultObj || {})]));
  
  if (allKeys.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Calibration data is available but cannot be displayed.</p>
        <p className="text-sm mt-2">The data structure may not be recognized.</p>
      </div>
    );
  }
  
  return (
    <table className="w-full text-xs bg-white rounded-lg border border-[#2a9dab] table-auto">
      <thead className="bg-[#e0f7fa]">
        <tr>
          <th className="text-left font-bold p-2 w-1/3 text-[#2a9dab]">Parameter</th>
          <th className="text-left font-bold p-2 text-[#2a9dab]">Input</th>
          <th className="text-left font-bold p-2 text-[#2a9dab]">Result</th>
        </tr>
      </thead>
      <tbody>
        {allKeys.map((key, idx) => (
          <tr key={key} className={idx % 2 === 0 ? 'bg-[#f8fafc]' : 'bg-white'}>
            <td className="font-semibold pr-2 align-top py-1 border-b border-[#e0f7fa]">{prettifyKey(key)}</td>
            <td className="py-1 border-b border-[#e0f7fa]">{formatValue(inputObj?.[key])}</td>
            <td className="py-1 border-b border-[#e0f7fa]">{formatValue(resultObj?.[key])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}



export default Calibration;


