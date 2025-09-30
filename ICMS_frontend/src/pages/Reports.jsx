import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdDateRange, MdLocationOn, MdAssessment, MdDownload, MdRefresh, MdTrendingUp, MdPeople, MdInventory, MdAssignment } from 'react-icons/md';
import apiService from '../services/api';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('all');
  const [loading, setLoading] = useState(false);
  const [allReportsData, setAllReportsData] = useState(null);
  const [availableLocations, setAvailableLocations] = useState([]);

  // Set default date range to current month
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // Fetch available locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await apiService.getRequests();
        if (response && response.data && response.data.records) {
          const locations = [...new Set(response.data.records.map(r => r.address).filter(Boolean))];
          setAvailableLocations(locations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Don't show error toast for this, just log it
        // The reports will still work without location filtering
      }
    };
    fetchLocations();
  }, []);

  const generateAllReports = async () => {
    if (!startDate && !endDate) {
      toast.error('Please select at least a start date or end date');
      return;
    }

    setLoading(true);
    try {
      // Use the API service to generate reports
      const response = await apiService.generateReport({
        type: 'all_reports',
        start_date: startDate,
        end_date: endDate,
        location: location
      });

      if (response.data) {
        setAllReportsData(response.data);
        toast.success('All reports generated successfully');
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error generating reports:', error);
      toast.error('Failed to generate reports: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const exportAllReports = () => {
    if (!allReportsData) {
      toast.error('No report data to export');
      return;
    }

    // Create a comprehensive CSV with all report data
    let csvContent = 'Report Type,Date Range,Location\n';
    csvContent += `All Reports,${startDate} to ${endDate},${location === 'all' ? 'All' : location}\n\n`;
    
    // Add each report section
    Object.keys(allReportsData.reports).forEach(reportType => {
      const reportData = allReportsData.reports[reportType];
      if (reportData && Array.isArray(reportData) && reportData.length > 0) {
        csvContent += `\n${reportType.toUpperCase().replace(/_/g, ' ')}\n`;
        const headers = Object.keys(reportData[0]);
        csvContent += headers.join(',') + '\n';
        reportData.forEach(row => {
          csvContent += headers.map(header => `"${row[header] || ''}"`).join(',') + '\n';
        });
        csvContent += '\n';
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive_report_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('All reports exported successfully');
  };

  const renderDashboardSummary = (data) => {
    if (!data || data.length === 0) return <p>No data available</p>;
    
    const summary = data[0];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <MdAssignment className="text-blue-600 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-600">{summary.total_requests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <MdAssessment className="text-green-600 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Calibrated Items</p>
              <p className="text-2xl font-bold text-green-600">{summary.total_calibrated_items}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center">
            <MdTrendingUp className="text-purple-600 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Completed Requests</p>
              <p className="text-2xl font-bold text-purple-600">{summary.completed_requests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg">
          <div className="flex items-center">
            <MdPeople className="text-orange-600 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-orange-600">{summary.total_clients}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTableReport = (data, title, icon) => {
    if (!data || data.length === 0) return <p>No data available</p>;
    
    const headers = Object.keys(data[0]);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900 ml-2">{title}</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {headers.map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index}>
                  {headers.map(header => (
                    <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Comprehensive Reports</h1>
        <p className="text-gray-600">Generate all reports at once with date and location filtering</p>
      </div>

      {/* Report Controls */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MdDateRange className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MdDateRange className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Locations</option>
                {availableLocations.map((loc, index) => (
                  <option key={index} value={loc}>{loc}</option>
                ))}
              </select>
              <MdLocationOn className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generateAllReports}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
          >
            <MdRefresh className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating All Reports...' : 'Generate All Reports'}
          </button>
          
          {allReportsData && (
            <button
              onClick={exportAllReports}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-lg font-medium"
            >
              <MdDownload className="mr-2" />
              Export All Reports
            </button>
          )}
        </div>
      </div>

      {/* Report Results */}
      {allReportsData && (
        <div className="space-y-8">
          {/* Report Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Comprehensive Report Results
            </h2>
            <p className="text-sm text-gray-600">
              Date Range: {startDate} to {endDate} | Location: {location === 'all' ? 'All Locations' : location}
            </p>
          </div>

          {/* Dashboard Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MdAssessment className="mr-2 text-blue-600" />
              Dashboard Summary
            </h3>
            {renderDashboardSummary(allReportsData.reports.dashboard_summary)}
          </div>

          {/* Calibration Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MdTrendingUp className="mr-2 text-green-600" />
              Calibration Summary by Date
            </h3>
            {renderTableReport(
              allReportsData.reports.calibration_summary, 
              'Calibration Summary by Date',
              <MdTrendingUp className="text-green-600 text-xl" />
            )}
          </div>

          {/* Financial Report */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MdTrendingUp className="mr-2 text-green-600" />
              Financial Report
            </h3>
            {renderTableReport(
              allReportsData.reports.financial_report, 
              'Financial Report',
              <MdTrendingUp className="text-green-600 text-xl" />
            )}
          </div>

          {/* Inventory Report */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MdInventory className="mr-2 text-indigo-600" />
              Inventory Report
            </h3>
            {renderTableReport(
              allReportsData.reports.inventory_report, 
              'Inventory Report',
              <MdInventory className="text-indigo-600 text-xl" />
            )}
          </div>

          {/* Client Activity Report */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MdPeople className="mr-2 text-pink-600" />
              Client Activity Report
            </h3>
            {renderTableReport(
              allReportsData.reports.client_activity, 
              'Client Activity Report',
              <MdPeople className="text-pink-600 text-xl" />
            )}
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MdAssessment className="mr-2 text-blue-600" />
              Performance Metrics
            </h3>
            {renderTableReport(
              allReportsData.reports.performance_metrics, 
              'Performance Metrics',
              <MdAssessment className="text-blue-600 text-xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 