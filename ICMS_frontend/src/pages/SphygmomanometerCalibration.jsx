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

const ModernInput = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-sm bg-white shadow-sm ${props.className || ''}`}
  />
);

const ModernButton = (props) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm ${props.disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#2a9dab] text-white hover:bg-[#238a91]'} ${props.className || ''}`}
  />
);

const steps = [
  { id: 1, title: 'Calibration Details', icon: <MdInfo /> },
  { id: 2, title: 'Device Info', icon: <MdScience /> },
  { id: 3, title: 'Systolic (SYS) Readings', icon: <MdScience /> },
  { id: 4, title: 'Diastolic (DIA) Readings', icon: <MdScience /> },
  { id: 5, title: 'IPRT & UUT (DKD R-6-1)', icon: <MdScience /> },
  { id: 6, title: 'Rate of Pressure Loss', icon: <MdScience /> },
  { id: 7, title: 'Results', icon: <MdCalculate /> },
];

function SphygmomanometerCalibration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const serialNumber = location.state?.serialNumber || '';
  const equipmentId = location.state?.equipmentId || null;
  const [currentStep, setCurrentStep] = useState(1);

  const [calDetails, setCalDetails] = useState({
    referenceNo: '',
    sampleNo: '',
    calibratedBy: '',
    customer: '',
    address: '',
    dateSubmitted: '',
    dateCalibrated: new Date().toISOString().slice(0,10),
    type: 'Sphygmomanometer',
    manufacturer: '',
    model: '',
    serialNo: serialNumber || '',
  });

  const [deviceInfo, setDeviceInfo] = useState({
    cuffSize: '',
    measurementRangeSys: '',
    measurementRangeDia: '',
    resolution: '1',
    kFactor: 2,
  });

  // Readings: three test points x three trials for Systolic and Diastolic
  const emptyMatrix = [["","",""],["","",""],["","",""]];
  const [refSys, setRefSys] = useState(emptyMatrix);
  const [uucSys, setUucSys] = useState(emptyMatrix);
  const [refDia, setRefDia] = useState(emptyMatrix);
  const [uucDia, setUucDia] = useState(emptyMatrix);

  // DKD R-6-1 pressure gauge layout (mmHg)
  const KPA_TO_MMHG = 7.500627; // from sheet header
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
  const deviationMmHg = uutMean.map((u,i)=> (u==='' || iprtMean[i]==='')? '': Number((u - iprtMean[i]).toFixed(6)) );
  const deviationKPa  = deviationMmHg.map(v => v===''? '': Number((v / KPA_TO_MMHG).toFixed(6)));
  // Max hysteresis error mmHg from pairs (X1-X2) and (X3-X4)
  const hysteresisMax = uutRows.map(r => {
    const a = (r.X1===''||r.X2==='')? null : Math.abs(Number(r.X1) - Number(r.X2));
    const b = (r.X3===''||r.X4==='')? null : Math.abs(Number(r.X3) - Number(r.X4));
    if (a===null && b===null) return '';
    return Number((Math.max(a||0,b||0)).toFixed(6));
  });
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

  const handleMatrixChange = (setter) => (pointIdx, trialIdx, value) => {
    setter(prev => prev.map((row, i) => i === pointIdx ? row.map((v, j) => j === trialIdx ? (value === '' ? '' : Number(value)) : v) : row));
  };

  const avg = (arr) => {
    const nums = arr.map(v => Number(v)).filter(v => !isNaN(v));
    if (!nums.length) return 0;
    return nums.reduce((a,b)=>a+b,0)/nums.length;
  };

  // Simple uncertainty example: U = k * sd, where sd from paired differences; placeholder until validated
  const computeU = (refRow, uucRow, k = deviceInfo.kFactor || 2) => {
    const diffs = [0,1,2].map(i => Number(uucRow[i]) - Number(refRow[i])).filter(v => !isNaN(v));
    if (diffs.length < 2) return '';
    const mean = diffs.reduce((a,b)=>a+b,0)/diffs.length;
    const varPop = diffs.reduce((a,b)=>a + Math.pow(b-mean,2),0) / (diffs.length - 1);
    const sd = Math.sqrt(varPop);
    return Number((k * sd).toFixed(2));
  };

  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // State for calibration confirmation modal
  const [showCalibrationConfirm, setShowCalibrationConfirm] = useState(false);
  const [calibrationConfirmTitle, setCalibrationConfirmTitle] = useState("");
  const [calibrationConfirmMessage, setCalibrationConfirmMessage] = useState("");
  const [calibrationConfirmType, setCalibrationConfirmType] = useState("info");

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

  // Validation function to check if all required fields are filled
  const validateCalibrationData = () => {
    const errors = [];

    // Check calibration details
    if (!calDetails.referenceNo.trim()) errors.push('Reference Number is required');
    if (!calDetails.sampleNo.trim()) errors.push('Sample Number is required');
    if (!calDetails.calibratedBy.trim()) errors.push('Calibrated By is required');
    if (!calDetails.customer.trim()) errors.push('Customer is required');
    if (!calDetails.dateCalibrated.trim()) errors.push('Date Calibrated is required');
    if (!calDetails.manufacturer.trim()) errors.push('Manufacturer is required');
    if (!calDetails.model.trim()) errors.push('Model is required');
    if (!calDetails.serialNo.trim()) errors.push('Serial Number is required');

    // Check device info
    if (!deviceInfo.cuffSize.trim()) errors.push('Cuff Size is required');
    if (!deviceInfo.measurementRangeSys.trim()) errors.push('Systolic Measurement Range is required');
    if (!deviceInfo.measurementRangeDia.trim()) errors.push('Diastolic Measurement Range is required');

    // Check systolic readings (at least one reading per test point)
    for (let i = 0; i < 3; i++) {
      const hasRefReading = refSys[i].some(val => val !== '');
      const hasUucReading = uucSys[i].some(val => val !== '');
      if (!hasRefReading || !hasUucReading) {
        errors.push(`Systolic readings for Test Point ${i + 1} are incomplete`);
        break;
      }
    }

    // Check diastolic readings (at least one reading per test point)
    for (let i = 0; i < 3; i++) {
      const hasRefReading = refDia[i].some(val => val !== '');
      const hasUucReading = uucDia[i].some(val => val !== '');
      if (!hasRefReading || !hasUucReading) {
        errors.push(`Diastolic readings for Test Point ${i + 1} are incomplete`);
        break;
      }
    }

    return errors;
  };

  useEffect(() => {
    if (!equipmentId || hasLoaded) return;
    apiService.getCalibrationRecordBySampleId(equipmentId).then(res => {
      if (res.data && res.data.calibration_type === 'Sphygmomanometer' && res.data.input_data) {
        const input = typeof res.data.input_data === 'string' ? JSON.parse(res.data.input_data) : res.data.input_data;
        setCalDetails(input.calDetails || calDetails);
        setDeviceInfo(input.deviceInfo || deviceInfo);
        setRefSys(input.refSys || emptyMatrix);
        setUucSys(input.uucSys || emptyMatrix);
        setRefDia(input.refDia || emptyMatrix);
        setUucDia(input.uucDia || emptyMatrix);
        setHasLoaded(true);
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentId, hasLoaded]);

  const saveCalibration = async () => {
    if (!equipmentId) { toast.error('Equipment not found.'); return; }
    try {
      const input_data = { calDetails, deviceInfo, refSys, uucSys, refDia, uucDia, currentStep,
        appliedPressures, iprtRows, uutRows, lossPressures, lossFirst, lossAfter5 };
      const result_data = {
        sys: [0,1,2].map(i => ({ ref: avg(refSys[i]), uuc: avg(uucSys[i]), U: computeU(refSys[i], uucSys[i]) })),
        dia: [0,1,2].map(i => ({ ref: avg(refDia[i]), uuc: avg(uucDia[i]), U: computeU(refDia[i], uucDia[i]) })),
        iprtMean,
        uutMean,
        deviationMmHg,
        deviationKPa,
        hysteresisMax,
        lossRate,
      };
      await apiService.saveCalibrationRecord({
        sample_id: equipmentId,
        calibration_type: 'Sphygmomanometer',
        input_data,
        result_data,
        calibrated_by: user?.id || 1, // Get from auth context, fallback to 1
        date_started: new Date().toISOString().slice(0, 19).replace('T', ' '),
        date_completed: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });
      toast.success('Calibration record saved');
    } catch (e) {
      console.error('Save calibration error:', e);
      toast.error('Failed to save calibration record: ' + (e.response?.data?.message || e.message));
    }
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
    }
  };

  const completeCalibration = async () => {
    // Validate data first
    const validationErrors = validateCalibrationData();
    if (validationErrors.length > 0) {
      toast.error('Please complete all required fields before confirming calibration', {
        position: 'top-center',
        duration: 4000,
        style: {
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    showCalibrationConfirmation();
  };

  const renderStepper = () => (
    <div className="flex items-center justify-between mb-6">
      {steps.map((s, idx) => {
        const isActive = currentStep === s.id;
        const isCompleted = currentStep > s.id;
        return (
          <div key={s.id} className="flex items-center">
            <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 shadow-sm ${isActive ? 'bg-[#2a9dab] border-[#2a9dab] text-white' : isCompleted ? 'bg-[#2a9dab] border-[#2a9dab] text-white' : 'bg-white border-[#2a9dab] text-[#2a9dab]'}`}>
              {s.icon}
            </div>
            <div className="ml-2 text-xs font-semibold">
              {s.title}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-1 mx-2 rounded-full ${isCompleted ? 'bg-[#2a9dab]' : 'bg-[#e0f7fa]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const readingsTable = (label, refMatrix, uucMatrix, onRefChange, onUucChange, unit) => (
    <CardSection>
      <h3 className="font-semibold mb-2">{label}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-[600px] border text-xs mb-2">
          <thead>
            <tr>
              <th className="border p-1">Trial</th>
              <th className="border p-1" colSpan={3}>Reference ({unit})</th>
              <th className="border p-1" colSpan={3}>UUC ({unit})</th>
            </tr>
            <tr>
              <th className="border p-1"></th>
              {[1,2,3].map(i => <th key={`r${i}`} className="border p-1">Testpoint {i}</th>)}
              {[1,2,3].map(i => <th key={`u${i}`} className="border p-1">Testpoint {i}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0,1,2].map(trial => (
              <tr key={trial}>
                <td className="border p-1 font-medium">{trial+1}</td>
                {[0,1,2].map(point => (
                  <td key={`ref-${trial}-${point}`} className="border p-1">
                    <ModernInput type="number" inputMode="decimal" value={refMatrix[point][trial] ?? ''} onChange={e => onRefChange(point, trial, e.target.value)} />
                  </td>
                ))}
                {[0,1,2].map(point => (
                  <td key={`uuc-${trial}-${point}`} className="border p-1">
                    <ModernInput type="number" inputMode="decimal" value={uucMatrix[point][trial] ?? ''} onChange={e => onUucChange(point, trial, e.target.value)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td className="border p-1 font-bold">Average</td>
              {[0,1,2].map(i => <td key={`ra${i}`} className="border p-1 text-center">{avg(refMatrix[i]).toFixed(2)}</td>)}
              {[0,1,2].map(i => <td key={`ua${i}`} className="border p-1 text-center">{avg(uucMatrix[i]).toFixed(2)}</td>)}
            </tr>
            <tr className="bg-gray-100">
              <td className="border p-1 font-bold">U</td>
              {[0,1,2].map(i => <td key={`u-${i}`} className="border p-1 text-center" colSpan={1}>{computeU(refMatrix[i], uucMatrix[i])}</td>)}
              <td className="border p-1" colSpan={2}></td>
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
            <h2 className="text-lg font-bold mb-2">Calibration Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ModernInput placeholder="Reference No." value={calDetails.referenceNo} onChange={e => setCalDetails(d => ({...d, referenceNo: e.target.value}))} />
              <ModernInput placeholder="Sample No." value={calDetails.sampleNo} onChange={e => setCalDetails(d => ({...d, sampleNo: e.target.value}))} />
              <ModernInput placeholder="Calibrated by" value={calDetails.calibratedBy} onChange={e => setCalDetails(d => ({...d, calibratedBy: e.target.value}))} />
              <ModernInput placeholder="Customer" value={calDetails.customer} onChange={e => setCalDetails(d => ({...d, customer: e.target.value}))} />
              <ModernInput placeholder="Address" value={calDetails.address} onChange={e => setCalDetails(d => ({...d, address: e.target.value}))} />
              <ModernInput placeholder="Date Submitted" value={calDetails.dateSubmitted} onChange={e => setCalDetails(d => ({...d, dateSubmitted: e.target.value}))} />
              <ModernInput placeholder="Date Calibrated" value={calDetails.dateCalibrated} onChange={e => setCalDetails(d => ({...d, dateCalibrated: e.target.value}))} />
              <ModernInput placeholder="Type" value={calDetails.type} onChange={e => setCalDetails(d => ({...d, type: e.target.value}))} />
              <ModernInput placeholder="Manufacturer" value={calDetails.manufacturer} onChange={e => setCalDetails(d => ({...d, manufacturer: e.target.value}))} />
              <ModernInput placeholder="Model" value={calDetails.model} onChange={e => setCalDetails(d => ({...d, model: e.target.value}))} />
              <ModernInput placeholder="Serial No." value={calDetails.serialNo} onChange={e => setCalDetails(d => ({...d, serialNo: e.target.value}))} />
            </div>
          </CardSection>
        );
      case 2:
        return (
          <CardSection>
            <h2 className="text-lg font-bold mb-2">Device Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ModernInput placeholder="Cuff Size" value={deviceInfo.cuffSize} onChange={e => setDeviceInfo(d => ({...d, cuffSize: e.target.value}))} />
              <ModernInput placeholder="Range (SYS) mmHg" value={deviceInfo.measurementRangeSys} onChange={e => setDeviceInfo(d => ({...d, measurementRangeSys: e.target.value}))} />
              <ModernInput placeholder="Range (DIA) mmHg" value={deviceInfo.measurementRangeDia} onChange={e => setDeviceInfo(d => ({...d, measurementRangeDia: e.target.value}))} />
              <ModernInput placeholder="Resolution (mmHg)" value={deviceInfo.resolution} onChange={e => setDeviceInfo(d => ({...d, resolution: e.target.value}))} />
              <ModernInput placeholder="k-Factor" value={deviceInfo.kFactor} onChange={e => setDeviceInfo(d => ({...d, kFactor: Number(e.target.value) || 2}))} />
            </div>
          </CardSection>
        );
      case 3:
        return (
          <>
            {readingsTable('Systolic (SYS) Readings', refSys, uucSys, handleMatrixChange(setRefSys), handleMatrixChange(setUucSys), 'mmHg')}
          </>
        );
      case 4:
        return (
          <>
            {readingsTable('Diastolic (DIA) Readings', refDia, uucDia, handleMatrixChange(setRefDia), handleMatrixChange(setUucDia), 'mmHg')}
          </>
        );
      case 5:
        return (
          <>
            <CardSection>
              <h3 className="font-semibold mb-2">Standard Readings (IPRT) and UUT (DKD R-6-1)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-[740px] border text-xs mb-3">
                  <thead>
                    <tr>
                      <th className="border p-1">APPLIED (mmHg)</th>
                      <th className="border p-1">X1 up</th>
                      <th className="border p-1">X2 down</th>
                      <th className="border p-1">X3 up</th>
                      <th className="border p-1">X4 down</th>
                      <th className="border p-1">MEAN IPRT</th>
                      <th className="border p-1">MEAN UUT</th>
                      <th className="border p-1">DEVIATION (mmHg)</th>
                      <th className="border p-1">DEVIATION (kPa)</th>
                      <th className="border p-1">Max Hyst. Err (mmHg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedPressures.map((p,idx)=> (
                      <tr key={p}>
                        <td className="border p-1 text-center">{p}</td>
                        {['X1','X2','X3','X4'].map(k => (
                          <td key={k} className="border p-1">
                            <ModernInput type="number" inputMode="decimal" value={iprtRows[idx][k] ?? ''} onChange={e=> setIprtCell(idx,k,e.target.value)} />
                          </td>
                        ))}
                        <td className="border p-1 text-center bg-gray-50">{iprtMean[idx]!==''? iprtMean[idx] : ''}</td>
                        <td className="border p-1">
                          <div className="grid grid-cols-4 gap-1">
                            {['X1','X2','X3','X4'].map(k => (
                              <ModernInput key={k} type="number" inputMode="decimal" value={uutRows[idx][k] ?? ''} onChange={e=> setUutCell(idx,k,e.target.value)} />
                            ))}
                          </div>
                        </td>
                        <td className="border p-1 text-center bg-gray-50">{deviationMmHg[idx]!==''? deviationMmHg[idx] : ''}</td>
                        <td className="border p-1 text-center bg-gray-50">{deviationKPa[idx]!==''? deviationKPa[idx] : ''}</td>
                        <td className="border p-1 text-center bg-gray-50">{hysteresisMax[idx]!==''? hysteresisMax[idx] : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardSection>
          </>
        );
      case 6:
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
      case 7:
        return (
          <CardSection>
            <h2 className="text-lg font-bold mb-3">Results & Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold mb-1">Systolic</div>
                {[0,1,2].map(i => (
                  <div key={`sys-${i}`} className="text-sm mb-1">TP{i+1}: Ref {avg(refSys[i]).toFixed(2)} | UUC {avg(uucSys[i]).toFixed(2)} | U {computeU(refSys[i], uucSys[i])}</div>
                ))}
              </div>
              <div>
                <div className="font-semibold mb-1">Diastolic</div>
                {[0,1,2].map(i => (
                  <div key={`dia-${i}`} className="text-sm mb-1">TP{i+1}: Ref {avg(refDia[i]).toFixed(2)} | UUC {avg(uucDia[i]).toFixed(2)} | U {computeU(refDia[i], uucDia[i])}</div>
                ))}
              </div>
            </div>
          </CardSection>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Sphygmomanometer Calibration</h1>
          <ModernButton onClick={handleBackClick} className="ml-2 flex-shrink-0">Back</ModernButton>
        </div>
        {renderStepper()}
        <div className="mt-6 min-h-[320px]">
          {renderStep()}
        </div>
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <ModernButton onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1}>Previous</ModernButton>
          {currentStep < steps.length ? (
            <ModernButton onClick={async () => { await saveCalibration(); setCurrentStep(currentStep + 1); }}>Next</ModernButton>
          ) : (
            <ModernButton className="bg-green-600 hover:bg-green-700" onClick={completeCalibration}>Confirm Calibration</ModernButton>
          )}
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
    </div>
  );
}

export default SphygmomanometerCalibration;


