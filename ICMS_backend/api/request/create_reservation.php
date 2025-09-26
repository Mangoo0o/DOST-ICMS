<?php
require_once '../config/cors.php';
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/db.php';
require_once '../auth/verify_token.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503); // Service Unavailable
    echo json_encode(['message' => 'Database connection failed. Please check your configuration in db.php.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'));

// Verify authentication (for logging who performed the action)
$auth_user = null;
try { $auth_user = verifyToken(); } catch (Exception $e) { $auth_user = null; }

if (!$data || !isset($data->client_id)) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing client ID']);
    exit();
}

try {
    $db->beginTransaction();

    // Generate a unique reference number
    $date_part = date('Ymd');
    // Find the last reference number for today
    $stmt = $db->prepare("SELECT reference_number FROM requests WHERE reference_number LIKE ? ORDER BY reference_number DESC LIMIT 1");
    $like = "REF-{$date_part}-%";
    $stmt->execute([$like]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && preg_match('/REF-' . $date_part . '-(\\d{4})/', $row['reference_number'], $matches)) {
        $lastCounter = intval($matches[1]);
        $newCounter = $lastCounter + 1;
    } else {
        $newCounter = 1;
    }
    $ref_no = "REF-{$date_part}-" . str_pad($newCounter, 4, '0', STR_PAD_LEFT);

    // Prepare data for insertion
    $client_id = $data->client_id;
    $address = $data->address ?? null;
    $date_scheduled = !empty($data->date_scheduled) ? $data->date_scheduled : null;
    $date_expected_completion = !empty($data->date_expected_completion) ? $data->date_expected_completion : null;
    $status = $data->status ?? 'pending';

    // Insert request
    $stmt = $db->prepare(
        "INSERT INTO requests (client_id, reference_number, address, status, date_created, date_scheduled, date_expected_completion) 
         VALUES (?, ?, ?, ?, NOW(), ?, ?)"
    );
    if (!$stmt->execute([$client_id, $ref_no, $address, $status, $date_scheduled, $date_expected_completion])) {
        error_log('SQL Error (requests insert): ' . print_r($stmt->errorInfo(), true));
        throw new Exception('SQL error (requests insert): ' . implode(' | ', $stmt->errorInfo()));
    }
    $reservation_id = $db->lastInsertId();

    // Calculate total amount for this reservation
    $sample_stmt = $db->prepare("SELECT price FROM sample WHERE reservation_ref_no = ?");
    $sample_stmt->execute([$ref_no]);
    $total_amount = 0;
    while ($eq = $sample_stmt->fetch(PDO::FETCH_ASSOC)) {
        $total_amount += floatval($eq['price']);
    }

    // Remove transaction creation from here
    // $stmt = $db->prepare(
    //     "INSERT INTO `transaction` (reservation_ref_no, amount, balance, status, created_at) VALUES (?, ?, ?, ?, NOW())"
    // );
    // if (!$stmt->execute([$ref_no, $total_amount, $total_amount, 'Unpaid'])) {
    //     error_log('SQL Error (transaction insert): ' . print_r($stmt->errorInfo(), true));
    //     throw new Exception('SQL error (transaction insert): ' . implode(' | ', $stmt->errorInfo()));
    // }

    $db->commit();

    // Log transaction (best-effort)
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS system_logs (id INT AUTO_INCREMENT PRIMARY KEY, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, user_id INT NULL, action VARCHAR(255) NOT NULL, details TEXT NULL, ip_address VARCHAR(45) NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $details = json_encode(['reference_number' => $ref_no, 'client_id' => $client_id]);
        $stmtLog = $db->prepare("INSERT INTO system_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
        // Prefer the authenticated user if available
        $userId = $auth_user->id ?? null;
        $stmtLog->execute([$userId, 'request_create', $details, null]);
    } catch (Exception $ignore) {}

    echo json_encode([
        'message' => 'Request created successfully',
        'id' => $reservation_id,
        'reference_number' => $ref_no
    ]);

} catch (PDOException $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['message' => 'Request creation failed. ' . $e->getMessage()]);
} 