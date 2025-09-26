import React from 'react';

const Modal = ({ isOpen, onClose, onConfirm, title, message, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 relative ${className || "w-full max-w-md mx-auto"} max-h-[85vh] overflow-y-auto`}>
        {/* X Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 focus:outline-none"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center mb-4">
          {/* Removed icon here */}
          <div className="ml-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
        </div>
        <div className="mt-2">
          {message && (
            React.isValidElement(message)
              ? message
              : <p className="text-sm text-gray-500 dark:text-gray-300">{message}</p>
          )}
          {children}
        </div>
        {/* Footer: Only show Confirm if present */}
        {onConfirm && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 