<?php
require_once '../config/cors.php';
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['reservation_ref_no']) ||
    empty($data['section']) ||
    empty($data['type']) ||
    empty($data['range']) ||
    empty($data['serial_no']) ||
    !isset($data['price'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing required fields for sample. Ensure sample, test request/calibration, calibration test/method, and sample code are provided.']);
    exit();
}

$reservation_ref_no = $data['reservation_ref_no'];
$section = $data['section'];
$type = $data['type'];
$range = $data['range'];
$serial_no = $data['serial_no'];
$price = isset($data['price']) ? str_replace(',', '', (string)$data['price']) : '0';
if ($price === '' || !is_numeric($price)) { $price = '0'; }
$quantity = isset($data['quantity']) ? $data['quantity'] : 1; // default to 1 when not provided

try {
    // Check duplicate sample code within the same reservation
    $dupStmt = $db->prepare("SELECT COUNT(*) FROM sample WHERE reservation_ref_no = ? AND LOWER(TRIM(serial_no)) = LOWER(TRIM(?))");
    $dupStmt->execute([$reservation_ref_no, $serial_no]);
    if ($dupStmt->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(['message' => 'Duplicate sample code found for this reservation.']);
        exit();
    }

    $stmt = $db->prepare(
        "INSERT INTO sample (reservation_ref_no, section, type, `range`, serial_no, price, quantity, status, is_calibrated, date_completed) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, NULL)"
    );

    $stmt->execute([
        $reservation_ref_no,
        $section,
        $type,
        $range,
        $serial_no,
        $price,
        $quantity
    ]);

    $sample_id = $db->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'message' => 'Sample added successfully',
        'id' => $sample_id
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database Error: ' . $e->getMessage()]);
}
?> 