<?php
require_once __DIR__ . '/vendor/setasign/fpdf/fpdf.php';
include_once __DIR__ . '/config/db.php';

echo "<h2>Certificate Generation Test</h2>";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    echo "<p style='color: green;'>✅ Database connection successful</p>";
    
    // Test with sample_id 41
    $sample_id = 41;
    
    $stmt = $db->prepare('SELECT * FROM calibration_records WHERE sample_id = :sample_id ORDER BY created_at DESC LIMIT 1');
    $stmt->bindParam(':sample_id', $sample_id, PDO::PARAM_INT);
    $stmt->execute();
    $record = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$record) {
        throw new Exception('No calibration record found for sample_id ' . $sample_id);
    }
    
    echo "<p style='color: green;'>✅ Calibration record found</p>";
    
    $input_data = json_decode($record['input_data'], true);
    $result_data = json_decode($record['result_data'], true);
    
    if (!$input_data) {
        throw new Exception('Invalid input_data JSON');
    }
    
    if (!$result_data) {
        throw new Exception('Invalid result_data JSON');
    }
    
    echo "<p style='color: green;'>✅ Data parsing successful</p>";
    
    // Test FPDF
    $pdf = new FPDF();
    echo "<p style='color: green;'>✅ FPDF instantiation successful</p>";
    
    // Test certificate generation
    echo "<h3>Testing Certificate Generation...</h3>";
    
    // Include the certificate generation logic
    ob_start();
    
    // Simulate the certificate generation
    $pdf = new FPDF();
    $pdf->AddPage();
    $pdf->SetFont('Arial', 'B', 16);
    $pdf->Cell(0, 10, 'TEST CERTIFICATE', 0, 1, 'C');
    $pdf->Cell(0, 10, 'Sample ID: ' . $sample_id, 0, 1, 'C');
    $pdf->Cell(0, 10, 'Calibration Type: ' . $record['calibration_type'], 0, 1, 'C');
    
    $pdf_content = $pdf->Output('S');
    
    if ($pdf_content) {
        echo "<p style='color: green;'>✅ PDF generation successful</p>";
        echo "<p><strong>PDF Size:</strong> " . strlen($pdf_content) . " bytes</p>";
        
        // Test output
        echo "<h3>PDF Output Test</h3>";
        echo "<p>PDF content generated successfully. Size: " . strlen($pdf_content) . " bytes</p>";
        
        // Save test PDF
        file_put_contents(__DIR__ . '/test_certificate.pdf', $pdf_content);
        echo "<p style='color: green;'>✅ Test PDF saved as test_certificate.pdf</p>";
        
    } else {
        echo "<p style='color: red;'>❌ PDF generation failed</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
    echo "<p><strong>Stack trace:</strong></p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
</style>
