<?php
require_once __DIR__ . '/../config/cors.php';
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
include_once '../auth/verify_token.php';

// Verify token and get user data
$user_data = verifyToken();

// Check if user has admin or staff role
if (!in_array($user_data->role, ['admin', 'staff', 'calibration_engineers'])) {
    http_response_code(403);
    echo json_encode(array("message" => "Access denied. Admin, staff, or calibration engineer privileges required."));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update item. Item ID is required."));
    exit();
}

$query = "UPDATE inventory_items SET ";
$params = [];
$updates = [];

// Generic fields
if (isset($data->name)) {
    $updates[] = "name = ?";
    $params[] = $data->name;
}
if (isset($data->description)) {
    $updates[] = "description = ?";
    $params[] = $data->description;
}
if (isset($data->category)) {
    $updates[] = "category = ?";
    $params[] = $data->category;
}
if (isset($data->status)) {
    $updates[] = "status = ?";
    $params[] = $data->status;
}

// Weighing-scale / Calibration Weight fields
if (isset($data->sticker)) {
    $updates[] = "sticker = ?";
    $params[] = $data->sticker;
}
if (isset($data->serialNo)) {
    $updates[] = "serial_no = ?";
    $params[] = $data->serialNo;
}
if (isset($data->nomval)) {
    $updates[] = "nomval = ?";
    $params[] = $data->nomval;
}
if (isset($data->conventionalMass)) {
    $updates[] = "conventional_mass = ?";
    $params[] = $data->conventionalMass;
}
if (isset($data->class)) {
    $updates[] = "class = ?";
    $params[] = $data->class;
}
if (isset($data->uncertaintyOfMeasurement)) {
    $updates[] = "uncertainty_of_measurement = ?";
    $params[] = $data->uncertaintyOfMeasurement;
}
if (isset($data->maximumPermissibleError)) {
    $updates[] = "maximum_permissible_error = ?";
    $params[] = $data->maximumPermissibleError;
}
if (isset($data->correctionValue)) {
    $updates[] = "correction_value = ?";
    $params[] = $data->correctionValue;
}
if (isset($data->lastCalibrationDate)) {
    $updates[] = "last_calibration_date = ?";
    $params[] = $data->lastCalibrationDate;
}

// Thermometer fields
if (isset($data->minTemperature)) {
    $updates[] = "min_temperature = ?";
    $params[] = $data->minTemperature;
}
if (isset($data->maxTemperature)) {
    $updates[] = "max_temperature = ?";
    $params[] = $data->maxTemperature;
}
if (isset($data->sampleNo)) {
    $updates[] = "sample_no = ?";
    $params[] = $data->sampleNo;
}
if (isset($data->modelNo)) {
    $updates[] = "model_no = ?";
    $params[] = $data->modelNo;
}
if (isset($data->readability)) {
    $updates[] = "readability = ?";
    $params[] = $data->readability;
}
if (isset($data->humidity)) {
    $updates[] = "humidity = ?";
    $params[] = $data->humidity;
}

// Standard inventory fields
if (isset($data->quantity)) {
    $updates[] = "quantity = ?";
    $params[] = $data->quantity;
}
if (isset($data->unit_price)) {
    $updates[] = "unit_price = ?";
    $params[] = $data->unit_price;
}

// Sphygmomanometer fields
if (isset($data->measurement_range)) {
    $updates[] = "measurement_range = ?";
    $params[] = $data->measurement_range;
}
if (isset($data->accuracy)) {
    $updates[] = "accuracy = ?";
    $params[] = $data->accuracy;
}

// Weighing-scale new fields
if (isset($data->minCapacity)) {
    $updates[] = "min_capacity = ?";
    $params[] = $data->minCapacity;
}
if (isset($data->maxCapacity)) {
    $updates[] = "max_capacity = ?";
    $params[] = $data->maxCapacity;
}
if (isset($data->lastCalibrationDate)) {
    $updates[] = "last_calibration_date = ?";
    $params[] = $data->lastCalibrationDate;
}

if (empty($updates)) {
    http_response_code(400);
    echo json_encode(array("message" => "No fields to update."));
    exit();
}

$query .= implode(", ", $updates);
$query .= ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
$params[] = $data->id;

$stmt = $db->prepare($query);

if ($stmt->execute($params)) {
    http_response_code(200);
    echo json_encode(array("message" => "Item was successfully updated."));
} else {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to update item."));
}
?>