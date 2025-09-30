<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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
        $conditions[] = "date_created >= :start_date";
    }
    
    if ($end_date) {
        $conditions[] = "date_created <= :end_date";
    }
    
    return empty($conditions) ? "" : " AND " . implode(" AND ", $conditions);
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