<?php
require_once __DIR__ . '/config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die('Database connection failed.');
}

echo "<h2>Calibration Records Check</h2>";

// Check all calibration records
$stmt = $db->prepare('SELECT * FROM calibration_records ORDER BY created_at DESC LIMIT 10');
$stmt->execute();
$records = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<h3>Recent Calibration Records:</h3>";
if ($records) {
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr><th>ID</th><th>Sample ID</th><th>Type</th><th>Created</th><th>Status</th></tr>";
    foreach ($records as $record) {
        echo "<tr>";
        echo "<td>" . $record['id'] . "</td>";
        echo "<td>" . $record['sample_id'] . "</td>";
        echo "<td>" . $record['calibration_type'] . "</td>";
        echo "<td>" . $record['created_at'] . "</td>";
        echo "<td>" . ($record['date_completed'] ? 'Completed' : 'In Progress') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p style='color: red;'>No calibration records found!</p>";
}

// Check sample table
echo "<h3>Sample Records:</h3>";
$sample_stmt = $db->prepare('SELECT id, reservation_ref_no, status, is_calibrated FROM sample ORDER BY id DESC LIMIT 10');
$sample_stmt->execute();
$samples = $sample_stmt->fetchAll(PDO::FETCH_ASSOC);

if ($samples) {
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr><th>ID</th><th>Ref No</th><th>Status</th><th>Is Calibrated</th></tr>";
    foreach ($samples as $sample) {
        echo "<tr>";
        echo "<td>" . $sample['id'] . "</td>";
        echo "<td>" . $sample['reservation_ref_no'] . "</td>";
        echo "<td>" . $sample['status'] . "</td>";
        echo "<td>" . ($sample['is_calibrated'] ? 'Yes' : 'No') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p style='color: red;'>No sample records found!</p>";
}

// Test specific sample ID from the image (looks like it might be sample ID 41 based on previous logs)
echo "<h3>Testing Sample ID 41:</h3>";
$test_stmt = $db->prepare('SELECT * FROM calibration_records WHERE sample_id = 41');
$test_stmt->execute();
$test_record = $test_stmt->fetch(PDO::FETCH_ASSOC);

if ($test_record) {
    echo "<p style='color: green;'>✅ Calibration record found for sample ID 41:</p>";
    echo "<ul>";
    echo "<li>Type: " . $test_record['calibration_type'] . "</li>";
    echo "<li>Created: " . $test_record['created_at'] . "</li>";
    echo "<li>Completed: " . ($test_record['date_completed'] ? $test_record['date_completed'] : 'Not completed') . "</li>";
    echo "</ul>";
} else {
    echo "<p style='color: red;'>❌ No calibration record found for sample ID 41</p>";
}

?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
table { margin: 10px 0; }
th, td { padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
</style>