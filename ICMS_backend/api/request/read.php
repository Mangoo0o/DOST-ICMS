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
    http_response_code(503); // Service Unavailable
    echo json_encode(['message' => 'Database connection failed. Please check your configuration in db.php.']);
    exit();
}

try {
    // Check for client_id in GET params
    $clientId = isset($_GET['client_id']) ? $_GET['client_id'] : null;
    
    $query = "
        SELECT 
            r.id,
            r.reference_number,
            r.client_id,
            DATE_FORMAT(r.date_created, '%Y-%m-%d') as date_created,
            DATE_FORMAT(r.date_scheduled, '%Y-%m-%d') as date_scheduled,
            DATE_FORMAT(r.date_expected_completion, '%Y-%m-%d') as date_expected_completion,
            DATE_FORMAT(r.date_finished, '%Y-%m-%d') as date_finished,
            r.status,
            CONCAT(c.first_name, ' ', c.last_name) as client_name,
            c.email as client_email,
            (SELECT COUNT(*) FROM sample s WHERE s.reservation_ref_no = r.reference_number) as total_sample,
            (SELECT COUNT(*) FROM sample s WHERE s.reservation_ref_no = r.reference_number AND s.is_calibrated = true) as completed_sample
        FROM 
            requests r
        LEFT JOIN 
            clients c ON r.client_id = c.id
    ";
    if ($clientId) {
        $query .= " WHERE r.client_id = :client_id ";
    }
    $query .= " ORDER BY r.date_created DESC ";

    $stmt = $db->prepare($query);
    if ($clientId) {
        $stmt->bindParam(':client_id', $clientId);
    }
    $stmt->execute();

    $reservations = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $progress = $row['total_sample'] > 0
            ? ($row['completed_sample'] / $row['total_sample']) * 100
            : 0;
        
        $row['progress'] = round($progress);

        // Fetch samples for this reservation
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
        $sample_stmt->bindParam(':ref', $row['reference_number']);
        $sample_stmt->execute();
        $sample = $sample_stmt->fetchAll(PDO::FETCH_ASSOC);
        $row['sample'] = $sample;

        $reservations[] = $row;
    }

    echo json_encode([
        'message' => 'Requests retrieved successfully',
        'records' => $reservations
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'Database Error: ' . $e->getMessage()
    ]);
} 