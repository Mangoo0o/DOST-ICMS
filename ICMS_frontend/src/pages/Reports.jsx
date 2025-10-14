import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdDateRange, MdLocationOn, MdAssessment, MdDownload, MdRefresh, MdTrendingUp, MdPeople, MdInventory, MdAssignment, MdRestartAlt, MdCheckCircle } from 'react-icons/md';
import { apiService } from '../services/api';

// Get API base URL (reuse same base path as api service)
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8000'
  : '/api';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('all');
  const [loading, setLoading] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [includeSamples, setIncludeSamples] = useState(true);
  const [includeClientsByCity, setIncludeClientsByCity] = useState(true);
  const [includeInventory, setIncludeInventory] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all | in_progress | completed

  const resetFilters = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
    setLocation('all');
    setIncludeSamples(true);
    setIncludeClientsByCity(true);
    setIncludeInventory(true);
    setStatusFilter('all');
  };

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
      console.log('Generating PDF report with params:', {
        type: 'pdf_report',
        start_date: startDate,
        end_date: endDate,
        location: location,
        sample_status: statusFilter
      });

      // Test database connection first
      console.log('Testing database connection...');
      const testResponse = await apiService.generateReport({
        type: 'debug_test'
      });
      console.log('Debug test response:', testResponse);
      console.log('Debug test data:', testResponse.data);
      console.log('Debug test message:', testResponse.data?.message);
      
      if (testResponse.data && testResponse.data.message === 'Debug test completed') {
        console.log('Debug test results:', testResponse.data);
        console.log(`Count query: ${testResponse.data.count_query_result?.total || 0} requests`);
        console.log(`Select query: ${testResponse.data.select_query_count || 0} requests`);
        console.log(`Function returned: ${testResponse.data.function_returned_count || 0} requests`);
        
        if (testResponse.data.count_query_result?.total > 0) {
          // Generate PDF report preview
          const reportUrl = `${API_BASE_URL}/api/reports/generate_report.php?type=pdf_report&start_date=${startDate}&end_date=${endDate}&location=${location}&sample_status=${statusFilter}` +
            `&include_samples=${includeSamples ? '1' : '0'}` +
            `&include_clients_by_city=${includeClientsByCity ? '1' : '0'}` +
            `&include_inventory=${includeInventory ? '1' : '0'}`;

          // Fetch PDF with Authorization header then open as blob
          const token = localStorage.getItem('token');
          const response = await fetch(reportUrl, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (!response.ok) {
            if (response.status === 401) {
              toast.error('Unauthorized. Please log in again.');
            } else {
              toast.error(`Failed to generate report (HTTP ${response.status})`);
            }
            return;
          }

          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          toast.success(`PDF report generated with ${testResponse.data.count_query_result.total} requests`);
        } else {
          toast.error('No requests found in database. Please check if there are any calibration requests.');
        }
      } else {
        console.log('Debug test did not return expected message. Full response:', testResponse.data);
        toast.error('Debug test failed: ' + (testResponse.data?.error || testResponse.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast.error('Failed to generate PDF report: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Comprehensive Reports</h1>
            <p className="text-gray-600 mt-1">Preview PDF reports with date, location, and section filters</p>
          </div>
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <MdRestartAlt className="mr-2" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800 tracking-wide">Filters</h2>
          <span className="text-xs text-gray-500">Use these to narrow your report</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

          {/* Sample Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sample Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Samples</option>
                <option value="in_progress">Ongoing Only</option>
                <option value="completed">Completed Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sections to include */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Include Sections</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setIncludeSamples(!includeSamples)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg border transition ${includeSamples ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="flex items-center text-sm text-gray-800">
                <MdAssignment className={`mr-2 ${includeSamples ? 'text-blue-600' : 'text-gray-500'}`} /> All Samples
              </span>
              {includeSamples && <MdCheckCircle className="text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => setIncludeClientsByCity(!includeClientsByCity)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg border transition ${includeClientsByCity ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="flex items-center text-sm text-gray-800">
                <MdPeople className={`mr-2 ${includeClientsByCity ? 'text-blue-600' : 'text-gray-500'}`} /> Clients by City
              </span>
              {includeClientsByCity && <MdCheckCircle className="text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => setIncludeInventory(!includeInventory)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg border transition ${includeInventory ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="flex items-center text-sm text-gray-800">
                <MdInventory className={`mr-2 ${includeInventory ? 'text-blue-600' : 'text-gray-500'}`} /> Inventory
              </span>
              {includeInventory && <MdCheckCircle className="text-blue-600" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={generateAllReports}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
          >
            <MdRefresh className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating PDF Preview...' : 'Preview PDF Report'}
          </button>
          
        </div>
      </div>

    </div>
  );
};

export default Reports; 