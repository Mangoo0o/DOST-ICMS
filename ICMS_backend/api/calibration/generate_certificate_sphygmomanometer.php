<?php
require_once __DIR__ . '/../../vendor/setasign/fpdf/fpdf.php';
include_once '../config/db.php';

class PDF extends FPDF {
    function Header() {
        // DOST Logo (left side)
        $dost_logo_path = __DIR__ . '/../../assets/dost_logo.png';
        if (file_exists($dost_logo_path)) {
            $this->Image($dost_logo_path, 12, 12, 22);
        }
        
        // Bagong-Pilipinas Logo (right side, right position)
        $bagong_pilipinas_logo_path = __DIR__ . '/../../assets/bagong_pilipinas_logo.png';
        if (file_exists($bagong_pilipinas_logo_path)) {
            $this->Image($bagong_pilipinas_logo_path, 175, 12, 22);
        }
        
        // Agency name and address - positioned right beside DOST logo
        $this->SetXY(40, 12);
        $this->SetFont('Arial', 'B', 11);
        $this->Cell(0, 6, 'Republic of the Philippines', 0, 1, 'L');
        $this->SetX(40);
        $this->SetFont('Arial', 'B', 12);
        $this->SetTextColor(0, 153, 204);
        $this->Cell(0, 6, 'DEPARTMENT OF SCIENCE AND TECHNOLOGY', 0, 1, 'L');
        $this->SetTextColor(0,0,0);
        $this->SetX(40);
        $this->SetFont('Arial', 'B', 11);
        $this->Cell(0, 6, 'Regional Office No. I', 0, 1, 'L');
        $this->SetX(40);
        $this->SetFont('Arial', '', 11);
        $this->Cell(0, 6, 'REGIONAL STANDARDS AND TESTING LABORATORY', 0, 1, 'L');
        
        // Horizontal line
        $lineY = 35;
        $this->SetY($lineY);
        $this->SetDrawColor(0,0,0);
        $this->Line(12, $lineY, 198, $lineY);
        $this->Ln(8);
    }
    
    function Footer() {
        global $left_margin;
        $usable_width = 210 - 2 * $left_margin;
        $col_width = $usable_width / 2;
        $this->SetY(-28);
        $this->SetDrawColor(0,0,0);
        $this->Line($left_margin, $this->GetY(), 210 - $left_margin, $this->GetY());
        $this->Ln(2);
        $this->SetFont('Arial', '', 8);
        $y = $this->GetY();
        $footer_left = $left_margin + 0;
        $footer_right = $left_margin + $col_width + 30;
        $label_width = 20;
        $this->SetXY($footer_left, $y);
        $this->Cell($label_width, 5, 'Postal Address:', 0, 0, 'L');
        $this->Cell($col_width-$label_width, 5, 'Government Center, Sevilla', 0, 0, 'L');
        $this->SetXY($footer_right, $y);
        $this->Cell(32, 5, 'Tel./Fax No.: (072) 242-0663', 0, 1, 'L');
        $this->SetX($footer_left + $label_width);
        $this->Cell($col_width-$label_width, 5, 'City of San Fernando, La Union', 0, 0, 'L');
        $this->SetX($footer_right);
        $this->Cell(32, 5, 'Mobile No.: +63 969 331 9022', 0, 1, 'L');
        $this->SetXY($footer_left, $y + 10);
        $this->Cell($label_width, 5, 'e-mail address:', 0, 0, 'L');
        $this->SetTextColor(0, 102, 204);
        $this->SetFont('Arial', 'U', 8);
        $this->Cell($col_width-$label_width, 5, 'rml@region1.dost.gov.ph', 0, 0, 'L', false, 'mailto:rml@region1.dost.gov.ph');
        $this->SetTextColor(0,0,0);
        $this->SetFont('Arial', '', 8);
        $this->SetXY($footer_right, $y + 10);
        $this->Cell(13, 5, 'URL:', 0, 0, 'L');
        $this->SetTextColor(0, 102, 204);
        $this->SetFont('Arial', 'U', 8);
        $this->Cell($col_width-13, 5, 'http://region1.dost.gov.ph', 0, 0, 'L', false, 'http://region1.dost.gov.ph');
        $this->SetTextColor(0,0,0);
        $this->SetFont('Arial', '', 8);
        
        // Core Values Bar
        $this->SetY(-15);
        $this->SetFillColor(0, 153, 204);
        $this->SetTextColor(255, 255, 255);
        $this->SetFont('Arial', 'B', 8);
        $this->Cell(25, 8, 'CORE VALUES', 0, 0, 'L', true);
        $this->SetFont('Arial', 'B', 10);
        $this->Cell(15, 8, 'iELITE', 0, 0, 'C', true);
        $this->SetFont('Arial', '', 7);
        $this->Cell(0, 8, 'Innovation - Excellence - Leadership - Integrity - Teamwork - Empowerment', 0, 0, 'C', true);
        $this->SetTextColor(0,0,0);
        $this->SetFont('Arial', '', 8);
        
        // Page number and document type
        $this->SetXY($left_margin, -8);
        $this->Cell(30, 5, 'Page ' . $this->PageNo() . ' of {nb}', 0, 0, 'L');
        $this->SetXY(210 - $left_margin - 30, -8);
        $this->Cell(30, 5, 'Sphygmomanometer', 0, 0, 'R');
    }
}

