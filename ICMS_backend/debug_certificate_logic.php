<?php
require_once __DIR__ . '/api/config/db.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>Debug: Sample 74 Data Analysis</h2>";

$stmt = $db->prepare('SELECT result_data FROM calibration_records WHERE sample_id = 74 ORDER BY created_at DESC LIMIT 1');
$stmt->execute();
$record = $stmt->fetch(PDO::FETCH_ASSOC);
$result_data = json_decode($record['result_data'], true);

echo "<h3>Current Data:</h3>";
echo "<p><strong>UUT Inc Mean:</strong> " . json_encode($result_data['uutIncMean']) . "</p>";
echo "<p><strong>UUT Dec Mean:</strong> " . json_encode($result_data['uutDecMean']) . "</p>";
echo "<p><strong>Max Deviation:</strong> " . json_encode($result_data['maxDeviation']) . "</p>";
echo "<p><strong>IPRT Mean:</strong> " . json_encode($result_data['iprtMean']) . "</p>";

echo "<h3>Certificate Generation Logic Test:</h3>";
$test_pressures = [0, 50, 100, 150, 200, 250, 300];
foreach ($test_pressures as $index => $pressure) {
    echo "<h4>Pressure {$pressure} mmHg (index {$index}):</h4>";
    
    $increasingReading = '';
    $decreasingReading = '';
    $maxDeviation = '';
    
    // Check if condition is met
    $condition_met = isset($result_data['uutIncMean'][$index]) || isset($result_data['uutDecMean'][$index]);
    echo "<p>Condition met: " . ($condition_met ? 'YES' : 'NO') . "</p>";
    
    if ($condition_met) {
        // Show UUT increasing mean
        if (isset($result_data['uutIncMean'][$index])) {
            $increasingReading = number_format(floor((float)$result_data['uutIncMean'][$index] * 100) / 100, 2);
        }
        
        // Show UUT decreasing mean
        if (isset($result_data['uutDecMean'][$index])) {
            $decreasingReading = number_format(floor((float)$result_data['uutDecMean'][$index] * 100) / 100, 2);
        }
        
        // Calculate maximum deviation from result data
        if (isset($result_data['maxDeviation'][$index])) {
            $maxDeviation = number_format(floor((float)$result_data['maxDeviation'][$index] * 100) / 100, 2);
            echo "<p>Using stored maxDeviation: {$maxDeviation}</p>";
        } elseif (isset($result_data['maxDeviation']) && is_array($result_data['maxDeviation'])) {
            $maxDeviation = number_format(floor((float)$result_data['maxDeviation'][$index] * 100) / 100, 2);
            echo "<p>Using stored maxDeviation (array): {$maxDeviation}</p>";
        } else {
            echo "<p>Calculating maxDeviation on the fly...</p>";
            $iprtMean = isset($result_data['iprtMean'][$index]) ? (float)$result_data['iprtMean'][$index] : 0;
            $uutIncMean = isset($result_data['uutIncMean'][$index]) ? (float)$result_data['uutIncMean'][$index] : 0;
            $uutDecMean = isset($result_data['uutDecMean'][$index]) ? (float)$result_data['uutDecMean'][$index] : 0;
            
            if ($iprtMean > 0 && ($uutIncMean > 0 || $uutDecMean > 0)) {
                $deviationInc = $uutIncMean > 0 ? abs($uutIncMean - $iprtMean) : 0;
                $deviationDec = $uutDecMean > 0 ? abs($uutDecMean - $iprtMean) : 0;
                $maxDeviation = number_format(max($deviationInc, $deviationDec), 2);
                echo "<p>Calculated maxDeviation: {$maxDeviation}</p>";
            } else {
                $maxDeviation = '';
                echo "<p>No calculation possible</p>";
            }
        }
    }
    
    echo "<p><strong>Final values:</strong></p>";
    echo "<ul>";
    echo "<li>Increasing Reading: {$increasingReading}</li>";
    echo "<li>Decreasing Reading: {$decreasingReading}</li>";
    echo "<li>Max Deviation: {$maxDeviation}</li>";
    echo "</ul>";
    echo "<hr>";
}
?>
