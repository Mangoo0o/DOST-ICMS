<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

// Verify authentication
require_once __DIR__ . '/../auth/verify_token.php';
$user_data = verifyToken();

$db = new Database();
$pdo = $db->getConnection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit();
}

// Get role from query parameter
$role = isset($_GET['role']) ? $_GET['role'] : 'technical_manager';

// Validate role - allow any role for custom roles
if (empty($role)) {
    http_response_code(400);
    echo json_encode(['message' => 'Role is required']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM signatories WHERE role = ? AND is_active = 1 ORDER BY id DESC LIMIT 1");
    $stmt->execute([$role]);
    $signatory = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$signatory) {
        // Return default values if no signatory found
        $defaults = [
            'technical_manager' => ['name' => 'BERNADINE P. SUNIEGA', 'title' => 'Technical Manager'],
            'other' => ['name' => 'N/A', 'title' => 'N/A']
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $defaults[$role],
            'message' => 'Using default signatory'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'data' => [
                'name' => $signatory['name'],
                'title' => $signatory['title']
            ],
            'message' => 'Signatory retrieved successfully'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving signatory: ' . $e->getMessage()
    ]);
}
?>
