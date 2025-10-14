import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LogsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemLogs, setSystemLogs] = useState({ logs: [], limit: 200, offset: 0 });
  const [backupLogs, setBackupLogs] = useState({ logs: [], backup_files: [] });
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sys, bck] = await Promise.all([
          apiService.getSystemLogs({ limit: 500, offset: 0 }),
          apiService.getBackupLogs(),
        ]);
        if (sys.data?.success) setSystemLogs(sys.data.data); else setError(sys.data?.message || 'Failed to load system logs');
        if (bck.data?.success) setBackupLogs(bck.data.data || { logs: [], backup_files: [] });
      } catch (e) {
        setError(e.message || 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDateTime = (iso) => {
    if (!iso) return '';
    try { return new Date(iso.replace(' ', 'T')).toLocaleString(); } catch { return iso; }
  };

  const actionBadge = (action) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold';
    const map = {
      'request_create': base + ' bg-blue-100 text-blue-700',
      'calibration_create': base + ' bg-green-100 text-green-700',
      'calibration_update': base + ' bg-emerald-100 text-emerald-700',
      'payment_process': base + ' bg-purple-100 text-purple-700',
      'settings_update': base + ' bg-amber-100 text-amber-700',
      'change_password': base + ' bg-pink-100 text-pink-700',
      'add_user': base + ' bg-indigo-100 text-indigo-700',
      'user_add': base + ' bg-indigo-100 text-indigo-700',
      'report_generate': base + ' bg-orange-100 text-orange-700',
      'backup_export_sql': base + ' bg-cyan-100 text-cyan-700',
      'backup_import_sql': base + ' bg-teal-100 text-teal-700',
      'backup_event': base + ' bg-gray-100 text-gray-700',
    };
    return map[action] || (base + ' bg-gray-100 text-gray-700');
  };

  const displayAction = (action) => {
    if (!action) return '';
    return String(action).replace(/_/g, ' ');
  };

  const parseDetails = (details) => {
    if (!details) return null;
    try { return JSON.parse(details); } catch { return details; }
  };

  const mergedLogs = useMemo(() => {
    const sys = (systemLogs?.logs || []).map(l => ({
      created_at: l.created_at,
      action: l.action,
      user_id: l.user_id,
      user_name: l.user_name,
      details: l.details,
    }));
    const bEvents = (backupLogs?.logs || []).map(e => ({
      created_at: e.time || e.created || '',
      action: 'backup_event',
      user_id: null,
      user_name: null,
      details: e.message || JSON.stringify(e),
    }));
    return [...sys, ...bEvents].sort((a, b) => new Date((b.created_at || '').replace(' ', 'T')) - new Date((a.created_at || '').replace(' ', 'T')));
  }, [systemLogs, backupLogs]);

  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase();
    const sDate = startDate ? new Date(startDate + 'T00:00:00') : null;
    const eDate = endDate ? new Date(endDate + 'T23:59:59') : null;
    const isPrivileged = ['admin', 'it_programmer'].includes(user?.role);

    return mergedLogs.filter(l => {
      // role-based: non-privileged users only see their own actions
      if (!isPrivileged) {
        if (l.user_id && user?.id && Number(l.user_id) !== Number(user.id)) return false;
      }

      // date range filter
      if (sDate || eDate) {
        const d = new Date((l.created_at || '').replace(' ', 'T'));
        if (sDate && d < sDate) return false;
        if (eDate && d > eDate) return false;
      }

      if (!q) return true;
      const det = typeof l.details === 'string' ? l.details : JSON.stringify(l.details);
      return `${l.action} ${l.user_name ?? ''} ${det ?? ''}`.toLowerCase().includes(q);
    });
  }, [mergedLogs, search, startDate, endDate, user]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="p-6 bg-gray-100 h-full">
      <div className="bg-white rounded-lg shadow-lg p-6 relative">
        {/* Close (X) Button */}
        <button
          onClick={handleBack}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg h-8 w-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
          title="Close"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Logs</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
            <input
              type="text"
              placeholder="Filter by action, user, or text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="min-w-full bg-white">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((l, idx) => {
                  const det = parseDetails(l.details);
                  const detailsText = (() => {
                    if (typeof det === 'string') {
                      return (det || '').replace(/,?\s*client_id:\s*[^,}]+/i, '');
                    }
                    const obj = det || {};
                    const keys = Object.keys(obj).filter(k => k !== 'client_id').slice(0, 3);
                    return keys.map(k => `${k}: ${obj[k]}`).join(', ');
                  })();
                  return (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(l.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"><span className={actionBadge(l.action)}>{displayAction(l.action)}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{l.user_name || (l.user_id ? `#${l.user_id}` : '-')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" title={detailsText}>{detailsText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;


