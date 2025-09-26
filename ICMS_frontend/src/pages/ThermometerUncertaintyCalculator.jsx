import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdScience, MdThermostat, MdCalculate, MdInfo, MdArrowBack } from 'react-icons/md';
import { FaThermometerHalf } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import './uncertainty-print.css';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCalibration } from '../context/CalibrationContext';
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

const DEFAULT_US = 0.023; // Standard uncertainty (°C)
const DEFAULT_SC1 = 1;
const DEFAULT_DF1 = 1e26; // Effectively infinite
const DEFAULT_RG = 0.5; // Resolution (°C)
const DEFAULT_RD = 1; // Readability multiplier
const DEFAULT_K = 2; // Coverage factor for 95% confidence

function stddev(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

const steps = [
  { id: 1, title: 'Reference Standard', icon: <MdThermostat /> },
  { id: 2, title: 'Repeatability', icon: <MdScience /> },
  { id: 3, title: 'Readability', icon: <FaThermometerHalf /> },
  { id: 4, title: 'Calculation', icon: <MdCalculate /> },
  { id: 5, title: 'Results', icon: <MdInfo /> },
];

const CardSection = ({ children, className = '' }) => (
  <div className={`rounded-xl shadow bg-white border border-[#2a9dab] p-4 mb-4 ${className}`}>
    {children}
  </div>
);

const ModernInput = (props) => {
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


function ThermometerUncertaintyCalculator() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setUnsavedChanges, startCalibration, endCalibration } = useCalibration();
  const serialNumber = location.state?.serialNumber || '';
  const sampleId = location.state?.equipmentId || location.state?.sampleId || null; // equipmentId is actually sampleId from navigation
  
  // Debug navigation state
  console.log('Thermometer calibration - Location state:', location.state);
  console.log('Thermometer calibration - Sample ID:', sampleId);
  console.log('Thermometer calibration - Serial Number:', serialNumber);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Calibration confirmation state
  const [calibrationConfirmationTitle, setCalibrationConfirmationTitle] = useState("");
  const [calibrationConfirmationMessage, setCalibrationConfirmationMessage] = useState("");
  const [calibrationConfirmationType, setCalibrationConfirmationType] = useState("");
  const [showCalibrationConfirmation, setShowCalibrationConfirmation] = useState(false);

  // User inputs
  const [us, setUs] = useState(DEFAULT_US);
  const [sc1, setSc1] = useState(DEFAULT_SC1);
  const [df1, setDf1] = useState(DEFAULT_DF1);
  const [rg, setRg] = useState(DEFAULT_RG);
  const [rd, setRd] = useState(DEFAULT_RD);
  const [repeatability, setRepeatability] = useState(['', '', '']);

  // Calculations
  const validRepeat = repeatability.every(v => v !== '' && !isNaN(Number(v)));
  const repeatVals = repeatability.map(Number);
  const n = repeatVals.length;
  // const mean = validRepeat ? repeatVals.reduce((a, b) => a + b, 0) / n : 0;
  const sr = validRepeat ? stddev(repeatVals) : 0;
  const ur = validRepeat ? sr / Math.sqrt(n) : 0;
  const df2 = n - 1;
  const sc2 = 1;

  // Readability
  const ud = (rg * rd) / 3;
  const sc3 = 1;
  const df3 = Infinity;

  // Combined standard uncertainty
  const u1 = us;
  const u2 = ur;
  const u3 = ud;
  const uc = Math.sqrt(
    Math.pow(u1 * sc1, 2) +
    Math.pow(u2 * sc2, 2) +
    Math.pow(u3 * sc3, 2)
  );

  // Effective degrees of freedom (Welch–Satterthwaite)
  function veff() {
    const terms = [
      { u: u1, sc: sc1, df: df1 },
      { u: u2, sc: sc2, df: df2 },
      { u: u3, sc: sc3, df: df3 },
    ];
    let numerator = Math.pow(uc, 4);
    let denominator = 0;
    terms.forEach(({ u, sc, df }) => {
      if (df === Infinity || df === 1e26) return;
      denominator += Math.pow(u * sc, 4) / df;
    });
    return denominator === 0 ? Infinity : numerator / denominator;
  }
  const veffVal = veff();
  const k = DEFAULT_K; // For 95% confidence
  const ue = k * uc;

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
              <MdThermostat className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 1: Reference Standard</span>
            </div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Reference Standard Uncertainty (U1, °C):</label>
            {ModernInput({
              type: 'number',
              step: '0.0001',
              value: us,
              onChange: e => setUs(Number(e.target.value)),
              placeholder: '0.023',
              className: 'w-32',
            })}
            <span className="ml-2 text-gray-500 text-xs">(default: 0.023)</span>
          </CardSection>
        );
      case 2:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdScience className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 2: Repeatability</span>
            </div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Repeatability Measurements (U2, °C):</label>
            <div className="flex gap-2">
              {repeatability.map((val, i) => (
                ModernInput({
                  key: i,
                  type: 'number',
                  step: '0.01',
                  value: val,
                  onChange: e => {
                    const arr = [...repeatability];
                    arr[i] = e.target.value;
                    setRepeatability(arr);
                  },
                  className: 'w-32',
                  placeholder: `Trial ${i + 1}`,
                })
              ))}
            </div>
            <span className="ml-2 text-gray-500 text-xs">(enter 3 values)</span>
          </CardSection>
        );
      case 3:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <FaThermometerHalf className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 3: Readability</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Resolution (Rg, °C):</label>
                {ModernInput({
                  type: 'number',
                  step: '0.01',
                  value: rg,
                  onChange: e => setRg(Number(e.target.value)),
                  className: 'w-24',
                  placeholder: '0.5',
                })}
                <span className="ml-2 text-gray-500 text-xs">(default: 0.5)</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Readability Multiplier (Rd):</label>
                {ModernInput({
                  type: 'number',
                  step: '0.1',
                  value: rd,
                  onChange: e => setRd(Number(e.target.value)),
                  className: 'w-24',
                  placeholder: '1',
                })}
                <span className="ml-2 text-gray-500 text-xs">(default: 1)</span>
              </div>
            </div>
          </CardSection>
        );
      case 4:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdCalculate className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 4: Calculation</span>
            </div>
            <div className="mb-2">Combined Standard Uncertainty (Uc): <span className="font-mono">{uc.toFixed(4)} °C</span></div>
            <div className="mb-2">Effective Degrees of Freedom (Veff): <span className="font-mono">{veffVal === Infinity ? '∞' : veffVal.toFixed(1)}</span></div>
            <div className="mb-2">Coverage Factor (k): <span className="font-mono">{k}</span></div>
            <div className="mb-2 font-bold">Expanded Uncertainty (Ue): <span className="font-mono">{ue.toFixed(4)} °C</span></div>
            {modernButton({
              onClick: () => {
                if (!validRepeat) {
                  toast.error('Please enter all repeatability values.');
                  return;
                }
                toast.success('Calculation complete!');
                setCurrentStep(5);
              },
              className: 'mt-4',
              children: 'Show Results',
            })}
          </CardSection>
        );
      case 5: {
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdInfo className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 5: Results</span>
            </div>
            <div className="relative">
              <h2 className="text-lg font-semibold mb-2">Uncertainty Components</h2>
              <table className="min-w-full border text-sm mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Source</th>
                    <th className="border px-2 py-1">Value (ui, °C)</th>
                    <th className="border px-2 py-1">Distribution</th>
                    <th className="border px-2 py-1">dfi</th>
                    <th className="border px-2 py-1">sci</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Reference Standard (U1)</td>
                    <td className="border px-2 py-1">{u1.toFixed(4)}</td>
                    <td className="border px-2 py-1">Normal</td>
                    <td className="border px-2 py-1">∞</td>
                    <td className="border px-2 py-1">1</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Repeatability (U2)</td>
                    <td className="border px-2 py-1">{u2.toFixed(4)}</td>
                    <td className="border px-2 py-1">Normal</td>
                    <td className="border px-2 py-1">{df2}</td>
                    <td className="border px-2 py-1">1</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Readability (U3)</td>
                    <td className="border px-2 py-1">{u3.toFixed(4)}</td>
                    <td className="border px-2 py-1">Rectangular</td>
                    <td className="border px-2 py-1">∞</td>
                    <td className="border px-2 py-1">1</td>
                  </tr>
                </tbody>
              </table>
              <div className="mb-2">Combined Standard Uncertainty (Uc): <span className="font-mono">{uc.toFixed(4)} °C</span></div>
              <div className="mb-2">Effective Degrees of Freedom (Veff): <span className="font-mono">{veffVal === Infinity ? '∞' : veffVal.toFixed(1)}</span></div>
              <div className="mb-2">Coverage Factor (k): <span className="font-mono">{k}</span></div>
              <div className="mb-2 font-bold">Expanded Uncertainty (Ue): <span className="font-mono">{ue.toFixed(4)} °C</span></div>
            </div>
          </CardSection>
        );
      }
      default:
        return null;
    }
  };

  // Auto-save function - saves progress without marking as completed
  const handleAutoSave = async () => {
    if (!sampleId) {
      return false;
    }
    
    console.log('Auto-saving thermometer calibration progress...');
    
    const inputData = {
      us, sc1, df1, rg, rd, repeatability, currentStep
    };
    const resultData = { uc, veffVal, k, ue };
    
    try {
      const response = await apiService.saveCalibrationRecord({
        sample_id: sampleId,
        calibration_type: 'Thermometer',
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
    if (!sampleId) {
      console.error('Sample ID is null or undefined:', sampleId);
      toast.error('Equipment not found.');
      return false;
    }
    
    // Additional validation
    if (typeof sampleId !== 'number' && typeof sampleId !== 'string') {
      console.error('Invalid sample ID type:', typeof sampleId, sampleId);
      toast.error('Invalid equipment ID.');
      return false;
    }
    
    console.log('Saving thermometer calibration as completed...');
    console.log('Sample ID:', sampleId);
    console.log('User:', user);
    
    // Validate user data
    if (!user) {
      console.error('User data is null or undefined');
      toast.error('User not authenticated.');
      return false;
    }
    
    const calibratedBy = user?.id || null;
    if (!calibratedBy) {
      console.error('No valid user ID found:', { user_id: user?.id });
      toast.error('Invalid user data.');
      return false;
    }
    
    // Validate and clean input data
    const inputData = {
      us: isNaN(us) ? 0 : us,
      sc1: isNaN(sc1) ? 0 : sc1,
      df1: isNaN(df1) || !isFinite(df1) ? 0 : df1,
      rg: isNaN(rg) ? 0 : rg,
      rd: isNaN(rd) ? 0 : rd,
      repeatability: Array.isArray(repeatability) ? repeatability.map(val => isNaN(val) ? 0 : val) : [],
      currentStep: currentStep || 1
    };
    
    // Validate and clean result data
    const resultData = { 
      uc: isNaN(uc) ? 0 : uc, 
      veffVal: isNaN(veffVal) || !isFinite(veffVal) ? 0 : veffVal, 
      k: isNaN(k) ? 2 : k, 
      ue: isNaN(ue) ? 0 : ue 
    };
    
    console.log('Input data:', inputData);
    console.log('Result data (cleaned):', resultData);
    console.log('Raw calculated values:', { uc, veffVal, k, ue });
    
    // Final validation before sending
    if (!inputData || !resultData) {
      console.error('Invalid data structure:', { inputData, resultData });
      toast.error('Invalid calibration data.');
      return false;
    }
    
    try {
      console.log('Sending thermometer calibration data to backend:', {
        sample_id: sampleId,
        calibration_type: 'Thermometer',
        input_data: inputData,
        result_data: resultData,
        calibrated_by: calibratedBy,
        date_started: new Date().toISOString(),
        date_completed: new Date().toISOString()
      });
      
      // Debug authentication
      const token = localStorage.getItem('token');
      console.log('Authentication token exists:', !!token);
      console.log('User data:', user);
      console.log('User ID for calibration:', calibratedBy);
      
      const response = await apiService.saveCalibrationRecord({
        sample_id: sampleId,
        calibration_type: 'Thermometer',
        input_data: inputData,
        result_data: resultData,
        calibrated_by: calibratedBy,
        date_started: new Date().toISOString(),
        date_completed: new Date().toISOString() // Mark as completed
      });
      
      console.log('Save response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response && response.data) {
        console.log('Calibration saved successfully:', response.data);
        setHasUnsavedChanges(false);
        
        // Trigger notification update for clients
        window.dispatchEvent(new CustomEvent('calibration-completed'));
        
        return true;
      } else {
        console.error('Invalid response from saveCalibrationRecord:', response);
        toast.error('Invalid response from server');
        return false;
      }
    } catch (e) {
      console.error('Error saving calibration record:', e);
      console.error('Error details:', {
        message: e.message,
        response: e.response?.data,
        status: e.response?.status
      });
      toast.error('Failed to save calibration record: ' + (e.message || 'Unknown error'));
      return false; // Return false instead of throwing
    }
  };

  // Confirm Calibration handler
  const handleConfirmCalibration = async () => {
    if (!sampleId) {
      console.error('No sampleId provided for thermometer calibration confirmation');
      return;
    }
    try {
      console.log('Calling updateSampleStatus with sampleId:', sampleId, 'status: completed');
      const response = await apiService.updateSampleStatus(sampleId, 'completed');
      console.log('updateSampleStatus response:', response);
      
      clearBackup(); // Clear the auto-save backup when calibration is completed
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
    console.log('Starting thermometer calibration confirmation...');
    setShowCalibrationConfirmation(false);
    
    try {
      // Save the calibration record first
      console.log('Saving calibration record...');
      const saveResult = await handleSaveCalibration();
      if (!saveResult) {
        console.error('Failed to save calibration record');
        toast.error('Failed to save calibration record');
        return;
      }
      
      // Update the sample status
      console.log('Updating sample status...');
      const statusResult = await handleConfirmCalibration();
      if (!statusResult) {
        console.error('Failed to update sample status');
        toast.error('Failed to update sample status');
        return;
      }
      
      // Clear unsaved changes to prevent back navigation confirmation
      setHasUnsavedChanges(false);
      setUnsavedChanges(false);
      endCalibration();
      
      // Show success message
      toast.success('Calibration completed successfully!');
      
      // Use direct navigation to bypass any guards
      console.log('Using direct navigation...');
      window.location.href = '/calibration';
      
    } catch (error) {
      console.error('Error in calibration confirmation:', error);
      toast.error('Failed to complete calibration: ' + (error.message || 'Unknown error'));
    }
  };

  // Track changes to determine if there are unsaved changes
  useEffect(() => {
    const hasChanges = us !== DEFAULT_US || 
                      sc1 !== DEFAULT_SC1 || 
                      df1 !== DEFAULT_DF1 || 
                      rg !== DEFAULT_RG || 
                      rd !== DEFAULT_RD || 
                      repeatability.some(val => val !== '');
    setHasUnsavedChanges(hasChanges);
    setUnsavedChanges(hasChanges);
  }, [us, sc1, df1, rg, rd, repeatability, setUnsavedChanges]);

  // Auto-save functionality
  const saveKey = `thermometer_calibration_${sampleId || 'new'}`;
  
  const { clearBackup } = useAutoSave(
    handleAutoSave,
    { us, sc1, df1, rg, rd, repeatability, currentStep },
    {
      interval: 10000, // 10 seconds - more frequent saves
      enabled: hasUnsavedChanges,
      showToast: false,
      saveKey
    }
  );

  // Page refresh detection and data restoration
  const restoreData = useCallback((restoredData) => {
    if (restoredData.us !== undefined) setUs(restoredData.us);
    if (restoredData.sc1 !== undefined) setSc1(restoredData.sc1);
    if (restoredData.df1 !== undefined) setDf1(restoredData.df1);
    if (restoredData.rg !== undefined) setRg(restoredData.rg);
    if (restoredData.rd !== undefined) setRd(restoredData.rd);
    if (restoredData.repeatability) setRepeatability(restoredData.repeatability);
    if (restoredData.currentStep) setCurrentStep(restoredData.currentStep);
  }, []);

  usePageRefreshDetection(restoreData, saveKey, true);

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
    confirmationMessage: "Are you sure you want to leave the calibration? Any unsaved progress will be lost.",
    confirmationType: "warning",
    onSave: handleAutoSave
  });



  // Start calibration when component mounts
  useEffect(() => {
    startCalibration('thermometer');
    return () => {
      endCalibration();
    };
  }, [startCalibration, endCalibration]);

  // Auto-populate from existing calibration record if available
  useEffect(() => {
    if (sampleId) {
      apiService.getCalibrationRecordBySampleId(sampleId).then(res => {
        if (res.data && res.data.input_data && res.data.calibration_type === 'Thermometer') {
          const input = typeof res.data.input_data === 'string' ? JSON.parse(res.data.input_data) : res.data.input_data;
          setUs(input.us ?? DEFAULT_US);
          setSc1(input.sc1 ?? DEFAULT_SC1);
          setDf1(input.df1 ?? DEFAULT_DF1);
          setRg(input.rg ?? DEFAULT_RG);
          setRd(input.rd ?? DEFAULT_RD);
          setRepeatability(input.repeatability ?? ['', '', '']);
          setCurrentStep(input.currentStep || 1);
        }
      }).catch(() => {
        // No record found, do nothing
      });
    }
  }, [sampleId]);

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <Toaster position="top-right" />
      <div className="w-full mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md w-full mb-8 border border-blue-100 relative">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-[#2a9dab] text-white hover:bg-[#238a91] rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
            title="Go back to calibration list"
          >
            <MdArrowBack className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center mb-2 pr-20">
            <FaThermometerHalf className="mr-2 text-[#2a9dab] text-2xl" />
            <h1 className="text-2xl font-bold text-black">Thermometer Uncertainty Calculator</h1>
          </div>
          {serialNumber && (
            <div className="mb-4 text-gray-600">Serial Number: <span className="font-mono">{serialNumber}</span></div>
          )}
          {renderStepper()}
          <div className="rounded-lg border p-3 bg-white shadow-sm border-blue-100">
            {renderStepContent()}
            <div className="flex justify-between mt-4 pt-3 border-t">
              <div className="flex space-x-2">
                {modernButton({
                  onClick: () => setCurrentStep(Math.max(1, currentStep - 1)),
                  disabled: currentStep === 1,
                  variant: 'secondary',
                  children: 'Previous',
                })}
              </div>
              <div className="flex space-x-2">
                {currentStep < 5 ? (
                  modernButton({
                    onClick: async () => {
                      // Validation for Step 1: Reference Standard
                      if (currentStep === 1) {
                        if (!us || isNaN(us) || us <= 0) {
                          toast.error('Please enter a valid Reference Standard Uncertainty value.', {
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
                      // Validation for Step 2: Repeatability
                      if (currentStep === 2) {
                        if (!validRepeat || repeatability.some(val => val === '' || isNaN(Number(val)))) {
                          toast.error('Please fill in all repeatability values before proceeding.', {
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
                      // Validation for Step 3: Readability
                      if (currentStep === 3) {
                        if (!rg || isNaN(rg) || rg <= 0) {
                          toast.error('Please enter a valid Resolution value.', {
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
                        if (!rd || isNaN(rd) || rd <= 0) {
                          toast.error('Please enter a valid Readability Multiplier value.', {
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
                      // Validation for Step 4: Calculation
                      if (currentStep === 4) {
                        if (!validRepeat) {
                          toast.error('Please complete all previous steps before proceeding.', {
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
                      
                      await handleAutoSave();
                      setCurrentStep(currentStep + 1);
                    },
                    children: 'Next',
                  })
                ) : (
                  <>
                    {modernButton({
                      onClick: async () => {
                        // Final validation before confirmation
                        if (!validRepeat) {
                          toast.error('Please complete all calibration steps before confirming.', {
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation || showCalibrationConfirmation}
        onClose={showCalibrationConfirmation ? () => setShowCalibrationConfirmation(false) : handleCancelBack}
        onConfirm={showCalibrationConfirmation ? handleConfirmCalibrationAction : handleConfirmBack}
        title={showCalibrationConfirmation ? calibrationConfirmationTitle : confirmationTitle}
        message={showCalibrationConfirmation ? calibrationConfirmationMessage : confirmationMessage}
        type={showCalibrationConfirmation ? calibrationConfirmationType : confirmationType}
        confirmText={showCalibrationConfirmation ? "Confirm" : "Leave Anyway"}
        cancelText={showCalibrationConfirmation ? "Cancel" : "Stay Here"}
        isLoading={isSaving}
      />
      
    </div>
  );
}

export default ThermometerUncertaintyCalculator; 