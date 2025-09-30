<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$report_type = isset($_GET['type']) ? $_GET['type'] : '';

echo json_encode([
    'message' => 'Test successful',
    'report_type' => $report_type,
    'timestamp' => date('Y-m-d H:i:s')
]);
?>


