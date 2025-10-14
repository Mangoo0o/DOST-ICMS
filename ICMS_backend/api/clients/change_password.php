<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../auth/verify_token.php';
require_once __DIR__ . '/../config/db.php';

try { 
    $authResult = verifyToken(); 
    if (!$authResult['success']) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => $authResult['message'] || "Invalid token."]); 
        exit();
    }
    $userData = $authResult['user'];
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid token."]); exit();
}

if ($userData->role !== 'client') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Access denied."]); exit();
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);
if (!$data) { http_response_code(400); echo json_encode(["success" => false, "message" => "Invalid JSON body"]); exit(); }

$current_password = isset($data['current_password']) ? trim($data['current_password']) : '';
$new_password = isset($data['new_password']) ? trim($data['new_password']) : '';
$confirm_password = isset($data['confirm_password']) ? trim($data['confirm_password']) : '';

if ($current_password === '' || $new_password === '' || $confirm_password === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Current, new, and confirm password are required"]); exit();
}
if ($new_password !== $confirm_password) { http_response_code(400); echo json_encode(["success" => false, "message" => "New password and confirmation do not match"]); exit(); }
if (strlen($new_password) < 8) { http_response_code(400); echo json_encode(["success" => false, "message" => "New password must be at least 8 characters"]); exit(); }
// Require at least one letter, one number, and one special character; allow any characters
if (!preg_match('/^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$/', $new_password)) { http_response_code(400); echo json_encode(["success" => false, "message" => "New password must have at least 1 letter, 1 number, and 1 special character"]); exit(); }

try {
    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->prepare("SELECT password, COALESCE(require_password_change, 0) AS require_password_change FROM clients WHERE id = ?");
    $stmt->execute([$userData->id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) { http_response_code(404); echo json_encode(["success" => false, "message" => "Client not found"]); exit(); }

    $current_hash = $row['password'];
    if (!password_verify($current_password, $current_hash)) { http_response_code(400); echo json_encode(["success" => false, "message" => "Current password is incorrect"]); exit(); }
    if (password_verify($new_password, $current_hash)) { http_response_code(400); echo json_encode(["success" => false, "message" => "New password must be different from current password"]); exit(); }

    $new_hash = password_hash($new_password, PASSWORD_BCRYPT);
    $mustChange = ($row['require_password_change'] == 1 || $row['require_password_change'] === '1');
    if ($mustChange) {
        $update = $db->prepare("UPDATE clients SET password = ?, require_password_change = 0 WHERE id = ?");
        $ok = $update->execute([$new_hash, $userData->id]);
    } else {
        $update = $db->prepare("UPDATE clients SET password = ? WHERE id = ?");
        $ok = $update->execute([$new_hash, $userData->id]);
    }
    if ($ok) {
        // Best-effort: log change_password action for clients
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS system_logs (id INT AUTO_INCREMENT PRIMARY KEY, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, user_id INT NULL, action VARCHAR(255) NOT NULL, details TEXT NULL, ip_address VARCHAR(45) NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            $details = json_encode(['client_id' => (int)$userData->id]);
            $stmtLog = $db->prepare("INSERT INTO system_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
            // Store acting id in user_id column for unified lookup
            $stmtLog->execute([$userData->id ?? null, 'change_password', $details, null]);
        } catch (Exception $ignore) {}
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Password updated successfully"]);
    }
    else { http_response_code(500); echo json_encode(["success" => false, "message" => "Failed to update password"]); }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}

?>


