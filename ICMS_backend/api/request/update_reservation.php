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

if (empty($data['reference_number'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Reference number is required.']);
    exit();
}

$reference_number = $data['reference_number'];

try {
    $db->beginTransaction();

    // Update reservation details
    if (!empty($data['address'])) {
        $stmt = $db->prepare("UPDATE requests SET address = ? WHERE reference_number = ?");
        $stmt->execute([$data['address'], $reference_number]);
    }

    // Validate duplicate serials within the incoming request payload
    if (!empty($data['samples']) && is_array($data['samples'])) {
        $serials = [];
        foreach ($data['samples'] as $eq) {
            if (!empty($eq['serial_no'])) {
                $normalized = strtolower(trim($eq['serial_no']));
                if (in_array($normalized, $serials)) {
                    echo json_encode(['message' => 'Duplicate serial number found: ' . $eq['serial_no']]);
                    exit();
                }
                $serials[] = $normalized;
            }
        }

        // Additionally, ensure no duplicate with existing DB rows for the same reservation when inserting new items
        foreach ($data['samples'] as $eq) {
            if (empty($eq['id']) && !empty($eq['serial_no'])) {
                $stmtDup = $db->prepare("SELECT COUNT(*) FROM sample WHERE reservation_ref_no = ? AND LOWER(TRIM(serial_no)) = LOWER(TRIM(?))");
                $stmtDup->execute([$reference_number, $eq['serial_no']]);
                if ($stmtDup->fetchColumn() > 0) {
                    echo json_encode(['message' => 'Duplicate serial number found: ' . $eq['serial_no']]);
                    exit();
                }
            }
        }
    }

    // --- Sample update/insert/delete logic ---
    // 1. Get all existing sample IDs for this reservation
    $stmt = $db->prepare("SELECT id FROM sample WHERE reservation_ref_no = ?");
    $stmt->execute([$reference_number]);
    $existingSampleIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $incomingIds = [];
    if (!empty($data['samples']) && is_array($data['samples'])) {
        foreach ($data['samples'] as $eq) {
            $price = str_replace(',', '', $eq['price']);
            if (!empty($eq['id'])) {
                $incomingIds[] = $eq['id'];
                // Update existing sample
                $stmtUpdate = $db->prepare("UPDATE sample SET section=?, type=?, `range`=?, serial_no=?, price=? WHERE id=?");
                $stmtUpdate->execute([
                    $eq['section'],
                    $eq['type'],
                    $eq['range'],
                    $eq['serial_no'],
                    $price,
                    $eq['id']
                ]);
            } else {
                // Insert new sample
                $stmtInsert = $db->prepare("INSERT INTO sample (reservation_ref_no, section, type, `range`, serial_no, price) VALUES (?, ?, ?, ?, ?, ?)");
                $stmtInsert->execute([
                    $reference_number,
                    $eq['section'],
                    $eq['type'],
                    $eq['range'],
                    $eq['serial_no'],
                    $price
                ]);
            }
        }
    }

    // 2. Delete samples not in incomingIds, only if no calibration records
    $toDelete = array_diff($existingSampleIds, $incomingIds);
    foreach ($toDelete as $eqId) {
        $count = 0;
        $stmtCheck = $db->prepare("SELECT COUNT(*) FROM calibration_records WHERE sample_id = ?");
        $stmtCheck->execute([$eqId]);
        $count = $stmtCheck->fetchColumn();

        if ($count == 0) {
            // Safe to delete
            $stmtDelete = $db->prepare("DELETE FROM sample WHERE id = ?");
            $stmtDelete->execute([$eqId]);
        }
    }

    $db->commit();
    echo json_encode(['message' => 'Reservation updated successfully.']);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['message' => 'Error updating reservation: ' . $e->getMessage()]);
}
?> 