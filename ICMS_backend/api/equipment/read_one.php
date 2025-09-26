<?php
require_once '../config/cors.php';
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

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
echo json_encode(['message' => 'Please provide either id or serial_no parameter.']);
?> 