require_once '../config/cors.php';

// Configuration - Default values for sphygmomanometer certificates
$DEFAULT_CONFIG = [
    'calibrator_name' => 'MA. FERNANDA I. BANDA',
    'calibrator_title' => 'Calibration Engineer',
    'certifier_name' => 'BERNADINE P. SUNIEGA',
    'certifier_title' => 'Technical Manager',
    'place_of_calibration' => 'DOST Regional Office No. I - RSTL',
    'default_type' => 'Non-invasive Sphygmomanometer',
    'default_model' => 'Standard Model',
    'default_range' => '0-300 mmHg',
    'default_graduation' => '1 mmHg',
    'ambient_temp' => '23.0',
    'relative_humidity' => '45'
];

if (!isset($_GET['sample_id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Sample ID is required.']);
    exit();
}

$sample_id = $_GET['sample_id'];
$database = new Database();
$db = $database->getConnection();
$stmt = $db->prepare('SELECT * FROM calibration_records WHERE sample_id = :sample_id ORDER BY created_at DESC LIMIT 1');
$stmt->bindParam(':sample_id', $sample_id, PDO::PARAM_INT);
$stmt->execute();
$record = $stmt->fetch(PDO::FETCH_ASSOC);

// If no calibration record exists, create a default one with sample data
if (!$record) {
    // Create a default calibration record structure
    $record = [
        'sample_id' => $sample_id,
        'calibration_type' => 'Sphygmomanometer',
        'input_data' => '{}',
        'result_data' => '{}',
        'calibrated_by' => null,
        'date_started' => null,
        'date_completed' => null,
        'created_at' => date('Y-m-d H:i:s')
    ];
}

$input_data = json_decode($record['input_data'], true);
$result_data = isset($record['result_data']) ? json_decode($record['result_data'], true) : [];

// If no calibration data exists, provide default values
if (empty($input_data)) {
    $input_data = [
        'cuffPressureTests' => [
            ['appliedPressure' => 0, 'increasingReading' => '', 'decreasingReading' => '', 'maxDeviation' => ''],
            ['appliedPressure' => 50, 'increasingReading' => '', 'decreasingReading' => '', 'maxDeviation' => ''],
            ['appliedPressure' => 100, 'increasingReading' => '', 'decreasingReading' => '', 'maxDeviation' => ''],
            ['appliedPressure' => 150, 'increasingReading' => '', 'decreasingReading' => '', 'maxDeviation' => ''],
            ['appliedPressure' => 200, 'increasingReading' => '', 'decreasingReading' => '', 'maxDeviation' => ''],
            ['appliedPressure' => 250, 'increasingReading' => '', 'decreasingReading' => '', 'maxDeviation' => ''],
            ['appliedPressure' => 300, 'increasingReading' => '', 'decreasingReading' => '', 'maxDeviation' => '']
        ],
        'hysteresisError' => '',
        'airLeakageTests' => [
            ['appliedPressure' => 300, 'firstReading' => '', 'after5Minutes' => '', 'rateOfLoss' => ''],
            ['appliedPressure' => 250, 'firstReading' => '', 'after5Minutes' => '', 'rateOfLoss' => ''],
            ['appliedPressure' => 200, 'firstReading' => '', 'after5Minutes' => '', 'rateOfLoss' => ''],
            ['appliedPressure' => 150, 'firstReading' => '', 'after5Minutes' => '', 'rateOfLoss' => ''],
            ['appliedPressure' => 100, 'firstReading' => '', 'after5Minutes' => '', 'rateOfLoss' => '']
        ],
        'rapidExhaustTest' => ['appliedPressure' => 300, 'timeToReduce' => ''],
        'ambientTemperature' => '23.0',
        'relativeHumidity' => '45',
        'model' => '',
        'make' => '',
        'range' => '0-300 mmHg',
        'graduation' => '1 mmHg'
    ];
}

