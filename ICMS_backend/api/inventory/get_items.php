<?php
require_once __DIR__ . '/../config/cors.php';

include_once '../config/db.php';
include_once '../auth/verify_token.php';

$database = new Database();
$db = $database->getConnection();

// Updated query to include the new fields for calibration weights and thermometer
$query = "SELECT id, name, quantity, unit_price, category, status, created_at, 
          sticker, serial_no, nomval, conventional_mass as conventionalMass, class, min_temperature, max_temperature, humidity, measurement_range, accuracy, min_capacity, max_capacity, last_calibration_date as lastCalibrationDate,
          uncertainty_of_measurement as uncertaintyOfMeasurement, maximum_permissible_error as maximumPermissibleError, correction_value as correctionValue,
          sample_no, model_no, readability
          FROM inventory_items 
          ORDER BY created_at DESC";
$stmt = $db->prepare($query);
$stmt->execute();

if($stmt->rowCount() > 0) {
    $items_arr = array();
    $items_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        
        // Check if this is a thermometer item
        if ($category === 'Thermometer') {
            $item = array(
                "id" => $id,
                "name" => $name,
                "sampleNo" => $sample_no,
                "modelNo" => $model_no,
                "readability" => $readability,
                "minTemperature" => $min_temperature,
                "maxTemperature" => $max_temperature,
                "lastCalibrationDate" => $lastCalibrationDate,
                "category" => $category,
                "status" => $status,
                "created_at" => $created_at
            );
        }
        // Check if this is a thermohygrometer item
        else if ($category === 'Thermohygrometer') {
            $item = array(
                "id" => $id,
                "name" => $name,
                "minTemperature" => $min_temperature,
                "maxTemperature" => $max_temperature,
                "humidity" => $humidity,
                "class" => $class,
                "sampleNo" => $sample_no,
                "modelNo" => $model_no,
                "lastCalibrationDate" => $lastCalibrationDate,
                "category" => $category,
                "status" => $status,
                "created_at" => $created_at
            );
        }
        // Check if this is a calibration weight item
        else if (!empty($sticker) || !empty($nomval) || !empty($conventionalMass) || !empty($class)) {
            $item = array(
                "id" => $id,
                "name" => $name,
                "sticker" => $sticker,
                "serialNo" => $serial_no,
                "nomval" => $nomval, // Changed from 'nominal' to 'nomval' to match frontend
                "conventionalMass" => $conventionalMass,
                "class" => $class,
                "uncertaintyOfMeasurement" => $uncertaintyOfMeasurement,
                "maximumPermissibleError" => $maximumPermissibleError,
                "correctionValue" => $correctionValue,
                "lastCalibrationDate" => $lastCalibrationDate,
                "category" => $category,
                "status" => $status,
                "created_at" => $created_at
            );
        }
        // Check if this is a sphygmomanometer item
        else if ($category === 'Sphygmomanometer') {
            $item = array(
                "id" => $id,
                "name" => $name,
                "sampleNo" => $sample_no,
                "modelNo" => $model_no,
                "measurement_range" => $measurement_range,
                "accuracy" => $accuracy,
                "lastCalibrationDate" => $lastCalibrationDate,
                "category" => $category,
                "status" => $status,
                "created_at" => $created_at
            );
        }
        // Check if this is a weighing-scale item
        else if ($category === 'Weighing-Scale') {
            $item = array(
                "id" => $id,
                "name" => $name,
                "minCapacity" => $min_capacity,
                "maxCapacity" => $max_capacity,
                "lastCalibrationDate" => $lastCalibrationDate,
                "category" => $category,
                "status" => $status,
                "created_at" => $created_at
            );
        } else {
            // Standard inventory item
            $item = array(
                "id" => $id,
                "name" => $name,
                "quantity" => $quantity,
                "unit_price" => $unit_price,
                "category" => $category,
                "status" => $status,
                "created_at" => $created_at
            );
        }
        
        array_push($items_arr["records"], $item);
    }

    http_response_code(200);
    echo json_encode($items_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No inventory items found."));
}
?>
