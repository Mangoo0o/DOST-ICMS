import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar, { InventoryTabContext } from './components/Sidebar';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { useTheme } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { CalibrationProvider } from './context/CalibrationContext';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegistrationPage = location.pathname === '/register-client';
  const { theme: _theme } = useTheme();

  // Move inventory tab state here
  const [selectedTab, setSelectedTab] = useState('test-weight');

  return (
    <SettingsProvider>
      <CalibrationProvider>
        <InventoryTabContext.Provider value={{ selectedTab, setSelectedTab }}>
          <div className="min-h-screen h-screen w-screen flex bg-gray-100 dark:bg-gray-900">
            {!isLoginPage && !isRegistrationPage && <Sidebar />}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!isLoginPage && !isRegistrationPage && <Navbar />}
              <div className="flex-1 min-h-0">
                <AppRoutes />
              </div>
            </div>
          </div>
        </InventoryTabContext.Provider>
      </CalibrationProvider>
    </SettingsProvider>
  );
}

export default App;
