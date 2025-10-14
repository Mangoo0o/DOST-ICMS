<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

class EmailService {
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
            require_once __DIR__ . '/../config/db.php';
            // Robust autoload include: prefer ICMS_backend/vendor, fallback to project root vendor
            $backendAutoload = __DIR__ . '/../../vendor/autoload.php';
            $rootAutoload = __DIR__ . '/../../../vendor/autoload.php';
            if (file_exists($backendAutoload)) {
                require_once $backendAutoload;
            } elseif (file_exists($rootAutoload)) {
                require_once $rootAutoload;
            } else {
                throw new Exception('Composer autoload not found');
            }

            $db = (new Database())->getConnection();
            if (!$db) {
                throw new Exception('Database connection failed');
            }

            $settingsQuery = "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('email_enabled', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password')";
            $stmt = $db->prepare($settingsQuery);
            $stmt->execute();
            $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

            // Hardcode email notifications ON regardless of DB
            $this->isEnabled = true;
            // Hardcode SMTP host
            $this->smtpHost = 'smtp.gmail.com';
            // Hardcode SMTP port to 587 (TLS)
            $this->smtpPort = 587;
            $this->smtpUsername = $settings['smtp_username'] ?? '';
            $this->smtpPassword = $settings['smtp_password'] ?? '';
            // SMTP username automatically becomes the sender email
            $this->fromEmail = $settings['smtp_username'] ?? '';
            $this->fromName = 'ICMS';
        } catch (Exception $e) {
            error_log('EmailService load settings failed: ' . $e->getMessage());
            $this->isEnabled = false;
        }
    }

    public function isEnabled() {
        return $this->isEnabled;
    }

    public function getSettings() {
        return [
            'email_enabled' => $this->isEnabled,
            'smtp_host' => $this->smtpHost,
            'smtp_port' => $this->smtpPort,
            'smtp_username' => $this->smtpUsername
        ];
    }

    public function sendTestEmail($toEmail, $toName = '') {
        try {
            if (!$this->isEnabled) {
                return ['success' => false, 'message' => 'Email notifications are disabled'];
            }
            $this->assertConfig();
            $title = 'ICMS Test Email';
            $intro = 'This is a test email from ICMS to confirm that your SMTP settings are working.';
            $details = [
                'Time Sent' => date('Y-m-d H:i:s'),
                'From' => $this->fromName . ' <' . $this->fromEmail . '>',
                'SMTP Host' => $this->smtpHost,
                'SMTP Port' => (string)$this->smtpPort,
            ];
            $html = $this->buildEmailTemplate($title, $intro, $details, 'If you did not request this test, you can ignore this message.');
            $text = $this->buildPlainText($title, $intro, $details);
            $this->sendViaMailer($toEmail, $toName, $title, $html, $text);
            return ['success' => true, 'message' => 'Test email sent successfully'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to send test email: ' . $e->getMessage()];
        }
    }

    public function sendRequestCompletionEmail($clientEmail, $clientName, $referenceNumber, $requestDetails = []) {
        try {
            if (!$this->isEnabled) {
                return false;
            }
            $this->assertConfig();
            $subject = 'Your ICMS Request is Completed • ' . $referenceNumber;
            $intro = 'Great news! Your calibration request has been completed.';
            $details = [
                'Reference Number' => $referenceNumber,
                'Total Samples' => isset($requestDetails['total_samples']) ? (string)$requestDetails['total_samples'] : '—',
                'Completed Samples' => isset($requestDetails['completed_samples']) ? (string)$requestDetails['completed_samples'] : '—',
                'Completion Date' => date('Y-m-d'),
            ];
            
            // Add payment information if available
            if (isset($requestDetails['total_amount']) && !empty($requestDetails['total_amount'])) {
                $details['Total Amount'] = 'Php ' . number_format($requestDetails['total_amount'], 2);
            }
            if (isset($requestDetails['remaining_balance']) && !empty($requestDetails['remaining_balance'])) {
                $details['Remaining Balance'] = 'Php ' . number_format($requestDetails['remaining_balance'], 2);
            }
            if (isset($requestDetails['payment_status']) && !empty($requestDetails['payment_status'])) {
                $paymentStatus = ucfirst(strtolower($requestDetails['payment_status']));
                $details['Payment Status'] = $paymentStatus;
            }
            
            $footer = 'Thank you for choosing DOST-PSTO ICMS. Please settle your payment to complete the transaction.';
            $html = $this->buildEmailTemplate('Request Completed', $intro, $details, $footer);
            $text = $this->buildPlainText('Request Completed', $intro, $details);
            $this->sendViaMailer($clientEmail, $clientName, $subject, $html, $text);
            return true;
        } catch (Exception $e) {
            error_log('sendRequestCompletionEmail failed: ' . $e->getMessage());
            return false;
        }
    }

    public function sendRequestAcceptanceEmail($clientEmail, $clientName, $referenceNumber, $requestDetails = []) {
        try {
            if (!$this->isEnabled) {
                return false;
            }
            $this->assertConfig();
            $subject = 'Your ICMS Request Has Been Accepted • ' . $referenceNumber;
            $intro = 'Great news! Your calibration request has been accepted and is now in progress.';
            $details = [
                'Reference Number' => $referenceNumber,
                'Status' => 'ACCEPTED - IN PROGRESS',
                'Total Samples' => isset($requestDetails['total_samples']) ? (string)$requestDetails['total_samples'] : '—',
                'Expected Completion' => isset($requestDetails['expected_completion']) ? $requestDetails['expected_completion'] : '—',
                'Scheduled Date' => isset($requestDetails['scheduled_date']) ? $requestDetails['scheduled_date'] : '—',
            ];
            
            // Add attachment information if available
            if (isset($requestDetails['has_attachment']) && $requestDetails['has_attachment']) {
                $details['Attachment'] = 'Yes - ' . ($requestDetails['attachment_name'] ?? 'File attached');
                if (isset($requestDetails['attachment_size'])) {
                    $details['Attachment Size'] = $this->formatFileSize($requestDetails['attachment_size']);
                }
            }
            
            $footer = 'Your request is now being processed. We will notify you when it is completed.';
            $html = $this->buildEmailTemplate('Request Accepted', $intro, $details, $footer);
            $text = $this->buildPlainText('Request Accepted', $intro, $details);
            $this->sendViaMailer($clientEmail, $clientName, $subject, $html, $text);
            return true;
        } catch (Exception $e) {
            error_log('sendRequestAcceptanceEmail failed: ' . $e->getMessage());
            return false;
        }
    }

    public function sendCalibrationCompletionEmail($clientEmail, $clientName, $referenceNumber, $sampleDetails = []) {
        try {
            if (!$this->isEnabled) {
                return false;
            }
            $this->assertConfig();
            $subject = 'Calibration Completed • ' . $referenceNumber;
            $intro = 'Great news! Your equipment calibration has been completed successfully.';
            $details = [
                'Reference Number' => $referenceNumber,
                'Status' => 'Completed',
                'Equipment Type' => isset($sampleDetails['equipment_type']) ? $sampleDetails['equipment_type'] : '—',
                'Serial Number' => isset($sampleDetails['serial_number']) ? $sampleDetails['serial_number'] : '—',
                'Calibration Date' => isset($sampleDetails['calibration_date']) ? $sampleDetails['calibration_date'] : date('Y-m-d'),
                'Calibrated By' => isset($sampleDetails['calibrated_by']) ? $sampleDetails['calibrated_by'] : 'DOST-PSTO Engineer',
            ];
            
            $footer = 'Your equipment has been successfully calibrated and is ready for use. You will receive a final notification when all equipment in your request is completed.';
            $html = $this->buildEmailTemplate('Calibration Completed', $intro, $details, $footer);
            $text = $this->buildPlainText('Calibration Completed', $intro, $details);
            $this->sendViaMailer($clientEmail, $clientName, $subject, $html, $text);
            return true;
        } catch (Exception $e) {
            error_log('sendCalibrationCompletionEmail failed: ' . $e->getMessage());
            return false;
        }
    }

    public function sendCalibrationStartEmail($clientEmail, $clientName, $referenceNumber, $sampleDetails = []) {
        try {
            if (!$this->isEnabled) {
                return false;
            }
            $this->assertConfig();
            $subject = 'Calibration Started • ' . $referenceNumber;
            $intro = 'Your calibration process has begun! We are now working on your equipment.';
            $details = [
                'Reference Number' => $referenceNumber,
                'Status' => 'Ongoing',
                'Equipment Type' => isset($sampleDetails['equipment_type']) ? $sampleDetails['equipment_type'] : '—',
                'Serial Number' => isset($sampleDetails['serial_number']) ? $sampleDetails['serial_number'] : '—',
                'Expected Completion' => isset($sampleDetails['expected_completion']) ? $sampleDetails['expected_completion'] : '—',
            ];
            
            $footer = 'Our Engineer is now calibrating your equipment. You will receive another notification when the calibration is completed.';
            $html = $this->buildEmailTemplate('Calibration Started', $intro, $details, $footer);
            $text = $this->buildPlainText('Calibration Started', $intro, $details);
            $this->sendViaMailer($clientEmail, $clientName, $subject, $html, $text);
            return true;
        } catch (Exception $e) {
            error_log('sendCalibrationStartEmail failed: ' . $e->getMessage());
            return false;
        }
    }

    public function sendRequestCreationEmail($clientEmail, $clientName, $referenceNumber, $requestDetails = []) {
        try {
            if (!$this->isEnabled) {
                return false;
            }
            $this->assertConfig();
            $subject = 'Your ICMS Request Has Been Submitted • ' . $referenceNumber;
            $intro = 'Thank you! Your calibration request has been successfully submitted.';
            $details = [
                'Reference Number' => $referenceNumber,
                'Status' => 'SUBMITTED - PENDING REVIEW',
                'Total Samples' => isset($requestDetails['total_samples']) ? (string)$requestDetails['total_samples'] : '—',
                'Expected Completion' => isset($requestDetails['expected_completion']) ? $requestDetails['expected_completion'] : '—',
                'Scheduled Date' => isset($requestDetails['scheduled_date']) ? $requestDetails['scheduled_date'] : '—',
            ];
            
            // Add attachment information if available
            if (isset($requestDetails['has_attachment']) && $requestDetails['has_attachment']) {
                $details['Attachment'] = 'Yes - ' . ($requestDetails['attachment_name'] ?? 'File attached');
                if (isset($requestDetails['attachment_size'])) {
                    $details['Attachment Size'] = $this->formatFileSize($requestDetails['attachment_size']);
                }
            }
            
            $footer = 'Your request is now under review. You will receive another notification when it is accepted and processing begins.';
            $html = $this->buildEmailTemplate('Request Submitted', $intro, $details, $footer);
            $text = $this->buildPlainText('Request Submitted', $intro, $details);
            $this->sendViaMailer($clientEmail, $clientName, $subject, $html, $text);
            return true;
        } catch (Exception $e) {
            error_log('sendRequestCreationEmail failed: ' . $e->getMessage());
            return false;
        }
    }

    public function sendClientWelcomeEmail($clientEmail, $clientName, $plainPassword) {
        try {
            if (!$this->isEnabled) {
                return false;
            }
            $this->assertConfig();
            $subject = 'Your ICMS Client Account Details';
            $intro = 'Welcome to DOST-PSTO ICMS. Your client account has been created.';
            $details = [
                'Name' => $clientName,
                'Email' => $clientEmail,
                'Temporary Password' => $plainPassword,
            ];
            $footer = 'For security, please log in and change your password immediately.';
            $html = $this->buildEmailTemplate('Welcome to ICMS', $intro, $details, $footer);
            $text = $this->buildPlainText('Welcome to ICMS', $intro, $details);
            $this->sendViaMailer($clientEmail, $clientName, $subject, $html, $text);
            return true;
        } catch (Exception $e) {
            error_log('sendClientWelcomeEmail failed: ' . $e->getMessage());
            return false;
        }
    }

    public function sendUserWelcomeEmail($userEmail, $userName, $plainPassword) {
        try {
            if (!$this->isEnabled) {
                return false;
            }
            $this->assertConfig();
            $subject = 'Your ICMS User Account Details';
            $intro = 'An administrator created an ICMS account for you.';
            $details = [
                'Name' => $userName,
                'Email' => $userEmail,
                'Temporary Password' => $plainPassword,
            ];
            $footer = 'For security, log in and change your password immediately.';
            $html = $this->buildEmailTemplate('Welcome to ICMS', $intro, $details, $footer);
            $text = $this->buildPlainText('Welcome to ICMS', $intro, $details);
            $this->sendViaMailer($userEmail, $userName, $subject, $html, $text);
            return true;
        } catch (Exception $e) {
            error_log('sendUserWelcomeEmail failed: ' . $e->getMessage());
            return false;
        }
    }

    private function assertConfig() {
        $missing = [];
        if (empty($this->smtpHost)) { $missing[] = 'smtp_host'; }
        if (empty($this->smtpPort)) { $missing[] = 'smtp_port'; }
        if (empty($this->smtpUsername)) { $missing[] = 'smtp_username'; }
        if (empty($this->smtpPassword)) { $missing[] = 'smtp_password'; }
        // SMTP username automatically becomes the sender email
        if (!empty($missing)) {
            throw new Exception('SMTP configuration is incomplete: missing ' . implode(', ', $missing));
        }
    }

    private function sendViaMailer($toEmail, $toName, $subject, $htmlBody, $altBody = '') {
        $mail = new PHPMailer(true);
        try {
            //Server settings
            $mail->isSMTP();
            $mail->Host = $this->smtpHost;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtpUsername;
            $mail->Password = $this->smtpPassword;
            $mail->Port = $this->smtpPort;

            if ($this->smtpPort == 587) {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } elseif ($this->smtpPort == 465) {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            }

            //Recipients
            $mail->setFrom($this->fromEmail, $this->fromName);
            $mail->addAddress($toEmail, $toName);

            //Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = $altBody ?: strip_tags($htmlBody);

            $mail->send();
        } catch (PHPMailerException $e) {
            throw new Exception('Mailer Error: ' . $e->getMessage());
        }
    }

    private function buildEmailTemplate($title, $intro, array $details, $footerNote = '') {
        $rows = '';
        $i = 0;
        foreach ($details as $label => $value) {
            $i++;
            $bg = ($i % 2 === 0) ? '#f8fafc' : '#ffffff';
            $rows .= '<tr style="background:' . $bg . '">'
                . '<td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#334155;width:42%;font-weight:600">' . htmlspecialchars((string)$label) . '</td>'
                . '<td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#0f172a">' . htmlspecialchars((string)$value) . '</td>'
                . '</tr>';
        }
        return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:24px;background:#ffffff">'
            . '<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:680px;margin:0 auto">'
            . '<tr><td style="padding:0 12px">'
            .   '<table width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 24px rgba(15,23,42,0.12)">'
            .     '<tr>'
            .       '<td style="background:#0ea5e9;color:#ffffff;padding:24px 24px 20px 24px">'
            .         '<div style="font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:14px;opacity:.9">DOST‑PSTO ICMS</div>'
            .         '<div style="font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:22px;font-weight:700;margin-top:4px">' . htmlspecialchars((string)$title) . '</div>'
            .       '</td>'
            .     '</tr>'
            .     '<tr>'
            .       '<td style="padding:20px 24px 8px 24px">'
            .         '<p style="margin:0 0 12px 0;color:#334155;line-height:1.6;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:14px">' . htmlspecialchars((string)$intro) . '</p>'
            .       '</td>'
            .     '</tr>'
            .     '<tr>'
            .       '<td style="padding:0 24px 24px 24px">'
            .         '<table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">'
            .           $rows
            .         '</table>'
            .       '</td>'
            .     '</tr>'
            .     '<tr>'
            .       '<td style="padding:0 24px 24px 24px">'
            .         '<p style="margin:0;color:#64748b;font-size:12px;font-family:Segoe UI,Roboto,Arial,sans-serif">' . htmlspecialchars((string)$footerNote) . '</p>'
            .         '<p style="margin:6px 0 0 0;color:#94a3b8;font-size:12px;font-family:Segoe UI,Roboto,Arial,sans-serif">This is an automated message from the ICMS system.</p>'
            .       '</td>'
            .     '</tr>'
            .   '</table>'
            .   '<div style="text-align:center;color:#e0f2fe;font-size:12px;font-family:Segoe UI,Roboto,Arial,sans-serif;margin-top:16px">© ' . date('Y') . ' DOST‑PSTO ICMS</div>'
            . '</td></tr>'
            . '</table>'
            . '</body></html>';
    }

    private function buildPlainText($title, $intro, array $details) {
        $lines = [$title, '', $intro, ''];
        foreach ($details as $label => $value) {
            $lines[] = $label . ': ' . (is_scalar($value) ? (string)$value : json_encode($value));
        }
        return implode("\n", $lines);
    }

    private function formatFileSize($bytes) {
        if ($bytes == 0) return '0 Bytes';
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes) / log($k));
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }
}

?>


