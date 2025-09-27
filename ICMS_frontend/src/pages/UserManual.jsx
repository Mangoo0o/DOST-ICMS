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
      
      // Theme Settings
      'theme-settings-available': ['available themes', 'theme options', 'dark theme', 'light theme'],
      'theme-settings-change': ['change theme', 'switch theme', 'theme selection'],
      'theme-settings-persistence': ['theme persistence', 'save theme', 'remember theme'],
      
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
                      <li><strong>Access Reports:</strong> Click "Reports" in the sidebar</li>
                      <li><strong>Set Report Parameters:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Date Range: Select start and end dates</li>
                          <li>Filters: Status, client, equipment type</li>
                          <li>Grouping: By date, client, engineer, etc.</li>
            </ul>
                      </li>
                      <li><strong>Generate Report:</strong> Click "Generate" to create report</li>
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