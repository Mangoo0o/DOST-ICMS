<?php
require_once __DIR__ . '/api/config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die('Database connection failed.');
}

echo "<h2>🔍 Available Sphygmomanometer Samples</h2>";

// Get sphygmomanometer calibration records
$stmt = $db->prepare('SELECT id, sample_id, calibration_type, created_at FROM calibration_records WHERE calibration_type = "Sphygmomanometer" ORDER BY created_at DESC LIMIT 10');
$stmt->execute();
$records = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($records)) {
    echo "<p>No sphygmomanometer calibration records found.</p>";
    exit;
}

echo "<h3>Sphygmomanometer Calibration Records:</h3>";
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>Record ID</th><th>Sample ID</th><th>Type</th><th>Created</th><th>Certificate Link</th></tr>";

foreach ($records as $record) {
    $sample_id = $record['sample_id'];
    $certificate_url = "api/calibration/generate_certificate_sphygmomanometer.php?sample_id={$sample_id}";
    
    echo "<tr>";
    echo "<td>{$record['id']}</td>";
    echo "<td>{$sample_id}</td>";
    echo "<td>{$record['calibration_type']}</td>";
    echo "<td>{$record['created_at']}</td>";
    echo "<td><a href='{$certificate_url}' target='_blank'>Generate Certificate</a></td>";
    echo "</tr>";
}

echo "</table>";

// Also show sample table entries
echo "<h3>Sample Table Entries:</h3>";
$sample_stmt = $db->prepare('SELECT id, reservation_ref_no, type, serial_no, status FROM sample WHERE type LIKE "%Sphygmomanometer%" OR type LIKE "%sphygmomanometer%" ORDER BY created_at DESC LIMIT 10');
$sample_stmt->execute();
$samples = $sample_stmt->fetchAll(PDO::FETCH_ASSOC);

if (!empty($samples)) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Sample ID</th><th>Reference No</th><th>Type</th><th>Serial No</th><th>Status</th></tr>";
    
    foreach ($samples as $sample) {
        echo "<tr>";
        echo "<td>{$sample['id']}</td>";
        echo "<td>{$sample['reservation_ref_no']}</td>";
        echo "<td>{$sample['type']}</td>";
        echo "<td>{$sample['serial_no']}</td>";
        echo "<td>{$sample['status']}</td>";
        echo "</tr>";
    }
    
    echo "</table>";
} else {
    echo "<p>No sphygmomanometer samples found in sample table.</p>";
}
?>
