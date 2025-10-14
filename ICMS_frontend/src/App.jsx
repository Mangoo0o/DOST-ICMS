import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar, { InventoryTabContext } from './components/Sidebar';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { useTheme } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { CalibrationProvider } from './context/CalibrationContext';
import { useAuth } from './context/AuthContext';
import { apiService } from './services/api';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import ConfirmationModal from './components/ConfirmationModal';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const isRegistrationPage = location.pathname === '/register-client';
  const isGuestTrackingPage = location.pathname === '/guest-track';
  const { theme: _theme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  // Move inventory tab state here
  const [selectedTab, setSelectedTab] = useState('test-weight');
  const [showForceChange, setShowForceChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoginPage && !isRegistrationPage && !isGuestTrackingPage && isAuthenticated && user?.require_password_change) {
      setShowForceChange(true);
    } else {
      setShowForceChange(false);
    }
  }, [isLoginPage, isRegistrationPage, isGuestTrackingPage, isAuthenticated, user]);

  // Debug confirmation dialog state
  useEffect(() => {
    console.log('showConfirmDialog state changed to:', showConfirmDialog);
  }, [showConfirmDialog]);

  return (
    <SettingsProvider>
      <CalibrationProvider>
        <InventoryTabContext.Provider value={{ selectedTab, setSelectedTab }}>
          <div className="min-h-screen h-screen w-screen flex bg-gray-100 dark:bg-gray-900">
            {!isLoginPage && !isRegistrationPage && !isGuestTrackingPage && <Sidebar />}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!isLoginPage && !isRegistrationPage && !isGuestTrackingPage && <Navbar />}
              <div className="flex-1 min-h-0">
                <AppRoutes />
              </div>
            </div>
          {showForceChange && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Change your password</h3>
                <p className="text-sm text-gray-600 mb-4">For security, you must set a new password before using the system.</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg pr-16" />
                      <button type="button" aria-label={showCurrent ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-gray-500 hover:text-gray-700 bg-transparent" onClick={()=>setShowCurrent(!showCurrent)}>
                        {showCurrent ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg pr-16" />
                      <button type="button" aria-label={showNew ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-gray-500 hover:text-gray-700 bg-transparent" onClick={()=>setShowNew(!showNew)}>
                        {showNew ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <div className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                        <span>{newPassword.length >= 8 ? '✓' : '•'}</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-2 ${/[A-Za-z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                        <span>{/[A-Za-z]/.test(newPassword) ? '✓' : '•'}</span>
                        <span>Contains an alphabet</span>
                      </div>
                      <div className={`flex items-center gap-2 ${/\d/.test(newPassword) ? 'text-green-600' : ''}`}>
                        <span>{/\d/.test(newPassword) ? '✓' : '•'}</span>
                        <span>Contains a number</span>
                      </div>
                      <div className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                        <span>{/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '•'}</span>
                        <span>Contains a special character</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg pr-16" />
                      <button type="button" aria-label={showConfirm ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-gray-500 hover:text-gray-700 bg-transparent" onClick={()=>setShowConfirm(!showConfirm)}>
                        {showConfirm ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <button 
                    className="px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#238a91] disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                    disabled={isSubmitting}
                    onClick={()=>{
                      console.log('Save button clicked');
                      // Basic validation - only check if fields are filled
                      if (!currentPassword || !newPassword || !confirmPassword) {
                        toast.error('Please fill out all password fields', {
                          duration: 4000,
                          position: 'top-center',
                          style: {
                            background: '#EF4444',
                            color: '#fff',
                            padding: '16px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            minWidth: '300px',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          },
                        });
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        toast.error('New password and confirmation do not match', {
                          duration: 4000,
                          position: 'top-center',
                          style: {
                            background: '#EF4444',
                            color: '#fff',
                            padding: '16px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            minWidth: '300px',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          },
                        });
                        return;
                      }
                      console.log('Basic validation passed, showing confirmation dialog');
                      setShowConfirmDialog(true);
                    }}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
          <ConfirmationModal
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={async () => {
              console.log('Confirmation dialog confirmed');
              setIsSubmitting(true);
              try {
                console.log('Calling API service...');
                if (user?.role === 'client') {
                  console.log('Calling changeClientPassword API');
                  await apiService.changeClientPassword({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
                } else {
                  console.log('Calling changePassword API');
                  await apiService.changePassword({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
                }
                console.log('Password change successful');
                setShowConfirmDialog(false);
                setShowForceChange(false);
                // Auto-logout and redirect to login page after password change
                logout();
                navigate('/login');
              } catch (e) {
                console.error('Password change failed:', e);
                const errorMessage = e.response?.data?.message || e.message || 'Failed to change password';
                toast.error(errorMessage, {
                  duration: 4000,
                  position: 'top-center',
                  style: {
                    background: '#EF4444',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    minWidth: '300px',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  },
                });
                // Don't close the dialog on error, let user try again
              } finally {
                setIsSubmitting(false);
              }
            }}
            title="Confirm Password Change"
            message="Are you sure you want to change your password? You will be logged out after the change."
            type="info"
            confirmText={isSubmitting ? "Changing..." : "Change Password"}
            cancelText="Cancel"
            isLoading={isSubmitting}
            zIndex="z-[10000]"
          />
          </div>
        </InventoryTabContext.Provider>
      </CalibrationProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '20px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '500',
            minWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            style: {
              background: '#10B981',
              color: '#fff',
              padding: '20px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              minWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff',
              padding: '20px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              minWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          },
        }}
      />
    </SettingsProvider>
  );
}

export default App;
