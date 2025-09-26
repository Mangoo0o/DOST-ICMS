<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>🔍 Certificate Generation Debug</h2>";

// Test 1: Check if we can access the certificate URL directly
echo "<h3>Test 1: Direct URL Access</h3>";
$sample_id = 41;
$cert_url = "http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/calibration/generate_certificate_weighing_scale.php?sample_id={$sample_id}";
echo "<p><strong>Certificate URL:</strong> <a href='{$cert_url}' target='_blank'>{$cert_url}</a></p>";

// Test 2: Check database connection
echo "<h3>Test 2: Database Connection</h3>";
try {
    require_once __DIR__ . '/config/db.php';
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "<p style='color: green;'>✅ Database connection successful</p>";
        
        // Check calibration record
        $stmt = $db->prepare('SELECT * FROM calibration_records WHERE sample_id = :sample_id ORDER BY created_at DESC LIMIT 1');
        $stmt->bindParam(':sample_id', $sample_id, PDO::PARAM_INT);
        $stmt->execute();
        $record = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($record) {
            echo "<p style='color: green;'>✅ Calibration record found</p>";
            echo "<p><strong>Type:</strong> {$record['calibration_type']}</p>";
            echo "<p><strong>Created:</strong> {$record['created_at']}</p>";
        } else {
            echo "<p style='color: red;'>❌ No calibration record found</p>";
        }
        
        // Check sample record
        $sample_stmt = $db->prepare('SELECT * FROM sample WHERE sample_id = :sample_id');
        $sample_stmt->bindParam(':sample_id', $sample_id, PDO::PARAM_INT);
        $sample_stmt->execute();
        $sample = $sample_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($sample) {
            echo "<p style='color: green;'>✅ Sample record found</p>";
            echo "<p><strong>Serial:</strong> {$sample['serial_no']}</p>";
        } else {
            echo "<p style='color: red;'>❌ No sample record found</p>";
        }
        
    } else {
        echo "<p style='color: red;'>❌ Database connection failed</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database error: " . $e->getMessage() . "</p>";
}

// Test 3: Check FPDF library
echo "<h3>Test 3: FPDF Library</h3>";
$fpdf_path = __DIR__ . '/vendor/setasign/fpdf/fpdf.php';
if (file_exists($fpdf_path)) {
    echo "<p style='color: green;'>✅ FPDF library found</p>";
    
    try {
        require_once $fpdf_path;
        $pdf = new FPDF();
        echo "<p style='color: green;'>✅ FPDF instantiation successful</p>";
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ FPDF error: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p style='color: red;'>❌ FPDF library not found at: {$fpdf_path}</p>";
}

// Test 4: Check logo files
echo "<h3>Test 4: Logo Files</h3>";
$logos = [
    'DOST Logo' => __DIR__ . '/assets/dost_logo.png',
    'PAB Logo' => __DIR__ . '/assets/pab_logo.png',
    'Bagong Pilipinas Logo' => __DIR__ . '/assets/bagong_pilipinas_logo.png'
];

foreach ($logos as $name => $path) {
    if (file_exists($path)) {
        $size = filesize($path);
        echo "<p style='color: green;'>✅ {$name} found ({$size} bytes)</p>";
    } else {
        echo "<p style='color: red;'>❌ {$name} not found at: {$path}</p>";
    }
}

// Test 5: Test certificate generation with error handling
echo "<h3>Test 5: Certificate Generation Test</h3>";
echo "<p>Click the button below to test certificate generation:</p>";
echo "<button onclick='testCertificate()' style='background: #2a9dab; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;'>Test Certificate Generation</button>";
echo "<div id='test-result' style='margin-top: 10px;'></div>";

?>

<script>
function testCertificate() {
    const resultDiv = document.getElementById('test-result');
    resultDiv.innerHTML = '<p>Testing certificate generation...</p>';
    
    const sampleId = 41;
    const certUrl = `http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/calibration/generate_certificate_weighing_scale.php?sample_id=${sampleId}`;
    
    console.log('Testing certificate URL:', certUrl);
    
    // Test if URL is accessible
    fetch(certUrl)
        .then(response => {
            if (response.ok) {
                resultDiv.innerHTML = '<p style="color: green;">✅ Certificate URL is accessible</p>';
                
                // Try to open in new window
                const newWindow = window.open(certUrl, '_blank');
                if (newWindow) {
                    resultDiv.innerHTML += '<p style="color: green;">✅ Certificate window opened successfully</p>';
                } else {
                    resultDiv.innerHTML += '<p style="color: red;">❌ Popup blocked! Please allow popups for this site.</p>';
                }
            } else {
                resultDiv.innerHTML = `<p style="color: red;">❌ Certificate URL returned error: ${response.status}</p>`;
            }
        })
        .catch(error => {
            resultDiv.innerHTML = `<p style="color: red;">❌ Error accessing certificate URL: ${error.message}</p>`;
        });
}
</script>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
button:hover { opacity: 0.8; }
</style>
