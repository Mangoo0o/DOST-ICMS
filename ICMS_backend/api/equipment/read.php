<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers, Access-Control-Allow-Methods');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
$database = new Database();
$db = $database->getConnection();

$query = 'SELECT id, serial_no FROM sample';
$stmt = $db->prepare($query);
$stmt->execute();
$sample = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($sample); 