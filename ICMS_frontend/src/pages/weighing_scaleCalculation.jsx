import React, { useState, useEffect, useCallback } from 'react';
import { MdScience, MdCalculate, MdInfo, MdOutlineDeviceHub } from 'react-icons/md';
import { FaBalanceScale } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import './uncertainty-print.css';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import conventionalMassReference from '../data/conventional_mass_reference.json';
import Select from 'react-select';
import testWeights from '../data/test_weights.json';
import ConfirmationModal from '../components/ConfirmationModal';
import { useBackNavigation } from '../hooks/useBackNavigation';
import { useAutoSave, usePageRefreshDetection } from '../hooks/useAutoSave';

// Custom hook for input navigation
const useInputNavigation = () => {
  const getNextInput = (currentInput) => {
    const allInputs = Array.from(document.querySelectorAll('input:not([disabled]):not([readonly])'));
    const currentIndex = allInputs.indexOf(currentInput);
    
    // Find the next input in the same column (vertically down)
    const currentRow = currentInput.closest('tr');
    const currentCell = currentInput.closest('td');
    const currentColumnIndex = Array.from(currentRow.children).indexOf(currentCell);
    
    // Look for the next input in the same column in subsequent rows
    const currentTable = currentInput.closest('table');
    if (currentTable) {
      const allRows = Array.from(currentTable.querySelectorAll('tr'));
      const currentRowIndex = allRows.indexOf(currentRow);
      
      // Search in subsequent rows for an input in the same column
      for (let i = currentRowIndex + 1; i < allRows.length; i++) {
        const row = allRows[i];
        const cell = row.children[currentColumnIndex];
        if (cell) {
          const input = cell.querySelector('input:not([disabled]):not([readonly])');
          if (input) {
            return input;
          }
        }
      }
      
      // If no input found in the same column, move to the first row of the next column
      const nextColumnIndex = currentColumnIndex + 1;
      if (nextColumnIndex < currentRow.children.length) {
        // Look for the first input in the next column
        for (let i = 0; i < allRows.length; i++) {
          const row = allRows[i];
          const cell = row.children[nextColumnIndex];
          if (cell) {
            const input = cell.querySelector('input:not([disabled]):not([readonly])');
            if (input) {
              return input;
            }
          }
        }
      }
    }
    
    // If no input found in the same column or next column, fall back to the next input in DOM order
    return allInputs[currentIndex + 1] || null;
  };

  const getPreviousInput = (currentInput) => {
    const allInputs = Array.from(document.querySelectorAll('input:not([disabled]):not([readonly])'));
    const currentIndex = allInputs.indexOf(currentInput);
    
    // Find the previous input in the same column (vertically up)
    const currentRow = currentInput.closest('tr');
    const currentCell = currentInput.closest('td');
    const currentColumnIndex = Array.from(currentRow.children).indexOf(currentCell);
    
    // Look for the previous input in the same column in previous rows
    const currentTable = currentInput.closest('table');
    if (currentTable) {
      const allRows = Array.from(currentTable.querySelectorAll('tr'));
      const currentRowIndex = allRows.indexOf(currentRow);
      
      // Search in previous rows for an input in the same column
      for (let i = currentRowIndex - 1; i >= 0; i--) {
        const row = allRows[i];
        const cell = row.children[currentColumnIndex];
        if (cell) {
          const input = cell.querySelector('input:not([disabled]):not([readonly])');
          if (input) {
            return input;
          }
        }
      }
      
      // If no input found in the same column, move to the last row of the previous column
      const prevColumnIndex = currentColumnIndex - 1;
      if (prevColumnIndex >= 0) {
        // Look for the last input in the previous column
        for (let i = allRows.length - 1; i >= 0; i--) {
          const row = allRows[i];
          const cell = row.children[prevColumnIndex];
          if (cell) {
            const input = cell.querySelector('input:not([disabled]):not([readonly])');
            if (input) {
              return input;
            }
          }
        }
      }
    }
    
    // If no input found in the same column or previous column, fall back to the previous input in DOM order
    return allInputs[currentIndex - 1] || null;
  };

  const handleKeyDown = (e, customHandler) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const nextInput = getNextInput(e.target);
      if (nextInput) {
        nextInput.focus();
        nextInput.select(); // Select all text for easy replacement
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      const prevInput = getPreviousInput(e.target);
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
    
    // Call custom handler if provided
    if (customHandler) {
      customHandler(e);
    }
  };

  return { handleKeyDown, getNextInput, getPreviousInput };
};

const steps = [
  { id: 1, title: 'Equipment & Environment', icon: <MdOutlineDeviceHub /> },
  { id: 2, title: 'Eccentricity Test', icon: <MdScience /> },
  { id: 3, title: 'Repeatability Test', icon: <MdScience /> },
  { id: 4, title: 'Linearity Test Weights', icon: <MdScience /> },
  { id: 5, title: 'Linearity Test Results', icon: <MdScience /> },
  { id: 6, title: 'Uncertainty Budget Table', icon: <MdCalculate /> },
  { id: 7, title: 'Uncertainty & Certification', icon: <MdCalculate /> },
];

const CardSection = ({ children, className = '' }) => (
  <div className={`rounded-xl shadow bg-white border border-[#2a9dab] p-4 mb-4 ${className}`}>
    {children}
  </div>
);

