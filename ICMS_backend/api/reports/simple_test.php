<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$report_type = $_GET['type'] ?? '';

echo json_encode([
    'message' => 'Simple test',
    'report_type' => $report_type,
    'all_params' => $_GET
]);
?>


