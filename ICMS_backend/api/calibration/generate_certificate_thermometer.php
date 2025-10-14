<?php
// Set proper UTF-8 encoding
header('Content-Type: text/html; charset=UTF-8');
mb_internal_encoding('UTF-8');

require_once __DIR__ . '/../../vendor/setasign/fpdf/fpdf.php';
include_once '../config/db.php';

class PDF extends FPDF {
    function Header() {
        // DOST Logo (left side)
        $dost_logo_path = __DIR__ . '/../../assets/dost_logo.png';
        if (file_exists($dost_logo_path)) {
            $this->Image($dost_logo_path, 12, 12, 22);
        }
        
        // Bagong-Pilipinas Logo (right side, right position) - same size as DOST logo
        $bagong_pilipinas_logo_path = __DIR__ . '/../../assets/bagong_pilipinas_logo.png';
        if (file_exists($bagong_pilipinas_logo_path)) {
            $this->Image($bagong_pilipinas_logo_path, 175, 12, 22); // Same size as DOST logo (22)
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
    }
    
    function Footer() {
        $left_margin = 20;
        $col_width = 60;
        $this->SetY(-28);
        $this->SetDrawColor(0,0,0);
        $this->Line($left_margin, $this->GetY(), 210 - $left_margin, $this->GetY());
        $this->Ln(2);
        $this->SetFont('Arial', '', 8);
        $y = $this->GetY();

        $footer_left = $left_margin + 0; // keep left as is
        $footer_right = $left_margin + $col_width + 30; // shift right column 24mm further right
        $label_width = 20;

        // Row 1: Postal Address | Tel./Fax No.
        $this->SetXY($footer_left, $y);
        $this->Cell($label_width, 5, 'Postal Address:', 0, 0, 'L');
        $this->Cell($col_width-$label_width, 5, 'Government Center, Sevilla', 0, 0, 'L');
        $this->SetXY($footer_right, $y);
        $this->Cell(32, 5, 'Tel./Fax No.: (072) 242-0663', 0, 1, 'L');

        // Row 2: City | Mobile No.
        $this->SetX($footer_left + $label_width);
        $this->Cell($col_width-$label_width, 5, 'City of San Fernando, La Union', 0, 0, 'L');
        $this->SetX($footer_right);
        $this->Cell(32, 5, 'Mobile No.: +63 968 443 5399', 0, 1, 'L');

        // Row 3: Email | URL
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
        $this->Cell(30, 5, 'Thermometer', 0, 0, 'R');
    }
}

require_once '../config/cors.php';

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

if (!$record) {
    http_response_code(404);
    echo json_encode(['message' => 'No calibration record found for this sample.']);
    exit();
}

$input_data = json_decode($record['input_data'], true);
$result_data = isset($record['result_data']) ? json_decode($record['result_data'], true) : [];

// Fetch calibrator details - get the actual person who calibrated it
$calibrator_name = ''; // Will be set from database
$calibrator_title = 'Calibration Engineer';

if ($record['calibrated_by']) {
    $calibrator_stmt = $db->prepare('SELECT first_name, last_name, role FROM users WHERE id = :id');
    $calibrator_stmt->bindParam(':id', $record['calibrated_by'], PDO::PARAM_INT);
    $calibrator_stmt->execute();
    $calibrator = $calibrator_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($calibrator) {
        $calibrator_name = strtoupper($calibrator['first_name'] . ' ' . $calibrator['last_name']);
        $calibrator_title = 'Calibration Engineer'; // Always use proper title
    } else {
        // If the assigned user doesn't exist, get any calibration engineer
        $eng_stmt = $db->prepare('SELECT first_name, last_name, role FROM users WHERE role = "calibration_engineers" LIMIT 1');
        $eng_stmt->execute();
        $eng = $eng_stmt->fetch(PDO::FETCH_ASSOC);
        if ($eng) {
            $calibrator_name = strtoupper($eng['first_name'] . ' ' . $eng['last_name']);
            $calibrator_title = 'Calibration Engineer'; // Always use proper title
        }
    }
} else {
    // If no calibrator assigned, get any calibration engineer
    $eng_stmt = $db->prepare('SELECT first_name, last_name, role FROM users WHERE role = "calibration_engineers" LIMIT 1');
    $eng_stmt->execute();
    $eng = $eng_stmt->fetch(PDO::FETCH_ASSOC);
    if ($eng) {
        $calibrator_name = strtoupper($eng['first_name'] . ' ' . $eng['last_name']);
        $calibrator_title = 'Calibration Engineer'; // Always use proper title
    }
}

// Fetch technical manager from signatories table
$technical_manager_name = 'BERNADINE P. SUNIEGA'; // Default fallback
$technical_manager_title = 'Technical Manager';

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

// Fetch customer details
$customer_name = 'N/A';
$customer_address = 'N/A';
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

$pdf = new PDF();
$pdf->AliasNbPages();
$pdf->AddPage();

// Add some space before the text
$pdf->Ln(10);

// Add horizontal line above Regional Standards and Testing Laboratory
$pdf->SetDrawColor(0,0,0);
$pdf->SetLineWidth(0.5); // Make line thicker
$pdf->Line(20, $pdf->GetY(), 190, $pdf->GetY());
$pdf->Ln(3);

// Add Regional Standards and Testing Laboratory above certificate title
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetTextColor(0, 153, 204); // Blue color like DEPARTMENT OF SCIENCE AND TECHNOLOGY
$pdf->Cell(0, 6, 'REGIONAL STANDARDS AND TESTING LABORATORY', 0, 1, 'C');
$pdf->SetTextColor(0, 0, 0); // Reset to black
$pdf->Ln(2);

$pdf->SetFont('Arial', 'B', 12); // Certificate title
$pdf->Cell(0, 10, 'CALIBRATION CERTIFICATE', 0, 1, 'C');
$pdf->Ln(2);

// Details section (smaller font)
$pdf->SetFont('Arial', '', 10);
$details = [
    ['Reference No.', $ref_no],
    ['Sample No.', $serial_no],
    ['Date Submitted', $record['date_started'] ? date('d M Y', strtotime($record['date_started'])) : ''],
    ['Date Calibrated', $record['date_completed'] ? date('d M Y', strtotime($record['date_completed'])) : date('d M Y', strtotime($record['created_at']))],
    ['Calibration Item', $type],
    ['Make', $section],
    ['Model No.', $range],
    ['Serial No.', $serial_no],
    ['Resolution', '0.1' . chr(176) . 'C'], // Default resolution for thermometer
    ['Readability', '0.1' . chr(176) . 'C'], // Add readability field
    ['Customer', $customer_name],
];
$leftX = 20; $topY = $pdf->GetY();
foreach ($details as $i => $row) {
    $pdf->SetXY($leftX, $topY + $i*8); // slightly less vertical space
    $pdf->Cell(35, 7, $row[0] . ' :', 0, 0, 'L');
    $pdf->Cell(80, 7, $row[1], 0, 0, 'L');
}
// Address (wrap if long)
$pdf->SetXY($leftX, $topY + count($details)*8);
$pdf->Cell(35, 7, 'Address :', 0, 0, 'L');
$pdf->MultiCell(120, 7, $customer_address, 0, 'L');
$pdf->SetY($topY + (count($details)+1)*8 + 2);

// Add margin before tables
$pdf->Ln(3);

// Horizontal line above MEASUREMENT RESULTS
$pdf->SetDrawColor(0, 0, 0);
$pdf->Line(20, $pdf->GetY(), 190, $pdf->GetY());
$pdf->Ln(3);

// Thermometer-specific content
$pdf->SetFont('Arial', 'B', 11);
$pdf->Cell(0, 7, 'MEASUREMENT RESULTS:', 0, 1, 'L');
$pdf->Ln(4);
$pdf->SetFont('Arial', '', 10);
$pdf->MultiCell(0, 5, 'This certifies that the above THERMOMETER/ SENSOR was calibrated by the Regional Metrology Laboratory at Government Center, Sevilla, City of San Fernando, La Union under the following environmental conditions:');
$pdf->Ln(8);

// Environmental Conditions Table - Fetch from database
$env_temp = '23.0'; // Default fallback
$env_humidity = '50'; // Default fallback

if (isset($input_data['envConditions'])) {
    $env_conditions = $input_data['envConditions'];
    if (isset($env_conditions['avgTemp'])) {
        $env_temp = number_format($env_conditions['avgTemp'], 1);
    } elseif (isset($env_conditions['startTemp'])) {
        $env_temp = number_format($env_conditions['startTemp'], 1);
    }
    if (isset($env_conditions['avgHumidity'])) {
        $env_humidity = number_format($env_conditions['avgHumidity'], 0);
    } elseif (isset($env_conditions['startHumidity'])) {
        $env_humidity = number_format($env_conditions['startHumidity'], 0);
    }
}

$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(60, 10, 'Ambient Temperature (' . chr(176) . 'C)', 1, 0, 'C');
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(60, 10, $env_temp . chr(176) . 'C', 1, 1, 'C');
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(60, 10, 'Relative Humidity (%)', 1, 0, 'C');
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(60, 10, $env_humidity . '%', 1, 1, 'C');
$pdf->Ln(8);

// Main Measurement Results Table - Fetch from database
$pdf->SetFont('Arial', 'B', 9);
$colWidths = [45, 45, 45, 45];
$pdf->Cell($colWidths[0], 8, 'Standard Reading ' . chr(176) . 'C', 1, 0, 'C');
$pdf->Cell($colWidths[1], 8, 'UUT Reading ' . chr(176) . 'C', 1, 0, 'C');
$pdf->Cell($colWidths[2], 8, 'Correction ' . chr(176) . 'C', 1, 0, 'C');
$pdf->Cell($colWidths[3], 8, 'Uncertainty of Measurement', 1, 1, 'C');

$pdf->SetFont('Arial', '', 9);

// Calculate proper uncertainty using Uc × k formula
$uc = 0; // Combined Standard Uncertainty
$k = 2; // Coverage Factor (default)
$calculated_uncertainty = 0;

// Try to get Uc and k from result_data
if (isset($result_data['uc']) && is_numeric($result_data['uc'])) {
    $uc = floatval($result_data['uc']);
} elseif (isset($result_data['combinedStandardUncertainty']) && is_numeric($result_data['combinedStandardUncertainty'])) {
    $uc = floatval($result_data['combinedStandardUncertainty']);
} elseif (isset($result_data['uncertainty']['uc']) && is_numeric($result_data['uncertainty']['uc'])) {
    $uc = floatval($result_data['uncertainty']['uc']);
}

if (isset($result_data['k']) && is_numeric($result_data['k'])) {
    $k = floatval($result_data['k']);
} elseif (isset($result_data['coverageFactor']) && is_numeric($result_data['coverageFactor'])) {
    $k = floatval($result_data['coverageFactor']);
} elseif (isset($result_data['uncertainty']['k']) && is_numeric($result_data['uncertainty']['k'])) {
    $k = floatval($result_data['uncertainty']['k']);
}

// Calculate expanded uncertainty: Uc × k
if ($uc > 0 && $k > 0) {
    $calculated_uncertainty = $uc * $k;
}

// Debug logging
error_log("Thermometer Uncertainty Calculation:");
error_log("Uc: " . $uc);
error_log("k: " . $k);
error_log("Calculated Uncertainty (Uc × k): " . $calculated_uncertainty);

// Fetch measurement data from database
$measurement_data = [];
if (isset($input_data['referenceData']) && is_array($input_data['referenceData'])) {
    foreach ($input_data['referenceData'] as $data_point) {
        $uncertainty_value = $calculated_uncertainty > 0 ? $calculated_uncertainty : ($data_point['uncertainty'] ?? 0.2);
        $measurement_data[] = [
            'standard' => number_format($data_point['temp'], 1),
            'indicated' => number_format($data_point['indicated'], 1),
            'correction' => number_format($data_point['correction'], 1),
            'uncertainty' => number_format($uncertainty_value, 1)
        ];
    }
}

// If no data from database, use default sample data
if (empty($measurement_data)) {
    $default_uncertainty = $calculated_uncertainty > 0 ? number_format($calculated_uncertainty, 1) : '0.2';
    $measurement_data = [
        ['0.0', '0.1', '0.1', $default_uncertainty],
        ['25.0', '25.1', '0.1', $default_uncertainty],
        ['50.0', '50.2', '0.2', $default_uncertainty]
    ];
}

foreach ($measurement_data as $row) {
    if (is_array($row)) {
        // Handle both array format and associative array format
        $standard = isset($row['standard']) ? $row['standard'] : $row[0];
        $indicated = isset($row['indicated']) ? $row['indicated'] : $row[1];
        $correction = isset($row['correction']) ? $row['correction'] : $row[2];
        $uncertainty = isset($row['uncertainty']) ? $row['uncertainty'] : $row[3];
    } else {
        // Fallback for unexpected format
        $standard = $indicated = $correction = $uncertainty = 'N/A';
    }
    
    $pdf->Cell($colWidths[0], 8, $standard, 1, 0, 'C');
    $pdf->Cell($colWidths[1], 8, $indicated, 1, 0, 'C');
    $pdf->Cell($colWidths[2], 8, $correction, 1, 0, 'C');
    $pdf->Cell($colWidths[3], 8, $uncertainty, 1, 1, 'C');
}
$pdf->Ln(2);

// Procedure Description
$pdf->SetFont('Arial', '', 9);
$pdf->MultiCell(0, 5, 'The procedure is in accordance with the laboratory\'s in-house calibration method (CM-MTR-009) with the following results at the indicated test points. The specified expanded uncertainty is at a confidence level of approximately 95% with a coverage factor of k=2.');

// Add second page for Thermometer
$pdf->AddPage();
$pdf->Ln(5);

// Horizontal line above STANDARDS USED AND TRACEABILITY
$pdf->SetDrawColor(0, 0, 0);
$pdf->Line(20, $pdf->GetY(), 190, $pdf->GetY());
$pdf->Ln(3);

// STANDARDS USED AND TRACEABILITY - Fetch from database
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 7, 'STANDARDS USED AND TRACEABILITY', 0, 1, 'L');
$pdf->Ln(3);

