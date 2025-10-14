<?php
// CORS headers - allow specific origin for development
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Max-Age: 3600");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Make sure that the user is an admin
require_once __DIR__ . '/../auth/verify_token.php';

try {
    // Verify the token and get user data
    $authResult = verifyToken();
    
    // Check if token verification was successful
    if (!$authResult['success']) {
        http_response_code(401);
        echo json_encode(array("message" => $authResult['message'] || "Invalid token."));
        exit();
    }
    
    $userData = $authResult['user'];
    
    // Check if the user is an admin
    if ($userData->role !== 'admin') {
        http_response_code(403);
        echo json_encode(array("message" => "Access denied."));
        exit();
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid token."));
    exit();
}

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create a log file
$logFile = __DIR__ . '/debug.log';
file_put_contents($logFile, "Request started at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

include_once __DIR__ . '/../config/db.php';

// Log the raw input
$raw_data = file_get_contents("php://input");
file_put_contents($logFile, "Raw input: " . $raw_data . "\n", FILE_APPEND);

$data = json_decode($raw_data);
file_put_contents($logFile, "Decoded data: " . print_r($data, true) . "\n", FILE_APPEND);

try {
    $database = new Database();
    $db = $database->getConnection();
    file_put_contents($logFile, "Database connection successful\n", FILE_APPEND);
} catch (Exception $e) {
    file_put_contents($logFile, "Database connection failed: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed"));
    exit();
}

if(
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email) &&
    !empty($data->role)
) {
    file_put_contents($logFile, "All required fields are present\n", FILE_APPEND);

    // Check if email already exists
    $check_query = "SELECT id FROM users WHERE email = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([$data->email]);
    
    if($check_stmt->rowCount() > 0) {
        file_put_contents($logFile, "Email already exists: " . $data->email . "\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(array("message" => "Email already exists."));
        exit();
    }

    // Generate a secure temporary password and mark user to require password change
    $plain_password = bin2hex(random_bytes(6)); // 12 hex chars
    $password_hash = password_hash($plain_password, PASSWORD_BCRYPT);

    // Try to insert with require_password_change column if it exists
    $query = "INSERT INTO users (first_name, last_name, email, password, role, status" .
             ", require_password_change) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    $role = strtolower(str_replace(' ', '_', $data->role));
    
    file_put_contents($logFile, "Attempting to insert user with data:\n" . 
        "First Name: " . $data->first_name . "\n" .
        "Last Name: " . $data->last_name . "\n" .
        "Email: " . $data->email . "\n" .
        "Role: " . $role . "\n", FILE_APPEND);

    try {
        $result = $stmt->execute([
            $data->first_name,
            $data->last_name,
            $data->email,
            $password_hash,
            $role,
            true,
            1
        ]);
        
        if($result) {
            $user_id = $db->lastInsertId();
            file_put_contents($logFile, "User created successfully with ID: " . $user_id . "\n", FILE_APPEND);
            
            // If the new user is an admin, deactivate the current admin and invalidate their token
            if($role === 'admin') {
                file_put_contents($logFile, "New admin created, deactivating current admin (ID: " . $userData->id . ")\n", FILE_APPEND);
                
                // First, get the current admin's password to store as original_password
                $get_password_query = "SELECT password FROM users WHERE id = ? AND role = 'admin'";
                $get_password_stmt = $db->prepare($get_password_query);
                $get_password_stmt->execute([$userData->id]);
                $current_password = $get_password_stmt->fetchColumn();
                
                if($current_password) {
                    // Deactivate current admin and store original password
                    $deactivate_query = "UPDATE users SET status = 0, original_password = ? WHERE id = ? AND role = 'admin'";
                    $deactivate_stmt = $db->prepare($deactivate_query);
                    $deactivate_result = $deactivate_stmt->execute([$current_password, $userData->id]);
                    
                    if($deactivate_result) {
                        file_put_contents($logFile, "Current admin (ID: " . $userData->id . ") deactivated and original password stored\n", FILE_APPEND);
                        
                        // Invalidate all tokens for the current admin by updating their password hash
                        // This will make all existing tokens invalid
                        $invalidate_query = "UPDATE users SET password = ? WHERE id = ?";
                        $invalidate_stmt = $db->prepare($invalidate_query);
                        $invalidate_password = password_hash(bin2hex(random_bytes(32)), PASSWORD_BCRYPT);
                        $invalidate_stmt->execute([$invalidate_password, $userData->id]);
                        
                        file_put_contents($logFile, "Current admin (ID: " . $userData->id . ") tokens invalidated\n", FILE_APPEND);
                    } else {
                        file_put_contents($logFile, "Failed to deactivate current admin (ID: " . $userData->id . ")\n", FILE_APPEND);
                    }
                } else {
                    file_put_contents($logFile, "Could not retrieve current admin password (ID: " . $userData->id . ")\n", FILE_APPEND);
                }
            }
            
            // Attempt to send welcome email with credentials
            try {
                require_once __DIR__ . '/../services/EmailService.php';
                $emailService = new EmailService();
                $fullName = trim($data->first_name . ' ' . $data->last_name);
                if (!$emailService->sendUserWelcomeEmail($data->email, $fullName, $plain_password)) {
                    file_put_contents($logFile, "Email service reported failure when sending new user email\n", FILE_APPEND);
                }
            } catch (Throwable $te) {
                file_put_contents($logFile, "Failed to send welcome email: " . $te->getMessage() . "\n", FILE_APPEND);
            }

            // Best-effort: log add_user action
            try {
                $db->exec("CREATE TABLE IF NOT EXISTS system_logs (id INT AUTO_INCREMENT PRIMARY KEY, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, user_id INT NULL, action VARCHAR(255) NOT NULL, details TEXT NULL, ip_address VARCHAR(45) NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
                $details = json_encode([
                    'new_user_id' => (int)$user_id,
                    'email' => (string)$data->email,
                    'role' => (string)$role
                ]);
                $stmtLog = $db->prepare("INSERT INTO system_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
                $stmtLog->execute([$userData->id ?? null, 'add_user', $details, null]);
            } catch (Exception $ignore) {}

            http_response_code(201);
            $response_data = array(
                "message" => "User created. Temporary password emailed.",
                "id" => $user_id,
                "first_name" => $data->first_name,
                "last_name" => $data->last_name,
                "email" => $data->email,
                "role" => $role,
                "status" => true,
                "require_password_change" => true
            );
            
            // Add admin deactivation info to response if applicable
            if($role === 'admin') {
                $response_data["admin_deactivated"] = true;
                $response_data["message"] = "Admin created. Current admin has been deactivated and logged out. Temporary password emailed.";
            }
            
            echo json_encode($response_data);
        } else {
            throw new Exception("Failed to execute insert statement");
        }
    } catch (Exception $e) {
        file_put_contents($logFile, "Error creating user: " . $e->getMessage() . "\n", FILE_APPEND);
        http_response_code(503);
        echo json_encode(array(
            "message" => "Unable to create user.",
            "error" => $e->getMessage()
        ));
    }
} else {
    file_put_contents($logFile, "Missing required fields\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode(array(
        "message" => "Unable to create user. Data is incomplete.",
        "received_data" => $data
    ));
}

file_put_contents($logFile, "Request completed at " . date('Y-m-d H:i:s') . "\n\n", FILE_APPEND);
?> 