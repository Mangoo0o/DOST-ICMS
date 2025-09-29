<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers, Access-Control-Allow-Methods');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503); // Service Unavailable
    echo json_encode(['message' => 'Database connection failed.']);
    exit();
}

if (!isset($_GET['ref'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['message' => 'Reference number is required.']);
    exit();
}

$reference_number = $_GET['ref'];

try {
    // Fetch reservation details
    $query = "
        SELECT 
            r.id,
            r.client_id,
            r.reference_number,
            DATE_FORMAT(r.date_created, '%Y-%m-%d %H:%i') as date_created,
            DATE_FORMAT(r.date_scheduled, '%Y-%m-%d') as date_scheduled,
            DATE_FORMAT(r.date_expected_completion, '%Y-%m-%d') as date_expected_completion,
            DATE_FORMAT(r.date_finished, '%Y-%m-%d') as date_finished,
            r.status,
            r.address,
            r.attachment_file_name,
            r.attachment_file_path,
            r.attachment_mime_type,
            r.attachment_file_size,
            CONCAT(c.first_name, ' ', c.last_name) as client_name,
            c.email as client_email,
            c.contact_number as client_contact,
            c.company as client_company
        FROM 
            requests r
        LEFT JOIN 
            clients c ON r.client_id = c.id
        WHERE 
            r.reference_number = :ref
    ";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':ref', $reference_number);
    $stmt->execute();
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reservation) {
        http_response_code(404); // Not Found
        echo json_encode(['message' => 'Request not found.']);
        exit();
    }

    // Fetch associated samples
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
    $sample_stmt->bindParam(':ref', $reference_number);
    $sample_stmt->execute();
    $sample = $sample_stmt->fetchAll(PDO::FETCH_ASSOC);

    $reservation['sample'] = $sample;

    echo json_encode($reservation);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'Database Error: ' . $e->getMessage()
    ]);
} 