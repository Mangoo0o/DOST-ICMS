<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers, Access-Control-Allow-Methods');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
require_once __DIR__ . '/../services/EmailService.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503); // Service Unavailable
    echo json_encode(['message' => 'Database connection failed.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['id']) || empty($data['status'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Sample ID and status are required.']);
    exit();
}

$id = $data['id'];
$status = $data['status'];

$stmt = $db->prepare('UPDATE sample SET status = :status WHERE id = :id');
$stmt->bindParam(':status', $status);
$stmt->bindParam(':id', $id, PDO::PARAM_INT);

if ($stmt->execute()) {
    // If sample is being marked as completed, check if all samples for this request are completed
    if ($status === 'completed') {
        // Get the reservation reference number for this sample
        $stmt = $db->prepare('SELECT reservation_ref_no FROM sample WHERE id = :id');
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $reservation_ref_no = $stmt->fetchColumn();
        
        if ($reservation_ref_no) {
            // Check if all samples for this reservation are completed
            $stmt = $db->prepare('SELECT COUNT(*) FROM sample WHERE reservation_ref_no = :ref_no AND status != "completed"');
            $stmt->bindParam(':ref_no', $reservation_ref_no);
            $stmt->execute();
            $incomplete_count = $stmt->fetchColumn();
            
            // If all samples are completed, update the request status to completed
            if ($incomplete_count == 0) {
                // Mark the request as completed
                $stmt = $db->prepare('UPDATE requests SET status = "completed", date_finished = NOW() WHERE reference_number = :ref_no');
                $stmt->bindParam(':ref_no', $reservation_ref_no);
                $stmt->execute();

                // Fetch client email and name for the completed request
                try {
                    $rq = $db->prepare('SELECT r.client_id, CONCAT(c.first_name, " ", c.last_name) AS client_name, c.email AS client_email FROM requests r LEFT JOIN clients c ON r.client_id = c.id WHERE r.reference_number = :ref_no LIMIT 1');
                    $rq->bindParam(':ref_no', $reservation_ref_no);
                    $rq->execute();
                    $row = $rq->fetch(PDO::FETCH_ASSOC);

                    if ($row && !empty($row['client_email'])) {
                        $clientEmail = $row['client_email'];
                        $clientName = $row['client_name'] ?? '';

                        // Send completion email (best-effort, non-blocking for API success)
                        try {
                            $emailService = new EmailService();
                            if ($emailService->isEnabled()) {
                                $emailService->sendRequestCompletionEmail($clientEmail, $clientName, $reservation_ref_no, []);
                            }
                        } catch (Exception $e) {
                            error_log('Completion email error: ' . $e->getMessage());
                        }
                    }
                } catch (Exception $e) {
                    // Do not fail the API on email issues
                    error_log('Post-completion email lookup failed: ' . $e->getMessage());
                }
            }
        }
    }
    
    echo json_encode(['message' => 'Sample status updated successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to update sample status.']);
}
?>
