<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers, Access-Control-Allow-Methods');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503); // Service Unavailable
    echo json_encode(['message' => 'Database connection failed.']);
    exit();
}

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $stmt = $db->prepare('SELECT * FROM sample WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $sample = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$sample) {
        http_response_code(404);
        echo json_encode(['message' => 'Sample not found.']);
        exit();
    }
    echo json_encode($sample);
    exit();
}

if (isset($_GET['serial_no'])) {
    $serial_no = $_GET['serial_no'];
    $stmt = $db->prepare('SELECT * FROM sample WHERE serial_no = :serial_no');
    $stmt->bindParam(':serial_no', $serial_no);
    $stmt->execute();
    $sample = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$sample) {
        http_response_code(404);
        echo json_encode(['message' => 'Sample not found.']);
        exit();
    }
    echo json_encode($sample);
    exit();
}

http_response_code(400);
echo json_encode(['message' => 'Missing id or serial_no parameter.']);
?>
