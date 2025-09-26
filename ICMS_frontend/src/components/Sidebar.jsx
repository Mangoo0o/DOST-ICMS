import React, { useState, createContext, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiCalendarLine, 
  RiFileChartLine,
  RiSettings4Line,
  RiLogoutBoxLine,
  RiMoneyDollarCircleLine,
  RiDownloadLine,
  RiUploadLine,
  RiRefreshLine,
  RiDatabaseLine,
  RiInformationLine,
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiBookOpenLine,
  RiPaletteLine,
  RiSearchLine,
  RiFileList3Line,
  RiMailLine
} from 'react-icons/ri';
import { FiBox } from 'react-icons/fi';
import { MdScience } from 'react-icons/md';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

// InventoryTabContext for global tab selection
export const InventoryTabContext = createContext({ selectedTab: 'test-weight', setSelectedTab: () => {} });

export const useInventoryTab = () => useContext(InventoryTabContext);

const adminNavLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: RiDashboardLine },
  { name: 'Calibration', path: '/calibration', icon: MdScience },
  { name: 'Requests', path: '/reservations', icon: RiCalendarLine },
  { name: 'Inventory', path: '/inventory', icon: FiBox },
  { name: 'Transactions', path: '/transaction', icon: RiMoneyDollarCircleLine },
  { name: 'User Management', path: '/users', icon: RiUserLine },
  { name: 'Reports', path: '/reports', icon: RiFileChartLine },
];

const calibrationEngineerNavLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: RiDashboardLine },
  { name: 'Calibration', path: '/calibration', icon: MdScience },
  { name: 'Requests', path: '/reservations', icon: RiCalendarLine },
  { name: 'Inventory', path: '/inventory', icon: FiBox },
  { name: 'Reports', path: '/reports', icon: RiFileChartLine },
];

const clientNavLinks = [
  { name: 'Request', path: '/front-reservation', icon: RiCalendarLine },
];

const cashierNavLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: RiDashboardLine },
  { name: 'Inventory', path: '/inventory', icon: FiBox },
  { name: 'Transactions', path: '/transaction', icon: RiMoneyDollarCircleLine },
];