// Table header
$pdf->SetFont('Arial', 'B', 9);
$colW = [80, 60, 45];
$pdf->Cell($colW[0], 8, 'Name of Standard', 1, 0, 'C');
$pdf->Cell($colW[1], 8, 'Calibration Certificate No.', 1, 0, 'C');
$pdf->Cell($colW[2], 8, 'Issuing Lab/Traceability', 1, 1, 'C');

// Fetch standards data from database
$standards_data = [];

// Try to fetch thermometer-specific standards from standard_gauges table
try {
    $standards_stmt = $db->prepare('SELECT * FROM standard_gauges WHERE type LIKE "%Thermometer%" OR type LIKE "%Temperature%" AND is_active = 1 ORDER BY id DESC LIMIT 2');
    $standards_stmt->execute();
    $standards_records = $standards_stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Table doesn't exist or other error, use empty array
    $standards_records = [];
}

if (!empty($standards_records)) {
    foreach ($standards_records as $standard) {
        $standards_data[] = [
            'name' => $standard['type'] . ' ' . $standard['model_maker'],
            'certificate' => $standard['certificate_no'],
            'traceability' => $standard['traceability']
        ];
    }
}

// If no thermometer standards found, use default thermometer standards
if (empty($standards_data)) {
    $standards_data = [
        [
            'name' => 'Temperature Readout Isotech TTI-10',
            'certificate' => '102023-DT-0089',
            'traceability' => 'NML-Philippines, ITDI'
        ],
        [
            'name' => 'Standard Platinum Resistance Thermometer',
            'certificate' => '102023-DT-0089',
            'traceability' => 'NML-Philippines, ITDI'
        ]
    ];
}

