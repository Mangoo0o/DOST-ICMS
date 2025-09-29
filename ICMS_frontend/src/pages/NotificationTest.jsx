import React, { useState } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationTest = () => {
  const [testRefNo, setTestRefNo] = useState('TEST-001');

  const testNotifications = {
    reservationUpdate: () => {
      notificationService.notifyReservationUpdate(testRefNo, 'in_progress', {
        message: 'Request is now in progress'
      });
    },
    
    calibrationComplete: () => {
      notificationService.notifyCalibrationComplete(testRefNo, {
        equipmentType: 'Weighing Scale',
        message: 'Calibration completed successfully'
      });
    },
    
    requestComplete: () => {
      notificationService.notifyRequestComplete(testRefNo, {
        message: 'Request has been completed'
      });
    },
    
    paymentUpdate: () => {
      notificationService.notifyPaymentUpdate(testRefNo, 'pending', {
        amount: 1500,
        message: 'Payment is pending'
      });
    },
    
    statusUpdate: () => {
      notificationService.notifyStatusUpdate(testRefNo, 'ready_for_pickup', {
        message: 'Ready for pickup'
      });
    },
    
    newRequest: () => {
      notificationService.notifyNewRequest({
        referenceNumber: testRefNo,
        clientName: 'Test Client',
        message: 'New request submitted'
      });
    },
    
    requestRejection: () => {
      notificationService.notifyRequestRejection(testRefNo, 'Incomplete documentation');
    },
    
    readyForPickup: () => {
      notificationService.notifyReadyForPickup(testRefNo, {
        location: 'Main Office',
        message: 'Ready for pickup at main office'
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notification System Test</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Reference Number:
        </label>
        <input
          type="text"
          value={testRefNo}
          onChange={(e) => setTestRefNo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter reference number"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(testNotifications).map(([key, handler]) => (
          <button
            key={key}
            onClick={handler}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Click on any of the test buttons above</li>
          <li>Check the notification bell icon in the navbar</li>
          <li>You should see a red badge with the notification count</li>
          <li>Click on the notification bell to view the notifications</li>
          <li>Each notification should show the appropriate status and styling</li>
        </ol>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Notification Types:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li><strong>Reservation Update:</strong> Shows when request status changes</li>
          <li><strong>Calibration Complete:</strong> Shows when calibration is finished</li>
          <li><strong>Request Complete:</strong> Shows when entire request is completed</li>
          <li><strong>Payment Update:</strong> Shows payment status changes</li>
          <li><strong>Status Update:</strong> Shows general status changes</li>
          <li><strong>New Request:</strong> Shows when new requests are submitted</li>
          <li><strong>Request Rejection:</strong> Shows when requests are rejected</li>
          <li><strong>Ready for Pickup:</strong> Shows when items are ready for pickup</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationTest;