// Fetch calibrator details
$calibrator_name = $DEFAULT_CONFIG['calibrator_name'];
$calibrator_title = $DEFAULT_CONFIG['calibrator_title'];
if ($record['calibrated_by']) {
    $calibrator_stmt = $db->prepare('SELECT first_name, last_name, role FROM users WHERE id = :id');
    $calibrator_stmt->bindParam(':id', $record['calibrated_by'], PDO::PARAM_INT);
    $calibrator_stmt->execute();
    $calibrator = $calibrator_stmt->fetch(PDO::FETCH_ASSOC);
    if ($calibrator) {
        $calibrator_name = strtoupper($calibrator['first_name'] . ' ' . $calibrator['last_name']);
        $calibrator_title = $calibrator['role'] ?: $DEFAULT_CONFIG['calibrator_title'];
    }
}

// Fetch technical manager from signatories table
$technical_manager_name = $DEFAULT_CONFIG['certifier_name']; // Default fallback
$technical_manager_title = $DEFAULT_CONFIG['certifier_title'];

$tm_stmt = $db->prepare('SELECT name, title FROM signatories WHERE role = "technical_manager" AND is_active = 1 ORDER BY id DESC LIMIT 1');
$tm_stmt->execute();
$tm = $tm_stmt->fetch(PDO::FETCH_ASSOC);
if ($tm) {
    $technical_manager_name = $tm['name'];
    $technical_manager_title = $tm['title'];
}

// Fetch sample details
$sample_stmt = $db->prepare('SELECT * FROM sample WHERE id = :id');
$sample_stmt->bindParam(':id', $sample_id, PDO::PARAM_INT);
$sample_stmt->execute();
$sample = $sample_stmt->fetch(PDO::FETCH_ASSOC);
$ref_no = $sample['reservation_ref_no'] ?? '';
$section = $sample['section'] ?? '';
$type = $sample['type'] ?? '';
$range = $sample['range'] ?? '';
$serial_no = $sample['serial_no'] ?? '';
$make = $sample['make'] ?? ($input_data['make'] ?? '');
$model = $sample['model'] ?? ($input_data['model'] ?? '');
$graduation = $sample['graduation'] ?? ($input_data['graduation'] ?? '1 mmHg');

// Fetch reservation and client details
$customer_name = '';
$customer_address = '';
if ($ref_no) {
    $reservation_stmt = $db->prepare('SELECT * FROM requests WHERE reference_number = :ref');
    $reservation_stmt->bindParam(':ref', $ref_no);
    $reservation_stmt->execute();
    $reservation = $reservation_stmt->fetch(PDO::FETCH_ASSOC);
    if ($reservation && isset($reservation['client_id'])) {
        $client_stmt = $db->prepare('SELECT * FROM clients WHERE id = :id');
        $client_stmt->bindParam(':id', $reservation['client_id'], PDO::PARAM_INT);
        $client_stmt->execute();
        $client = $client_stmt->fetch(PDO::FETCH_ASSOC);
        if ($client) {
            $customer_name = $client['first_name'] . ' ' . $client['last_name'];
            $customer_address = $client['province'] . ', ' . $client['city'] . ', ' . $client['barangay'];
        }
    }
}

// Set margins
$pdf = new PDF('P', 'mm', 'A4');
$pdf->SetMargins(19, 12, 19);
$left_margin = 19;
$pdf->AliasNbPages();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetY(42);
$pdf->Cell(0, 10, 'CALIBRATION CERTIFICATE', 0, 1, 'C');
$pdf->Ln(1);

