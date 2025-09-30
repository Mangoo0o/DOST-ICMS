<?php
/**
 * Script to fix existing calibration records where status is 'completed' 
 * but is_calibrated is not set to 1
 */

require_once 'api/config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo "Database connection failed.\n";
    exit(1);
}

try {
    // Find samples with status 'completed' but is_calibrated = 0
    $query = "SELECT id, reservation_ref_no, status, is_calibrated FROM sample WHERE status = 'completed' AND is_calibrated = 0";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $samples = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($samples)) {
        echo "No samples found that need fixing.\n";
        exit(0);
    }
    
    echo "Found " . count($samples) . " samples with status 'completed' but is_calibrated = 0:\n";
    
    foreach ($samples as $sample) {
        echo "- Sample ID: {$sample['id']}, Ref: {$sample['reservation_ref_no']}\n";
    }
    
    // Update is_calibrated to 1 for these samples
    $updateQuery = "UPDATE sample SET is_calibrated = 1 WHERE status = 'completed' AND is_calibrated = 0";
    $updateStmt = $db->prepare($updateQuery);
    $result = $updateStmt->execute();
    
    if ($result) {
        $affectedRows = $updateStmt->rowCount();
        echo "\nSuccessfully updated $affectedRows samples to set is_calibrated = 1.\n";
    } else {
        echo "\nFailed to update samples.\n";
        exit(1);
    }
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
