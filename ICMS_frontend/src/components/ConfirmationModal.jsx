import React from 'react';
import { MdWarning, MdInfo, MdError, MdCheckCircle } from 'react-icons/md';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  type = "warning", // warning, info, error, success
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  zIndex = "z-50" // Allow custom z-index
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <MdWarning className="w-6 h-6 text-red-500" />;
      case 'info':
        return <MdInfo className="w-6 h-6 text-[#2a9dab]" />;
      case 'error':
        return <MdError className="w-6 h-6 text-red-500" />;
      case 'success':
        return <MdCheckCircle className="w-6 h-6 text-[#2a9dab]" />;
      default:
        return <MdWarning className="w-6 h-6 text-red-500" />;
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg';
      case 'info':
        return 'bg-[#2a9dab] hover:bg-[#238a91] focus:ring-[#2a9dab] shadow-lg';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg';
      case 'success':
        return 'bg-[#2a9dab] hover:bg-[#238a91] focus:ring-[#2a9dab] shadow-lg';
      default:
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg';
    }
  };

  return (
    <div className={`fixed inset-0 ${zIndex} overflow-y-auto`} style={{ zIndex: 9999 }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all max-w-md w-full border border-gray-100">
          <div className="bg-gradient-to-br from-white to-gray-50 px-6 pt-6 pb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
                {getIcon()}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-semibold text-gray-900 leading-6">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-base text-gray-600 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white px-6 py-4 flex flex-row-reverse gap-3 border-t border-gray-100">
            <button
              type="button"
              className={`inline-flex justify-center items-center rounded-xl border border-transparent shadow-sm px-6 py-2.5 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${getButtonStyles()} ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md transform hover:-translate-y-0.5'
              }`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                confirmText
              )}
            </button>
            <button
              type="button"
              className="inline-flex justify-center items-center rounded-xl border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
