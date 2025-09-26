import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmailSettings from '../components/EmailSettings';

const EmailSettingsPage = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        localStorage.setItem('reopenSettings', '1'); // Flag to reopen settings modal
        navigate('/dashboard'); // Go back to dashboard where settings modal will auto-open
    };

    return (
        <div className="p-6">
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2a9dab] text-white hover:bg-[#217a8c] rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            </div>
            
            <EmailSettings />
        </div>
    );
};

export default EmailSettingsPage;

