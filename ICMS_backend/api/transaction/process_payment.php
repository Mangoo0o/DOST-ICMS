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
include_once '../auth/verify_token.php';

$database = new Database();
$db = $database->getConnection();
$auth_user = null;
try { $auth_user = verifyToken(); } catch (Exception $e) { $auth_user = null; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$ref_no = $data['reservation_ref_no'] ?? null;
$payment_amount = $data['payment_amount'] ?? null;

if (!$ref_no) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing reservation_ref_no']);
    exit();
}

if ($payment_amount === null) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing payment_amount']);
    exit();
}

try {
    $stmt = $db->prepare("SELECT amount, balance, status FROM transaction WHERE reservation_ref_no = ?");
    $stmt->execute([$ref_no]);
    $transaction = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$transaction) {
        http_response_code(404);
        echo json_encode(['message' => 'Transaction not found']);
        exit();
    }

    $current_balance = floatval($transaction['balance']);
    $total_amount = floatval($transaction['amount']);
    $payment_amount = floatval($payment_amount);
    
    // Calculate discount effect on balance
    $discount_amount = 0;
    if (isset($data['discount']) && !empty($data['discount'])) {
        if ($data['discount']['type'] === 'custom') {
            $discount_amount = ($total_amount * floatval($data['discount']['value'])) / 100;
        } else {
            $discount_amount = ($total_amount * floatval($data['discount']['value'])) / 100;
        }
    }
    
    // New balance should consider both payment and discount
    $effective_payment = $payment_amount + $discount_amount;
    $new_balance = round(max(0, $current_balance - $effective_payment), 2);

    if ($new_balance == 0) {
        $new_status = 'paid';
    } elseif ($new_balance < $total_amount) {
        $new_status = 'partially_paid';
    } else {
        $new_status = 'unpaid';
    }

    // Fetch current payments JSON
    $payments_stmt = $db->prepare("SELECT payments FROM transaction WHERE reservation_ref_no = ?");
    $payments_stmt->execute([$ref_no]);
    $payments_row = $payments_stmt->fetch(PDO::FETCH_ASSOC);
    $payments = $payments_row && $payments_row['payments'] ? json_decode($payments_row['payments'], true) : [];
    // Always add payment record if there's a payment amount or discount
    if ($payment_amount > 0 || (isset($data['discount']) && !empty($data['discount']))) {
        // Remove previous discount-only payments
        $payments = array_filter($payments, function($p) {
            return !(
                isset($p['amount']) && floatval($p['amount']) == 0 &&
                isset($p['discount']) && !empty($p['discount'])
            );
        });
        $payment_record = [
            'amount' => $payment_amount,
            'payment_date' => date('Y-m-d H:i:s'),
            'payment_method' => $data['payment_method'] ?? null
        ];
        if (isset($data['discount'])) {
            $payment_record['discount'] = $data['discount'];
        }
        error_log('Adding payment record: ' . print_r($payment_record, true));
        $payments[] = $payment_record;
    }
    error_log('Final payments array: ' . print_r($payments, true));
    $payments_json = json_encode($payments);

    // Update payments JSON in transaction (discount is now only in payments array)
    $update_stmt = $db->prepare("UPDATE transaction SET balance = ?, status = ?, payments = ? WHERE reservation_ref_no = ?");
    $update_result = $update_stmt->execute([$new_balance, $new_status, $payments_json, $ref_no]);

    if ($update_result) {
        echo json_encode([
            'message' => 'Payment processed successfully',
            'reservation_ref_no' => $ref_no,
            'payment_amount' => $payment_amount,
            'new_balance' => $new_balance,
            'new_status' => $new_status
        ]);
        // Log payment
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS system_logs (id INT AUTO_INCREMENT PRIMARY KEY, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, user_id INT NULL, action VARCHAR(255) NOT NULL, details TEXT NULL, ip_address VARCHAR(45) NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            $details = json_encode(['reservation_ref_no' => $ref_no, 'payment_amount' => $payment_amount, 'new_status' => $new_status]);
            $stmt = $db->prepare("INSERT INTO system_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
            $userId = $auth_user->id ?? null;
            $stmt->execute([$userId, 'payment_process', $details, null]);
        } catch (Exception $ignore) {}
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to update transaction']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
} 