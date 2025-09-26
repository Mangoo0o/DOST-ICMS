import React, { createContext, useContext, useState } from 'react';

const CalibrationContext = createContext();

export const useCalibration = () => {
  const context = useContext(CalibrationContext);
  if (!context) {
    throw new Error('useCalibration must be used within a CalibrationProvider');
  }
  return context;
};

export const CalibrationProvider = ({ children }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationType, setCalibrationType] = useState(null);

  const startCalibration = (type) => {
    setIsCalibrating(true);
    setCalibrationType(type);
    setHasUnsavedChanges(false);
  };

  const endCalibration = () => {
    setIsCalibrating(false);
    setCalibrationType(null);
    setHasUnsavedChanges(false);
  };

  const setUnsavedChanges = (hasChanges) => {
    setHasUnsavedChanges(hasChanges);
  };

  const value = {
    hasUnsavedChanges,
    isCalibrating,
    calibrationType,
    startCalibration,
    endCalibration,
    setUnsavedChanges
  };

  return (
    <CalibrationContext.Provider value={value}>
      {children}
    </CalibrationContext.Provider>
  );
};

export default CalibrationContext;
