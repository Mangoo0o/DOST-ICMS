import React from 'react';
import { MdSave, MdCheckCircle } from 'react-icons/md';

const AutoSaveIndicator = ({ isSaving, lastSave, hasUnsavedChanges }) => {
  if (isSaving) {
    return (
      <div className="flex items-center text-blue-600 text-sm">
        <MdSave className="animate-spin mr-1" />
        Saving...
      </div>
    );
  }

  if (lastSave && !hasUnsavedChanges) {
    return (
      <div className="flex items-center text-green-600 text-sm">
        <MdCheckCircle className="mr-1" />
        Saved
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center text-orange-600 text-sm">
        <MdSave className="mr-1" />
        Unsaved changes
      </div>
    );
  }

  return null;
};

export default AutoSaveIndicator;
