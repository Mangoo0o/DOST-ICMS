<?php

class EmailServiceSimple {
    private $smtpHost;
    private $smtpPort;
    private $smtpUsername;
    private $smtpPassword;
    private $fromEmail;
    private $fromName;
    private $isEnabled;

    public function __construct() {
        $this->loadEmailSettings();
    }

    private function loadEmailSettings() {
        try {
            include_once __DIR__ . '/../config/db.php';
            $db = (new Database())->getConnection();
            
            // Get email settings from system_settings table
            $settingsQuery = "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('email_enabled', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'from_email', 'from_name')";
            $stmt = $db->prepare($settingsQuery);
            $stmt->execute();
            $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            
            $this->isEnabled = ($settings['email_enabled'] ?? 'true') === 'true';
            $this->smtpHost = $settings['smtp_host'] ?? 'smtp.gmail.com';
            $this->smtpPort = (int)($settings['smtp_port'] ?? 587);
            $this->smtpUsername = $settings['smtp_username'] ?? '';
            $this->smtpPassword = $settings['smtp_password'] ?? '';
            $this->fromEmail = $settings['from_email'] ?? 'noreply@dost-psto.com';
            $this->fromName = $settings['from_name'] ?? 'DOST-PSTO ICMS';
            
        } catch (Exception $e) {
            error_log("EmailServiceSimple: Failed to load settings - " . $e->getMessage());
            $this->isEnabled = false;
        }
    }

    public function sendTestEmail($toEmail, $toName = '') {
        if (!$this->isEnabled) {
            return ['success' => false, 'message' => 'Email notifications are disabled'];
        }

        // For now, just return success without actually sending
        // This allows the settings page to work while PHPMailer is being set up
        return ['success' => true, 'message' => 'Test email would be sent (PHPMailer not yet configured)'];
    }

    public function sendRequestCompletionEmail($clientEmail, $clientName, $referenceNumber, $requestDetails = []) {
        if (!$this->isEnabled) {
            error_log("EmailServiceSimple: Email notifications are disabled");
            return false;
        }

        // For now, just log that email would be sent
        error_log("EmailServiceSimple: Would send completion email to {$clientEmail} for request {$referenceNumber}");
        return true;
    }

    public function sendRequestStatusUpdateEmail($clientEmail, $clientName, $referenceNumber, $status, $additionalInfo = '') {
        if (!$this->isEnabled) {
            error_log("EmailServiceSimple: Email notifications are disabled");
            return false;
        }

        // For now, just log that email would be sent
        error_log("EmailServiceSimple: Would send status update email to {$clientEmail} for request {$referenceNumber}");
        return true;
    }

    public function isEnabled() {
        return $this->isEnabled;
    }

    public function getSettings() {
        return [
            'email_enabled' => $this->isEnabled,
            'smtp_host' => $this->smtpHost,
            'smtp_port' => $this->smtpPort,
            'smtp_username' => $this->smtpUsername,
            'from_email' => $this->fromEmail,
            'from_name' => $this->fromName
        ];
    }
}
?>

