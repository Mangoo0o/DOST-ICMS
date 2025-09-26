import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiSearchLine, RiCloseLine, RiArrowRightLine } from 'react-icons/ri';

const UserManual = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const sections = useMemo(() => ([
    { id: 'system-overview', title: 'System Overview', keywords: ['overview', 'introduction', 'about', 'icms', 'system', 'features', 'capabilities'] },
    { id: 'accessing-settings', title: 'Accessing Settings', keywords: ['open settings', 'modal', 'sidebar', 'access', 'open', 'interface', 'role', 'permissions'] },
    { id: 'theme-settings', title: 'Theme Settings', keywords: ['theme', 'dark', 'light', 'system', 'appearance', 'color', 'customization', 'accessibility'] },
    { id: 'full-system-backup', title: 'Full System Backup & Restore', keywords: ['backup', 'restore', 'sql', 'full', 'database', 'export', 'import', 'admin', 'data protection'] },
    { id: 'system-logs', title: 'System Logs (Admin Only)', keywords: ['logs', 'audit', 'activity', 'admin', 'monitoring', 'tracking', 'security'] },
    { id: 'settings-backup', title: 'Settings Backup & Restore', keywords: ['settings backup', 'export', 'import', 'preferences', 'user settings', 'personalization'] },
    { id: 'crud-workflows', title: 'Data Management Workflows (CRUD)', keywords: ['requests', 'clients', 'calibration', 'inventory', 'transactions', 'reports', 'users', 'create', 'edit', 'delete', 'update', 'management', 'workflow', 'data entry'] },
  ]), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return sections.filter(s => (
      s.title.toLowerCase().includes(q) || s.keywords.some(k => k.includes(q))
    )).map(section => ({
      ...section,
      matchType: section.title.toLowerCase().includes(q) ? 'title' : 'keyword',
      matchedKeyword: section.keywords.find(k => k.includes(q))
    }));
  }, [query, sections]);

  const clearSearch = () => {
    setQuery('');
    searchRef.current?.focus();
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Highlight search terms in text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
  };

  useEffect(() => {
    // Add highlighting to all text content when query changes
    if (query.trim()) {
      const elements = document.querySelectorAll('h2, h3, h4, p, li, span:not(.no-highlight)');
      elements.forEach(el => {
        const originalText = el.textContent;
        const highlightedHTML = highlightText(originalText, query);
        if (highlightedHTML !== originalText) {
          el.innerHTML = highlightedHTML;
        }
      });
    } else {
      // Remove highlighting when search is cleared
      const marks = document.querySelectorAll('mark');
      marks.forEach(mark => {
        mark.outerHTML = mark.innerHTML;
      });
    }
  }, [query]);

  return (
    <div className="p-6 bg-gray-100 h-full overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">User Manual</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8">
          {/* Search */}
          <div className="relative">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search for: backup, requests, theme, logs, clients, calibration, admin..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {query && (isSearchFocused || results.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <RiSearchLine className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No sections match "{query}"</p>
                    <p className="text-xs mt-1">Try different keywords</p>
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-2">
                      Found {results.length} section{results.length !== 1 ? 's' : ''}
                    </div>
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          scrollToSection(result.id);
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                              {result.title}
                            </div>
                            {result.matchType === 'keyword' && result.matchedKeyword && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Matched: <span className="font-medium text-gray-600 dark:text-gray-300">{result.matchedKeyword}</span>
                              </div>
                            )}
                          </div>
                          <RiArrowRightLine className="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* System Overview */}
          <section id="system-overview" className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">System Overview</h2>
            <p className="text-gray-700">
              The Integrated Calibration Management System (ICMS) DOST-PSTO includes a comprehensive settings system that allows users to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Customize appearance</strong> with theme selection</li>
              <li><strong>Backup and restore</strong> system data and user preferences</li>
              <li><strong>Monitor system activity</strong> through logs (admin users)</li>
              <li><strong>Export/import settings</strong> for easy migration or backup</li>
            </ul>
          </section>

          {/* Accessing Settings */}
          <section id="accessing-settings" className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">Accessing Settings</h2>

            <h3 className="text-base font-semibold text-gray-800">How to Open Settings</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li><strong>Log in</strong> to the ICMS system with your credentials</li>
              <li><strong>Look for the Settings option</strong> in the bottom-left corner of the sidebar</li>
              <li><strong>Click on "Settings"</strong> to open the settings modal</li>
              <li>The settings modal will appear with all available options</li>
            </ol>

            <h3 className="text-base font-semibold text-gray-800">Settings Availability</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <ul className="space-y-1 text-sm text-gray-700">
                <li><strong>All Users:</strong> Theme settings, basic backup/restore</li>
                <li><strong>Admin Users:</strong> Full system backup, system logs, advanced settings</li>
                <li><strong>Calibration Engineers:</strong> Theme settings, basic backup</li>
                <li><strong>Clients:</strong> Theme settings only</li>
                <li><strong>Cashiers:</strong> Theme settings, basic backup</li>
              </ul>
            </div>
          </section>

          {/* Theme Settings */}
          <section id="theme-settings" className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Theme Settings</h2>

            <h3 className="text-base font-semibold text-gray-800">Available Themes</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">1. Light Theme</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>Appearance:</strong> Clean, bright interface with light backgrounds</li>
                  <li><strong>Best for:</strong> Daytime use, well-lit environments</li>
                  <li><strong>Colors:</strong> White backgrounds, dark text, blue accents</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">2. Dark Theme</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>Appearance:</strong> Dark interface with dark backgrounds</li>
                  <li><strong>Best for:</strong> Nighttime use, low-light environments</li>
                  <li><strong>Colors:</strong> Dark gray/black backgrounds, light text, blue accents</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">3. System Theme</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>Appearance:</strong> Automatically follows your operating system's theme</li>
                  <li><strong>Best for:</strong> Users who prefer system-wide consistency</li>
                  <li><strong>Behavior:</strong> Changes automatically when you switch your OS theme</li>
                </ul>
              </div>
            </div>

            <h3 className="text-base font-semibold text-gray-800">How to Change Theme</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li><strong>Open Settings</strong> (click "Settings" in sidebar)</li>
              <li><strong>Locate the Theme section</strong> at the top of the settings modal</li>
              <li>
                <strong>Click on your preferred theme:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-gray-700">
                  <li>Click "Light" for light theme</li>
                  <li>Click "Dark" for dark theme</li>
                  <li>Click "System" for automatic theme detection</li>
                </ul>
              </li>
              <li><strong>The change is applied immediately</strong> - no need to save</li>
            </ol>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Theme Persistence</h4>
              <ul className="text-sm text-blue-900 space-y-1">
                <li>Your theme selection is <strong>automatically saved</strong> to your user profile</li>
                <li>The theme will <strong>persist across sessions</strong> and devices</li>
                <li>You can change your theme <strong>at any time</strong> without affecting other users</li>
              </ul>
            </div>
          </section>

          {/* Full System Backup & Restore */}
          <section id="full-system-backup" className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Full System Backup & Restore</h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold">
                ⚠️ Important: Full system backup/restore is available to <strong>admin users only</strong>. This feature affects the entire system and all user data.
              </p>
            </div>

            <h3 className="text-base font-semibold text-gray-800">System Information Display</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Database Size:</strong> Total size of all database tables</li>
              <li><strong>Database Tables:</strong> Number of tables in the system</li>
              <li><strong>File Count:</strong> Number of uploaded files in the system</li>
              <li><strong>Total File Size:</strong> Combined size of all uploaded files</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800">Creating a Full Backup</h3>
            <h4 className="font-semibold text-gray-800">What's Included</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>All database tables</strong> (users, requests, calibrations, transactions, etc.)</li>
              <li><strong>All uploaded files</strong> (reservation attachments, certificates, etc.)</li>
              <li><strong>System configuration</strong> and settings</li>
              <li><strong>Complete data integrity</strong> with foreign key relationships</li>
            </ul>

            <h4 className="font-semibold text-gray-800">How to Create Backup</h4>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li><strong>Open Settings</strong> (admin access required)</li>
              <li><strong>Scroll to "Full System Backup & Restore"</strong> section</li>
              <li><strong>Click "Create Full Backup"</strong> button</li>
              <li><strong>Wait for the process</strong> to complete (may take a few minutes)</li>
              <li><strong>A .sql file will be downloaded</strong> automatically</li>
              <li><strong>Save the file</strong> in a secure location</li>
            </ol>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Backup File Naming</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Format:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded">icms_db_YYYY-MM-DD-HH-MM-SS.sql</code></li>
                <li><strong>Example:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded">icms_db_2024-01-15-14-30-45.sql</code></li>
                <li><strong>Location:</strong> Downloads folder (or chosen location)</li>
              </ul>
            </div>

            <h3 className="text-base font-semibold text-gray-800">Restoring a Full Backup</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">
                ⚠️ Warning: Restoring a backup will <strong>completely replace</strong> all current data. This action cannot be undone.
              </p>
            </div>

            <h4 className="font-semibold text-gray-800">Before Restoring</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Test the backup</strong> on a development environment first</li>
              <li><strong>Ensure you have a current backup</strong> of existing data</li>
              <li><strong>Notify all users</strong> that the system will be temporarily unavailable</li>
              <li><strong>Verify the backup file</strong> is complete and not corrupted</li>
            </ul>

            <h4 className="font-semibold text-gray-800">How to Restore</h4>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li><strong>Open Settings</strong> (admin access required)</li>
              <li><strong>Scroll to "Full System Backup & Restore"</strong> section</li>
              <li><strong>Click "Restore Full Backup"</strong> button</li>
              <li><strong>Select your .sql backup file</strong> from your computer</li>
              <li><strong>Wait for the restoration</strong> to complete</li>
              <li><strong>The system will automatically reload</strong> after successful restoration</li>
            </ol>

            <h4 className="font-semibold text-gray-800">After Restoring</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Verify data integrity</strong> by checking key records</li>
              <li><strong>Test critical functions</strong> (login, requests, calibrations)</li>
              <li><strong>Notify users</strong> that the system is back online</li>
              <li><strong>Check system logs</strong> for any issues</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800">Debug Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Database Connection Status:</strong> Confirms database connectivity</li>
              <li><strong>Table Count:</strong> Number of available database tables</li>
              <li><strong>File System Status:</strong> Uploads directory accessibility</li>
              <li><strong>PHP Configuration:</strong> Memory limits and version information</li>
              <li><strong>System Health:</strong> Overall system status</li>
            </ul>
          </section>

          {/* System Logs */}
          <section id="system-logs" className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">System Logs (Admin Only)</h2>

            <h3 className="text-base font-semibold text-gray-800">What Are System Logs?</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>User Actions:</strong> Logins, logouts, data modifications</li>
              <li><strong>System Events:</strong> Backups, restores, configuration changes</li>
              <li><strong>Error Tracking:</strong> System errors and warnings</li>
              <li><strong>Audit Trail:</strong> Complete record of system usage</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800">Viewing System Logs</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li><strong>Open Settings</strong> (admin access required)</li>
              <li><strong>Scroll to "System Logs"</strong> section</li>
              <li><strong>Logs are automatically loaded</strong> when settings open</li>
              <li><strong>Use the filter box</strong> to search for specific activities</li>
            </ol>

            <h3 className="text-base font-semibold text-gray-800">Log Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Timestamp:</strong> When the action occurred</li>
              <li><strong>Action Type:</strong> What type of action was performed</li>
              <li><strong>User:</strong> Who performed the action</li>
              <li><strong>Details:</strong> Additional information about the action</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800">Log Categories</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li><code className="bg-gray-100 px-2 py-0.5 rounded">request_create</code> - New calibration requests</li>
                <li><code className="bg-gray-100 px-2 py-0.5 rounded">calibration_create</code> - New calibration records</li>
                <li><code className="bg-gray-100 px-2 py-0.5 rounded">calibration_update</code> - Updated calibration records</li>
                <li><code className="bg-gray-100 px-2 py-0.5 rounded">payment_process</code> - Payment processing</li>
              </ul>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li><code className="bg-gray-100 px-2 py-0.5 rounded">settings_update</code> - Settings changes</li>
                <li><code className="bg-gray-100 px-2 py-0.5 rounded">backup_export_sql</code> - Full system backups</li>
                <li><code className="bg-gray-100 px-2 py-0.5 rounded">backup_import_sql</code> - Full system restores</li>
              </ul>
            </div>
          </section>

          {/* Settings Backup & Restore */}
          <section id="settings-backup" className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">Settings Backup & Restore</h2>

            <h3 className="text-base font-semibold text-gray-800">User Settings Backup</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Theme preferences</strong></li>
              <li><strong>User preferences</strong></li>
              <li><strong>Notification settings</strong></li>
              <li><strong>Personal configurations</strong></li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800">Exporting Settings</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li><strong>Open Settings</strong></li>
              <li><strong>Look for "Backup & Restore"</strong> section (if available)</li>
              <li><strong>Click "Export Settings"</strong> button</li>
              <li><strong>A JSON file will be downloaded</strong> with your settings</li>
              <li><strong>Save the file</strong> for future use</li>
            </ol>

            <h3 className="text-base font-semibold text-gray-800">Importing Settings</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li><strong>Open Settings</strong></li>
              <li><strong>Look for "Backup & Restore"</strong> section (if available)</li>
              <li><strong>Click "Import Settings"</strong> button</li>
              <li><strong>Select your previously exported JSON file</strong></li>
              <li><strong>Settings will be restored</strong> immediately</li>
            </ol>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Settings File Format</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Format:</strong> JSON (JavaScript Object Notation)</li>
                <li><strong>Extension:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded">.json</code></li>
                <li><strong>Size:</strong> Typically very small (few KB)</li>
                <li><strong>Security:</strong> Contains only your personal preferences</li>
              </ul>
            </div>
          </section>

          {/* CRUD Workflows */}
          <section id="crud-workflows" className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Data Management Workflows (CRUD)</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Requests (Reservations)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Create Request (Admin/Engineers):</strong> Go to Requests → New Request → fill client and equipment/sample details → attach files if needed → Save to generate Reference Number.</li>
                  <li><strong>Update Request:</strong> Open a request → edit fields (schedule, notes, assignment) → Save.</li>
                  <li><strong>Update Status:</strong> Move Pending → In Progress → Completed/Cancelled via status control in details.</li>
                  <li><strong>Attachments:</strong> Use "With Attachment" to upload PDFs/images (max size depends on server config).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800">Clients</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Register Client:</strong> Open registration page → enter contact and organization details → Submit.</li>
                  <li><strong>Update Client:</strong> Open client record → edit information → Save.</li>
                  <li><strong>View Client Requests:</strong> From client details, open Requests tab to filter their reservations.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800">Calibration Records</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Create Record:</strong> Go to Calibration → select request/equipment/sample → enter measurement data and uncertainties → Save draft or finalize.</li>
                  <li><strong>Generate Certificate:</strong> Open completed record → Generate Certificate to produce PDF (where available).</li>
                  <li><strong>Update Record:</strong> Open record → edit → Save (finalized records may be role-restricted).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800">Inventory</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>View:</strong> Inventory → select tab (Test-Weight, Thermometer, etc.).</li>
                  <li><strong>Add Item:</strong> Add Item → provide identification, status, calibration metadata → Save.</li>
                  <li><strong>Edit Item:</strong> Open item → modify fields → Save.</li>
                  <li><strong>Delete Item:</strong> Use delete action (role-permission required; linked items may be protected).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800">Transactions & Payments</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Create Transaction:</strong> Transactions → select related request(s) or client → add fees → Save.</li>
                  <li><strong>Process Payment:</strong> Open transaction → Process Payment → enter amount and details → Confirm.</li>
                  <li><strong>Discounts:</strong> Use Update Discount (may require specific roles).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800">Reports</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Generate:</strong> Reports → choose type and filters (date range, status, client) → Generate → Export if needed.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800">Users (Admin)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Create User:</strong> User Management → Add User → fill name, email, role (admin, calibration_engineers, client, cashier) → Save.</li>
                  <li><strong>Update User:</strong> Edit details or role → Save.</li>
                  <li><strong>Delete User:</strong> Use delete action as permitted (some users may be protected).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800">Roles & Permissions</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Admin:</strong> Full access including logs and backups.</li>
                  <li><strong>Calibration Engineers:</strong> Calibration and requests.</li>
                  <li><strong>Cashier:</strong> Transactions and payments.</li>
                  <li><strong>Client:</strong> Submit front reservations and view status.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800">Tips</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Always save changes and wait for success confirmation.</li>
                  <li>Use filters and search boxes to quickly locate records.</li>
                  <li>Check system logs (admin) for auditing and troubleshooting.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting" className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Troubleshooting</h2>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-1">Settings Modal Won't Open</h4>
                <p className="text-sm text-gray-600 mb-2">Problem: Clicking "Settings" doesn't open the modal</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Refresh the page and try again</li>
                  <li>Check if you're logged in properly</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Try a different browser</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-1">Theme Changes Not Applied</h4>
                <p className="text-sm text-gray-600 mb-2">Problem: Theme selection doesn't change the appearance</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Wait a few seconds for the change to apply</li>
                  <li>Refresh the page</li>
                  <li>Check if your browser supports the theme system</li>
                  <li>Try logging out and back in</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-1">Backup Creation Fails</h4>
                <p className="text-sm text-gray-600 mb-2">Problem: "Create Full Backup" button doesn't work</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Ensure you have admin privileges</li>
                  <li>Check your internet connection</li>
                  <li>Wait for any ongoing operations to complete</li>
                  <li>Use the debug feature to check system status</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-1">Restore Process Fails</h4>
                <p className="text-sm text-gray-600 mb-2">Problem: Backup restoration doesn't work</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Verify the backup file is complete and not corrupted</li>
                  <li>Check that the file is a valid .sql file</li>
                  <li>Ensure sufficient disk space is available</li>
                  <li>Try a different backup file</li>
                </ul>
              </div>
            </div>

            <h3 className="text-base font-semibold text-gray-800">Error Messages</h3>
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-1">"Database connection failed"</h4>
                <ul className="text-sm text-red-900 space-y-1">
                  <li>Check if the database server is running</li>
                  <li>Verify database credentials</li>
                  <li>Contact system administrator</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-1">"Forbidden: Admins only"</h4>
                <ul className="text-sm text-red-900 space-y-1">
                  <li>You don't have admin privileges</li>
                  <li>Contact your administrator for access</li>
                  <li>Use basic settings features only</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-1">"Invalid backup format"</h4>
                <ul className="text-sm text-red-900 space-y-1">
                  <li>The backup file is corrupted or invalid</li>
                  <li>Try downloading a new backup</li>
                  <li>Ensure the file is a valid .sql file</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section id="best-practices" className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Best Practices</h2>

            <h3 className="text-base font-semibold text-gray-800">For All Users</h3>
            <h4 className="font-semibold text-gray-800">Theme Selection</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Choose based on environment:</strong> Light for bright rooms, dark for dim lighting</li>
              <li><strong>Consider eye strain:</strong> Switch themes if you experience discomfort</li>
              <li><strong>Use system theme</strong> for automatic adaptation</li>
            </ul>

            <h4 className="font-semibold text-gray-800">Regular Settings Backup</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Export settings monthly</strong> to avoid losing preferences</li>
              <li><strong>Store backup files securely</strong> in multiple locations</li>
              <li><strong>Test restore process</strong> occasionally to ensure backups work</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800">For Admin Users</h3>
            <h4 className="font-semibold text-gray-800">Backup Strategy</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Create full backups weekly</strong> or before major changes</li>
              <li><strong>Test restore process</strong> on development environment first</li>
              <li><strong>Store backups securely</strong> with proper access controls</li>
              <li><strong>Document backup procedures</strong> for team members</li>
            </ul>

            <h4 className="font-semibold text-gray-800">System Monitoring</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Check system logs regularly</strong> for unusual activity</li>
              <li><strong>Monitor backup success</strong> and system health</li>
              <li><strong>Review user activity</strong> for security purposes</li>
              <li><strong>Document any issues</strong> for technical support</li>
            </ul>

            <h4 className="font-semibold text-gray-800">Before Major Changes</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Create full backup</strong> before system updates</li>
              <li><strong>Notify all users</strong> of planned maintenance</li>
              <li><strong>Test changes</strong> in development environment first</li>
              <li><strong>Have rollback plan</strong> ready</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800">Security Considerations</h3>
            <h4 className="font-semibold text-gray-800">Backup Security</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Encrypt backup files</strong> when storing long-term</li>
              <li><strong>Limit access</strong> to backup files</li>
              <li><strong>Regularly rotate</strong> backup storage locations</li>
              <li><strong>Verify backup integrity</strong> periodically</li>
            </ul>

            <h4 className="font-semibold text-gray-800">Access Control</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Use strong passwords</strong> for admin accounts</li>
              <li><strong>Limit admin privileges</strong> to necessary personnel</li>
              <li><strong>Monitor admin activities</strong> through system logs</li>
              <li><strong>Regularly review</strong> user permissions</li>
            </ul>
          </section>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 italic">
              This manual covers the ICMS Settings system. For other system features, please refer to the main ICMS documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
