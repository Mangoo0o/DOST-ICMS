<?php
require_once __DIR__ . '/../config/cors.php';

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

// Check if we're adding a thermohygrometer item
if (
    isset($data->name) &&
    isset($data->minTemperature) &&
    isset($data->maxTemperature) &&
    isset($data->humidity) &&
    !empty($data->category) && $data->category === 'Thermohygrometer'
) {
    $query = "INSERT INTO inventory_items (name, description, min_temperature, max_temperature, humidity, class, sample_no, model_no, last_calibration_date, category, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);

    $description = isset($data->description) ? $data->description : '';
    $class = isset($data->class) ? $data->class : 'None';
    $sampleNo = isset($data->sampleNo) ? $data->sampleNo : null;
    $modelNo = isset($data->modelNo) ? $data->modelNo : null;
    $lastCalibrationDate = isset($data->lastCalibrationDate) ? $data->lastCalibrationDate : null;
    $status = isset($data->status) ? $data->status : 'available';

    if($stmt->execute([
        $data->name,
        $description,
        $data->minTemperature,
        $data->maxTemperature,
        $data->humidity,
        $class,
        $sampleNo,
        $modelNo,
        $lastCalibrationDate,
        $data->category,
        $status
    ])) {
        $item_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode(array("message" => "Item was successfully added.", "id" => $item_id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to add thermohygrometer item."));
    }
    exit();
}

// Check if we're adding a thermometer item
if (
    isset($data->name) &&
    isset($data->minTemperature) &&
    isset($data->maxTemperature) &&
    !empty($data->category) && $data->category === 'Thermometer'
) {
    $query = "INSERT INTO inventory_items (name, description, sample_no, model_no, readability, min_temperature, max_temperature, last_calibration_date, category, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);

    $description = isset($data->description) ? $data->description : '';
    $sampleNo = isset($data->sampleNo) ? $data->sampleNo : null;
    $modelNo = isset($data->modelNo) ? $data->modelNo : null;
    $readability = isset($data->readability) ? $data->readability : null;
    $lastCalibrationDate = isset($data->lastCalibrationDate) ? $data->lastCalibrationDate : null;
    $status = isset($data->status) ? $data->status : 'available';

    if($stmt->execute([
        $data->name,
        $description,
        $sampleNo,
        $modelNo,
        $readability,
        $data->minTemperature,
        $data->maxTemperature,
        $lastCalibrationDate,
        $data->category,
        $status
    ])) {
        $item_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode(array(
            "message" => "Item was successfully added.",
            "id" => $item_id
        ));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to add item."));
    }
    exit();
}

// Check if we're adding a weighing-scale item
if (
    isset($data->name) &&
    isset($data->description) &&
    isset($data->minCapacity) &&
    isset($data->maxCapacity) &&
    isset($data->lastCalibrationDate) &&
    !empty($data->category) && $data->category === 'Weighing-Scale'
) {
    $query = "INSERT INTO inventory_items (name, description, sample_no, model_no, min_capacity, max_capacity, last_calibration_date, category, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);

    $sampleNo = isset($data->sampleNo) ? $data->sampleNo : null;
    $modelNo = isset($data->modelNo) ? $data->modelNo : null;
    $status = isset($data->status) ? $data->status : 'available';

    if($stmt->execute([
        $data->name,
        $data->description,
        $sampleNo,
        $modelNo,
        $data->minCapacity,
        $data->maxCapacity,
        $data->lastCalibrationDate,
        $data->category,
        $status
    ])) {
        $item_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode(array("message" => "Item was successfully added.", "id" => $item_id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to add weighing-scale item."));
    }
    exit();
}

// Check if we're adding a calibration weight item
if (isset($data->sticker) && isset($data->nomval) && isset($data->conventionalMass) && isset($data->class)) {
    // This is a calibration weight item
    $query = "INSERT INTO inventory_items (name, sticker, serial_no, nomval, conventional_mass, class, uncertainty_of_measurement, maximum_permissible_error, correction_value, last_calibration_date, category, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"; 
    $stmt = $db->prepare($query);
    
    $name = !empty($data->name) ? $data->name : $data->sticker; // Use sticker as name if not provided
    $serialNo = isset($data->serialNo) ? $data->serialNo : null;
    $category = !empty($data->category) ? $data->category : 'Calibration Weight';
    $status = isset($data->status) ? $data->status : 'available';
    
    // Set default values for new fields if not provided
    $uncertainty = isset($data->uncertaintyOfMeasurement) ? $data->uncertaintyOfMeasurement : 0.00000001;
    $maxError = isset($data->maximumPermissibleError) ? $data->maximumPermissibleError : 0.00000001;
    $correction = isset($data->correctionValue) ? $data->correctionValue : 0.00000000;
    $lastCalibration = isset($data->lastCalibrationDate) ? $data->lastCalibrationDate : date('Y-m-d');
    
    if($stmt->execute([
        $name,
        $data->sticker,
        $serialNo,
        $data->nomval,
        $data->conventionalMass,
        $data->class,
        $uncertainty,
        $maxError,
        $correction,
        $lastCalibration,
        $category,
        $status
    ])) {
        // Get the ID of the newly inserted item
        $item_id = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode(array(
            "message" => "Item was successfully added.",
            "id" => $item_id
        ));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to add item."));
    }
} 
// Standard inventory item
else if (
    !empty($data->name) &&
    isset($data->quantity) &&
    isset($data->unit_price) &&
    !empty($data->category)
) {
    $query = "INSERT INTO inventory_items (name, description, quantity, unit_price, category, status) 
              VALUES (?, ?, ?, ?, ?, ?)"; 
    $stmt = $db->prepare($query);
    
    $description = isset($data->description) ? $data->description : '';
    $status = isset($data->status) ? $data->status : 'available';
    
    if($stmt->execute([
        $data->name,
        $description,
        $data->quantity,
        $data->unit_price,
        $data->category,
        $status
    ])) {
        // Get the ID of the newly inserted item
        $item_id = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode(array(
            "message" => "Item was successfully added.",
            "id" => $item_id
        ));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to add item."));
    }
}

// Check if we're adding a sphygmomanometer item
if (
    isset($data->name) &&
    isset($data->measurement_range) &&
    isset($data->accuracy) &&
    !empty($data->category) && $data->category === 'Sphygmomanometer'
) {
    $query = "INSERT INTO inventory_items (name, description, sample_no, model_no, measurement_range, accuracy, last_calibration_date, category, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);

    $description = isset($data->description) ? $data->description : '';
    $sampleNo = isset($data->sampleNo) ? $data->sampleNo : null;
    $modelNo = isset($data->modelNo) ? $data->modelNo : null;
    $lastCalibrationDate = isset($data->lastCalibrationDate) ? $data->lastCalibrationDate : null;
    $status = isset($data->status) ? $data->status : 'available';

    if($stmt->execute([
        $data->name,
        $description,
        $sampleNo,
        $modelNo,
        $data->measurement_range,
        $data->accuracy,
        $lastCalibrationDate,
        $data->category,
        $status
    ])) {
        $item_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode(array("message" => "Item was successfully added.", "id" => $item_id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to add sphygmomanometer item."));
    }
    exit();
}

else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to add item. Data is incomplete."));
}
?>