const modernInput = (props) => {
  const { handleKeyDown: navigationHandler } = useInputNavigation();

  const handleKeyDown = (e) => {
    navigationHandler(e, props.onKeyDown);
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

const modernButton = (props) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm
      ${props.disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
        props.variant === 'secondary' ? 'bg-[#2a9dab] text-white hover:bg-[#238a91]' :
        'bg-[#2a9dab] text-white hover:bg-[#238a91]'}
      ${props.className || ''}`}
  />
);

function WeighingScaleCalculation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const passedSerialNumber = location.state?.serialNumber || '';
  const passedSampleId = location.state?.equipmentId || location.state?.sampleId || null; // equipmentId is actually sampleId from navigation
  
  // Debug navigation state
  console.log('Weighing Scale calibration - Location state:', location.state);
  console.log('Weighing Scale calibration - Sample ID:', passedSampleId);
  console.log('Weighing Scale calibration - Serial Number:', passedSerialNumber);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSimpleCloseConfirm, setShowSimpleCloseConfirm] = useState(false);

  // Calibration confirmation state
  const [showCalibrationConfirmation, setShowCalibrationConfirmation] = useState(false);
  const [calibrationConfirmationTitle, setCalibrationConfirmationTitle] = useState('');
  const [calibrationConfirmationMessage, setCalibrationConfirmationMessage] = useState('');
  const [calibrationConfirmationType, setCalibrationConfirmationType] = useState('');
  const [isCalibrationLoading, setIsCalibrationLoading] = useState(false);
  // Next-step confirmation state
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [isNextSaving, setIsNextSaving] = useState(false);
  const [nextConfirmTitle, setNextConfirmTitle] = useState('Proceed to next step?');
  const [nextConfirmMessage, setNextConfirmMessage] = useState('Your progress will be saved before moving to the next step.');
  const [nextConfirmType, setNextConfirmType] = useState('info');

  // Step 1: Equipment & Environment
  const [equipment, setEquipment] = useState({
    serialNumber: '',
    makeModel: '',
    capacity: '',
    readability: '',
    tempStart: '',
    tempEnd: '',
    humidityStart: '',
    humidityEnd: '',
    maxCapacity: '',
    minCapacity: '',
    weightType: '',
    weightCertNo: '',
    weightLastCal: '',
    // Additional fields for certificate mapping
    customerName: '',
    customerAddress: '',
    referenceNo: '',
    sampleNo: '',
    dateSubmitted: '',
  });
  const [sampleId, setSampleId] = useState(passedSampleId);
  const [sampleDataLoaded, setSampleDataLoaded] = useState(false);

  useEffect(() => {
    if (passedSampleId) {
      // Fetch equipment details by ID and auto-populate
      apiService.getSampleById(passedSampleId).then(res => {
        const eq = res.data;
        setEquipment(equipment => ({
          ...equipment,
          serialNumber: eq.serial_no || '',
          makeModel: eq.make_model || '',
          capacity: eq.capacity || '',
          readability: eq.readability || '',
          tempStart: '23.0',
          tempEnd: '23.2',
          humidityStart: '45',
          humidityEnd: '46',
          maxCapacity: eq.max_capacity || '',
          minCapacity: eq.min_capacity || '',
          weightType: eq.weight_type || '',
          weightCertNo: eq.weight_cert_no || '',
          weightLastCal: eq.weight_last_cal || '',
        }));
        setSampleId(eq.id || null);
        setSampleDataLoaded(true);
      });
    } else if (passedSerialNumber) {
      // Only fetch by serial if no ID is passed
      apiService.getSampleBySerial(passedSerialNumber).then(res => {
        const eq = res.data;
        setEquipment(equipment => ({
          ...equipment,
          serialNumber: eq.serial_no || '',
          makeModel: eq.make_model || '',
          capacity: eq.capacity || '',
          readability: eq.readability || '',
          tempStart: '23.0',
          tempEnd: '23.2',
          humidityStart: '45',
          humidityEnd: '46',
          maxCapacity: eq.max_capacity || '',
          minCapacity: eq.min_capacity || '',
          weightType: eq.weight_type || '',
          weightCertNo: eq.weight_cert_no || '',
          weightLastCal: eq.weight_last_cal || '',
        }));
        setSampleId(eq.id || null);
        setSampleDataLoaded(true);
      });
    } else {
      // No equipment ID or serial number, enable auto-save immediately
      setSampleDataLoaded(true);
    }
  }, [passedSampleId, passedSerialNumber]);

  // Fetch request details to populate certificate information
  useEffect(() => {
    if (sampleId) {
      // First get the sample details to get the reference number
      apiService.getSampleById(sampleId).then(sampleRes => {
        const sample = sampleRes.data;
        if (sample.reference_number) {
          // Fetch request details using the reference number
          apiService.getRequestDetails(sample.reference_number).then(requestRes => {
            const requestData = requestRes.data;
            if (requestData) {
              // Populate certificate information from request data
              setEquipment(prev => ({
                ...prev,
                customerName: requestData.client_name || requestData.customer_name || '',
                customerAddress: requestData.client_address || requestData.customer_address || '',
                referenceNo: requestData.reference_number || '',
                sampleNo: sample.serial_no || '',
                dateSubmitted: requestData.date_submitted || requestData.date_created || new Date().toISOString().split('T')[0],
              }));
            }
          }).catch(err => {
            console.log('Error fetching request details:', err);
          });
        }
      }).catch(err => {
        console.log('Error fetching sample details:', err);
      });
    }
  }, [sampleId]);

  // Auto-populate from existing calibration record if available
  useEffect(() => {
    if (sampleId) {
      apiService.getCalibrationRecordBySampleId(sampleId).then(res => {
        console.log('Calibration record response:', res.data);
        if (res.data && res.data.has_calibration === false) {
          // No calibration record exists for this sample - this is normal for new calibrations
          console.log('No calibration record found for this sample');
        } else if (res.data && res.data.input_data && res.data.calibration_type === 'Weighing Scale') {
          const input = typeof res.data.input_data === 'string' ? JSON.parse(res.data.input_data) : res.data.input_data;
          console.log('Loaded referenceWeights:', input.referenceWeights);
          setEquipment(input.equipment || {
            serialNumber: '', makeModel: '', capacity: '', readability: '', tempStart: '', tempEnd: '', humidityStart: '', humidityEnd: '',
            maxCapacity: '', minCapacity: '', weightType: '', weightCertNo: '', weightLastCal: ''
          });
          setReferenceWeights(input.referenceWeights || []);
          setLinearityRows(input.linearityRows || [{ applied: '', indication: '' }]);
          setMpe(input.mpe || '');
          setEccRows(input.eccRows || [
            { position: 'Center 1', indication: '' },
            { position: 'Corner 1', indication: '' },
            { position: 'Corner 2', indication: '' },
            { position: 'Corner 3', indication: '' },
            { position: 'Corner 4', indication: '' },
            { position: 'Center 2', indication: '' },
          ]);
          setRepeatabilityReadings(input.repeatabilityReadings || Array(10).fill(''));
          setCurrentStep(input.currentStep || 1);
        }
      }).catch((err) => {
        // Log unexpected errors
        console.log('Error loading calibration record:', err);
      });
    }
  }, [sampleId]);

  const handleEquipmentChange = (e) => {
    const { name, value } = e.target;
    setEquipment({ ...equipment, [name]: value });
  };

  // Step 2: Reference Weights
  const [referenceWeights, setReferenceWeights] = useState([]);
  const [newWeight, setNewWeight] = useState({
    class: '',
    value: '',
    serial: '',
    remarks: '',
  });

  const handleNewWeightChange = (e) => {
    setNewWeight({ ...newWeight, [e.target.name]: e.target.value });
  };

  const addReferenceWeight = async () => {
    if (!newWeight.class || !newWeight.value || !newWeight.serial) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const updatedWeights = [...referenceWeights, newWeight];
    setReferenceWeights(updatedWeights);
    setNewWeight({ class: '', value: '', serial: '', remarks: '' });
    // Save after adding
    setTimeout(() => handleAutoSave(), 0);
  };

  const removeReferenceWeight = async (idx) => {
    const updatedWeights = referenceWeights.filter((_, i) => i !== idx);
    setReferenceWeights(updatedWeights);
    // Save after removing
    setTimeout(() => handleAutoSave(), 0);
  };

  // Step 3: Linearity Test
  const [linearityRows, setLinearityRows] = useState([
    { applied: '', indication: '' },
  ]);
  const [mpe, setMpe] = useState('');

  const handleLinearityChange = (idx, field, value) => {
    const updated = [...linearityRows];
    updated[idx][field] = value;
    setLinearityRows(updated);
  };

  const addLinearityRow = () => {
    setLinearityRows([...linearityRows, { applied: '', indication: '' }]);
  };

  const removeLinearityRow = (idx) => {
    setLinearityRows(linearityRows.filter((_, i) => i !== idx));
  };

  // Helper for toggling measurement
  const handleToggleMeasurement = (rowIdx, colNum) => {
    setLinearityRows(prev => prev.map((row, idx) => {
      if (idx !== rowIdx) return row;
      return {
        ...row,
        [`measurement${colNum}`]: row[`measurement${colNum}`] ? false : true,
      };
    }));
  };

  // Step 4: Eccentricity Test (now Step 2)
  const [eccRows, setEccRows] = useState([
    { position: 'Center 1', indication: '' },
    { position: 'Corner 1', indication: '' },
    { position: 'Corner 2', indication: '' },
    { position: 'Corner 3', indication: '' },
    { position: 'Corner 4', indication: '' },
    { position: 'Center 2', indication: '' },
  ]);

  const handleEccChange = (idx, field, value) => {
    const updated = [...eccRows];
    updated[idx][field] = value;
    setEccRows(updated);
  };

  const addEccRow = () => {
    setEccRows([...eccRows, { position: '', indication: '' }]);
  };

  const removeEccRow = (idx) => {
    setEccRows(eccRows.filter((_, i) => i !== idx));
  };

  // Calculate center indication (average of two measurements) and errors
  const center1 = parseFloat(eccRows[0]?.indication);
  const center2 = parseFloat(eccRows[5]?.indication);
  const centerIndication = (!isNaN(center1) && !isNaN(center2))
    ? (center1 + center2) / 2
    : (!isNaN(center1) ? center1 : (!isNaN(center2) ? center2 : undefined));
  const cornerIndices = [1, 2, 3, 4];
  const cornerDiffs = cornerIndices.map(i => {
    const ind = parseFloat(eccRows[i]?.indication);
    return isNaN(centerIndication) || isNaN(ind) ? 0 : Math.abs(ind - centerIndication);
  });
  const maxImax = Math.max(...cornerDiffs);

  // Step 5: Repeatability Test
  const [repeatabilityReadings, setRepeatabilityReadings] = useState(Array(10).fill(''));

  const handleRepeatabilityChange = (idx, value) => {
    // Only allow numbers or empty string
    if (value === '' || !isNaN(Number(value))) {
      const updated = [...repeatabilityReadings];
      updated[idx] = value;
      setRepeatabilityReadings(updated);
    }
  };

  // Calculate mean and standard deviation for repeatability ONCE for all rows
  const repeatVals = repeatabilityReadings.map(Number).filter(v => !isNaN(v));
  const nRepeat = repeatVals.length;
  const meanRepeat = nRepeat > 0 ? repeatVals.reduce((a, b) => a + b, 0) / nRepeat : 0;
  const stddevRepeat = nRepeat > 1 ? Math.sqrt(repeatVals.reduce((sum, v) => sum + Math.pow(v - meanRepeat, 2), 0) / (nRepeat - 1)) : 0;
// Store repeatability uncertainty for all rows (Excel uses same value for all rows)
const u_rep_all = stddevRepeat;

  // Step 6: Uncertainty Estimation
  // Helper: get value or fallback to 0
  const safeNum = v => isNaN(parseFloat(v)) ? 0 : parseFloat(v);
  // Helper: readability with default (ensures rounding columns not zero)
  const getReadability = () => {
    const val = safeNum(equipment.readability);
    return val > 0 ? val : 100; // default to 100 g if not provided
  };

  // Add this helper function for per-row expanded uncertainty
  function getExpandedUncertainty(idx) {
    const mpe = mpeByCol[idx] || 0;
    const mpe_g_row = mpe / 1000;
    const d_row = getReadability();
    // Updated formulas to match Excel (with sqrt(3))
    const u_ref_row = mpe_g_row / (3 * Math.sqrt(3));
    const u_air_row = mpe_g_row / (4 * Math.sqrt(3));
    const u_drift_row = mpe_g_row / (3 * Math.sqrt(3));
    const u_conv_row = mpe_g_row / (3 * Math.sqrt(3));
    const u_round0_row = d_row / (2 * Math.sqrt(3));
    const u_round1_row = d_row / (2 * Math.sqrt(3));
    let Imax_row = 0;
    if (idx < 4) {
      const ind = parseFloat(eccRows[cornerIndices[idx]]?.indication);
      Imax_row = isNaN(centerIndication) || isNaN(ind) ? 0 : Math.abs(ind - centerIndication);
    } else {
      Imax_row = maxImax;
    }
    // Eccentricity set to 0 and excluded from calculations
    const u_ecc_row = 0;
    const u_rep_row = stddevRepeat;
    // Include both rounding components; exclude eccentricity from combination
    const u_components_row = [u_ref_row, u_air_row, u_drift_row, u_conv_row, u_round0_row, u_round1_row, u_rep_row];
    const sumsq = u_components_row.reduce((sum, u) => sum + u * u, 0);
    const u_combined_row = Math.sqrt(sumsq);
    const kVal = 2;
    const U_expanded_row = kVal * u_combined_row;
    return U_expanded_row;
  }

  // Reference weight uncertainty (MPE/(3*sqrt(3)))
  const mpeNum = safeNum(mpe);
  const mpe_g = mpeNum / 1000; // convert mg to g
  const u_ref = mpe_g / (3 * Math.sqrt(3));
  // Air buoyancy (MPE/(4*sqrt(3)))
  const u_air = mpe_g / (4 * Math.sqrt(3));
  // Drift of weights (MPE/(3*sqrt(3)))
  const u_drift = mpe_g / (3 * Math.sqrt(3));
  // Convection (MPE/(3*sqrt(3)))
  const u_conv = mpe_g / (3 * Math.sqrt(3));
  // Rounding error (d/(2*sqrt(3))), d = readability
  const d = getReadability();
  const u_round0 = d / (2 * Math.sqrt(3));
  const u_round1 = d / (2 * Math.sqrt(3));
  // Backward-compatible alias for displays/result payloads expecting u_round
  const u_round = u_round0;
  // Eccentricity - set to 0 and exclude from calculations
  const u_ecc = 0;
  // Repeatability (s)
  const u_rep = stddevRepeat;

  // Combine all standard uncertainties (include both rounding; exclude eccentricity)
  const u_components = [u_ref, u_air, u_drift, u_conv, u_round0, u_round1, u_rep];
  const u_combined = Math.sqrt(u_components.reduce((sum, u) => sum + u * u, 0));
  const k = 2; // coverage factor
  const U_expanded = k * u_combined;

  // Calculate Test Load (g) for each column
  const testLoadByCol = [1,2,3,4,5,6].map(num =>
    linearityRows.reduce((sum, row) =>
      row[`measurement${num}`] && row.nominalValue ? sum + Number(row.nominalValue) : sum
    , 0)
  );

  // Calculate mpe (mg) for each column (sum mpe of all ON rows in each column)
  const mpeByCol = [1,2,3,4,5,6].map(num =>
    linearityRows.reduce((sum, row) =>
      row[`measurement${num}`] && row.mpe ? sum + Number(row.mpe) : sum
    , 0)
  );

  // Add state for Step 3: Linearity Test Results
  const [linearityResults, setLinearityResults] = useState([
    { indication: '' }, { indication: '' }, { indication: '' }, { indication: '' }, { indication: '' }, { indication: '' }
  ]);

  const handleResultIndicationChange = (idx, value) => {
    setLinearityResults(prev => prev.map((row, i) => i === idx ? { ...row, indication: value } : row));
    // Trigger auto-save after updating linearity results
    setTimeout(() => handleAutoSave(), 0);
  };

  // Gather data for results table from toggled columns in Step 2
  // In the resultsRows calculation (for the results table), ensure all uncertainty and mpe values are in grams
  const resultsRows = [1,2,3,4,5,6].map((num, idx) => {
    // Find the first row toggled ON for this measurement
    const row = linearityRows.find(r => r[`measurement${num}`]);
    const testLoad = testLoadByCol[idx] || '';
    // Convert mpe from mg to g for display and calculations
    const mpeMg = mpeByCol[idx] || '';
    const mpeG = mpeMg ? (Number(mpeMg) / 1000).toFixed(5) : '';
    const indication = linearityResults[idx]?.indication || '';
    const error = indication && testLoad ? (Number(indication) - Number(testLoad)).toFixed(5) : '';
    // Use the correct expanded uncertainty in grams (should match the uncertainty budget table)
    const expandedUnc = getExpandedUncertainty(idx).toFixed(5);
    const threshold = Number(testLoad) * 0.0000062;
    const cmcChecker = (Number(expandedUnc) <= threshold ? threshold : Number(expandedUnc)).toFixed(3);
    return {
      num,
      testLoad: testLoad ? Number(testLoad).toFixed(5) : '',
      mpeMg: mpeMg ? Number(mpeMg).toFixed(2) : '',
      mpeG,
      indication,
      error,
      expandedUnc,
      cmcChecker,
    };
  });

  // Stepper UI
  const renderStepper = () => (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full border-2 shadow-sm transition-colors text-lg font-bold
                ${isActive ? 'bg-[#2a9dab] border-[#2a9dab] text-white scale-110' :
                  isCompleted ? 'bg-[#2a9dab] border-[#2a9dab] text-white' :
                  'bg-white border-[#2a9dab] text-[#2a9dab]'}
              `}
              style={{ transition: 'all 0.2s' }}
            >
              {React.cloneElement(step.icon, {
                className: isActive
                  ? 'text-white'
                  : isCompleted
                  ? 'text-white'
                  : 'text-[#2a9dab]'
              })}
            </div>
            <div className="ml-2">
              <p className={`text-xs font-semibold tracking-wide ${
                isActive ? 'text-[#2a9dab]' :
                isCompleted ? 'text-[#2a9dab]' : 'text-gray-400'
              }`}>{step.title}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-1 mx-2 rounded-full ${
                isCompleted ? 'bg-[#2a9dab]' : 'bg-[#e0f7fa]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  // Step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdOutlineDeviceHub className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 1: Equipment & Environmental Conditions</span>
            </div>
            
            {/* Certificate Information Display */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-3">Certificate Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name:</label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900">
                    {equipment.customerName || 'Loading...'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Customer Address:</label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900">
                    {equipment.customerAddress || 'Loading...'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reference No.:</label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900">
                    {equipment.referenceNo || 'Loading...'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sample No.:</label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900">
                    {equipment.sampleNo || 'Loading...'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date Submitted:</label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900">
                    {equipment.dateSubmitted || 'Loading...'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Serial Number:</label>
                {modernInput({
                  name: 'serialNumber',
                  value: equipment.serialNumber,
                  readOnly: true,
                  className: 'bg-gray-100',
                })}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Make/Model:</label>
                {modernInput({
                  name: 'makeModel',
                  value: equipment.makeModel,
                  onChange: handleEquipmentChange,
                  placeholder: 'e.g. Mettler Toledo',
                })}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Temperature Start (°C):</label>
                {modernInput({
                  name: 'tempStart',
                  value: equipment.tempStart,
                  onChange: handleEquipmentChange,
                  placeholder: 'e.g. 23.0',
                  type: 'number',
                })}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Temperature End (°C):</label>
                {modernInput({
                  name: 'tempEnd',
                  value: equipment.tempEnd,
                  onChange: handleEquipmentChange,
                  placeholder: 'e.g. 23.2',
                  type: 'number',
                })}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Humidity Start (%):</label>
                {modernInput({
                  name: 'humidityStart',
                  value: equipment.humidityStart,
                  onChange: handleEquipmentChange,
                  placeholder: 'e.g. 45',
                  type: 'number',
                })}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Humidity End (%):</label>
                {modernInput({
                  name: 'humidityEnd',
                  value: equipment.humidityEnd,
                  onChange: handleEquipmentChange,
                  placeholder: 'e.g. 46',
                  type: 'number',
                  className: 'mb-4',
                })}
              </div>
            </div>
            {/* Remove the 'Weights' label above the Type, Certificate No., and Date of Last Calibration input fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type:</label>
                {modernInput({
                  name: 'weightType',
                  value: equipment.weightType || '',
                  onChange: handleEquipmentChange,
                  placeholder: 'e.g. OIML Class M',
                })}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Certificate No.:</label>
                {modernInput({
                  name: 'weightCertNo',
                  value: equipment.weightCertNo || '',
                  onChange: handleEquipmentChange,
                  placeholder: '',
                })}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Last Calibration:</label>
                {modernInput({
                  name: 'weightLastCal',
                  value: equipment.weightLastCal || '',
                  onChange: handleEquipmentChange,
                  placeholder: '',
                  type: 'date',
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Maximum Capacity (g):</label>
                {modernInput({
                  name: 'maxCapacity',
                  value: equipment.maxCapacity || '',
                  onChange: handleEquipmentChange,
                  placeholder: 'e.g. 120000',
                  type: 'number',
                })}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Capacity (g):</label>
                {modernInput({
                  name: 'minCapacity',
                  value: equipment.minCapacity || '',
                  onChange: handleEquipmentChange,
                  placeholder: 'e.g. 0',
                  type: 'number',
                })}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Readability (g):</label>
                {modernInput({
                  name: 'readability',
                  value: equipment.readability,
                  onChange: handleEquipmentChange,
                  placeholder: 'e.g. 250',
                  type: 'number',
                })}
              </div>
            </div>
          </CardSection>
        );
      case 2:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdScience className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 2: Eccentricity Test</span>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border text-sm mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Position</th>
                    <th className="border px-2 py-1">Indication (g)</th>
                    <th className="border px-2 py-1">Eccentricity Error (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {eccRows.map((row, idx) => {
                    const isCenter = row.position.startsWith('Center');
                    const ind = parseFloat(row.indication);
                    const error = isCenter ? '' : (isNaN(centerIndication) || isNaN(ind) ? '' : (ind - centerIndication).toFixed(6));
                    // Show 'Center' label for both Center 1 and Center 2
                    const displayPosition = row.position.startsWith('Center') ? 'Center' : row.position;
                    return (
                      <tr key={idx}>
                        <td className="border px-2 py-1 font-semibold">{displayPosition}</td>
                        <td className="border px-2 py-1">
                          {modernInput({
                            value: row.indication,
                            onChange: e => handleEccChange(idx, 'indication', e.target.value),
                            type: 'number',
                            placeholder: 'Indication',
                            className: 'w-24',
                          })}
                        </td>
                        <td className="border px-2 py-1 font-mono">{error}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Replace the styled summary with plain text */}
            <div className="mt-2 text-sm">
              <div>Average of Center (g): <span className="font-mono">{centerIndication ? centerIndication.toFixed(6) : '0.000000'}</span></div>
              <div><span style={{fontStyle:'italic'}}>I</span><sub>max</sub> (g): <span className="font-mono">{maxImax.toFixed(6)}</span></div>
            </div>
          </CardSection>
        );
      case 3:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdScience className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 3: Repeatability Test</span>
            </div>
            <div className="mb-2 text-xs text-gray-600">Enter 10 readings for the same load:</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
              {repeatabilityReadings.map((val, idx) => (
                <div key={idx}>
                  <label className="block text-xs text-gray-500 mb-1">Reading {idx + 1}</label>
                  {modernInput({
                    value: val || '', // Always a string or empty
                    onChange: e => handleRepeatabilityChange(idx, e.target.value),
                    type: 'number',
                    placeholder: `R${idx + 1}`,
                    className: 'w-24',
                  })}
                </div>
              ))}
            </div>
            {/* Replace the styled mean/stddev display with plain text */}
            <div className="mt-2 text-sm">
              <div>Mean: <span className="font-mono">{nRepeat > 0 ? meanRepeat.toFixed(6) : '0.000000'} g</span></div>
              <div>Standard Deviation (s): <span className="font-mono">{nRepeat > 1 ? stddevRepeat.toFixed(6) : '0.000000'} g</span></div>
            </div>
          </CardSection>
        );
      case 4:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdScience className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 4: Linearity Test Weights</span>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border text-sm mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Markings</th>
                    <th className="border px-2 py-1">Nominal Value (g)</th>
                    <th className="border px-2 py-1">mpe (mg)</th>
                    <th className="border px-2 py-1">1</th>
                    <th className="border px-2 py-1">2</th>
                    <th className="border px-2 py-1">3</th>
                    <th className="border px-2 py-1">4</th>
                    <th className="border px-2 py-1">5</th>
                    <th className="border px-2 py-1">6</th>
                  </tr>
                </thead>
                <tbody>
                  {linearityRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">
                        <Select
                          classNamePrefix="react-select"
                          options={testWeights.map(ref => ({ value: ref.iden, label: ref.iden }))}
                          value={row.markings ? { value: row.markings, label: row.markings } : null}
                          onChange={option => {
                            const selected = testWeights.find(ref => ref.iden === option?.value);
                            handleLinearityChange(idx, 'markings', option?.value || '');
                            if (selected) {
                              handleLinearityChange(idx, 'nominalValue', selected.conventional_mass);
                              handleLinearityChange(idx, 'mpe', selected.mpe_mg);
                            } else {
                              handleLinearityChange(idx, 'nominalValue', '');
                              handleLinearityChange(idx, 'mpe', '');
                            }
                          }}
                          isClearable
                          placeholder="Select..."
                          styles={{
                            container: base => ({ ...base, minWidth: '8rem' }),
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                          }}
                          menuPortalTarget={typeof window !== 'undefined' ? window.document.body : undefined}
                          menuPosition="fixed"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        {modernInput({
                          value: row.nominalValue || '',
                          readOnly: true,
                          placeholder: 'Nominal Value',
                          className: 'w-32 bg-gray-100',
                        })}
                      </td>
                      <td className="border px-2 py-1">
                        {modernInput({
                          value: row.mpe || '',
                          readOnly: true,
                          placeholder: 'mpe',
                          className: 'w-24 bg-gray-100',
                        })}
                      </td>
                      {[1,2,3,4,5,6].map(num => (
                        <td className="border px-2 py-1 text-center" key={num} style={{ minWidth: '5rem' }}>
                          <button
                            type="button"
                            className={`w-full h-full rounded border-2 flex items-center justify-center font-bold transition-colors ${row[`measurement${num}`] ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                            style={{ minHeight: '2.5rem' }}
                            onClick={() => handleToggleMeasurement(idx, num)}
                          >
                            {row[`measurement${num}`] ? '✔' : ''}
                          </button>
                        </td>
                      ))}
                      <td className="border px-2 py-1">
                        {linearityRows.length > 1 && (
                          <button
                            className="text-red-500 hover:underline text-xs"
                            onClick={() => removeLinearityRow(idx)}
                          >Remove</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="border px-2 py-1 font-bold" colSpan={3}>Test Load (g)</td>
                    {[1,2,3,4,5,6].map((num, i) => (
                      <td className="border px-2 py-1 text-center font-mono" key={num}>{typeof testLoadByCol[i] === 'number' && !isNaN(testLoadByCol[i]) ? Number(testLoadByCol[i]).toFixed(6) : ''}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border px-2 py-1 font-bold" colSpan={3}>mpe (mg)</td>
                    {[1,2,3,4,5,6].map((num, i) => (
                      <td className="border px-2 py-1 text-center font-mono" key={num}>{mpeByCol[i] || ''}</td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
            {modernButton({
              onClick: addLinearityRow,
              children: 'Add Row',
              className: 'mb-2',
            })}
          </CardSection>
        );
      case 5:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdScience className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 5: Linearity Test Results</span>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border text-sm mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Measurement No.</th>
                    <th className="border px-2 py-1">Test Load<br/>Applied load(g)</th>
                    <th className="border px-2 py-1">MPE (mg) of weights</th>
                    <th className="border px-2 py-1">MPE (g) of weights</th>
                    <th className="border px-2 py-1">Indication (g)</th>
                    <th className="border px-2 py-1">Error (g)</th>
                    <th className="border px-2 py-1">Expanded Uncertainty (k=2) g</th>
                    <th className="border px-2 py-1">CMC Checker</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsRows.map((row, idx) => (
                    <tr key={row.num}>
                      <td className="border px-2 py-1 text-center">{row.num}</td>
                      <td className="border px-2 py-1 text-right font-mono">{row.testLoad}</td>
                      <td className="border px-2 py-1 text-right font-mono">{row.mpeMg}</td>
                      <td className="border px-2 py-1 text-right font-mono">{row.mpeG}</td>
                      <td className="border px-2 py-1 text-right font-mono">
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded text-right font-mono"
                          value={row.indication}
                          onChange={e => handleResultIndicationChange(idx, e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1 text-right font-mono">{row.error}</td>
                      <td className="border px-2 py-1 text-right font-mono">{row.expandedUnc}</td>
                      <td className="border px-2 py-1 text-right font-mono font-bold">{row.cmcChecker}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardSection>
        );
      case 6:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdCalculate className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 6: Uncertainty Budget Table</span>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border text-xs mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Measurement No.</th>
                    <th className="border px-2 py-1">Test Loads (g)</th>
                    <th className="border px-2 py-1">u(δm_c)</th>
                    <th className="border px-2 py-1">u(δm_B)</th>
                    <th className="border px-2 py-1">u(δm_D)</th>
                    <th className="border px-2 py-1">u(δm_conv)</th>
                    <th className="border px-2 py-1">u(δI_dig0)</th>
                    <th className="border px-2 py-1">u(δI_digl)</th>
                    <th className="border px-2 py-1">u(δI_ecc)</th>
                    <th className="border px-2 py-1">u(δI_rep)</th>
                    <th className="border px-2 py-1">u</th>
                    <th className="border px-2 py-1">k</th>
                    <th className="border px-2 py-1">Expanded Standard Uncertainty (k=2) U</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5,6].map((num, idx) => {
                    // Per-measurement values
                    const testLoad = testLoadByCol[idx] || 0;
                    const mpe = mpeByCol[idx] || 0;
                    const mpe_g_row_budget = mpe / 1000;
                    const d_row_budget = getReadability();
                    // Update formulas to match Excel (with sqrt(3)), use unique names
                    const u_ref_row_budget = mpe_g_row_budget / (3 * Math.sqrt(3));
                    const u_air_row_budget = mpe_g_row_budget / (4 * Math.sqrt(3));
                    const u_drift_row_budget = mpe_g_row_budget / (3 * Math.sqrt(3));
                    const u_conv_row_budget = mpe_g_row_budget / (3 * Math.sqrt(3));
                    const u_round0_row_budget = d_row_budget / (2 * Math.sqrt(3));
                    const u_round1_row_budget = d_row_budget / (2 * Math.sqrt(3));
                    // Calculate per-row Imax for eccentricity (Excel: each row has its own value)
                    let Imax_row_budget = 0;
                    if (idx < 4) {
                      // Use the corresponding corner
                      const ind = parseFloat(eccRows[cornerIndices[idx]]?.indication);
                      Imax_row_budget = isNaN(centerIndication) || isNaN(ind) ? 0 : Math.abs(ind - centerIndication);
                    } else {
                      // Use the max of all corners
                      Imax_row_budget = Math.max(...cornerIndices.map(i => {
                        const ind = parseFloat(eccRows[i]?.indication);
                        return isNaN(centerIndication) || isNaN(ind) ? 0 : Math.abs(ind - centerIndication);
                      }));
                    }
                    // Eccentricity set to 0 and excluded from calculations
                    const u_ecc_row_budget = 0;
                    // Use the same repeatability value for all rows (Excel logic)
                    const u_rep_row_budget = u_rep_all;
                    const u_components_row_budget = [u_ref_row_budget, u_air_row_budget, u_drift_row_budget, u_conv_row_budget, u_round0_row_budget, u_round1_row_budget, u_rep_row_budget];
                    // Calculate sum of squares with full precision
                    const sumsq_budget = u_components_row_budget.reduce((sum, u) => sum + u * u, 0);
                    // Only round the final result for display
                    const u_combined_row_budget = Math.sqrt(sumsq_budget);
                    const kVal = 2;
                    const U_expanded_row_budget = kVal * u_combined_row_budget;
                    return (
                      <tr key={num}>
                        <td className="border px-2 py-1 text-center">{num}</td>
                        <td className="border px-2 py-1 text-right font-mono">{Number(testLoad).toFixed(3)}</td>
                        <td className="border px-2 py-1 text-right font-mono">{u_ref_row_budget.toFixed(10)}</td>
                        <td className="border px-2 py-1 text-right font-mono">{u_air_row_budget.toFixed(10)}</td>
                        <td className="border px-2 py-1 text-right font-mono">{u_drift_row_budget.toFixed(10)}</td>
                        <td className="border px-2 py-1 text-right font-mono">{u_conv_row_budget.toFixed(10)}</td>
                        <td className="border px-2 py-1 text-right font-mono">{u_round0_row_budget.toFixed(10)}</td>
                        <td className="border px-2 py-1 text-right font-mono">{u_round1_row_budget.toFixed(10)}</td> {/* u(δI_digl) */}
                        <td className="border px-2 py-1 text-right font-mono">{(0).toFixed(10)}</td>
                        <td className="border px-2 py-1 text-right font-mono">{u_rep_row_budget.toFixed(10)}</td>
                        <td className="border px-2 py-1 text-right font-mono">{u_combined_row_budget.toFixed(6)}</td>
                        <td className="border px-2 py-1 text-center">{kVal.toFixed(2)}</td>
                        <td className="border px-2 py-1 text-right font-mono">{(U_expanded_row_budget !== undefined && !isNaN(U_expanded_row_budget)) ? U_expanded_row_budget.toFixed(5) : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardSection>
        );
      case 7:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdCalculate className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 7: Uncertainty & Certification</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Uncertainty Table */}
              <div>
                <h2 className="text-md font-bold mb-2 text-[#2a9dab]">Uncertainty Estimation</h2>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border text-xs mb-2">
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
                        <td className="border px-2 py-1">{u_ref.toExponential(6)}</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Air buoyancy</td>
                        <td className="border px-2 py-1">MPE / 4 / 3</td>
                        <td className="border px-2 py-1">{u_air.toExponential(6)}</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Drift of weights</td>
                        <td className="border px-2 py-1">MPE / 3 / 3</td>
                        <td className="border px-2 py-1">{u_drift.toExponential(6)}</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Convection</td>
                        <td className="border px-2 py-1">MPE / 3 / 3</td>
                        <td className="border px-2 py-1">{u_conv.toExponential(6)}</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Rounding error</td>
                        <td className="border px-2 py-1">d / 2 / 3</td>
                        <td className="border px-2 py-1">{u_round.toExponential(6)}</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Eccentricity</td>
                        <td className="border px-2 py-1">Imax / 2 / 3</td>
                        <td className="border px-2 py-1">{(0).toExponential(6)}</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Repeatability</td>
                        <td className="border px-2 py-1">s</td>
                        <td className="border px-2 py-1">{u_rep.toExponential(6)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mb-2 text-xs">
                  <span className="font-semibold">Combined Standard Uncertainty (u): </span>
                  <span className="font-mono">{u_combined.toExponential(6)} g</span>
                </div>
                <div className="mb-2 text-xs">
                  <span className="font-semibold">Coverage Factor (k): </span>
                  <span className="font-mono">{k}</span>
                </div>
                <div className="mb-2 text-xs font-bold">
                  <span className="font-semibold">Expanded Uncertainty (U): </span>
                  <span className="font-mono">{U_expanded.toExponential(6)} g</span>
                </div>
              </div>
              {/* Results & Certification */}
              <div>
                <h2 className="text-md font-bold mb-2 text-[#2a9dab]">Results & Certification</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 shadow border border-gray-200">
                  <div className="mb-2 text-base">
                    <span className="font-semibold">Combined Standard Uncertainty (u): </span>
                    <span className="font-mono">{u_combined.toExponential(6)} g</span>
                  </div>
                  <div className="mb-2 text-base">
                    <span className="font-semibold">Coverage Factor (k): </span>
                    <span className="font-mono">{k}</span>
                  </div>
                  <div className="mb-2 text-base font-bold">
                    <span className="font-semibold">Expanded Uncertainty (U): </span>
                    <span className="font-mono">{U_expanded.toExponential(6)} g</span>
                  </div>
                </div>
              </div>
            </div>
          </CardSection>
        );
      default:
        return null;
    }
  };

  // Auto-save function - saves progress without marking as completed
  const handleAutoSave = async () => {
    if (!sampleId) {
      return false;
    }
    
    console.log('Auto-saving weighing scale calibration progress...');
    
    const inputData = {
      equipment,
      linearityRows,
      mpe,
      eccRows,
      repeatabilityReadings,
      linearityResults,
      currentStep,
    };
    // Ensure non-empty result data so backend accepts autosave
    const resultData = { draft: true, lastStep: currentStep };
    
    try {
      const response = await apiService.saveCalibrationRecord({
        sample_id: sampleId,
        calibration_type: 'Weighing Scale',
        input_data: inputData,
        result_data: resultData,
        calibrated_by: user?.id || null,
        date_started: new Date().toISOString(),
        date_completed: null // Don't mark as completed for auto-save
      });
      
      if (response && response.data) {
        console.log('Auto-save successful');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Auto-save failed:', e);
      return false;
    }
  };

  // Final save function - marks calibration as completed
  const handleSaveCalibration = async () => {
    toast('Saving calibration...');
    console.log('handleSaveCalibration called with sampleId:', sampleId);
    if (!sampleId) {
      toast.error('Equipment not found.');
      return;
    }
    const inputData = {
      equipment,
      linearityRows,
      mpe,
      eccRows,
      repeatabilityReadings,
      linearityResults,
      currentStep,
      // ...add all other relevant input fields
    };
    // Debug uncertainty calculations
    console.log('Uncertainty calculation inputs:', {
      mpe: mpe,
      mpeNum: safeNum(mpe),
      mpe_g: safeNum(mpe) / 1000,
      equipment_readability: equipment.readability,
      d: safeNum(equipment.readability),
      maxImax: maxImax,
      stddevRepeat: stddevRepeat,
      eccRows: eccRows,
      repeatabilityReadings: repeatabilityReadings
    });
    
    console.log('Calculated uncertainty values:', {
      u_ref: u_ref,
      u_air: u_air,
      u_drift: u_drift,
      u_conv: u_conv,
      u_round: u_round,
      u_ecc: u_ecc,
      u_rep: u_rep,
      u_combined: u_combined,
      k: k,
      U_expanded: U_expanded
    });
    
    const resultData = {
      // General Information for Certificate
      general_info: {
        customer_name: equipment.customerName || '',
        customer_address: equipment.customerAddress || '',
        reference_no: equipment.referenceNo || '',
        sample_no: equipment.sampleNo || '',
        date_submitted: equipment.dateSubmitted || new Date().toISOString().split('T')[0],
        date_calibrated: new Date().toISOString().split('T')[0],
        calibration_place: 'DOST Regional Office No. I - RSTL',
        equipment_particulars: 'Weighing scale',
        equipment_type: equipment.weightType || '',
        equipment_make: equipment.makeModel?.split(' ')[0] || '',
        equipment_model: equipment.makeModel?.split(' ').slice(1).join(' ') || equipment.serialNumber || '',
        equipment_serial_no: equipment.serialNumber || '',
        equipment_capacity_kg: parseFloat(equipment.maxCapacity) || 0,
        equipment_graduation_g: parseFloat(equipment.readability) || 0,
        equipment_min_capacity_g: parseFloat(equipment.minCapacity) || 0,
        temperature_start: parseFloat(equipment.tempStart) || 0,
        temperature_end: parseFloat(equipment.tempEnd) || 0,
        humidity_start: parseFloat(equipment.humidityStart) || 0,
        humidity_end: parseFloat(equipment.humidityEnd) || 0,
        weight_cert_no: equipment.weightCertNo || '',
        weight_last_cal: equipment.weightLastCal || ''
      },
      
      // Measurement Results: Repeatability
      measurement_results: {
        repeatability: {
          trials: repeatabilityReadings.map((reading, index) => ({
            trial: index + 1,
            indication_g: parseFloat(reading) || 0
          })),
          std_deviation_g: stddevRepeat,
          mean_g: meanRepeat
        },
        
        // Eccentricity Test Results
        eccentricity: {
          measurements: eccRows.map((row, index) => {
            const isCenter = row.position.startsWith('Center');
            const ind = parseFloat(row.indication);
            
            // Calculate error exactly like Step 2 display
            let error = 0;
            if (!isCenter) {
              // For corner positions, error = indication - center indication (same as Step 2)
              error = isNaN(centerIndication) || isNaN(ind) ? 0 : ind - centerIndication;
            }
            // Center positions show empty/0 error
            
            // Map position names to match certificate format
            let positionName = row.position;
            if (row.position === 'Corner 1') positionName = 'Front Left';
            else if (row.position === 'Corner 2') positionName = 'Back Left';
            else if (row.position === 'Corner 3') positionName = 'Back Right';
            else if (row.position === 'Corner 4') positionName = 'Front Right';
            else if (row.position.startsWith('Center')) positionName = 'Center';
            
            return {
              position: positionName,
              indication_g: ind || 0,
              error_g: error
            };
          }),
          positions_legend: [
            { id: 1, name: "Center" },
            { id: 2, name: "Front Left" },
            { id: 3, name: "Back Left" },
            { id: 4, name: "Back Right" },
            { id: 5, name: "Front Right" }
          ],
          center_indication_g: centerIndication || 0,
          max_eccentricity_g: maxImax
        },
        
        // Linearity Test Results
        linearity: {
          measurements: linearityResults.map((result, index) => {
            // Based on certificate format: Load is always 0.000, Error = Indication - Load
            const load = 0.000; // Always 0.000 as shown in certificate
            const indication = parseFloat(result.indication) || 0;
            const error = indication - load; // Error = Indication - Load
            const expandedUnc = getExpandedUncertainty(index);
            
            return {
              no: index + 1,
              load_g: load,
              indication_g: indication,
              error_g: error,
              uncertainty_g: expandedUnc,
              mpe_mg: mpeByCol[index] || 0,
              mpe_g: (mpeByCol[index] || 0) / 1000,
              cmc_checker: expandedUnc
            };
          })
        },
        
        // Error vs Load Graph Data
        error_vs_load_graph: {
          x_axis_label: "Load (g)",
          y_axis_label: "Error (g)",
          data_points: linearityResults.map((result, index) => {
            const load = 0.000; // Always 0.000 as shown in certificate
            const indication = parseFloat(result.indication) || 0;
            const error = indication - load; // Error = Indication - Load
            return {
              load_g: load,
              error_g: error
            };
          })
        }
      },
      
      // Uncertainty Components
      uncertainty_components: {
        u_ref: isNaN(u_ref) || !isFinite(u_ref) ? 0 : u_ref,
        u_air: isNaN(u_air) || !isFinite(u_air) ? 0 : u_air,
        u_drift: isNaN(u_drift) || !isFinite(u_drift) ? 0 : u_drift,
        u_conv: isNaN(u_conv) || !isFinite(u_conv) ? 0 : u_conv,
        u_round0: isNaN(u_round0) || !isFinite(u_round0) ? 0 : u_round0,
        u_round1: isNaN(u_round1) || !isFinite(u_round1) ? 0 : u_round1,
        u_ecc: isNaN(u_ecc) || !isFinite(u_ecc) ? 0 : u_ecc,
        u_rep: isNaN(u_rep) || !isFinite(u_rep) ? 0 : u_rep
      },
      
      // Final Results
      final_results: {
        u_combined: isNaN(u_combined) || !isFinite(u_combined) ? 0 : u_combined,
        k: isNaN(k) || !isFinite(k) ? 2 : k,
        U_expanded: isNaN(U_expanded) || !isFinite(U_expanded) ? 0 : U_expanded
      },
      
      // Legacy fields for backward compatibility
      u_combined: isNaN(u_combined) || !isFinite(u_combined) ? 0 : u_combined,
      k: isNaN(k) || !isFinite(k) ? 2 : k,
      U_expanded: isNaN(U_expanded) || !isFinite(U_expanded) ? 0 : U_expanded,
      u_ref: isNaN(u_ref) || !isFinite(u_ref) ? 0 : u_ref,
      u_air: isNaN(u_air) || !isFinite(u_air) ? 0 : u_air,
      u_drift: isNaN(u_drift) || !isFinite(u_drift) ? 0 : u_drift,
      u_conv: isNaN(u_conv) || !isFinite(u_conv) ? 0 : u_conv,
      u_round: isNaN(u_round) || !isFinite(u_round) ? 0 : u_round,
      u_ecc: isNaN(u_ecc) || !isFinite(u_ecc) ? 0 : u_ecc,
      u_rep: isNaN(u_rep) || !isFinite(u_rep) ? 0 : u_rep,
      resultsRows: resultsRows || []
    };
    try {
      console.log('Sending calibration data to backend:', {
        sample_id: sampleId,
        calibration_type: 'Weighing Scale',
        input_data: inputData,
        result_data: resultData,
        calibrated_by: user?.id || null,
        date_started: new Date().toISOString(),
        date_completed: new Date().toISOString()
      });
      
      // Debug authentication
      const token = localStorage.getItem('token');
      console.log('Authentication token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
      console.log('User data:', user);
      console.log('User ID for calibration:', user?.id || user?.client_id || null);
      
      // Check if token is expired
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          console.log('Token expires at:', new Date(payload.exp * 1000));
          console.log('Current time:', new Date());
          console.log('Token is expired:', payload.exp < now);
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
      
      // Validate data before sending
      console.log('Validating calibration data before save...');
      console.log('Sample ID:', sampleId, 'Type:', typeof sampleId);
      console.log('User ID:', user?.id || user?.client_id || null);
      console.log('Input data keys:', Object.keys(inputData));
      console.log('Result data keys:', Object.keys(resultData));
      
      const response = await apiService.saveCalibrationRecord({
        sample_id: sampleId,
        calibration_type: 'Weighing Scale',
        input_data: inputData,
        result_data: resultData,
        calibrated_by: user?.id || null,
        date_started: new Date().toISOString(),
        date_completed: new Date().toISOString() // Mark as completed
      });
      console.log('Calibration save response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      toast.success('Calibration record saved!');
      setHasUnsavedChanges(false);
      
      // Trigger notification update for clients
      window.dispatchEvent(new CustomEvent('calibration-completed'));
      
      return true; // Return true on success
    } catch (e) {
      console.error('Calibration save error:', e);
      console.error('Error details:', {
        message: e.message,
        response: e.response?.data,
        status: e.response?.status,
        statusText: e.response?.statusText,
        headers: e.response?.headers
      });
      
      // Check if it's an authentication error
      if (e.response?.status === 401) {
        console.error('Authentication failed - token may be invalid or expired');
        toast.error('Authentication failed. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else {
        toast.error('Failed to save calibration record: ' + (e.message || 'Unknown error'));
      }
      
      return false; // Return false instead of throwing
    }
  };

  // Track changes to determine if there are unsaved changes
  useEffect(() => {
    const hasChanges = 
      // Check if equipment details have been filled
      Object.values(equipment).some(val => val && val.toString().trim() !== '') ||
      // Check if any linearity rows have data
      linearityRows.some(row => Object.values(row).some(val => val && val.toString().trim() !== '')) ||
      // Check if any eccentricity rows have data
      eccRows.some(row => Object.values(row).some(val => val && val.toString().trim() !== '')) ||
      // Check if any repeatability readings have data
      repeatabilityReadings.some(val => val && val.toString().trim() !== '') ||
      // Check if any linearity results have data
      linearityResults.some(result => result.indication && result.indication.toString().trim() !== '') ||
      // Check if mpe has been set
      mpe && mpe.toString().trim() !== '';
    
    setHasUnsavedChanges(hasChanges);
  }, [equipment, linearityRows, eccRows, repeatabilityReadings, linearityResults, mpe]);

  // Auto-save functionality
  const saveKey = `weighing_scale_calibration_${sampleId || 'new'}`;
  
  const { manualSave, clearBackup } = useAutoSave(
    handleAutoSave,
    { equipment, linearityRows, eccRows, repeatabilityReadings, mpe, linearityResults, currentStep },
    {
      interval: 10000, // 10 seconds - more frequent saves
      enabled: hasUnsavedChanges && sampleDataLoaded,
      showToast: false,
      saveKey
    }
  );

  // Page refresh detection and data restoration
  const restoreData = useCallback((restoredData) => {
    if (restoredData.equipment) {
      setEquipment(restoredData.equipment);
    }
    if (restoredData.linearityRows) {
      setLinearityRows(restoredData.linearityRows);
    }
    if (restoredData.eccRows) {
      setEccRows(restoredData.eccRows);
    }
    if (restoredData.repeatabilityReadings) {
      setRepeatabilityReadings(restoredData.repeatabilityReadings);
    }
    if (restoredData.mpe) {
      setMpe(restoredData.mpe);
    }
    if (restoredData.linearityResults) {
      setLinearityResults(restoredData.linearityResults);
    }
    if (restoredData.currentStep) {
      setCurrentStep(restoredData.currentStep);
    }
  }, []);

  usePageRefreshDetection(restoreData, saveKey, sampleDataLoaded);

  // Trigger auto-save when equipment data is loaded and there are changes
  useEffect(() => {
    if (sampleDataLoaded && hasUnsavedChanges) {
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        handleAutoSave().catch(console.error);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sampleDataLoaded, hasUnsavedChanges]);

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
    confirmationMessage: "Are you sure you want to leave?  Your progress will be lost.",
    confirmationType: "warning",
    onSave: handleAutoSave
  });

  // Confirm Calibration handler
  const handleConfirmCalibration = async () => {
    if (!sampleId) {
      console.error('No sampleId provided for calibration confirmation');
      return;
    }
    try {
      console.log('Calling updateSampleStatus with sampleId:', sampleId, 'status: completed');
      const response = await apiService.updateSampleStatus(sampleId, 'completed');
      console.log('updateSampleStatus response:', response);
      
      // Clear auto-save backup when calibration is completed
      clearBackup();
      toast.success('Equipment status set to completed. Request will be automatically completed when all samples are finished.');
      
      // Trigger notification update for clients
      window.dispatchEvent(new CustomEvent('calibration-completed'));
      
      // Navigate back to calibration page after successful confirmation
      setTimeout(() => {
        navigate('/calibration');
      }, 2000); // Wait 2 seconds to show the success message
      
      return true; // Return true on success
    } catch (e) {
      console.error('Failed to update sample status:', e);
      toast.error('Failed to update sample status: ' + (e.message || 'Unknown error'));
      return false; // Return false instead of throwing
    }
  };

  // Show confirmation dialog before calibration
  const showCalibrationConfirmationDialog = () => {
    setCalibrationConfirmationTitle("Confirm Calibration");
    setCalibrationConfirmationMessage("Are you sure you want to confirm this calibration?");
    setCalibrationConfirmationType("success");
    setShowCalibrationConfirmation(true);
  };

  // Handle confirmation for calibration
  const handleConfirmCalibrationAction = async () => {
    // Show loading state instead of closing immediately
    setIsCalibrationLoading(true);
    setCalibrationConfirmationMessage("Processing calibration confirmation...");
    
    try {
      console.log('Starting calibration confirmation process...');
      
      // Save the calibration record first
      console.log('Saving calibration record...');
      const saveResult = await handleSaveCalibration();
      if (!saveResult) {
        console.error('Failed to save calibration record');
        toast.error('Failed to save calibration record');
        setIsCalibrationLoading(false);
        setShowCalibrationConfirmation(false); // Close dialog on error
        return;
      }
      console.log('Calibration record saved successfully');
      
      // Update the sample status
      console.log('Updating sample status to completed...');
      const statusResult = await handleConfirmCalibration();
      if (!statusResult) {
        console.error('Failed to update sample status');
        toast.error('Failed to update sample status');
        setIsCalibrationLoading(false);
        setShowCalibrationConfirmation(false); // Close dialog on error
        return;
      }
      console.log('Sample status updated successfully');
      
      // Clear unsaved changes to prevent back navigation confirmation
      setHasUnsavedChanges(false);
      
      // Show success state in dialog
      setIsCalibrationLoading(false);
      setCalibrationConfirmationType("success");
      setCalibrationConfirmationMessage("Calibration completed successfully! Redirecting...");
      
      // Close dialog and navigate after showing success
      setTimeout(() => {
        setShowCalibrationConfirmation(false);
        // Use direct navigation to bypass any guards
        window.location.href = '/calibration';
      }, 1500);
      
    } catch (error) {
      console.error('Error in calibration confirmation:', error);
      toast.error('Failed to complete calibration: ' + (error.message || 'Unknown error'));
      setIsCalibrationLoading(false);
      setShowCalibrationConfirmation(false); // Close dialog on error
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <Toaster position="top-right" />
      <div className="w-full mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md w-full mb-8 border border-blue-100 relative">
          {/* Close (X) Button */}
          <button
            onClick={() => setShowSimpleCloseConfirm(true)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg h-8 w-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
            title="Close"
            aria-label="Close"
          >
            ✕
          </button>
          
          <div className="flex items-center mb-2 pr-20">
            <FaBalanceScale className="mr-2 text-[#2a9dab] text-2xl" />
            <h1 className="text-2xl font-bold text-black">Weighing Scale Uncertainty Calculator</h1>
          </div>
          {renderStepper()}
          <div className="rounded-lg border p-3 bg-white shadow-sm border-blue-100">
            {renderStepContent()}
            <div className="flex justify-between mt-4 pt-3 border-t">
              {modernButton({
                onClick: () => setCurrentStep(Math.max(1, currentStep - 1)),
                disabled: currentStep === 1,
                variant: 'secondary',
                children: 'Previous',
              })}
              <div className="flex space-x-2">
                {currentStep < 7 && modernButton({
                  onClick: async () => {
                    // Validation for Step 1: Equipment & Environment
                    if (currentStep === 1) {
                      if (!equipment.makeModel || !equipment.maxCapacity || 
                          !equipment.minCapacity || !equipment.readability) {
                        toast.error('Please fill in all essential sample fields (Make/Model, Max Capacity, Min Capacity, Readability) before proceeding.', {
                          position: 'top-center',
                          duration: 4000,
                          style: {
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }
                        });
                        return;
                      }
                    }
                    // Validation for Step 2: Eccentricity Test
                    if (currentStep === 2) {
                      if (eccRows.some(row => !row.indication || isNaN(Number(row.indication)))) {
                        toast.error('Please fill in all Eccentricity Test readings before proceeding.', {
                          position: 'top-center',
                          duration: 4000,
                          style: {
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }
                        });
                        return;
                      }
                    }
                    // Validation for Step 3: Repeatability Test
                    if (currentStep === 3) {
                      const validReadings = repeatabilityReadings.filter(val => val && !isNaN(Number(val)));
                      if (validReadings.length < 3) {
                        toast.error('Please enter at least 3 repeatability readings before proceeding.', {
                          position: 'top-center',
                          duration: 4000,
                          style: {
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }
                        });
                        return;
                      }
                    }
                    // Validation for Step 4: Linearity Test Weights
                    if (currentStep === 4) {
                      if (linearityRows.length === 0 || linearityRows.every(row => !row.markings)) {
                        toast.error('Please add at least one test weight before proceeding.', {
                          position: 'top-center',
                          duration: 4000,
                          style: {
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }
                        });
                        return;
                      }
                    }
                    // Validation for Step 5: Linearity Test Results
                    if (currentStep === 5) {
                      if (linearityResults.some(result => !result.indication || isNaN(Number(result.indication)))) {
                        toast.error('Please fill in all Linearity Test Results before proceeding.', {
                          position: 'top-center',
                          duration: 4000,
                          style: {
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }
                        });
                        return;
                      }
                    }
                    // Validation for Step 6: Uncertainty Budget Table
                    if (currentStep === 6) {
                      // This step is calculated automatically, no validation needed
                    }
                    
                    // Ask for confirmation then save and proceed
                    setNextConfirmTitle('Proceed to next step?');
                    setNextConfirmMessage('Your progress will be saved before moving to the next step.');
                    setNextConfirmType('info');
                    setShowNextConfirm(true);
                  },
                  children: 'Next',
                })}
                {currentStep === 7 && modernButton({
                  onClick: async () => {
                    // Final validation before confirmation - only check essential fields
                    if (!equipment.makeModel || !equipment.maxCapacity || 
                        !equipment.minCapacity || !equipment.readability) {
                      toast.error('Please complete all essential sample fields (Make/Model, Max Capacity, Min Capacity, Readability) before confirming.', {
                        position: 'top-center',
                        duration: 4000,
                        style: {
                          textAlign: 'center',
                          fontSize: '14px',
                          fontWeight: '500'
                        }
                      });
                      return;
                    }
                    
                    showCalibrationConfirmationDialog();
                  },
                  children: 'Confirm Calibration',
                  className: 'bg-green-600 hover:bg-green-700',
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back Navigation Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
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
        isOpen={showCalibrationConfirmation}
        onClose={() => setShowCalibrationConfirmation(false)}
        onConfirm={handleConfirmCalibrationAction}
        title={calibrationConfirmationTitle}
        message={calibrationConfirmationMessage}
        type={calibrationConfirmationType}
        confirmText="Confirm"
        cancelText="Cancel"
        isLoading={isCalibrationLoading}
      />

      {/* Simple Close Confirmation Modal (for X button) */}
      {showSimpleCloseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Cancellation</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel the calibration?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSimpleCloseConfirm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
              <button onClick={() => { setShowSimpleCloseConfirm(false); handleConfirmBack(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Next Step Confirmation Modal (simple) */}
      {showNextConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{nextConfirmTitle}</h2>
            <p className="text-gray-600 mb-6">{nextConfirmMessage}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNextConfirm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    setIsNextSaving(true);
                    const ok = await handleAutoSave();
                    if (ok) {
                      toast.success('Progress saved.');
                      setShowNextConfirm(false);
                      setCurrentStep((s) => Math.min(7, s + 1));
                    } else {
                      toast.error('Failed to save progress.');
                    }
                  } finally {
                    setIsNextSaving(false);
                  }
                }}
                disabled={isNextSaving}
                className={`px-4 py-2 text-white rounded-lg font-medium ${isNextSaving ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isNextSaving ? 'Saving…' : 'Save & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeighingScaleCalculation;
