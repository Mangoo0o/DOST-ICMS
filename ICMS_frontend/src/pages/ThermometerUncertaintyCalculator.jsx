 import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdScience, MdThermostat, MdCalculate, MdInfo } from 'react-icons/md';
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

const DEFAULT_US = 0.024; // Standard uncertainty (°C) - from spreadsheet
const DEFAULT_SC1 = 1;
const DEFAULT_DF1 = 1e26; // Effectively infinite
const DEFAULT_RG = 0; // Resolution (°C) - default value, user input
const DEFAULT_RD = 1; // Readability multiplier
const DEFAULT_K = 1.97; // Coverage factor for 95% confidence - from spreadsheet

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

const input = (props) => {
  const { handleKeyDown: navigationHandler } = useInputNavigation();

  const handleKeyDown = (e) => {
    // Prevent E, e, +, - characters in number inputs to avoid scientific notation
    if (props.type === 'number' && ['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
      return;
    }
    
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

  // Next-step confirmation state
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [isNextSaving, setIsNextSaving] = useState(false);

  // Calibration completion loading state
  const [isCalibrationLoading, setIsCalibrationLoading] = useState(false);

  // User inputs
  const [us, setUs] = useState(DEFAULT_US);
  const [sc1, setSc1] = useState(DEFAULT_SC1);
  const [df1, setDf1] = useState(DEFAULT_DF1);
  const [rg, setRg] = useState(DEFAULT_RG);
  const [rd, setRd] = useState(DEFAULT_RD);
  const [repeatability, setRepeatability] = useState([
    ['', '', ''], // Testpoint 1: 3 trials (36°C)
    ['', '', ''], // Testpoint 2: 3 trials (100°C)
    ['', '', '']  // Testpoint 3: 3 trials (121°C)
  ]);
  
  // Reference standard data - temperature points and corrections
  const [referenceData, setReferenceData] = useState([
    { temp: 0.00, indicated: 0.000, correction: 0.000, uncertainty: 0.023 },
    { temp: 50.00, indicated: 49.000, correction: 1.000, uncertainty: 0.023 },
    { temp: 100.00, indicated: 98.000, correction: 2.000, uncertainty: 0.023 }
  ]);
  
  // Environment conditions
  const [envConditions, setEnvConditions] = useState({
    startTime: '10:00 AM',
    endTime: '2:30 PM',
    startTemp: 24.6,
    endTemp: 24.3,
    avgTemp: 24.5,
    startHumidity: 53.8,
    endHumidity: 54.2,
    avgHumidity: 54.0
  });

  // Calculations for repeatability
  const validRepeat = Array.isArray(repeatability) && repeatability.length >= 3 && 
    repeatability.slice(0, 3).every(testpoint => 
      Array.isArray(testpoint) && testpoint.every(trial => trial !== '' && !isNaN(Number(trial)))
    );
  
  // Calculate repeatability for each testpoint (only first 3 testpoints)
  const repeatabilityResults = Array.isArray(repeatability) ? repeatability.slice(0, 3).map(testpoint => {
    if (!Array.isArray(testpoint)) return { mean: 0, sr: 0, ur: 0, n: 3 };
    const vals = testpoint.map(Number);
    const n = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const sr = stddev(vals);
    const ur = sr / Math.sqrt(n);
    return { mean, sr, ur, n };
  }) : [];
  
  // Use the first testpoint for overall calculations (or average if needed)
  const firstTestpoint = repeatabilityResults[0] || { mean: 0, sr: 0, ur: 0, n: 3 };
  const n = firstTestpoint.n;
  const mean = firstTestpoint.mean;
  const sr = firstTestpoint.sr;
  const ur = firstTestpoint.ur;
  const df2 = n - 1;
  const sc2 = 1;

  // Readability - Fixed formula from spreadsheet: Ud = (Rg * Rd) / √3
  const ud = (rg * rd) / Math.sqrt(3);
  const sc3 = 1;
  const df3 = 200; // From spreadsheet

  // Reference standard uncertainty (U1) - from spreadsheet: Un = ΣUn_i / k
  const u1 = us / DEFAULT_K; // Un = Us / k where k=1.97 for 95% confidence
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
  const k = DEFAULT_K; // 1.97 for 95% confidence from spreadsheet
  const ue = k * uc;

  // Determine acceptable uncertainty based on temperature (medical digital thermometers)
  // Body temperature range ~35–42 °C: tolerance ±0.2 °C
  const getAllowedUncertainty = (temperatureCelsius) => {
    if (temperatureCelsius >= 35 && temperatureCelsius <= 42) return 0.2;
    // Fallback: use same tolerance unless specified otherwise
    return 0.2;
  };

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
              <span className="text-[#2a9dab] font-semibold text-sm">Step 1: Reference Standard Uncertainty (Un/U1)</span>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Standard Platinum Resistance Thermometer / Digital Thermometer with PT100 Probe</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>Confidence level = 95%</div>
                <div>Degrees of freedom (infinite), df1 = {df1.toExponential(2)}</div>
                <div>Standard k factor (from cal cert) k = {DEFAULT_K}</div>
                <div>Sensitivity Coefficient, sc1 = {sc1}</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Reference Standard Data</h4>
              <table className="w-full text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1">Actual Temperature (°C)</th>
                    <th className="border border-gray-300 px-2 py-1">Digital Thermometer Indicated Values (°C)</th>
                    <th className="border border-gray-300 px-2 py-1">Corrections</th>
                    <th className="border border-gray-300 px-2 py-1">Standard uncertainty (from cal cert.), Us</th>
                    <th className="border border-gray-300 px-2 py-1">Uncertainty Un (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceData.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.temp.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {input({
                          type: 'number',
                          step: '0.001',
                          value: row.indicated,
                          onChange: e => {
                            const newData = [...referenceData];
                            newData[index].indicated = Number(e.target.value);
                            newData[index].correction = newData[index].temp - newData[index].indicated;
                            setReferenceData(newData);
                          },
                          className: 'w-full text-center',
                        })}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.correction.toFixed(3)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.uncertainty.toFixed(3)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {(row.uncertainty / DEFAULT_K).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-xs text-gray-600">
                Formula: Un = ΣUn_i / k = {us.toFixed(3)} / {DEFAULT_K} = {(us / DEFAULT_K).toFixed(4)} °C
              </div>
            </div>
          </CardSection>
        );
      case 2:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdScience className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 2: Uncertainty due to Repeatability (Ur/U2)</span>
            </div>
            
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                <div>No. Of Trials (n) = {n}</div>
                <div>Degrees of freedom (n-1), df2 = {df2}</div>
                <div>Sensitivity Coefficient, sc2 = {sc2}</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Testpoint Data</h4>
              <table className="w-full text-xs border-collapse border border-gray-300 mb-3">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1">x</th>
                    <th className="border border-gray-300 px-2 py-1">36</th>
                    <th className="border border-gray-300 px-2 py-1 bg-yellow-200">309.15</th>
                    <th className="border border-gray-300 px-2 py-1">100</th>
                    <th className="border border-gray-300 px-2 py-1">121</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1"></td>
                    <td className="border border-gray-300 px-2 py-1">Testpoint 1</td>
                    <td className="border border-gray-300 px-2 py-1"></td>
                    <td className="border border-gray-300 px-2 py-1">Testpoint 2</td>
                    <td className="border border-gray-300 px-2 py-1">Testpoint 3</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Trial 1</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={Array.isArray(repeatability) && repeatability[0] ? repeatability[0][0] || '' : ''}
                        onChange={e => {
                          const newRepeatability = [...repeatability];
                          if (!Array.isArray(newRepeatability[0])) {
                            newRepeatability[0] = ['', '', ''];
                          }
                          newRepeatability[0] = [...newRepeatability[0]];
                          newRepeatability[0][0] = e.target.value;
                          setRepeatability(newRepeatability);
                        }}
                        className="w-full text-center px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="50.0"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1 bg-yellow-200 text-center">
                      {Array.isArray(repeatability) && repeatability[0] ? 
                        (parseFloat(repeatability[0][0] || 0) + 273.15).toFixed(2) : '273.15'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={Array.isArray(repeatability) && repeatability[1] ? repeatability[1][0] || '' : ''}
                        onChange={e => {
                          const newRepeatability = [...repeatability];
                          if (!Array.isArray(newRepeatability[1])) {
                            newRepeatability[1] = ['', '', ''];
                          }
                          newRepeatability[1] = [...newRepeatability[1]];
                          newRepeatability[1][0] = e.target.value;
                          setRepeatability(newRepeatability);
                        }}
                        className="w-full text-center px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={Array.isArray(repeatability) && repeatability[2] ? repeatability[2][0] || '' : ''}
                        onChange={e => {
                          const newRepeatability = [...repeatability];
                          if (!Array.isArray(newRepeatability[2])) {
                            newRepeatability[2] = ['', '', ''];
                          }
                          newRepeatability[2] = [...newRepeatability[2]];
                          newRepeatability[2][0] = e.target.value;
                          setRepeatability(newRepeatability);
                        }}
                        className="w-full text-center px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Trial 2</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={Array.isArray(repeatability) && repeatability[0] ? repeatability[0][1] || '' : ''}
                        onChange={e => {
                          const newRepeatability = [...repeatability];
                          if (!Array.isArray(newRepeatability[0])) {
                            newRepeatability[0] = ['', '', ''];
                          }
                          newRepeatability[0] = [...newRepeatability[0]];
                          newRepeatability[0][1] = e.target.value;
                          setRepeatability(newRepeatability);
                        }}
                        className="w-full text-center px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="50.0"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1 bg-yellow-200 text-center">
                      {Array.isArray(repeatability) && repeatability[0] ? 
                        (parseFloat(repeatability[0][1] || 0) + 273.15).toFixed(2) : '273.15'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={Array.isArray(repeatability) && repeatability[1] ? repeatability[1][1] || '' : ''}
                        onChange={e => {
                          const newRepeatability = [...repeatability];
                          if (!Array.isArray(newRepeatability[1])) {
                            newRepeatability[1] = ['', '', ''];
                          }
                          newRepeatability[1] = [...newRepeatability[1]];
                          newRepeatability[1][1] = e.target.value;
                          setRepeatability(newRepeatability);
                        }}
                        className="w-full text-center px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={Array.isArray(repeatability) && repeatability[2] ? repeatability[2][1] || '' : ''}
                        onChange={e => {
                          const newRepeatability = [...repeatability];
                          if (!Array.isArray(newRepeatability[2])) {
                            newRepeatability[2] = ['', '', ''];
                          }
                          newRepeatability[2] = [...newRepeatability[2]];
                          newRepeatability[2][1] = e.target.value;
                          setRepeatability(newRepeatability);
                        }}
                        className="w-full text-center px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">Trial 3</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={Array.isArray(repeatability) && repeatability[0] ? repeatability[0][2] || '' : ''}
                        onChange={e => {
                          const newRepeatability = [...repeatability];
                          if (!Array.isArray(newRepeatability[0])) {
                            newRepeatability[0] = ['', '', ''];
                          }
                          newRepeatability[0] = [...newRepeatability[0]];
                          newRepeatability[0][2] = e.target.value;
                          setRepeatability(newRepeatability);
                        }}
                        className="w-full text-center px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="50.0"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1 bg-yellow-200 text-center">
                      {Array.isArray(repeatability) && repeatability[0] ? 
                        (parseFloat(repeatability[0][2] || 0) + 273.15).toFixed(2) : '273.15'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={Array.isArray(repeatability) && repeatability[1] ? repeatability[1][2] || '' : ''}
                        onChange={e => {
                          const newRepeatability = [...repeatability];
                          if (!Array.isArray(newRepeatability[1])) {
                            newRepeatability[1] = ['', '', ''];
                          }
                          newRepeatability[1] = [...newRepeatability[1]];
                          newRepeatability[1][2] = e.target.value;
                          setRepeatability(newRepeatability);
                        }}
                        className="w-full text-center px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={Array.isArray(repeatability) && repeatability[2] ? repeatability[2][2] || '' : ''}
                        onChange={e => {
                          const newRepeatability = [...repeatability];
                          if (!Array.isArray(newRepeatability[2])) {
                            newRepeatability[2] = ['', '', ''];
                          }
                          newRepeatability[2] = [...newRepeatability[2]];
                          newRepeatability[2][2] = e.target.value;
                          setRepeatability(newRepeatability);
                        }}
                        className="w-full text-center px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>


            {validRepeat && (
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h4 className="text-sm font-semibold mb-2 text-green-800">Repeatability Calculation Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-semibold text-green-700 mb-2">Testpoint Averages</div>
                    <div>Testpoint 1 - Average (x') = {repeatabilityResults[0]?.mean.toFixed(1) || 0}</div>
                    <div>Testpoint 2 - Average (x') = {repeatabilityResults[1]?.mean.toFixed(1) || 0}</div>
                    <div>Testpoint 3 - Average (x') = {repeatabilityResults[2]?.mean.toFixed(1) || 0}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-green-700 mb-2">Calculated Values</div>
                    <div>Overall Standard deviation (Sr) = {sr.toFixed(4)}</div>
                    <div>Ur = Sr / √n = {sr.toFixed(4)} / √{n} = {ur.toFixed(4)} °C</div>
                    <div className="mt-2 text-gray-600">Formula: Sr = √(1/(n-1)[Σ(x-x')²])</div>
                  </div>
                </div>
              </div>
            )}
          </CardSection>
        );
      case 3:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <FaThermometerHalf className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 3: Uncertainty due to Readability (Ud/U3)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Resolution/Graduation (Rg, °C):</label>
                {input({
                  type: 'number',
                  step: '0.01',
                  value: rg,
                  onChange: e => setRg(Number(e.target.value)),
                  className: 'w-24',
                  placeholder: '0',
                })}
                <span className="text-gray-500 text-xs">(default: 0)</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Readability (Rd):</label>
                {input({
                  type: 'number',
                  step: '0.1',
                  value: rd,
                  onChange: e => setRd(Number(e.target.value)),
                  className: 'w-24',
                  placeholder: '1',
                })}
                <span className="text-gray-500 text-xs">(0.1 for 1/10, 0.2 for 1/5, 0.5 for 1/2, 1 for 1/1)</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                <div>Degrees of freedom df3 = {df3}</div>
                <div>Sensitivity Coefficient, sc3 = {sc3}</div>
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded border border-orange-200">
              <h4 className="text-sm font-semibold mb-2 text-orange-800">Readability Calculation</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div>Ud = (Rg × Rd) / √3 = ({rg} × {rd}) / √3 = {ud.toFixed(8)} °C</div>
                <div>Formula: Ud = (Rg × Rd) / √3</div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Additional Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Absolute uncertainty of device:</label>
                  <div className="text-gray-600">0.5</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Measured value:</label>
                  <div className="text-gray-600">25.2</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Relative uncertainty %R:</label>
                  <div className="text-gray-600">1.984126984 (5 best, 10 good, 20 poor)</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">1/2(100/%R)² = 0.5(100/%R)²:</label>
                  <div className="text-gray-600">0.5(100/1.984126984)²</div>
                </div>
              </div>
            </div>
          </CardSection>
        );
      case 4:
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdCalculate className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 4: Combined Uncertainty Calculation</span>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Uncertainty Components Summary</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div>U1 (Reference Standard) = {u1.toFixed(4)} °C</div>
                <div>U2 (Repeatability) = {u2.toFixed(4)} °C</div>
                <div>U3 (Readability) = {u3.toFixed(8)} °C</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Combined Standard Uncertainty</h4>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="text-xs">
                  <div>Uc = √[(U1×sc1)² + (U2×sc2)² + (U3×sc3)²]</div>
                  <div>Uc = √[({u1.toFixed(4)}×{sc1})² + ({u2.toFixed(4)}×{sc2})² + ({u3.toFixed(8)}×{sc3})²]</div>
                  <div className="font-semibold">Uc = {uc.toFixed(4)} °C</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Effective Degrees of Freedom</h4>
              <div className="text-xs">
                <div>Veff = {veffVal === Infinity ? '∞' : veffVal.toFixed(1)}</div>
                <div>Coverage Factor (k) = {k} (for 95% confidence)</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Expanded Uncertainty</h4>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="text-xs">
                  <div>Ue = k × Uc = {k} × {uc.toFixed(4)}</div>
                  <div className="font-bold text-lg">Ue = {ue.toFixed(4)} °C</div>
                </div>
              </div>
            </div>

          </CardSection>
        );
      case 5: {
        return (
          <CardSection>
            <div className="flex items-center mb-3">
              <MdInfo className="h-5 w-5 text-[#2a9dab] mr-2" />
              <span className="text-[#2a9dab] font-semibold text-sm">Step 5: Final Results & Environment Conditions</span>
            </div>
            
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2">Measurement Results</h2>
              <table className="min-w-full border text-xs mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Standard Reading °C</th>
                    <th className="border px-2 py-1">UUT Reading °C</th>
                    <th className="border px-2 py-1">Correction °C</th>
                    <th className="border px-2 py-1">Uncertainty of Measurement</th>
                    <th className="border px-2 py-1">Allowed Uncertainty</th>
                    <th className="border px-2 py-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceData.map((row, index) => {
                    // Use the overall calculated uncertainty for all points
                    const allowed = getAllowedUncertainty(row.temp);
                    const passed = ue <= allowed;
                    return (
                      <tr key={index}>
                        <td className="border px-2 py-1 text-center">{row.temp.toFixed(3)}</td>
                        <td className="border px-2 py-1 text-center">{row.indicated.toFixed(1)}</td>
                        <td className="border px-2 py-1 text-center">{row.correction.toFixed(3)}</td>
                        <td className="border px-2 py-1 text-center">{ue.toFixed(2)}</td>
                        <td className="border px-2 py-1 text-center">±{allowed.toFixed(1)} °C</td>
                        <td className={`border px-2 py-1 text-center font-semibold ${passed ? 'text-green-700' : 'text-red-700'}`}>{passed ? 'Passed' : 'Failed'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2">Final Results</h2>
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>Combined Standard Uncertainty (Uc): <span className="font-mono font-semibold">{uc.toFixed(4)} °C</span></div>
                  <div>Effective Degrees of Freedom (Veff): <span className="font-mono">{veffVal === Infinity ? '∞' : veffVal.toFixed(1)}</span></div>
                  <div>Coverage Factor (k): <span className="font-mono">{k}</span></div>
                  <div className="text-sm font-bold flex items-center gap-2">Expanded Uncertainty (Ue): <span className="font-mono">{ue.toFixed(4)} °C</span>
                    {(() => {
                      const allowedAt36 = getAllowedUncertainty(36);
                      const overallPass = ue <= allowedAt36;
                      return (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${overallPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {overallPass ? 'Passed' : 'Failed'} (vs ±{allowedAt36.toFixed(1)} °C at 36 °C)
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2">Environment Conditions</h2>
              <table className="min-w-full border text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Parameter</th>
                    <th className="border px-2 py-1">Start</th>
                    <th className="border px-2 py-1">End</th>
                    <th className="border px-2 py-1">Average</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Time</td>
                    <td className="border px-2 py-1">
                      {input({
                        type: 'text',
                        value: envConditions.startTime,
                        onChange: e => setEnvConditions({...envConditions, startTime: e.target.value}),
                        className: 'w-full text-center',
                      })}
                    </td>
                    <td className="border px-2 py-1">
                      {input({
                        type: 'text',
                        value: envConditions.endTime,
                        onChange: e => setEnvConditions({...envConditions, endTime: e.target.value}),
                        className: 'w-full text-center',
                      })}
                    </td>
                    <td className="border px-2 py-1 text-center">-</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Temperature (°C)</td>
                    <td className="border px-2 py-1">
                      {input({
                        type: 'number',
                        step: '0.1',
                        value: envConditions.startTemp,
                        onChange: e => {
                          const newTemp = Number(e.target.value);
                          const avgTemp = (newTemp + envConditions.endTemp) / 2;
                          setEnvConditions({...envConditions, startTemp: newTemp, avgTemp});
                        },
                        className: 'w-full text-center',
                      })}
                    </td>
                    <td className="border px-2 py-1">
                      {input({
                        type: 'number',
                        step: '0.1',
                        value: envConditions.endTemp,
                        onChange: e => {
                          const newTemp = Number(e.target.value);
                          const avgTemp = (envConditions.startTemp + newTemp) / 2;
                          setEnvConditions({...envConditions, endTemp: newTemp, avgTemp});
                        },
                        className: 'w-full text-center',
                      })}
                    </td>
                    <td className="border px-2 py-1 text-center">{envConditions.avgTemp.toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Humidity (% RH)</td>
                    <td className="border px-2 py-1">
                      {input({
                        type: 'number',
                        step: '0.1',
                        value: envConditions.startHumidity,
                        onChange: e => {
                          const newHumidity = Number(e.target.value);
                          const avgHumidity = (newHumidity + envConditions.endHumidity) / 2;
                          setEnvConditions({...envConditions, startHumidity: newHumidity, avgHumidity});
                        },
                        className: 'w-full text-center',
                      })}
                    </td>
                    <td className="border px-2 py-1">
                      {input({
                        type: 'number',
                        step: '0.1',
                        value: envConditions.endHumidity,
                        onChange: e => {
                          const newHumidity = Number(e.target.value);
                          const avgHumidity = (envConditions.startHumidity + newHumidity) / 2;
                          setEnvConditions({...envConditions, endHumidity: newHumidity, avgHumidity});
                        },
                        className: 'w-full text-center',
                      })}
                    </td>
                    <td className="border px-2 py-1 text-center">{envConditions.avgHumidity.toFixed(1)}</td>
                  </tr>
                </tbody>
              </table>
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
      console.log('Auto-save skipped: No sample ID');
      return false;
    }
    
    console.log('Auto-saving thermometer calibration progress...');
    
    const inputData = {
      us, sc1, df1, rg, rd, repeatability, referenceData, envConditions, currentStep
    };
    const resultData = { uc, veffVal, k, ue };
    
    try {
      const response = await apiService.saveCalibrationRecord({
        sample_id: sampleId,
        calibration_type: 'Thermometer',
        input_data: inputData,
        result_data: resultData,
        calibrated_by: user?.id || user?.client_id || user?.user_id || null,
        date_started: new Date().toISOString(),
        date_completed: null // Don't mark as completed for auto-save
      });
      
      if (response && response.data) {
        console.log('Auto-save successful:', response.data);
        return true;
      } else {
        console.error('Auto-save failed: Invalid response', response);
        return false;
      }
    } catch (e) {
      console.error('Auto-save failed:', e);
      console.error('Auto-save error details:', {
        message: e.message,
        response: e.response?.data,
        status: e.response?.status
      });
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
    
    // Check for different possible user ID fields
    const calibratedBy = user?.id || user?.client_id || user?.user_id || null;
    console.log('User object:', user);
    console.log('Available user fields:', Object.keys(user || {}));
    console.log('Calibrated by value:', calibratedBy);
    
    if (!calibratedBy) {
      console.error('No valid user ID found:', { 
        user_id: user?.id, 
        client_id: user?.client_id, 
        user_user_id: user?.user_id,
        all_user_keys: Object.keys(user || {})
      });
      toast.error('Invalid user data. Please log in again.');
      return false;
    }
    
    // Validate and clean input data
    const inputData = {
      us: isNaN(us) ? 0 : us,
      sc1: isNaN(sc1) ? 0 : sc1,
      df1: isNaN(df1) || !isFinite(df1) ? 0 : df1,
      rg: isNaN(rg) ? 0 : rg,
      rd: isNaN(rd) ? 0 : rd,
      repeatability: Array.isArray(repeatability) ? repeatability.map(testpoint => 
        Array.isArray(testpoint) ? testpoint.map(val => isNaN(val) ? 0 : val) : []
      ) : [],
      referenceData: Array.isArray(referenceData) ? referenceData : [],
      envConditions: envConditions || {},
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
      
      // Debug the data being sent
      const calibrationData = {
        sample_id: sampleId,
        calibration_type: 'Thermometer',
        input_data: inputData,
        result_data: resultData,
        calibrated_by: calibratedBy,
        date_started: new Date().toISOString(),
        date_completed: new Date().toISOString()
      };
      console.log('Complete calibration data being sent:', calibrationData);
      
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
      } else if (e.response?.status === 400) {
        console.error('Bad request - validation error');
        toast.error('Invalid calibration data: ' + (e.response?.data?.message || e.message));
      } else if (e.response?.status === 500) {
        console.error('Server error');
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to save calibration record: ' + (e.message || 'Unknown error'));
      }
      
      return false; // Return false instead of throwing
    }
  };

  // Confirm Calibration handler
  const handleConfirmCalibration = async () => {
    if (!sampleId) {
      console.error('No sampleId provided for thermometer calibration confirmation');
      return;
    }
    
    setIsCalibrationLoading(true);
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
    } finally {
      setIsCalibrationLoading(false);
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
                      (Array.isArray(repeatability) && repeatability.some(testpoint => 
                        Array.isArray(testpoint) && testpoint.some(val => val !== '')
                      ));
    setHasUnsavedChanges(hasChanges);
    setUnsavedChanges(hasChanges);
    
    // Save current form data to sessionStorage for page refresh restoration
    if (hasChanges) {
      try {
        const currentFormData = {
          us, sc1, df1, rg, rd, repeatability, referenceData, envConditions, currentStep
        };
        sessionStorage.setItem('current_form_data', JSON.stringify(currentFormData));
        console.log('Saved form data to sessionStorage:', currentFormData);
      } catch (error) {
        console.error('Failed to save form data to sessionStorage:', error);
      }
    }
  }, [us, sc1, df1, rg, rd, repeatability, referenceData, envConditions, currentStep, setUnsavedChanges]);

  // Auto-save functionality
  const saveKey = `thermometer_calibration_${sampleId || 'new'}`;
  
  const { clearBackup } = useAutoSave(
    handleAutoSave,
    { us, sc1, df1, rg, rd, repeatability, referenceData, envConditions, currentStep },
    {
      interval: 10000, // 10 seconds - more frequent saves
      enabled: hasUnsavedChanges,
      showToast: false,
      saveKey
    }
  );

  // Page refresh detection and data restoration
  const restoreData = useCallback((restoredData) => {
    console.log('ThermometerUncertaintyCalculator - restoreData called with:', restoredData);
    
    if (restoredData.us !== undefined) {
      console.log('Restoring us:', restoredData.us);
      setUs(restoredData.us);
    }
    if (restoredData.sc1 !== undefined) {
      console.log('Restoring sc1:', restoredData.sc1);
      setSc1(restoredData.sc1);
    }
    if (restoredData.df1 !== undefined) {
      console.log('Restoring df1:', restoredData.df1);
      setDf1(restoredData.df1);
    }
    if (restoredData.rg !== undefined) {
      console.log('Restoring rg:', restoredData.rg);
      setRg(restoredData.rg);
    }
    if (restoredData.rd !== undefined) {
      console.log('Restoring rd:', restoredData.rd);
      setRd(restoredData.rd);
    }
    if (restoredData.repeatability) {
      console.log('Restoring repeatability:', restoredData.repeatability);
      setRepeatability(restoredData.repeatability);
    }
    if (restoredData.referenceData) {
      console.log('Restoring referenceData:', restoredData.referenceData);
      setReferenceData(restoredData.referenceData);
    }
    if (restoredData.envConditions) {
      console.log('Restoring envConditions:', restoredData.envConditions);
      setEnvConditions(restoredData.envConditions);
    }
    if (restoredData.currentStep) {
      console.log('Restoring currentStep:', restoredData.currentStep);
      setCurrentStep(restoredData.currentStep);
    }
    
    console.log('Data restoration completed');
  }, []);

  usePageRefreshDetection(restoreData, saveKey, true);

  // Trigger auto-save when there are changes
  useEffect(() => {
    if (hasUnsavedChanges && sampleId) {
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        handleAutoSave().catch(console.error);
      }, 2000); // 2 seconds delay to avoid too frequent saves
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, sampleId]);

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
    console.log('ThermometerUncertaintyCalculator - Data loading useEffect triggered');
    console.log('Sample ID:', sampleId);
    
    if (sampleId) {
      console.log('Fetching calibration record for sample ID:', sampleId);
      apiService.getCalibrationRecordBySampleId(sampleId).then(res => {
        console.log('Calibration record response:', res);
        
        if (res.data && res.data.input_data && res.data.calibration_type === 'Thermometer') {
          console.log('Found thermometer calibration data, parsing...');
          const input = typeof res.data.input_data === 'string' ? JSON.parse(res.data.input_data) : res.data.input_data;
          console.log('Parsed input data:', input);
          
          // Load saved calibration data with fallbacks
          setUs(input.us ?? DEFAULT_US);
          setSc1(input.sc1 ?? DEFAULT_SC1);
          setDf1(input.df1 ?? DEFAULT_DF1);
          setRg(input.rg ?? DEFAULT_RG);
          setRd(input.rd ?? DEFAULT_RD);
          setRepeatability(input.repeatability ?? [['', '', ''], ['', '', ''], ['', '', '']]);
          setReferenceData(input.referenceData ?? [
            { temp: 0.00, indicated: 0.000, correction: 0.000, uncertainty: 0.023 },
            { temp: 50.00, indicated: 49.000, correction: 1.000, uncertainty: 0.023 },
            { temp: 100.00, indicated: 98.000, correction: 2.000, uncertainty: 0.023 }
          ]);
          setEnvConditions(input.envConditions ?? {
            startTime: '10:00 AM',
            endTime: '2:30 PM',
            startTemp: 24.6,
            endTemp: 24.3,
            avgTemp: 24.5,
            startHumidity: 53.8,
            endHumidity: 54.2,
            avgHumidity: 54.0
          });
          setCurrentStep(input.currentStep || 1);
          
          console.log('Successfully loaded existing thermometer calibration data');
        } else {
          console.log('No thermometer calibration data found or invalid data structure');
          console.log('Response data:', res.data);
        }
      }).catch(err => {
        console.error('Error loading calibration record:', err);
        // No record found, do nothing
      });
    }
  }, [sampleId]);

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
            onClick={handleBackClick}
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 text-xl h-10 w-10 flex items-center justify-center rounded transition-colors font-bold"
            title="Close"
            aria-label="Close"
          >
            ✕
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
                      }
                      // Validation for Step 2: Repeatability
                      if (currentStep === 2) {
                        if (!validRepeat) {
                          toast.error('Please fill in all repeatability values for all testpoints before proceeding.', {
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
                      }
                      // Validation for Step 3: Readability
                      if (currentStep === 3) {
                        if (!rg || isNaN(rg) || rg <= 0) {
                          toast.error('Please enter a valid Resolution value.', {
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
                        if (!rd || isNaN(rd) || rd <= 0) {
                          toast.error('Please enter a valid Readability Multiplier value.', {
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
                      }
                      // Validation for Step 4: Calculation
                      if (currentStep === 4) {
                        if (!validRepeat) {
                          toast.error('Please complete all previous steps before proceeding.', {
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
                      }
                      
                      await handleAutoSave();
                      setShowNextConfirm(true);
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
      
      {/* Next Step Confirmation Modal */}
      <ConfirmationModal
        isOpen={showNextConfirm}
        onClose={() => setShowNextConfirm(false)}
        onConfirm={async () => {
          try {
            setIsNextSaving(true);
            await handleAutoSave();
            setShowNextConfirm(false);
            setCurrentStep((s) => Math.min(5, s + 1));
          } catch (error) {
            toast.error('Failed to save progress.');
          } finally {
            setIsNextSaving(false);
          }
        }}
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

export default ThermometerUncertaintyCalculator; 