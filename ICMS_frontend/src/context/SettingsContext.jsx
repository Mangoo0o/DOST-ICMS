import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

const SettingsContext = createContext({
  settings: {},
  loading: false,
  error: null,
  updateSetting: () => {},
  backupSettings: () => {},
  restoreSettings: () => {},
  exportSettings: () => {},
  importSettings: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Load settings only when user is authenticated
  useEffect(() => {
    if (user && user.id) {
      loadSettings();
    } else {
      // Clear settings when user is not authenticated
      setSettings({});
      setError(null);
    }
  }, [user]);

  const loadSettings = async () => {
    // Don't load settings if user is not authenticated
    if (!user || !user.id) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getSettings();
      if (response.data.success) {
        setSettings(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load settings');
      }
    } catch (err) {
      // Handle 401 errors gracefully (user not authenticated)
      if (err.response && err.response.status === 401) {
        console.log('Settings not loaded: User not authenticated');
        setSettings({});
        setError(null);
      } else {
        setError('Failed to load settings: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingsType, settingsData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.updateSettings(settingsType, settingsData);
      if (response.data.success) {
        await loadSettings(); // Reload settings after update
        return true;
      } else {
        setError(response.data.message || 'Failed to update settings');
        return false;
      }
    } catch (err) {
      setError('Failed to update settings: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const backupSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.backupSettings();
      if (response.data.success) {
        return response.data.data;
      } else {
        setError(response.data.message || 'Failed to backup settings');
        return null;
      }
    } catch (err) {
      setError('Failed to backup settings: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const restoreSettings = async (backupData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.restoreSettings(backupData);
      if (response.data.success) {
        await loadSettings(); // Reload settings after restore
        return true;
      } else {
        setError(response.data.message || 'Failed to restore settings');
        return false;
      }
    } catch (err) {
      setError('Failed to restore settings: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const exportSettings = async () => {
    try {
      const backupData = await backupSettings();
      if (backupData) {
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `icms-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to export settings: ' + err.message);
      return false;
    }
  };

  const importSettings = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          const success = await restoreSettings(backupData);
          resolve(success);
        } catch (err) {
          setError('Invalid backup file format');
          resolve(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file');
        resolve(false);
      };
      reader.readAsText(file);
    });
  };

  const value = {
    settings,
    loading,
    error,
    updateSetting,
    backupSettings,
    restoreSettings,
    exportSettings,
    importSettings,
    loadSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
