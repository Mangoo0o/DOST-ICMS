import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for automatic saving functionality
 * @param {Function} saveFunction - Function to call for saving
 * @param {Object} data - Data to save
 * @param {Object} options - Configuration options
 * @param {number} options.interval - Auto-save interval in milliseconds
 * @param {boolean} options.enabled - Whether auto-save is enabled
 * @param {boolean} options.showToast - Whether to show toast notifications
 * @param {string} options.saveKey - Key for localStorage backup
 * @returns {Object} Auto-save controls
 */
export const useAutoSave = (saveFunction, data, options = {}) => {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    showToast = true,
    saveKey = 'auto_save'
  } = options;

  const intervalRef = useRef(null);
  const lastSaveRef = useRef(null);
  const dataRef = useRef(data);

  // Update data reference when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Create backup in localStorage
  const createBackup = useCallback(() => {
    try {
      const backupData = {
        data: dataRef.current,
        timestamp: Date.now()
      };
      localStorage.setItem(`backup_${saveKey}`, JSON.stringify(backupData));
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }, [saveKey]);

  // Clear backup from localStorage
  const clearBackup = useCallback(() => {
    try {
      localStorage.removeItem(`backup_${saveKey}`);
    } catch (error) {
      console.error('Failed to clear backup:', error);
    }
  }, [saveKey]);

  // Manual save function
  const manualSave = useCallback(async () => {
    try {
      await saveFunction();
      createBackup();
      lastSaveRef.current = Date.now();
      if (showToast) {
        toast.success('Data saved successfully');
      }
    } catch (error) {
      console.error('Manual save failed:', error);
      if (showToast) {
        toast.error('Failed to save data');
      }
    }
  }, [saveFunction, createBackup, showToast]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        await saveFunction();
        createBackup();
        lastSaveRef.current = Date.now();
        if (showToast) {
          toast.success('Auto-saved', { duration: 2000 });
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        if (showToast) {
          toast.error('Auto-save failed');
        }
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, saveFunction, createBackup, showToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    manualSave,
    clearBackup,
    createBackup,
    lastSave: lastSaveRef.current
  };
};

/**
 * Custom hook for detecting page refresh and restoring data
 * @param {Function} restoreFunction - Function to call with restored data
 * @param {string} saveKey - Key for localStorage backup
 * @param {boolean} enabled - Whether restoration is enabled
 */
export const usePageRefreshDetection = (restoreFunction, saveKey, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event) => {
      // Create a backup before page unload
      try {
        const currentData = JSON.parse(sessionStorage.getItem('current_form_data') || '{}');
        const backupData = {
          data: currentData,
          timestamp: Date.now()
        };
        localStorage.setItem(`backup_${saveKey}`, JSON.stringify(backupData));
      } catch (error) {
        console.error('Failed to create backup on page unload:', error);
      }
    };

    const handlePageLoad = () => {
      try {
        const backupData = localStorage.getItem(`backup_${saveKey}`);
        if (backupData) {
          const parsed = JSON.parse(backupData);
          const timeDiff = Date.now() - parsed.timestamp;
          
          // Only restore if backup is less than 1 hour old
          if (timeDiff < 3600000) {
            restoreFunction(parsed.data);
            toast.success('Data restored from backup');
          } else {
            // Clear old backup
            localStorage.removeItem(`backup_${saveKey}`);
          }
        }
      } catch (error) {
        console.error('Failed to restore data:', error);
      }
    };

    // Check for page refresh on mount
    const isPageRefresh = performance.navigation?.type === 1 || 
                         (performance.getEntriesByType('navigation')[0]?.type === 'reload');

    if (isPageRefresh) {
      handlePageLoad();
    }

    // Add beforeunload listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [restoreFunction, saveKey, enabled]);
};
