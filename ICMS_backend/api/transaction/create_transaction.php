<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers, Access-Control-Allow-Methods');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'));
$ref_no = $data->reservation_ref_no ?? null;

if (!$ref_no) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing reservation_ref_no']);
    exit();
}

try {
    // Calculate total amount for this reservation
    $sample_stmt = $db->prepare("SELECT price FROM sample WHERE reservation_ref_no = ?");
    $sample_stmt->execute([$ref_no]);
    $total_amount = 0;
    while ($eq = $sample_stmt->fetch(PDO::FETCH_ASSOC)) {
        $total_amount += floatval($eq['price']);
    }

    // Insert transaction for this reservation
    $stmt = $db->prepare(
        "INSERT INTO `transaction` (reservation_ref_no, amount, balance, status, created_at) VALUES (?, ?, ?, ?, NOW())"
    );
    if (!$stmt->execute([$ref_no, $total_amount, $total_amount, 'unpaid'])) {
        throw new Exception('SQL error (transaction insert): ' . implode(' | ', $stmt->errorInfo()));
    }

    echo json_encode([
        'message' => 'Transaction created successfully',
        'reservation_ref_no' => $ref_no,
        'amount' => $total_amount
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Transaction creation failed. ' . $e->getMessage()]);
} 