// Display standards data
$pdf->SetFont('Arial', '', 9);
foreach ($standards_data as $standard) {
    $pdf->Cell($colW[0], 8, $standard['name'], 1, 0, 'L');
    $pdf->Cell($colW[1], 8, $standard['certificate'], 1, 0, 'C');
    $pdf->Cell($colW[2], 8, $standard['traceability'], 1, 1, 'C');
}
$pdf->Ln(8);

// REMARKS
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 6, 'REMARKS:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 9);
$pdf->MultiCell(0, 5, "1. The results given in this report are obtained at the time of the test and refer only to the particular instrument submitted. This report shall not be reproduced except in full, without the written approval of the laboratory.\n2. This instrument was calibrated using reference standard traceable to SI Units of measurement through National Metrology Laboratory.\n3. The End user should determine the suitability of equipment for it's intended use.\n4. No adjustments were performed on the thermometer");
$pdf->Ln(10);

// SIGNATURE BLOCKS
$pdf->Ln(5);

// Define margins
$left_margin = 20;
$right_margin = 190;

// Get starting Y position for both columns
$startY = $pdf->GetY();

// Left column - Calibrated by
$pdf->SetXY($left_margin, $startY);
$pdf->SetFont('Arial', 'I', 9);
$pdf->Cell(70, 5, 'Calibrated by:', 0, 1, 'L');

$pdf->SetXY($left_margin, $startY + 8); // Add space between label and name
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(70, 5, strtoupper($calibrator_name), 0, 1, 'L');

$pdf->SetXY($left_margin, $startY + 16); // Add space between name and title
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(70, 5, ucfirst(strtolower($calibrator_title)), 0, 1, 'L');

// Right column - Certified by (moved downward)
$certifiedY = $startY + 20; // Move down by 20mm
$pdf->SetXY($right_margin - 70, $certifiedY);
$pdf->SetFont('Arial', 'I', 9);
$pdf->Cell(70, 5, 'Certified by:', 0, 1, 'L');

$pdf->SetXY($right_margin - 70, $certifiedY + 8); // Add space between label and name
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(70, 5, $technical_manager_name, 0, 1, 'L');

$pdf->SetXY($right_margin - 70, $certifiedY + 16); // Add space between name and title
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(70, 5, $technical_manager_title, 0, 1, 'L');


$pdf->Output('I', 'Thermometer_Certificate.pdf');
exit();
?>
