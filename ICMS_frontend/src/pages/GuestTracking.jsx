import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import dostLogo from '../assets/dost logo.svg';

// Add animation styles
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

const GuestTracking = () => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestData, setRequestData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRequestData(null);

    if (!referenceNumber.trim()) {
      setError('Please enter a reference number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.getRequestDetails(referenceNumber.trim());
      setRequestData(response.data);
    } catch (error) {
      console.error('Error fetching request:', error);
      setError(error.response?.data?.message || error.message || 'Request not found. Please check your reference number.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'PENDING';
      case 'in_progress':
        return 'ONGOING';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const getSampleStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSampleStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'PENDING';
      case 'in_progress':
        return 'ONGOING';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a9dab]/20 to-[#2a9dab]/30 flex items-center justify-center py-4">
      <style>{styles}</style>
      <div className="max-w-4xl w-full mx-4 h-[calc(100vh-2rem)]">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full overflow-y-auto">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center bg-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-white rounded-full p-3 shadow-lg ring-2 ring-white/20 flex-shrink-0">
                <img src={dostLogo} alt="DOST Logo" className="w-12 h-12" />
              </div>
              <div className="text-center">
                <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight tracking-wide whitespace-nowrap">Integrated Calibration</h1>
                <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight tracking-wide">Management System</h2>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mt-4">Track Your Request</h3>
            <p className="text-gray-600 text-sm mt-2">Enter your reference number to check the status of your calibration request</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="referenceNumber"
                    value={referenceNumber}
                    onChange={(e) => {
                      setReferenceNumber(e.target.value);
                      setError('');
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#2a9dab] focus:border-[#2a9dab] transition-colors`}
                    placeholder="Enter your reference number"
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <div className="mt-1 flex items-center text-red-500 text-sm animate-fadeIn">
                    <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={"w-full bg-[#2a9dab] text-white py-3 px-4 rounded-lg hover:bg-[#2a9dab]/90 focus:outline-none focus:ring-2 focus:ring-[#2a9dab] focus:ring-offset-2 transition-colors font-medium " + (isLoading ? 'opacity-75 cursor-not-allowed' : '')}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  'Track Request'
                )}
              </button>
            </form>

            {/* Request Status */}
            {requestData && (
              <div className="mt-8 bg-gray-50 rounded-lg p-6 animate-fadeIn">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Request Status</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Reference Number</label>
                    <p className="text-gray-800 font-mono">{requestData.reference_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(requestData.status)}`}>
                      {getStatusDisplay(requestData.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Client</label>
                    <p className="text-gray-800">{requestData.client_name}</p>
                  </div>
                </div>

                {/* Samples */}
                {requestData.sample && requestData.sample.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-md font-semibold text-gray-800 mb-3">Sample Status ({requestData.sample.length} items)</h5>
                    <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[120px]">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[120px]">Serial No.</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[100px]">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[100px]">Calibrated</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {requestData.sample.map((sample, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-800 truncate">{sample.type}</td>
                              <td className="px-4 py-2 text-sm text-gray-800 font-mono truncate">{sample.serial_no}</td>
                              <td className="px-4 py-2 text-sm text-gray-800">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSampleStatusColor(sample.status)}`}>
                                  {getSampleStatusDisplay(sample.status)}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-800">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${sample.is_calibrated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {sample.is_calibrated ? 'Yes' : 'No'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {requestData.sample.length > 6 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        📜 Scroll to see all {requestData.sample.length} samples
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-800 text-sm font-medium border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestTracking;