// Details section - Two column format
$pdf->SetFont('Arial', '', 8);
$leftX = 19; $topY = $pdf->GetY();
$rightX = 119;

// Left column details - clean up the data
$cleanCustomerName = $customer_name ?: 'N/A';
$cleanCustomerAddress = $customer_address ?: 'N/A';
$cleanRefNo = $ref_no ?: 'N/A';
$cleanSampleNo = $serial_no ?: 'N/A';
$cleanDateSubmitted = $record['date_started'] ? date('d M Y', strtotime($record['date_started'])) : '';
$cleanDateCalibrated = $record['date_completed'] ? date('d M Y', strtotime($record['date_completed'])) : date('d M Y', strtotime($record['created_at']));

$leftDetails = [
    ['Customer', $cleanCustomerName],
    ['Address', $cleanCustomerAddress],
    ['Reference No.', $cleanRefNo],
    ['Sample No.', $cleanSampleNo],
    ['Date Submitted', $cleanDateSubmitted],
    ['Date Calibrated', $cleanDateCalibrated],
    ['Place of Calibration', $DEFAULT_CONFIG['place_of_calibration']],
];

// Right column details - clean up the data, prioritize input_data over sample data
$cleanType = ($input_data['type'] ?? $type) ?: $DEFAULT_CONFIG['default_type'];
$cleanModel = ($input_data['model'] ?? $model) ?: $DEFAULT_CONFIG['default_model'];
$cleanSerial = ($input_data['serial_no'] ?? $serial_no) ?: 'N/A';
$cleanRange = ($input_data['range'] ?? $range) ?: $DEFAULT_CONFIG['default_range'];
$cleanGraduation = ($input_data['graduation'] ?? $graduation) ?: $DEFAULT_CONFIG['default_graduation'];

$rightDetails = [
    ['Particulars', $cleanType],
    ['Model', $cleanModel],
    ['Serial No.', $cleanSerial],
    ['Range', $cleanRange],
    ['Graduation', $cleanGraduation],
];

// Function to wrap text properly
function wrapText($pdf, $x, $y, $width, $text, $lineHeight = 4) {
    // Clean up the text first
    $text = trim($text);
    if (empty($text)) {
        $text = 'N/A';
    }
    
    // Calculate character width based on font size
    $charWidth = 1.5; // Approximate character width for Arial 8pt
    $maxChars = floor($width / $charWidth);
    
    $lines = explode("\n", wordwrap($text, $maxChars, "\n"));
    $currentY = $y;
    foreach ($lines as $line) {
        $pdf->SetXY($x, $currentY);
        $pdf->Cell($width, $lineHeight, $line, 0, 0, 'L');
        $currentY += $lineHeight;
    }
    return $currentY - $y;
}

// Display left column
foreach ($leftDetails as $i => $row) {
    $pdf->SetXY($leftX, $topY + $i*4);
    $pdf->Cell(30, 4, $row[0] . ':', 0, 0, 'L');
    wrapText($pdf, $leftX + 30, $topY + $i*4, 60, $row[1]);
}

// Display right column
foreach ($rightDetails as $i => $row) {
    $pdf->SetXY($rightX, $topY + $i*4);
    $pdf->Cell(30, 4, $row[0] . ':', 0, 0, 'L');
    wrapText($pdf, $rightX + 30, $topY + $i*4, 60, $row[1]);
}

$pdf->SetY($topY + count($leftDetails)*4 + 5);

// TEST RESULTS Section
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'TEST RESULTS', 0, 1, 'L');
$pdf->Ln(2);

// I. Test for the Maximum Permissible Errors of the Cuff Pressure Indication
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 5, 'I. Test for the Maximum Permissible Errors of the Cuff Pressure Indication', 0, 1, 'L');
$pdf->SetFont('Arial', 'B', 8);
$pdf->SetX(19); // Align with left margin

// Table header - First row
$pdf->Cell(35, 6, 'Applied Pressure (mmHg)', 1, 0, 'C');
$pdf->Cell(50, 6, 'Sample Reading (mmHg)', 1, 0, 'C');
$pdf->Cell(30, 6, 'Maximum Deviation', 1, 0, 'C');
$pdf->Cell(40, 6, 'Maximum Permissible Error', 1, 1, 'C');

