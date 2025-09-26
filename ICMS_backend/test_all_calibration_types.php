<?php
include_once 'api/config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo "Database connection failed\n";
    exit;
}

// Test data for different calibration types
$testCalibrations = [
    [
        'sample_id' => 33,
        'calibration_type' => 'Test Weights',
        'input_data' => json_encode(['test' => 'Test Weights data', 'preparation' => 'test']),
        'result_data' => json_encode(['result' => 'Test Weights result']),
        'calibrated_by' => 2,
        'date_started' => date('Y-m-d H:i:s'),
        'date_completed' => date('Y-m-d H:i:s')
    ],
    [
        'sample_id' => 34,
        'calibration_type' => 'Thermohygrometer',
        'input_data' => json_encode(['test' => 'Thermohygrometer data', 'temperature' => 'test']),
        'result_data' => json_encode(['result' => 'Thermohygrometer result']),
        'calibrated_by' => 2,
        'date_started' => date('Y-m-d H:i:s'),
        'date_completed' => date('Y-m-d H:i:s')
    ],
    [
        'sample_id' => 35,
        'calibration_type' => 'Sphygmomanometer',
        'input_data' => json_encode(['test' => 'Sphygmomanometer data', 'pressure' => 'test']),
        'result_data' => json_encode(['result' => 'Sphygmomanometer result']),
        'calibrated_by' => 2,
        'date_started' => date('Y-m-d H:i:s'),
        'date_completed' => date('Y-m-d H:i:s')
    ],
    [
        'sample_id' => 33, // Reuse sample 33 for thermometer
        'calibration_type' => 'Thermometer',
        'input_data' => json_encode(['test' => 'Thermometer data', 'temperature' => 'test']),
        'result_data' => json_encode(['result' => 'Thermometer result']),
        'calibrated_by' => 2,
        'date_started' => date('Y-m-d H:i:s'),
        'date_completed' => date('Y-m-d H:i:s')
    ]
];

echo "=== TESTING ALL CALIBRATION TYPES ===\n\n";

foreach ($testCalibrations as $index => $calibration) {
    echo "Testing {$calibration['calibration_type']} (Sample ID: {$calibration['sample_id']})...\n";
    
    try {
        // Check if record already exists
        $checkStmt = $db->prepare('SELECT id FROM calibration_records WHERE sample_id = ? AND calibration_type = ?');
        $checkStmt->execute([$calibration['sample_id'], $calibration['calibration_type']]);
        
        if ($checkStmt->rowCount() > 0) {
            // Update existing record
            $updateStmt = $db->prepare('UPDATE calibration_records SET input_data = ?, result_data = ?, calibrated_by = ?, date_started = ?, date_completed = ?, updated_at = NOW() WHERE sample_id = ? AND calibration_type = ?');
            $result = $updateStmt->execute([
                $calibration['input_data'],
                $calibration['result_data'],
                $calibration['calibrated_by'],
                $calibration['date_started'],
                $calibration['date_completed'],
                $calibration['sample_id'],
                $calibration['calibration_type']
            ]);
            
            if ($result) {
                echo "✅ {$calibration['calibration_type']} - Updated successfully\n";
            } else {
                echo "❌ {$calibration['calibration_type']} - Update failed: " . json_encode($updateStmt->errorInfo()) . "\n";
            }
        } else {
            // Insert new record
            $insertStmt = $db->prepare('INSERT INTO calibration_records (sample_id, calibration_type, input_data, result_data, calibrated_by, date_started, date_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
            $result = $insertStmt->execute([
                $calibration['sample_id'],
                $calibration['calibration_type'],
                $calibration['input_data'],
                $calibration['result_data'],
                $calibration['calibrated_by'],
                $calibration['date_started'],
                $calibration['date_completed']
            ]);
            
            if ($result) {
                echo "✅ {$calibration['calibration_type']} - Inserted successfully (ID: " . $db->lastInsertId() . ")\n";
            } else {
                echo "❌ {$calibration['calibration_type']} - Insert failed: " . json_encode($insertStmt->errorInfo()) . "\n";
            }
        }
    } catch (Exception $e) {
        echo "❌ {$calibration['calibration_type']} - Exception: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

echo "=== VERIFICATION: ALL CALIBRATION RECORDS ===\n";
$stmt = $db->query('SELECT id, sample_id, calibration_type, calibrated_by, created_at FROM calibration_records ORDER BY id DESC LIMIT 10');
$records = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($records as $record) {
    echo "ID: {$record['id']}, Sample: {$record['sample_id']}, Type: {$record['calibration_type']}, User: {$record['calibrated_by']}, Created: {$record['created_at']}\n";
}

echo "\n=== CALIBRATION TYPES SUMMARY ===\n";
$stmt = $db->query('SELECT calibration_type, COUNT(*) as count FROM calibration_records GROUP BY calibration_type');
$summary = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($summary as $row) {
    echo "{$row['calibration_type']}: {$row['count']} records\n";
}
?>
