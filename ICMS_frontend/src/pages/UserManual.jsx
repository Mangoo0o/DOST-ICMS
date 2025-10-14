import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiSearchLine, RiCloseLine, RiArrowRightSLine } from 'react-icons/ri';

const UserManual = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentView, setCurrentView] = useState('categories'); // 'categories', 'sections', 'content', 'subsection'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSubsection, setSelectedSubsection] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  const categories = useMemo(() => [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      sections: [
        { 
          id: 'system-overview', 
          title: 'System Overview',
          subsections: [
            { id: 'system-overview-intro', title: 'Introduction' },
            { id: 'system-overview-features', title: 'Key Features' }
          ]
        },
        { 
          id: 'accessing-settings', 
          title: 'Accessing Settings',
          subsections: [
            { id: 'accessing-settings-how', title: 'How to Open Settings' },
            { id: 'accessing-settings-roles', title: 'Availability by Role' }
          ]
        },
        { 
          id: 'change-password', 
          title: 'Change Password',
          subsections: [
            { id: 'change-password-overview', title: 'Password Management Overview' },
            { id: 'change-password-how', title: 'How to Change Password' },
            { id: 'change-password-requirements', title: 'Password Requirements' },
            { id: 'change-password-security', title: 'Security Features' }
          ]
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance & Personalization',
      icon: '🎨',
      sections: [
        { 
          id: 'theme-settings', 
          title: 'Theme Settings',
          subsections: [
            { id: 'theme-settings-available', title: 'Available Themes' },
            { id: 'theme-settings-change', title: 'How to Change Theme' },
            { id: 'theme-settings-persistence', title: 'Theme Persistence' }
          ]
        },
        { 
          id: 'email-configuration', 
          title: 'Email Configuration',
          subsections: [
            { id: 'email-config-overview', title: 'Overview' },
            { id: 'email-config-access', title: 'Accessing Email Settings' },
            { id: 'email-config-interface', title: 'Configuration Interface' },
            { id: 'email-config-gmail', title: 'Gmail Setup Guide' },
            { id: 'email-config-testing', title: 'Testing Email Configuration' },
            { id: 'email-config-troubleshooting', title: 'Troubleshooting' }
          ]
        },
        { 
          id: 'settings-backup', 
          title: 'Settings Backup & Restore',
          subsections: [
            { id: 'settings-backup-what', title: 'What Gets Backed Up' },
            { id: 'settings-backup-export', title: 'Exporting Settings' },
            { id: 'settings-backup-import', title: 'Importing Settings' }
          ]
        }
      ]
    },
    {
      id: 'data-management',
      title: 'Data Management',
      icon: '📊',
      sections: [
        { 
          id: 'crud-workflows', 
          title: 'Data Management Workflows',
          subsections: [
            { id: 'crud-workflows-operations', title: 'Available CRUD Operations' },
            { id: 'crud-workflows-requests', title: 'Requests Management' },
            { id: 'crud-workflows-clients', title: 'Client Management' },
            { id: 'crud-workflows-calibration', title: 'Calibration Records' },
            { id: 'crud-workflows-inventory', title: 'Inventory Management' },
            { id: 'crud-workflows-transactions', title: 'Transaction Management' },
            { id: 'crud-workflows-reports', title: 'Report Generation' },
            { id: 'crud-workflows-users', title: 'User Management' },
            { id: 'crud-workflows-access', title: 'Access Requirements' }
          ]
        }
      ]
    },
    {
      id: 'system-administration',
      title: 'System Administration',
      icon: '⚙️',
      sections: [
        { 
          id: 'full-system-backup', 
          title: 'Full System Backup & Restore',
          subsections: [
            { id: 'full-backup-included', title: 'What\'s Included in Full Backup' },
            { id: 'full-backup-creating', title: 'Creating a Full Backup' },
            { id: 'full-backup-restoring', title: 'Restoring from Backup' }
          ]
        },
        { 
          id: 'system-logs', 
          title: 'System Logs',
          subsections: [
            { id: 'system-logs-what', title: 'What Are System Logs?' },
            { id: 'system-logs-viewing', title: 'Viewing System Logs' },
            { id: 'system-logs-info', title: 'Log Information' },
            { id: 'system-logs-categories', title: 'Log Categories' }
          ]
        },
        { 
          id: 'email-notifications', 
          title: 'Email Notifications',
          subsections: [
            { id: 'email-notifications-overview', title: 'Email System Overview' },
            { id: 'email-notifications-setup', title: 'Setting Up Email Notifications' },
            { id: 'email-notifications-types', title: 'Types of Email Notifications' },
            { id: 'email-notifications-testing', title: 'Testing Email Configuration' }
          ]
        },
        { 
          id: 'sample-management', 
          title: 'Sample Pricing Management',
          subsections: [
            { id: 'sample-management-overview', title: 'Sample Management Overview' },
            { id: 'sample-management-pricing', title: 'Managing Sample Pricing' },
            { id: 'sample-management-categories', title: 'Sample Categories' }
          ]
        },
        { 
          id: 'signatory-management', 
          title: 'Signatory Management',
          subsections: [
            { id: 'signatory-management-overview', title: 'Signatory Management Overview' },
            { id: 'signatory-management-roles', title: 'Signatory Roles' },
            { id: 'signatory-management-certificates', title: 'Certificate Generation' }
          ]
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting & Support',
      icon: '🔧',
      sections: [
        { 
          id: 'troubleshooting', 
          title: 'Troubleshooting',
          subsections: [
            { id: 'troubleshooting-common', title: 'Common Issues' },
            { id: 'troubleshooting-errors', title: 'Error Messages' }
          ]
        },
        { 
          id: 'best-practices', 
          title: 'Best Practices',
          subsections: [
            { id: 'best-practices-all', title: 'For All Users' },
            { id: 'best-practices-admin', title: 'For Admin Users' },
            { id: 'best-practices-security', title: 'Security Considerations' }
          ]
        }
      ]
    }
  ], []);

  // Create comprehensive search index with all sections and subsections
  const searchIndex = useMemo(() => {
    const index = [];
    
    categories.forEach(category => {
      category.sections.forEach(section => {
        // Add main sections
        index.push({
          id: section.id,
          title: section.title,
          category: category.title,
          type: 'section',
          keywords: getSectionKeywords(section.id)
        });
        
        // Add subsections
        section.subsections.forEach(subsection => {
          index.push({
            id: subsection.id,
            title: subsection.title,
            category: category.title,
            section: section.title,
            type: 'subsection',
            keywords: getSubsectionKeywords(subsection.id)
          });
        });
      });
    });
    
    return index;
  }, [categories]);

  function getSectionKeywords(sectionId) {
    const keywordMap = {
      'system-overview': ['overview', 'introduction', 'about', 'icms', 'system', 'features', 'capabilities'],
      'accessing-settings': ['open settings', 'modal', 'sidebar', 'access', 'open', 'interface', 'role', 'permissions'],
      'theme-settings': ['theme', 'dark', 'light', 'system', 'appearance', 'color', 'customization', 'accessibility'],
      'settings-backup': ['settings backup', 'export', 'import', 'preferences', 'user settings', 'personalization'],
      'crud-workflows': ['requests', 'clients', 'calibration', 'inventory', 'transactions', 'reports', 'users', 'create', 'edit', 'delete', 'update', 'management', 'workflow', 'data entry'],
      'full-system-backup': ['backup', 'restore', 'sql', 'full', 'database', 'export', 'import', 'admin', 'data protection'],
      'system-logs': ['logs', 'audit', 'activity', 'admin', 'monitoring', 'tracking', 'security'],
      'troubleshooting': ['troubleshooting', 'problems', 'issues', 'errors', 'fix', 'help', 'support', 'debug'],
      'best-practices': ['best practices', 'tips', 'recommendations', 'guidelines', 'security', 'performance', 'maintenance']
    };
    return keywordMap[sectionId] || [];
  }

  function getSubsectionKeywords(subsectionId) {
    const keywordMap = {
      // System Overview
      'system-overview-intro': ['introduction', 'overview', 'about', 'icms', 'system'],
      'system-overview-features': ['features', 'capabilities', 'functionality', 'tools'],
      
      // Accessing Settings
      'accessing-settings-how': ['how to open', 'open settings', 'access settings', 'settings modal'],
      'accessing-settings-roles': ['roles', 'permissions', 'admin', 'user', 'access control'],
      
      // Change Password
      'change-password-overview': ['password management', 'change password', 'password overview', 'password system'],
      'change-password-how': ['how to change password', 'change password steps', 'password change process', 'update password'],
      'change-password-requirements': ['password requirements', 'password rules', 'password criteria', 'password validation'],
      'change-password-security': ['password security', 'security features', 'password protection', 'security measures'],
      
      // Theme Settings
      'theme-settings-available': ['available themes', 'theme options', 'dark theme', 'light theme'],
      'theme-settings-change': ['change theme', 'switch theme', 'theme selection'],
      'theme-settings-persistence': ['theme persistence', 'save theme', 'remember theme'],
      
      // Email Configuration
      'email-config-overview': ['email overview', 'email system', 'email notifications', 'email features'],
      'email-config-access': ['access email settings', 'email configuration', 'email setup'],
      'email-config-interface': ['email interface', 'smtp configuration', 'email settings'],
      'email-config-gmail': ['gmail setup', 'gmail configuration', 'gmail smtp', 'app password'],
      'email-config-testing': ['test email', 'email testing', 'test configuration'],
      'email-config-troubleshooting': ['email troubleshooting', 'email problems', 'email errors'],
      
      // Settings Backup
      'settings-backup-what': ['what gets backed up', 'backup content', 'settings data'],
      'settings-backup-export': ['export settings', 'download settings', 'save settings'],
      'settings-backup-import': ['import settings', 'upload settings', 'restore settings'],
      
      // CRUD Workflows
      'crud-workflows-operations': ['crud operations', 'create', 'read', 'update', 'delete'],
      'crud-workflows-requests': ['requests management', 'add request', 'edit request', 'delete request'],
      'crud-workflows-clients': ['client management', 'register client', 'update client', 'client info'],
      'crud-workflows-calibration': ['calibration records', 'calibration management', 'certificates'],
      'crud-workflows-inventory': ['inventory management', 'equipment', 'samples', 'inventory'],
      'crud-workflows-transactions': ['transaction management', 'payments', 'billing', 'financial'],
      'crud-workflows-reports': ['report generation', 'reports', 'analytics', 'statistics'],
      'crud-workflows-users': ['user management', 'create user', 'user roles', 'permissions'],
      'crud-workflows-access': ['access requirements', 'permissions', 'role requirements'],
      
      // Full System Backup
      'full-backup-included': ['backup content', 'whats included', 'full backup'],
      'full-backup-creating': ['creating backup', 'generate backup', 'backup process'],
      'full-backup-restoring': ['restore backup', 'restore from backup', 'recovery'],
      
      // System Logs
      'system-logs-what': ['what are logs', 'log information', 'audit logs'],
      'system-logs-viewing': ['viewing logs', 'access logs', 'log viewer'],
      'system-logs-info': ['log information', 'log details', 'log data'],
      'system-logs-categories': ['log categories', 'types of logs', 'log types'],
      
      // Email Notifications
      'email-notifications-overview': ['email system', 'email notifications', 'email features'],
      'email-notifications-setup': ['email setup', 'configure email', 'smtp settings'],
      'email-notifications-types': ['email types', 'notification types', 'email templates'],
      'email-notifications-testing': ['test email', 'email testing', 'verify email'],
      
      // Sample Management
      'sample-management-overview': ['sample management', 'pricing management', 'sample pricing'],
      'sample-management-pricing': ['manage pricing', 'set prices', 'pricing configuration'],
      'sample-management-categories': ['sample categories', 'equipment types', 'calibration types'],
      
      // Signatory Management
      'signatory-management-overview': ['signatory management', 'certificate signatories', 'signatory system'],
      'signatory-management-roles': ['signatory roles', 'certificate roles', 'signatory types'],
      'signatory-management-certificates': ['certificate generation', 'print certificates', 'certificate management'],
      
      // Troubleshooting
      'troubleshooting-common': ['common issues', 'frequent problems', 'troubleshooting'],
      'troubleshooting-errors': ['error messages', 'error handling', 'debugging'],
      
      // Best Practices
      'best-practices-all': ['best practices', 'tips', 'recommendations', 'guidelines'],
      'best-practices-admin': ['admin best practices', 'administrator tips', 'admin guidelines'],
      'best-practices-security': ['security', 'security practices', 'security tips']
    };
    return keywordMap[subsectionId] || [];
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    
    // Split query into individual words
    const queryWords = q.split(/\s+/).filter(word => word.length > 0);
    
    const filtered = searchIndex.filter(item => {
      const title = item.title.toLowerCase();
      const category = item.category.toLowerCase();
      const section = item.section ? item.section.toLowerCase() : '';
      const allKeywords = item.keywords.join(' ').toLowerCase();
      
      // Check if ALL query words are found in any of the fields
      return queryWords.every(word => 
        title.includes(word) || 
        category.includes(word) ||
        section.includes(word) ||
        allKeywords.includes(word)
      );
    }).map(item => {
      let score = 0;
      let matchType = 'keyword';
      
      const title = item.title.toLowerCase();
      const category = item.category.toLowerCase();
      const section = item.section ? item.section.toLowerCase() : '';
      const allKeywords = item.keywords.join(' ').toLowerCase();
      
      // Score based on word matches (higher score = more relevant)
      queryWords.forEach(word => {
        if (title.includes(word)) {
          score += 100;
          matchType = 'title';
        }
        if (category.includes(word)) {
          score += 50;
          if (matchType === 'keyword') matchType = 'category';
        }
        if (section.includes(word)) {
          score += 30;
          if (matchType === 'keyword') matchType = 'section';
        }
        if (allKeywords.includes(word)) {
          score += 10;
          if (matchType === 'keyword') matchType = 'keyword';
        }
      });
      
      // Bonus for exact word matches
      queryWords.forEach(word => {
        if (title === word) score += 200;
        if (category === word) score += 100;
        if (section === word) score += 150;
      });
      
      return {
        ...item,
        matchType,
        score
      };
    });
    
    // Sort by score (highest first), then by title
    return filtered.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.title.localeCompare(b.title);
    });
  }, [query, searchIndex]);

  const clearSearch = () => {
    setQuery('');
    searchRef.current?.focus();
  };

  const addToRecentSearches = (searchTerm) => {
    if (!searchTerm.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(term => term !== searchTerm);
      return [searchTerm, ...filtered].slice(0, 5); // Keep only 5 recent searches
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      addToRecentSearches(query.trim());
    }
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    // Split query into words and create regex for each word
    const queryWords = query.trim().split(/\s+/).filter(word => word.length > 0);
    let highlightedText = text;
    
    // Highlight each word separately
    queryWords.forEach(word => {
      const regex = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    // Convert to JSX elements
    const parts = highlightedText.split(/(<mark[^>]*>.*?<\/mark>)/);
    return parts.map((part, index) => {
      if (part.startsWith('<mark')) {
        const match = part.match(/<mark[^>]*>(.*?)<\/mark>/);
        return match ? (
          <mark key={index} className="bg-yellow-200 px-1 rounded">{match[1]}</mark>
        ) : part;
      }
      return part;
    });
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentView('sections');
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setCurrentView('content');
  };

  const handleSubsectionClick = (subsection) => {
    setSelectedSubsection(subsection);
    setCurrentView('subsection');
  };

  const handleBack = () => {
    if (currentView === 'subsection') {
      setCurrentView('content');
      setSelectedSubsection(null);
    } else if (currentView === 'content') {
      setCurrentView('sections');
      setSelectedSection(null);
    } else if (currentView === 'sections') {
      setCurrentView('categories');
      setSelectedCategory(null);
    }
  };

  const scrollToSection = (itemId) => {
    // Find the item in categories and navigate to it
    for (const category of categories) {
      for (const section of category.sections) {
        // Check if it's a main section
        if (section.id === itemId) {
          setSelectedCategory(category);
          setSelectedSection(section);
          setCurrentView('content');
          setQuery(''); // Clear search
          return;
        }
        
        // Check if it's a subsection
        const subsection = section.subsections.find(s => s.id === itemId);
        if (subsection) {
          setSelectedCategory(category);
          setSelectedSection(section);
          setSelectedSubsection(subsection);
          setCurrentView('subsection');
          setQuery(''); // Clear search
          return;
        }
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 h-full overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">User Manual</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-white bg-teal-500 hover:bg-teal-600 text-lg w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>


        {/* Main Content */}
        <div className="w-full">
          {/* Header with Back Button */}
          {currentView !== 'categories' && (
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#2a9dab]/90 transition-colors font-medium"
              >
                <RiArrowRightSLine className="w-5 h-5 rotate-180" />
                <span className="font-medium">Back</span>
              </button>
              <h2 className="text-xl font-semibold text-gray-800">
                {currentView === 'sections' ? selectedCategory?.title : 
                 currentView === 'content' ? selectedSection?.title : 
                 selectedSubsection?.title}
              </h2>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search user manual..."
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                {query ? (
                  results.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                    <RiSearchLine className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No results match "{query}"</p>
                    <p className="text-xs mt-1">Try different keywords</p>
                  </div>
                ) : (
                  <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Found {results.length} result{results.length !== 1 ? 's' : ''}
                    </div>
                      {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          scrollToSection(result.id);
                            addToRecentSearches(query);
                          setIsSearchFocused(false);
                        }}
                          className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="font-medium text-gray-800">
                            {highlightText(result.title, query)}
                            </div>
                          <div className="text-sm text-gray-600">
                            {result.type === 'subsection' ? 
                              `${highlightText(result.category, query)} → ${highlightText(result.section, query)}` : 
                              highlightText(result.category, query)
                            }
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {result.matchType === 'title' ? 'Title match' : 
                             result.matchType === 'category' ? 'Category match' :
                             result.matchType === 'section' ? 'Section match' : 'Keyword match'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ) : recentSearches.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                      Recent Searches
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(search);
                          addToRecentSearches(search);
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <RiSearchLine className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{search}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
                              </div>
                            )}
            </form>
                          </div>

          {/* Content based on current view */}
          {currentView === 'categories' && (
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium text-gray-800 group-hover:text-gray-600 transition-colors">
                      {category.title}
                    </span>
                        </div>
                  <RiArrowRightSLine className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

          {currentView === 'sections' && selectedCategory && (
            <div className="space-y-2">
              {selectedCategory.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="font-medium text-gray-800 group-hover:text-gray-600 transition-colors">
                    {section.title}
                  </span>
                  <RiArrowRightSLine className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              ))}
              </div>
            )}

          {currentView === 'content' && selectedSection && (
            <div className="space-y-2">
              {selectedSection.subsections.map((subsection) => (
                <button
                  key={subsection.id}
                  onClick={() => handleSubsectionClick(subsection)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="font-medium text-gray-800 group-hover:text-gray-600 transition-colors">
                    {subsection.title}
                  </span>
                  <RiArrowRightSLine className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              ))}
          </div>
          )}

          {currentView === 'subsection' && selectedSubsection && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{selectedSubsection.title}</h3>
              <div className="text-gray-600">
                {/* System Overview Subsections */}
                {selectedSubsection.id === 'system-overview-intro' && (
                  <div>
                    <p className="mb-4">
                      The Integrated Calibration Management System (ICMS) DOST-PSTO is a comprehensive web-based application designed for managing calibration services, equipment inventory, client requests, and financial transactions. The system includes a robust settings framework that provides:
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Core Features</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>Multi-role User Management:</strong> Admin, Calibration Engineers, Cashiers, and Clients</li>
                      <li><strong>Equipment & Sample Management:</strong> Test weights, thermometers, and other calibration equipment</li>
                      <li><strong>Request & Reservation System:</strong> Client booking and scheduling</li>
                      <li><strong>Calibration Records:</strong> Digital certificates and measurement tracking</li>
                      <li><strong>Financial Management:</strong> Transactions, payments, and invoicing</li>
                      <li><strong>Inventory Control:</strong> Equipment status and maintenance tracking</li>
                      <li><strong>Reporting System:</strong> Comprehensive analytics and documentation</li>
            </ul>
                    <h4 className="font-semibold text-gray-800 mb-2">Settings System Capabilities</h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Personalization:</strong> Theme selection and user preferences</li>
                      <li><strong>Data Protection:</strong> Full system backup and restore functionality</li>
                      <li><strong>Audit Trail:</strong> Comprehensive logging and monitoring</li>
                      <li><strong>Configuration Management:</strong> System-wide and user-specific settings</li>
                      <li><strong>Security Controls:</strong> Role-based access and permission management</li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-600">
                      The settings system is designed to be intuitive for end-users while providing powerful administrative capabilities for system maintenance and data protection.
                    </p>
                  </div>
                )}
                {selectedSubsection.id === 'system-overview-features' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Features</h4>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">User Management</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Multi-role user system</li>
                          <li>Role-based access control</li>
                          <li>User profile management</li>
                          <li>Permission management</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Data Management</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>CRUD operations for all modules</li>
                          <li>Data validation and integrity</li>
                          <li>Audit trail and logging</li>
                          <li>Backup and restore capabilities</li>
                        </ul>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">System Modules</h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Requests Management:</strong> Client booking and scheduling system</li>
                      <li><strong>Calibration Records:</strong> Digital certificates and measurement tracking</li>
                      <li><strong>Inventory Control:</strong> Equipment status and maintenance tracking</li>
                      <li><strong>Financial Management:</strong> Transactions, payments, and invoicing</li>
                      <li><strong>Reporting System:</strong> Comprehensive analytics and documentation</li>
                    </ul>
                  </div>
                )}

                {/* Accessing Settings Subsections */}
                {selectedSubsection.id === 'accessing-settings-how' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How to Open Settings</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
              <li><strong>Log in</strong> to the ICMS system with your credentials</li>
                      <li><strong>Navigate to the sidebar</strong> on the left side of the screen</li>
              <li><strong>Look for the Settings option</strong> in the bottom-left corner of the sidebar</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img 
                          src="/1.png" 
                          alt="Settings location in sidebar" 
                          className="w-full max-w-md mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          The Settings option is located in the bottom-left corner of the sidebar, below the main navigation items
                        </p>
                      </div>
              <li><strong>Click on "Settings"</strong> to open the settings modal</li>
                      <li>The settings modal will appear with all available options based on your role</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img 
                          src="/2.png" 
                          alt="Settings modal interface" 
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          The Settings modal displays available options based on your user role, including Documentation and Email Settings
                        </p>
                      </div>
            </ol>
                    <h4 className="font-semibold text-gray-800 mb-2">Settings Interface Overview</h4>
                    <p className="mb-2">The settings modal is organized into several sections:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Header:</strong> Contains the modal title and close button</li>
                      <li><strong>Theme Settings:</strong> Personal appearance customization</li>
                      <li><strong>System Information:</strong> Database and file system statistics (admin only)</li>
                      <li><strong>Backup & Restore:</strong> Data protection options</li>
                      <li><strong>System Logs:</strong> Activity monitoring (admin only)</li>
                      <li><strong>User Manual:</strong> Quick access to this documentation</li>
                    </ul>
                  </div>
                )}
                {selectedSubsection.id === 'accessing-settings-roles' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Role-Based Access Control</h4>
                    <p className="mb-4">Settings availability varies by user role:</p>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Admin Users</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>✅ <strong>Full System Backup & Restore:</strong> Complete database and file system backup</li>
                          <li>✅ <strong>System Logs:</strong> View all system activity and audit trails</li>
                          <li>✅ <strong>Settings Backup & Restore:</strong> Export/import user preferences</li>
                          <li>✅ <strong>Theme Settings:</strong> All theme options</li>
                          <li>✅ <strong>Debug Information:</strong> System diagnostics and health checks</li>
              </ul>
            </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Calibration Engineers</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>✅ <strong>Theme Settings:</strong> Personal appearance customization</li>
                          <li>✅ <strong>Settings Backup & Restore:</strong> Personal preferences only</li>
                          <li>❌ <strong>System Logs:</strong> No access to system monitoring</li>
                          <li>❌ <strong>Full System Backup:</strong> No access to system-wide backups</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">Cashiers</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>✅ <strong>Theme Settings:</strong> Personal appearance customization</li>
                          <li>✅ <strong>Settings Backup & Restore:</strong> Personal preferences only</li>
                          <li>❌ <strong>System Logs:</strong> No access to system monitoring</li>
                          <li>❌ <strong>Full System Backup:</strong> No access to system-wide backups</li>
                </ul>
              </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Clients</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>✅ <strong>Theme Settings:</strong> Personal appearance customization</li>
                          <li>❌ <strong>Settings Backup & Restore:</strong> No access to settings management</li>
                          <li>❌ <strong>System Logs:</strong> No access to system monitoring</li>
                          <li>❌ <strong>Full System Backup:</strong> No access to system-wide backups</li>
                </ul>
              </div>
                    </div>
                  </div>
                )}

                {/* Settings Backup Subsections */}
                {selectedSubsection.id === 'settings-backup-what' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What Gets Backed Up</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>Theme preferences</strong> and appearance settings</li>
                      <li><strong>User preferences</strong> and customizations</li>
                      <li><strong>Notification settings</strong> and alerts</li>
                      <li><strong>Personal configurations</strong> and saved preferences</li>
                    </ul>
                  </div>
                )}
                {selectedSubsection.id === 'settings-backup-export' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Exporting Settings</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Open Settings</strong> from the main navigation</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/1.png"
                          alt="Settings location in sidebar"
                          className="w-full max-w-md mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          The Settings option is located in the bottom-left corner of the sidebar, below the main navigation items
                        </p>
                      </div>
                      <li><strong>Look for "Backup & Restore"</strong> section</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/4.png"
                          alt="Backup & Restore section in settings"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          The Backup & Restore section contains export and import options for your settings
                        </p>
                      </div>
                      <li><strong>Click "Export Settings"</strong> button</li>
                      <li><strong>A SQL file will be downloaded</strong> with your settings</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/5.png"
                          alt="SQL file download confirmation"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          A SQL file containing your settings will be automatically downloaded to your device
                        </p>
                      </div>
                      <li><strong>Save the file</strong> for future use</li>
                    </ol>
                  </div>
                )}
                {selectedSubsection.id === 'settings-backup-import' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Importing Settings</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Open Settings</strong> from the main navigation</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/1.png"
                          alt="Settings location in sidebar"
                          className="w-full max-w-md mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          The Settings option is located in the bottom-left corner of the sidebar, below the main navigation items
                        </p>
                      </div>
                      <li><strong>Look for "Backup & Restore"</strong> section</li>
                      <li><strong>Click "Import Settings"</strong> button</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/4.png"
                          alt="Backup & Restore section in settings"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          The Backup & Restore section contains export and import options for your settings
                        </p>
                      </div>
                      <li><strong>Select your previously exported SQL file</strong></li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/6.png"
                          alt="File selection dialog for SQL import"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Select your previously exported SQL file from the file selection dialog
                        </p>
                      </div>
                      <li><strong>Settings will be restored</strong> immediately</li>
                    </ol>
                  </div>
                )}

                {/* Change Password Subsections */}
                {selectedSubsection.id === 'change-password-overview' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Password Management Overview</h4>
                    <p className="mb-4">
                      The ICMS system includes a comprehensive password management system that allows all users to securely change their passwords. The system enforces strong password requirements and includes security features to protect user accounts.
                    </p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Key Features</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>Secure Password Change:</strong> Change passwords with current password verification</li>
                      <li><strong>Strong Password Requirements:</strong> Enforced minimum security standards</li>
                      <li><strong>Automatic Logout:</strong> Security logout after password change</li>
                      <li><strong>Real-time Validation:</strong> Immediate feedback on password strength</li>
                      <li><strong>Confirmation Dialog:</strong> Double confirmation before password change</li>
                      <li><strong>Role-based Access:</strong> Available to all user roles</li>
                    </ul>

                    <h4 className="font-semibold text-gray-800 mb-2">Access Requirements</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Who Can Change Passwords</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>All Users:</strong> Admin, Calibration Engineers, Cashiers, and Clients</li>
                        <li><strong>Self-Service:</strong> Users can only change their own passwords</li>
                        <li><strong>No Admin Override:</strong> Even admins must know current password</li>
                        <li><strong>Secure Process:</strong> Requires current password verification</li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Security Benefits</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Account Protection</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Prevents unauthorized access</li>
                          <li>Regular password updates</li>
                          <li>Strong password enforcement</li>
                          <li>Secure password storage</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">System Security</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Automatic logout after change</li>
                          <li>Session invalidation</li>
                          <li>Audit trail logging</li>
                          <li>Confirmation requirements</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'change-password-how' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How to Change Your Password</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Step-by-Step Process</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Access Password Change:</strong> Click the settings on the side bar
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/1.png" 
                            alt="Settings location in sidebar" 
                            className="w-full max-w-md mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            The Settings option is located in the sidebar for accessing password change functionality
                          </p>
                        </div>
                      </li>
                      <li><strong>Click "Change Password":</strong> This opens the password change modal
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/49.png" 
                            alt="Change Password button in settings" 
                            className="w-full max-w-md mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Click the "Change Password" button to open the password change modal
                          </p>
                        </div>
                      </li>
                      <li><strong>Enter Current Password:</strong> Type your current password for verification
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/50.png" 
                            alt="Enter current password field" 
                            className="w-full max-w-md mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Enter your current password in the first field for verification
                          </p>
                        </div>
                      </li>
                      <li><strong>Enter New Password:</strong> Create a new password meeting all requirements
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/51.png" 
                            alt="Enter new password field" 
                            className="w-full max-w-md mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Create a new password that meets all the security requirements
                          </p>
                        </div>
                      </li>
                      <li><strong>Confirm New Password:</strong> Re-enter the new password to confirm
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/52.png" 
                            alt="Confirm new password field" 
                            className="w-full max-w-md mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Re-enter the new password in the confirmation field
                          </p>
                        </div>
                      </li>
                      <li><strong>Click "Update Password":</strong> Submit the password change request
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/53.png" 
                            alt="Update Password button" 
                            className="w-full max-w-md mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Click "Update Password" to submit your password change request
                          </p>
                        </div>
                      </li>
                      <li><strong>Confirm Change:</strong> Click "Confirm" in the confirmation dialog
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/54.png" 
                            alt="Confirmation dialog" 
                            className="w-full max-w-md mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Confirm the password change in the confirmation dialog
                          </p>
                        </div>
                      </li>
                      <li><strong>Automatic Logout:</strong> You will be logged out and redirected to login</li>
                    </ol>

                    <h4 className="font-semibold text-gray-800 mb-2">Password Change Interface</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Form Fields</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Current Password:</strong> Your existing password for verification</li>
                        <li><strong>New Password:</strong> The new password you want to set</li>
                        <li><strong>Confirm Password:</strong> Re-enter the new password</li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">What Happens After Password Change</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h5 className="font-semibold text-green-800 mb-1">Success Process</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Success message displayed</li>
                          <li>Automatic logout after 1.5 seconds</li>
                          <li>Redirect to login page</li>
                          <li>Must login with new password</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <h5 className="font-semibold text-yellow-800 mb-1">Security Measures</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>All active sessions are terminated</li>
                          <li>Must re-authenticate with new password</li>
                          <li>Previous sessions become invalid</li>
                          <li>Password change is logged in system</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'change-password-requirements' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Password Requirements</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Minimum Password Requirements</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-red-800 mb-2">Required Criteria</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Minimum Length:</strong> At least 8 characters</li>
                        <li><strong>Alphabetic Characters:</strong> Must include at least one letter (A-Z or a-z)</li>
                        <li><strong>Numeric Characters:</strong> Must include at least one number (0-9)</li>
                        <li><strong>Special Characters:</strong> Must include at least one special character (!@#$%^&*)</li>
                        <li><strong>Different from Current:</strong> Cannot be the same as current password</li>
                        <li><strong>Confirmation Match:</strong> New password and confirmation must match</li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Password Validation</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="font-semibold text-blue-800 mb-1">Real-time Validation</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Immediate feedback as you type</li>
                          <li>Error messages for each requirement</li>
                          <li>Visual indicators for password strength</li>
                          <li>Prevents submission until all requirements met</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h5 className="font-semibold text-green-800 mb-1">Example Valid Passwords</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><code>MyPass123!</code> - Contains letter, number, special character</li>
                          <li><code>Secure2024@</code> - Meets all requirements</li>
                          <li><code>Admin#2024</code> - Strong password example</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <h5 className="font-semibold text-red-800 mb-1">Example Invalid Passwords</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><code>password</code> - No numbers or special characters</li>
                          <li><code>12345678</code> - No letters or special characters</li>
                          <li><code>Pass123</code> - Too short (less than 8 characters)</li>
                          <li><code>MyPassword</code> - No numbers or special characters</li>
                        </ul>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Error Messages</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">Common Validation Errors</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>"New password must be at least 8 characters"</strong> - Length requirement</li>
                        <li><strong>"New password must include at least one alphabet"</strong> - Letter requirement</li>
                        <li><strong>"New password must include at least one numeric character"</strong> - Number requirement</li>
                        <li><strong>"New password must include at least one special character"</strong> - Special character requirement</li>
                        <li><strong>"New password and confirmation do not match"</strong> - Confirmation mismatch</li>
                        <li><strong>"New password must be different from current password"</strong> - Same as current</li>
                        <li><strong>"Please fill out all password fields"</strong> - Missing fields</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'change-password-security' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Security Features</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Built-in Security Measures</h4>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Authentication Security</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Current Password Verification:</strong> Must know current password to change</li>
                          <li><strong>Session Validation:</strong> Validates user session before allowing change</li>
                          <li><strong>Role Verification:</strong> Ensures user has permission to change password</li>
                          <li><strong>Secure Transmission:</strong> All password data encrypted in transit</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Post-Change Security</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Automatic Logout:</strong> All sessions terminated after password change</li>
                          <li><strong>Session Invalidation:</strong> Previous sessions become invalid</li>
                          <li><strong>Re-authentication Required:</strong> Must login with new password</li>
                          <li><strong>Audit Logging:</strong> Password change events are logged</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Confirmation Process</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Double Confirmation:</strong> Two-step confirmation process</li>
                          <li><strong>Clear Warning:</strong> Warns about automatic logout</li>
                          <li><strong>Cancel Option:</strong> Can cancel at any time</li>
                          <li><strong>Loading States:</strong> Visual feedback during processing</li>
                        </ul>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Best Practices</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Password Creation</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Use unique passwords for ICMS</li>
                          <li>Combine letters, numbers, and symbols</li>
                          <li>Avoid common words or patterns</li>
                          <li>Make passwords memorable but secure</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Security Maintenance</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Change passwords regularly</li>
                          <li>Don't share passwords with others</li>
                          <li>Log out when finished</li>
                          <li>Report suspicious activity</li>
                        </ul>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Troubleshooting</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">Common Issues</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Forgot Current Password:</strong> Contact system administrator for reset</li>
                        <li><strong>Password Not Accepted:</strong> Check all requirements are met</li>
                        <li><strong>Confirmation Mismatch:</strong> Ensure both password fields match exactly</li>
                        <li><strong>Session Expired:</strong> Refresh page and try again</li>
                        <li><strong>Network Issues:</strong> Check internet connection and try again</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Theme Settings Subsections */}
                {selectedSubsection.id === 'theme-settings-available' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Available Themes</h4>
                    <p className="mb-4">The ICMS system supports three comprehensive theme options designed for different user preferences and working environments:</p>
                    
                    <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2">1. Light Theme</h5>
                        <ul className="list-disc list-inside text-sm space-y-1 mb-2">
                          <li><strong>Appearance:</strong> Clean, bright interface with light backgrounds and high contrast</li>
                          <li><strong>Color Scheme:</strong> White backgrounds (#FFFFFF), Light gray (#F8F9FA), Dark text (#212529), Blue accents (#0D6EFD)</li>
                          <li><strong>Best for:</strong> Daytime use, well-lit environments, high contrast preference, professional office settings</li>
                </ul>
              </div>
                      
                      <div className="bg-gray-800 text-white border border-gray-600 rounded-lg p-4">
                        <h5 className="font-semibold text-white mb-2">2. Dark Theme</h5>
                        <ul className="list-disc list-inside text-sm space-y-1 mb-2">
                          <li><strong>Appearance:</strong> Modern dark interface with reduced eye strain</li>
                          <li><strong>Color Scheme:</strong> Dark gray backgrounds (#212529), Darker gray (#343A40), Light text (#F8F9FA), Blue accents (#0D6EFD)</li>
                          <li><strong>Best for:</strong> Nighttime use, low-light environments, reduced screen brightness, extended work sessions</li>
                        </ul>
            </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">3. System Theme</h5>
                        <ul className="list-disc list-inside text-sm space-y-1 mb-2">
                          <li><strong>Appearance:</strong> Automatically follows your operating system's theme preference</li>
                          <li><strong>Behavior:</strong> Detects OS theme changes in real-time, switches between light and dark based on system settings</li>
                          <li><strong>Best for:</strong> System-wide consistency, multi-application workflows, automatic adaptation to time of day</li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <img 
                          src="/3.png" 
                          alt="Theme selection interface in settings" 
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Theme selection interface showing Light (selected), Dark, and System theme options with visual previews
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedSubsection.id === 'theme-settings-change' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How to Change Theme</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Open Settings</strong> by clicking "Settings" in the sidebar</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/1.png"
                          alt="Settings location in sidebar"
                          className="w-full max-w-md mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          The Settings option is located in the bottom-left corner of the sidebar, below the main navigation items
                        </p>
                      </div>
              <li><strong>Locate the Theme section</strong> at the top of the settings modal</li>
                      <li><strong>Select your preferred theme:</strong>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                          <li>Click <strong>"Light"</strong> for the light theme</li>
                          <li>Click <strong>"Dark"</strong> for the dark theme</li>
                          <li>Click <strong>"System"</strong> for automatic theme detection</li>
                </ul>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/3.png" 
                            alt="Theme selection interface in settings" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Theme selection interface showing Light (selected), Dark, and System theme options with visual previews
                          </p>
                        </div>
              </li>
                      <li><strong>The change is applied immediately</strong> - no save button required</li>
                      <li><strong>Verify the change</strong> by checking the interface appearance</li>
            </ol>

                    <h4 className="font-semibold text-gray-800 mb-2">Visual Elements Affected</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Background Colors:</strong> Main content areas, sidebars, and modals</li>
                      <li><strong>Text Colors:</strong> Headers, body text, and labels</li>
                      <li><strong>Button Styles:</strong> Primary, secondary, and action buttons</li>
                      <li><strong>Form Elements:</strong> Input fields, dropdowns, and checkboxes</li>
                      <li><strong>Navigation:</strong> Sidebar, menu items, and breadcrumbs</li>
                      <li><strong>Tables:</strong> Headers, rows, and borders</li>
                      <li><strong>Cards and Panels:</strong> Content containers and information boxes</li>
              </ul>
            </div>
                )}
                {selectedSubsection.id === 'theme-settings-persistence' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Theme Persistence and Synchronization</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>Automatic Saving:</strong> Your theme selection is saved immediately to your user profile</li>
                      <li><strong>Cross-Device Sync:</strong> Theme preference syncs across all devices when logged in</li>
                      <li><strong>Session Persistence:</strong> Theme remains active across browser sessions</li>
                      <li><strong>Individual Settings:</strong> Each user can have their own theme preference</li>
                      <li><strong>No System Impact:</strong> Theme changes don't affect other users or system functionality</li>
                    </ul>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Accessibility Features</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>High Contrast:</strong> Ensures text readability in all themes</li>
                      <li><strong>Consistent Focus States:</strong> Clear visual indicators for keyboard navigation</li>
                      <li><strong>Color Blindness Support:</strong> Uses patterns and shapes alongside colors</li>
                      <li><strong>Scalable Text:</strong> All themes support browser zoom and text scaling</li>
            </ul>

                    <h4 className="font-semibold text-gray-800 mb-2">Troubleshooting Theme Issues</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Theme Not Applying:</strong> Refresh the page or clear browser cache</li>
                      <li><strong>Inconsistent Appearance:</strong> Check if browser extensions are interfering</li>
                      <li><strong>System Theme Not Working:</strong> Ensure your OS supports theme detection</li>
                      <li><strong>Partial Theme Application:</strong> Try logging out and back in</li>
            </ul>
            </div>
                )}

                {/* Email Configuration Subsections */}
                {selectedSubsection.id === 'email-config-overview' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Email System Overview</h4>
                    <p className="mb-4">
                      The ICMS system includes a comprehensive email notification system that automatically sends emails to clients when their calibration requests are completed or when request statuses change.
                    </p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Email System Features</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>Automatic Notifications:</strong> Sends emails immediately when request status changes</li>
                      <li><strong>Completion Notifications:</strong> Special emails when requests are completed</li>
                      <li><strong>Professional Templates:</strong> HTML and text email templates with DOST-PSTO branding</li>
                      <li><strong>Test Functionality:</strong> Built-in email testing capabilities</li>
                      <li><strong>Error Handling:</strong> Graceful error handling with logging</li>
                      <li><strong>SMTP Integration:</strong> Uses industry-standard SMTP for reliable delivery</li>
                    </ul>

                    <h4 className="font-semibold text-gray-800 mb-2">Email Types</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Request Completion Email</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Triggered when request is marked "completed"</li>
                          <li>Includes reference number and completion date</li>
                          <li>Contains sample information and payment details</li>
                          <li>Professional DOST-PSTO branding</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Status Update Email</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Triggered when request status changes</li>
                          <li>Shows current status and timeline</li>
                          <li>Includes reference number</li>
                          <li>Contact information for questions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'email-config-access' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Accessing Email Settings</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Log in</strong> to the ICMS system with admin credentials</li>
                      <li><strong>Navigate to Settings</strong> by clicking "Settings" in the sidebar
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/1.png" 
                            alt="Settings location in sidebar" 
                            className="w-full max-w-md mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Look for "Email Settings"</strong> section in the settings modal
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/55.png" 
                            alt="Email Settings section in settings modal" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Click "Configure Email"</strong> to open the email configuration interface
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/56.png" 
                            alt="Email configuration interface" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                    </ol>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-blue-800 mb-2">⚠️ Admin Access Required</h5>
                      <p className="text-blue-700 text-sm">
                        Only users with admin privileges can configure email settings. If you don't see the email configuration options, contact your system administrator.
                      </p>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Settings Interface Overview</h4>
                    <p className="mb-2">The email configuration interface includes:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Enable Email Notifications:</strong> Toggle to enable/disable the system</li>
                      <li><strong>SMTP Username:</strong> Your email account for authentication</li>
                      <li><strong>SMTP Password:</strong> App password for secure authentication</li>
                      <li><strong>Test Email:</strong> Send test emails to verify configuration</li>
                    </ul>
                  </div>
                )}

                {selectedSubsection.id === 'email-config-interface' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Email Configuration Interface</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Enable Email Notifications</h4>
                    <ul className="list-disc list-inside space-y-1 mb-4 text-sm">
                      <li><strong>Toggle Switch:</strong> Enable/disable email notifications system-wide</li>
                      <li><strong>Default:</strong> Enabled (recommended)</li>
                      <li><strong>Effect:</strong> When enabled, system sends automatic emails; when disabled, no emails are sent</li>
                    </ul>

                    <h4 className="font-semibold text-gray-800 mb-2">SMTP Configuration</h4>
                    <p className="mb-2">The system uses SMTP (Simple Mail Transfer Protocol) to send emails. You need to configure:</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">SMTP Username</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Purpose:</strong> Your email account username for SMTP authentication</li>
                          <li><strong>Format:</strong> Usually your full email address (e.g., yourname@gmail.com)</li>
                          <li><strong>Important:</strong> This email address will also be used as the sender email</li>
                          <li><strong>Example:</strong> crtpatongan@gmail.com</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">SMTP Password</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Purpose:</strong> Password for SMTP authentication</li>
                          <li><strong>Security:</strong> Use App Password for Gmail (not your regular password)</li>
                          <li><strong>Format:</strong> App-specific password generated by your email provider</li>
                          <li><strong>Example:</strong> abcd efgh ijkl mnop (Gmail App Password)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">🔒 Security Note</h5>
                      <p className="text-yellow-700 text-sm">
                        Never use your regular email password for SMTP. Always use App Passwords for security. The system automatically uses your SMTP username as the sender email address.
                      </p>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'email-config-gmail' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Gmail Configuration Guide</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Prerequisites</h4>
                    <ol className="list-decimal list-inside space-y-1 mb-4 text-sm">
                      <li><strong>Gmail Account:</strong> You need a Gmail account</li>
                      <li><strong>2-Factor Authentication:</strong> Must be enabled on your Google account</li>
                      <li><strong>App Password:</strong> Generate a specific app password for ICMS</li>
                    </ol>

                    <h4 className="font-semibold text-gray-800 mb-2">Step-by-Step Gmail Setup</h4>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Step 1: Enable 2-Factor Authentication</h5>
                    <ol className="list-decimal list-inside space-y-1 mb-4 text-sm">
                      <li><strong>Go to Google Account Settings:</strong> <a href="https://myaccount.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://myaccount.google.com/</a>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/57.png" 
                            alt="Google Account Settings page" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Navigate to Security</strong> section
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/58.png" 
                            alt="Security section in Google Account" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Enable 2-Step Verification</strong> if not already enabled
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/59.png" 
                            alt="2-Step Verification setup" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Follow the setup process</strong> to secure your account</li>
                    </ol>

                    <h5 className="font-semibold text-gray-700 mb-2">Step 2: Generate App Password</h5>
                    <ol className="list-decimal list-inside space-y-1 mb-4 text-sm">
                      <li><strong>In Google Account Settings,</strong> go to <strong>Security</strong>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/58.png" 
                            alt="Security section in Google Account" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Find "2-Step Verification"</strong> section
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/59.png" 
                            alt="2-Step Verification section" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Click "App passwords"</strong> (you may need to sign in again)
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/61.png" 
                            alt="App passwords option" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Select "Mail"</strong> as the app type
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/62.png" 
                            alt="Select Mail app type" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Choose "Other"</strong> and enter "ICMS" as the device name
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/63.png" 
                            alt="Enter ICMS as device name" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Click "Create"</strong>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/71.png" 
                            alt="Generate app password" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Copy the 16-character password</strong> (e.g., abcd efgh ijkl mnop)
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/64.png" 
                            alt="Copy 16-character password" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Save this password securely</strong> - you won't be able to see it again
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/65.png" 
                            alt="Save password securely" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                    </ol>

                    <h5 className="font-semibold text-gray-700 mb-2">Step 3: Configure ICMS Email Settings</h5>
                    <ol className="list-decimal list-inside space-y-1 mb-4 text-sm">
                      <li><strong>Open ICMS Email Settings</strong>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/56.png" 
                            alt="ICMS Email Settings interface" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Enter SMTP Username:</strong> Your Gmail address (e.g., crtpatongan@gmail.com)
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/67.png" 
                            alt="Enter SMTP Username" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Enter SMTP Password:</strong> The App Password you generated (e.g., abcd efgh ijkl mnop)
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/68.png" 
                            alt="Enter SMTP Password" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Click "Save Settings"</strong>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/69.png" 
                            alt="Save Settings button" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Test the configuration</strong> using the test email feature
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/70.png" 
                            alt="Test email configuration" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                    </ol>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">✅ Success Indicators</h5>
                      <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                        <li>Settings save without errors</li>
                        <li>Test email is received successfully</li>
                        <li>Emails appear as "ICMS &lt;your-gmail@gmail.com&gt;"</li>
                        <li>No authentication errors in system logs</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'email-config-testing' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Testing Email Configuration</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Test Email Feature</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>In Email Settings,</strong> scroll to "Test Email Configuration"
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/72.png" 
                            alt="Test Email Configuration section" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Enter Test Email Address:</strong> Use your own email or a test address
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/70.png" 
                            alt="Enter test email address" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Enter Test Name</strong> (optional): Name to display in the test email
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/73.png" 
                            alt="Enter test name" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Click "Send Test Email"</strong>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/74.png" 
                            alt="Send test email button" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Check your inbox</strong> (and spam folder) for the test email
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/75.png" 
                            alt="Check inbox for test email" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                    </ol>

                    <h4 className="font-semibold text-gray-800 mb-2">What to Expect</h4>
                    <ul className="list-disc list-inside space-y-1 mb-4 text-sm">
                      <li><strong>Test Email Subject:</strong> "ICMS Test Email"</li>
                      <li><strong>Sender:</strong> "ICMS &lt;your-smtp-username@domain.com&gt;"</li>
                      <li><strong>Content:</strong> Professional HTML email with system information</li>
                      <li><strong>Delivery Time:</strong> Usually within 1-2 minutes</li>
                    </ul>

                    <h4 className="font-semibold text-gray-800 mb-2">Troubleshooting Test Emails</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Common Issues</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Not Received:</strong> Check spam/junk folder</li>
                          <li><strong>Error Message:</strong> Verify SMTP credentials</li>
                          <li><strong>Delivery Delay:</strong> Wait a few minutes, check server status</li>
                          <li><strong>Authentication Failed:</strong> Verify App Password is correct</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Error Messages</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>"Invalid SMTP credentials":</strong> Double-check username and password</li>
                          <li><strong>"SMTP server not responding":</strong> Check internet connectivity</li>
                          <li><strong>"Email notifications disabled":</strong> Enable notifications in settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'email-config-troubleshooting' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Troubleshooting Email Issues</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Common Problems and Solutions</h4>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">"SMTP Authentication Failed"</h5>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm mb-2"><strong>Problem:</strong> Cannot authenticate with email server</p>
                      <p className="text-red-700 text-sm"><strong>Solutions:</strong></p>
                      <ul className="list-disc list-inside text-red-700 text-sm space-y-1 ml-4">
                        <li>Verify SMTP username is correct (usually your email address)</li>
                        <li>Check that App Password is correct (not regular password)</li>
                        <li>Ensure 2-factor authentication is enabled</li>
                        <li>Try generating a new App Password</li>
                      </ul>
                    </div>

                    <h5 className="font-semibold text-gray-700 mb-2">"Connection Timeout"</h5>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm mb-2"><strong>Problem:</strong> Cannot connect to SMTP server</p>
                      <p className="text-red-700 text-sm"><strong>Solutions:</strong></p>
                      <ul className="list-disc list-inside text-red-700 text-sm space-y-1 ml-4">
                        <li>Check internet connection</li>
                        <li>Verify SMTP host and port settings</li>
                        <li>Check firewall settings</li>
                        <li>Try different SMTP port (587 or 465)</li>
                      </ul>
                    </div>

                    <h5 className="font-semibold text-gray-700 mb-2">"Emails Not Being Received"</h5>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm mb-2"><strong>Problem:</strong> Emails sent but not delivered</p>
                      <p className="text-red-700 text-sm"><strong>Solutions:</strong></p>
                      <ul className="list-disc list-inside text-red-700 text-sm space-y-1 ml-4">
                        <li>Check recipient's spam/junk folder</li>
                        <li>Verify recipient email address is correct</li>
                        <li>Check sender reputation and domain</li>
                        <li>Monitor email server logs</li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Best Practices</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Security</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Use App Passwords:</strong> Never use regular email passwords</li>
                          <li><strong>Regular Updates:</strong> Update App Passwords periodically</li>
                          <li><strong>Access Control:</strong> Limit email configuration access to admins</li>
                          <li><strong>Monitor Usage:</strong> Regularly check email sending logs</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Maintenance</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Test Regularly:</strong> Use test email feature monthly</li>
                          <li><strong>Monitor Delivery:</strong> Check for failed email deliveries</li>
                          <li><strong>Backup Settings:</strong> Document email configuration</li>
                          <li><strong>Password Rotation:</strong> Change App Passwords every 6 months</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Notifications Subsections */}
                {selectedSubsection.id === 'email-notifications-overview' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Email Notifications System Overview</h4>
                    <p className="mb-4">
                      The ICMS Email Notification System provides automatic email notifications to clients when their calibration requests are completed or when request status changes. The system is designed to be configurable, reliable, and easy to use.
                    </p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Key Features</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>Automatic Notifications:</strong> Sends emails immediately when request status changes</li>
                      <li><strong>Completion Notifications:</strong> Special emails when requests are completed</li>
                      <li><strong>Configurable Settings:</strong> Full SMTP configuration through frontend interface</li>
                      <li><strong>Test Functionality:</strong> Built-in email testing capabilities</li>
                      <li><strong>Professional Templates:</strong> HTML and text email templates</li>
                      <li><strong>Error Handling:</strong> Graceful error handling with logging</li>
                    </ul>

                    <h4 className="font-semibold text-gray-800 mb-2">Email Types</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Request Notifications</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Request Creation Confirmation</li>
                          <li>Request Status Updates</li>
                          <li>Request Completion</li>
                          <li>Calibration Start Notifications</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">System Notifications</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Test Email Verification</li>
                          <li>System Status Updates</li>
                          <li>Error Notifications</li>
                          <li>Maintenance Alerts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'email-notifications-setup' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Setting Up Email Notifications</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Access Email Settings</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Navigate to Settings:</strong> Click the Settings icon in the sidebar</li>
                      <li><strong>Find Email Settings:</strong> Look for the "Email Settings" card
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/1.png" 
                            alt="Settings location in sidebar" 
                            className="w-full max-w-md mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Click "Configure Email":</strong> This opens the email configuration page
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/56.png" 
                            alt="Email Settings section in settings modal" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Configure SMTP Settings:</strong> Enter your email provider details
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/83.png" 
                            alt="Email configuration interface" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                    </ol>

                    <h4 className="font-semibold text-gray-800 mb-2">SMTP Configuration</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Required Settings</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Enable Email Notifications:</strong> Toggle ON to activate the system</li>
                        <li><strong>SMTP Host:</strong> Your email provider's SMTP server (e.g., smtp.gmail.com)</li>
                        <li><strong>SMTP Port:</strong> Usually 587 for TLS or 465 for SSL</li>
                        <li><strong>SMTP Username:</strong> Your email address</li>
                        <li><strong>SMTP Password:</strong> Your email password or App Password</li>
                        <li><strong>From Email:</strong> The email address to send from</li>
                        <li><strong>From Name:</strong> The display name for emails</li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Gmail Setup Example</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Gmail Configuration</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>SMTP Host:</strong> smtp.gmail.com</li>
                        <li><strong>SMTP Port:</strong> 587</li>
                        <li><strong>Security:</strong> TLS</li>
                        <li><strong>Username:</strong> your-email@gmail.com</li>
                        <li><strong>Password:</strong> Use App Password (not regular password)</li>
                        <li><strong>From Email:</strong> your-email@gmail.com</li>
                        <li><strong>From Name:</strong> ICMS DOST-PSTO</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'email-notifications-types' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Types of Email Notifications</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Request Creation Email</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-blue-800 mb-2">When Sent</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>When a client submits a new calibration request</li>
                        <li>When an admin creates a request on behalf of a client</li>
                        <li>Immediately after successful request submission</li>
                      </ul>
                      <h5 className="font-semibold text-blue-800 mb-2 mt-3">Content Includes</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Request reference number</li>
                        <li>Client information</li>
                        <li>Equipment details</li>
                        <li>Scheduled dates</li>
                        <li>Current status</li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Calibration Completion Email</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-green-800 mb-2">When Sent</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>When all samples in a request are completed</li>
                        <li>When individual calibrations are finished (for multi-sample requests)</li>
                        <li>When request status changes to "completed"</li>
                      </ul>
                      <h5 className="font-semibold text-green-800 mb-2 mt-3">Content Includes</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Completion confirmation</li>
                        <li>Certificate availability</li>
                        <li>Equipment details</li>
                        <li>Completion date</li>
                        <li>Next steps information</li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Status Update Emails</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">Status Changes</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Pending → In Progress:</strong> When calibration work begins</li>
                        <li><strong>In Progress → Completed:</strong> When calibration is finished</li>
                        <li><strong>Any → Cancelled:</strong> When request is cancelled</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'email-notifications-testing' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Testing Email Configuration</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Test Email Feature</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>In Email Settings,</strong> scroll to "Test Email Configuration"
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/72.png" 
                            alt="Test Email Configuration section" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Enter Test Email Address:</strong> Use your own email or a test address
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/70.png" 
                            alt="Enter test email address" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Enter Test Name</strong> (optional): Name to display in the test email
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/73.png" 
                            alt="Enter test name" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Click "Send Test Email"</strong>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/74.png" 
                            alt="Send Test Email button" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Check your inbox</strong> (and spam folder) for the test email
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/75.png" 
                            alt="Check inbox for test email" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                    </ol>

                    <h4 className="font-semibold text-gray-800 mb-2">What to Expect</h4>
                    <ul className="list-disc list-inside space-y-1 mb-4 text-sm">
                      <li><strong>Test Email Subject:</strong> "ICMS Test Email"</li>
                      <li><strong>Sender:</strong> "ICMS &lt;your-smtp-username@domain.com&gt;"</li>
                      <li><strong>Content:</strong> Professional HTML email with system information</li>
                      <li><strong>Delivery Time:</strong> Usually within 1-2 minutes</li>
                    </ul>

                    <h4 className="font-semibold text-gray-800 mb-2">Verification Checklist</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">✅ Success Indicators</h5>
                      <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                        <li>Settings save without errors</li>
                        <li>Test email is received successfully</li>
                        <li>Emails appear as "ICMS &lt;your-gmail@gmail.com&gt;"</li>
                        <li>No authentication errors in system logs</li>
                        <li>Request notifications are sent automatically</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Sample Management Subsections */}
                {selectedSubsection.id === 'sample-management-overview' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Sample Pricing Management Overview</h4>
                    <p className="mb-4">
                      The Sample Pricing Management system allows administrators to configure and manage pricing for different types of calibration services and equipment. This system provides centralized control over service pricing and ensures consistency across all requests.
                    </p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Key Features</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>Centralized Pricing:</strong> Manage all calibration service prices from one location</li>
                      <li><strong>Category Management:</strong> Organize pricing by equipment type and specifications</li>
                      <li><strong>Dynamic Pricing:</strong> Automatic price calculation based on equipment specifications</li>
                      <li><strong>Active/Inactive Status:</strong> Enable or disable pricing options</li>
                      <li><strong>Bulk Management:</strong> Add, edit, or remove multiple pricing entries</li>
                      <li><strong>Real-time Updates:</strong> Changes apply immediately to new requests</li>
                    </ul>

                    <h4 className="font-semibold text-gray-800 mb-2">Access Requirements</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Who Can Access</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Admin Users:</strong> Full access to all pricing management features</li>
                        <li><strong>IT Programmers:</strong> Full access for system maintenance</li>
                        <li><strong>Other Roles:</strong> No access to pricing management</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'sample-management-pricing' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Managing Sample Pricing</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Adding New Pricing</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Access Sample Management:</strong> Navigate to Settings and click on Sample Management
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/1.png"
                            alt="Access Sample Management"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Navigate to Settings and click on Sample Management
                          </p>
                        </div>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/91.png"
                            alt="Sample Management interface"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Sample Management interface with pricing options
                          </p>
                        </div>
                      </li>
                      <li><strong>Click "Add New Pricing":</strong> Click the button to open the pricing form
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/92.png"
                            alt="Click Add New Pricing button"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Click the "Add New Pricing" button to open the pricing form
                          </p>
                        </div>
                      </li>
                      <li><strong>Select Section:</strong> Choose equipment category from the dropdown
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/93.png"
                            alt="Select equipment section"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Choose equipment category (Weighing Scale, Thermometer, etc.)
                          </p>
                        </div>
                      </li>
                      <li><strong>Enter Sample Type:</strong> Specify the exact equipment type
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/94.png"
                            alt="Enter sample type"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Specify the exact equipment type in the sample type field
                          </p>
                        </div>
                      </li>
                      <li><strong>Set Specifications/Range:</strong> Define the equipment specifications
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/95.png"
                            alt="Set specifications and range"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Define the equipment specifications and range
                          </p>
                        </div>
                      </li>
                      <li><strong>Set Price:</strong> Enter the calibration fee in Philippine Peso
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/96.png"
                            alt="Set pricing amount"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Enter the calibration fee in Philippine Peso
                          </p>
                        </div>
                      </li>
                      <li><strong>Set Status:</strong> Mark as Active or Inactive
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/97.png"
                            alt="Set pricing status"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Mark the pricing entry as Active or Inactive
                          </p>
                        </div>
                      </li>
                      <li><strong>Save Pricing:</strong> Click Save to add the pricing entry
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/98.png"
                            alt="Save pricing entry"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Click Save to confirm and add the pricing entry
                          </p>
                        </div>
                      </li>
                    </ol>

                    <h4 className="font-semibold text-gray-800 mb-2">Editing Existing Pricing</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Select Category:</strong> Click on the equipment category to view pricing entries
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/99.png"
                            alt="Select equipment category"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Click on the equipment category to view existing pricing entries
                          </p>
                        </div>
                      </li>
                      <li><strong>Find Pricing Entry:</strong> Locate the specific pricing item you want to edit
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/100.png"
                            alt="Find pricing entry to edit"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Locate the specific pricing item you want to edit
                          </p>
                        </div>
                      </li>
                      <li><strong>Click Edit:</strong> Use the edit button for the pricing entry
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/103.png"
                            alt="Click edit button"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Click the edit button for the pricing entry you want to modify
                          </p>
                        </div>
                      </li>
                      <li><strong>Modify Details:</strong> Update any pricing information in the form
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/101.png"
                            alt="Modify pricing details"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Update any pricing information in the edit form
                          </p>
                        </div>
                      </li>
                      <li><strong>Save Changes:</strong> Confirm the updates to save the changes
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/102.png"
                            alt="Save pricing changes"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Click Save to confirm and apply the pricing changes
                          </p>
                        </div>
                      </li>
                    </ol>

                    <h4 className="font-semibold text-gray-800 mb-2">Pricing Categories</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Equipment Types</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Weighing Scale</li>
                          <li>Test-Weights</li>
                          <li>Thermometer</li>
                          <li>Sphygmomanometer</li>
                          <li>Thermohygrometer</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Pricing Features</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Base pricing per equipment</li>
                          <li>Specification-based pricing</li>
                          <li>Quantity multipliers</li>
                          <li>Active/Inactive status</li>
                          <li>Real-time price calculation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'sample-management-categories' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Sample Categories and Equipment Types</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Available Equipment Categories</h4>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Weighing Scale</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Digital weighing scales</li>
                          <li>Analytical balances</li>
                          <li>Platform scales</li>
                          <li>Bench scales</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Test-Weights</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>OIML Class F2 weights</li>
                          <li>ASTM Class 4 weights</li>
                          <li>Custom weight sets</li>
                          <li>Individual test weights</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">Thermometer</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Digital thermometers</li>
                          <li>Mercury thermometers</li>
                          <li>Infrared thermometers</li>
                          <li>Thermocouples</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Sphygmomanometer</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Digital blood pressure monitors</li>
                          <li>Mercury sphygmomanometers</li>
                          <li>Aneroid sphygmomanometers</li>
                          <li>Automatic BP monitors</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">Thermohygrometer</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Digital thermohygrometers</li>
                          <li>Data loggers</li>
                          <li>Environmental monitors</li>
                          <li>Calibration chambers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Signatory Management Subsections */}
                {selectedSubsection.id === 'signatory-management-overview' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Signatory Management Overview</h4>
                    <p className="mb-4">
                      The Signatory Management system allows administrators to configure and manage the signatories who appear on calibration certificates. This ensures that certificates are properly authorized and meet regulatory requirements.
                    </p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Key Features</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>Signatory Profiles:</strong> Manage signatory information and credentials</li>
                      <li><strong>Role Assignment:</strong> Assign specific roles to signatories</li>
                      <li><strong>Certificate Integration:</strong> Automatic inclusion in certificate generation</li>
                      <li><strong>Active Status Management:</strong> Enable or disable signatories</li>
                      <li><strong>Custom Roles:</strong> Create custom signatory roles as needed</li>
                      <li><strong>Audit Trail:</strong> Track changes to signatory information</li>
                    </ul>

                    <h4 className="font-semibold text-gray-800 mb-2">Access Requirements</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Who Can Access</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Admin Users:</strong> Full access to signatory management</li>
                        <li><strong>IT Programmers:</strong> Full access for system maintenance</li>
                        <li><strong>Other Roles:</strong> No access to signatory management</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedSubsection.id === 'signatory-management-roles' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Signatory Roles and Types</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Standard Signatory Roles</h4>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Technical Manager</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Primary technical authority</li>
                          <li>Oversees calibration procedures</li>
                          <li>Signs off on technical accuracy</li>
                          <li>Default role for most certificates</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Quality Manager</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Ensures quality standards</li>
                          <li>Reviews calibration processes</li>
                          <li>Signs off on quality compliance</li>
                          <li>Required for certain equipment types</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Custom Roles</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Create organization-specific roles</li>
                          <li>Define custom responsibilities</li>
                          <li>Meet specific regulatory requirements</li>
                          <li>Flexible role assignment</li>
                        </ul>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Managing Signatory Roles</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Access Signatory Management:</strong> Navigate to Settings and click on Signatory Management
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/90.png"
                            alt="Access Signatory Management"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Navigate to Settings and click on Signatory Management
                          </p>
                        </div>
                      </li>
                      <li><strong>Click Add Signatory:</strong> Click the "Add Signatory" button to create a new signatory
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/85.png"
                            alt="Click Add Signatory button"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Click the "Add Signatory" button to create a new signatory
                          </p>
                        </div>
                      </li>
                      <li><strong>Enter Signatory Information:</strong> Fill in the name and title fields
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/86.png"
                            alt="Enter signatory information"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Fill in the name and title fields for the signatory
                          </p>
                        </div>
                      </li>
                      <li><strong>Select Role Type:</strong> Choose the appropriate role from the dropdown
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/87.png"
                            alt="Select role type"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Choose the appropriate role from the dropdown menu
                          </p>
                        </div>
                      </li>
                      <li><strong>Set Status:</strong> Mark the signatory as Active or Inactive
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/88.png"
                            alt="Set signatory status"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Mark the signatory as Active or Inactive using the toggle
                          </p>
                        </div>
                      </li>
                      <li><strong>Save Signatory:</strong> Click "Save" to confirm and create the signatory
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/89.png"
                            alt="Save signatory"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Click "Save" to confirm and create the signatory
                          </p>
                        </div>
                      </li>
                    </ol>
                  </div>
                )}

                {selectedSubsection.id === 'signatory-management-certificates' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Certificate Generation and Signatories</h4>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">How Signatories Appear on Certificates</h4>
                    <p className="mb-4">
                      Signatories configured in the system automatically appear on calibration certificates based on the equipment type and calibration requirements. The system ensures proper authorization and compliance with regulatory standards.
                    </p>

                    <h4 className="font-semibold text-gray-800 mb-2">Certificate Integration</h4>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Automatic Assignment</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Signatories are automatically assigned based on equipment type</li>
                          <li>Active signatories are prioritized</li>
                          <li>Role-appropriate signatories are selected</li>
                          <li>Multiple signatories can be included per certificate</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Certificate Types</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Weighing Scale Certificates:</strong> Technical Manager signature</li>
                          <li><strong>Test Weights Certificates:</strong> Technical Manager + Quality Manager</li>
                          <li><strong>Thermometer Certificates:</strong> Technical Manager signature</li>
                          <li><strong>Sphygmomanometer Certificates:</strong> Technical Manager signature</li>
                          <li><strong>Thermohygrometer Certificates:</strong> Technical Manager signature</li>
                        </ul>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Print Certificate Feature</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">How to Print Certificates</h5>
                      <ol className="list-decimal list-inside text-sm space-y-1">
                        <li>Navigate to Request Management</li>
                        <li>Find a completed request</li>
                        <li>Click "View Details" on the request</li>
                        <li>In the request details modal, find completed samples</li>
                        <li>Click "Print Certificate" for the specific sample</li>
                        <li>Confirm the certificate generation</li>
                        <li>Certificate opens in a new window/tab</li>
                      </ol>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Certificate Features</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Professional Layout:</strong> DOST-PSTO branded certificate design</li>
                      <li><strong>Signatory Information:</strong> Name, title, and signature lines</li>
                      <li><strong>Equipment Details:</strong> Complete calibration information</li>
                      <li><strong>Measurement Results:</strong> Detailed calibration data</li>
                      <li><strong>Compliance Information:</strong> Standards and regulations</li>
                      <li><strong>Print-Ready Format:</strong> Optimized for printing</li>
                    </ul>
                  </div>
                )}

                {/* CRUD Workflows Subsections */}
                {selectedSubsection.id === 'crud-workflows-operations' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Available CRUD Operations</h4>
                    <p className="mb-4">This comprehensive section covers how to create, read, update, and delete data across all major modules in the ICMS system. Each workflow includes detailed step-by-step instructions, role requirements, and best practices.</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Core Modules</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Requests Management:</strong> Client booking and scheduling</li>
                          <li><strong>Client Management:</strong> User registration and profiles</li>
                          <li><strong>Calibration Records:</strong> Digital certificates and measurements</li>
                          <li><strong>Inventory Management:</strong> Equipment status and tracking</li>
            </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Support Modules</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Transaction Management:</strong> Payments and billing</li>
                          <li><strong>Report Generation:</strong> Analytics and documentation</li>
                          <li><strong>User Management:</strong> Role and permission control</li>
                          <li><strong>System Administration:</strong> Configuration and maintenance</li>
                        </ul>
                      </div>
            </div>

                    <h4 className="font-semibold text-gray-800 mb-2">CRUD Operations Overview</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Create (C):</strong> Add new records, requests, or data entries</li>
                      <li><strong>Read (R):</strong> View, search, and filter existing data</li>
                      <li><strong>Update (U):</strong> Modify existing records and information</li>
                      <li><strong>Delete (D):</strong> Remove records (with proper permissions)</li>
            </ul>
            </div>
                )}
                {selectedSubsection.id === 'crud-workflows-requests' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Requests (Reservations) Management</h4>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Creating an Add Request</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Admin, Calibration Engineers, or Front Office Staff</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Navigate to Requests:</strong> Click "Requests" in the sidebar</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/7.png"
                          alt="Requests page navigation"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Requests" in the sidebar to access the requests management page
                        </p>
                      </div>
                      <li><strong>Start Add Request:</strong> Click "Add Request" or the "+" button</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/8.png"
                          alt="Add Request button location"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Add Request" or the "+" button to start creating a new request
                        </p>
                      </div>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/9.png"
                          alt="Add Request form interface"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          The Add Request form will open with fields to fill out
                        </p>
                      </div>
                      <li><strong>Fill Required Information:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Client Information: Select existing client or create new one</li>
                          <li>Equipment/Sample Details: Specify what needs calibration</li>
                          <li>Requested Date: Choose preferred calibration date</li>
                          <li>Priority Level: Set urgency (Low, Medium, High, Critical)</li>
                          <li>Special Instructions: Add any specific requirements</li>
                        </ul>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/10.png"
                            alt="Request form filled with information"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Fill out all required fields in the request form with client and equipment details
                          </p>
                        </div>
                      </li>
                      <li><strong>Add Attachments (Optional):</strong> Upload PDF, images, or other relevant files (max 10MB per file)</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/11.png"
                          alt="Add attachments interface"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Upload relevant files like PDFs, images, or documents to support your request
                        </p>
                      </div>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/12.png"
                          alt="File upload confirmation"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Confirm file uploads and ensure they meet the size requirements (max 10MB per file)
                        </p>
                      </div>
                      <li><strong>Submit Request:</strong> Review all information and click "Save"</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/13.png"
                          alt="Review request before submission"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Review all information before submitting to ensure accuracy
                        </p>
                      </div>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/14.png"
                          alt="Request submitted successfully"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Save" to submit your request and receive confirmation
                        </p>
                      </div>
            </ol>

                    <h5 className="font-semibold text-gray-700 mb-2">Updating Request Information</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Admin, Calibration Engineers</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Open Request:</strong> Find the request in the list and click to view details</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/15.png"
                          alt="Request list with view details option"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Find the request in the list and click to view details for editing
                        </p>
                      </div>
                      <li><strong>Edit Fields:</strong> Update schedule, assignment, status, or add notes</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/16.png"
                          alt="Request edit form with fields"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Update schedule, assignment, status, or add notes in the edit form
                        </p>
                      </div>
                      <li><strong>Save Changes:</strong> Click "Save" to update the request</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/17.png"
                          alt="Save changes confirmation"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Save" to update the request with your changes
                        </p>
                      </div>
            </ol>

                    <h5 className="font-semibold text-gray-700 mb-2">Managing Request Status</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Status Flow:</strong> Pending → In Progress → Completed/Cancelled</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>In Progress:</strong> Can assign engineer, add notes</li>
                      <li><strong>Completed:</strong> Can generate certificates, process payments</li>
                      <li><strong>Cancelled:</strong> Must provide cancellation reason</li>
              </ul>

                    <h5 className="font-semibold text-gray-700 mb-2">Print Certificate</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Admin, Calibration Engineers</p>
                    <p className="text-sm text-gray-600 mb-2"><strong>Prerequisites:</strong> Request must be completed with calibration data</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Navigate to Completed Request:</strong> Find the completed request in the requests list
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/77.png" 
                            alt="Navigate to completed request" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Open Request Details:</strong> Click on the request to view full details
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/76.png" 
                            alt="Open request details" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                      <li><strong>Click "Print Certificate":</strong> Generate the calibration certificate
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img 
                            src="/79.png" 
                            alt="Certificate section location" 
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                        </div>
                      </li>
                    </ol>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-blue-800 mb-2">📋 Certificate Information</h5>
                      <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                        <li><strong>Certificate Number:</strong> Unique identifier for each calibration</li>
                        <li><strong>Calibration Date:</strong> When the calibration was performed</li>
                        <li><strong>Equipment Details:</strong> Model, serial number, specifications</li>
                        <li><strong>Calibration Results:</strong> Measured values and uncertainties</li>
                        <li><strong>Validity Period:</strong> Certificate expiration date</li>
                        <li><strong>Signatory:</strong> Calibration engineer's signature and credentials</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h5>
                      <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                        <li>Certificates can only be generated for completed calibrations</li>
                        <li>All calibration data must be properly recorded before printing</li>
                        <li>Ensure client information is accurate before generating certificate</li>
                        <li>Certificates are legally binding documents - verify all details</li>
                      </ul>
                    </div>
            </div>
                )}
                {selectedSubsection.id === 'crud-workflows-clients' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Client Management</h4>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Registering a New Client</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Admin, Front Office Staff</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Access Registration:</strong> Click "Register Client"</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/18.png"
                          alt="Client registration access"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Register Client" to access the registration form
              </p>
            </div>
                      <li><strong>Required Information:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Personal Details: Full name, email, phone</li>
                          <li>Organization: Company name, address, type</li>
                          <li>Contact Preferences: Communication methods</li>
                          <li>Account Type: Individual or Corporate</li>
            </ul>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/19.png"
                            alt="Client registration form with required fields"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Fill out all required information including personal details, organization, and contact preferences
                          </p>
                        </div>
                      </li>
                      <li><strong>Submit Registration:</strong> Verify all information and click "Register"</li>
                    </ol>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Updating Client Information</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Admin, Front Office Staff</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Find Client:</strong> Go to "User Management" or "Clients" and use search</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/20.png"
                          alt="Client search and management interface"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Go to "User Management" or "Clients" and use search to find the client
                        </p>
                      </div>
                      <li><strong>Edit Details:</strong> Click on client name to open profile and update information</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/21.png"
                          alt="Client profile view"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click on client name to open their profile for editing
                        </p>
                      </div>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/22.png"
                          alt="Client edit form"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Update client information in the edit form
                        </p>
                      </div>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/23.png"
                          alt="Client information fields"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Modify personal details, organization, and contact information as needed
                        </p>
                      </div>
                      <li><strong>Save Changes:</strong> Click "Save" to update client record</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/24.png"
                          alt="Save client changes confirmation"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Save" to update the client record with your changes
                        </p>
                      </div>
            </ol>

                    <h5 className="font-semibold text-gray-700 mb-2">Viewing Client History</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Navigate to client details and click "Requests" tab</li>
                      <li>Filter by date range, status, or equipment type</li>
                      <li>View all their reservations and calibration history</li>
            </ul>
                  </div>
                )}
                {selectedSubsection.id === 'crud-workflows-calibration' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Calibration Records Management</h4>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Creating Calibration Records</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Calibration Engineers, Admin</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Access Calibration Module:</strong> Go to "Calibration" in the sidebar</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/25.png"
                          alt="Calibration module access"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Go to "Calibration" in the sidebar to access the calibration module
                        </p>
                      </div>
                      <li><strong>Select Equipment/Sample:</strong> Choose from available pending requests</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/26.png"
                          alt="Equipment/sample selection from pending requests"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Choose from available pending requests to select equipment or sample for calibration
                        </p>
                      </div>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/27.png"
                          alt="Calibration record creation form"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Fill out the calibration record form with measurement data and details
                        </p>
                      </div>
                      <li><strong>Enter Measurement Data:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Test Points: Record measurements at various points</li>
                          <li>Uncertainties: Calculate and enter measurement uncertainties</li>
                          <li>Environmental Conditions: Temperature, humidity, pressure</li>
                          <li>Reference Standards: Document standards used</li>
            </ul>
                      </li>
                      <li><strong>Save and Finalize:</strong> Save as Draft or Finalize for completed calibrations</li>
            </ol>

                    <h5 className="font-semibold text-gray-700 mb-2">Generating Calibration Certificates</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Calibration Engineers, Admin</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Open Completed Calibration:</strong> Navigate to finalized calibration record</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/28.png"
                          alt="Completed calibration record view"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Navigate to the finalized calibration record to access certificate generation
                        </p>
                      </div>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/29.png"
                          alt="Calibration record details and certificate options"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          View calibration details and locate the certificate generation option
                        </p>
                      </div>
                      <li><strong>Generate Certificate:</strong> Click "Generate Certificate" to create PDF</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/30.png"
                          alt="Certificate generation process"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Generate Certificate" to create the PDF certificate
                        </p>
                      </div>
                      <li><strong>Review and Distribute:</strong> Review for accuracy and download or email to client</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/31.png"
                          alt="Certificate review and distribution options"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Review the certificate for accuracy and choose to download or email to client
                        </p>
                      </div>
                    </ol>
                  </div>
                )}
                {selectedSubsection.id === 'crud-workflows-inventory' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Inventory Management</h4>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Viewing Inventory</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Available to:</strong> All users (with different access levels)</p>
                    <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                      <li>Click "Inventory" in the sidebar and select appropriate category</li>
                      <li>Use filters for status, location, calibration date</li>
                      <li>Search by equipment ID, model, or serial number</li>
            </ul>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <img
                        src="/32.png"
                        alt="Inventory search interface"
                        className="w-full max-w-2xl mx-auto rounded border"
                      />
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        Search by equipment ID, model, or serial number using the search interface
                      </p>
                    </div>

                    <h5 className="font-semibold text-gray-700 mb-2">Adding New Equipment</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Admin, Calibration Engineers</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Start New Item:</strong> Click "Add Item" in the inventory section</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/33.png"
                          alt="Add new equipment interface"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Add Item" in the inventory section to start adding new equipment
                        </p>
                      </div>
                      <li><strong>Enter Equipment Details:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Identification: Model, serial number, manufacturer</li>
                          <li>Specifications: Range, accuracy, resolution</li>
                          <li>Status: Available, In Use, Out of Service, Calibrated</li>
                          <li>Location: Physical location in facility</li>
                          <li>Calibration Schedule: Next due date, interval</li>
              </ul>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/34.png"
                            alt="Equipment details form"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Fill out all equipment details including identification, specifications, and status
                          </p>
                        </div>
                      </li>
                      <li><strong>Save Equipment:</strong> Review all information and click "Save"</li>
            </ol>

                    <h5 className="font-semibold text-gray-700 mb-2">Equipment Status Management</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Calibrated:</strong> Recently calibrated and ready</li>
                      <li><strong>Expired:</strong> Calibration due or overdue</li>
            </ul>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <img
                        src="/36.png"
                        alt="Equipment status management interface"
                        className="w-full max-w-2xl mx-auto rounded border"
                      />
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        Manage equipment status including calibrated and expired items
                      </p>
                    </div>
            </div>
                )}
                {selectedSubsection.id === 'crud-workflows-transactions' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Transaction and Payment Management</h4>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Creating Transactions</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Cashiers, Admin</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Access Transactions:</strong> Go to "Transactions" in the sidebar</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/37.png"
                          alt="Transactions module access"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Go to "Transactions" in the sidebar to access the transactions module
                        </p>
            </div>
                      <li><strong>Select Related Items:</strong> Choose client click View Details and add Payment</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/38.png"
                          alt="Client selection and payment addition"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Choose client, click View Details, and add Payment information
                        </p>
                      </div>
                      <li><strong>Save Transaction:</strong> Review all charges and click "Save"</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/40.png"
                          alt="Save transaction confirmation"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Review all information and click "Save" to complete the transaction
                        </p>
                      </div>
                    </ol>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Processing Payments</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Cashiers, Admin</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Open Transaction:</strong> Find transaction in the list and click to open</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/38.png"
                          alt="Transaction list and selection"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Find transaction in the list and click to open for payment processing
                        </p>
                      </div>
                      <li><strong>Process Payment:</strong> Click "Process Payment" and enter amount and method</li>
                      <li><strong>Confirm Payment:</strong> Review payment details and click "Confirm"</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/40.png"
                          alt="Payment confirmation process"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Review payment details and click "Confirm" to complete the payment
                        </p>
                      </div>
            </ol>
                  </div>
                )}
                {selectedSubsection.id === 'crud-workflows-reports' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Report Generation</h4>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Creating Reports</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Available to:</strong> Admin, Calibration Engineers (limited)</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Access Reports:</strong> Click "Reports" in the sidebar
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/80.png"
                            alt="Access Reports section"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Navigate to the Reports section from the sidebar menu
                          </p>
                        </div>
                      </li>
                      <li><strong>Set Report Parameters:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Date Range: Select start and end dates</li>
                          <li>Filters: Status, client, equipment type</li>
                          <li>Grouping: By date, client, engineer, etc.</li>
                        </ul>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/82.png"
                            alt="Set Report Parameters"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Configure report parameters including date range, filters, and grouping options
                          </p>
                        </div>
                      </li>
                      <li><strong>Generate Report:</strong> Click "PREVIEW PDF REPORT" to create report
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/81.png"
                            alt="Generate Report"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Click "Generate" to create the comprehensive report with all selected parameters
                          </p>
                        </div>
                      </li>
            </ol>

                    <h5 className="font-semibold text-gray-700 mb-2">Available Report Types</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Calibration Summary:</strong> All calibrations in date range</li>
                      <li><strong>Client Activity:</strong> Client requests and payments</li>
                      <li><strong>Equipment Status:</strong> Inventory and calibration status</li>
                      <li><strong>Financial Reports:</strong> Revenue, payments, outstanding</li>
                      <li><strong>Performance Metrics:</strong> Engineer productivity, turnaround times</li>
              </ul>
            </div>
                )}
                {selectedSubsection.id === 'crud-workflows-users' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">User Management (Admin Only)</h4>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Creating New Users</h5>
                    <p className="text-sm text-gray-600 mb-2"><strong>Required Role:</strong> Admin only</p>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Access User Management:</strong> Go to "User Management" in the sidebar</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/41.png"
                          alt="User Management module access"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Go to "User Management" in the sidebar to access user management features
                        </p>
                      </div>
                      <li><strong>Enter User Details:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Personal Information: Name, email, phone</li>
                          <li>Login Credentials: Username and temporary password</li>
                          <li>Role Assignment: Admin, Engineer, Cashier, Client</li>
                          <li>Permissions: Specific access rights</li>
              </ul>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <img
                            src="/42.png"
                            alt="User details entry form"
                            className="w-full max-w-2xl mx-auto rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            Enter personal information, login credentials, role assignment, and permissions
                          </p>
            </div>
                      </li>
                      <li><strong>Save User:</strong> Review all information and click "Save"</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/43.png"
                          alt="Save user confirmation"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Review all information and click "Save" to create the new user
                        </p>
                      </div>
                    </ol>
                    
                    <h5 className="font-semibold text-gray-700 mb-2">Managing User Roles</h5>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm">
                      <li><strong>Open User Profile:</strong> Find user in the management list</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/44.png"
                          alt="User management list and profile access"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Find user in the management list and open their profile for editing
                        </p>
                      </div>
                      <li><strong>Update Role:</strong> Change user role, modify permissions, update contact information</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/45.png"
                          alt="User role and permissions update interface"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Change user role, modify permissions, and update contact information
                        </p>
                      </div>
                      <li><strong>Save Changes:</strong> Click "Save" to update user</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/45.png"
                          alt="Save user changes confirmation"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Save" to update user with the new role and permission changes
                        </p>
                      </div>
                    </ol>
                  </div>
                )}
                {selectedSubsection.id === 'crud-workflows-access' && (
              <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Role-Based Access Control</h4>

            <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Admin Users</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Full System Access: All modules and functions</li>
                          <li>User Management: Create, edit, delete users</li>
                          <li>System Settings: Configure system-wide settings</li>
                          <li>Backup/Restore: Full system backup capabilities</li>
                          <li>Audit Logs: View all system activity</li>
                </ul>
              </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Calibration Engineers</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Calibration Management: Create, edit calibration records</li>
                          <li>Request Management: Process and update requests</li>
                          <li>Inventory Access: View and update equipment status</li>
                          <li>Certificate Generation: Create calibration certificates</li>
                          <li>Limited Reports: Calibration and equipment reports</li>
                </ul>
              </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">Cashiers</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Transaction Management: Create and process payments</li>
                          <li>Client Billing: Generate invoices and statements</li>
                          <li>Payment Processing: Record payments and receipts</li>
                          <li>Financial Reports: Revenue and payment reports</li>
                          <li>Limited Client Access: View client information</li>
                </ul>
              </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Clients</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Request Submission: Submit calibration requests</li>
                          <li>Status Tracking: View request and calibration status</li>
                          <li>Certificate Access: Download calibration certificates</li>
                          <li>Payment Viewing: View invoices and payment history</li>
                          <li>Profile Management: Update personal information</li>
                </ul>
              </div>
                    </div>
                  </div>
                )}

                {/* Full System Backup Subsections */}
                {selectedSubsection.id === 'full-backup-included' && (
              <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What's Included in Full Backup</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>All database tables</strong> and data records</li>
                      <li><strong>User accounts</strong> and permissions</li>
                      <li><strong>System configurations</strong> and settings</li>
                      <li><strong>Uploaded files</strong> and documents</li>
                      <li><strong>Calibration records</strong> and certificates</li>
                </ul>
              </div>
                )}
                {selectedSubsection.id === 'full-backup-creating' && (
              <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Creating a Full Backup</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Ensure you have admin privileges</strong></li>
                      <li><strong>Open Settings</strong> from the main navigation</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/1.png"
                          alt="Settings access from main navigation"
                          className="w-full max-w-md mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Open Settings from the main navigation to access backup options
                        </p>
              </div>
                      <li><strong>Navigate to "System Administration"</strong> section</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/4.png"
                          alt="System Administration section in settings"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Navigate to the "System Administration" section to find backup options
                        </p>
                      </div>
                      <li><strong>Click "Create Full Backup"</strong> button</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/4.png"
                          alt="Create Full Backup button interface"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Create Full Backup" button to start the backup process
                        </p>
                      </div>
                      <li><strong>Wait for the process to complete</strong> (may take several minutes)</li>
                      <li><strong>Download the generated SQL file</strong></li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/5.png"
                          alt="Download generated SQL file"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Download the generated SQL file once the backup process is complete
                        </p>
                      </div>
                    </ol>
              </div>
                )}
                {selectedSubsection.id === 'full-backup-restoring' && (
              <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Restoring from Backup</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Ensure you have admin privileges</strong></li>
                      <li><strong>Open Settings</strong> from the main navigation</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/1.png"
                          alt="Settings access from main navigation"
                          className="w-full max-w-md mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Open Settings from the main navigation to access restore options
                        </p>
                      </div>
                      <li><strong>Navigate to "System Administration"</strong> section</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/4.png"
                          alt="System Administration section in settings"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Navigate to the "System Administration" section to find restore options
                        </p>
                      </div>
                      <li><strong>Click "Restore from Backup"</strong> button</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/46.png"
                          alt="Restore from Backup button interface"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Click "Restore from Backup" button to start the restore process
                        </p>
                      </div>
                      <li><strong>Select your backup SQL file</strong></li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/46.png"
                          alt="File selection for backup restore"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Select your backup SQL file from the file selection dialog
                        </p>
                      </div>
                      <li><strong>Confirm the restore operation</strong> (this will overwrite current data)</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/6.png"
                          alt="Restore operation confirmation"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Confirm the restore operation - this will overwrite current data
                        </p>
                      </div>
                    </ol>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">⚠️ Important Warning</h5>
                      <p className="text-yellow-700 text-sm">
                        Full system restore will completely replace all current data. Make sure to create a backup before restoring to avoid data loss.
                      </p>
                    </div>
                  </div>
                )}
                {/* System Logs Subsections */}
                {selectedSubsection.id === 'system-logs-what' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What Are System Logs?</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>User Actions:</strong> Logins, logouts, data modifications</li>
                      <li><strong>System Events:</strong> Backups, restores, configuration changes</li>
                      <li><strong>Error Tracking:</strong> System errors and warnings</li>
                      <li><strong>Audit Trail:</strong> Complete record of system usage</li>
                </ul>
              </div>
                )}
                {selectedSubsection.id === 'system-logs-viewing' && (
              <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Viewing System Logs</h4>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      <li><strong>Open Settings</strong> (admin access required)</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/1.png"
                          alt="Settings access from main navigation"
                          className="w-full max-w-md mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Open Settings from the main navigation to access system logs (admin access required)
                        </p>
                      </div>
                      <li><strong>Scroll to "System Logs"</strong> section</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/47.png"
                          alt="System Logs section in settings"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Scroll to the "System Logs" section in the settings interface
                        </p>
                      </div>
                      <li><strong>Logs are automatically loaded</strong> when settings open</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/48.png"
                          alt="System logs interface with loaded data"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Logs are automatically loaded when settings open, showing all system activities
                        </p>
                      </div>
                      <li><strong>Use the filter box</strong> to search for specific activities</li>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src="/48.png"
                          alt="Filter box for searching log activities"
                          className="w-full max-w-2xl mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Use the filter box to search for specific activities, users, or text in the logs
                        </p>
                      </div>
                    </ol>
                  </div>
                )}
                {selectedSubsection.id === 'system-logs-info' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Log Information</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li><strong>Timestamp:</strong> When the action occurred</li>
                      <li><strong>Action Type:</strong> What type of action was performed</li>
                      <li><strong>User:</strong> Who performed the action</li>
                      <li><strong>Details:</strong> Additional information about the action</li>
                </ul>
              </div>
                )}
                {selectedSubsection.id === 'system-logs-categories' && (
              <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Log Categories</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><code className="bg-gray-100 px-2 py-0.5 rounded">request_create</code> - New calibration requests</li>
                        <li><code className="bg-gray-100 px-2 py-0.5 rounded">calibration_create</code> - New calibration records</li>
                        <li><code className="bg-gray-100 px-2 py-0.5 rounded">calibration_update</code> - Updated calibration records</li>
                        <li><code className="bg-gray-100 px-2 py-0.5 rounded">payment_process</code> - Payment processing</li>
                      </ul>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><code className="bg-gray-100 px-2 py-0.5 rounded">settings_update</code> - Settings changes</li>
                        <li><code className="bg-gray-100 px-2 py-0.5 rounded">backup_export_sql</code> - Full system backups</li>
                        <li><code className="bg-gray-100 px-2 py-0.5 rounded">backup_import_sql</code> - Full system restores</li>
                </ul>
              </div>
            </div>
                )}

                {/* Troubleshooting Subsections */}
                {selectedSubsection.id === 'troubleshooting-common' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Common Issues</h4>
                    <div className="space-y-4 mb-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-1">Settings Modal Won't Open</h5>
                <p className="text-sm text-gray-600 mb-2">Problem: Clicking "Settings" doesn't open the modal</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Refresh the page and try again</li>
                  <li>Check if you're logged in properly</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Try a different browser</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-1">Theme Changes Not Applied</h5>
                <p className="text-sm text-gray-600 mb-2">Problem: Theme selection doesn't change the appearance</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Wait a few seconds for the change to apply</li>
                  <li>Refresh the page</li>
                  <li>Check if your browser supports the theme system</li>
                  <li>Try logging out and back in</li>
                </ul>
              </div>
              </div>
              </div>
                )}
                {selectedSubsection.id === 'troubleshooting-errors' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Error Messages</h4>
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-red-900 mb-1">"Database connection failed"</h5>
                <ul className="text-sm text-red-900 space-y-1">
                  <li>Check if the database server is running</li>
                  <li>Verify database credentials</li>
                  <li>Contact system administrator</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-red-900 mb-1">"Forbidden: Admins only"</h5>
                <ul className="text-sm text-red-900 space-y-1">
                  <li>You don't have admin privileges</li>
                  <li>Contact your administrator for access</li>
                  <li>Use basic settings features only</li>
                </ul>
              </div>
              </div>
            </div>
                )}

                {/* Best Practices Subsections */}
                {selectedSubsection.id === 'best-practices-all' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">For All Users</h4>
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-2">Theme Selection</h5>
                      <ul className="list-disc list-inside text-sm space-y-1 mb-3">
              <li><strong>Choose based on environment:</strong> Light for bright rooms, dark for dim lighting</li>
              <li><strong>Consider eye strain:</strong> Switch themes if you experience discomfort</li>
              <li><strong>Use system theme</strong> for automatic adaptation</li>
            </ul>
                      <h5 className="font-semibold text-gray-700 mb-2">Regular Settings Backup</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
              <li><strong>Export settings monthly</strong> to avoid losing preferences</li>
              <li><strong>Store backup files securely</strong> in multiple locations</li>
              <li><strong>Test restore process</strong> occasionally to ensure backups work</li>
            </ul>
                    </div>
                  </div>
                )}
                {selectedSubsection.id === 'best-practices-admin' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">For Admin Users</h4>
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-2">Backup Strategy</h5>
                      <ul className="list-disc list-inside text-sm space-y-1 mb-3">
              <li><strong>Create full backups weekly</strong> or before major changes</li>
              <li><strong>Test restore process</strong> on development environment first</li>
              <li><strong>Store backups securely</strong> with proper access controls</li>
              <li><strong>Document backup procedures</strong> for team members</li>
            </ul>
                      <h5 className="font-semibold text-gray-700 mb-2">System Monitoring</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
              <li><strong>Check system logs regularly</strong> for unusual activity</li>
              <li><strong>Monitor backup success</strong> and system health</li>
              <li><strong>Review user activity</strong> for security purposes</li>
              <li><strong>Document any issues</strong> for technical support</li>
            </ul>
                    </div>
                  </div>
                )}
                {selectedSubsection.id === 'best-practices-security' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Security Considerations</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-700 mb-2">Backup Security</h5>
                      <ul className="list-disc list-inside text-sm space-y-1 mb-3">
              <li><strong>Encrypt backup files</strong> when storing long-term</li>
              <li><strong>Limit access</strong> to backup files</li>
              <li><strong>Regularly rotate</strong> backup storage locations</li>
              <li><strong>Verify backup integrity</strong> periodically</li>
            </ul>
                      <h5 className="font-semibold text-gray-700 mb-2">Access Control</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
              <li><strong>Use strong passwords</strong> for admin accounts</li>
              <li><strong>Limit admin privileges</strong> to necessary personnel</li>
              <li><strong>Monitor admin activities</strong> through system logs</li>
              <li><strong>Regularly review</strong> user permissions</li>
            </ul>
          </div>
                  </div>
                )}
              </div>
          </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserManual;