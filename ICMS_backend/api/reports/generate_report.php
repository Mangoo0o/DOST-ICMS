<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';
include_once '../auth/verify_token.php';

$database = new Database();
$db = $database->getConnection();

// Get report type from query parameter
$report_type = isset($_GET['type']) ? $_GET['type'] : '';

switch($report_type) {
    case 'inventory':
        // Generate inventory report
        $query = "SELECT 
                    i.category,
                    COUNT(*) as total_items,
                    SUM(i.quantity) as total_quantity,
                    SUM(i.quantity * i.unit_price) as total_value
                  FROM inventory_items i
                  GROUP BY i.category";
        break;
        
    case 'reservations':
        // Generate reservations report
        $query = "SELECT 
                    DATE(r.reservation_date) as date,
                    COUNT(*) as total_reservations,
                    SUM(r.quantity) as total_items_reserved
                  FROM requests r
                  WHERE r.status = 'approved'
                  GROUP BY DATE(r.reservation_date)
                  ORDER BY date DESC";
        break;
        
    case 'users':
        // Generate users report
        $query = "SELECT 
                    u.role,
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN r.id IS NOT NULL THEN 1 END) as users_with_reservations
                  FROM users u
                  LEFT JOIN reservations r ON u.id = r.user_id
                  GROUP BY u.role";
        break;
        
    default:
        http_response_code(400);
        echo json_encode(array("message" => "Invalid report type."));
        exit();
}

$stmt = $db->prepare($query);
$stmt->execute();

if($stmt->rowCount() > 0) {
    $report_data = array();
    $report_data["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($report_data["records"], $row);
    }

    http_response_code(200);
    echo json_encode($report_data);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No data found for the specified report."));
}
?> 