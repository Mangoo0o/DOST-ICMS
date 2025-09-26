import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdScience, MdThermostat, MdCalculate, MdInfo, MdInvertColors, MdArrowBack } from 'react-icons/md';
import { FaThermometerHalf, FaTint } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import './uncertainty-print.css';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  { id: 1, title: 'Calibration Details', icon: <MdInfo /> },
  { id: 2, title: 'Standard Uncertainty', icon: <MdScience /> },
  { id: 3, title: 'Temperature Repeatability', icon: <FaThermometerHalf /> },
  { id: 4, title: 'Humidity Repeatability', icon: <FaTint /> },
  { id: 5, title: 'Uncertainty Components', icon: <MdScience /> },
  { id: 6, title: 'Results', icon: <MdCalculate /> },
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

const ModernButton = (props) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm
      ${props.disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
        props.variant === 'secondary' ? 'bg-[#2a9dab] text-white hover:bg-[#238a91]' :
        'bg-[#2a9dab] text-white hover:bg-[#238a91]'}
      ${props.className || ''}`}
  />
);

const SectionTitle = ({ icon, title }) => (
    <div className="flex items-center mb-3 text-lg font-semibold text-gray-700">
      {React.cloneElement(icon, { className: "mr-2 text-[#2a9dab]"})}
      {title}
    </div>
)

const InputRow = ({ placeholder, ...props }) => (
  <div className="flex items-center justify-between space-x-2 mb-2">
    <ModernInput {...props} placeholder={placeholder} className={`w-full text-sm ${props.className || ''}`} />
  </div>
);

function stddev(arr) {
  if (!Array.isArray(arr) || arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
}

// Helper to calculate average
const avg = arr => arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

// Helper to capitalize first letter of each name
function capitalizeName(name) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function getCalibratedBy(user) {
  if (!user) return '';
  if (user.full_name) {
    // Split and capitalize each part
    return user.full_name.split(' ').map(capitalizeName).join(' ');
  }
  if (user.first_name && user.last_name) {
    return capitalizeName(user.first_name) + ' ' + capitalizeName(user.last_name);
  }
  return '';
}

function ThermohygrometerUncertaintyCalculator() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const serialNumber = location.state?.serialNumber || '';
  const sampleId = location.state?.equipmentId || null; // equipmentId is actually sampleId from navigation
  const [currentStep, setCurrentStep] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Confirmation modal state
  const [showCalibrationConfirmation, setShowCalibrationConfirmation] = useState(false);
  const [calibrationConfirmationTitle, setCalibrationConfirmationTitle] = useState('');
  const [calibrationConfirmationMessage, setCalibrationConfirmationMessage] = useState('');
  const [calibrationConfirmationType, setCalibrationConfirmationType] = useState('');

  const [uucReadings, setUucReadings] = useState({
    temp: [["","",""],["","",""],["","",""]],
    humidity: [["","",""],["","",""],["","",""]]
  });
  const [refReadings, setRefReadings] = useState({
    temp: [["","",""],["","",""],["","",""]],
    humidity: [["","",""],["","",""],["","",""]]
  });
  const [uucInitial, setUucInitial] = useState({ temp: [0,0,0], humidity: [0,0,0] });
  const [uucFinal, setUucFinal] = useState({ temp: [0,0,0], humidity: [0,0,0] });
  const [refInitial, setRefInitial] = useState({ temp: [0,0,0], humidity: [0,0,0] });
  const [refFinal, setRefFinal] = useState({ temp: [0,0,0], humidity: [0,0,0] });
  
  const [u_std, setU_std] = useState({ temp: 0.1, humidity: 0.5 });
  const [k_std, setK_std] = useState(2);
  
  const [drift, setDrift] = useState({ temp: 0.05, humidity: 0.1 });
  
  const [resolution, setResolution] = useState({ uuc: { temp: 0.1, humidity: 0.1 }, std: { temp: 0.01, humidity: 0.1 } });

  const [uniformity, setUniformity] = useState({ temp: 0.2, humidity: 1.0 });
  const [hysteresis, setHysteresis] = useState({ temp: 0.05, humidity: 0.2 });

  // Track if a calibration record has been loaded to prevent overwriting
  const [hasLoadedCalibrationRecord, setHasLoadedCalibrationRecord] = useState(false);

  // Move repeatability and hysteresis calculations here, right after all state declarations
  const n = 3;
  const repeatability = ['temp','humidity'].reduce((acc, type) => {
    acc[type] = [0,1,2].map(pointIdx => {
      const refSr = stddev(refReadings[type][pointIdx]);
      const uucSr = stddev(uucReadings[type][pointIdx]);
      return {
        refSr,
        refUr: refSr / Math.sqrt(n),
        uucSr,
        uucUr: uucSr / Math.sqrt(n)
      };
    });
    return acc;
  }, {});
  // Update hysteresis calculation to use state
  const calculatedHysteresis = ['temp','humidity'].reduce((acc, type) => {
    acc[type] = [0,1,2].map(pointIdx => {
      const Xdiff = uucInitial[type][pointIdx] - uucFinal[type][pointIdx];
      const Ydiff = refInitial[type][pointIdx] - refFinal[type][pointIdx];
      return (Xdiff - Ydiff) / 3;
    });
    return acc;
  }, {});

  // Update hysteresis state when calculated values change
  useEffect(() => {
    setHysteresis(calculatedHysteresis);
  }, [calculatedHysteresis]);

  const handleMatrixReadingChange = (type, pointIdx, trialIdx, value, which) => {
    // If value is empty, set as "" (not 0)
    if (which === 'uuc') {
      setUucReadings(prev => {
        const updated = { ...prev };
        updated[type] = prev[type].map((arr, i) =>
          Array.isArray(arr)
            ? (i === pointIdx
                ? arr.map((v, j) => (j === trialIdx ? (value === '' ? '' : parseFloat(value)) : v))
                : arr)
            : ["","",""]
        );
        return updated;
      });
    } else {
      setRefReadings(prev => {
        const updated = { ...prev };
        updated[type] = prev[type].map((arr, i) =>
          Array.isArray(arr)
            ? (i === pointIdx
                ? arr.map((v, j) => (j === trialIdx ? (value === '' ? '' : parseFloat(value)) : v))
                : arr)
            : ["","",""]
        );
        return updated;
      });
    }
  };
  
  const handleHystChange = (type, pointIdx, value, which, isUuc) => {
    const setter = isUuc ? (which === 'initial' ? setUucInitial : setUucFinal) : (which === 'initial' ? setRefInitial : setRefFinal);
    const state = isUuc ? (which === 'initial' ? uucInitial : uucFinal) : (which === 'initial' ? refInitial : refFinal);
    const newArr = state[type].map((v, i) => (i === pointIdx ? parseFloat(value) || 0 : v));
    setter({ ...state, [type]: newArr });
  };
  
  // Calculations for Temperature
  const uucTempAvg = uucReadings.temp.reduce((a, b) => a + b, 0) / uucReadings.temp.length;
  const refTempAvg = refReadings.temp.reduce((a, b) => a + b, 0) / refReadings.temp.length;
  const tempError = uucTempAvg - refTempAvg;
  
  const u_std_temp = u_std.temp / k_std;
  const u_drift_temp = drift.temp / Math.sqrt(3);
  const u_res_uuc_temp = resolution.uuc.temp / (2 * Math.sqrt(3));
  const u_res_std_temp = resolution.std.temp / (2 * Math.sqrt(3));
  const s_uuc_temp = stddev(uucReadings.temp.flat());
  const u_rep_uuc_temp = s_uuc_temp / Math.sqrt(uucReadings.temp.length);
  const s_ref_temp = stddev(refReadings.temp.flat());
  const u_rep_ref_temp = s_ref_temp / Math.sqrt(refReadings.temp.length);
  const u_hyst_temp = hysteresis.temp / Math.sqrt(3);
  const u_unif_temp = uniformity.temp / Math.sqrt(3);

  const uc_temp = Math.sqrt(
    u_std_temp**2 + u_drift_temp**2 + u_res_uuc_temp**2 + u_res_std_temp**2 + u_rep_uuc_temp**2 + u_rep_ref_temp**2 + u_hyst_temp**2 + u_unif_temp**2
  );
  const U_temp = 2 * uc_temp;

  // Calculations for Humidity
  const uucHumidityAvg = uucReadings.humidity.reduce((a, b) => a + b, 0) / uucReadings.humidity.length;
  const refHumidityAvg = refReadings.humidity.reduce((a, b) => a + b, 0) / refReadings.humidity.length;
  const humidityError = uucHumidityAvg - refHumidityAvg;

  const u_std_humidity = u_std.humidity / k_std;
  const u_drift_humidity = drift.humidity / Math.sqrt(3);
  const u_res_uuc_humidity = resolution.uuc.humidity / (2 * Math.sqrt(3));
  const u_res_std_humidity = resolution.std.humidity / (2 * Math.sqrt(3));
  const s_uuc_humidity = stddev(uucReadings.humidity.flat());
  const u_rep_uuc_humidity = s_uuc_humidity / Math.sqrt(uucReadings.humidity.length);
  const s_ref_humidity = stddev(refReadings.humidity.flat());
  const u_rep_ref_humidity = s_ref_humidity / Math.sqrt(refReadings.humidity.length);
  const u_hyst_humidity = hysteresis.humidity / Math.sqrt(3);
  const u_unif_humidity = uniformity.humidity / Math.sqrt(3);
  
  const uc_humidity = Math.sqrt(
    u_std_humidity**2 + u_drift_humidity**2 + u_res_uuc_humidity**2 + u_res_std_humidity**2 + u_rep_uuc_humidity**2 + u_rep_ref_humidity**2 + u_hyst_humidity**2 + u_unif_humidity**2
  );
  const U_humidity = 2 * uc_humidity;
  
  // Add a helper to ensure we always map over an array
  const safeArray = arr => Array.isArray(arr) ? arr : [0,0,0];

  // Add state for lowest values for Testpoint 1 (Reference and UUC, 3 trials each)
  const [lowestRefTemp, setLowestRefTemp] = useState(["", "", ""]);
  const [lowestUucTemp, setLowestUucTemp] = useState(["", "", ""]);

  // Add state for lowest values for Testpoint 1 (Reference and UUC, 3 trials each) for humidity
  const [lowestRefHumidity, setLowestRefHumidity] = useState(["", "", ""]);
  const [lowestUucHumidity, setLowestUucHumidity] = useState(["", "", ""]);

  // Auto-populate lowest test point values based on the lowest value in each row of readings
  useEffect(() => {
    // For temperature
    const refTemp = refReadings.temp;
    const uucTemp = uucReadings.temp;
    setLowestRefTemp([0,1,2].map(trialIdx => {
      // For each trial, get the lowest value among testpoints
      const vals = [0,1,2].map(pointIdx => parseFloat(refTemp[pointIdx]?.[trialIdx]) || Infinity);
      const min = Math.min(...vals);
      return min === Infinity ? "" : min;
    }));
    setLowestUucTemp([0,1,2].map(trialIdx => {
      const vals = [0,1,2].map(pointIdx => parseFloat(uucTemp[pointIdx]?.[trialIdx]) || Infinity);
      const min = Math.min(...vals);
      return min === Infinity ? "" : min;
    }));
    // For humidity
    const refHumidity = refReadings.humidity;
    const uucHumidity = uucReadings.humidity;
    setLowestRefHumidity([0,1,2].map(trialIdx => {
      const vals = [0,1,2].map(pointIdx => parseFloat(refHumidity[pointIdx]?.[trialIdx]) || Infinity);
      const min = Math.min(...vals);
      return min === Infinity ? "" : min;
    }));
    setLowestUucHumidity([0,1,2].map(trialIdx => {
      const vals = [0,1,2].map(pointIdx => parseFloat(uucHumidity[pointIdx]?.[trialIdx]) || Infinity);
      const min = Math.min(...vals);
      return min === Infinity ? "" : min;
    }));
  }, [refReadings, uucReadings]);

  // --- Repeatability Table UI for Temperature and Humidity ---
  const renderRepeatabilityTable = (type, label, unit) => (
    <div className="mb-8">
      <h4 className="font-semibold text-gray-700 mb-2">{label}</h4>
      <div className="overflow-x-auto">
        <table className="border text-xs w-full mb-2">
          <thead>
            <tr>
              <th className="border p-1 bg-gray-100">TRIAL</th>
              <th className="border p-1 bg-gray-100" colSpan={3}>Reference Reading {unit}</th>
              <th className="border p-1 bg-gray-100" colSpan={3}>UUC Reading {unit}</th>
            </tr>
            <tr>
              <th className="border p-1 bg-gray-50"></th>
              {[1,2,3].map(i => <th className="border p-1 bg-gray-50" key={i}>Testpoint {i}</th>)}
              {[1,2,3].map(i => <th className="border p-1 bg-gray-50" key={i}>Testpoint {i}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0,1,2].map(trialIdx => (
              <tr key={trialIdx}>
                <td className="border p-1 font-medium">{trialIdx+1}</td>
                {[0,1,2].map(pointIdx => (
                  <td className="border p-1" key={pointIdx}>
                    <ModernInput
                      type="number"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={Array.isArray(refReadings[type][pointIdx]) && refReadings[type][pointIdx][trialIdx] !== undefined && refReadings[type][pointIdx][trialIdx] !== null ? refReadings[type][pointIdx][trialIdx] : ""}
                      onChange={e => handleMatrixReadingChange(type, pointIdx, trialIdx, e.target.value, 'ref')}
                      className="w-full"
                    />
                  </td>
                ))}
                {[0,1,2].map(pointIdx => (
                  <td className="border p-1" key={pointIdx}>
                    <ModernInput
                      type="number"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={Array.isArray(uucReadings[type][pointIdx]) && uucReadings[type][pointIdx][trialIdx] !== undefined && uucReadings[type][pointIdx][trialIdx] !== null ? uucReadings[type][pointIdx][trialIdx] : ""}
                      onChange={e => handleMatrixReadingChange(type, pointIdx, trialIdx, e.target.value, 'uuc')}
                      className="w-full"
                    />
                  </td>
                ))}
              </tr>
            ))}
            {/* Add Lowest Test Pt. rows for Testpoint 1 only (Reference and UUC) for temp and humidity */}
            {type === 'temp' && [0,1,2].map((trialIdx) => (
              <tr key={`lowest-row-temp-${trialIdx}`}>
                {trialIdx === 0 && (
                  <td className="border p-1 font-bold" rowSpan={3} style={{verticalAlign:'middle'}}>Lowest<br/>Test Pt.</td>
                )}
                <td className="border p-1">
                  <ModernInput
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={lowestRefTemp[trialIdx]}
                    readOnly
                    className="w-full bg-gray-100"
                  />
                </td>
                <td className="border p-1"></td>
                <td className="border p-1"></td>
                <td className="border p-1">
                  <ModernInput
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={lowestUucTemp[trialIdx]}
                    readOnly
                    className="w-full bg-gray-100"
                  />
                </td>
                <td className="border p-1"></td>
                <td className="border p-1"></td>
              </tr>
            ))}
            {type === 'humidity' && [0,1,2].map((trialIdx) => (
              <tr key={`lowest-row-humidity-${trialIdx}`}>
                {trialIdx === 0 && (
                  <td className="border p-1 font-bold" rowSpan={3} style={{verticalAlign:'middle'}}>Lowest<br/>Test Pt.</td>
                )}
                <td className="border p-1">
                  <ModernInput
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={lowestRefHumidity[trialIdx]}
                    readOnly
                    className="w-full bg-gray-100"
                  />
                </td>
                <td className="border p-1"></td>
                <td className="border p-1"></td>
                <td className="border p-1">
                  <ModernInput
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={lowestUucHumidity[trialIdx]}
                    readOnly
                    className="w-full bg-gray-100"
                  />
                </td>
                <td className="border p-1"></td>
                <td className="border p-1"></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td className="border p-1 font-bold">Sr</td>
              {[0,1,2].map(pointIdx => (
                <td className="border p-1 text-center" key={pointIdx}>{repeatability[type][pointIdx].refSr.toFixed(3)}</td>
              ))}
              {[0,1,2].map(pointIdx => (
                <td className="border p-1 text-center" key={pointIdx}>{repeatability[type][pointIdx].uucSr.toFixed(3)}</td>
              ))}
            </tr>
            <tr className="bg-gray-100">
              <td className="border p-1 font-bold">Ur</td>
              {[0,1,2].map(pointIdx => (
                <td className="border p-1 text-center" key={pointIdx}>{type === 'temp' ? Number(repeatability[type][pointIdx].refUr).toFixed(3) : Number(repeatability[type][pointIdx].refUr).toFixed(2)}</td>
              ))}
              {[0,1,2].map(pointIdx => (
                <td className="border p-1 text-center" key={pointIdx}>{type === 'temp' ? Number(repeatability[type][pointIdx].uucUr).toFixed(3) : Number(repeatability[type][pointIdx].uucUr).toFixed(2)}</td>
              ))}
            </tr>
          </tfoot>
        </table>
            </div>
      <div className="text-xs text-gray-500 mt-1">Ur = Sr / √n, where n = 3</div>
    </div>
  );

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

  // Add state for resolution and readability
  const [resolutionTemp, setResolutionTemp] = useState(0.01);
  const [resolutionHumidity, setResolutionHumidity] = useState(0.01);
  const [readabilityTemp, setReadabilityTemp] = useState(0.01);
  const [readabilityHumidity, setReadabilityHumidity] = useState(0.01);

  // Update the standardReference card to use ModernInput for these fields
  const standardReference = (
    <CardSection>
      <h2 className="text-lg font-bold mb-2">Reference Standard Used</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div>
          <div className="flex items-center mb-2">
            <label className="w-32 font-medium">Resolution:</label>
            <ModernInput type='number' value={resolutionTemp} onChange={e => setResolutionTemp(parseFloat(e.target.value) || 0)} className='w-20 ml-2' />
            <span className='ml-1 mr-4'>°C</span>
            <ModernInput type='number' value={resolutionHumidity} onChange={e => setResolutionHumidity(parseFloat(e.target.value) || 0)} className='w-20' />
            <span className='ml-1'>%RH</span>
          </div>
          <div className="flex items-center mb-2">
            <label className="w-32 font-medium">Readability:</label>
            <ModernInput type='number' value={readabilityTemp} onChange={e => setReadabilityTemp(parseFloat(e.target.value) || 0)} className='w-20 ml-2' />
            <span className='ml-1 mr-4'>°C</span>
            <ModernInput type='number' value={readabilityHumidity} onChange={e => setReadabilityHumidity(parseFloat(e.target.value) || 0)} className='w-20' />
            <span className='ml-1'>%RH</span>
          </div>
          <div className="flex items-center mb-2">
            <label className="w-32 font-medium">Standard Uncertainty (Us):</label>
            <ModernInput type='number' value={u_std.temp} onChange={e => setU_std({...u_std, temp: parseFloat(e.target.value)})} className='w-24 ml-2' />
            <span className='ml-1'>°C</span>
          </div>
          <div className="flex items-center mb-2">
            <label className="w-32 font-medium">Standard Uncertainty (Us, Humidity):</label>
            <ModernInput type='number' value={u_std.humidity} onChange={e => setU_std({...u_std, humidity: parseFloat(e.target.value)})} className='w-24 ml-2' />
            <span className='ml-1'>%RH</span>
          </div>
        </div>
        <div className="flex flex-col justify-start h-full">
          <div className="mb-2"><b>k-factor:</b> 2</div>
          <div className="mb-2"><b>Degrees of Freedom (df1):</b> ∞</div>
        </div>
      </div>
      <div className='text-xs text-gray-600 mt-2'>
        <b>Why it matters:</b> These values are used to estimate Ustd (uncertainty of the reference), Udrift (uncertainty due to drift), and Ustd_res (uncertainty due to resolution) in the combined standard uncertainty budget.
      </div>
    </CardSection>
  );

  // Add constant arrays for Ustd and Udrift
  const UstdArr = [0.16, 0.22, 0.28];
  const UdriftArr = [0.02, 0.03, 0.01];

  // Add constant for uniformity
  const uniformityConst = 0.037643;

  // Add state for calibration details
  const [calDetails, setCalDetails] = useState({
    referenceNo: '',
    sampleNo: '',
    calibratedBy: '',
    customer: '',
    address: '',
    dateSubmitted: '',
    dateCalibrated: '',
    placeOfCalibration: '',
    type: '',
    manufacturer: '',
    model: '',
    serialNo: '',
  });
  const calDetailsRef = useRef(calDetails);
  // Keep ref in sync with state
  useEffect(() => { calDetailsRef.current = calDetails; }, [calDetails]);

  const calibrationDetailsForm = (
    <CardSection>
      <h2 className="text-lg font-bold mb-2">Calibration Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <InputRow placeholder="Reference No." value={calDetails.referenceNo} onChange={e => { setCalDetails(d => { const v = {...d, referenceNo: e.target.value}; calDetailsRef.current = v; return v; }); }} />
          <InputRow placeholder="Sample No." value={calDetails.sampleNo} onChange={e => { setCalDetails(d => { const v = {...d, sampleNo: e.target.value}; calDetailsRef.current = v; return v; }); }} />
          <InputRow placeholder="Calibrated by" value={calDetails.calibratedBy} onChange={e => { setCalDetails(d => { const v = {...d, calibratedBy: e.target.value}; calDetailsRef.current = v; return v; }); }} />
        </div>
        <div>
          <InputRow placeholder="Customer" value={calDetails.customer} onChange={e => { setCalDetails(d => { const v = {...d, customer: e.target.value}; calDetailsRef.current = v; return v; }); }} />
          <InputRow placeholder="Address" value={calDetails.address} onChange={e => { setCalDetails(d => { const v = {...d, address: e.target.value}; calDetailsRef.current = v; return v; }); }} />
        </div>
        <div>
          <InputRow placeholder="Date Submitted" value={calDetails.dateSubmitted} onChange={e => { setCalDetails(d => { const v = {...d, dateSubmitted: e.target.value}; calDetailsRef.current = v; return v; }); }} />
          <InputRow placeholder="Date Calibrated" value={calDetails.dateCalibrated} onChange={e => { setCalDetails(d => { const v = {...d, dateCalibrated: e.target.value}; calDetailsRef.current = v; return v; }); }} />
          <InputRow placeholder="Place of Calibration" value={calDetails.placeOfCalibration} onChange={e => { setCalDetails(d => { const v = {...d, placeOfCalibration: e.target.value}; calDetailsRef.current = v; return v; }); }} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <InputRow placeholder="Type" value={calDetails.type} onChange={e => { setCalDetails(d => { const v = {...d, type: e.target.value}; calDetailsRef.current = v; return v; }); }} />
          <InputRow placeholder="Manufacturer" value={calDetails.manufacturer} onChange={e => { setCalDetails(d => { const v = {...d, manufacturer: e.target.value}; calDetailsRef.current = v; return v; }); }} />
          <InputRow placeholder="Model" value={calDetails.model} onChange={e => { setCalDetails(d => { const v = {...d, model: e.target.value}; calDetailsRef.current = v; return v; }); }} />
          <InputRow placeholder="Serial No." value={calDetails.serialNo} onChange={e => { setCalDetails(d => { const v = {...d, serialNo: e.target.value}; calDetailsRef.current = v; return v; }); }} />
        </div>
      </div>
    </CardSection>
  );

  // Add state for standard specs and environment
  const [standardSpecs, setStandardSpecs] = useState({
    description: '',
    make: '',
    model: '',
    serialNo: '',
    resolutionTemp: '',
    resolutionRh: '',
    readabilityTemp: '',
    readabilityRh: '',
    envStartTime: '',
    envStartTemp: '',
    envStartRh: '',
    envEndTime: '',
    envEndTemp: '',
    envEndRh: '',
    envAvgTemp: '',
    envAvgRh: '',
    rgTemp: '',
    rgRh: '',
    rdTemp: '',
    rdRh: '',
    udTemp: '',
    udRh: '',
    absUncDev: '',
    measuredValue: '',
    relUnc: '',
    dof: '',
    relUncFormula: '',
    sensCoeff: '',
    qualityLevel: '5',
  });

  const standardSpecsForm = (
    <CardSection>
      <h2 className="text-lg font-bold mb-2">Standard Thermohygrometer Specs & Environment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="font-semibold mb-2">Identity and Specifications of the STANDARD THERMOHYGROMETER</div>
          <InputRow placeholder="Description" value={standardSpecs.description} onChange={e => setStandardSpecs(d => ({...d, description: e.target.value}))} />
          <InputRow placeholder="Make" value={standardSpecs.make} onChange={e => setStandardSpecs(d => ({...d, make: e.target.value}))} />
          <InputRow placeholder="Model" value={standardSpecs.model} onChange={e => setStandardSpecs(d => ({...d, model: e.target.value}))} />
          <InputRow placeholder="Serial No." value={standardSpecs.serialNo} onChange={e => setStandardSpecs(d => ({...d, serialNo: e.target.value}))} />
          <div className="flex gap-2">
            <InputRow placeholder="Resolution (°C)" value={standardSpecs.resolutionTemp} onChange={e => setStandardSpecs(d => ({...d, resolutionTemp: e.target.value}))} />
            <InputRow placeholder="Resolution (%rh)" value={standardSpecs.resolutionRh} onChange={e => setStandardSpecs(d => ({...d, resolutionRh: e.target.value}))} />
          </div>
          <div className="flex gap-2">
            <InputRow placeholder="Readability (°C)" value={standardSpecs.readabilityTemp} onChange={e => setStandardSpecs(d => ({...d, readabilityTemp: e.target.value}))} />
            <InputRow placeholder="Readability (%rh)" value={standardSpecs.readabilityRh} onChange={e => setStandardSpecs(d => ({...d, readabilityRh: e.target.value}))} />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="font-semibold mb-2">Environment Condition</div>
          <div className="flex gap-2 mb-1">
            <InputRow placeholder="Start Time" value={standardSpecs.envStartTime} onChange={e => setStandardSpecs(d => ({...d, envStartTime: e.target.value}))} />
            <InputRow placeholder="Start Temp (°C)" value={standardSpecs.envStartTemp} onChange={e => setStandardSpecs(d => ({...d, envStartTemp: e.target.value}))} />
            <InputRow placeholder="Start RH" value={standardSpecs.envStartRh} onChange={e => setStandardSpecs(d => ({...d, envStartRh: e.target.value}))} />
          </div>
          <div className="flex gap-2 mb-1">
            <InputRow placeholder="End Time" value={standardSpecs.envEndTime} onChange={e => setStandardSpecs(d => ({...d, envEndTime: e.target.value}))} />
            <InputRow placeholder="End Temp (°C)" value={standardSpecs.envEndTemp} onChange={e => setStandardSpecs(d => ({...d, envEndTemp: e.target.value}))} />
            <InputRow placeholder="End RH" value={standardSpecs.envEndRh} onChange={e => setStandardSpecs(d => ({...d, envEndRh: e.target.value}))} />
          </div>
          <div className="flex gap-2">
            <InputRow placeholder="Average Temp (°C)" value={standardSpecs.envAvgTemp} onChange={e => setStandardSpecs(d => ({...d, envAvgTemp: e.target.value}))} />
            <InputRow placeholder="Average RH" value={standardSpecs.envAvgRh} onChange={e => setStandardSpecs(d => ({...d, envAvgRh: e.target.value}))} />
          </div>
        </div>
      </div>
    </CardSection>
  );

  // Calculate Ud for temperature and humidity
  const udTempCalc = (Number(standardSpecs.rgTemp) * Number(standardSpecs.rdTemp)) / Math.sqrt(3);
  const udRhCalc = (Number(standardSpecs.rgRh) * Number(standardSpecs.rdRh)) / Math.sqrt(3);
  // Calculate Relative uncertainty %R for °C
  const relUncCalc = (Number(standardSpecs.absUncDev) && Number(standardSpecs.measuredValue)) ? (Number(standardSpecs.absUncDev) / Number(standardSpecs.measuredValue)) * 100 : '';

  const standardUncertaintyForm = (
    <CardSection>
      <h2 className="text-lg font-bold mb-2">Standard Uncertainty & Related Values</h2>
      <div className="flex flex-col md:flex-row gap-2 items-start w-full">
        {/* Table on the left */}
        <div className="flex-1 min-w-[350px] max-w-xl overflow-x-auto">
          <table className="min-w-[400px] border text-xs mb-4">
            <thead>
              <tr>
                <th className="border p-1 bg-white"></th>
                <th className="border p-1 bg-white">°C</th>
                <th className="border p-1 bg-white">%rh</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-1">Resolution/Graduation, Rg</td>
                <td className="border p-1">
                  <ModernInput type="number" inputMode="decimal" pattern="[0-9]*" value={standardSpecs.rgTemp} onChange={e => setStandardSpecs(d => ({...d, rgTemp: e.target.value}))} className="w-full" placeholder="" />
                </td>
                <td className="border p-1">
                  <ModernInput type="number" inputMode="decimal" pattern="[0-9]*" value={standardSpecs.rgRh} onChange={e => setStandardSpecs(d => ({...d, rgRh: e.target.value}))} className="w-full" placeholder="" />
                </td>
              </tr>
              <tr>
                <td className="border p-1">Readability, Rd</td>
                <td className="border p-1">
                  <ModernInput type="number" inputMode="decimal" pattern="[0-9]*" value={standardSpecs.rdTemp} onChange={e => setStandardSpecs(d => ({...d, rdTemp: e.target.value}))} className="w-full" placeholder="" />
                </td>
                <td className="border p-1">
                  <ModernInput type="number" inputMode="decimal" pattern="[0-9]*" value={standardSpecs.rdRh} onChange={e => setStandardSpecs(d => ({...d, rdRh: e.target.value}))} className="w-full" placeholder="" />
                </td>
              </tr>
              <tr className="font-bold">
                <td className="border p-1">Ud=(Rg*Rd)/&#8730;3</td>
                <td className="border p-1 text-center bg-gray-100">
                  <ModernInput value={isNaN(udTempCalc) ? '' : udTempCalc.toFixed(2)} disabled className="w-full font-bold text-center" />
                </td>
                <td className="border p-1 text-center bg-gray-100">
                  <ModernInput value={isNaN(udRhCalc) ? '' : udRhCalc.toFixed(2)} disabled className="w-full font-bold text-center" />
                </td>
              </tr>
              <tr>
                <td className="border p-1">Absolute uncertainty of dev</td>
                <td className="border p-1">
                  <ModernInput value={standardSpecs.absUncDev} onChange={e => setStandardSpecs(d => ({...d, absUncDev: e.target.value}))} className="w-full" placeholder="" />
                </td>
                <td className="border p-1"></td>
              </tr>
              <tr>
                <td className="border p-1">Measured value</td>
                <td className="border p-1">
                  <ModernInput type="number" inputMode="decimal" pattern="[0-9]*" value={standardSpecs.measuredValue} onChange={e => {
                    const val = e.target.value;
                    if (val === '' || /^-?\d*\.?\d*$/.test(val)) setStandardSpecs(d => ({...d, measuredValue: val}));
                  }} className="w-full" placeholder="" />
                </td>
                <td className="border p-1"></td>
              </tr>
              <tr>
                <td className="border p-1">Relative uncertainty %R</td>
                <td className="border p-1">
                  <ModernInput value={relUncCalc === '' ? '' : relUncCalc.toFixed(2)} disabled className="w-full" placeholder="" />
                </td>
                <td className="border p-1"></td>
              </tr>
              <tr>
                <td className="border p-1">Quality Level</td>
                <td className="border p-1" colSpan={2}>
                  <select
                    value={standardSpecs.qualityLevel}
                    onChange={e => setStandardSpecs(d => ({...d, qualityLevel: e.target.value}))}
                    className="w-full px-2 py-1 border rounded mb-1"
                  >
                    <option value="5">Best (5)</option>
                    <option value="10">Good (10)</option>
                    <option value="20">Poor (20)</option>
                  </select>
                  <div className="text-xs text-gray-600 mt-1">Selected: {standardSpecs.qualityLevel}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Side fields on the right */}
        <div className="flex flex-col min-w-[220px] md:mt-0 mt-4">
          <div className="flex flex-col gap-2 border border-gray-300 rounded-lg bg-gray-50 p-3">
            {/* Degrees of freedom df3 as static label and value */}
            <div>
              <div className="font-medium text-xs mb-1">Degrees of freedom df3</div>
              <div className="text-base font-semibold text-gray-800">
                {(() => {
                  const ql = Number(standardSpecs.qualityLevel);
                  if (!ql || isNaN(ql)) return '';
                  return (0.5 * Math.pow(100 / ql, 2)).toFixed(2);
                })()}
              </div>
            </div>
            <InputRow placeholder="Sensitivity Coefficient, sc3" value={standardSpecs.sensCoeff} onChange={e => setStandardSpecs(d => ({...d, sensCoeff: e.target.value}))} />
          </div>
        </div>
      </div>
    </CardSection>
  );

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return calibrationDetailsForm;
      case 2:
        return standardUncertaintyForm;
      case 3:
        return (
          <CardSection>
            <SectionTitle icon={<FaThermometerHalf />} title="Uncertainty due to Repeatability (Ur/U2) - Temperature" />
            {renderRepeatabilityTable('temp', '', '°C')}
          </CardSection>
        );
      case 4:
        return (
          <CardSection>
            <SectionTitle icon={<FaTint />} title="Uncertainty due to Repeatability (Ur/U2) - Humidity" />
            {renderRepeatabilityTable('humidity', 'B. HUMIDITY INDICATOR TEST @ 23°C (%rh)', '%rh')}
          </CardSection>
        );
      case 5:
        return (
          <CardSection>
            <SectionTitle icon={<MdScience />} title="Uncertainty of Measurement (Temperature)" />
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-1">Test Point</th>
                    <th className="border p-1">Ustd</th>
                    <th className="border p-1">Udrift</th>
                    <th className="border p-1">Ustd_res</th>
                    <th className="border p-1">Uniformity</th>
                    <th className="border p-1">UUC_res</th>
                    <th className="border p-1">u(std_rep)</th>
                    <th className="border p-1">u(uuc_rep)</th>
                    <th className="border p-1">u(hyst)</th>
                    <th className="border p-1">Combined</th>
                    <th className="border p-1">k</th>
                    <th className="border p-1 text-green-700">U</th>
                  </tr>
                </thead>
                <tbody>
                  {[0,1,2].map(i => {
                    // Use constant Ustd and Udrift
                    const Ustd = UstdArr[i];
                    const Udrift = UdriftArr[i];
                    const Ustd_res = resolution.std.temp;
                    const Uniformity = 0.0219050957305712;
                    // Use Ud=(Rg*Rd)/√3 for UUC_res
                    const UUC_res = udTempCalc;
                    const std_rep = repeatability.temp[i].refUr;
                    const uuc_rep = repeatability.temp[i].uucUr;
                    // Calculate u(hyst) once using test point 1 and its lowest values
                    const refTempArrHyst = [0,1,2].map(j => { const v = refReadings.temp[0]?.[j]; return isNaN(Number(v)) ? 0 : Number(v); });
                    const lowestRefNumsHyst = [0,1,2].map(j => { const v = lowestRefTemp[j]; return isNaN(Number(v)) ? 0 : Number(v); });
                    // For UUC
                    const uucTempArrHyst = [0,1,2].map(j => { const v = uucReadings.temp[0]?.[j]; return isNaN(Number(v)) ? 0 : Number(v); });
                    const lowestUucNumsHyst = [0,1,2].map(j => { const v = lowestUucTemp[j]; return isNaN(Number(v)) ? 0 : Number(v); });
                    // Calculate averages for temperature
                    const refAvgHyst = refTempArrHyst.reduce((a, b) => a + b, 0) / refTempArrHyst.length;
                    const uucAvgHyst = uucTempArrHyst.reduce((a, b) => a + b, 0) / uucTempArrHyst.length;
                    const lowestRefAvgHyst = lowestRefNumsHyst.reduce((a, b) => a + b, 0) / lowestRefNumsHyst.length;
                    const lowestUucAvgHyst = lowestUucNumsHyst.reduce((a, b) => a + b, 0) / lowestUucNumsHyst.length;
                    let hystValue = 0;
                    if (lowestRefNumsHyst.length > 0 && lowestUucNumsHyst.length > 0) {
                      hystValue = ((uucAvgHyst - lowestUucAvgHyst) - (refAvgHyst - lowestRefAvgHyst)) / Math.sqrt(3);
                    }
                    // Hysteresis calculation for temperature
                    const hyst = hystValue;
                    // For test points 2 and 3, keep as 0 or previous logic if needed
                    const combined = Math.sqrt(
                      Math.pow(Ustd,2) + Math.pow(Udrift,2) + Math.pow(Ustd_res,2) + Math.pow(Uniformity,2) +
                      Math.pow(UUC_res,2) + Math.pow(std_rep,2) + Math.pow(uuc_rep,2) + Math.pow(hyst,2)
                    );
                    const k = 2;
                    const U = combined * k;
                    return (
                      <tr key={i} className={i%2 ? 'bg-gray-50' : ''}>
                        <td className="border p-1 font-bold">{i+1}</td>
                        <td className="border p-1">{Ustd.toFixed(4)}</td>
                        <td className="border p-1">{Udrift.toFixed(2)}</td>
                        <td className="border p-1">{Ustd_res}</td>
                        <td className="border p-1">{Uniformity.toFixed(6)}</td>
                        <td className="border p-1">{UUC_res.toFixed(2)}</td>
                        <td className="border p-1">{std_rep.toFixed(2)}</td>
                        <td className="border p-1">{uuc_rep.toFixed(2)}</td>
                        <td className="border p-1">{hyst.toFixed(2)}</td>
                        <td className="border p-1">{combined.toFixed(2)}</td>
                        <td className="border p-1">{k}</td>
                        <td className="border p-1 font-bold text-green-700">{U.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
                </div>
            {/* HUMIDITY UNCERTAINTY TABLE */}
            <SectionTitle icon={<MdScience />} title="Uncertainty of Measurement (Humidity)" />
            <div className="overflow-x-auto">
              <table className="min-w-full border text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-1">Test Point</th>
                    <th className="border p-1">Ustd</th>
                    <th className="border p-1">Udrift</th>
                    <th className="border p-1">Ustd_res</th>
                    <th className="border p-1">Uniformity</th>
                    <th className="border p-1">UUC_res</th>
                    <th className="border p-1">u(std_rep)</th>
                    <th className="border p-1">u(uuc_rep)</th>
                    <th className="border p-1">u(hyst)</th>
                    <th className="border p-1">Combined</th>
                    <th className="border p-1">k</th>
                    <th className="border p-1 text-green-700">U</th>
                  </tr>
                </thead>
                <tbody>
                  {[0,1,2].map(i => {
                    // Constants for humidity uncertainty table
                    const humidityUstdArr = [0.45, 0.75, 1.15];
                    const humidityUdriftArr = [0.44, 0.23, 0.23];
                    const humidityUstdResArr = [0.06, 0.06, 0.06];
                    const Ustd = humidityUstdArr[i];
                    const Udrift = humidityUdriftArr[i];
                    const Ustd_res = humidityUstdResArr[i];
                    const Uniformity = 0.0219050957305712;
                    // Use Ud=(Rg*Rd)/√3 for UUC_res
                    const UUC_res = udRhCalc;
                    const std_rep = repeatability.humidity[i].refUr;
                    const uuc_rep = repeatability.humidity[i].uucUr;
                    // Calculate u(hyst) for humidity only once using test point 1 and its lowest values
                    const refHumidityArrHyst = [0,1,2].map(j => { const v = refReadings.humidity[0]?.[j]; return isNaN(Number(v)) ? 0 : Number(v); });
                    const lowestRefNumsHumidityHyst = [0,1,2].map(j => { const v = lowestRefHumidity[j]; return isNaN(Number(v)) ? 0 : Number(v); });
                    const uucHumidityArrHyst = [0,1,2].map(j => { const v = uucReadings.humidity[0]?.[j]; return isNaN(Number(v)) ? 0 : Number(v); });
                    const lowestUucNumsHumidityHyst = [0,1,2].map(j => { const v = lowestUucHumidity[j]; return isNaN(Number(v)) ? 0 : Number(v); });
                    // Calculate averages for humidity
                    const refAvgHumidityHyst = refHumidityArrHyst.reduce((a, b) => a + b, 0) / refHumidityArrHyst.length;
                    const uucAvgHumidityHyst = uucHumidityArrHyst.reduce((a, b) => a + b, 0) / uucHumidityArrHyst.length;
                    const lowestRefAvgHumidityHyst = lowestRefNumsHumidityHyst.reduce((a, b) => a + b, 0) / lowestRefNumsHumidityHyst.length;
                    const lowestUucAvgHumidityHyst = lowestUucNumsHumidityHyst.reduce((a, b) => a + b, 0) / lowestUucNumsHumidityHyst.length;
                    let hystHumidityValue = 0;
                    if (lowestRefNumsHumidityHyst.length > 0 && lowestUucNumsHumidityHyst.length > 0) {
                      hystHumidityValue = ((uucAvgHumidityHyst - lowestUucAvgHumidityHyst) - (refAvgHumidityHyst - lowestRefAvgHumidityHyst)) / Math.sqrt(3);
                    }
                    // Hysteresis calculation for humidity
                    const hyst = hystHumidityValue;
                    const combined = Math.sqrt(
                      Math.pow(Ustd,2) + Math.pow(Udrift,2) + Math.pow(Ustd_res,2) + Math.pow(Uniformity,2) +
                      Math.pow(UUC_res,2) + Math.pow(std_rep,2) + Math.pow(uuc_rep,2) + Math.pow(hyst,2)
                    );
                    const k = 2;
                    const U = combined * k;
                    return (
                      <tr key={i} className={i%2 ? 'bg-gray-50' : ''}>
                        <td className="border p-1 font-bold">{i+1}</td>
                        <td className="border p-1">{Ustd.toFixed(4)}</td>
                        <td className="border p-1">{Udrift.toFixed(2)}</td>
                        <td className="border p-1">{Ustd_res}</td>
                        <td className="border p-1">{Uniformity.toFixed(6)}</td>
                        <td className="border p-1">{UUC_res.toFixed(2)}</td>
                        <td className="border p-1">{std_rep.toFixed(2)}</td>
                        <td className="border p-1">{uuc_rep.toFixed(2)}</td>
                        <td className="border p-1">{hyst.toFixed(2)}</td>
                        <td className="border p-1">{combined.toFixed(2)}</td>
                        <td className="border p-1">{k}</td>
                        <td className="border p-1 font-bold text-green-700">{U.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardSection>
        );
      case 6:
        return (
          <CardSection>
            <SectionTitle icon={<MdCalculate />} title="Results: Temperature Indicator Test" />
            <table className="min-w-full border text-xs mb-6">
              <thead>
                <tr>
                  <th className="border p-1">REFERENCE TEMPERATURE</th>
                  <th className="border p-1">THERMO-HYGROMETER UNDER CALIBRATION READING</th>
                  <th className="border p-1">UNCERTAINTY OF CALIBRATION</th>
                </tr>
              </thead>
              <tbody>
                {[0,1,2].map(i => (
                  <tr key={i}>
                    <td className="border p-1">{avg(refReadings.temp[i]).toFixed(2)} °C</td>
                    <td className="border p-1">{avg(uucReadings.temp[i]).toFixed(2)} °C</td>
                    <td className="border p-1">{U_temp_arr && U_temp_arr[i] !== undefined ? U_temp_arr[i].toFixed(2) : ''} °C</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <SectionTitle icon={<MdCalculate />} title="Results: Humidity Indicator Test" />
            <table className="min-w-full border text-xs">
              <thead>
                <tr>
                  <th className="border p-1">REFERENCE HUMIDITY @ 23°C</th>
                  <th className="border p-1">THERMO-HYGROMETER UNDER CALIBRATION READING</th>
                  <th className="border p-1">UNCERTAINTY OF CALIBRATION</th>
                </tr>
              </thead>
              <tbody>
                {[0,1,2].map(i => (
                  <tr key={i}>
                    <td className="border p-1">{avg(refReadings.humidity[i]).toFixed(2)} %rh</td>
                    <td className="border p-1">{avg(uucReadings.humidity[i]).toFixed(2)} %rh</td>
                    <td className="border p-1">{U_humidity_arr && U_humidity_arr[i] !== undefined ? U_humidity_arr[i].toFixed(2) : ''} %rh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardSection>
        );
      default:
        return null;
    }
  }

  const handleSaveCalibration = async (override = {}) => {
    if (!sampleId) {
      console.error('Sample ID is null or undefined:', sampleId);
      toast.error('Sample not found. Please ensure you are accessing this calculator from the correct page.');
      return false;
    }
    
    console.log('Sample ID is valid:', sampleId);
    const inputData = {
      uucReadings,
      refReadings,
      u_std,
      k_std,
      drift,
      resolution,
      hysteresis,
      uniformity,
      currentStep,
      uucInitial,
      uucFinal,
      refInitial,
      refFinal,
      lowestRefTemp,
      lowestUucTemp,
      lowestRefHumidity,
      lowestUucHumidity,
      calDetails: override.calDetails || calDetailsRef.current,
      standardSpecs,
    };
    const resultData = { U_temp, U_humidity, U_temp_arr, U_humidity_arr };
    console.log('Saving calibration record with data:', {
      sample_id: sampleId,
      calibration_type: 'Thermohygrometer',
      input_data: inputData,
      result_data: resultData,
      calibrated_by: user?.id || null,
      date_started: new Date().toISOString(),
      date_completed: new Date().toISOString()
    });
    
    try {
      console.log('Attempting to save calibration record...');
      console.log('Sample ID:', sampleId);
      console.log('User data:', user);
      console.log('Calibrated by:', user?.id || user?.client_id || null);
      
      const response = await apiService.saveCalibrationRecord({
        sample_id: sampleId,
        calibration_type: 'Thermohygrometer',
        input_data: inputData,
        result_data: resultData,
        calibrated_by: user?.id || null,
        date_started: new Date().toISOString(),
        date_completed: new Date().toISOString()
      });
      
      console.log('Calibration save response:', response);
      
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
    } catch (error) {
      console.error('Error saving calibration record:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to save calibration record: ' + (error.message || 'Unknown error'));
      return false;
    }
  };

  // Confirm Calibration handler
  const handleConfirmCalibration = async () => {
    if (!sampleId) {
      console.error('No sampleId provided for thermohygrometer calibration confirmation');
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

  // Show confirmation dialog before calibration
  const showCalibrationConfirmationDialog = () => {
    setCalibrationConfirmationTitle("Confirm Calibration");
    setCalibrationConfirmationMessage("Are you sure you want to confirm this calibration?");
    setCalibrationConfirmationType("success");
    setShowCalibrationConfirmation(true);
  };

  // Handle confirmation for calibration
  const handleConfirmCalibrationAction = async () => {
    console.log('Starting calibration confirmation...');
    setShowCalibrationConfirmation(false);
    
    try {
      // Save the calibration record first
      console.log('Saving calibration record...');
      await handleSaveCalibration();
      
      // Update the sample status
      console.log('Updating sample status...');
      await handleConfirmCalibration();
      
      // Clear unsaved changes to prevent back navigation confirmation
      setHasUnsavedChanges(false);
      
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
    const hasChanges = 
      // Check if any readings have been entered
      uucReadings.temp.some(row => row.some(val => val !== '')) ||
      uucReadings.humidity.some(row => row.some(val => val !== '')) ||
      refReadings.temp.some(row => row.some(val => val !== '')) ||
      refReadings.humidity.some(row => row.some(val => val !== '')) ||
      // Check if calibration details have been filled
      Object.values(calDetails).some(val => val && val.toString().trim() !== '') ||
      // Check if standard specs have been filled
      Object.values(standardSpecs).some(val => val && val.toString().trim() !== '');
    
    setHasUnsavedChanges(hasChanges);
  }, [uucReadings, refReadings, calDetails, standardSpecs]);

  // Auto-save functionality
  const saveKey = `thermohygrometer_calibration_${sampleId || 'new'}`;
  
  const { manualSave, clearBackup } = useAutoSave(
    () => handleSaveCalibration(),
    { 
      uucReadings, 
      refReadings, 
      u_std, 
      k_std, 
      drift, 
      resolution, 
      hysteresis, 
      uniformity, 
      currentStep,
      uucInitial,
      uucFinal,
      refInitial,
      refFinal,
      lowestRefTemp,
      lowestUucTemp,
      lowestRefHumidity,
      lowestUucHumidity,
      calDetails: calDetailsRef.current,
      standardSpecs
    },
    {
      interval: 10000, // 10 seconds - more frequent saves
      enabled: false, // Disabled auto-save to prevent status issues
      showToast: false,
      saveKey
    }
  );

  // Page refresh detection and data restoration
  const restoreData = useCallback((restoredData) => {
    if (restoredData.uucReadings) setUucReadings(restoredData.uucReadings);
    if (restoredData.refReadings) setRefReadings(restoredData.refReadings);
    if (restoredData.u_std) setU_std(restoredData.u_std);
    if (restoredData.k_std) setK_std(restoredData.k_std);
    if (restoredData.drift) setDrift(restoredData.drift);
    if (restoredData.resolution) setResolution(restoredData.resolution);
    // Note: hysteresis is calculated, not set directly
    if (restoredData.uniformity) setUniformity(restoredData.uniformity);
    if (restoredData.currentStep) setCurrentStep(restoredData.currentStep);
    if (restoredData.uucInitial) setUucInitial(restoredData.uucInitial);
    if (restoredData.uucFinal) setUucFinal(restoredData.uucFinal);
    if (restoredData.refInitial) setRefInitial(restoredData.refInitial);
    if (restoredData.refFinal) setRefFinal(restoredData.refFinal);
    if (restoredData.lowestRefTemp) setLowestRefTemp(restoredData.lowestRefTemp);
    if (restoredData.lowestUucTemp) setLowestUucTemp(restoredData.lowestUucTemp);
    if (restoredData.lowestRefHumidity) setLowestRefHumidity(restoredData.lowestRefHumidity);
    if (restoredData.lowestUucHumidity) setLowestUucHumidity(restoredData.lowestUucHumidity);
    if (restoredData.calDetails) setCalDetails(restoredData.calDetails);
    if (restoredData.standardSpecs) setStandardSpecs(restoredData.standardSpecs);
  }, []);

  usePageRefreshDetection(restoreData, saveKey, true);

  // Back navigation with confirmation
  const {
    showConfirmation,
    isSaving,
    handleBackClick,
    handleConfirmBack,
    handleCancelBack,
    forceBack,
    confirmationTitle,
    confirmationMessage,
    confirmationType
  } = useBackNavigation({
    hasUnsavedChanges,
    confirmationTitle: "Leave Calibration?",
    confirmationMessage: "You have unsaved changes in your thermohygrometer calibration. Are you sure you want to leave? Your progress will be lost.",
    confirmationType: "warning"
  });

  // Auto-populate from existing calibration record if available
  useEffect(() => {
    if (sampleId) {
      apiService.getCalibrationRecordBySampleId(sampleId).then(res => {
        if (res.data && res.data.input_data && res.data.calibration_type === 'Thermohygrometer') {
          const input = typeof res.data.input_data === 'string' ? JSON.parse(res.data.input_data) : res.data.input_data;
          setUucReadings(input.uucReadings ?? { temp: [["","",""],["","",""],["","",""]], humidity: [["","",""],["","",""],["","",""]] });
          setRefReadings(input.refReadings ?? { temp: [["","",""],["","",""],["","",""]], humidity: [["","",""],["","",""],["","",""]] });
          setU_std(input.u_std ?? { temp: 0.1, humidity: 0.5 });
          setK_std(input.k_std ?? 2);
          setDrift(input.drift ?? { temp: 0.05, humidity: 0.1 });
          setResolution(input.resolution ?? { uuc: { temp: 0.1, humidity: 0.1 }, std: { temp: 0.01, humidity: 0.1 } });
          setHysteresis(input.hysteresis ?? { temp: 0.05, humidity: 0.2 });
          setUniformity(input.uniformity ?? { temp: 0.2, humidity: 1.0 });
          setUucInitial(input.uucInitial ?? { temp: [0,0,0], humidity: [0,0,0] });
          setUucFinal(input.uucFinal ?? { temp: [0,0,0], humidity: [0,0,0] });
          setRefInitial(input.refInitial ?? { temp: [0,0,0], humidity: [0,0,0] });
          setRefFinal(input.refFinal ?? { temp: [0,0,0], humidity: [0,0,0] });
          setCurrentStep(input.currentStep || 1);
          setLowestRefTemp(input.lowestRefTemp ?? ["", "", ""]);
          setLowestUucTemp(input.lowestUucTemp ?? ["", "", ""]);
          setLowestRefHumidity(input.lowestRefHumidity ?? ["", "", ""]);
          setLowestUucHumidity(input.lowestUucHumidity ?? ["", "", ""]);
          setCalDetails(input.calDetails ?? {
            referenceNo: '', sampleNo: '', calibratedBy: '', customer: '', address: '', dateSubmitted: '', dateCalibrated: '', placeOfCalibration: '', type: '', manufacturer: '', model: '', serialNo: ''
          });
          setStandardSpecs(input.standardSpecs ?? {
            description: '', make: '', model: '', serialNo: '', resolutionTemp: '', resolutionRh: '', readabilityTemp: '', readabilityRh: '', envStartTime: '', envStartTemp: '', envStartRh: '', envEndTime: '', envEndTemp: '', envEndRh: '', envAvgTemp: '', envAvgRh: '', rgTemp: '', rgRh: '', rdTemp: '', rdRh: '', udTemp: '', udRh: '', absUncDev: '', measuredValue: '', relUnc: '', dof: '', relUncFormula: '', sensCoeff: '', qualityLevel: '5',
          });
          setHasLoadedCalibrationRecord(true);
        }
      }).catch(() => {
        // No record found, do nothing
        setHasLoadedCalibrationRecord(false);
      });
    }
  }, [sampleId]);

  // Add state for reference values
  const [referenceTemps, setReferenceTemps] = useState([20.33, 24.83, 29.73]);
  const [referenceHumidity, setReferenceHumidity] = useState([40.52, 60.00, 79.60]);

  // Add state for indicatedTemps, indicatedHumidity, tempStandardUncertainties, humidityStandardUncertainties
  const [indicatedTemps, setIndicatedTemps] = useState([18.49, 22.82, 27.09]);
  const [indicatedHumidity, setIndicatedHumidity] = useState([40.3, 49.7, 59.3]);
  const [tempStandardUncertainties, setTempStandardUncertainties] = useState([0.1, 0.1, 0.1]);
  const [humidityStandardUncertainties, setHumidityStandardUncertainties] = useState([0.5, 0.5, 0.5]);

  // Uncertainty Un: use expanded uncertainty from your calculations (U_temp, U_humidity) or per test point if available
  const tempExpandedUncertainties = [U_temp, U_temp, U_temp];
  const humidityExpandedUncertainties = [U_humidity, U_humidity, U_humidity];

  // Update tempSummaryTable to use ModernInput for editable fields
  const tempSummaryTable = (
    <CardSection>
      <h3 className="font-semibold mb-2">A. TEMPERATURE INDICATOR TEST</h3>
      <table className="min-w-full border text-xs mb-2">
        <thead>
          <tr>
            <th className="border p-1">Testpoint</th>
            <th className="border p-1">Reference Temp (from Certificate)</th>
            <th className="border p-1">Standard Thermo Hygro (Indicated)</th>
            <th className="border p-1">Correction</th>
            <th className="border p-1">Uncertainty (Std)</th>
            <th className="border p-1">Uncertainty Un</th>
          </tr>
        </thead>
        <tbody>
          {[0,1,2].map(i => (
            <tr key={i}>
              <td className="border p-1">{i+1}</td>
              <td className="border p-1">
                <ModernInput
                  type="number"
                  value={referenceTemps[i] !== undefined && referenceTemps[i] !== null ? referenceTemps[i] : ""}
                  onChange={e => {
                    const arr = [...referenceTemps];
                    arr[i] = parseFloat(e.target.value) || 0;
                    setReferenceTemps(arr);
                  }}
                  className="w-full"
                />
              </td>
              <td className="border p-1">
                <ModernInput
                  type="number"
                  value={indicatedTemps[i] !== undefined && indicatedTemps[i] !== null ? indicatedTemps[i] : ""}
                  onChange={e => {
                    const arr = [...indicatedTemps];
                    arr[i] = parseFloat(e.target.value) || 0;
                    setIndicatedTemps(arr);
                  }}
                  className="w-full"
                />
              </td>
              <td className="border p-1 text-sm">{!isNaN(referenceTemps[i] - indicatedTemps[i]) ? Math.abs(referenceTemps[i] - indicatedTemps[i]).toFixed(2) : ""}</td>
              <td className="border p-1">
                <ModernInput
                  type="number"
                  value={tempStandardUncertainties[i] !== undefined && tempStandardUncertainties[i] !== null ? tempStandardUncertainties[i] : ""}
                  onChange={e => {
                    const arr = [...tempStandardUncertainties];
                    arr[i] = parseFloat(e.target.value) || 0;
                    setTempStandardUncertainties(arr);
                  }}
                  className="w-full"
                />
              </td>
              <td className="border p-1 text-red-600 font-bold">{!isNaN(tempExpandedUncertainties[i]) ? tempExpandedUncertainties[i] : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-gray-600">Corrected Standard Reading: {indicatedTemps.join(", ")}</div>
    </CardSection>
  );

  // Update humiditySummaryTable to use ModernInput for editable fields
  const humiditySummaryTable = (
    <CardSection>
      <h3 className="font-semibold mb-2">B. HUMIDITY INDICATOR TEST</h3>
      <table className="min-w-full border text-xs mb-2">
        <thead>
          <tr>
            <th className="border p-1">Testpoint</th>
            <th className="border p-1">Reference Humidity (from Certificate)</th>
            <th className="border p-1">Standard Thermo Hygro (Indicated)</th>
            <th className="border p-1">Correction</th>
            <th className="border p-1">Uncertainty (Std)</th>
            <th className="border p-1">Uncertainty Un</th>
          </tr>
        </thead>
        <tbody>
          {[0,1,2].map(i => (
            <tr key={i}>
              <td className="border p-1">{i+1}</td>
              <td className="border p-1">
                <ModernInput
                  type="number"
                  value={referenceHumidity[i] !== undefined && referenceHumidity[i] !== null ? referenceHumidity[i] : ""}
                  onChange={e => {
                    const arr = [...referenceHumidity];
                    arr[i] = parseFloat(e.target.value) || 0;
                    setReferenceHumidity(arr);
                  }}
                  className="w-full"
                />
              </td>
              <td className="border p-1">
                <ModernInput
                  type="number"
                  value={indicatedHumidity[i] !== undefined && indicatedHumidity[i] !== null ? indicatedHumidity[i] : ""}
                  onChange={e => {
                    const arr = [...indicatedHumidity];
                    arr[i] = parseFloat(e.target.value) || 0;
                    setIndicatedHumidity(arr);
                  }}
                  className="w-full"
                />
              </td>
              <td className="border p-1 text-sm">{!isNaN(referenceHumidity[i] - indicatedHumidity[i]) ? Math.abs(referenceHumidity[i] - indicatedHumidity[i]).toFixed(2) : ""}</td>
              <td className="border p-1">
                <ModernInput
                  type="number"
                  value={humidityStandardUncertainties[i] !== undefined && humidityStandardUncertainties[i] !== null ? humidityStandardUncertainties[i] : ""}
                  onChange={e => {
                    const arr = [...humidityStandardUncertainties];
                    arr[i] = parseFloat(e.target.value) || 0;
                    setHumidityStandardUncertainties(arr);
                  }}
                  className="w-full"
                />
              </td>
              <td className="border p-1 text-red-600 font-bold">{!isNaN(humidityExpandedUncertainties[i]) ? humidityExpandedUncertainties[i] : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-gray-600">Corrected Standard Reading: {indicatedHumidity.join(", ")}</div>
    </CardSection>
  );

  // Compute U values for each test point from the Uncertainty Components table logic
  const U_temp_arr = [0,1,2].map(i => {
    const Ustd = UstdArr[i];
    const Udrift = UdriftArr[i];
    const Ustd_res = resolution.std.temp;
    const Uniformity = 0.0219050957305712;
    const UUC_res = udTempCalc;
    const std_rep = repeatability.temp[i].refUr;
    const uuc_rep = repeatability.temp[i].uucUr;
    const refTempArrHyst = [0,1,2].map(j => { const v = refReadings.temp[0]?.[j]; return isNaN(Number(v)) ? 0 : Number(v); });
    const lowestRefNumsHyst = [0,1,2].map(j => { const v = lowestRefTemp[j]; return isNaN(Number(v)) ? 0 : Number(v); });
    // For UUC
    const uucTempArrHyst = [0,1,2].map(j => { const v = uucReadings.temp[0]?.[j]; return isNaN(Number(v)) ? 0 : Number(v); });
    const lowestUucNumsHyst = [0,1,2].map(j => { const v = lowestUucTemp[j]; return isNaN(Number(v)) ? 0 : Number(v); });
    // Calculate averages for temperature
    const refAvgHyst = refTempArrHyst.reduce((a, b) => a + b, 0) / refTempArrHyst.length;
    const uucAvgHyst = uucTempArrHyst.reduce((a, b) => a + b, 0) / uucTempArrHyst.length;
    const lowestRefAvgHyst = lowestRefNumsHyst.reduce((a, b) => a + b, 0) / lowestRefNumsHyst.length;
    const lowestUucAvgHyst = lowestUucNumsHyst.reduce((a, b) => a + b, 0) / lowestUucNumsHyst.length;
    let hystValue = 0;
    if (lowestRefNumsHyst.length > 0 && lowestUucNumsHyst.length > 0) {
      hystValue = ((uucAvgHyst - lowestUucAvgHyst) - (refAvgHyst - lowestRefAvgHyst)) / Math.sqrt(3);
    }
    // Debug log for temperature u(hyst)
    console.log('u(hyst) value (temperature):', hystValue);
    const hyst = hystValue;
    // For test points 2 and 3, keep as 0 or previous logic if needed
    const combined = Math.sqrt(
      Math.pow(Ustd,2) + Math.pow(Udrift,2) + Math.pow(Ustd_res,2) + Math.pow(Uniformity,2) +
      Math.pow(UUC_res,2) + Math.pow(std_rep,2) + Math.pow(uuc_rep,2) + Math.pow(hyst,2)
    );
    const k = 2;
    return combined * k;
  });
  const U_humidity_arr = [0,1,2].map(i => {
    const humidityUstdArr = [0.45, 0.75, 1.15];
    const humidityUdriftArr = [0.44, 0.23, 0.23];
    const humidityUstdResArr = [0.06, 0.06, 0.06];
    const Ustd = humidityUstdArr[i];
    const Udrift = humidityUdriftArr[i];
    const Ustd_res = humidityUstdResArr[i];
    const Uniformity = 0.0219050957305712;
    const UUC_res = udRhCalc;
    const std_rep = repeatability.humidity[i].refUr;
    const uuc_rep = repeatability.humidity[i].uucUr;
    const refHumidityArrHyst = [0,1,2].map(j => { const v = refReadings.humidity[0]?.[j]; return isNaN(Number(v)) ? 0 : Number(v); });
    const uucHumidityArrHyst = [0,1,2].map(j => { const v = uucReadings.humidity[0]?.[j]; return isNaN(Number(v)) ? 0 : Number(v); });
    const lowestRefNumsHumidityHyst = [0,1,2].map(j => { const v = lowestRefHumidity[j]; return isNaN(Number(v)) ? 0 : Number(v); });
    const lowestUucNumsHumidityHyst = [0,1,2].map(j => { const v = lowestUucHumidity[j]; return isNaN(Number(v)) ? 0 : Number(v); });
    // Calculate averages for humidity
    const refAvgHumidityHyst = refHumidityArrHyst.reduce((a, b) => a + b, 0) / refHumidityArrHyst.length;
    const uucAvgHumidityHyst = uucHumidityArrHyst.reduce((a, b) => a + b, 0) / uucHumidityArrHyst.length;
    const lowestRefAvgHumidityHyst = lowestRefNumsHumidityHyst.reduce((a, b) => a + b, 0) / lowestRefNumsHumidityHyst.length;
    const lowestUucAvgHumidityHyst = lowestUucNumsHumidityHyst.reduce((a, b) => a + b, 0) / lowestUucNumsHumidityHyst.length;
    let hystHumidityValue = 0;
    if (lowestRefNumsHumidityHyst.length > 0 && lowestUucNumsHumidityHyst.length > 0) {
      hystHumidityValue = ((uucAvgHumidityHyst - lowestUucAvgHumidityHyst) - (refAvgHumidityHyst - lowestRefAvgHumidityHyst)) / Math.sqrt(3);
    }
    // Debug log for humidity u(hyst)
    console.log('u(hyst) value (humidity):', hystHumidityValue);
    const hyst = hystHumidityValue;
    const combined = Math.sqrt(
      Math.pow(Ustd,2) + Math.pow(Udrift,2) + Math.pow(Ustd_res,2) + Math.pow(Uniformity,2) +
      Math.pow(UUC_res,2) + Math.pow(std_rep,2) + Math.pow(uuc_rep,2) + Math.pow(hyst,2)
    );
    const k = 2;
    return combined * k;
  });

  // Add this useEffect after calDetails state declaration
  useEffect(() => {
    async function populateCalDetails() {
      if (!sampleId || hasLoadedCalibrationRecord) return;
      // Only auto-populate if calDetails fields are mostly empty
      const isCalDetailsEmpty = Object.values(calDetails).every(v => !v);
      if (!isCalDetailsEmpty) return;
      try {
        const equipRes = await apiService.getSampleById(sampleId);
        const equip = equipRes.data;
        // Set type, manufacturer, model, serialNo, sampleNo from sample
        setCalDetails(prev => ({
          ...prev,
          type: equip.type || prev.type,
          manufacturer: equip.manufacturer || prev.manufacturer,
          model: equip.model || prev.model,
          serialNo: equip.serial_no || prev.serialNo,
          calibratedBy: (!prev.calibratedBy && user) ? getCalibratedBy(user) : prev.calibratedBy,
          dateCalibrated: prev.dateCalibrated ? prev.dateCalibrated : new Date().toISOString().slice(0, 10),
        }));
        // If reservation_ref_no exists, fetch reservation details
        if (equip.reservation_ref_no) {
          try {
            const resvRes = await apiService.getReservationDetails(equip.reservation_ref_no);
            const resv = resvRes.data;
            setCalDetails(prev => ({
              ...prev,
              referenceNo: resv.reference_number || prev.referenceNo,
              customer: resv.client_name || prev.customer,
              address: resv.address || prev.address,
              dateSubmitted: resv.date_created || prev.dateSubmitted,
            }));
          } catch {}
        }
      } catch {}
    }
    populateCalDetails();
    // Only run on mount or when sampleId or hasLoadedCalibrationRecord changes
    // eslint-disable-next-line
  }, [sampleId, hasLoadedCalibrationRecord]);

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-sans">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Thermohygrometer Uncertainty Calculator</h1>
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a9dab] text-white hover:bg-[#238a91] rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
              title="Go back to calibration list"
            >
              <MdArrowBack className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
        </div>

        {renderStepper()}
        
        <div className="mt-6 min-h-[320px]">
          {renderStepContent()}
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
            <div className="flex space-x-2">
              <ModernButton
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                variant='secondary'
              >
                Previous
              </ModernButton>
            </div>
            {currentStep < steps.length ? (
              <ModernButton
                onClick={async () => {
                  // Use up-to-date state for validation and saving
                  setCalDetails(prevCalDetails => {
                    // Step 1: Calibration Details validation
                    if (currentStep === 1) {
                      const requiredFields = [
                        'referenceNo', 'sampleNo', 'calibratedBy', 'customer', 'address',
                        'dateSubmitted', 'dateCalibrated', 'placeOfCalibration',
                        'type', 'model', 'serialNo'
                      ];
                      const emptyField = requiredFields.find(f => !prevCalDetails[f] || prevCalDetails[f].toString().trim() === '');
                      if (emptyField) {
                        toast.error('Please fill in all Calibration Details fields before proceeding.', {
                          position: 'top-center',
                          duration: 4000,
                          style: {
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }
                        });
                        return prevCalDetails;
                      }
                    }
                    // Step 2: Standard Uncertainty validation
                    if (currentStep === 2) {
                      const requiredStandardFields = [
                        'rgTemp', 'rgRh', 'rdTemp', 'rdRh', 'absUncDev', 'measuredValue', 'qualityLevel'
                      ];
                      const emptyStandardField = requiredStandardFields.find(f => !standardSpecs[f] || standardSpecs[f].toString().trim() === '');
                      if (emptyStandardField) {
                        toast.error('Please fill in all Standard Uncertainty fields before proceeding.', {
                          position: 'top-center',
                          duration: 4000,
                          style: {
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }
                        });
                        return prevCalDetails;
                      }
                    }
                    // Step 3: Temperature Repeatability validation
                    if (currentStep === 3) {
                      const tempEmpty = refReadings.temp.some(row => row.some(v => v === '' || v === null || v === undefined)) ||
                        uucReadings.temp.some(row => row.some(v => v === '' || v === null || v === undefined));
                      if (tempEmpty) {
                        toast.error('Please fill in all Temperature Repeatability readings before proceeding.', {
                          position: 'top-center',
                          duration: 4000,
                          style: {
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }
                        });
                        return prevCalDetails;
                      }
                    }
                    // Step 4: Humidity Repeatability validation
                    if (currentStep === 4) {
                      const humidityEmpty = refReadings.humidity.some(row => row.some(v => v === '' || v === null || v === undefined)) ||
                        uucReadings.humidity.some(row => row.some(v => v === '' || v === null || v === undefined));
                      if (humidityEmpty) {
                        toast.error('Please fill in all Humidity Repeatability readings before proceeding.', {
                          position: 'top-center',
                          duration: 4000,
                          style: {
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }
                        });
                        return prevCalDetails;
                      }
                    }
                    // Save calibration with the latest calDetails
                    handleSaveCalibration({
                      calDetails: prevCalDetails
                    });
                    setCurrentStep(currentStep + 1);
                    return prevCalDetails;
                  });
                }}
              >
                Next
              </ModernButton>
            ) : (
              <ModernButton
                onClick={async () => {
                  showCalibrationConfirmationDialog();
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm Calibration
              </ModernButton>
            )}
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
        isLoading={false}
      />
    </div>
  );
}

export default ThermohygrometerUncertaintyCalculator;
