import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { MdInfo, MdScience, MdCalculate } from 'react-icons/md';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { useBackNavigation } from '../hooks/useBackNavigation';

const CardSection = ({ children, className = '' }) => (
  <div className={`rounded-xl shadow bg-white border border-[#2a9dab] p-4 mb-4 ${className}`}>
    {children}
  </div>
);

const ModernInput = (props) => {
  const handleKeyDown = (e) => {
    // Prevent E, e, +, - characters in number inputs to avoid scientific notation
    if (props.type === 'number' && ['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
    
    // Call original onKeyDown if provided
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <input
      {...props}
      onKeyDown={handleKeyDown}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-all duration-200 text-sm bg-white shadow-sm hover:border-gray-400 ${props.className || ''}`}
      style={{
        transition: 'all 0.2s ease-in-out'
      }}
    />
  );
};

const ModernButton = (props) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm ${props.disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#2a9dab] text-white hover:bg-[#238a91]'} ${props.className || ''}`}
  />
);

const steps = [
  { id: 1, title: 'Equipment & Device Info', icon: <MdInfo /> },
  { id: 2, title: 'Standard Readings (IPRT)', icon: <MdScience /> },
  { id: 3, title: 'UUT Readings (DKD R-6-1)', icon: <MdScience /> },
  { id: 4, title: 'Rate of Pressure Loss', icon: <MdScience /> },
  { id: 5, title: 'Rapid Exhaust Valve Test', icon: <MdScience /> },
  { id: 6, title: 'Results', icon: <MdCalculate /> },
];

function SphygmomanometerCalibration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const serialNumber = location.state?.serialNumber || '';
  const equipmentId = location.state?.equipmentId || null;
  const [currentStep, setCurrentStep] = useState(1);
  
  // Validation and confirmation state
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [isNextSaving, setIsNextSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [calDetails, setCalDetails] = useState({
    referenceNo: '',
    sampleNo: '',
    calibratedBy: '',
    customer: '',
    address: '',
    dateSubmitted: '',
    dateCalibrated: new Date().toISOString().slice(0,10),
    type: '',
    manufacturer: '',
    model: '',
    serialNo: serialNumber || '',
    // Identity & Specifications additions
    range: '',
    accuracy: '',
    // Environment Conditions
    envStartTime: '',
    envEndTime: '',
    envTempStart: '',
    envTempEnd: '',
    envHumidityStart: '',
    envHumidityEnd: '',
    envPressureStart: '',
    envPressureEnd: '',
  });

  // Auto-set environment start time on load
  useEffect(() => {
    setCalDetails(d => (
      d.envStartTime && d.envStartTime !== ''
        ? d
        : { ...d, envStartTime: new Date().toTimeString().slice(0,5) }
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Device settings removed from calculations/UI

  // Removed legacy SYS/DIA matrices to mirror Excel layout (use DKD IPRT/UUT only)

  // DKD R-6-1 pressure gauge layout (mmHg)
  const KPA_TO_MMHG = 7.5006269999999997;
  const BAR_TO_MMHG = 750.06156099999998;
  const mmHgToKPa = (mmHg) => (mmHg === '' || isNaN(Number(mmHg))) ? '' : Number((Number(mmHg) / KPA_TO_MMHG).toFixed(6));
  const formatDec = (v, d = 6) => (v === '' || v === null || typeof v === 'undefined' || isNaN(Number(v))) ? '' : Number(v).toFixed(d);
  // Expanded Uncertainty config
  const MPE_MM_HG = 4; // per requirement and existing UI notes (±4 mmHg)
  const COVERAGE_K = 2; // k = 2 for ~95% CL
  const UNCERTAINTY_THRESHOLD = Number((MPE_MM_HG / 3).toFixed(2)); // U must be <= MPE/3
  const [appliedPressures, setAppliedPressures] = useState([0,50,100,150,200,250,300]);
  // IPRT (Standard) readings X1..X4 (up/down alternation)
  const empty7x4 = appliedPressures.map(() => ({ X1:"", X2:"", X3:"", X4:"" }));
  const [iprtRows, setIprtRows] = useState(empty7x4);
  // UUT readings X1..X4
  const [uutRows, setUutRows] = useState(empty7x4);
  const setIprtCell = (rowIdx, key, value) => setIprtRows(prev => prev.map((r,i)=> i===rowIdx?{...r,[key]: value===''? '': Number(value)}:r));
  const setUutCell  = (rowIdx, key, value) => setUutRows(prev => prev.map((r,i)=> i===rowIdx?{...r,[key]: value===''? '': Number(value)}:r));
  const mean4 = r => {
    const vals = ['X1','X2','X3','X4'].map(k => Number(r[k])).filter(v => !isNaN(v));
    if (!vals.length) return '';
    return Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(6));
  };
  const iprtMean = iprtRows.map(mean4);
  const uutMean  = uutRows.map(mean4);
  // Deviation columns should reflect the average UUT values (per user request)
  const deviationMmHg = uutMean;
  const deviationKPa  = uutMean.map(v => v===''? '': Number((Number(v) / KPA_TO_MMHG).toFixed(6)));
  // Increasing/Decreasing means for UUT
  const uutIncMean = uutRows.map(r => {
    const vals = [r.X1, r.X3].map(Number).filter(v => !isNaN(v));
    if (!vals.length) return '';
    return Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(6));
  });
  const uutDecMean = uutRows.map(r => {
    const vals = [r.X2, r.X4].map(Number).filter(v => !isNaN(v));
    if (!vals.length) return '';
    return Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(6));
  });
  // Maximum Deviation per pressure point (Excel-style): max(|inc - IPRT|, |dec - IPRT|)
  const maxDeviation = iprtMean.map((m,i) => {
    const inc = uutIncMean[i];
    const dec = uutDecMean[i];
    if (m==='' || (inc==='' && dec==='')) return '';
    const a = inc!=='' ? Math.abs(Number(inc) - Number(m)) : 0;
    const b = dec!=='' ? Math.abs(Number(dec) - Number(m)) : 0;
    return Number(Math.max(a,b).toFixed(2));
  });
  // Max hysteresis error mmHg from pairs (X1-X2) and (X3-X4)
  const hysteresisMax = uutRows.map(r => {
    const a = (r.X1===''||r.X2==='')? null : Math.abs(Number(r.X1) - Number(r.X2));
    const b = (r.X3===''||r.X4==='')? null : Math.abs(Number(r.X3) - Number(r.X4));
    if (a===null && b===null) return '';
    return Number((Math.max(a||0,b||0)).toFixed(6));
  });

  // Expanded Uncertainty (per point) from UUT repeatability only (available data)
  const stdDevUUT = uutRows.map(r => {
    const values = ['X1','X2','X3','X4']
      .map(k => Number(r[k]))
      .filter(v => !isNaN(v));
    const n = values.length;
    if (n < 2) return '';
    const mean = values.reduce((a,b)=>a+b,0) / n;
    const variance = values.reduce((acc, v)=> acc + Math.pow(v - mean, 2), 0) / (n - 1); // sample variance
    return Number(Math.sqrt(variance).toFixed(6));
  });
  const standardUncertainty = stdDevUUT.map((s, idx) => {
    if (s === '') return '';
    const valuesCount = ['X1','X2','X3','X4']
      .map(k => Number(uutRows[idx][k]))
      .filter(v => !isNaN(v)).length;
    if (valuesCount === 0) return '';
    return Number((Number(s) / Math.sqrt(valuesCount)).toFixed(6));
  });
  const expandedUncertaintyU = standardUncertainty.map(u => u === '' ? '' : Number((Number(u) * COVERAGE_K).toFixed(2)));
  const perPointPassU = expandedUncertaintyU.map(u => u === '' ? '' : (Number(u) <= UNCERTAINTY_THRESHOLD));
  const overallUncertaintyPass = (() => {
    const usable = perPointPassU.filter(v => v !== '');
    if (usable.length === 0) return '';
    return usable.every(Boolean);
  })();
  // Pressure loss section (mmHg)
  const [lossPressures] = useState([60,120,180,240,300]);
  const [lossFirst, setLossFirst] = useState(["","","","",""]);
  const [lossAfter5, setLossAfter5] = useState(["","","","",""]);
  const lossRate = lossPressures.map((p,idx)=>{
    const f = Number(lossFirst[idx]);
    const a = Number(lossAfter5[idx]);
    if (isNaN(f) || isNaN(a) || f==='') return '';
    return Number(((f - a)/5).toFixed(2));
  });

  // Rapid Exhaust Valve Test: time to drop from 300 mmHg to <= 15 mmHg
  const [rapidStartPressure, setRapidStartPressure] = useState(300);
  const [rapidEndPressure, setRapidEndPressure] = useState(15);
  const [rapidElapsedSeconds, setRapidElapsedSeconds] = useState("");
  const rapidPass = (() => {
    const t = Number(rapidElapsedSeconds);
    if (isNaN(t) || rapidElapsedSeconds === '') return '';
    return t < 10 ? 'PASS' : 'FAIL';
  })();

  // Removed legacy matrix helpers (avg/computeU) not used by Excel DKD tables

  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // State for calibration confirmation modal
  const [showCalibrationConfirm, setShowCalibrationConfirm] = useState(false);
  const [calibrationConfirmTitle, setCalibrationConfirmTitle] = useState("");
  const [calibrationConfirmMessage, setCalibrationConfirmMessage] = useState("");
  const [calibrationConfirmType, setCalibrationConfirmType] = useState("info");
  
  // Calibration completion loading state
  const [isCalibrationLoading, setIsCalibrationLoading] = useState(false);

  // State for simple close confirmation
  const [showSimpleCloseConfirm, setShowSimpleCloseConfirm] = useState(false);

  // State for uncertainty details modal and completion status
  const [showUDetails, setShowUDetails] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Back navigation with confirmation
  const {
    showConfirmation,
    isSaving,
    handleBackClick,
    handleConfirmBack,
    handleCancelBack,
    confirmationTitle,
    confirmationMessage,
    confirmationType
  } = useBackNavigation({
    hasUnsavedChanges,
    confirmationTitle: "Leave Calibration?",
    confirmationMessage: "You have unsaved changes in your sphygmomanometer calibration. Are you sure you want to leave? Your progress will be lost.",
    confirmationType: "warning"
  });

  // Validation function to check if all required fields are filled (Excel mirrored)
  const validateCalibrationData = () => {
    const errors = [];

    // Check device info (Step 1)
    // Device settings not required for calculations
    // Removed SYS/DIA range validation to mirror Excel

    return errors;
  };

  // Fetch equipment data to get the type from database
  useEffect(() => {
    if (!equipmentId) return;
    
    apiService.getSampleById(equipmentId).then(res => {
      if (res.data) {
        setCalDetails(prev => ({
          ...prev,
          // Equipment info
          type: res.data.type || prev.type || '',
          manufacturer: res.data.manufacturer || prev.manufacturer || '',
          model: res.data.model || prev.model || '',
          serialNo: res.data.serial_no || serialNumber || prev.serialNo || '',
          range: prev.range || '',
          accuracy: res.data.accuracy || prev.accuracy || '',
          // Calibration details based on Excel Data Sheet mapping
          customer: res.data.customer || prev.customer || '',
          address: res.data.address || prev.address || '',
          referenceNo: res.data.reference_no || prev.referenceNo || '',
          sampleNo: (res.data.sample_no !== undefined && res.data.sample_no !== null) ? String(res.data.sample_no) : (prev.sampleNo || ''),
          dateSubmitted: res.data.date_submitted || prev.dateSubmitted || '',
          dateCalibrated: res.data.date_calibrated || prev.dateCalibrated || prev.dateCalibrated,
        }));

        if (res.data.status) {
          setIsCompleted(String(res.data.status).toLowerCase() === 'completed');
        }

        // Map graduation to device info if available (range removed to mirror Excel)
        setDeviceInfo(prev => ({
          ...prev,
          // Graduation → resolution (mmHg)
          resolution: (res.data.graduation !== undefined && res.data.graduation !== null)
            ? String(res.data.graduation).toString().replace(/[^0-9.]/g,'') || prev.resolution
            : prev.resolution,
        }));
      }
    }).catch(error => {
      console.error('Error fetching equipment data:', error);
    });
  }, [equipmentId, serialNumber]);

  useEffect(() => {
    if (!equipmentId || hasLoaded) return;
    apiService.getCalibrationRecordBySampleId(equipmentId).then(res => {
      if (res.data && res.data.calibration_type === 'Sphygmomanometer' && res.data.input_data) {
        const input = typeof res.data.input_data === 'string' ? JSON.parse(res.data.input_data) : res.data.input_data;
        
        // Load saved calibration details
        if (input.calDetails) {
          setCalDetails(prev => ({ ...prev, ...input.calDetails }));
        }
        
        // Load saved IPRT/UUT data
        if (input.iprtRows) {
          setIprtRows(input.iprtRows);
        }
        if (input.uutRows) {
          setUutRows(input.uutRows);
        }
        
        // Load saved pressure loss data
        if (input.lossFirst) setLossFirst(input.lossFirst);
        if (input.lossAfter5) setLossAfter5(input.lossAfter5);
        
        // Load saved rapid exhaust data
        if (input.rapidStartPressure) setRapidStartPressure(input.rapidStartPressure);
        if (input.rapidEndPressure) setRapidEndPressure(input.rapidEndPressure);
        if (input.rapidElapsedSeconds) setRapidElapsedSeconds(input.rapidElapsedSeconds);
        
        setHasLoaded(true);
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentId, hasLoaded]);

  const saveCalibration = async () => {
    if (!equipmentId) { toast.error('Equipment not found.'); return; }
    try {
      const input_data = { ...calDetails, envEndTime: new Date().toTimeString().slice(0,5) };
      const payload_input = { calDetails: input_data, currentStep,
        appliedPressures, iprtRows, uutRows, lossPressures, lossFirst, lossAfter5,
        rapidStartPressure, rapidEndPressure, rapidElapsedSeconds };
      const result_data = {
        iprtMean,
        uutMean,
        uutIncMean,
        uutDecMean,
        deviationMmHg,
        deviationKPa,
        maxDeviation,
        hysteresisMax,
        lossRate,
        rapidExhaust: { start: rapidStartPressure, end: rapidEndPressure, elapsedSeconds: rapidElapsedSeconds, result: rapidPass },
        uncertainty: {
          k: COVERAGE_K,
          mpe_mmHg: MPE_MM_HG,
          threshold_mmHg: UNCERTAINTY_THRESHOLD,
          stdDevUUT,
          standardUncertainty,
          expandedUncertaintyU,
          perPointPassU,
          overallUncertaintyPass,
        },
      };
      await apiService.saveCalibrationRecord({
        sample_id: equipmentId,
        calibration_type: 'Sphygmomanometer',
        input_data: payload_input,
        result_data,
        calibrated_by: user?.id || 1, // Get from auth context, fallback to 1
        date_started: new Date().toISOString().slice(0, 19).replace('T', ' '),
        date_completed: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });
    } catch (e) {
      console.error('Save calibration error:', e);
      toast.error('Failed to save calibration record: ' + (e.response?.data?.message || e.message));
    }
  };

  // Validation functions for each step
  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1: // Equipment & Device Info
        if (!calDetails.model.trim()) errors.model = 'Model is required';
        if (!calDetails.serialNo.trim()) errors.serialNo = 'Serial No. is required';
        if (!calDetails.range.trim()) errors.range = 'Range is required';
        if (!calDetails.accuracy.trim()) errors.accuracy = 'Accuracy is required';
        if (!calDetails.envTempStart.trim()) errors.envTempStart = 'Temperature Start is required';
        if (!calDetails.envHumidityStart.trim()) errors.envHumidityStart = 'Humidity Start is required';
        break;
        
        case 2: // Standard Readings (IPRT)
          if (iprtRows.some(row => {
            const x1 = row.X1?.toString().trim();
            const x2 = row.X2?.toString().trim();
            const x3 = row.X3?.toString().trim();
            const x4 = row.X4?.toString().trim();
            return !x1 || !x2 || !x3 || !x4 || 
                   x1 === '' || x2 === '' || x3 === '' || x4 === '' ||
                   isNaN(Number(x1)) || isNaN(Number(x2)) || 
                   isNaN(Number(x3)) || isNaN(Number(x4));
          })) {
            errors.iprtReadings = 'All IPRT readings must be completed with valid numbers';
          }
          break;
          
        case 3: // UUT Readings (DKD R-6-1)
          if (uutRows.some(row => {
            const x1 = row.X1?.toString().trim();
            const x2 = row.X2?.toString().trim();
            const x3 = row.X3?.toString().trim();
            const x4 = row.X4?.toString().trim();
            return !x1 || !x2 || !x3 || !x4 || 
                   x1 === '' || x2 === '' || x3 === '' || x4 === '' ||
                   isNaN(Number(x1)) || isNaN(Number(x2)) || 
                   isNaN(Number(x3)) || isNaN(Number(x4));
          })) {
            errors.uutReadings = 'All UUT readings must be completed with valid numbers';
          }
          break;
          
        case 4: // Rate of Pressure Loss
          if (lossFirst.some(value => {
            const val = value?.toString().trim();
            return !val || val === '' || isNaN(Number(val));
          })) {
            errors.lossFirst = 'All first pressure loss readings must be completed with valid numbers';
          }
          if (lossAfter5.some(value => {
            const val = value?.toString().trim();
            return !val || val === '' || isNaN(Number(val));
          })) {
            errors.lossAfter5 = 'All after 5 minutes pressure loss readings must be completed with valid numbers';
          }
          break;
          
        case 5: // Rapid Exhaust Valve Test
          const elapsed = rapidElapsedSeconds?.toString().trim();
          if (!elapsed || elapsed === '' || isNaN(Number(elapsed))) {
            errors.rapidElapsedSeconds = 'Elapsed time must be a valid number';
          }
          break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step with validation and confirmation
  const handleNextStep = async () => {
    // Validate current step
    if (!validateStep(currentStep)) {
      toast.error('Please complete all required fields before proceeding.', {
        position: 'top-center',
        duration: 5000,
        style: {
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: '600',
          padding: '20px 32px',
          minWidth: '450px',
          backgroundColor: '#fef2f2',
          color: '#000000',
          border: '2px solid #fecaca',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(220, 38, 38, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px)'
        }
      });
      return;
    }
    
    // Show confirmation modal
    setShowNextConfirm(true);
  };

  // Handle confirmation for next step
  const handleConfirmNext = async () => {
    setIsNextSaving(true);
    try {
      await saveCalibration();
      toast.success('Progress saved', {
        position: 'top-center',
        duration: 2000,
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          minWidth: '300px',
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      });
      setShowNextConfirm(false);
      setCurrentStep((s) => Math.min(6, s + 1));
    } catch (error) {
      toast.error('Failed to save progress.');
    } finally {
      setIsNextSaving(false);
    }
  };

  // Handle cancel for next step confirmation
  const handleCancelNext = () => {
    setShowNextConfirm(false);
  };

  // Show confirmation dialog before calibration
  const showCalibrationConfirmation = () => {
    setCalibrationConfirmTitle("Confirm Calibration");
    setCalibrationConfirmMessage(
      `Are you sure you want to confirm this calibration?`
    );
    setCalibrationConfirmType("success");
    setShowCalibrationConfirm(true);
  };

  // Handle confirmation for calibration
  const handleConfirmCalibrationAction = async () => {
    setShowCalibrationConfirm(false);
    
    setIsCalibrationLoading(true);
    try {
      // Save the calibration record first
      await saveCalibration();
      
      // Update the sample status
      await apiService.updateSampleStatus(equipmentId, 'completed');
      
      // Clear unsaved changes to prevent back navigation confirmation
      setHasUnsavedChanges(false);
      
      // Show success message
      toast.success('Calibration completed successfully!');
      
      // Use direct navigation to bypass any guards
      window.location.href = '/calibration';
      
    } catch (error) {
      console.error('Error in calibration confirmation:', error);
      toast.error('Failed to complete calibration: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCalibrationLoading(false);
    }
  };

  const completeCalibration = async () => {
    // Validate data first
    const validationErrors = validateCalibrationData();
    if (validationErrors.length > 0) {
      toast.error('Please complete all required fields before confirming calibration', {
        position: 'top-center',
        duration: 5000,
        style: {
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: '600',
          padding: '20px 32px',
          minWidth: '450px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '2px solid #fecaca',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(220, 38, 38, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px)'
        }
      });
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    showCalibrationConfirmation();
  };

  const renderStepper = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between w-full">
        {steps.map((s, idx) => {
          const isActive = currentStep === s.id;
          const isCompleted = currentStep > s.id;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full border-2 shadow-sm transition-colors text-lg font-bold
                    ${isActive ? 'bg-[#2a9dab] border-[#2a9dab] text-white scale-110' :
                      isCompleted ? 'bg-[#2a9dab] border-[#2a9dab] text-white' :
                      'bg-white border-[#2a9dab] text-[#2a9dab]'}
                  `}
                  style={{ transition: 'all 0.2s' }}
                >
                  {React.cloneElement(s.icon, {
                    className: isActive
                      ? 'text-white'
                      : isCompleted
                      ? 'text-white'
                      : 'text-[#2a9dab]'
                  })}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-xs font-semibold tracking-wide ${
                    isActive ? 'text-[#2a9dab]' :
                    isCompleted ? 'text-[#2a9dab]' :
                    'text-gray-500'
                  }`}>
                    {s.title}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full ${isCompleted ? 'bg-[#2a9dab]' : 'bg-[#e0f7fa]'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const readingsTable = (label, refMatrix, uucMatrix, onRefChange, onUucChange, unit) => (
    <CardSection>
      <div className="flex items-center mb-3">
        <MdScience className="h-5 w-5 text-[#2a9dab] mr-2" />
        <span className="text-[#2a9dab] font-semibold text-sm">{label}</span>
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border text-sm mb-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Trial</th>
              <th className="border px-2 py-1" colSpan={3}>Reference ({unit})</th>
              <th className="border px-2 py-1" colSpan={3}>UUC ({unit})</th>
            </tr>
            <tr>
              <th className="border px-2 py-1"></th>
              {[1,2,3].map(i => <th key={`r${i}`} className="border px-2 py-1">Testpoint {i}</th>)}
              {[1,2,3].map(i => <th key={`u${i}`} className="border px-2 py-1">Testpoint {i}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0,1,2].map(trial => (
              <tr key={trial}>
                <td className="border px-2 py-1 font-medium">{trial+1}</td>
                {[0,1,2].map(point => (
                  <td key={`ref-${trial}-${point}`} className="border px-2 py-1">
                    <ModernInput type="number" inputMode="decimal" value={refMatrix[point][trial] ?? ''} onChange={e => onRefChange(point, trial, e.target.value)} />
                  </td>
                ))}
                {[0,1,2].map(point => (
                  <td key={`uuc-${trial}-${point}`} className="border px-2 py-1">
                    <ModernInput type="number" inputMode="decimal" value={uucMatrix[point][trial] ?? ''} onChange={e => onUucChange(point, trial, e.target.value)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td className="border px-2 py-1 font-bold">Average</td>
              {[0,1,2].map(i => <td key={`ra${i}`} className="border px-2 py-1 text-center">{avg(refMatrix[i]).toFixed(2)}</td>)}
              {[0,1,2].map(i => <td key={`ua${i}`} className="border px-2 py-1 text-center">{avg(uucMatrix[i]).toFixed(2)}</td>)}
            </tr>
            <tr className="bg-gray-100">
              <td className="border px-2 py-1 font-bold">U</td>
              {[0,1,2].map(i => <td key={`u-r-${i}`} className="border px-2 py-1 text-center"></td>)}
              {[0,1,2].map(i => <td key={`u-u-${i}`} className="border px-2 py-1 text-center">{computeU(refMatrix[i], uucMatrix[i])}</td>)}
            </tr>
          </tfoot>
        </table>
      </div>
    </CardSection>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdInfo className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 1: Identity, Specifications, and Environment</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="text-sm font-semibold text-gray-700 mb-2">Identity and Specifications of Sphygmomanometer</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Model</label>
                    <ModernInput value={calDetails.model} onChange={e=> setCalDetails(d=>({...d, model: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Serial No.</label>
                    <ModernInput value={calDetails.serialNo} onChange={e=> setCalDetails(d=>({...d, serialNo: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Range</label>
                    <ModernInput value={calDetails.range} onChange={e=> setCalDetails(d=>({...d, range: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Accuracy</label>
                    <ModernInput value={calDetails.accuracy} onChange={e=> setCalDetails(d=>({...d, accuracy: e.target.value}))} />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 mt-2">
                <div className="text-sm font-semibold text-gray-700 mb-2">Environment Condition</div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                  {/* Start/End Time removed; handled automatically */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Temp Start (°C)</label>
                    <ModernInput type="number" inputMode="decimal" value={calDetails.envTempStart} onChange={e=> setCalDetails(d=>({...d, envTempStart: e.target.value}))} />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Humidity Start (%RH)</label>
                    <ModernInput type="number" inputMode="decimal" value={calDetails.envHumidityStart} onChange={e=> setCalDetails(d=>({...d, envHumidityStart: e.target.value}))} />
                  </div>
                  {/* End Temp/Humidity moved to Rapid Exhaust section */}
                  {/* Pressure Start/End (hPa) removed per request */}
                </div>
              </div>

              {/* Device Settings removed: not used in calculations */}
            </div>
          </CardSection>
        );
      case 2:
        return (
          <>
            <CardSection>
              <h3 className="font-semibold mb-2">STANDARD READINGS (IPRT) — DKD R-6-1</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border text-xs mb-3">
                  <colgroup>
                    <col style={{ width: '110px' }} />
                    <col style={{ width: '1fr' }} />
                    <col style={{ width: '1fr' }} />
                    <col style={{ width: '1fr' }} />
                    <col style={{ width: '1fr' }} />
                    <col style={{ width: '130px' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="border p-1" rowSpan={2}>APPLIED</th>
                      <th className="border p-1" rowSpan={2}>X1</th>
                      <th className="border p-1" rowSpan={2}>X2</th>
                      <th className="border p-1" rowSpan={2}>X3</th>
                      <th className="border p-1" rowSpan={2}>X4</th>
                      <th className="border p-1" rowSpan={2}>MEAN IPRT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedPressures.map((p,idx)=> (
                      <tr key={`iprt-${p}`}>
                        <td className="border p-1 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span>{p}</span>
                            <span className="text-[10px] text-gray-500">PRESSURE ({mmHgToKPa(p)} kPa)</span>
                          </div>
                        </td>
                        {['X1','X2','X3','X4'].map(k => (
                          <td key={`iprt-${k}`} className="border p-1 bg-green-100">
                            <ModernInput type="number" inputMode="decimal" value={iprtRows[idx][k] ?? ''} onChange={e=> setIprtCell(idx,k,e.target.value)} />
                          </td>
                        ))}
                        <td className="border p-1 text-center bg-gray-50">{iprtMean[idx]!==''? formatDec(iprtMean[idx], 6) : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardSection>
          </>
        );
      case 3:
        return (
          <>
            <CardSection>
              <h3 className="font-semibold mb-2">UNIT UNDER TEST READINGS (UUT) — DKD R-6-1</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border text-xs mb-3">
                  <colgroup>
                    <col style={{ width: '110px' }} />
                    <col style={{ width: '1fr' }} />
                    <col style={{ width: '1fr' }} />
                    <col style={{ width: '1fr' }} />
                    <col style={{ width: '1fr' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '160px' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="border p-1" rowSpan={2}>APPLIED</th>
                      <th className="border p-1" rowSpan={2}>X1</th>
                      <th className="border p-1" rowSpan={2}>X2</th>
                      <th className="border p-1" rowSpan={2}>X3</th>
                      <th className="border p-1" rowSpan={2}>X4</th>
                      <th className="border p-1" colSpan={3}>MEAN</th>
                      <th className="border p-1" rowSpan={2}>DEVIATION (mmHg)</th>
                      <th className="border p-1" rowSpan={2}>DEVIATION (kPa)</th>
                      <th className="border p-1" rowSpan={2}>Max Hyst. Err (mmHg)</th>
                    </tr>
                    <tr>
                      <th className="border p-1">up</th>
                      <th className="border p-1">down</th>
                      <th className="border p-1">UUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedPressures.map((p,idx)=> (
                      <tr key={p}>
                        <td className="border p-1 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span>{p}</span>
                            <span className="text-[10px] text-gray-500">PRESSURE ({mmHgToKPa(p)} kPa)</span>
                          </div>
                        </td>
                        {['X1','X2','X3','X4'].map(k => (
                          <td key={k} className="border p-1 bg-green-100">
                            <ModernInput type="number" inputMode="decimal" value={uutRows[idx][k] ?? ''} onChange={e=> setUutCell(idx,k,e.target.value)} />
                          </td>
                        ))}
                        <td className="border p-1 text-center bg-gray-50">{uutIncMean[idx]!==''? formatDec(uutIncMean[idx], 6) : ''}</td>
                        <td className="border p-1 text-center bg-gray-50">{uutDecMean[idx]!==''? formatDec(uutDecMean[idx], 6) : ''}</td>
                        <td className="border p-1 text-center bg-gray-50">{uutMean[idx]!==''? formatDec(uutMean[idx], 6) : ''}</td>
                        <td className="border p-1 text-center bg-gray-50">{deviationMmHg[idx]!==''? formatDec(deviationMmHg[idx], 6) : ''}</td>
                        <td className="border p-1 text-center bg-gray-50">{deviationKPa[idx]!==''? formatDec(deviationKPa[idx], 6) : ''}</td>
                        <td className="border p-1 text-center bg-gray-50">{hysteresisMax[idx]!==''? formatDec(hysteresisMax[idx], 6) : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardSection>
          </>
        );
      case 4:
        return (
          <>
            <CardSection>
              <h3 className="font-semibold mb-2">Rate of Pressure Loss</h3>
              <div className="overflow-x-auto">
                <table className="min-w-[560px] border text-xs">
                  <thead>
                    <tr>
                      <th className="border p-1">Applied Pressure (mmHg)</th>
                      <th className="border p-1">1st Reading</th>
                      <th className="border p-1">After 5 minutes</th>
                      <th className="border p-1">Rate (mmHg/min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lossPressures.map((p,idx)=> (
                      <tr key={p}>
                        <td className="border p-1 text-center">{p}</td>
                        <td className="border p-1"><ModernInput type="number" value={lossFirst[idx]} onChange={e=> setLossFirst(prev=> prev.map((v,i)=> i===idx? e.target.value : v))} /></td>
                        <td className="border p-1"><ModernInput type="number" value={lossAfter5[idx]} onChange={e=> setLossAfter5(prev=> prev.map((v,i)=> i===idx? e.target.value : v))} /></td>
                        <td className="border p-1 text-center bg-gray-50">{lossRate[idx]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardSection>
          </>
        );
      case 5:
        return (
          <>
            <CardSection>
              <h3 className="font-semibold mb-2">Rapid Exhaust Valve Test</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Pressure (mmHg)</label>
                  <ModernInput type="number" value={rapidStartPressure} onChange={e=> setRapidStartPressure(Number(e.target.value)||0)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Pressure Target (≤ mmHg)</label>
                  <ModernInput type="number" value={rapidEndPressure} onChange={e=> setRapidEndPressure(Number(e.target.value)||0)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Elapsed Time (seconds)</label>
                  <ModernInput type="number" value={rapidElapsedSeconds} onChange={e=> setRapidElapsedSeconds(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Temperature (°C)</label>
                  <ModernInput type="number" inputMode="decimal" value={calDetails.envTempEnd} onChange={e=> setCalDetails(d=>({...d, envTempEnd: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Humidity (%RH)</label>
                  <ModernInput type="number" inputMode="decimal" value={calDetails.envHumidityEnd} onChange={e=> setCalDetails(d=>({...d, envHumidityEnd: e.target.value}))} />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <div>Criteria: drop from {rapidStartPressure} mmHg to ≤ {rapidEndPressure} mmHg in less than 10 s</div>
                <div className={`mt-1 font-semibold ${rapidPass === 'PASS' ? 'text-green-600' : rapidPass === 'FAIL' ? 'text-red-600' : 'text-gray-600'}`}>Result: {rapidPass || '—'}</div>
              </div>
            </CardSection>
          </>
        );
      case 6:
        return (
          <CardSection>
            <h2 className="text-lg font-bold mb-3">Results & Summary</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div className="font-semibold mb-1">I. Maximum Deviation</div>
                <div className="text-xs text-gray-600 mb-2">Per applied pressure: UUT increasing/decreasing vs IPRT, and maximum permissible error (± 4 mmHg).</div>
                <div className="overflow-x-auto">
                  <table className="w-full border text-xs">
                    <thead>
                      <tr>
                        <th className="border p-1">Applied (mmHg)</th>
                        <th className="border p-1">UUT Inc Mean</th>
                        <th className="border p-1">UUT Dec Mean</th>
                        <th className="border p-1">Max Deviation (mmHg)</th>
                        <th className="border p-1">Max Permissible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appliedPressures.map((p,i)=> (
                        <tr key={`res-dev-${p}`}>
                          <td className="border p-1 text-center">{p}</td>
                          <td className="border p-1 text-center">{uutIncMean[i]!==''? formatDec(uutIncMean[i],2):''}</td>
                          <td className="border p-1 text-center">{uutDecMean[i]!==''? formatDec(uutDecMean[i],2):''}</td>
                          <td className="border p-1 text-center">{maxDeviation[i]!==''? formatDec(maxDeviation[i],2):''}</td>
                          <td className="border p-1 text-center whitespace-nowrap">within ± 4 mmHg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <div className="font-semibold mb-1">III. Test for Air Leakage of the Pneumatic System</div>
                <div className="overflow-x-auto">
                  <table className="w-full border text-xs">
                    <thead>
                      <tr>
                        <th className="border p-1">Applied (mmHg)</th>
                        <th className="border p-1">1st Reading</th>
                        <th className="border p-1">After 5 min</th>
                        <th className="border p-1">Rate (mmHg/min)</th>
                        <th className="border p-1">Max Permissible Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lossPressures.map((p,idx)=> (
                        <tr key={`res-air-${p}`}>
                          <td className="border p-1 text-center">{p}</td>
                          <td className="border p-1 text-center">{lossFirst[idx] || ''}</td>
                          <td className="border p-1 text-center">{lossAfter5[idx] || ''}</td>
                          <td className="border p-1 text-center">{lossRate[idx]!==''? formatDec(lossRate[idx],2):''}</td>
                          <td className="border p-1 text-center">≤4.0 mmHg/min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <div className="flex items-center justify-between p-3 rounded border bg-gray-50">
                    <div className="text-sm">
                      <div className="font-semibold">Uncertainty Validation (k = {COVERAGE_K}, MPE = ±{MPE_MM_HG} mmHg)</div>
                      <div className="text-gray-600">Requirement: expanded uncertainty U ≤ MPE/3 ({UNCERTAINTY_THRESHOLD} mmHg)</div>
                    </div>
                    <div className={`${overallUncertaintyPass === '' ? 'text-gray-500 bg-gray-100' : overallUncertaintyPass ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'} px-3 py-1 rounded font-semibold`}>
                      {overallUncertaintyPass === '' ? 'INCOMPLETE' : overallUncertaintyPass ? 'PASS' : 'FAIL'}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-600">Computed per applied pressure from UUT repeatability.</span>
                    {isCompleted && (
                      <button onClick={()=> setShowUDetails(true)} className="text-xs px-3 py-1 rounded bg-[#2a9dab] text-white hover:bg-[#238a91]">View details</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="font-semibold mb-1">II. Test for Hysteresis Error</div>
                <div className="text-xs text-gray-600 mb-1">Maximum hysteresis error (mmHg) across pressure points. Limit: within ± 4 mmHg.</div>
                <div className="text-sm">Maximum Hysteresis Error: {formatDec(Math.max(...hysteresisMax.filter(v=>v!=='')),2) || '—'} (limit: within ± 4 mmHg)</div>
              </div>

              <div className="md:col-span-2">
                <div className="font-semibold mb-1">Rapid Exhaust Valve Test</div>
                <div className="text-sm">Drop from {rapidStartPressure} → ≤{rapidEndPressure} mmHg in {'<'} 10 s: {rapidPass || '—'}</div>
              </div>
            </div>
          </CardSection>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Loading Screen Overlay for Calibration Completion */}
      {isCalibrationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <svg className="animate-spin h-16 w-16 text-[#2a9dab] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Completing Calibration</h3>
            <p className="text-gray-600 mb-4">Please wait while we finalize your calibration...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-[#2a9dab] h-2 rounded-full animate-pulse" style={{
                width: '80%',
                animation: 'progressBar 2s ease-in-out infinite'
              }}></div>
            </div>
            <style jsx>{`
              @keyframes progressBar {
                0% { width: 0%; }
                50% { width: 80%; }
                100% { width: 0%; }
              }
            `}</style>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
      <div className="w-full mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md w-full mb-8 border border-blue-100 relative">
          {/* Close (X) Button */}
          <button
            onClick={() => setShowSimpleCloseConfirm(true)}
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 text-xl h-10 w-10 flex items-center justify-center rounded transition-colors font-bold"
            title="Close"
            aria-label="Close"
          >
            ✕
          </button>
          
          <div className="flex items-center mb-2 pr-20">
            <h1 className="text-2xl font-bold text-black">Sphygmomanometer Calibration</h1>
          </div>
          {renderStepper()}
          <div className="rounded-lg border p-3 bg-white shadow-sm border-blue-100">
            {renderStep()}
            <div className="flex justify-between mt-4 pt-3 border-t">
              <div className="flex space-x-2">
                <ModernButton onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1}>Previous</ModernButton>
              </div>
              <div className="flex space-x-2">
                {currentStep < steps.length ? (
                  <ModernButton onClick={handleNextStep}>Next</ModernButton>
                ) : (
                  <ModernButton className="bg-green-600 hover:bg-green-700" onClick={completeCalibration}>Confirm Calibration</ModernButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Navigation Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation && !showCalibrationConfirm}
        onClose={handleCancelBack}
        onConfirm={handleConfirmBack}
        title={confirmationTitle}
        message={confirmationMessage}
        type={confirmationType}
        confirmText="Leave Anyway"
        cancelText="Stay Here"
        isLoading={isSaving}
      />

      {/* Calibration Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCalibrationConfirm}
        onClose={() => setShowCalibrationConfirm(false)}
        onConfirm={handleConfirmCalibrationAction}
        title={calibrationConfirmTitle}
        message={calibrationConfirmMessage}
        type={calibrationConfirmType}
        confirmText="Confirm"
        cancelText="Cancel"
        isLoading={isSaving}
      />

      {/* Simple Close Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSimpleCloseConfirm}
        onClose={() => setShowSimpleCloseConfirm(false)}
        onConfirm={() => { setShowSimpleCloseConfirm(false); handleConfirmBack(); }}
        title="Leave Calibration?"
        message="You have unsaved changes in your sphygmomanometer calibration. Are you sure you want to leave? Your progress will be lost."
        type="warning"
        confirmText="Leave Anyway"
        cancelText="Stay Here"
        isLoading={false}
      />

      {/* Uncertainty Details Modal */}
      {showUDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Uncertainty Details (k = {COVERAGE_K})</h3>
              <button onClick={()=> setShowUDetails(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="text-sm text-gray-700 mb-3">Threshold: U ≤ {UNCERTAINTY_THRESHOLD} mmHg (MPE/3 with MPE = {MPE_MM_HG} mmHg)</div>
            <div className="overflow-x-auto">
              <table className="w-full border text-xs">
                <thead>
                  <tr>
                    <th className="border p-1">Applied (mmHg)</th>
                    <th className="border p-1">Std Dev (s)</th>
                    <th className="border p-1">Std Unc (u)</th>
                    <th className="border p-1">Expanded U (k·u)</th>
                    <th className="border p-1">Meets U ≤ MPE/3</th>
                  </tr>
                </thead>
                <tbody>
                  {appliedPressures.map((p,idx)=> (
                    <tr key={`u-row-${p}`}>
                      <td className="border p-1 text-center">{p}</td>
                      <td className="border p-1 text-center">{stdDevUUT[idx]!==''? formatDec(stdDevUUT[idx], 3): ''}</td>
                      <td className="border p-1 text-center">{standardUncertainty[idx]!==''? formatDec(standardUncertainty[idx], 3): ''}</td>
                      <td className="border p-1 text-center">{expandedUncertaintyU[idx]!==''? formatDec(expandedUncertaintyU[idx], 2): ''}</td>
                      <td className={`border p-1 text-center ${perPointPassU[idx] === '' ? '' : perPointPassU[idx] ? 'text-green-700' : 'text-red-700'}`}>
                        {perPointPassU[idx] === '' ? '—' : perPointPassU[idx] ? 'PASS' : 'FAIL'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={()=> setShowUDetails(false)} className="px-4 py-2 rounded bg-[#2a9dab] text-white hover:bg-[#238a91]">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Next Step Confirmation Modal */}
      <ConfirmationModal
        isOpen={showNextConfirm}
        onClose={handleCancelNext}
        onConfirm={handleConfirmNext}
        title="Proceed to next step?"
        message="Your progress will be saved before moving to the next step."
        type="info"
        confirmText="Save & Continue"
        cancelText="Stay Here"
        isLoading={isNextSaving}
      />
    </div>
  );
}

export default SphygmomanometerCalibration;


