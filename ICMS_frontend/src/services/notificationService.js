/**
 * Notification Service
 * Handles notification events and updates across the application
 */

class NotificationService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Dispatch a notification event
   * @param {string} eventType - Type of notification event
   * @param {Object} data - Data to pass with the event
   */
  dispatch(eventType, data = {}) {
    const event = new CustomEvent(eventType, { detail: data });
    window.dispatchEvent(event);
    console.log(`Notification event dispatched: ${eventType}`, data);
  }

  /**
   * Listen for notification events
   * @param {string} eventType - Type of event to listen for
   * @param {Function} callback - Callback function to execute
   */
  listen(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
    
    window.addEventListener(eventType, callback);
  }

  /**
   * Remove event listener
   * @param {string} eventType - Type of event
   * @param {Function} callback - Callback function to remove
   */
  removeListener(eventType, callback) {
    window.removeEventListener(eventType, callback);
    
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Dispatch reservation status update
   * @param {string} referenceNumber - Reference number of the reservation
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data
   */
  notifyReservationUpdate(referenceNumber, status, additionalData = {}) {
    this.dispatch('reservation-updated', {
      referenceNumber,
      status,
      ...additionalData
    });
  }

  /**
   * Dispatch calibration completion
   * @param {string} referenceNumber - Reference number of the reservation
   * @param {Object} calibrationData - Calibration data
   */
  notifyCalibrationComplete(referenceNumber, calibrationData = {}) {
    this.dispatch('calibration-completed', {
      referenceNumber,
      ...calibrationData
    });
  }

  /**
   * Dispatch request completion
   * @param {string} referenceNumber - Reference number of the request
   * @param {Object} completionData - Completion data
   */
  notifyRequestComplete(referenceNumber, completionData = {}) {
    this.dispatch('request-completed', {
      referenceNumber,
      ...completionData
    });
  }

  /**
   * Dispatch payment update
   * @param {string} referenceNumber - Reference number of the request
   * @param {string} paymentStatus - Payment status
   * @param {Object} paymentData - Payment data
   */
  notifyPaymentUpdate(referenceNumber, paymentStatus, paymentData = {}) {
    this.dispatch('payment-updated', {
      referenceNumber,
      paymentStatus,
      ...paymentData
    });
  }

  /**
   * Dispatch general status update
   * @param {string} referenceNumber - Reference number
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data
   */
  notifyStatusUpdate(referenceNumber, status, additionalData = {}) {
    this.dispatch('status-updated', {
      referenceNumber,
      status,
      ...additionalData
    });
  }

  /**
   * Dispatch new request notification
   * @param {Object} requestData - Request data
   */
  notifyNewRequest(requestData) {
    this.dispatch('new-request', requestData);
  }

  /**
   * Dispatch request rejection
   * @param {string} referenceNumber - Reference number
   * @param {string} reason - Rejection reason
   */
  notifyRequestRejection(referenceNumber, reason) {
    this.dispatch('request-rejected', {
      referenceNumber,
      reason
    });
  }

  /**
   * Dispatch ready for pickup notification
   * @param {string} referenceNumber - Reference number
   * @param {Object} pickupData - Pickup data
   */
  notifyReadyForPickup(referenceNumber, pickupData = {}) {
    this.dispatch('ready-for-pickup', {
      referenceNumber,
      ...pickupData
    });
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();

// Export the class for testing purposes
export default NotificationService;
