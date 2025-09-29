<?php
require_once 'api/config/db.php';

echo "<h2>Database Check</h2>";

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo "<p style='color: red;'>❌ Database connection failed!</p>";
    exit;
}

echo "<p style='color: green;'>✅ Database connection successful!</p>";

// Database info
echo "<h3>Database Information:</h3>";
echo "<p><strong>Host:</strong> " . $database->getHost() . "</p>";
echo "<p><strong>Database:</strong> " . $database->getDatabaseName() . "</p>";
echo "<p><strong>Username:</strong> " . $database->getUsername() . "</p>";

// List all tables
echo "<h3>Tables in Database:</h3>";
$tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "<ul>";
foreach ($tables as $table) {
    echo "<li>$table</li>";
}
echo "</ul>";

// Check calibration_records table
echo "<h3>Calibration Records:</h3>";
$stmt = $db->query("SELECT COUNT(*) as count FROM calibration_records");
$count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "<p>Total calibration records: <strong>$count</strong></p>";

if ($count > 0) {
    echo "<h4>Recent Calibration Records:</h4>";
    $stmt = $db->query("SELECT id, sample_id, calibration_type, date_completed FROM calibration_records ORDER BY created_at DESC LIMIT 5");
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Sample ID</th><th>Type</th><th>Date Completed</th></tr>";
    foreach ($records as $record) {
        echo "<tr>";
        echo "<td>" . $record['id'] . "</td>";
        echo "<td>" . $record['sample_id'] . "</td>";
        echo "<td>" . $record['calibration_type'] . "</td>";
        echo "<td>" . $record['date_completed'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
}

// Check test weights calibration records specifically
echo "<h3>Test Weights Calibration Records:</h3>";
$stmt = $db->query("SELECT id, sample_id, result_data FROM calibration_records WHERE calibration_type = 'Test Weights' ORDER BY created_at DESC LIMIT 3");
$testWeightRecords = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($testWeightRecords) > 0) {
    echo "<h4>Recent Test Weight Records:</h4>";
    foreach ($testWeightRecords as $record) {
        $resultData = json_decode($record['result_data'], true);
        echo "<div style='border: 1px solid #ccc; margin: 10px; padding: 10px;'>";
        echo "<p><strong>Record ID:</strong> " . $record['id'] . "</p>";
        echo "<p><strong>Sample ID:</strong> " . $record['sample_id'] . "</p>";
        if ($resultData) {
            echo "<p><strong>Correction:</strong> " . ($resultData['correction'] ?? 'Not set') . "</p>";
            echo "<p><strong>mc_t:</strong> " . ($resultData['mc_t'] ?? 'Not set') . "</p>";
            echo "<p><strong>meanDmci:</strong> " . ($resultData['meanDmci'] ?? 'Not set') . "</p>";
            echo "<p><strong>Uncertainty (mg):</strong> " . ($resultData['u_mc_t_mg'] ?? 'Not set') . "</p>";
        }
        echo "</div>";
    }
} else {
    echo "<p>No test weight calibration records found.</p>";
}

// Check sample table
echo "<h3>Samples:</h3>";
$stmt = $db->query("SELECT COUNT(*) as count FROM sample");
$count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "<p>Total samples: <strong>$count</strong></p>";

if ($count > 0) {
    echo "<h4>Recent Samples:</h4>";
    $stmt = $db->query("SELECT id, reservation_ref_no, type, serial_no, created_at FROM sample ORDER BY created_at DESC LIMIT 5");
    $samples = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Ref No</th><th>Type</th><th>Serial No</th><th>Created</th></tr>";
    foreach ($samples as $sample) {
        echo "<tr>";
        echo "<td>" . $sample['id'] . "</td>";
        echo "<td>" . $sample['reservation_ref_no'] . "</td>";
        echo "<td>" . $sample['type'] . "</td>";
        echo "<td>" . $sample['serial_no'] . "</td>";
        echo "<td>" . $sample['created_at'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
}

echo "<hr>";
echo "<p><em>Database check completed at " . date('Y-m-d H:i:s') . "</em></p>";
?>