// Table header - Second row (sub-headers only)
$pdf->Cell(35, 6, '', 1, 0, 'C');
$pdf->Cell(25, 6, 'Increasing', 1, 0, 'C');
$pdf->Cell(25, 6, 'Decreasing', 1, 0, 'C');
$pdf->Cell(30, 6, '', 1, 0, 'C');
$pdf->Cell(40, 6, '', 1, 1, 'C');

$pdf->SetFont('Arial', '', 8);
// Sample data rows - use actual calibration data if available
$test_pressures = [0, 50, 100, 150, 200, 250, 300];
foreach ($test_pressures as $index => $pressure) {
    $pdf->Cell(35, 6, $pressure, 1, 0, 'C');
    
    // Get calibration data for this pressure point
    $increasingReading = '';
    $decreasingReading = '';
    $maxDeviation = '';
    
    // Use actual calibration data structure
    if (isset($input_data['iprtRows'][$index]) && isset($input_data['uutRows'][$index])) {
        $iprtData = $input_data['iprtRows'][$index];
        $uutData = $input_data['uutRows'][$index];
        
        // Calculate increasing reading (average of first two readings)
        $increasingReading = round(($iprtData['X1'] + $iprtData['X2']) / 2, 1);
        
        // Calculate decreasing reading (average of last two readings)
        $decreasingReading = round(($iprtData['X3'] + $iprtData['X4']) / 2, 1);
        
        // Calculate maximum deviation from result data
        if (isset($result_data['deviationMmHg'][$index])) {
            $maxDeviation = round(abs($result_data['deviationMmHg'][$index]), 1);
        } else {
            $maxDeviation = '';
        }
    }
    
    $pdf->Cell(25, 6, $increasingReading, 1, 0, 'C');
    $pdf->Cell(25, 6, $decreasingReading, 1, 0, 'C');
    $pdf->Cell(30, 6, $maxDeviation, 1, 0, 'C');
    $pdf->Cell(40, 6, 'within ± 4 mmHg', 1, 1, 'C');
}

$pdf->Ln(3);

// II. Test for Hysteresis Error
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 5, 'II. Test for Hysteresis Error', 0, 1, 'L');
$pdf->SetFont('Arial', 'B', 8);
$pdf->SetX(19); // Align with left margin
$pdf->Cell(85, 6, 'Maximum Hysteresis Error', 1, 0, 'C');
$pdf->Cell(70, 6, 'Maximum Permissible Error', 1, 1, 'C');
$pdf->SetFont('Arial', '', 8);

// Calculate maximum hysteresis error from result data
$maxHysteresisError = '';
if (isset($result_data['hysteresisMax']) && is_array($result_data['hysteresisMax'])) {
    $maxHysteresisError = round(max($result_data['hysteresisMax']), 1) . ' mmHg';
}

$pdf->Cell(85, 6, $maxHysteresisError, 1, 0, 'C');
$pdf->Cell(70, 6, 'within ± 4 mmHg', 1, 1, 'C');

$pdf->Ln(3);

// III. Test for Air Leakage of the Pneumatic System
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 5, 'III. Test for Air Leakage of the Pneumatic System', 0, 1, 'L');
$pdf->SetFont('Arial', 'B', 8);
$pdf->SetX(19); // Align with left margin

// Table header - First row
$pdf->Cell(35, 6, 'Applied Pressure (mmHg)', 1, 0, 'C');
$pdf->Cell(50, 6, 'Sample Reading (mmHg)', 1, 0, 'C');
$pdf->Cell(30, 6, 'Rate of Pressure Loss', 1, 0, 'C');
$pdf->Cell(40, 6, 'Maximum Permissible Error', 1, 1, 'C');

// Table header - Second row (sub-headers only)
$pdf->Cell(35, 6, '', 1, 0, 'C');
$pdf->Cell(25, 6, '1st Reading', 1, 0, 'C');
$pdf->Cell(25, 6, 'After 5 minutes', 1, 0, 'C');
$pdf->Cell(30, 6, '', 1, 0, 'C');
$pdf->Cell(40, 6, '', 1, 1, 'C');

