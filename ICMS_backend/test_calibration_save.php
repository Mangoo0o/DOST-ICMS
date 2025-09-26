<?php
/**
 * Test Calibration Save Functionality
 * This script tests the calibration save API endpoint with sample data
 */

require_once __DIR__ . '/config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die('Database connection failed.');
}

echo "<h2>🧪 Calibration Save Test</h2>";

// Test data for different calibration types
$testData = [
    'test_weights' => [
        'sample_id' => 1,
        'calibration_type' => 'Test Weights',
        'input_data' => [
            'equipment' => [
                'serialNumber' => 'TW001',
                'makeModel' => 'Test Weight Model',
                'capacity' => '1000g',
                'readability' => '0.1g',
                'tempStart' => '23.0',
                'tempEnd' => '23.2',
                'humidityStart' => '45',
                'humidityEnd' => '46'
            ],
            'testData' => [
                ['nominal' => '1000', 'actual' => '999.8', 'error' => '-0.2'],
                ['nominal' => '500', 'actual' => '499.9', 'error' => '-0.1']
            ]
        ],
        'result_data' => [
            'u_combined' => 0.15,
            'k' => 2,
            'U_expanded' => 0.30,
            'results' => [
                ['nominal' => '1000', 'uncertainty' => '0.30'],
                ['nominal' => '500', 'uncertainty' => '0.30']
            ]
        ],
        'calibrated_by' => 1,
        'date_started' => date('Y-m-d H:i:s'),
        'date_completed' => date('Y-m-d H:i:s')
    ],
    'thermometer' => [
        'sample_id' => 2,
        'calibration_type' => 'Thermometer',
        'input_data' => [
            'equipment' => [
                'serialNumber' => 'TH001',
                'makeModel' => 'Thermometer Model',
                'range' => '-50°C to 150°C',
                'resolution' => '0.1°C'
            ],
            'testData' => [
                ['reference' => '0.0', 'indication' => '0.1', 'error' => '0.1'],
                ['reference' => '25.0', 'indication' => '25.2', 'error' => '0.2']
            ]
        ],
        'result_data' => [
            'u_combined' => 0.08,
            'k' => 2,
            'U_expanded' => 0.16,
            'results' => [
                ['reference' => '0.0', 'uncertainty' => '0.16'],
                ['reference' => '25.0', 'uncertainty' => '0.16']
            ]
        ],
        'calibrated_by' => 1,
        'date_started' => date('Y-m-d H:i:s'),
        'date_completed' => date('Y-m-d H:i:s')
    ]
];

function testCalibrationSave($data, $type) {
    echo "<h3>Testing {$type} calibration save...</h3>";
    
    $url = 'http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/calibration/save_record.php';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer test-token' // You might need a real token
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "<p><strong>HTTP Code:</strong> {$httpCode}</p>";
    echo "<p><strong>Response:</strong> " . htmlspecialchars($response) . "</p>";
    
    if ($httpCode === 200) {
        $result = json_decode($response, true);
        if (isset($result['message']) && strpos($result['message'], 'successfully') !== false) {
            echo "<p style='color: green;'>✅ {$type} calibration save test PASSED</p>";
            return true;
        } else {
            echo "<p style='color: red;'>❌ {$type} calibration save test FAILED - " . $result['message'] . "</p>";
            return false;
        }
    } else {
        echo "<p style='color: red;'>❌ {$type} calibration save test FAILED - HTTP Error {$httpCode}</p>";
        return false;
    }
}

// Test each calibration type
$results = [];
foreach ($testData as $type => $data) {
    $results[$type] = testCalibrationSave($data, ucfirst(str_replace('_', ' ', $type)));
    echo "<hr>";
}

// Summary
echo "<h3>📊 Test Summary</h3>";
$passed = array_sum($results);
$total = count($results);

echo "<p><strong>Tests Passed:</strong> {$passed}/{$total}</p>";

if ($passed === $total) {
    echo "<p style='color: green; font-size: 18px;'>🎉 All calibration save tests PASSED!</p>";
} else {
    echo "<p style='color: red; font-size: 18px;'>⚠️ Some calibration save tests FAILED!</p>";
}

// Show current database state
echo "<h3>📋 Current Database State</h3>";
try {
    $stmt = $db->prepare('SELECT COUNT(*) as count FROM calibration_records');
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p><strong>Total calibration records:</strong> {$result['count']}</p>";
    
    $stmt = $db->prepare('SELECT calibration_type, COUNT(*) as count FROM calibration_records GROUP BY calibration_type');
    $stmt->execute();
    $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($types) {
        echo "<p><strong>Records by type:</strong></p><ul>";
        foreach ($types as $type) {
            echo "<li>{$type['calibration_type']}: {$type['count']} records</li>";
        }
        echo "</ul>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error getting database state: " . $e->getMessage() . "</p>";
}

?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
hr { margin: 20px 0; }
</style>