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
            $this->Image($bagong_pilipinas_logo_path, 175, 12, 22); // Bagong-Pilipinas logo positioned on the right side
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
        $this->Cell(0, 6, 'Regional Standards and Testing Laboratory', 0, 1, 'L');
        
        // Horizontal line
        $lineY = 42;
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
        $this->Cell(30, 5, 'Thermohygrometer', 0, 0, 'R');
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

// Fetch calibrator details
$calibrator_name = 'MA. FERNANDA I BANDA'; // Default fallback (already uppercase)
$calibrator_title = 'Calibration Engineer';
if ($record['calibrated_by']) {
    $calibrator_stmt = $db->prepare('SELECT first_name, last_name, role FROM users WHERE id = :id');
    $calibrator_stmt->bindParam(':id', $record['calibrated_by'], PDO::PARAM_INT);
    $calibrator_stmt->execute();
    $calibrator = $calibrator_stmt->fetch(PDO::FETCH_ASSOC);
    if ($calibrator) {
        $calibrator_name = strtoupper($calibrator['first_name'] . ' ' . $calibrator['last_name']);
        $calibrator_title = 'Calibration Engineer'; // Always use proper title
    }
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

// Set margins to 0.75 inch (19mm)
$pdf = new PDF('P', 'mm', 'A4');
$pdf->SetMargins(19, 19, 19);
$left_margin = 19;
$right_margin = 210 - 19; // A4 width is 210mm
$pdf->AliasNbPages();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 12); // Certificate title
$pdf->SetY(45); // Move title up closer to horizontal line
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
    ['Model', $range],
    ['Serial No.', $serial_no],
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
// Measurement Results
$pdf->SetFont('Arial', 'B', 11);
$pdf->Cell(0, 7, 'MEASUREMENT RESULTS:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
// Temperature Table
$pdf->Cell(0, 6, 'A. Temperature Indicator Test', 0, 1, 'L');
$pdf->SetFont('Arial', 'B', 9);
$colWidths = [45, 80, 45];
// --- Temperature Table Header (merged middle cell) ---
$pdf->Cell($colWidths[0], 12, "Reference Temperature", 1, 0, 'C');
$x = $pdf->GetX();
$y = $pdf->GetY();
$pdf->MultiCell($colWidths[1], 6, "Digital Thermo-Hygrometer\nunder Calibration Reading", 1, 'C');
$pdf->SetXY($x + $colWidths[1], $y);
$pdf->Cell($colWidths[2], 12, "Uncertainty of Calibration", 1, 0, 'C');
$pdf->Ln(12);
$pdf->SetFont('Arial', '', 9);
for ($i = 0; $i < 3; $i++) {
    $ref = $input_data['refReadings']['temp'][$i] ?? [0,0,0];
    $uuc = $input_data['uucReadings']['temp'][$i] ?? [0,0,0];
    $avg = function($arr) { return (is_array($arr) && count($arr)) ? array_sum($arr)/count($arr) : 0; };
    $U_arr = $result_data['U_temp_arr'] ?? $result_data['U_temp'] ?? [];
    if (!is_array($U_arr)) $U_arr = [$U_arr,$U_arr,$U_arr];
    $pdf->Cell($colWidths[0], 8, number_format($avg($ref),2).' °C', 1, 0, 'L');
    $pdf->Cell($colWidths[1], 8, number_format($avg($uuc),2).' °C', 1, 0, 'L');
    $pdf->Cell($colWidths[2], 8, (isset($U_arr[$i]) && !is_nan($U_arr[$i]) ? number_format($U_arr[$i],2) : '').' °C', 1, 1, 'L');
}
$pdf->Ln(1);
// Humidity Table
$pdf->SetFont('Arial', '', 10);
$pdf->Cell(0, 6, 'B. Humidity Indicator Test', 0, 1, 'L');
$pdf->SetFont('Arial', 'B', 9);
// --- Humidity Table Header (merged middle cell) ---
$pdf->Cell($colWidths[0], 12, "Reference Rel. Humidity", 1, 0, 'C');
$x = $pdf->GetX();
$y = $pdf->GetY();
$pdf->MultiCell($colWidths[1], 6, "Digital Thermo-Hygrometer\nunder Calibration Reading", 1, 'C');
$pdf->SetXY($x + $colWidths[1], $y);
$pdf->Cell($colWidths[2], 12, "Uncertainty of Calibration", 1, 0, 'C');
$pdf->Ln(12);
$pdf->SetFont('Arial', '', 9);
for ($i = 0; $i < 3; $i++) {
    $ref = $input_data['refReadings']['humidity'][$i] ?? [0,0,0];
    $uuc = $input_data['uucReadings']['humidity'][$i] ?? [0,0,0];
    $avg = function($arr) { return (is_array($arr) && count($arr)) ? array_sum($arr)/count($arr) : 0; };
    $U_arr = $result_data['U_humidity_arr'] ?? $result_data['U_humidity'] ?? [];
    if (!is_array($U_arr)) $U_arr = [$U_arr,$U_arr,$U_arr];
    $pdf->Cell($colWidths[0], 8, number_format($avg($ref),2).' %rh', 1, 0, 'L');
    $pdf->Cell($colWidths[1], 8, number_format($avg($uuc),2).' %rh', 1, 0, 'L');
    $pdf->Cell($colWidths[2], 8, (isset($U_arr[$i]) && !is_nan($U_arr[$i]) ? number_format($U_arr[$i],2) : '').' %rh', 1, 1, 'L');
}
$pdf->Ln(1);
// Uncertainty Statement
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 7, 'UNCERTAINTY OF MEASUREMENT:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 9);
$pdf->MultiCell(0, 5, "The uncertainty stated is the expanded uncertainty obtained by multiplying the standard uncertainty by the coverage factor k=2, as determined in accordance with the 'Guide to the Expression of Uncertainty (GUM)'. The value of the measurand lies within the assigned range of values with a probability of 95%.");

// --- SECOND PAGE ---
$pdf->AddPage();

// STANDARDS USED AND TRACEABILITY
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 7, 'STANDARDS USED AND TRACEABILITY', 0, 1, 'L');
// Table header
$pdf->SetFont('Arial', 'B', 9);
$colW = [60, 70, 45];
$pdf->Cell($colW[0], 8, 'Name of Standard', 1, 0, 'C');
$pdf->Cell($colW[1], 8, 'Calibration Certificate No.', 1, 0, 'C');
$pdf->Cell($colW[2], 8, 'Issuing Lab/Traceability', 1, 1, 'C');
// Table row (static example, can be made dynamic)
$pdf->SetFont('Arial', '', 9);
$pdf->Cell($colW[0], 8, 'Humidity and Temperature Transmitter', 1, 0, 'L');
$pdf->Cell($colW[1], 8, 'MIRDC-102023-INS-0809E', 1, 0, 'C');
$pdf->Cell($colW[2], 8, 'MIRDC', 1, 1, 'C');
$pdf->Ln(2);

