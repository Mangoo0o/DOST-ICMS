import React, { useState, useEffect, useCallback } from 'react';
import { MdScience, MdCalculate, MdInfo, MdOutlineDeviceHub, MdSpeed } from 'react-icons/md';
import { FaBalanceScale } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import './uncertainty-print.css';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import conventionalMassReference from '../data/conventional_mass_reference.json';
import mpeReference from '../data/mpe_reference.json';
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
  { id: 1, title: 'Preparation', icon: <MdOutlineDeviceHub /> },
  { id: 2, title: 'ABBA Weighing', icon: <FaBalanceScale /> },
  { id: 3, title: 'Results & MPE Check', icon: <MdSpeed /> },
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

function TestWeightsCalibration() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Extract equipment ID from navigation state
  const passedEquipmentId = location.state?.equipmentId || null;
  const passedSerialNumber = location.state?.serialNumber || '';
  const passedSampleId = location.state?.sampleId || null; // sampleId is actually sampleId from navigation
  const [currentStep, setCurrentStep] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSimpleCloseConfirm, setShowSimpleCloseConfirm] = useState(false);
  
  // Next-step confirmation state
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [isNextSaving, setIsNextSaving] = useState(false);
  const [nextConfirmTitle, setNextConfirmTitle] = useState('Proceed to next step?');
  const [nextConfirmMessage, setNextConfirmMessage] = useState('Your progress will be saved before moving to the next step.');

  // Step 1: Preparation
  const [preparation, setPreparation] = useState({
    testWeight: '',
    testWeightClass: '',
    testWeightNominal: '',
    referenceWeight: '',
    referenceWeightClass: '',
    referenceWeightNominal: '',
    referenceWeightDensity: '',
    testWeightDensity: '',
    temp: '',
    humidity: '',
    pressure: '',
    airDensity: '',
  });
  const [sampleId, setSampleId] = useState(passedEquipmentId);

  // Add state for selected reference entry
  const [selectedReference, setSelectedReference] = useState(null);

  // Helper: get unique reference options for dropdown
  const referenceOptions = Array.from(new Set(conventionalMassReference.map(ref => `${ref.iden} | ${ref.serial} | ${ref.nominal}`)));

  useEffect(() => {
    if (passedEquipmentId) {
      apiService.getSampleById(passedEquipmentId).then(res => {
        const eq = res.data;
        setPreparation(prep => ({
          ...prep,
          testWeight: eq.serial_no || '',
          testWeightNominal: eq.capacity || '',
          testWeightClass: eq.class || '',
        }));
        setSampleId(eq.id || null);
        setSampleDataLoaded(true);
      });
    } else if (passedSerialNumber) {
      apiService.getSampleBySerial(passedSerialNumber).then(res => {
        const eq = res.data;
        setPreparation(prep => ({
          ...prep,
          testWeight: eq.serial_no || '',
          testWeightNominal: eq.capacity || '',
          testWeightClass: eq.class || '',
        }));
        setSampleId(eq.id || null);
        setSampleDataLoaded(true);
      });
    } else {
      // No equipment ID or serial number, enable auto-save immediately
      setSampleDataLoaded(true);
    }
  }, [passedEquipmentId, passedSerialNumber]);

  // When referenceWeight, serial, or nominal changes, auto-populate from JSON
  useEffect(() => {
    if (!preparation.referenceWeight) {
      setSelectedReference(null);
      return;
    }
    // Only match by iden or serial (not nominal or class)
    const match = conventionalMassReference.find(ref => {
      const idenMatch = ref.iden.toLowerCase() === preparation.referenceWeight.toLowerCase();
      const serialMatch = ref.serial && ref.serial.toLowerCase() === preparation.referenceWeight.toLowerCase();
      return idenMatch || serialMatch;
    });
    setSelectedReference(match || null);
    if (match) {
      setPreparation(prep => ({
        ...prep,
        referenceWeight: match.iden,
        referenceWeightNominal: match.nominal,
        referenceWeightClass: match.class || prep.referenceWeightClass || '',
        referenceWeightDensity: match.density || prep.referenceWeightDensity || '',
      }));
    }
  }, [preparation.referenceWeight]);

  // Add useEffect to auto-populate nomval fields based on nominal and class
  useEffect(() => {
    // Test Weight Nomval
    if (preparation.testWeightNominal && preparation.testWeightClass) {
      const testNom = `${preparation.testWeightNominal} ${parseFloat(preparation.testWeightNominal) >= 1 ? 'g' : 'mg'}`;
      const mpeRow = mpeReference.find(row => row.nominal === testNom);
      if (mpeRow && mpeRow[`Class ${preparation.testWeightClass}`] !== undefined) {
        setPreparation(prep => ({ ...prep, testWeightNomval: mpeRow[`Class ${preparation.testWeightClass}`] }));
      }
    }
    // Reference Weight Nomval
    if (preparation.referenceWeightNominal && preparation.referenceWeightClass) {
      const refNom = `${preparation.referenceWeightNominal} ${parseFloat(preparation.referenceWeightNominal) >= 1 ? 'g' : 'mg'}`;
      const mpeRow = mpeReference.find(row => row.nominal === refNom);
      if (mpeRow && mpeRow[`Class ${preparation.referenceWeightClass}`] !== undefined) {
        setPreparation(prep => ({ ...prep, referenceWeightNomval: mpeRow[`Class ${preparation.referenceWeightClass}`] }));
      }
    }
  }, [preparation.testWeightNominal, preparation.testWeightClass, preparation.referenceWeightNominal, preparation.referenceWeightClass]);

  const handlePreparationChange = (e) => {
    const { name, value } = e.target;
    setPreparation({ ...preparation, [name]: value });
  };

  // Step 2: ABBA Weighing
  const [abbaRows, setAbbaRows] = useState([
    { S1: '', T1: '', T2: '', S2: '', Dmci: '' },
    { S1: '', T1: '', T2: '', S2: '', Dmci: '' },
    { S1: '', T1: '', T2: '', S2: '', Dmci: '' },
  ]);

  const handleAbbaChange = (idx, field, value) => {
    const updated = [...abbaRows];
    updated[idx][field] = value;
    // Calculate Dmci if all fields are filled
    const S1 = parseFloat(updated[idx].S1);
    const T1 = parseFloat(updated[idx].T1);
    const T2 = parseFloat(updated[idx].T2);
    const S2 = parseFloat(updated[idx].S2);
    if (!isNaN(S1) && !isNaN(T1) && !isNaN(T2) && !isNaN(S2)) {
      // Excel formula: =(-S1 + T1 + T2 - S2)/2
      const rawDmci = (-S1 + T1 + T2 - S2) / 2;
      updated[idx].Dmci = Number(rawDmci.toFixed(4));
    } else {
      updated[idx].Dmci = '';
    }
    setAbbaRows(updated);
  };

  // Remove addAbbaRow function (no longer needed)
  const removeAbbaRow = (idx) => {
    if (abbaRows.length > 3) {
      setAbbaRows(abbaRows.filter((_, i) => i !== idx));
    }
  };

  // Step 3: Compute Conventional Mass
  // Mean Dmci
  const DmciVals = abbaRows.map(r => parseFloat(r.Dmci)).filter(v => !isNaN(v));
  const meanDmci = DmciVals.length > 0 ? DmciVals.reduce((a, b) => a + b, 0) / DmciVals.length : 0;

  // Buoyancy Correction
  const m = parseFloat(preparation.testWeightNominal) || 0;
  const rho_a = parseFloat(preparation.airDensity) || 0;
  const rho_r = parseFloat(preparation.referenceWeightDensity) || 0;
  const rho_t = parseFloat(preparation.testWeightDensity) || 0;
  const buoyancyCorrection = (rho_a && rho_r && rho_t) ? m * (rho_a / rho_r - rho_a / rho_t) : 0;

  // Use selectedReference for mc_r
  const mc_r = selectedReference ? selectedReference.conventional_mass : (parseFloat(preparation.referenceWeightNominal) || 0);
  // Conventional mass of test weight
  const mc_t = mc_r + meanDmci + buoyancyCorrection;

  // Step 4: Uncertainty Calculation
  // In Step 4: Uncertainty Calculation, auto-calculate and auto-populate all fields
  // u_mc_r: from selectedReference.uncertainty_mg (convert mg to g)
  // u_meanDmci: standard deviation of DmciVals (in g)
  // u_b, u_ba: set to 0 or calculate if you have formulas/data

  // Helper: calculate standard deviation
  function stddev(arr) {
    const n = arr.length;
    if (n < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    return Math.sqrt(arr.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1));
  }

  const u_mc_r = selectedReference ? (selectedReference.uncertainty_mg || 0) / 1000 : 0; // mg to g
  const u_meanDmci = DmciVals.length > 1 ? stddev(DmciVals) : 0;
  const u_b = 0; // Placeholder, update if you have a formula
  const u_ba = 0; // Placeholder, update if you have a formula
  const k = 2;
  const u_mc_t = Math.sqrt(u_mc_r ** 2 + u_meanDmci ** 2 + u_b ** 2 + u_ba ** 2);
  const U_mc_t = k * u_mc_t;

  // Step 5: MPE Check
  const [mpe, setMpe] = useState('');
  const correction = mc_t - m;
  // Sanitize MPE value: remove units, whitespace, fallback to preparation.testWeightNomval if invalid
  let sanitizedMPE = mpe;
  if (typeof sanitizedMPE === 'string') {
    sanitizedMPE = sanitizedMPE.replace(/[^0-9.-]/g, '');
  }
  let mpeNum = parseFloat(sanitizedMPE);
  if (isNaN(mpeNum) || mpeNum === 0) {
    mpeNum = parseFloat(preparation.testWeightNomval) || 0;
  }
  const passesMPE = Math.abs(correction) <= mpeNum;

  // Auto-fill MPE from OIML table when entering Step 5
  useEffect(() => {
    if (currentStep === 3 && !mpe && preparation.testWeightNomval) {
      setMpe(preparation.testWeightNomval);
    }
  }, [currentStep, mpe, preparation.testWeightNomval]);

  // Auto-save function - saves progress without marking as completed
  const handleAutoSave = async () => {
    console.log('handleAutoSave called with sampleId:', sampleId);
    if (!sampleId) {
      console.log('No sampleId, auto-save cancelled');
      return false;
    }
    
    console.log('Auto-saving test weights calibration progress...');
    
    const inputData = {
      preparation,
      abbaRows,
      uncertainties: {
        u_mc_r,
        u_meanDmci,
        u_b,
        u_ba,
        k
      },
      mpe, // user-editable
      mpeOIML: preparation.testWeightNomval, // always save OIML value
      currentStep,
    };
    const resultData = {
      meanDmci,
      buoyancyCorrection,
      mc_t,
      u_mc_t,
      U_mc_t,
      correction,
      passesMPE,
      mpe, // user-editable
      mpeOIML: preparation.testWeightNomval, // always save OIML value
      mpeResult: passesMPE ? 'PASS' : 'FAIL', // Save MPE Result as PASS/FAIL
    };
    
    try {
      const response = await apiService.saveCalibrationRecord({
        sample_id: sampleId,
        calibration_type: 'Test Weights',
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
      toast.error('Equipment not found.');
      return;
    }
    
    console.log('TestWeightsCalibration - handleSaveCalibration called');
    console.log('User data:', user);
    console.log('User ID:', user?.id);
    console.log('Sample ID:', sampleId);
    
    const inputData = {
      preparation,
      abbaRows,
      uncertainties: {
        u_mc_r,
        u_meanDmci,
        u_b,
        u_ba,
        k
      },
      mpe, // user-editable
      mpeOIML: preparation.testWeightNomval, // always save OIML value
      currentStep,
    };
    const resultData = {
      meanDmci,
      buoyancyCorrection,
      mc_t,
      u_mc_t,
      U_mc_t,
      correction,
      passesMPE,
      mpe, // user-editable
      mpeOIML: preparation.testWeightNomval, // always save OIML value
      mpeResult: passesMPE ? 'PASS' : 'FAIL', // Save MPE Result as PASS/FAIL
    };
    
    const saveData = {
      sample_id: sampleId,
      calibration_type: 'Test Weights',
      input_data: inputData,
      result_data: resultData,
      calibrated_by: user?.id || null,
      date_started: new Date().toISOString(),
      date_completed: new Date().toISOString() // Mark as completed
    };
    
    console.log('Saving calibration data:', saveData);
    
    try {
      const response = await apiService.saveCalibrationRecord(saveData);
      console.log('TestWeightsCalibration - Save successful:', response);
      setHasUnsavedChanges(false);
      
      // Trigger notification update for clients
      window.dispatchEvent(new CustomEvent('calibration-completed'));
      
      return response;
    } catch (error) {
      console.error('TestWeightsCalibration - Save failed:', error);
      throw error;
    }
  };

  // Track changes to determine if there are unsaved changes
  useEffect(() => {
    const hasChanges = 
      // Check if preparation details have been filled
      Object.values(preparation).some(val => val && val.toString().trim() !== '') ||
      // Check if any ABBA rows have data
      abbaRows.some(row => Object.values(row).some(val => val && val.toString().trim() !== '')) ||
      // Check if mpe has been set
      mpe && mpe.toString().trim() !== '';
    
    setHasUnsavedChanges(hasChanges);
    
    // Save current form data to sessionStorage for page refresh restoration
    if (hasChanges) {
      try {
        const currentFormData = {
          preparation,
          abbaRows,
          mpe,
          currentStep
        };
        sessionStorage.setItem('current_form_data', JSON.stringify(currentFormData));
      } catch (error) {
        console.error('Failed to save form data to sessionStorage:', error);
      }
    }
  }, [preparation, abbaRows, mpe, currentStep]);

  // Track if equipment data has been loaded
  const [sampleDataLoaded, setSampleDataLoaded] = useState(false);

  // Auto-save functionality
  const saveKey = `test_weights_calibration_${sampleId || 'new'}`;
  
  const { manualSave, clearBackup } = useAutoSave(
    handleAutoSave,
    { preparation, abbaRows, mpe, currentStep },
    {
      interval: 10000, // 10 seconds - more frequent saves
      enabled: hasUnsavedChanges && sampleDataLoaded,
      showToast: false,
      saveKey
    }
  );

  // Page refresh detection and data restoration
  const restoreData = useCallback((restoredData) => {
    if (restoredData.preparation) {
      setPreparation(restoredData.preparation);
    }
    if (restoredData.abbaRows) {
      setAbbaRows(restoredData.abbaRows);
    }
    if (restoredData.mpe) {
      setMpe(restoredData.mpe);
    }
    if (restoredData.currentStep) {
      setCurrentStep(restoredData.currentStep);
    }
  }, []);

  usePageRefreshDetection(restoreData, saveKey, sampleDataLoaded);

  // Auto-populate from existing calibration record if available
  useEffect(() => {
    if (sampleId) {
      apiService.getCalibrationRecordBySampleId(sampleId).then(res => {
        console.log('Test Weights Calibration record response:', res.data);
        if (res.data && res.data.has_calibration === false) {
          // No calibration record exists for this sample - this is normal for new calibrations
          console.log('No calibration record found for this sample');
        } else if (res.data && res.data.input_data && res.data.calibration_type === 'Test Weights') {
          const input = typeof res.data.input_data === 'string' ? JSON.parse(res.data.input_data) : res.data.input_data;
          console.log('Loaded test weights data:', input);
          setPreparation(input.preparation || {
            testWeight: '',
            testWeightClass: '',
            testWeightNominal: '',
            referenceWeight: '',
            referenceWeightClass: '',
            referenceWeightNominal: '',
            referenceWeightDensity: '',
            testWeightDensity: '',
            temp: '',
            humidity: '',
            pressure: '',
            airDensity: '',
          });
          setAbbaRows(input.abbaRows || [
            { S1: '', T1: '', T2: '', S2: '', Dmci: '' },
            { S1: '', T1: '', T2: '', S2: '', Dmci: '' },
            { S1: '', T1: '', T2: '', S2: '', Dmci: '' },
          ]);
          setMpe(input.mpe || '');
          setCurrentStep(input.currentStep || 1);
        }
      }).catch((err) => {
        // Log unexpected errors
        console.log('Error loading calibration record:', err);
      });
    }
  }, [sampleId]);

  // Trigger auto-save when equipment data is loaded and there are changes
  useEffect(() => {
    console.log('Auto-save trigger check:', { sampleDataLoaded, hasUnsavedChanges, sampleId });
    if (sampleDataLoaded && hasUnsavedChanges) {
      console.log('Triggering auto-save...');
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
    confirmationMessage: "You have unsaved changes in your test weights calibration. Are you sure you want to leave? Your progress will be lost.",
    confirmationType: "warning",
    onSave: handleAutoSave
  });

  // Confirm Calibration handler
  const handleConfirmCalibration = async () => {
    if (!sampleId) {
      console.error('No sampleId provided for test weights calibration confirmation');
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
    } catch (e) {
      console.error('Failed to update sample status:', e);
      toast.error('Failed to update sample status: ' + (e.message || 'Unknown error'));
      throw e; // Re-throw to be caught by the calling function
    }
  };

  // State for calibration confirmation modal
  const [showCalibrationConfirm, setShowCalibrationConfirm] = useState(false);
  const [isCalibrationLoading, setIsCalibrationLoading] = useState(false);

  // Show confirmation dialog before calibration
  const showCalibrationConfirmation = () => {
    setShowCalibrationConfirm(true);
  };

  // Handle confirmation for calibration
  const handleConfirmCalibrationAction = async () => {
    setIsCalibrationLoading(true);
    
    try {
      // Save the calibration record first
      await handleSaveCalibration();
      
      // Update the sample status
      await handleConfirmCalibration();
      
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
      setShowCalibrationConfirm(false);
    }
  };

  // Helper to format MPE with units
  function formatMPE(val) {
    if (val === undefined || val === null || val === '') return 'N/A';
    return `${val} mg`;
  }

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
              <span className="text-[#2a9dab] font-semibold text-sm">Step 1: Preparation</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Test Weights Section */}
              <div className="col-span-2">
                <h3 className="text-base font-semibold text-[#2a9dab] mb-0.5 mt-0.5">Test Weights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Test Weight Serial:</label>
                    {modernInput({
                      name: 'testWeight',
                      value: preparation.testWeight,
                      readOnly: true,
                      className: 'bg-gray-100',
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Test Weight Nominal (g):</label>
                    {modernInput({
                      name: 'testWeightNominal',
                      value: preparation.testWeightNominal,
                      onChange: handlePreparationChange,
                      type: 'number',
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Test Weight Class:</label>
                    {modernInput({
                      name: 'testWeightClass',
                      value: preparation.testWeightClass,
                      onChange: handlePreparationChange,
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Test Weight MPE (mg):</label>
                    <div className="font-mono bg-gray-100 rounded p-2">
                      {formatMPE(preparation.testWeightNomval)}
                    </div>
                  </div>
                </div>
              </div>
              {/* Reference Test Weights Section */}
              <div className="col-span-2">
                <h3 className="text-base font-semibold text-[#2a9dab] mb-0.5 mt-0.5">Reference Test Weights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reference Weight (select or type):</label>
                    <input
                      list="reference-options"
                      name="referenceWeight"
                      value={preparation.referenceWeight}
                      onChange={handlePreparationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-sm bg-white shadow-sm"
                      placeholder="e.g. MTR LU 01, serial, or nominal"
                    />
                    <datalist id="reference-options">
                      {referenceOptions.map(opt => (
                        <option key={opt} value={opt.split(' | ')[0]} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reference Weight Class:</label>
                    {modernInput({
                      name: 'referenceWeightClass',
                      value: preparation.referenceWeightClass,
                      onChange: handlePreparationChange,
                      readOnly: !!selectedReference && !!selectedReference.class,
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reference Weight Nominal (g):</label>
                    {modernInput({
                      name: 'referenceWeightNominal',
                      value: preparation.referenceWeightNominal,
                      onChange: handlePreparationChange,
                      type: 'number',
                      readOnly: !!selectedReference,
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reference Weight MPE (mg):</label>
                    <div className="font-mono bg-gray-100 rounded p-2">
                      {formatMPE(preparation.referenceWeightNomval)}
                    </div>
                  </div>
                </div>
                {selectedReference && (
                  <div className="mt-2 text-xs text-green-700">
                    <span className="font-semibold">Auto-filled from reference table:</span> {selectedReference.iden} | Serial: {selectedReference.serial} | Nominal: {selectedReference.nominal}g | Conventional Mass: {selectedReference.conventional_mass}g
                  </div>
                )}
              </div>
              {/* Environmental Inputs */}
              <div className="col-span-2">
                <h3 className="text-base font-semibold text-[#2a9dab] mb-0.5 mt-0.5">Environmental Conditions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Temperature (°C):</label>
                    {modernInput({
                      name: 'temp',
                      value: preparation.temp,
                      onChange: handlePreparationChange,
                      type: 'number',
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Humidity (%):</label>
                    {modernInput({
                      name: 'humidity',
                      value: preparation.humidity,
                      onChange: handlePreparationChange,
                      type: 'number',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardSection>
        );
      case 2:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <FaBalanceScale className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 2: ABBA Weighing</span>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border text-sm mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">S1</th>
                    <th className="border px-2 py-1">T1</th>
                    <th className="border px-2 py-1">T2</th>
                    <th className="border px-2 py-1">S2</th>
                    <th className="border px-2 py-1">Dmci</th>
                    <th className="border px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {abbaRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{modernInput({ value: row.S1, onChange: e => handleAbbaChange(idx, 'S1', e.target.value), type: 'number', className: 'w-24' })}</td>
                      <td className="border px-2 py-1">{modernInput({ value: row.T1, onChange: e => handleAbbaChange(idx, 'T1', e.target.value), type: 'number', className: 'w-24' })}</td>
                      <td className="border px-2 py-1">{modernInput({ value: row.T2, onChange: e => handleAbbaChange(idx, 'T2', e.target.value), type: 'number', className: 'w-24' })}</td>
                      <td className="border px-2 py-1">{modernInput({ value: row.S2, onChange: e => handleAbbaChange(idx, 'S2', e.target.value), type: 'number', className: 'w-24' })}</td>
                      <td className="border px-2 py-1 font-mono">{row.Dmci !== '' ? Number(row.Dmci).toFixed(4) : ''}</td>
                      <td className="border px-2 py-1">{abbaRows.length > 3 && (
                        <button className="text-red-500 hover:underline text-xs" onClick={() => removeAbbaRow(idx)}>Remove</button>
                      )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Removed Add Cycle button */}
            <div className="mt-2 text-sm">
              <span className="font-semibold">Mean Dmci: </span>
              <span className="font-mono">{DmciVals.length > 0 ? meanDmci.toFixed(6) : ''}</span>
            </div>
          </CardSection>
        );
      case 3:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdSpeed className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Results & MPE Check</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm mb-2">
                <tbody>
                  <tr className="bg-gray-100"><th colSpan="2" className="text-left px-2 py-1">Conventional Mass Calculation</th></tr>
                  <tr><td className="border px-2 py-1">Conventional Mass of Reference (mc_r)</td><td className="border px-2 py-1 font-mono">{mc_r.toFixed(6)} g</td></tr>
                  <tr><td className="border px-2 py-1">Mean Dmci</td><td className="border px-2 py-1 font-mono">{meanDmci.toFixed(6)} g</td></tr>
                  <tr><td className="border px-2 py-1">Buoyancy Correction</td><td className="border px-2 py-1 font-mono">{buoyancyCorrection.toFixed(6)} g</td></tr>
                  <tr><td className="border px-2 py-1">Conventional Mass of Test Weight (mc_t)</td><td className="border px-2 py-1 font-mono">{mc_t.toFixed(6)} g</td></tr>
                  <tr className="bg-gray-100"><th colSpan="2" className="text-left px-2 py-1">Uncertainty Calculation</th></tr>
                  <tr><td className="border px-2 py-1">u(mc_r) [from reference, mg → g]</td><td className="border px-2 py-1 font-mono">{u_mc_r}</td></tr>
                  <tr><td className="border px-2 py-1">u(meanDmci) [stddev of Dmci, g]</td><td className="border px-2 py-1 font-mono">{u_meanDmci}</td></tr>
                  <tr><td className="border px-2 py-1">u_b</td><td className="border px-2 py-1 font-mono">{u_b}</td></tr>
                  <tr><td className="border px-2 py-1">u_ba</td><td className="border px-2 py-1 font-mono">{u_ba}</td></tr>
                  <tr><td className="border px-2 py-1">Coverage Factor (k)</td><td className="border px-2 py-1 font-mono">{k}</td></tr>
                  <tr><td className="border px-2 py-1">Combined Standard Uncertainty (u)</td><td className="border px-2 py-1 font-mono">{u_mc_t.toFixed(6)} g</td></tr>
                  <tr><td className="border px-2 py-1">Expanded Uncertainty (U)</td><td className="border px-2 py-1 font-mono">{U_mc_t.toFixed(6)} g</td></tr>
                  <tr className="bg-gray-100"><th colSpan="2" className="text-left px-2 py-1">MPE Check</th></tr>
                  <tr><td className="border px-2 py-1">Correction (mc_t - m)</td><td className="border px-2 py-1 font-mono">{correction.toFixed(6)} g</td></tr>
                  <tr><td className="border px-2 py-1">MPE (from OIML table)</td><td className="border px-2 py-1">{modernInput({ value: mpe, onChange: e => setMpe(e.target.value), type: 'number' })}</td></tr>
                  <tr><td className="border px-2 py-1">MPE Result</td><td className={`border px-2 py-1 font-bold ${!passesMPE ? 'bg-red-50' : 'bg-green-50'}`}><span className={passesMPE ? 'text-green-600' : 'text-red-500'}>{passesMPE ? '✓ PASS' : '✗ FAIL'}</span></td></tr>
                </tbody>
              </table>
            </div>
          </CardSection>
        );
      default:
        return null;
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
            <h1 className="text-2xl font-bold text-black">Test Weights Calibration</h1>
          </div>
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
                {currentStep < 3 && modernButton({
                  onClick: async () => {
                    // Validation for Step 1: Preparation
                    if (currentStep === 1) {
                      if (!preparation.testWeightNominal || !preparation.testWeightClass || 
                          !preparation.referenceWeight || !preparation.referenceWeightClass || 
                          !preparation.referenceWeightNominal || !preparation.temp || 
                          !preparation.humidity) {
                        toast.error('Please fill in all Preparation fields before proceeding.', {
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
                    // Validation for Step 2: ABBA Weighing
                    if (currentStep === 2) {
                      if (abbaRows.some(row => !row.S1 || !row.T1 || !row.T2 || !row.S2 || 
                          isNaN(Number(row.S1)) || isNaN(Number(row.T1)) || 
                          isNaN(Number(row.T2)) || isNaN(Number(row.S2)))) {
                        toast.error('Please fill in all ABBA Weighing values before proceeding.', {
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
                    
                    setShowNextConfirm(true);
                  },
                  children: 'Next',
                })}
                {currentStep === 3 && modernButton({
                  onClick: async () => {
                    // Final validation before confirmation
                    if (!preparation.testWeightNominal || !preparation.testWeightClass || 
                        !preparation.referenceWeight || !preparation.referenceWeightClass || 
                        !preparation.referenceWeightNominal || !preparation.temp || 
                        !preparation.humidity) {
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
                    
                    if (abbaRows.some(row => !row.S1 || !row.T1 || !row.T2 || !row.S2 || 
                        isNaN(Number(row.S1)) || isNaN(Number(row.T1)) || 
                        isNaN(Number(row.T2)) || isNaN(Number(row.S2)))) {
                      toast.error('Please complete all ABBA Weighing values before confirming.', {
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
                    
                    showCalibrationConfirmation();
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

      {/* Calibration Confirmation Modal (simple) */}
      {showCalibrationConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Calibration</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to confirm this calibration?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowCalibrationConfirm(false)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                disabled={isCalibrationLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCalibrationAction}
                disabled={isCalibrationLoading}
                className={`px-4 py-2 text-white rounded-lg font-medium ${isCalibrationLoading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isCalibrationLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                      setCurrentStep((s) => Math.min(3, s + 1));
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

export default TestWeightsCalibration; 