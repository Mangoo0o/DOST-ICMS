/**
 * Calibration Notification Utility
 * Handles smart notification dispatching based on request sample count
 */

import { apiService } from '../services/api';

/**
 * Dispatches calibration completion notification only if request has multiple samples
 * @param {string} referenceNumber - The request reference number
 * @param {string} sampleId - The sample ID that was completed
 * @param {string} equipmentType - Type of equipment calibrated
 */
export const dispatchCalibrationCompletionNotification = async (referenceNumber, sampleId, equipmentType) => {
  try {
    // Get the number of samples in this request
    const sampleCount = await apiService.getSampleCountByReference(referenceNumber);
    
    console.log(`Request ${referenceNumber} has ${sampleCount} sample(s)`);
    
    // Only dispatch individual completion notification if there are multiple samples
    if (sampleCount > 1) {
      console.log(`Dispatching individual calibration completion notification for ${equipmentType}`);
      
      // Dispatch both the original event and a new individual completion event
      window.dispatchEvent(new CustomEvent('calibration-completed', {
        detail: {
          referenceNumber,
          sampleId,
          equipmentType,
          sampleCount,
          isIndividualCompletion: true
        }
      }));
      
      // Also dispatch a new event specifically for individual calibration completions
      window.dispatchEvent(new CustomEvent('individual-calibration-completed', {
        detail: {
          referenceNumber,
          sampleId,
          equipmentType,
          sampleCount,
          message: `Your ${equipmentType} calibration has been completed successfully!`,
          timestamp: new Date().toISOString()
        }
      }));
    } else {
      console.log(`Skipping individual completion notification - Request has only ${sampleCount} sample(s)`);
      console.log(`Will dispatch request completion notification when all samples are finished`);
    }
  } catch (error) {
    console.error('Error in calibration completion notification:', error);
    // Fallback: dispatch notification anyway to ensure no notifications are missed
    window.dispatchEvent(new CustomEvent('calibration-completed', {
      detail: {
        referenceNumber,
        sampleId,
        equipmentType,
        sampleCount: 'unknown',
        isIndividualCompletion: true
      }
    }));
  }
};

/**
 * Dispatches request completion notification (always dispatched)
 * @param {string} referenceNumber - The request reference number
 */
export const dispatchRequestCompletionNotification = (referenceNumber) => {
  console.log(`Dispatching request completion notification for ${referenceNumber}`);
  window.dispatchEvent(new CustomEvent('request-completed', {
    detail: {
      referenceNumber,
      isRequestCompletion: true
    }
  }));
};

export default {
  dispatchCalibrationCompletionNotification,
  dispatchRequestCompletionNotification
};
