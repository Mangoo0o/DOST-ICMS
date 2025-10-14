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
      console.log('Created backup with key:', `backup_${saveKey}`, 'Data:', backupData);
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
  const notificationShownRef = useRef(false);
  
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event) => {
      // Create a backup before page unload
      try {
        const currentData = JSON.parse(sessionStorage.getItem('current_form_data') || '{}');
        const backupData = {
          data: currentData,
          timestamp: Date.now(),
          url: window.location.href // Include URL to ensure we're restoring the right page
        };
        localStorage.setItem(`backup_${saveKey}`, JSON.stringify(backupData));
        console.log('Created backup on page unload:', backupData);
      } catch (error) {
        console.error('Failed to create backup on page unload:', error);
      }
    };

    const handlePageLoad = () => {
      console.log('usePageRefreshDetection - handlePageLoad called');
      console.log('Looking for backup with key:', `backup_${saveKey}`);
      
      try {
        const backupData = localStorage.getItem(`backup_${saveKey}`);
        console.log('Backup data found:', backupData);
        
        if (backupData) {
          const parsed = JSON.parse(backupData);
          const timeDiff = Date.now() - parsed.timestamp;
          console.log('Backup age:', timeDiff, 'ms');
          
          // Check if the backup is for the current page
          const isCurrentPage = !parsed.url || parsed.url === window.location.href;
          
          // Check if backup data has sampleId and if it matches current session
          const sessionData = sessionStorage.getItem('current_form_data');
          let isCurrentSample = true;
          if (sessionData && parsed.data) {
            try {
              const sessionParsed = JSON.parse(sessionData);
              const backupSampleId = parsed.data.sampleId;
              const currentSampleId = sessionParsed.sampleId;
              isCurrentSample = !backupSampleId || !currentSampleId || backupSampleId === currentSampleId;
            } catch (e) {
              console.log('Error parsing session data for sample comparison:', e);
            }
          }
          
          // Only restore if backup is less than 1 hour old, for current page, and for current sample
          if (timeDiff < 3600000 && isCurrentPage && isCurrentSample) {
            console.log('Restoring data from backup:', parsed.data);
            restoreFunction(parsed.data);
            
            // Only show notification once per page load
            if (!notificationShownRef.current) {
              notificationShownRef.current = true;
              toast.success('Data restored from backup', {
                position: 'top-center',
                duration: 3000,
                style: {
                  background: '#10B981',
                  color: '#fff',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  minWidth: '300px',
                  textAlign: 'center',
                  boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)'
                }
              });
            }
          } else {
            console.log('Backup too old, for different page, or different sample - clearing it');
            // Clear old backup
            localStorage.removeItem(`backup_${saveKey}`);
          }
        } else {
          console.log('No backup data found');
        }
      } catch (error) {
        console.error('Failed to restore data:', error);
      }
    };

    // Check for page refresh on mount - improved detection
    const isPageRefresh = performance.navigation?.type === 1 || 
                         (performance.getEntriesByType('navigation')[0]?.type === 'reload') ||
                         document.referrer === '' ||
                         (performance.navigation && performance.navigation.type === 0 && document.referrer === window.location.href);

    // Also check sessionStorage for immediate restoration
    const hasSessionData = sessionStorage.getItem('current_form_data');
    
    console.log('Page refresh detection:', {
      isPageRefresh,
      hasSessionData: !!hasSessionData,
      navigationType: performance.navigation?.type,
      referrer: document.referrer
    });

    if (isPageRefresh || hasSessionData) {
      // Small delay to ensure component is fully mounted
      setTimeout(() => {
        handlePageLoad();
      }, 100);
    }

    // Add beforeunload listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [restoreFunction, saveKey, enabled]);
};
