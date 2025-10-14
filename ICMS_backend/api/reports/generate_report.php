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

// Best-effort get acting user if available
$auth_user = null;
try {
    require_once __DIR__ . '/../auth/verify_token.php';
    $auth_user = verifyToken();
} catch (Throwable $e) {
    $auth_user = null;
}

// Helper to log generated reports (best-effort)
function logReportGenerated($db, $userId, $reportType, $details) {
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS system_logs (id INT AUTO_INCREMENT PRIMARY KEY, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, user_id INT NULL, action VARCHAR(255) NOT NULL, details TEXT NULL, ip_address VARCHAR(45) NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $stmt = $db->prepare("INSERT INTO system_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
        $payload = json_encode(array_merge(['report_type' => (string)$reportType], (array)$details));
        $stmt->execute([$userId, 'report_generate', $payload, null]);
    } catch (Exception $ignore) {}
}

// Get report parameters from query parameters
$report_type = isset($_GET['type']) ? $_GET['type'] : '';
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
$location = isset($_GET['location']) ? $_GET['location'] : null;
// Optional section toggles (default to include when not provided)
$include_samples = isset($_GET['include_samples']) ? ($_GET['include_samples'] === '1' || $_GET['include_samples'] === 'true') : true;
$include_clients_by_city = isset($_GET['include_clients_by_city']) ? ($_GET['include_clients_by_city'] === '1' || $_GET['include_clients_by_city'] === 'true') : true;
$include_inventory = isset($_GET['include_inventory']) ? ($_GET['include_inventory'] === '1' || $_GET['include_inventory'] === 'true') : true;

try {
    // Handle different report types
    switch ($report_type) {
        case 'all_reports':
            $result = generateAllReports($db, $start_date, $end_date, $location);
            logReportGenerated($db, $auth_user->id ?? null, 'all_reports', ['start_date' => $start_date, 'end_date' => $end_date, 'location' => $location]);
            break;
        case 'calibration_summary':
            $result = generateCalibrationSummary($db, $start_date, $end_date, $location);
            logReportGenerated($db, $auth_user->id ?? null, 'calibration_summary', ['start_date' => $start_date, 'end_date' => $end_date, 'location' => $location]);
            break;
        case 'financial_report':
            $result = generateFinancialReport($db, $start_date, $end_date, $location);
            logReportGenerated($db, $auth_user->id ?? null, 'financial_report', ['start_date' => $start_date, 'end_date' => $end_date, 'location' => $location]);
            break;
        case 'inventory_report':
            $result = generateInventoryReport($db, $start_date, $end_date, $location);
            logReportGenerated($db, $auth_user->id ?? null, 'inventory_report', ['start_date' => $start_date, 'end_date' => $end_date, 'location' => $location]);
            break;
        case 'client_activity':
            $result = generateClientActivityReport($db, $start_date, $end_date, $location);
            logReportGenerated($db, $auth_user->id ?? null, 'client_activity', ['start_date' => $start_date, 'end_date' => $end_date, 'location' => $location]);
            break;
        case 'performance_metrics':
            $result = generatePerformanceMetrics($db, $start_date, $end_date, $location);
            logReportGenerated($db, $auth_user->id ?? null, 'performance_metrics', ['start_date' => $start_date, 'end_date' => $end_date, 'location' => $location]);
            break;
        case 'all_requests':
            $result = generateAllRequestsReport($db, $start_date, $end_date, $location);
            logReportGenerated($db, $auth_user->id ?? null, 'all_requests', ['start_date' => $start_date, 'end_date' => $end_date, 'location' => $location]);
            break;
        case 'pdf_report':
            logReportGenerated($db, $auth_user->id ?? null, 'pdf_report', ['start_date' => $start_date, 'end_date' => $end_date, 'location' => $location, 'include_samples' => $include_samples, 'include_clients_by_city' => $include_clients_by_city, 'include_inventory' => $include_inventory, 'mode' => 'preview']);
            generatePDFPreview($db, $start_date, $end_date, $location, $include_samples, $include_clients_by_city, $include_inventory);
            exit(); // PDF generation will output directly
        case 'test_pdf':
            logReportGenerated($db, $auth_user->id ?? null, 'test_pdf', []);
            generateTestPDFPreview();
            exit(); // PDF generation will output directly
        case 'all_requests_test':
            logReportGenerated($db, $auth_user->id ?? null, 'all_requests_test', []);
            generateAllRequestsTest($db);
            exit(); // Test will output directly
        case 'db_test':
            logReportGenerated($db, $auth_user->id ?? null, 'db_test', []);
            generateDBTest($db);
            exit(); // Test will output directly
        case 'debug_test':
            logReportGenerated($db, $auth_user->id ?? null, 'debug_test', []);
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
    // Build per-table date filters to ensure correct metrics by selected date range
    // 1) Requests by r.date_created
    $reqWhere = "";
    if ($start_date && $end_date) {
        $reqWhere = " AND DATE(r.date_created) BETWEEN :start_date AND :end_date";
    } elseif ($start_date) {
        $reqWhere = " AND DATE(r.date_created) >= :start_date";
    } elseif ($end_date) {
        $reqWhere = " AND DATE(r.date_created) <= :end_date";
    }
    $locFilter = $location && $location !== 'all' ? " AND r.address LIKE :location" : "";
    $likeLocation = ($location && $location !== 'all') ? ("%" . $location . "%") : null;

    // Total requests
    $query = "SELECT COUNT(*) AS total_requests FROM requests r WHERE 1=1 $reqWhere $locFilter";
    $stmt = $db->prepare($query);
    if ($start_date) { $stmt->bindParam(':start_date', $start_date); }
    if ($end_date)   { $stmt->bindParam(':end_date', $end_date); }
    if ($location && $location !== 'all') { $stmt->bindParam(':location', $likeLocation); }
    $stmt->execute();
    $totalRequests = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_requests'];
    // Fallback: use full timestamp range if DATE() filtering returns 0
    if ($totalRequests === 0 && ($start_date || $end_date)) {
        $startDt = $start_date ? ($start_date . ' 00:00:00') : null;
        $endDtExclusive = $end_date ? date('Y-m-d H:i:s', strtotime($end_date . ' +1 day')) : null;
        $tsWhere = '';
        if ($startDt && $endDtExclusive) {
            $tsWhere = ' AND r.date_created >= :start_dt AND r.date_created < :end_dt';
        } elseif ($startDt) {
            $tsWhere = ' AND r.date_created >= :start_dt';
        } elseif ($endDtExclusive) {
            $tsWhere = ' AND r.date_created < :end_dt';
        }
        $fallbackSql = "SELECT COUNT(*) AS total_requests FROM requests r WHERE 1=1 $tsWhere $locFilter";
        $stmt = $db->prepare($fallbackSql);
        if ($startDt) { $stmt->bindParam(':start_dt', $startDt); }
        if ($endDtExclusive) { $stmt->bindParam(':end_dt', $endDtExclusive); }
        if ($location && $location !== 'all') { $stmt->bindParam(':location', $likeLocation); }
        $stmt->execute();
        $totalRequests = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_requests'];
    }
    error_log('DashboardSummary - totalRequests: ' . $totalRequests . ' start=' . $start_date . ' end=' . $end_date . ' loc=' . ($location ?? 'null'));

    // 2) Total Calibrated Items: count completed items in sample table within request date range
    $query = "SELECT COUNT(s.id) AS calibrated_items
              FROM sample s
              JOIN requests r ON r.reference_number = s.reservation_ref_no
              WHERE s.status = 'completed' $reqWhere $locFilter";
    $stmt = $db->prepare($query);
    if ($start_date) { $stmt->bindParam(':start_date', $start_date); }
    if ($end_date)   { $stmt->bindParam(':end_date', $end_date); }
    if ($location && $location !== 'all') { $stmt->bindParam(':location', $likeLocation); }
    $stmt->execute();
    $calibratedItems = (int)$stmt->fetch(PDO::FETCH_ASSOC)['calibrated_items'];

    // 3) Total revenue by selected date with schema fallbacks
    $totalRevenue = 0.0;
    try {
        // Prefer new schema (transactions + payments)
        $revDate = [];
        if ($start_date) { $revDate[] = "DATE(t.created_at) >= :start_date"; }
        if ($end_date)   { $revDate[] = "DATE(t.created_at) <= :end_date"; }
        $revWhere = empty($revDate) ? "" : (" AND " . implode(" AND ", $revDate));
        $query = "SELECT COALESCE(SUM(p.amount), 0) AS total_revenue
                  FROM transactions t
                  LEFT JOIN payments p ON t.id = p.transaction_id
                  WHERE 1=1 $revWhere";
        $stmt = $db->prepare($query);
        if ($start_date) { $stmt->bindParam(':start_date', $start_date); }
        if ($end_date)   { $stmt->bindParam(':end_date', $end_date); }
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $totalRevenue = $row ? (float)$row['total_revenue'] : 0.0;
    } catch (Exception $e) {
        // Legacy single `transaction` table storing payments JSON; use created/updated timestamp
        try {
            $revDate = [];
            if ($start_date) { $revDate[] = "DATE(t.updated_at) >= :start_date"; }
            if ($end_date)   { $revDate[] = "DATE(t.updated_at) <= :end_date"; }
            $revWhere = empty($revDate) ? "" : (" AND " . implode(" AND ", $revDate));
            $query = "SELECT COALESCE(SUM(t.amount), 0) AS total_revenue
                      FROM `transaction` t
                      WHERE t.status = 'paid' $revWhere";
            $stmt = $db->prepare($query);
            if ($start_date) { $stmt->bindParam(':start_date', $start_date); }
            if ($end_date)   { $stmt->bindParam(':end_date', $end_date); }
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $totalRevenue = $row ? (float)$row['total_revenue'] : 0.0;
        } catch (Exception $e2) {
            $totalRevenue = 0.0;
        }
    }

    // Total clients from clients table (no date filter as requested)
    $query = "SELECT COUNT(*) AS total_clients FROM clients";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $clientsRow = $stmt->fetch(PDO::FETCH_ASSOC);
    $totalClients = $clientsRow ? (int)$clientsRow['total_clients'] : 0;

    return [[
        'total_requests' => $totalRequests,
        'total_calibrated_items' => $calibratedItems,
        'completed_requests' => 0,
        'in_progress_requests' => max(0, $totalRequests),
        'pending_requests' => 0,
        'total_revenue' => $totalRevenue,
        'total_clients' => $totalClients
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
              LEFT JOIN sample s ON r.reference_number = s.reservation_ref_no
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

function generateRequestSamplesReport($db, $start_date, $end_date, $location) {
    // Filter requests by date_created and optional location
    $reqWhere = "";
    if ($start_date && $end_date) {
        $reqWhere = " AND DATE(r.date_created) BETWEEN :start_date AND :end_date";
    } elseif ($start_date) {
        $reqWhere = " AND DATE(r.date_created) >= :start_date";
    } elseif ($end_date) {
        $reqWhere = " AND DATE(r.date_created) <= :end_date";
    }
    $locationFilter = $location && $location !== 'all' ? " AND r.address LIKE :location" : "";
    $likeLocation = ($location && $location !== 'all') ? ("%" . $location . "%") : null;

    $query = "SELECT 
                r.id AS request_id,
                s.reservation_ref_no AS reservation_ref_no,
                r.date_created,
                s.status AS sample_status,
                r.address,
                c.company,
                s.id AS sample_id,
                s.type AS sample_type,
                cr.date_started,
                cr.date_completed
              FROM requests r
              LEFT JOIN clients c ON r.client_id = c.id
              LEFT JOIN sample s ON r.reference_number = s.reservation_ref_no
              LEFT JOIN calibration_records cr ON s.id = cr.sample_id
              WHERE 1=1 $reqWhere $locationFilter
              ORDER BY r.date_created DESC, r.id DESC";

    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    if ($location && $location !== 'all') {
        $stmt->bindParam(':location', $likeLocation);
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
                c.company as client_name
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
                c.company,
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
              GROUP BY c.id, c.company, c.contact_person, c.email
              ORDER BY total_requests DESC";
    
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    if ($location && $location !== 'all') {
        $stmt->bindParam(':location', $location);
    }
    $stmt->execute();
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function generateInventoryList($db) {
    $query = "SELECT name, category, status, sticker FROM inventory_items ORDER BY name ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function generateClientsByCity($db) {
    $query = "SELECT city, COUNT(*) AS total_clients FROM clients GROUP BY city ORDER BY total_clients DESC, city ASC";
    $stmt = $db->prepare($query);
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
    // Build date filter specifically for requests table (alias r)
    $reqWhere = "";
    if ($start_date && $end_date) {
        $reqWhere = " AND DATE(r.date_created) BETWEEN :start_date AND :end_date";
    } elseif ($start_date) {
        $reqWhere = " AND DATE(r.date_created) >= :start_date";
    } elseif ($end_date) {
        $reqWhere = " AND DATE(r.date_created) <= :end_date";
    }
    $locationFilter = $location && $location !== 'all' ? " AND r.address LIKE :location" : "";
    $likeLocation = ($location && $location !== 'all') ? ("%" . $location . "%") : null;
    
    // Log the query for debugging
    error_log("All Requests Query - Start Date: $start_date, End Date: $end_date, Location: $location");
    error_log("Where Clause: $reqWhere");
    
    $query = "SELECT 
                r.id as request_id,
                r.date_created,
                r.date_submitted,
                r.status,
                r.address,
                c.company,
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
              WHERE 1=1 $reqWhere $locationFilter
              GROUP BY r.id, r.date_created, r.date_submitted, r.status, r.address, 
                       c.company, c.contact_person, c.email, c.phone
              ORDER BY r.date_created DESC";
    
    error_log("Full Query: $query");
    
    $stmt = $db->prepare($query);
    bindDateParams($stmt, $start_date, $end_date);
    if ($location && $location !== 'all') {
        $stmt->bindParam(':location', $likeLocation);
    }
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("All Requests Results Count (DATE filter): " . count($results));
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
            if (!class_exists('ReportPDF')) {
                class ReportPDF extends FPDF {
                    function Header() {
                        $dost_logo_path = __DIR__ . '/../../assets/dost_logo.png';
                        if (file_exists($dost_logo_path)) {
                            $this->Image($dost_logo_path, 12, 12, 22);
                        }


                        $bagong_pilipinas_logo_path = __DIR__ . '/../../assets/bagong_pilipinas_logo.png';
                        if (file_exists($bagong_pilipinas_logo_path)) {
                            $this->Image($bagong_pilipinas_logo_path, 175, 12, 22);
                        }

                        $this->SetXY(40, 12);
                        $this->SetFont('Arial', 'B', 11);
                        $this->Cell(0, 6, 'Republic of the Philippines', 0, 1, 'L');
                        $this->SetX(40);
                        $this->SetFont('Arial', 'B', 12);
                        $this->SetTextColor(0, 153, 204);
                        $this->Cell(0, 6, 'DEPARTMENT OF SCIENCE AND TECHNOLOGY', 0, 1, 'L');
                        $this->SetTextColor(0,0,0);
                        $this->SetX(40);
                        $this->SetFont('Arial', 'B', 11);
                        $this->Cell(0, 6, 'Regional Office No. I', 0, 1, 'L');
                        $this->SetX(40);
                        $this->SetFont('Arial', '', 11);
                        $this->Cell(0, 6, 'Regional Standards and Testing Laboratory', 0, 1, 'L');

                        $lineY = 42;
                        $this->SetY($lineY);
                        $this->SetDrawColor(0,0,0);
                        $this->Line(12, $lineY, 198, $lineY);
                        $this->Ln(8);
                    }
                }
            }
            $pdf = new ReportPDF('P', 'mm', 'A4');
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
        // 3-column summary table (always render)
        $summary = isset($reports['dashboard_summary'][0]) ? $reports['dashboard_summary'][0] : [
            'total_calibrated_items' => 0,
            'total_requests' => 0,
            'total_revenue' => 0
        ];
        $pdf->Ln(4);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(0, 8, 'SUMMARY', 0, 1, 'L');
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->Cell(63, 8, 'Total Calibrated Items', 1, 0, 'C');
        $pdf->Cell(63, 8, 'Total Requests', 1, 0, 'C');
        $pdf->Cell(64, 8, 'Total Fees Collected', 1, 1, 'C');
        $pdf->SetFont('Arial', '', 11);
        $pdf->Cell(63, 10, number_format((int)$summary['total_calibrated_items']), 1, 0, 'C');
        $pdf->Cell(63, 10, number_format((int)$summary['total_requests']), 1, 0, 'C');
        $pdf->Cell(64, 10, number_format((float)$summary['total_revenue'], 2), 1, 1, 'C');
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
            $pdf->Cell(40, 8, substr($request['company'], 0, 20), 1, 0, 'C');
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
                c.company,
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
                       c.company, c.contact_person, c.email, c.phone
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

function generatePDFPreview($db, $start_date, $end_date, $location, $include_samples = true, $include_clients_by_city = true, $include_inventory = true) {
    error_log("generatePDFPreview() called with params: start_date=$start_date, end_date=$end_date, location=$location, include_samples=" . ($include_samples ? '1' : '0') . ", include_clients_by_city=" . ($include_clients_by_city ? '1' : '0') . ", include_inventory=" . ($include_inventory ? '1' : '0'));
    
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
        
        if ($include_samples) {
            try {
                error_log("PDF Generation - Using generateAllRequestsReport with filters");
                $reports['all_requests'] = generateAllRequestsReport($db, $start_date, $end_date, $location);
                error_log("PDF Generation - All requests (filtered) count: " . count($reports['all_requests']));
            } catch (Exception $e) {
                error_log("All requests error: " . $e->getMessage());
                $reports['all_requests'] = [];
            }
        } else {
            $reports['all_requests'] = [];
        }
        
        try {
            $reports['calibration_summary'] = generateCalibrationSummary($db, $start_date, $end_date, $location);
        } catch (Exception $e) {
            error_log("Calibration summary error: " . $e->getMessage());
            $reports['calibration_summary'] = [];
        }
        
        if ($include_clients_by_city) {
            try {
                $reports['client_activity'] = generateClientActivityReport($db, $start_date, $end_date, $location);
            } catch (Exception $e) {
                error_log("Client activity error: " . $e->getMessage());
                $reports['client_activity'] = [];
            }
        } else {
            $reports['client_activity'] = [];
        }
        
        // Create PDF
        try {
            // Extend FPDF with certificate-style header for reports
            if (!class_exists('ReportPDF')) {
                class ReportPDF extends FPDF {
                    function Header() {
                        $dost_logo_path = __DIR__ . '/../../assets/dost_logo.png';
                        if (file_exists($dost_logo_path)) {
                            $this->Image($dost_logo_path, 12, 12, 22);
                        }


                        $bagong_pilipinas_logo_path = __DIR__ . '/../../assets/bagong_pilipinas_logo.png';
                        if (file_exists($bagong_pilipinas_logo_path)) {
                            $this->Image($bagong_pilipinas_logo_path, 175, 12, 22);
                        }

                        $this->SetXY(40, 12);
                        $this->SetFont('Arial', 'B', 11);
                        $this->Cell(0, 6, 'Republic of the Philippines', 0, 1, 'L');
                        $this->SetX(40);
                        $this->SetFont('Arial', 'B', 12);
                        $this->SetTextColor(0, 153, 204);
                        $this->Cell(0, 6, 'DEPARTMENT OF SCIENCE AND TECHNOLOGY', 0, 1, 'L');
                        $this->SetTextColor(0,0,0);
                        $this->SetX(40);
                        $this->SetFont('Arial', 'B', 11);
                        $this->Cell(0, 6, 'Regional Office No. I', 0, 1, 'L');
                        $this->SetX(40);
                        $this->SetFont('Arial', '', 11);
                        $this->Cell(0, 6, 'Regional Standards and Testing Laboratory', 0, 1, 'L');

                        $lineY = 42;
                        $this->SetY($lineY);
                        $this->SetDrawColor(0,0,0);
                        $this->Line(12, $lineY, 198, $lineY);
                        $this->Ln(8);
                    }
                }
            }
            $pdf = new ReportPDF('P', 'mm', 'A4');
        } catch (Exception $e) {
            error_log("FPDF creation error: " . $e->getMessage());
            throw new Exception("Failed to create PDF object: " . $e->getMessage());
        }
        $pdf->AddPage();
        
        // Modern layout tweaks
        $pdf->SetMargins(12, 15, 12);
        $pdf->SetAutoPageBreak(true, 15);
        $pdf->SetDrawColor(220,220,220);
        $pdf->SetTextColor(40,40,40);
        
        // Header
        $pdf->SetFont('Arial', 'B', 16);
        $pdf->Cell(0, 10, 'COMPREHENSIVE REPORTS', 0, 1, 'C');
        $pdf->SetDrawColor(210,210,210);
        $ySep = $pdf->GetY();
        $pdf->Line(12, $ySep, 198, $ySep);
        $pdf->Ln(6);
        
        // Report details
        $pdf->SetFont('Arial', '', 11);
        $pdf->Cell(0, 7, 'Date Range: ' . $start_date . ' to ' . $end_date, 0, 1, 'L');
        $pdf->Cell(0, 7, 'Location: ' . ($location === 'all' ? 'All Locations' : $location), 0, 1, 'L');
        $pdf->Cell(0, 7, 'Generated on: ' . date('Y-m-d H:i:s'), 0, 1, 'L');
        // 3-column summary table (Calibrated, Requests, Clients)
        $summary = isset($reports['dashboard_summary'][0]) ? $reports['dashboard_summary'][0] : [
            'total_calibrated_items' => 0,
            'total_requests' => 0,
            'total_clients' => 0
        ];
        if (isset($reports['dashboard_summary'][0])) {
            error_log('PDF Preview - Summary: ' . json_encode($reports['dashboard_summary'][0]));
        }
        $pdf->Ln(4);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->SetFillColor(245,245,245);
        $pdf->Cell(0, 8, 'SUMMARY', 0, 1, 'L');
		$pdf->SetFont('Arial', 'B', 10);
		// Header color #0dafe5 (13,175,229)
		$pdf->SetFillColor(13,175,229);
		$pdf->SetTextColor(255,255,255);
		$pdf->Cell(62, 8, 'Total Calibrated Items', 1, 0, 'C', true);
		$pdf->Cell(62, 8, 'Total Requests', 1, 0, 'C', true);
		$pdf->Cell(62, 8, 'Total Clients', 1, 1, 'C', true);
		$pdf->SetTextColor(40,40,40);
        $pdf->SetFont('Arial', '', 11);
        $pdf->Cell(62, 10, number_format((int)$summary['total_calibrated_items']), 1, 0, 'C');
        $pdf->Cell(62, 10, number_format((int)$summary['total_requests']), 1, 0, 'C');
        $pdf->Cell(62, 10, number_format((int)$summary['total_clients']), 1, 1, 'C');
        $pdf->Ln(8);
        $pdf->Ln(8);
        
        
        
        // All Requests Details (with samples and start/finish)
        if ($include_samples) {
            error_log("PDF Rendering - Checking all_requests array: " . json_encode($reports['all_requests']));
            error_log("PDF Rendering - Array count: " . count($reports['all_requests']));
            error_log("PDF Rendering - Array empty check: " . (empty($reports['all_requests']) ? 'TRUE' : 'FALSE'));
            
            // Replace all_requests with richer request+sample rows
            $requestsWithSamples = generateRequestSamplesReport($db, $start_date, $end_date, $location);
            if (!empty($requestsWithSamples)) {
            error_log("PDF Rendering - Found " . count($reports['all_requests']) . " requests, rendering table");
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, 'ALL SAMPLES (' . count($requestsWithSamples) . ' rows)', 0, 1, 'L');
            $pdf->Ln(5);
            
			$pdf->SetFont('Arial', 'B', 9);
			$pdf->SetFillColor(13,175,229);
			$pdf->SetTextColor(255,255,255);
			$pdf->Cell(26, 8, 'Ref No', 1, 0, 'C', true);
			$pdf->Cell(22, 8, 'Date Created', 1, 0, 'C', true);
			$pdf->Cell(22, 8, 'Status', 1, 0, 'C', true);
			$pdf->Cell(40, 8, 'Company', 1, 0, 'C', true);
			$pdf->Cell(30, 8, 'Sample Type', 1, 0, 'C', true);
			$pdf->Cell(23, 8, 'Started', 1, 0, 'C', true);
			$pdf->Cell(23, 8, 'Finished', 1, 1, 'C', true);
			$pdf->SetTextColor(40,40,40);
            
            $pdf->SetFont('Arial', '', 8);
            foreach ($requestsWithSamples as $index => $row) {
                
                // Check if we need a new page
                if ($pdf->GetY() > 250) {
                    $pdf->AddPage();
                    // Repeat header
					$pdf->SetFont('Arial', 'B', 9);
					$pdf->SetFillColor(13,175,229);
					$pdf->SetTextColor(255,255,255);
					$pdf->Cell(26, 8, 'Ref No', 1, 0, 'C', true);
					$pdf->Cell(22, 8, 'Date Created', 1, 0, 'C', true);
					$pdf->Cell(22, 8, 'Status', 1, 0, 'C', true);
					$pdf->Cell(40, 8, 'Company', 1, 0, 'C', true);
					$pdf->Cell(30, 8, 'Sample Type', 1, 0, 'C', true);
					$pdf->Cell(23, 8, 'Started', 1, 0, 'C', true);
					$pdf->Cell(23, 8, 'Finished', 1, 1, 'C', true);
					$pdf->SetTextColor(40,40,40);
                    $pdf->SetFont('Arial', '', 8);
                }
                
                $ref = $row['reservation_ref_no'] ?? ($row['request_id'] ?? '');
                $date_created = $row['date_created'] ?? '';
                $status = $row['sample_status'] ?? '';
                $company = $row['company'] ?? '';
                $sample_type = $row['sample_type'] ?? '';
                $started = $row['date_started'] ? date('Y-m-d', strtotime($row['date_started'])) : '';
                $finished = $row['date_completed'] ? date('Y-m-d', strtotime($row['date_completed'])) : '';

                $pdf->Cell(26, 8, substr($ref, 0, 14), 1, 0, 'C');
                $pdf->Cell(22, 8, $date_created ? date('Y-m-d', strtotime($date_created)) : '', 1, 0, 'C');
                $pdf->Cell(22, 8, $status, 1, 0, 'C');
                $pdf->Cell(40, 8, substr($company, 0, 24), 1, 0, 'L');
                $pdf->Cell(30, 8, substr($sample_type, 0, 14), 1, 0, 'C');
                $pdf->Cell(23, 8, $started, 1, 0, 'C');
                $pdf->Cell(23, 8, $finished, 1, 1, 'C');
            }
                $pdf->Ln(10);
            } else {
                $pdf->SetFont('Arial', 'I', 10);
                $pdf->Cell(0, 8, 'No requests found in database for selected filters.', 0, 1, 'C');
                error_log("PDF Generation: No requests found in all_requests array");
            }
        }
        
        // Clients by City table (no date filter)
        if ($include_clients_by_city) {
            $clientsByCity = generateClientsByCity($db);
            $pdf->Ln(6);
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, 'CLIENTS BY CITY', 0, 1, 'L');
            
            if (!empty($clientsByCity)) {
			$pdf->SetFont('Arial', 'B', 9);
			$pdf->SetFillColor(13,175,229);
			$pdf->SetTextColor(255,255,255);
			$pdf->Cell(120, 8, 'City', 1, 0, 'L', true);
			$pdf->Cell(40, 8, 'Total Clients', 1, 1, 'C', true);
			$pdf->SetTextColor(40,40,40);
            $pdf->SetFont('Arial', '', 8);
            foreach ($clientsByCity as $row) {
                if ($pdf->GetY() > 250) {
                    $pdf->AddPage();
					$pdf->SetFont('Arial', 'B', 9);
					$pdf->SetFillColor(13,175,229);
					$pdf->SetTextColor(255,255,255);
					$pdf->Cell(120, 8, 'City', 1, 0, 'L', true);
					$pdf->Cell(40, 8, 'Total Clients', 1, 1, 'C', true);
					$pdf->SetTextColor(40,40,40);
                    $pdf->SetFont('Arial', '', 8);
                }
                $pdf->Cell(120, 8, substr($row['city'] ?? '', 0, 60), 1, 0, 'L');
                $pdf->Cell(40, 8, (string)($row['total_clients'] ?? 0), 1, 1, 'C');
            }
            } else {
                $pdf->SetFont('Arial', 'I', 10);
                $pdf->Cell(0, 8, 'No client locations found.', 0, 1, 'C');
            }
        }

        // Inventory table (no date filter)
        if ($include_inventory) {
            $inventory = generateInventoryList($db);
            $pdf->Ln(6);
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, 'INVENTORY', 0, 1, 'L');
            
            if (!empty($inventory)) {
			$pdf->SetFont('Arial', 'B', 9);
			$pdf->SetFillColor(13,175,229);
			$pdf->SetTextColor(255,255,255);
			$pdf->Cell(76, 8, 'Name', 1, 0, 'L', true);
			$pdf->Cell(34, 8, 'Category', 1, 0, 'C', true);
			$pdf->Cell(34, 8, 'Status', 1, 0, 'C', true);
			$pdf->Cell(42, 8, 'Sticker', 1, 1, 'C', true);
			$pdf->SetTextColor(40,40,40);
            
            $pdf->SetFont('Arial', '', 8);
            foreach ($inventory as $item) {
                if ($pdf->GetY() > 250) {
                    $pdf->AddPage();
					$pdf->SetFont('Arial', 'B', 9);
					$pdf->SetFillColor(13,175,229);
					$pdf->SetTextColor(255,255,255);
					$pdf->Cell(76, 8, 'Name', 1, 0, 'L', true);
					$pdf->Cell(34, 8, 'Category', 1, 0, 'C', true);
					$pdf->Cell(34, 8, 'Status', 1, 0, 'C', true);
					$pdf->Cell(42, 8, 'Sticker', 1, 1, 'C', true);
					$pdf->SetTextColor(40,40,40);
                    $pdf->SetFont('Arial', '', 8);
                }
                $pdf->Cell(76, 8, substr($item['name'] ?? '', 0, 44), 1, 0, 'L');
                $pdf->Cell(34, 8, substr($item['category'] ?? '', 0, 18), 1, 0, 'C');
                $pdf->Cell(34, 8, substr($item['status'] ?? '', 0, 18), 1, 0, 'C');
                $pdf->Cell(42, 8, substr($item['sticker'] ?? '', 0, 24), 1, 1, 'C');
            }
            } else {
                $pdf->SetFont('Arial', 'I', 10);
                $pdf->Cell(0, 8, 'No inventory items found.', 0, 1, 'C');
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