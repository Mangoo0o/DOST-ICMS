import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdDateRange, MdLocationOn, MdAssessment, MdDownload, MdRefresh, MdTrendingUp, MdPeople, MdInventory, MdAssignment } from 'react-icons/md';
import { apiService } from '../services/api';

// Get API base URL (reuse same base path as api service)
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost/ICMS_DOST-%20PSTO/ICMS_backend'
  : '/api';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('all');
  const [loading, setLoading] = useState(false);
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
      console.log('Generating PDF report with params:', {
        type: 'pdf_report',
        start_date: startDate,
        end_date: endDate,
        location: location
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
          const reportUrl = `${API_BASE_URL}/api/reports/generate_report.php?type=pdf_report&start_date=${startDate}&end_date=${endDate}&location=${location}`;
          
          // Open PDF in new tab for preview
          window.open(reportUrl, '_blank');
          
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Comprehensive Reports</h1>
        <p className="text-gray-600">Preview comprehensive PDF reports with date and location filtering</p>
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
            {loading ? 'Generating PDF Preview...' : 'Preview PDF Report'}
          </button>
          
        </div>
      </div>

    </div>
  );
};

export default Reports; 