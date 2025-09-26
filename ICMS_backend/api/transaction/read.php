<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503);
    echo json_encode(['message' => 'Database connection failed.']);
    exit();
}

try {
    $query = "
        SELECT 
            t.id,
            t.reservation_ref_no,
            t.amount,
            t.balance,
            t.status,
            t.created_at,
            t.payments,
            c.first_name,
            c.last_name,
            c.email as client_email
        FROM 
            transaction t
        JOIN 
            requests r ON t.reservation_ref_no = r.reference_number
        JOIN 
            clients c ON r.client_id = c.id
        ORDER BY t.created_at DESC
    ";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $transactions = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Fetch samples for this transaction
        $sample_query = "
            SELECT 
                id,
                section,
                type,
                `range`,
                serial_no,
                price,
                quantity,
                status,
                is_calibrated,
                date_started,
                date_completed
            FROM 
                sample
            WHERE 
                reservation_ref_no = :ref
            ORDER BY 
                id";

        $sample_stmt = $db->prepare($sample_query);
        $sample_stmt->bindParam(':ref', $row['reservation_ref_no']);
        $sample_stmt->execute();
        $sample = $sample_stmt->fetchAll(PDO::FETCH_ASSOC);
        $row['sample'] = $sample;

        // Fetch payments from JSON column
        $row['payments'] = $row['payments'] ? json_decode($row['payments'], true) : [];
        // Keep payments with amount > 0 OR with a non-empty discount
        $row['payments'] = array_filter($row['payments'], function($p) {
            return (isset($p['amount']) && floatval($p['amount']) > 0) || (isset($p['discount']) && !empty($p['discount']));
        });

        // Add client name for convenience
        $row['client_name'] = $row['first_name'] . ' ' . $row['last_name'];

        $transactions[] = $row;
    }

    echo json_encode([
        'message' => 'Transactions retrieved successfully',
        'records' => $transactions
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'Database Error: ' . $e->getMessage()
    ]);
} 