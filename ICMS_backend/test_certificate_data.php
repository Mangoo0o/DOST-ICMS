<?php
require_once __DIR__ . '/config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die('Database connection failed.');
}

echo "<h2>Certificate Data Test</h2>";

// Test sample_id 41
$sample_id = 41;

echo "<h3>Testing sample_id: {$sample_id}</h3>";

// Check calibration record
$stmt = $db->prepare('SELECT * FROM calibration_records WHERE sample_id = :sample_id ORDER BY created_at DESC LIMIT 1');
$stmt->bindParam(':sample_id', $sample_id, PDO::PARAM_INT);
$stmt->execute();
$record = $stmt->fetch(PDO::FETCH_ASSOC);

if ($record) {
    echo "<p style='color: green;'>✅ Calibration record found!</p>";
    echo "<p><strong>Calibration Type:</strong> {$record['calibration_type']}</p>";
    echo "<p><strong>Date Created:</strong> {$record['created_at']}</p>";
    echo "<p><strong>Input Data Length:</strong> " . strlen($record['input_data']) . " characters</p>";
    echo "<p><strong>Result Data Length:</strong> " . strlen($record['result_data']) . " characters</p>";
    
    // Check if data is valid JSON
    $input_data = json_decode($record['input_data'], true);
    $result_data = json_decode($record['result_data'], true);
    
    if ($input_data) {
        echo "<p style='color: green;'>✅ Input data is valid JSON</p>";
    } else {
        echo "<p style='color: red;'>❌ Input data is not valid JSON</p>";
    }
    
    if ($result_data) {
        echo "<p style='color: green;'>✅ Result data is valid JSON</p>";
    } else {
        echo "<p style='color: red;'>❌ Result data is not valid JSON</p>";
    }
} else {
    echo "<p style='color: red;'>❌ No calibration record found for sample_id {$sample_id}</p>";
}

// Check sample record
$sample_stmt = $db->prepare('SELECT * FROM sample WHERE sample_id = :sample_id');
$sample_stmt->bindParam(':sample_id', $sample_id, PDO::PARAM_INT);
$sample_stmt->execute();
$sample = $sample_stmt->fetch(PDO::FETCH_ASSOC);

if ($sample) {
    echo "<p style='color: green;'>✅ Sample record found!</p>";
    echo "<p><strong>Serial Number:</strong> {$sample['serial_no']}</p>";
    echo "<p><strong>Equipment Name:</strong> {$sample['equipment_name']}</p>";
} else {
    echo "<p style='color: red;'>❌ No sample record found for sample_id {$sample_id}</p>";
}

// Test certificate URL
echo "<h3>Certificate URL Test</h3>";
$cert_url = "http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/calibration/generate_certificate_weighing_scale.php?sample_id={$sample_id}";
echo "<p><strong>Certificate URL:</strong> <a href='{$cert_url}' target='_blank'>{$cert_url}</a></p>";

// Check FPDF library
echo "<h3>FPDF Library Test</h3>";
if (file_exists(__DIR__ . '/vendor/setasign/fpdf/fpdf.php')) {
    echo "<p style='color: green;'>✅ FPDF library found</p>";
} else {
    echo "<p style='color: red;'>❌ FPDF library not found</p>";
}

// Check logo files
echo "<h3>Logo Files Test</h3>";
$logos = [
    'dost_logo.png' => __DIR__ . '/assets/dost_logo.png',
    'pab_logo.png' => __DIR__ . '/assets/pab_logo.png',
    'bagong_pilipinas_logo.png' => __DIR__ . '/assets/bagong_pilipinas_logo.png'
];

foreach ($logos as $name => $path) {
    if (file_exists($path)) {
        echo "<p style='color: green;'>✅ {$name} found</p>";
    } else {
        echo "<p style='color: red;'>❌ {$name} not found at {$path}</p>";
    }
}

?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
</style>
