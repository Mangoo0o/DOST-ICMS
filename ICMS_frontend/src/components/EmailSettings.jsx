import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const EmailSettings = () => {
    const [settings, setSettings] = useState({
        email_enabled: true,
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_username: '',
        smtp_password: '',
        from_email: '',
        from_name: 'DOST-PSTO ICMS'
    });
    
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testName, setTestName] = useState('');

    useEffect(() => {
        loadEmailSettings();
    }, []);

    const loadEmailSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/settings/email_settings.php', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                // Convert string values to appropriate types
                const processedData = { ...data.data };
                if (processedData.email_enabled !== undefined) {
                    processedData.email_enabled = processedData.email_enabled === 'true' || processedData.email_enabled === true;
                }
                if (processedData.smtp_port !== undefined) {
                    processedData.smtp_port = parseInt(processedData.smtp_port) || 587;
                }
                
                setSettings(prev => ({
                    ...prev,
                    ...processedData
                }));
            } else {
                toast.error('Failed to load email settings');
            }
        } catch (error) {
            console.error('Error loading email settings:', error);
            toast.error('Error loading email settings');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'smtp_port' ? parseInt(value) || 587 : value)
        }));
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const requestData = {
                settings: settings
            };
            
            // Debug: Log the data being sent
            console.log('Sending email settings:', requestData);
            
            const response = await fetch('http://localhost:8000/api/settings/email_settings.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('Email settings saved successfully');
            } else {
                console.error('Email settings save error:', data);
                toast.error(data.message || 'Failed to save email settings');
            }
        } catch (error) {
            console.error('Error saving email settings:', error);
            toast.error('Error saving email settings');
        } finally {
            setLoading(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            toast.error('Please enter a test email address');
            return;
        }

        setTesting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/settings/test_email.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    test_email: testEmail,
                    test_name: testName
                })
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('Test email sent successfully!');
            } else {
                toast.error(data.message || 'Failed to send test email');
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            toast.error('Error sending test email');
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Notification Settings</h2>
                <p className="text-gray-600">Configure email notifications for request status updates and completions.</p>
            </div>

            <div className="space-y-6">
                {/* Enable/Disable Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Enable Email Notifications</h3>
                        <p className="text-sm text-gray-600">Send automatic email notifications when request status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="email_enabled"
                            checked={Boolean(settings.email_enabled)}
                            onChange={handleInputChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {Boolean(settings.email_enabled) && (
                    <>
                        {/* SMTP Configuration (Host and Port hidden) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SMTP Username
                                </label>
                                <input
                                    type="text"
                                    name="smtp_username"
                                    value={settings.smtp_username}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="your-email@gmail.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SMTP Password
                                </label>
                                <input
                                    type="password"
                                    name="smtp_password"
                                    value={settings.smtp_password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your app password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Email
                                </label>
                                <input
                                    type="email"
                                    name="from_email"
                                    value={settings.from_email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="noreply@dost-psto.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Name
                                </label>
                                <input
                                    type="text"
                                    name="from_name"
                                    value={settings.from_name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="DOST-PSTO ICMS"
                                />
                            </div>
                        </div>

                        {/* Test Email Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Email Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Test Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="test@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Test Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={testName}
                                        onChange={(e) => setTestName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Test User"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleTestEmail}
                                disabled={testing || !testEmail}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {testing ? 'Sending...' : 'Send Test Email'}
                            </button>
                        </div>
                    </>
                )}

                {/* Save Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                        onClick={loadEmailSettings}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Configuration Help</h4>
                <div className="text-sm text-blue-700 space-y-2">
                    <p><strong>Gmail Setup:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>SMTP Host: smtp.gmail.com</li>
                        <li>SMTP Port: 587</li>
                        <li>Username: Your Gmail address</li>
                        <li>Password: Use an App Password (not your regular password)</li>
                    </ul>
                    <p className="mt-2"><strong>Note:</strong> Make sure to enable 2-factor authentication and generate an App Password for Gmail.</p>
                </div>
            </div>
        </div>
    );
};

export default EmailSettings;
