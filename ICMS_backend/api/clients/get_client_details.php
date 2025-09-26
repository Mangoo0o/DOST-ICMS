<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../config/db.php';

$database = new Database();
$db = $database->getConnection();

$client_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($client_id > 0) {
    $query = "SELECT id, first_name, last_name, contact_number, email, industry_type, barangay, city, province, company, company_head, is_pwd, is_4ps FROM clients WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$client_id]);

    if ($stmt->rowCount() > 0) {
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode($client);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Client not found."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Client ID is required."]);
} 