$pdf->SetFont('Arial', '', 8);
// Sample data rows - use actual leakage test data
$leakage_pressures = [300, 250, 200, 150, 100];
foreach ($leakage_pressures as $index => $pressure) {
    $pdf->Cell(35, 6, $pressure, 1, 0, 'C');
    
    // Get leakage test data
    $firstReading = '';
    $after5Minutes = '';
    $rateOfLoss = '';
    
    if (isset($input_data['lossPressures'][$index])) {
        $firstReading = $input_data['lossFirst'][$index] ?? '';
        $after5Minutes = $input_data['lossAfter5'][$index] ?? '';
        
        // Calculate rate of pressure loss from result data
        if (isset($result_data['lossRate'][$index])) {
            $rateOfLoss = round($result_data['lossRate'][$index], 1) . ' mmHg/min';
        }
    }
    
    $pdf->Cell(25, 6, $firstReading, 1, 0, 'C'); // 1st Reading
    $pdf->Cell(25, 6, $after5Minutes, 1, 0, 'C'); // After 5 minutes
    $pdf->Cell(30, 6, $rateOfLoss, 1, 0, 'C'); // Rate of pressure loss
    $pdf->Cell(40, 6, '≤4.0 mmHg/min', 1, 1, 'C');
}

$pdf->Ln(3);

// IV. Test for the Rapid Exhaust Valve
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 5, 'IV. Test for the Rapid Exhaust Valve', 0, 1, 'L');
$pdf->SetFont('Arial', 'B', 8);
$pdf->SetX(19); // Align with left margin
$pdf->Cell(35, 6, 'Applied Pressure (mmHg)', 1, 0, 'C');
$pdf->Cell(80, 6, 'Time for the Pressure Reduction to reach ≤ 15 mmHg', 1, 0, 'C');
$pdf->Cell(40, 6, 'Maximum Permissible Error', 1, 1, 'C');
$pdf->SetFont('Arial', '', 8);

// Get rapid exhaust valve test data (if available)
$exhaustTime = '';
// Note: This test might not be implemented in the current calibration process
// For now, we'll leave it empty as it requires specific test equipment

$pdf->Cell(35, 6, '300', 1, 0, 'C');
$pdf->Cell(80, 6, $exhaustTime, 1, 0, 'C');
$pdf->Cell(40, 6, '< 10 seconds', 1, 1, 'C');

$pdf->Ln(5);

// Certification Statement
$pdf->SetFont('Arial', '', 9);
$pdf->SetX(19); // Align with tables
$pdf->MultiCell(0, 5, 'This certifies that the above Non-invasive Sphygmomanometer was Tested by the Regional Metrology Laboratory at Government Center, Sevilla, City of San Fernando, La Union.');

// Add second page
$pdf->AddPage();

// Second page header
$pdf->Image(__DIR__ . '/../../assets/dost_logo.png', 12, 12, 22);
$bagong_pilipinas_logo_path = __DIR__ . '/../../assets/bagong_pilipinas_logo.png';
if (file_exists($bagong_pilipinas_logo_path)) {
    $pdf->Image($bagong_pilipinas_logo_path, 175, 12, 22);
}

$pdf->SetXY(40, 12);
$pdf->SetFont('Arial', 'B', 11);
$pdf->Cell(0, 6, 'Republic of the Philippines', 0, 1, 'L');
$pdf->SetX(40);
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetTextColor(0, 153, 204);
$pdf->Cell(0, 6, 'DEPARTMENT OF SCIENCE AND TECHNOLOGY', 0, 1, 'L');
$pdf->SetTextColor(0,0,0);
$pdf->SetX(40);
$pdf->SetFont('Arial', 'B', 11);
$pdf->Cell(0, 6, 'Regional Office No. I', 0, 1, 'L');
$pdf->SetX(40);
$pdf->SetFont('Arial', '', 11);
$pdf->Cell(0, 6, 'REGIONAL STANDARDS AND TESTING LABORATORY', 0, 1, 'L');

$pdf->SetY(40);
$pdf->SetDrawColor(0,0,0);
$pdf->Line(12, 40, 198, 40);
$pdf->Ln(8);

// Page 2 content
$pdf->SetFont('Arial', '', 9);
$pdf->MultiCell(0, 5, 'The sphygmomanometer was tested according to its normal use with the pressure inlet connection at the bottom.');
$pdf->MultiCell(0, 5, 'Testing range: from 0 mmHg to 300 mmHg positive gauge pressures.');
$pdf->Ln(2);