const inventorySubLinks = [
  { name: 'Test-Weight', hash: '#test-weight' },
  { name: 'Thermometer', hash: '#thermometer' },
  { name: 'Thermohygrometer', hash: '#thermohygrometer' },
  { name: 'Weighing-Scale', hash: '#weighing-scale' },
  { name: 'Sphygmomanometer', hash: '#sphygmomanometer' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { user, logout } = useAuth();
  const { setSelectedTab } = useInventoryTab();
  const [pendingCount, setPendingCount] = useState(0);
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [fullBackupFileInputRef, setFullBackupFileInputRef] = useState(null);
  const [backupInfo, setBackupInfo] = useState(null);
  const [fullBackupLoading, setFullBackupLoading] = useState(false);
  const [fullBackupError, setFullBackupError] = useState(null);
  const [fullBackupSuccess, setFullBackupSuccess] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  // const [showLogs, setShowLogs] = useState(true); // Removed unused state
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [backupLogs, setBackupLogs] = useState(null);
  const [systemLogs, setSystemLogs] = useState(null);
  const [logsFilter, setLogsFilter] = useState('');

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await apiService.getRequests();
        if (response.data && response.data.records) {
          const filtered = response.data.records.filter(
            reservation => reservation.status && reservation.status.toLowerCase() === 'pending'
          );
          setPendingCount(filtered.length);
        } else {
          setPendingCount(0);
        }
      } catch {
        setPendingCount(0);
      }
    };
    fetchPending();

    // Listen for reservation updates
    const handleReservationUpdate = () => {
      fetchPending();
    };
    window.addEventListener('reservation-updated', handleReservationUpdate);
    return () => {
      window.removeEventListener('reservation-updated', handleReservationUpdate);
    };
  }, []);

  // Keep submenu open if on /inventory page
  const isInventoryPage = location.pathname.startsWith('/inventory');
  const [inventoryOpen, setInventoryOpen] = useState(isInventoryPage);

  // Update inventory open state when location changes
  useEffect(() => {
    setInventoryOpen(isInventoryPage);
  }, [isInventoryPage]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };


  const loadBackupInfo = async () => {
    try {
      const response = await apiService.getBackupInfo();
      if (response.data.success) {
        setBackupInfo(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load backup info:', err);
    }
  };

  const loadBackupLogs = async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const resp = await apiService.getBackupLogs();
      if (resp.data?.success) {
        setBackupLogs(resp.data.data);
      } else {
        setLogsError(resp.data?.message || 'Failed to load logs');
      }
    } catch (e) {
      setLogsError(e.message || 'Failed to load logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const loadSystemLogs = async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const resp = await apiService.getSystemLogs({ limit: 200, offset: 0 });
      if (resp.data?.success) {
        setSystemLogs(resp.data.data);
      } else {
        setLogsError(resp.data?.message || 'Failed to load system logs');
      }
    } catch (e) {
      setLogsError(e.message || 'Failed to load system logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso.replace(' ', 'T'));
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  const actionBadge = (action) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold';
    const map = {
      'request_create': base + ' bg-blue-100 text-blue-700',
      'calibration_create': base + ' bg-green-100 text-green-700',
      'calibration_update': base + ' bg-emerald-100 text-emerald-700',
      'payment_process': base + ' bg-purple-100 text-purple-700',
      'settings_update': base + ' bg-amber-100 text-amber-700',
      'backup_export_sql': base + ' bg-cyan-100 text-cyan-700',
      'backup_import_sql': base + ' bg-teal-100 text-teal-700',
    };
    return map[action] || (base + ' bg-gray-100 text-gray-700');
  };

  const parseDetails = (details) => {
    if (!details) return null;
    try { return JSON.parse(details); } catch { return details; }
  };

  const displayAction = (action) => {
    if (!action) return '';
    return String(action).replace(/_/g, ' ');
  };

  const mergedLogs = () => {
    const sys = (systemLogs?.logs || []).map(l => ({
      created_at: l.created_at,
      action: l.action,
      user_id: l.user_id,
      user_name: l.user_name,
      details: l.details
    }));
    const backupEvents = (backupLogs?.logs || []).map(e => ({
      created_at: e.time || e.created || '',
      action: 'backup_event',
      user_id: null,
      user_name: null,
      details: e.message || JSON.stringify(e)
    }));
    const all = [...sys, ...backupEvents];
    return all.sort((a, b) => new Date((b.created_at || '').replace(' ', 'T')) - new Date((a.created_at || '').replace(' ', 'T')));
  };

  const handleCreateFullBackup = async () => {
    setFullBackupLoading(true);
    setFullBackupError(null);
    setFullBackupSuccess(null);
    
    try {
      const response = await apiService.exportSqlBackup();
      const blob = response.data;

      const suggestedName = `icms_db_${new Date().toISOString().replace(/[:T]/g, '-').split('.')[0]}.sql`;

      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName,
            types: [
              {
                description: 'SQL File',
                accept: {
                  'application/sql': ['.sql'],
                  'text/sql': ['.sql']
                }
              }
            ]
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (pickerErr) {
          // If user cancels or picker fails, fall back to default download
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = suggestedName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } else {
        // Fallback for browsers without File System Access API
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      setFullBackupSuccess('SQL backup downloaded successfully!');
      await loadBackupInfo();
    } catch (err) {
      setFullBackupError('Failed to download backup: ' + (err.response?.data?.message || err.message));
    } finally {
      setFullBackupLoading(false);
    }
  };

  const handleRestoreFullBackup = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.sql')) {
      setFullBackupError('Please select a valid .sql backup file.');
      event.target.value = '';
      return;
    }

    setFullBackupLoading(true);
    setFullBackupError(null);
    setFullBackupSuccess(null);

    try {
      const response = await apiService.importSqlBackup(file);
      if (response.data?.success) {
        setFullBackupSuccess('Database restored successfully from SQL file.');
        toast.success('Database restored successfully');
        await loadBackupInfo();
        setTimeout(() => {
          try { localStorage.setItem('reopenSettings', '1'); } catch (e) {
            console.warn('Failed to set reopenSettings:', e);
          }
          window.location.reload();
        }, 1200);
      } else {
        setFullBackupError(response.data?.message || 'Failed to restore backup');
      }
    } catch (err) {
      try {
        let resp = err.response?.data;
        // If server sent a Blob (common for 500), read and parse it
        if (resp instanceof Blob) {
          const text = await resp.text();
          try { resp = JSON.parse(text); } catch { resp = { message: text }; }
        }
        const details = resp?.last_statement_preview ? ` (line ${resp.error_line}): ${resp.last_statement_preview}` : '';
        setFullBackupError('Failed to restore backup: ' + (resp?.message || err.message) + details);
      } catch (inner) {
        setFullBackupError('Failed to restore backup: ' + err.message);
      }
    } finally {
      setFullBackupLoading(false);
      event.target.value = '';
    }
  };

  const handleFullBackupFileInputClick = () => {
    if (fullBackupFileInputRef) {
      fullBackupFileInputRef.click();
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDebugBackup = async () => {
    try {
      const response = await apiService.debugBackup();
      if (response.data.success) {
        setDebugInfo(response.data.debug_info);
        setFullBackupSuccess('Debug information loaded successfully!');
        // Auto-clear debug info after 10 seconds
        setTimeout(() => {
          setDebugInfo(null);
        }, 10000);
      } else {
        setFullBackupError('Debug failed: ' + response.data.message);
      }
    } catch (err) {
      setFullBackupError('Debug failed: ' + err.message);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo(null);
  };

  // Load backup info when settings modal opens
  useEffect(() => {
    if (showSettingsModal) {
      loadBackupInfo();
    } else {
      // Clear debug info when modal is closed
      setDebugInfo(null);
      setFullBackupError(null);
      setFullBackupSuccess(null);
    }
  }, [showSettingsModal]);

  // Reopen Settings modal after a reload if flagged
  useEffect(() => {
    try {
      const shouldReopen = localStorage.getItem('reopenSettings');
      if (shouldReopen === '1') {
        localStorage.removeItem('reopenSettings');
        setShowSettingsModal(true);
      }
    } catch (e) {
      console.warn('Failed to check reopenSettings:', e);
    }
  }, []);

  // Load logs when settings opens (admin only)
  useEffect(() => {
    if (showSettingsModal && user?.role === 'admin') {
      if (!backupLogs) { loadBackupLogs(); }
      if (!systemLogs) { loadSystemLogs(); }
    }
  }, [showSettingsModal, user?.role, backupLogs, systemLogs]);

  const getNavLinks = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavLinks;
      case 'calibration_engineers':
        return calibrationEngineerNavLinks;
      case 'client':
        return clientNavLinks;
      case 'cashier':
        return cashierNavLinks;
      default:
        // For other roles (if any) or when role is not defined,
        // filter out admin-only links.
        return adminNavLinks.filter(link => link.path !== '/users');
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-gradient-to-b from-[#2a9dab]/20 to-white dark:from-[#2a9dab]/10 dark:to-gray-900 p-6 shadow-lg flex flex-col justify-between h-full overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
            <img src="/dost logo.svg" alt="DOST Logo" className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100 leading-tight">Integrated Calibration</span>
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100 leading-tight">Management System</span>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <div className="text-xs text-gray-400 dark:text-gray-300 mb-2">MAIN</div>
          {navLinks.map(link => (
            link.name === 'Inventory' ? (
              <div
                key={link.path}
                className="relative"
                onMouseEnter={() => setInventoryOpen(true)}
                onMouseLeave={() => setInventoryOpen(false)}
              >
                <Link
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-200 transition ${location.pathname === link.path ? 'bg-white dark:bg-gray-800 text-blue-600 font-bold shadow' : 'hover:bg-white/70 dark:hover:bg-gray-800/70'}`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
                <div
                  className={`ml-8 origin-top-left overflow-hidden transition-all duration-300 ease-in-out
                    ${(inventoryOpen || isInventoryPage)
                      ? 'max-h-96 opacity-100 scale-100 translate-y-0 delay-100'
                      : 'max-h-0 opacity-0 scale-95 -translate-y-2 delay-0'}
                  `}
                  style={{ pointerEvents: (inventoryOpen || isInventoryPage) ? 'auto' : 'none' }}
                >
                  {inventorySubLinks.map((sub, idx) => (
                    <Link
                      key={sub.hash}
                      to={`${link.path}${sub.hash}`}
                      onClick={() => setSelectedTab(sub.hash.replace('#', ''))}
                      className={`block pl-4 py-1 rounded text-sm font-medium transition-all duration-300 ease-in-out
                        ${(inventoryOpen || isInventoryPage)
                          ? 'opacity-100 scale-100 translate-x-0'
                          : 'opacity-0 scale-95 -translate-x-4'}
                        ${location.pathname === link.path && location.hash === sub.hash ? 'bg-[#2a9dab]/10 text-[#2a9dab] font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-[#2a9dab]/5 hover:text-[#2a9dab]'}
                      `}
                      style={{
                        transitionDelay: `${(inventoryOpen || isInventoryPage) ? idx * 60 + 80 : 0}ms`
                      }}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              link.name === 'Requests' ? (
                <div key={link.path} className="relative">
                  <Link
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-200 transition ${location.pathname === link.path ? 'bg-white dark:bg-gray-800 text-blue-600 font-bold shadow' : 'hover:bg-white/70 dark:hover:bg-gray-800/70'}`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                    {pendingCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </div>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-200 transition ${location.pathname === link.path ? 'bg-white dark:bg-gray-800 text-blue-600 font-bold shadow' : 'hover:bg-white/70 dark:hover:bg-gray-800/70'}`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              )
            )
          ))}
        </nav>
      </div>
      <div className="mt-8">
        <div className="flex flex-col gap-2 mb-4">
          <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm hover:underline text-left">
            <RiSettings4Line className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm hover:underline text-left"
          >
            <RiLogoutBoxLine className="w-4 h-4" />
            Logout
          </button>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white/80 dark:bg-gray-800/80">
          <div className="w-8 h-8 aspect-square rounded-full bg-blue-400 flex items-center justify-center text-white font-bold font-sans">
            {getInitials()}
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-200">
              {user?.full_name || `${user?.first_name} ${user?.last_name}` || 'User'}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-300">{user?.email || 'No email'}</div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
      />

      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title=""
        className="w-full max-w-5xl mx-auto"
      >
        <div className="space-y-0">
          {/* Modern Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <RiSettings4Line className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
                <p className="text-base text-gray-500 dark:text-gray-400">Manage your application preferences and system settings</p>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* Documentation Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center shadow-md">
                    <RiBookOpenLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Documentation</h3>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Access the comprehensive user manual and guides</p>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    navigate('/user-manual');
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <RiBookOpenLine className="w-5 h-5" />
                  Open User Manual
                </button>
              </div>

              {/* Email Settings Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 flex items-center justify-center shadow-md">
                    <RiMailLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Email Settings</h3>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Configure email notifications for request status updates</p>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    navigate('/email-settings');
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <RiMailLine className="w-5 h-5" />
                  Configure Email
                </button>
              </div>

              {/* Signatory Management Card - Admin and IT Programmer only */}
              {(user?.role === 'admin' || user?.role === 'it_programmer') && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 flex items-center justify-center shadow-md">
                      <RiUserLine className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Signatory Management</h3>
                  </div>
                  <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">Manage technical managers and calibration engineers for certificates</p>
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      navigate('/signatory-management');
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-2xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <RiUserLine className="w-5 h-5" />
                    Manage Signatories
                  </button>
                </div>
              )}

              {/* Theme Settings Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 flex items-center justify-center shadow-md">
                    <RiPaletteLine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Theme</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">Current: {theme} ({effectiveTheme})</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTheme('light')} 
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      theme === 'light' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-gray-300 shadow-sm"></div>
                      <span className={`text-sm font-semibold ${theme === 'light' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>Light</span>
                    </div>
                    {theme === 'light' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <RiCheckLine className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setTheme('dark')} 
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      theme === 'dark' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-600 shadow-sm"></div>
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>Dark</span>
                    </div>
                    {theme === 'dark' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <RiCheckLine className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setTheme('system')} 
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      theme === 'system' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white to-gray-800 border border-gray-300 shadow-sm"></div>
                      <span className={`text-sm font-semibold ${theme === 'system' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>System</span>
                    </div>
                    {theme === 'system' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <RiCheckLine className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column merged into single column */}
            <div className="space-y-6">
              
              {/* System Backup Card - Admin and IT Programmer only */}
              {(user?.role === 'admin' || user?.role === 'it_programmer') && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 flex items-center justify-center shadow-md">
                    <RiDatabaseLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Backup</h3>
                </div>

                {/* System Information */}
                {backupInfo && (
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-6 shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                        <RiDatabaseLine className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base">Database</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Size:</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{backupInfo.database.size_mb} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Tables:</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{backupInfo.database.total_tables}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-6 shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                        <RiUploadLine className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base">Files</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Count:</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{backupInfo.files.total_files}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Size:</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{formatBytes(backupInfo.files.total_size)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {fullBackupError && (
                  <div className="mb-6 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-4 shadow-md">
                    <RiAlertLine className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <span className="text-red-700 dark:text-red-300 text-base font-medium">{fullBackupError}</span>
                  </div>
                )}

                {fullBackupSuccess && (
                  <div className="mb-6 p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-4 shadow-md">
                    <RiCheckLine className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-green-700 dark:text-green-300 text-base font-medium">{fullBackupSuccess}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={handleCreateFullBackup}
                    disabled={fullBackupLoading}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <RiDownloadLine className="w-5 h-5" />
                    {fullBackupLoading ? 'Creating Backup...' : 'Create Full Backup'}
                  </button>
                  
                  <button 
                    onClick={handleFullBackupFileInputClick}
                    disabled={fullBackupLoading}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <RiUploadLine className="w-5 h-5" />
                    {fullBackupLoading ? 'Restoring...' : 'Restore Full Backup'}
                  </button>
                  
                  <button 
                    onClick={handleDebugBackup}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-2xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <RiInformationLine className="w-5 h-5" />
                    Debug Information
                  </button>
                </div>
                
                <input
                  ref={setFullBackupFileInputRef}
                  type="file"
                  accept=".sql"
                  onChange={handleRestoreFullBackup}
                  className="hidden"
                />

                {/* Debug Information */}
                {debugInfo && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <RiInformationLine className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base">Debug Information</h4>
                      </div>
                      <button
                        onClick={clearDebugInfo}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="Close debug info"
                      >
                        <RiCloseLine className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between">
                          <span>Database Connected:</span>
                          <span className="font-semibold text-green-600">✓</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Tables:</span>
                          <span className="font-semibold">{debugInfo.total_tables}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uploads Dir:</span>
                          <span className="font-semibold">{debugInfo.uploads_dir_exists ? '✓' : '✗'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>File Count:</span>
                          <span className="font-semibold">{debugInfo.file_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>PHP Memory:</span>
                          <span className="font-semibold">{debugInfo.php_memory_limit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>PHP Version:</span>
                          <span className="font-semibold">{debugInfo.php_version}</span>
                        </div>
                      </div>
                      {debugInfo.tables && debugInfo.tables.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <div className="font-medium mb-2 text-gray-700 dark:text-gray-200">Available Tables:</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {debugInfo.tables.slice(0, 5).join(', ')}
                            {debugInfo.tables.length > 5 && ` and ${debugInfo.tables.length - 5} more...`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                </div>
              )}
            </div>
          </div>

          {/* System Logs (Admin only) */}
          {user?.role === 'admin' && (
            <div className="mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 flex items-center justify-center shadow-md">
                    <RiFileList3Line className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Logs</h3>
                </div>
                
                {logsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500 dark:text-gray-300">Loading logs...</div>
                  </div>
                )}
                
                {logsError && (
                  <div className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-4 shadow-md">
                    <RiAlertLine className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <span className="text-red-700 dark:text-red-300 text-base font-medium">{logsError}</span>
                  </div>
                )}
                
                {(backupLogs || systemLogs) && (
                  <div className="space-y-6">
                    <div className="relative">
                      <input
                        value={logsFilter}
                        onChange={(e) => setLogsFilter(e.target.value)}
                        placeholder="Filter by action, user, or text..."
                        className="w-full px-5 py-4 pl-12 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md"
                      />
                      <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl border border-gray-200 dark:border-gray-600 overflow-hidden shadow-lg">
                      <div className="grid grid-cols-12 px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-0">
                        <div className="col-span-3">Time</div>
                        <div className="col-span-3">Action</div>
                        <div className="col-span-2">User</div>
                        <div className="col-span-4">Details</div>
                      </div>
                      <div className="max-h-80 overflow-auto">
                        {mergedLogs()
                          .filter((l) => {
                            if (!logsFilter) return true;
                            const det = typeof l.details === 'string' ? l.details : JSON.stringify(l.details);
                            const text = `${l.action} ${l.user_name ?? ''} ${det ?? ''}`.toLowerCase();
                            return text.includes(logsFilter.toLowerCase());
                          })
                          .map((l, i) => {
                            const det = parseDetails(l.details);
                            return (
                              <div key={i} className="grid grid-cols-12 px-6 py-4 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors">
                                <div className="col-span-3 whitespace-nowrap font-semibold">{formatDateTime(l.created_at)}</div>
                                <div className="col-span-3">
                                  <span className={actionBadge(l.action)}>{displayAction(l.action)}</span>
                                </div>
                                <div className="col-span-2 font-medium">{l.user_name || (l.user_id ? `#${l.user_id}` : '-')}</div>
                                <div className="col-span-4 truncate" title={(() => { const s = typeof det === 'string' ? det : JSON.stringify(det); return s?.replace(/,?\s*client_id:\s*[^,}]+/i, ''); })()}>
                                  {(() => {
                                    if (typeof det === 'string') {
                                      return (det || '').replace(/,?\s*client_id:\s*[^,}]+/i, '');
                                    }
                                    const obj = det || {};
                                    const keys = Object.keys(obj).filter(k => k !== 'client_id').slice(0, 2);
                                    return keys.map(k => `${k}: ${obj[k]}`).join(', ');
                                  })()}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => { setShowSettingsModal(false); navigate('/logs'); }}
                        className="px-6 py-3 text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      >
                        View all logs →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

    </aside>
  );
};

export default Sidebar; 