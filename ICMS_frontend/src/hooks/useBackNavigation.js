import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for handling back navigation with confirmation
 * @param {Object} options - Configuration options
 * @param {boolean} options.hasUnsavedChanges - Whether there are unsaved changes
 * @param {string} options.confirmationTitle - Title for confirmation modal
 * @param {string} options.confirmationMessage - Message for confirmation modal
 * @param {string} options.confirmationType - Type of confirmation (warning, info, error, success)
 * @param {Function} options.onSave - Optional save function to call before navigation
 * @param {string} options.fallbackPath - Fallback path if no history
 */
export const useBackNavigation = (options = {}) => {
  const {
    hasUnsavedChanges = false,
    confirmationTitle = "Unsaved Changes",
    confirmationMessage = "You have unsaved changes. Are you sure you want to leave?",
    confirmationType = "warning",
    onSave = null
  } = options;

  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleBackClick = useCallback(() => {
    // Always show confirmation for calibration forms
    setShowConfirmation(true);
  }, []);

  const handleConfirmBack = useCallback(async () => {
    if (onSave && hasUnsavedChanges) {
      setIsSaving(true);
      try {
        await onSave();
      } catch (error) {
        console.error('Error saving before navigation:', error);
        // Still navigate even if save fails
      } finally {
        setIsSaving(false);
      }
    }
    
    setShowConfirmation(false);
    // Use window.location.href for reliable navigation
    window.location.href = '/calibration';
  }, [onSave, hasUnsavedChanges, navigate]);

  const handleCancelBack = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  const forceBack = useCallback(() => {
    window.location.href = '/calibration';
  }, []);

  const navigateToPath = useCallback((path) => {
    if (hasUnsavedChanges) {
      setShowConfirmation(true);
      // Store the target path for after confirmation
      setTargetPath(path);
    } else {
      navigate(path);
    }
  }, [hasUnsavedChanges, navigate]);

  const [targetPath, setTargetPath] = useState(null);

  const handleConfirmWithPath = useCallback(async () => {
    if (onSave && hasUnsavedChanges) {
      setIsSaving(true);
      try {
        await onSave();
      } catch (error) {
        console.error('Error saving before navigation:', error);
      } finally {
        setIsSaving(false);
      }
    }
    
    setShowConfirmation(false);
    if (targetPath) {
      window.location.href = targetPath;
      setTargetPath(null);
    } else {
      window.location.href = '/calibration';
    }
  }, [onSave, hasUnsavedChanges, navigate, targetPath]);

  return {
    showConfirmation,
    isSaving,
    handleBackClick,
    handleConfirmBack: targetPath ? handleConfirmWithPath : handleConfirmBack,
    handleCancelBack,
    forceBack,
    navigateToPath,
    confirmationTitle,
    confirmationMessage,
    confirmationType
  };
};

export default useBackNavigation;