// Environmental conditions
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 5, 'Environmental conditions during testing:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(50, 5, 'Ambient Temperature (°C):', 0, 0, 'L');
$pdf->Cell(20, 5, '23.0 °C', 0, 1, 'L');
$pdf->Cell(50, 5, 'Relative Humidity (RH):', 0, 0, 'L');
$pdf->Cell(20, 5, '45 %', 0, 1, 'L');
$pdf->Ln(2);

$pdf->MultiCell(0, 5, 'The sphygmomanometer was subjected to air leakage, rapid exhaust valve, cuff pressure indication, and hysteresis tests.');
$pdf->MultiCell(0, 5, 'Testing was done in accordance with the laboratory\'s in-house calibration method CM-MET-008 "Performance Testing of Sphygmomanometer" based on the International Recommendation OIML R 16-1 Edition 2002 "Non-invasive Mechanical Sphygmomanometers".');
$pdf->Ln(5);

// STANDARDS USED AND TRACEABILITY
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'STANDARD USED AND TRACEABILITY:', 0, 1, 'L');
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 5, 'Standard Gauge', 0, 1, 'L');
$pdf->Ln(2);

// Two-column table format
$pdf->SetFont('Arial', '', 8);

// Standard gauge data (can be made dynamic later when standard_gauges table is created)
$standard_data = [
    'Type' => 'Digital Pressure Calibrator',
    'Model/Maker' => 'ADT672-05-GP15-BAR-N',
    'Measurement Range' => '0-1 bar (0-750 mmHg)',
    'Accuracy (% FS)' => '0.05',
    'Serial No.' => '2731706006',
    'Certificate No.' => '102023-INS-08090',
    'Traceability' => 'Metal Industry Research and Development Center',
    'Calibration Date' => 'Oct-25'
];

foreach ($standard_data as $label => $value) {
    $pdf->Cell(50, 5, $label . ':', 1, 0, 'L');
    $pdf->Cell(100, 5, $value, 1, 1, 'L');
}

$pdf->Ln(5);

// REMARKS
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'REMARKS:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 9);
$remarks = [
    'The general condition and workmanship of the instrument are SATISFACTORY',
    'The results given in this report were obtained at the time of the test and refer only to the particular sphygmomanometer submitted under the conditions indicated. The certificate is not intended to be representative of similar items. If the unit is modified or damaged in anyway, the results may be rendered invalid and will require re-verification.',
    'The user should determine suitability of the sphygmomanometer for its intended use.',
    'No adjustments were performed on the sphygmomanometer.',
    'The sphygmomanometer reading may be corrected by applying a correction of 1 mmHg. (e.g. Sphygmomanometer Reading: 120/80; After correction: 121/81, BASED ON THE CUFF PRESSURE INDICATION)',
    'The user is obliged to have the unit recalibrated at appropriate intervals.',
    'This report shall not be reproduced except in full, without the written approval of the laboratory.'
];

foreach ($remarks as $remark) {
    $pdf->MultiCell(0, 4, chr(149) . ' ' . $remark);
}

$pdf->Ln(10);

// SIGNATURE BLOCKS
$startY = $pdf->GetY();

// Left column - Calibrated by
$pdf->SetXY($left_margin, $startY);
$pdf->SetFont('Arial', 'I', 9);
$pdf->Cell(70, 5, 'Calibrated by:', 0, 1, 'L');

$pdf->SetXY($left_margin, $startY + 8);
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(70, 5, strtoupper($calibrator_name), 0, 1, 'L');

$pdf->SetXY($left_margin, $startY + 16);
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(70, 5, ucfirst(strtolower($calibrator_title)), 0, 1, 'L');

// Right column - Certified by
$pdf->SetXY(140, $startY);
$pdf->SetFont('Arial', 'I', 9);
$pdf->Cell(70, 5, 'Certified by:', 0, 1, 'L');

$pdf->SetXY(140, $startY + 8);
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(70, 5, $technical_manager_name, 0, 1, 'L');

$pdf->SetXY(140, $startY + 16);
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(70, 5, $technical_manager_title, 0, 1, 'L');

$pdf->Output('I', 'sphygmomanometer_calibration_certificate.pdf');
exit();
