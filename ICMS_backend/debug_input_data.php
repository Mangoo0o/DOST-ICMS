<?php
require_once __DIR__ . '/api/config/db.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>Input Data Analysis for Sample 74</h2>";

$stmt = $db->prepare('SELECT input_data FROM calibration_records WHERE sample_id = 74 ORDER BY created_at DESC LIMIT 1');
$stmt->execute();
$record = $stmt->fetch(PDO::FETCH_ASSOC);
$input_data = json_decode($record['input_data'], true);

echo "<h3>Input Data Structure:</h3>";
echo "<p><strong>Available keys:</strong> " . implode(', ', array_keys($input_data)) . "</p>";

if (isset($input_data['uutRows'])) {
    echo "<h4>UUT Rows (Raw Input Data):</h4>";
    echo "<pre>" . json_encode($input_data['uutRows'], JSON_PRETTY_PRINT) . "</pre>";
}

if (isset($input_data['iprtRows'])) {
    echo "<h4>IPRT Rows (Standard Readings):</h4>";
    echo "<pre>" . json_encode($input_data['iprtRows'], JSON_PRETTY_PRINT) . "</pre>";
}

// Check if there's a mismatch between input and result data
echo "<h3>Data Mismatch Analysis:</h3>";
$stmt = $db->prepare('SELECT result_data FROM calibration_records WHERE sample_id = 74 ORDER BY created_at DESC LIMIT 1');
$stmt->execute();
$record = $stmt->fetch(PDO::FETCH_ASSOC);
$result_data = json_decode($record['result_data'], true);

echo "<p><strong>Result UUT Inc Mean:</strong> " . json_encode($result_data['uutIncMean']) . "</p>";
echo "<p><strong>Result UUT Dec Mean:</strong> " . json_encode($result_data['uutDecMean']) . "</p>";
echo "<p><strong>Result Max Deviation:</strong> " . json_encode($result_data['maxDeviation']) . "</p>";

// The issue might be that the UUT readings are being saved as the applied pressure values
// instead of the actual UUT readings. Let me check if this is the case.
echo "<h3>Expected vs Actual Values:</h3>";
echo "<p>From the screenshot, the UUT readings should be:</p>";
echo "<ul>";
echo "<li>Increasing: 0, 51, 99.8, 148.5, 198.3, 248.8, 298.5</li>";
echo "<li>Decreasing: 0, 50.8, 99.6, 148.4, 198.3, 248.8, 298.7</li>";
echo "</ul>";
echo "<p>But the database shows:</p>";
echo "<ul>";
echo "<li>Increasing: " . json_encode($result_data['uutIncMean']) . "</li>";
echo "<li>Decreasing: " . json_encode($result_data['uutDecMean']) . "</li>";
echo "</ul>";
echo "<p><strong>This suggests the UUT readings are not being saved correctly!</strong></p>";
?>
