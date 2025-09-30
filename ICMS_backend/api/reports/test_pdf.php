<?php
// Include centralized CORS configuration
include_once '../config/cors.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    require_once __DIR__ . '/../../vendor/setasign/fpdf/fpdf.php';
    
    // Create a simple PDF
    $pdf = new FPDF('P', 'mm', 'A4');
    $pdf->AddPage();
    $pdf->SetFont('Arial', 'B', 16);
    $pdf->Cell(0, 10, 'Test PDF Report', 0, 1, 'C');
    $pdf->Ln(10);
    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(0, 8, 'This is a test PDF generated at: ' . date('Y-m-d H:i:s'), 0, 1, 'L');
    
    // Save PDF to file
    $filename = 'test_report_' . date('Y-m-d_H-i-s') . '.pdf';
    $filepath = __DIR__ . '/../../uploads/reports/' . $filename;
    
    // Create directory if it doesn't exist
    $uploadDir = dirname($filepath);
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception("Failed to create upload directory: " . $uploadDir);
        }
    }
    
    // Save PDF to file
    $pdf->Output('F', $filepath);
    
    if (!file_exists($filepath)) {
        throw new Exception("PDF file was not created successfully");
    }
    
    // Return success response
    echo json_encode([
        'message' => 'Test PDF generated successfully',
        'download_url' => '/ICMS_DOST-%20PSTO/DOST-ICMS/ICMS_backend/uploads/reports/' . $filename,
        'filename' => $filename,
        'file_size' => filesize($filepath)
    ]);
    
} catch (Exception $e) {
    error_log("Test PDF error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'message' => 'Test PDF generation failed: ' . $e->getMessage(),
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>

