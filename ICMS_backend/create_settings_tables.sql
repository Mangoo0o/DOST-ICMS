-- Create settings tables for ICMS
-- Run this script to set up the settings backup/restore functionality

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preference_key VARCHAR(255) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_preference (user_id, preference_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Theme settings table
CREATE TABLE IF NOT EXISTS theme_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    theme_name VARCHAR(100) NOT NULL,
    theme_config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_theme (user_id, theme_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_notification (user_id, notification_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default system settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('app_name', 'ICMS DOST-PSTO', 'Application name'),
('app_version', '1.0.0', 'Application version'),
('backup_enabled', 'true', 'Enable settings backup functionality'),
('max_backup_size', '10485760', 'Maximum backup file size in bytes (10MB)'),
('backup_retention_days', '30', 'Number of days to retain backup files'),
('theme_default', 'system', 'Default theme for new users'),
('notifications_enabled', 'true', 'Enable notifications by default');

-- Insert default user preferences for existing users
INSERT IGNORE INTO user_preferences (user_id, preference_key, preference_value)
SELECT 
    u.id,
    'theme',
    'system'
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_preferences up 
    WHERE up.user_id = u.id AND up.preference_key = 'theme'
);

-- Insert default notification preferences for existing users
INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, settings)
SELECT 
    u.id,
    'email',
    TRUE,
    '{"frequency": "immediate", "types": ["request_updates", "system_alerts"]}'
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = u.id AND np.notification_type = 'email'
);

INSERT IGNORE INTO notification_preferences (user_id, notification_type, enabled, settings)
SELECT 
    u.id,
    'browser',
    TRUE,
    '{"frequency": "immediate", "types": ["request_updates", "system_alerts"]}'
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = u.id AND np.notification_type = 'browser'
);