// CALIBRATION PROCEDURE
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 6, 'CALIBRATION PROCEDURE:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 9);
$pdf->MultiCell(0, 5, "The procedure used is the comparison between the Unit Under Calibration reading against the reference temperature reading within controlled temperature and humidity controlled chamber;12 100 27534 TMS.");
$pdf->Ln(1);

// MEASUREMENT CONDITIONS
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 6, 'MEASUREMENT CONDITIONS:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 9);
$pdf->MultiCell(0, 5, "Prior to performing any calibration tests, the item need to be acclimated to the ambient conditions of the laboratory. In particular, all readings are taken after stabilization of reference and Unit under test.");
$pdf->Ln(1);

// ENVIRONMENTAL CONDITIONS
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 6, 'ENVIRONMENTAL CONDITIONS', 0, 1, 'L');
$pdf->SetFont('Arial', '', 9);
// Calculate averages from input data
$avg_temp = 0;
$avg_humidity = 0;
if (isset($input_data['refReadings']['temp']) && is_array($input_data['refReadings']['temp'])) {
    $all = array_merge(...array_values($input_data['refReadings']['temp']));
    $avg_temp = count($all) ? array_sum($all)/count($all) : 0;
}
if (isset($input_data['refReadings']['humidity']) && is_array($input_data['refReadings']['humidity'])) {
    $all = array_merge(...array_values($input_data['refReadings']['humidity']));
    $avg_humidity = count($all) ? array_sum($all)/count($all) : 0;
}
$pdf->Cell(55, 6, 'Ambient Temperature', 0, 0, 'L');
$pdf->Cell(10, 6, ':', 0, 0, 'C');
$pdf->Cell(30, 6, number_format($avg_temp,2), 0, 0, 'L');
$pdf->Cell(0, 6, '°C', 0, 1, 'L');
$pdf->Cell(55, 6, 'Relative Humidity', 0, 0, 'L');
$pdf->Cell(10, 6, ':', 0, 0, 'C');
$pdf->Cell(30, 6, number_format($avg_humidity,2), 0, 0, 'L');
$pdf->Cell(0, 6, '%RH', 0, 1, 'L');
$pdf->Ln(1);

// REMARKS
$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 6, 'REMARKS:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 9);
$pdf->MultiCell(0, 5, "1. The results given in this report are obtained at the time of the test and refer only to the particular instrument submitted. This report shall not be reproduced except in full, without the written approval of the laboratory.\n2. This instrument was calibrated using reference standard traceable to SI Units of measurement through National Metrology Laboratory.\n3. The End user should determine the suitability of equipment for it's intended use.\n4. No adjustments were performed on the thermo-Hygrometer/ sensor.");
$pdf->Ln(6);

// SIGNATURE BLOCKS
$pdf->Ln(10);

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
$pdf->Cell(70, 5, 'BERNADINE P. SUNIEGA', 0, 1, 'L');

$pdf->SetXY($right_margin - 70, $certifiedY + 16); // Add space between name and title
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(70, 5, 'Technical Manager', 0, 1, 'L');

$pdf->Output('I', 'calibration_certificate.pdf');
exit(); 