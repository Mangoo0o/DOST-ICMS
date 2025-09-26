<?php
require_once __DIR__ . '/../config/cors.php';
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Max-Age: 3600');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
include_once '../auth/verify_token.php';

// Verify token and get user data
$user_data = verifyToken();

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503); // Service Unavailable
    echo json_encode(['message' => 'Database connection failed.']);
    exit();
}

if (!isset($_GET['sample_id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Sample ID is required.']);
    exit();
}

$sample_id = $_GET['sample_id'];

$stmt = $db->prepare('SELECT * FROM calibration_records WHERE sample_id = :sample_id ORDER BY created_at DESC LIMIT 1');
$stmt->bindParam(':sample_id', $sample_id, PDO::PARAM_INT);
$stmt->execute();

$record = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$record) {
    // Return 200 with empty data instead of 404 for samples without calibration records
    echo json_encode([
        'message' => 'No calibration record found for this sample.',
        'sample_id' => $sample_id,
        'has_calibration' => false
    ]);
    exit();
}

// Validate that we have the required fields
if (empty($record['calibration_type'])) {
    echo json_encode([
        'message' => 'Calibration record found but missing calibration type.',
        'sample_id' => $sample_id,
        'has_calibration' => false,
        'record' => $record
    ]);
    exit();
}

echo json_encode($record);
?>
