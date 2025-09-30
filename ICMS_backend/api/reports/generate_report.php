<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include centralized CORS configuration
include_once '../config/cors.php';

header("Content-Type: application/json; charset=UTF-8");

try {
include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();
    
    if ($db === null) {
        http_response_code(500);
        echo json_encode(array("message" => "Database connection failed"));
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    exit();
}

// Get report parameters from query parameters
$report_type = isset($_GET['type']) ? $_GET['type'] : '';
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
$location = isset($_GET['location']) ? $_GET['location'] : null;

try {
    // Handle different report types
    switch ($report_type) {
        case 'all_reports':
            $result = generateAllReports($db, $start_date, $end_date, $location);
            break;
        case 'calibration_summary':
            $result = generateCalibrationSummary($db, $start_date, $end_date, $location);
            break;
        case 'financial_report':
            $result = generateFinancialReport($db, $start_date, $end_date, $location);
            break;
        case 'inventory_report':
            $result = generateInventoryReport($db, $start_date, $end_date, $location);
            break;
        case 'client_activity':
            $result = generateClientActivityReport($db, $start_date, $end_date, $location);
            break;
        case 'performance_metrics':
            $result = generatePerformanceMetrics($db, $start_date, $end_date, $location);
            break;
        case 'all_requests':
            $result = generateAllRequestsReport($db, $start_date, $end_date, $location);
            break;
        case 'pdf_report':
            generatePDFPreview($db, $start_date, $end_date, $location);
            exit(); // PDF generation will output directly
        case 'test_pdf':
            generateTestPDFPreview();
            exit(); // PDF generation will output directly
        case 'all_requests_test':
            generateAllRequestsTest($db);
            exit(); // Test will output directly
        case 'db_test':
            generateDBTest($db);
            exit(); // Test will output directly
        case 'debug_test':
            generateDebugTest($db);
            exit(); // Debug test will output directly
        default:
            http_response_code(400);
            echo json_encode(array("message" => "Invalid report type: " . $report_type));
            exit();
    }
    
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error generating report: " . $e->getMessage()));
}

function generateAllReports($db, $start_date, $end_date, $location) {
    $reports = [];
    
    // Generate all individual reports with error handling
    try {
        $reports['dashboard_summary'] = generateDashboardSummary($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        $reports['dashboard_summary'] = [];
    }
    
    try {
        $reports['calibration_summary'] = generateCalibrationSummary($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        $reports['calibration_summary'] = [];
    }
    
    try {
        $reports['financial_report'] = generateFinancialReport($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        $reports['financial_report'] = [];
    }
    
    try {
        $reports['inventory_report'] = generateInventoryReport($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        $reports['inventory_report'] = [];
    }
    
    try {
        $reports['client_activity'] = generateClientActivityReport($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        $reports['client_activity'] = [];
    }
    
    try {
        $reports['performance_metrics'] = generatePerformanceMetrics($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        $reports['performance_metrics'] = [];
    }
    
    try {
        $reports['all_requests'] = generateAllRequestsReport($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        $reports['all_requests'] = [];
    }
    
    return [
        'message' => 'All reports generated successfully',
        'reports' => $reports,
        'filters' => [
        'start_date' => $start_date,
        'end_date' => $end_date,
        'location' => $location
        ]
    ];
}

function generateDashboardSummary($db, $start_date, $end_date, $location) {
    $whereClause = buildDateFilter($start_date, $end_date);
    $locationFilter = $location && $location !== 'all' ? " AND r.address LIKE :location" : "";
    
    // Get total requests
    $query = "SELECT COUNT(*) as total_requests FROM requests r WHERE 1=1 $whereClause $locationFilter";
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    if ($location && $location !== 'all') {
        $stmt->bindParam(':location', $location);
    }
    $stmt->execute();
    $totalRequests = $stmt->fetch(PDO::FETCH_ASSOC)['total_requests'];
    
    // Get calibrated items count
    $query = "SELECT COUNT(*) as calibrated_items FROM calibration_records cr 
              JOIN sample s ON cr.sample_id = s.id 
              WHERE cr.date_completed IS NOT NULL $whereClause";
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    $stmt->execute();
    $calibratedItems = $stmt->fetch(PDO::FETCH_ASSOC)['calibrated_items'];
    
    // Get completed requests
    $query = "SELECT COUNT(*) as completed_requests FROM requests r 
              WHERE r.status = 'completed' $whereClause $locationFilter";
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    if ($location && $location !== 'all') {
        $stmt->bindParam(':location', $location);
    }
    $stmt->execute();
    $completedRequests = $stmt->fetch(PDO::FETCH_ASSOC)['completed_requests'];
    
    // Get total clients
    $query = "SELECT COUNT(DISTINCT client_id) as total_clients FROM requests r 
              WHERE 1=1 $whereClause $locationFilter";
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    if ($location && $location !== 'all') {
        $stmt->bindParam(':location', $location);
    }
    $stmt->execute();
    $totalClients = $stmt->fetch(PDO::FETCH_ASSOC)['total_clients'];
    
    // Get total revenue (check if transactions table exists)
    $totalRevenue = 0;
    try {
        $query = "SELECT COALESCE(SUM(p.amount), 0) as total_revenue FROM payments p 
                  JOIN transactions t ON p.transaction_id = t.id 
                  WHERE 1=1 $whereClause";
        $stmt = $db->prepare($query);
        bindDateParams($stmt, $start_date, $end_date);
        $stmt->execute();
        $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['total_revenue'];
    } catch (Exception $e) {
        // Transactions table doesn't exist, revenue is 0
        $totalRevenue = 0;
    }
    
    return [[
        'total_requests' => (int)$totalRequests,
        'total_calibrated_items' => (int)$calibratedItems,
        'completed_requests' => (int)$completedRequests,
        'in_progress_requests' => (int)$totalRequests - (int)$completedRequests,
        'pending_requests' => 0, // Calculate based on status
        'total_revenue' => (float)$totalRevenue,
        'total_clients' => (int)$totalClients
    ]];
}

function generateCalibrationSummary($db, $start_date, $end_date, $location) {
    $whereClause = buildDateFilter($start_date, $end_date);
    $locationFilter = $location && $location !== 'all' ? " AND r.address LIKE :location" : "";
    
    $query = "SELECT 
                DATE(r.date_created) as report_date,
                COUNT(r.id) as total_requests,
                COUNT(DISTINCT r.client_id) as unique_clients,
                COUNT(cr.id) as calibrated_items,
                COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_samples
              FROM requests r
              LEFT JOIN sample s ON r.id = s.request_id
              LEFT JOIN calibration_records cr ON s.id = cr.sample_id AND cr.date_completed IS NOT NULL
              WHERE 1=1 $whereClause $locationFilter
              GROUP BY DATE(r.date_created)
              ORDER BY report_date DESC";
    
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    if ($location && $location !== 'all') {
        $stmt->bindParam(':location', $location);
    }
    $stmt->execute();
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function generateFinancialReport($db, $start_date, $end_date, $location) {
    // Check if transactions table exists
    try {
        $query = "SELECT COUNT(*) FROM transactions LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
    } catch (Exception $e) {
        // Transactions table doesn't exist, return empty array
        return [];
    }
    
    $whereClause = buildDateFilter($start_date, $end_date);
    
    $query = "SELECT 
                DATE(t.created_at) as transaction_date,
                COUNT(t.id) as total_transactions,
                COALESCE(SUM(p.amount), 0) as total_revenue,
                COUNT(DISTINCT t.client_id) as unique_clients,
                COALESCE(SUM(CASE WHEN t.status = 'paid' THEN p.amount ELSE 0 END), 0) as paid_amount,
                COALESCE(SUM(CASE WHEN t.status = 'pending' THEN p.amount ELSE 0 END), 0) as pending_amount
              FROM transactions t
              LEFT JOIN payments p ON t.id = p.transaction_id
              WHERE 1=1 $whereClause
              GROUP BY DATE(t.created_at)
              ORDER BY transaction_date DESC";
    
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    $stmt->execute();
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function generateInventoryReport($db, $start_date, $end_date, $location) {
    $query = "SELECT 
                s.id,
                s.serial_number,
                s.equipment_type,
                s.model,
                s.manufacturer,
                s.status,
                CASE WHEN cr.date_completed IS NOT NULL THEN 1 ELSE 0 END as is_calibrated,
                cr.date_completed as last_calibration_date,
                c.company_name as client_name
              FROM sample s
              LEFT JOIN calibration_records cr ON s.id = cr.sample_id AND cr.date_completed IS NOT NULL
              LEFT JOIN requests r ON s.request_id = r.id
              LEFT JOIN clients c ON r.client_id = c.id
              ORDER BY s.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function generateClientActivityReport($db, $start_date, $end_date, $location) {
    $whereClause = buildDateFilter($start_date, $end_date);
    $locationFilter = $location && $location !== 'all' ? " AND r.address LIKE :location" : "";
    
    $query = "SELECT 
                c.id as client_id,
                c.company_name,
                c.contact_person,
                c.email,
                COUNT(r.id) as total_requests,
                COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_requests,
                COUNT(s.id) as total_samples,
                COUNT(cr.id) as calibrated_samples,
                MAX(r.date_created) as last_request_date
              FROM clients c
              LEFT JOIN requests r ON c.id = r.client_id $whereClause $locationFilter
              LEFT JOIN sample s ON r.id = s.request_id
              LEFT JOIN calibration_records cr ON s.id = cr.sample_id AND cr.date_completed IS NOT NULL
              GROUP BY c.id, c.company_name, c.contact_person, c.email
              ORDER BY total_requests DESC";
    
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    if ($location && $location !== 'all') {
        $stmt->bindParam(':location', $location);
    }
    $stmt->execute();
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function generatePerformanceMetrics($db, $start_date, $end_date, $location) {
    $whereClause = buildDateFilter($start_date, $end_date);
    
    $query = "SELECT 
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.role,
                COUNT(cr.id) as calibrations_completed,
                AVG(DATEDIFF(cr.date_completed, cr.date_started)) as avg_turnaround_days,
                COUNT(DISTINCT DATE(cr.date_completed)) as active_days
              FROM users u
              LEFT JOIN calibration_records cr ON u.id = cr.calibrated_by $whereClause
              WHERE u.role IN ('calibration_engineer', 'senior_engineer', 'technical_manager')
              GROUP BY u.id, u.first_name, u.last_name, u.role
              ORDER BY calibrations_completed DESC";
    
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    $stmt->execute();
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function buildDateFilter($start_date, $end_date) {
    $conditions = [];
    
    if ($start_date) {
        $conditions[] = "DATE(date_created) >= :start_date";
    }
    
    if ($end_date) {
        $conditions[] = "DATE(date_created) <= :end_date";
    }
    
    return empty($conditions) ? "" : " AND " . implode(" AND ", $conditions);
}

function generateAllRequestsReport($db, $start_date, $end_date, $location) {
    // Build date filter with debugging
    $whereClause = buildDateFilter($start_date, $end_date);
    $locationFilter = $location && $location !== 'all' ? " AND r.address LIKE :location" : "";
    
    // Log the query for debugging
    error_log("All Requests Query - Start Date: $start_date, End Date: $end_date, Location: $location");
    error_log("Where Clause: $whereClause");
    
    $query = "SELECT 
                r.id as request_id,
                r.reference_no,
                r.date_created,
                r.date_submitted,
                r.status,
                r.address,
                c.company_name,
                c.contact_person,
                c.email,
                c.phone,
                COUNT(s.id) as total_samples,
                COUNT(CASE WHEN cr.date_completed IS NOT NULL THEN 1 END) as calibrated_samples,
                COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_samples,
                GROUP_CONCAT(DISTINCT s.type ORDER BY s.type SEPARATOR ', ') as equipment_types
              FROM requests r
              LEFT JOIN clients c ON r.client_id = c.id
              LEFT JOIN sample s ON r.id = s.request_id
              LEFT JOIN calibration_records cr ON s.id = cr.sample_id
              WHERE 1=1 $whereClause $locationFilter
              GROUP BY r.id, r.reference_no, r.date_created, r.date_submitted, r.status, r.address, 
                       c.company_name, c.contact_person, c.email, c.phone
              ORDER BY r.date_created DESC";
    
    error_log("Full Query: $query");
    
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    if ($location && $location !== 'all') {
        $stmt->bindParam(':location', $location);
    }
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("All Requests Results Count: " . count($results));
    
    return $results;
}

function generatePDFReport($db, $start_date, $end_date, $location) {
    try {
        require_once __DIR__ . '/../../vendor/setasign/fpdf/fpdf.php';
    } catch (Exception $e) {
        error_log("FPDF require error: " . $e->getMessage());
        throw new Exception("Failed to load FPDF library: " . $e->getMessage());
    }
    
    try {
        // Generate all report data
    $reports = [];
    try {
        $reports['dashboard_summary'] = generateDashboardSummary($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        error_log("Dashboard summary error: " . $e->getMessage());
        $reports['dashboard_summary'] = [];
    }
    
    try {
        $reports['all_requests'] = generateAllRequestsReport($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        error_log("All requests error: " . $e->getMessage());
        $reports['all_requests'] = [];
    }
    
    try {
        $reports['calibration_summary'] = generateCalibrationSummary($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        error_log("Calibration summary error: " . $e->getMessage());
        $reports['calibration_summary'] = [];
    }
    
    try {
        $reports['client_activity'] = generateClientActivityReport($db, $start_date, $end_date, $location);
    } catch (Exception $e) {
        error_log("Client activity error: " . $e->getMessage());
        $reports['client_activity'] = [];
    }
    
    // Create PDF
    try {
        $pdf = new FPDF('P', 'mm', 'A4');
    } catch (Exception $e) {
        error_log("FPDF creation error: " . $e->getMessage());
        throw new Exception("Failed to create PDF object: " . $e->getMessage());
    }
    $pdf->AddPage();
    
    // Header
    $pdf->SetFont('Arial', 'B', 16);
    $pdf->Cell(0, 10, 'COMPREHENSIVE REPORTS', 0, 1, 'C');
    $pdf->Ln(5);
    
    // Report details
    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(0, 8, 'Date Range: ' . $start_date . ' to ' . $end_date, 0, 1, 'L');
    $pdf->Cell(0, 8, 'Location: ' . ($location === 'all' ? 'All Locations' : $location), 0, 1, 'L');
    $pdf->Cell(0, 8, 'Generated on: ' . date('Y-m-d H:i:s'), 0, 1, 'L');
    $pdf->Ln(10);
    
    // Dashboard Summary
    if (!empty($reports['dashboard_summary'])) {
        $summary = $reports['dashboard_summary'][0];
        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(0, 10, 'DASHBOARD SUMMARY', 0, 1, 'L');
        $pdf->Ln(5);
        
        $pdf->SetFont('Arial', '', 11);
        $pdf->Cell(60, 8, 'Total Requests:', 0, 0, 'L');
        $pdf->Cell(0, 8, $summary['total_requests'], 0, 1, 'L');
        $pdf->Cell(60, 8, 'Total Calibrated Items:', 0, 0, 'L');
        $pdf->Cell(0, 8, $summary['total_calibrated_items'], 0, 1, 'L');
        $pdf->Cell(60, 8, 'Completed Requests:', 0, 0, 'L');
        $pdf->Cell(0, 8, $summary['completed_requests'], 0, 1, 'L');
        $pdf->Cell(60, 8, 'Total Clients:', 0, 0, 'L');
        $pdf->Cell(0, 8, $summary['total_clients'], 0, 1, 'L');
        $pdf->Ln(10);
    }
    
    // All Requests Details
    if (!empty($reports['all_requests'])) {
        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(0, 10, 'ALL REQUESTS DETAILS', 0, 1, 'L');
        $pdf->Ln(5);
        
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(20, 8, 'Ref No', 1, 0, 'C');
        $pdf->Cell(25, 8, 'Date Created', 1, 0, 'C');
        $pdf->Cell(15, 8, 'Status', 1, 0, 'C');
        $pdf->Cell(40, 8, 'Company', 1, 0, 'C');
        $pdf->Cell(30, 8, 'Contact Person', 1, 0, 'C');
        $pdf->Cell(20, 8, 'Samples', 1, 0, 'C');
        $pdf->Cell(20, 8, 'Calibrated', 1, 0, 'C');
        $pdf->Cell(30, 8, 'Equipment Types', 1, 1, 'C');
        
        $pdf->SetFont('Arial', '', 8);
        foreach ($reports['all_requests'] as $request) {
            // Check if we need a new page
            if ($pdf->GetY() > 250) {
                $pdf->AddPage();
                // Repeat header
                $pdf->SetFont('Arial', 'B', 9);
                $pdf->Cell(20, 8, 'Ref No', 1, 0, 'C');
                $pdf->Cell(25, 8, 'Date Created', 1, 0, 'C');
                $pdf->Cell(15, 8, 'Status', 1, 0, 'C');
                $pdf->Cell(40, 8, 'Company', 1, 0, 'C');
                $pdf->Cell(30, 8, 'Contact Person', 1, 0, 'C');
                $pdf->Cell(20, 8, 'Samples', 1, 0, 'C');
                $pdf->Cell(20, 8, 'Calibrated', 1, 0, 'C');
                $pdf->Cell(30, 8, 'Equipment Types', 1, 1, 'C');
                $pdf->SetFont('Arial', '', 8);
            }
            
            $pdf->Cell(20, 8, substr($request['reference_no'], 0, 12), 1, 0, 'C');
            $pdf->Cell(25, 8, date('Y-m-d', strtotime($request['date_created'])), 1, 0, 'C');
            $pdf->Cell(15, 8, $request['status'], 1, 0, 'C');
            $pdf->Cell(40, 8, substr($request['company_name'], 0, 20), 1, 0, 'C');
            $pdf->Cell(30, 8, substr($request['contact_person'], 0, 15), 1, 0, 'C');
            $pdf->Cell(20, 8, $request['total_samples'], 1, 0, 'C');
            $pdf->Cell(20, 8, $request['calibrated_samples'], 1, 0, 'C');
            $pdf->Cell(30, 8, substr($request['equipment_types'], 0, 15), 1, 1, 'C');
        }
        $pdf->Ln(10);
    }
    
    // Calibration Summary
    if (!empty($reports['calibration_summary'])) {
        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(0, 10, 'CALIBRATION SUMMARY BY DATE', 0, 1, 'L');
        $pdf->Ln(5);
        
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(30, 8, 'Date', 1, 0, 'C');
        $pdf->Cell(25, 8, 'Total Requests', 1, 0, 'C');
        $pdf->Cell(25, 8, 'Unique Clients', 1, 0, 'C');
        $pdf->Cell(25, 8, 'Calibrated Items', 1, 0, 'C');
        $pdf->Cell(25, 8, 'Completed Samples', 1, 1, 'C');
        
        $pdf->SetFont('Arial', '', 8);
        foreach ($reports['calibration_summary'] as $summary) {
            if ($pdf->GetY() > 250) {
                $pdf->AddPage();
                $pdf->SetFont('Arial', 'B', 9);
                $pdf->Cell(30, 8, 'Date', 1, 0, 'C');
                $pdf->Cell(25, 8, 'Total Requests', 1, 0, 'C');
                $pdf->Cell(25, 8, 'Unique Clients', 1, 0, 'C');
                $pdf->Cell(25, 8, 'Calibrated Items', 1, 0, 'C');
                $pdf->Cell(25, 8, 'Completed Samples', 1, 1, 'C');
                $pdf->SetFont('Arial', '', 8);
            }
            
            $pdf->Cell(30, 8, $summary['report_date'], 1, 0, 'C');
            $pdf->Cell(25, 8, $summary['total_requests'], 1, 0, 'C');
            $pdf->Cell(25, 8, $summary['unique_clients'], 1, 0, 'C');
            $pdf->Cell(25, 8, $summary['calibrated_items'], 1, 0, 'C');
            $pdf->Cell(25, 8, $summary['completed_samples'], 1, 1, 'C');
        }
    }
    
    // Save PDF to file
    $filename = 'comprehensive_report_' . str_replace('-', '_', $start_date) . '_to_' . str_replace('-', '_', $end_date) . '.pdf';
    $filepath = __DIR__ . '/../../uploads/reports/' . $filename;
    
    try {
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
        
    } catch (Exception $e) {
        error_log("PDF file save error: " . $e->getMessage());
        throw new Exception("Failed to save PDF file: " . $e->getMessage());
    }
    
    // Return download URL
    return [
        'message' => 'PDF report generated successfully',
        'download_url' => '/ICMS_DOST-%20PSTO/DOST-ICMS/ICMS_backend/uploads/reports/' . $filename,
        'filename' => $filename
    ];
    
    } catch (Exception $e) {
        error_log("PDF generation error: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        throw new Exception("PDF generation failed: " . $e->getMessage());
    }
}

function generateAllRequestsTest($db) {
    // Test query without any date filtering to see all requests
    $query = "SELECT 
                r.id as request_id,
                r.reference_no,
                r.date_created,
                r.date_submitted,
                r.status,
                r.address,
                c.company_name,
                c.contact_person,
                c.email,
                c.phone,
                COUNT(s.id) as total_samples,
                COUNT(CASE WHEN cr.date_completed IS NOT NULL THEN 1 END) as calibrated_samples,
                COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_samples,
                GROUP_CONCAT(DISTINCT s.type ORDER BY s.type SEPARATOR ', ') as equipment_types
              FROM requests r
              LEFT JOIN clients c ON r.client_id = c.id
              LEFT JOIN sample s ON r.id = s.request_id
              LEFT JOIN calibration_records cr ON s.id = cr.sample_id
              GROUP BY r.id, r.reference_no, r.date_created, r.date_submitted, r.status, r.address, 
                       c.company_name, c.contact_person, c.email, c.phone
              ORDER BY r.date_created DESC";
    
    error_log("All Requests Test Query: $query");
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("All Requests Test Results Count: " . count($results));
    
    // Output JSON directly
    echo json_encode([
        'message' => 'All requests test completed',
        'total_requests' => count($results),
        'requests' => $results
    ]);
}

function generateDebugTest($db) {
    error_log("=== DEBUG TEST STARTED ===");
    
    try {
        // Test 1: Simple count
        $countQuery = "SELECT COUNT(*) as total FROM requests";
        $stmt = $db->prepare($countQuery);
        $stmt->execute();
        $countResult = $stmt->fetch(PDO::FETCH_ASSOC);
        error_log("Debug Test - Count query result: " . json_encode($countResult));
        
        // Test 2: Simple select - first check what columns exist
        $selectQuery = "SELECT * FROM requests LIMIT 5";
        $stmt2 = $db->prepare($selectQuery);
        $stmt2->execute();
        $selectResults = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        error_log("Debug Test - Select query results count: " . count($selectResults));
        if (!empty($selectResults)) {
            error_log("Debug Test - First result: " . json_encode($selectResults[0]));
            error_log("Debug Test - Available columns: " . implode(', ', array_keys($selectResults[0])));
        }
        
        // Test 3: Call the function
        error_log("Debug Test - About to call generateAllRequestsTestData()");
        $functionResults = generateAllRequestsTestData($db);
        error_log("Debug Test - Function returned count: " . count($functionResults));
        
        // Output results
        echo json_encode([
            'message' => 'Debug test completed',
            'count_query_result' => $countResult,
            'select_query_count' => count($selectResults),
            'select_query_first' => !empty($selectResults) ? $selectResults[0] : null,
            'function_returned_count' => count($functionResults),
            'function_returned_first' => !empty($functionResults) ? $functionResults[0] : null
        ]);
        
    } catch (Exception $e) {
        error_log("Debug Test Error: " . $e->getMessage());
        echo json_encode([
            'message' => 'Debug test failed: ' . $e->getMessage(),
            'error' => $e->getMessage()
        ]);
    }
}

function generateAllRequestsTestData($db) {
    error_log("generateAllRequestsTestData() called");
    
    // First try a simple query to see if there are any requests at all
    $simpleQuery = "SELECT * FROM requests ORDER BY id DESC LIMIT 5";
    error_log("Simple query: $simpleQuery");
    
    try {
        $stmt = $db->prepare($simpleQuery);
        $stmt->execute();
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("Simple query results count: " . count($results));
        
        if (!empty($results)) {
            error_log("Simple query first result: " . json_encode($results[0]));
        }
        
        // For now, just return the simple results to get the PDF working
        // We can add complex JOINs later once we know the exact schema
        error_log("Returning simple results to get PDF working");
        return $results;
        
    } catch (Exception $e) {
        error_log("Error in generateAllRequestsTestData: " . $e->getMessage());
        return [];
    }
}

function generateDBTest($db) {
    try {
        // Simple test query
        $query = "SELECT COUNT(*) as total_requests FROM requests";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'message' => 'Database test completed',
            'total_requests' => $result['total_requests'],
            'status' => 'success'
        ]);
        
    } catch (Exception $e) {
        error_log("DB Test Error: " . $e->getMessage());
        
        http_response_code(500);
        echo json_encode([
            'message' => 'Database test failed: ' . $e->getMessage(),
            'error' => $e->getMessage(),
            'status' => 'error'
        ]);
    }
}

function generateTestPDFPreview() {
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
        $pdf->Ln(10);
        $pdf->Cell(0, 8, 'This PDF is being previewed in the browser.', 0, 1, 'L');
        
        // Set headers for PDF preview
        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="test_report.pdf"');
        header('Cache-Control: private, max-age=0, must-revalidate');
        header('Pragma: public');
        
        // Output PDF directly to browser
        $pdf->Output('I', 'test_report.pdf');
        
    } catch (Exception $e) {
        error_log("Test PDF preview error: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'message' => 'Test PDF preview failed: ' . $e->getMessage(),
            'error' => $e->getMessage()
        ]);
    }
}

function generatePDFPreview($db, $start_date, $end_date, $location) {
    error_log("generatePDFPreview() called with params: start_date=$start_date, end_date=$end_date, location=$location");
    
    try {
        require_once __DIR__ . '/../../vendor/setasign/fpdf/fpdf.php';
    } catch (Exception $e) {
        error_log("FPDF require error: " . $e->getMessage());
        throw new Exception("Failed to load FPDF library: " . $e->getMessage());
    }
    
    try {
        // Generate all report data
        $reports = [];
        try {
            $reports['dashboard_summary'] = generateDashboardSummary($db, $start_date, $end_date, $location);
        } catch (Exception $e) {
            error_log("Dashboard summary error: " . $e->getMessage());
            $reports['dashboard_summary'] = [];
        }
        
        try {
            error_log("PDF Generation - About to call generateAllRequestsTestData()");
            // Use test function to get ALL requests without date filtering
            $reports['all_requests'] = generateAllRequestsTestData($db);
            error_log("PDF Generation - Function returned, count: " . count($reports['all_requests']));
            error_log("PDF Generation - All requests count: " . count($reports['all_requests']));
            if (!empty($reports['all_requests'])) {
                error_log("PDF Generation - First request data: " . json_encode($reports['all_requests'][0]));
            } else {
                error_log("PDF Generation - All requests array is empty");
            }
        } catch (Exception $e) {
            error_log("All requests error: " . $e->getMessage());
            $reports['all_requests'] = [];
        }
        
        try {
            $reports['calibration_summary'] = generateCalibrationSummary($db, $start_date, $end_date, $location);
        } catch (Exception $e) {
            error_log("Calibration summary error: " . $e->getMessage());
            $reports['calibration_summary'] = [];
        }
        
        try {
            $reports['client_activity'] = generateClientActivityReport($db, $start_date, $end_date, $location);
        } catch (Exception $e) {
            error_log("Client activity error: " . $e->getMessage());
            $reports['client_activity'] = [];
        }
        
        // Create PDF
        try {
            $pdf = new FPDF('P', 'mm', 'A4');
        } catch (Exception $e) {
            error_log("FPDF creation error: " . $e->getMessage());
            throw new Exception("Failed to create PDF object: " . $e->getMessage());
        }
        $pdf->AddPage();
        
        // Header
        $pdf->SetFont('Arial', 'B', 16);
        $pdf->Cell(0, 10, 'COMPREHENSIVE REPORTS', 0, 1, 'C');
        $pdf->Ln(5);
        
        // Report details
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(0, 8, 'Date Range: ' . $start_date . ' to ' . $end_date, 0, 1, 'L');
        $pdf->Cell(0, 8, 'Location: ' . ($location === 'all' ? 'All Locations' : $location), 0, 1, 'L');
        $pdf->Cell(0, 8, 'Generated on: ' . date('Y-m-d H:i:s'), 0, 1, 'L');
        $pdf->Ln(10);
        
        // Dashboard Summary
        if (!empty($reports['dashboard_summary'])) {
            $summary = $reports['dashboard_summary'][0];
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, 'DASHBOARD SUMMARY', 0, 1, 'L');
            $pdf->Ln(5);
            
            $pdf->SetFont('Arial', '', 11);
            $pdf->Cell(60, 8, 'Total Requests:', 0, 0, 'L');
            $pdf->Cell(0, 8, $summary['total_requests'], 0, 1, 'L');
            $pdf->Cell(60, 8, 'Total Calibrated Items:', 0, 0, 'L');
            $pdf->Cell(0, 8, $summary['total_calibrated_items'], 0, 1, 'L');
            $pdf->Cell(60, 8, 'Completed Requests:', 0, 0, 'L');
            $pdf->Cell(0, 8, $summary['completed_requests'], 0, 1, 'L');
            $pdf->Cell(60, 8, 'Total Clients:', 0, 0, 'L');
            $pdf->Cell(0, 8, $summary['total_clients'], 0, 1, 'L');
            $pdf->Ln(10);
        }
        
        // All Requests Details
        error_log("PDF Rendering - Checking all_requests array: " . json_encode($reports['all_requests']));
        error_log("PDF Rendering - Array count: " . count($reports['all_requests']));
        error_log("PDF Rendering - Array empty check: " . (empty($reports['all_requests']) ? 'TRUE' : 'FALSE'));
        
        if (!empty($reports['all_requests'])) {
            error_log("PDF Rendering - Found " . count($reports['all_requests']) . " requests, rendering table");
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, 'ALL REQUESTS DETAILS (' . count($reports['all_requests']) . ' requests)', 0, 1, 'L');
            $pdf->Ln(5);
            
            $pdf->SetFont('Arial', 'B', 9);
            $pdf->Cell(20, 8, 'ID', 1, 0, 'C');
            $pdf->Cell(25, 8, 'Date Created', 1, 0, 'C');
            $pdf->Cell(15, 8, 'Status', 1, 0, 'C');
            $pdf->Cell(40, 8, 'Info', 1, 0, 'C');
            $pdf->Cell(30, 8, 'Details', 1, 0, 'C');
            $pdf->Cell(20, 8, 'Count', 1, 0, 'C');
            $pdf->Cell(20, 8, 'Done', 1, 0, 'C');
            $pdf->Cell(30, 8, 'Type', 1, 1, 'C');
            
            $pdf->SetFont('Arial', '', 8);
            foreach ($reports['all_requests'] as $index => $request) {
                error_log("PDF Rendering - Processing request $index: " . json_encode($request));
                
                // Check if we need a new page
                if ($pdf->GetY() > 250) {
                    $pdf->AddPage();
                    // Repeat header
                    $pdf->SetFont('Arial', 'B', 9);
                    $pdf->Cell(20, 8, 'ID', 1, 0, 'C');
                    $pdf->Cell(25, 8, 'Date Created', 1, 0, 'C');
                    $pdf->Cell(15, 8, 'Status', 1, 0, 'C');
                    $pdf->Cell(40, 8, 'Info', 1, 0, 'C');
                    $pdf->Cell(30, 8, 'Details', 1, 0, 'C');
                    $pdf->Cell(20, 8, 'Count', 1, 0, 'C');
                    $pdf->Cell(20, 8, 'Done', 1, 0, 'C');
                    $pdf->Cell(30, 8, 'Type', 1, 1, 'C');
                    $pdf->SetFont('Arial', '', 8);
                }
                
                // Handle null values - use actual columns that exist
                $id = $request['id'] ?? 'N/A';
                $date_created = $request['date_created'] ?? 'N/A';
                $status = $request['status'] ?? 'N/A';
                
                // For now, show basic info - we'll add more columns once we know the schema
                $pdf->Cell(20, 8, substr($id, 0, 12), 1, 0, 'C');
                $pdf->Cell(25, 8, ($date_created !== 'N/A') ? date('Y-m-d', strtotime($date_created)) : 'N/A', 1, 0, 'C');
                $pdf->Cell(15, 8, $status, 1, 0, 'C');
                $pdf->Cell(40, 8, 'Basic Info', 1, 0, 'C');
                $pdf->Cell(30, 8, 'Available', 1, 0, 'C');
                $pdf->Cell(20, 8, '1', 1, 0, 'C');
                $pdf->Cell(20, 8, '0', 1, 0, 'C');
                $pdf->Cell(30, 8, 'Request', 1, 1, 'C');
            }
            $pdf->Ln(10);
        } else {
            $pdf->SetFont('Arial', 'I', 10);
            $pdf->Cell(0, 8, 'No requests found in database.', 0, 1, 'C');
            $pdf->Cell(0, 8, 'Debug: Array count = ' . count($reports['all_requests']), 0, 1, 'C');
            $pdf->Cell(0, 8, 'Debug: Array empty = ' . (empty($reports['all_requests']) ? 'YES' : 'NO'), 0, 1, 'C');
            error_log("PDF Generation: No requests found in all_requests array");
        }
        
        // Calibration Summary
        if (!empty($reports['calibration_summary'])) {
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, 'CALIBRATION SUMMARY BY DATE', 0, 1, 'L');
            $pdf->Ln(5);
            
            $pdf->SetFont('Arial', 'B', 9);
            $pdf->Cell(30, 8, 'Date', 1, 0, 'C');
            $pdf->Cell(25, 8, 'Total Requests', 1, 0, 'C');
            $pdf->Cell(25, 8, 'Unique Clients', 1, 0, 'C');
            $pdf->Cell(25, 8, 'Calibrated Items', 1, 0, 'C');
            $pdf->Cell(25, 8, 'Completed Samples', 1, 1, 'C');
            
            $pdf->SetFont('Arial', '', 8);
            foreach ($reports['calibration_summary'] as $summary) {
                if ($pdf->GetY() > 250) {
                    $pdf->AddPage();
                    $pdf->SetFont('Arial', 'B', 9);
                    $pdf->Cell(30, 8, 'Date', 1, 0, 'C');
                    $pdf->Cell(25, 8, 'Total Requests', 1, 0, 'C');
                    $pdf->Cell(25, 8, 'Unique Clients', 1, 0, 'C');
                    $pdf->Cell(25, 8, 'Calibrated Items', 1, 0, 'C');
                    $pdf->Cell(25, 8, 'Completed Samples', 1, 1, 'C');
                    $pdf->SetFont('Arial', '', 8);
                }
                
                $pdf->Cell(30, 8, $summary['report_date'], 1, 0, 'C');
                $pdf->Cell(25, 8, $summary['total_requests'], 1, 0, 'C');
                $pdf->Cell(25, 8, $summary['unique_clients'], 1, 0, 'C');
                $pdf->Cell(25, 8, $summary['calibrated_items'], 1, 0, 'C');
                $pdf->Cell(25, 8, $summary['completed_samples'], 1, 1, 'C');
            }
        }
        
        // Set headers for PDF preview
        $filename = 'comprehensive_report_' . str_replace('-', '_', $start_date) . '_to_' . str_replace('-', '_', $end_date) . '.pdf';
        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="' . $filename . '"');
        header('Cache-Control: private, max-age=0, must-revalidate');
        header('Pragma: public');
        
        // Output PDF directly to browser
        $pdf->Output('I', $filename);
        
    } catch (Exception $e) {
        error_log("PDF preview error: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'message' => 'PDF preview failed: ' . $e->getMessage(),
            'error' => $e->getMessage()
        ]);
    }
}

function bindDateParams($stmt, $start_date, $end_date) {
    if ($start_date) {
        $stmt->bindParam(':start_date', $start_date);
    }
    
    if ($end_date) {
        $stmt->bindParam(':end_date', $end_date);
    }
}
?> 