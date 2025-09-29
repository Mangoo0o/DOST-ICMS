<?php
require_once __DIR__ . '/../../vendor/setasign/fpdf/fpdf.php';

class PDF extends FPDF {
    function Header() {
        // DOST Logo (left side)
        $dost_logo_path = __DIR__ . '/../../assets/dost_logo.png';
        if (file_exists($dost_logo_path)) {
            $this->Image($dost_logo_path, 12, 12, 22);
        }
        
        // PAB Logo and Accreditation (right side, left position)
        $pab_logo_path = __DIR__ . '/../../assets/pab_logo.png';
        if (file_exists($pab_logo_path)) {
            $this->Image($pab_logo_path, 150, 12, 15); // PAB logo positioned on the left side of right area
        }
        $this->SetXY(150, 30);
        $this->SetFont('Arial', 'B', 6);
        $this->SetTextColor(0, 0, 0);
        $this->Cell(15, 3, 'PAB ACCREDITED', 0, 1, 'C');
        $this->SetX(150);
        $this->Cell(15, 3, 'CALIBRATION LABORATORY', 0, 1, 'C');
        $this->SetX(150);
        $this->SetFont('Arial', '', 5);
        $this->Cell(15, 3, 'PNS ISO/IEC 17025:2017', 0, 1, 'C');
        $this->SetX(150);
        $this->Cell(15, 3, 'LA-2014-2668', 0, 1, 'C');
        
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
        $lineY = 42; // Moved line upward for more table space
        $this->SetY($lineY);
        $this->SetDrawColor(0,0,0);
        $this->Line(12, $lineY, 198, $lineY);
        $this->Ln(8);
    }
    
    // Function to calculate number of lines a MultiCell will occupy
    function NbLines($w, $txt) {
        $cw = &$this->CurrentFont['cw'];
        if ($w == 0)
            $w = $this->w - $this->rMargin - $this->x;
        $wmax = ($w - 2 * $this->cMargin) * 1000 / $this->FontSize;
        $s = str_replace("\r", '', $txt);
        $nb = strlen($s);
        if ($nb == 0)
            return 1;
        $sep = -1;
        $i = 0;
        $j = 0;
        $l = 0;
        $nl = 1;
        while ($i < $nb) {
            $c = $s[$i];
            if ($c == "\n") {
                $i++;
                $sep = -1;
                $j = $i;
                $l = 0;
                $nl++;
                continue;
            }
            if ($c == ' ')
                $sep = $i;
            $l += $cw[$c];
            if ($l > $wmax) {
                if ($sep == -1) {
                    if ($i == $j)
                        $i++;
                } else
                    $i = $sep + 1;
                $sep = -1;
                $j = $i;
                $l = 0;
                $nl++;
            } else
                $i++;
        }
        return $nl;
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
        $this->Cell(20, 5, 'Page 1 of 2', 0, 0, 'L');
        $this->SetXY(210 - $left_margin - 30, -8);
        $this->Cell(30, 5, 'Test-Weight', 0, 0, 'R');
    }
}

require_once '../config/cors.php';
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Get sample_id from URL parameter
$sample_id = isset($_GET['sample_id']) ? (int)$_GET['sample_id'] : null;

if (!$sample_id) {
    die('Sample ID is required');
}

// Database connection
require_once '../config/db.php';
$database = new Database();
$db = $database->getConnection();

// Fetch calibration record
$stmt = $db->prepare('SELECT * FROM calibration_records WHERE sample_id = :sample_id ORDER BY created_at DESC LIMIT 1');
$stmt->bindParam(':sample_id', $sample_id, PDO::PARAM_INT);
$stmt->execute();
$record = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$record) {
    die('No calibration record found for this sample');
}

$input_data = json_decode($record['input_data'], true);
$result_data = isset($record['result_data']) ? json_decode($record['result_data'], true) : [];

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

$pdf = new PDF('P', 'mm', 'A4');
$pdf->SetMargins(19, 12, 19);
$left_margin = 19;
$pdf->AliasNbPages();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetY(45); // Move title up closer to horizontal line
$pdf->Cell(0, 10, 'CALIBRATION CERTIFICATE', 0, 1, 'C');
$pdf->Ln(1); // Reduced spacing to give more room for tables

// Details section with real data
$pdf->SetFont('Arial', '', 10);
$details = [
    ['Reference No.', $ref_no],
    ['Sample No.', $serial_no],
    ['Date Submitted', date('d M Y', strtotime($sample['created_at']))],
    ['Date Calibrated', date('d M Y', strtotime($record['date_completed']))],
    ['Sample', $type],
    ['Make/Model', $range],
    ['Customer', $customer_name],
    ['Address', $customer_address],
];
$leftX = 20; $topY = $pdf->GetY();
foreach ($details as $i => $row) {
    $pdf->SetXY($leftX, $topY + $i*6); // 6mm row height
    $pdf->Cell(35, 6, $row[0] . ' :', 0, 0, 'L');
    $pdf->Cell(80, 6, $row[1], 0, 0, 'L');
}
$pdf->SetY($topY + count($details)*6 + 2);

// Measurement Results Table - With text wrapping and bigger size
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'MEASUREMENT RESULTS:', 0, 1, 'L');
$pdf->Ln(2);

// Get data from calibration record
$nominal_value = $input_data['preparation']['testWeightNomval'] ?? null;
$identification = $serial_no ?: 'DS-2025-001';
$conventional_mass = $result_data['meanDmci'] ?? null;
$uncertainty = $result_data['u_mc_t'] ?? null;
$mpe = $input_data['mpe'] ?? null;

// Format the values to match the image format
$nominal_display = is_numeric($nominal_value) ? number_format($nominal_value, 0) . ' g' : '20 g';
$conventional_display = is_numeric($conventional_mass) ? number_format($conventional_mass, 0) . ' g + ' . number_format(($conventional_mass - floor($conventional_mass)) * 1000, 2) . ' mg' : '0 g + 0.00 mg';
$uncertainty_display = is_numeric($uncertainty) ? number_format($uncertainty, 2) : '0.00';
$mpe_display = is_numeric($mpe) ? number_format($mpe, 2) : '2.50';

// Column widths - reduced uncertainty and MPE columns to make room for other tables
$col_w = [20, 20, 25, 40, 60]; // Total 165mm - more compact for better fit

// Header texts
$header_texts = [
    'NOMINAL VALUE',
    'IDENTIFICATION',
    'CONVENTIONAL MASS',
    "UNCERTAINTY\nOF\nMEASUREMENT\n(k=2), mg",
    "MAXIMUM\nPERMISSIBLE ERROR\nfor OIML Class\n±δ in mg"
];

// Store initial position for the header row
$startY = $pdf->GetY();
$startX = $pdf->GetX();
$maxHeaderHeight = 0;

// Draw headers using MultiCell for text wrapping
$currentX = $startX;
$pdf->SetFont('Arial', 'B', 8); // Larger font size for better readability
$pdf->SetFillColor(243,243,243);

// Calculate the required height for multi-line headers first
$maxLines = 4; // Maximum number of lines in any header
$lineHeight = 4.5; // Height per line - adjusted for larger font
$requiredHeight = $maxLines * $lineHeight;

for ($i = 0; $i < count($header_texts); $i++) {
    $pdf->SetXY($currentX, $startY);
    // Use MultiCell for all headers to ensure consistent height
    $pdf->MultiCell($col_w[$i], $lineHeight, $header_texts[$i], 0, 'C', true);
    $currentHeaderHeight = $pdf->GetY() - $startY;
    if ($currentHeaderHeight > $maxHeaderHeight) {
        $maxHeaderHeight = $currentHeaderHeight;
    }
    $currentX += $col_w[$i];
}

// Ensure all headers have the same height
$maxHeaderHeight = max($maxHeaderHeight, $requiredHeight);

// Draw borders for the entire header row based on max height
$pdf->SetXY($startX, $startY);
for ($i = 0; $i < count($col_w); $i++) {
    $pdf->Cell($col_w[$i], $maxHeaderHeight, '', 1, 0, 'C', false); // Draw border only
}
$pdf->Ln(); // Move to next line after drawing borders

// Reset Y position for data rows
$pdf->SetY($startY + $maxHeaderHeight);

// Data row - match header height
$pdf->SetFont('Arial', '', 9);
$pdf->Cell($col_w[0], $maxHeaderHeight, $nominal_display, 1, 0, 'C');
$pdf->Cell($col_w[1], $maxHeaderHeight, $identification, 1, 0, 'C');
$pdf->Cell($col_w[2], $maxHeaderHeight, $conventional_display, 1, 0, 'C');
$pdf->Cell($col_w[3], $maxHeaderHeight, $uncertainty_display, 1, 0, 'C');
$pdf->Cell($col_w[4], $maxHeaderHeight, $mpe_display, 1, 1, 'C');

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'UNCERTAINTY OF MEASUREMENT:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$pdf->MultiCell(0, 4.5, 'The uncertainty stated is the expanded uncertainty obtained by multiplying the standard uncertainty by the coverage factor k=2, as determined in accordance with the "Guide to the Expression of Uncertainty (GUM)". The value of the measurand lies within the assigned range of values with a probability of 95%.', 0, 'L');

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'STANDARDS USED AND TRACEABILITY', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$pdf->SetFillColor(243,243,243);

// Standards table with proper alignment
$standards_data = [
    ['Hafner (Class E2) 130891', 'Nutex (Class M1) MTR-001 to MTR-026'],
    ['Troemner (Class F1) MTR-033 to MTR-039', 'Nutex (Class M1) MTR-001 to MTR-026'],
    ['Mettler Toledo (Class F1 set) 15981', 'Nutex (Class M2) MTR-027 to MTR-032'],
    ['Nutex (Class M1) MTR-001 to MTR-026', 'Fuji (Class M1) 10016516, 10016527, 10016529,10016908, 10016580']
];

$col_widths = [80, 85];
$line_height = 6;

foreach ($standards_data as $index => $row) {
    $startY = $pdf->GetY();
    $startX = $pdf->GetX();
    
    // Calculate the number of lines needed for each cell
    $lines1 = $pdf->NbLines($col_widths[0], $row[0]);
    $lines2 = $pdf->NbLines($col_widths[1], $row[1]);
    $max_lines = max($lines1, $lines2);
    
    // Calculate cell height based on max lines
    $cell_height = $max_lines * $line_height;
    
    // Draw the cells with proper height and left alignment
    $pdf->SetXY($startX, $startY);
    $pdf->MultiCell($col_widths[0], $line_height, $row[0], 1, 'L', $index == 0, 0);
    
    $pdf->SetXY($startX + $col_widths[0], $startY);
    $pdf->MultiCell($col_widths[1], $line_height, $row[1], 1, 'L', $index == 0, 0);
    
    // Draw additional border lines to ensure complete table structure
    $pdf->SetDrawColor(0, 0, 0);
    $pdf->Line($startX, $startY, $startX, $startY + $cell_height); // Left border
    $pdf->Line($startX + $col_widths[0], $startY, $startX + $col_widths[0], $startY + $cell_height); // Middle border
    $pdf->Line($startX + $col_widths[0] + $col_widths[1], $startY, $startX + $col_widths[0] + $col_widths[1], $startY + $cell_height); // Right border
    $pdf->Line($startX, $startY + $cell_height, $startX + $col_widths[0] + $col_widths[1], $startY + $cell_height); // Bottom border
    
    // Move to next row
    $pdf->SetY($startY + $cell_height);
}

$pdf->Ln(12); // Add gap between STANDARDS USED AND TRACEABILITY and EQUIPMENT USED sections

// Equipment table headers - aligned with MEASUREMENT RESULTS table (total 165mm)
$pdf->SetFont('Arial', 'B', 8); // Reduced font size for headers
$pdf->SetFillColor(243,243,243);
$pdf->Cell(40, 8, 'NAME OF STANDARD', 0, 0, 'C', true);
$pdf->Cell(40, 8, 'MAKE/MODEL', 0, 0, 'C', true);
$pdf->Cell(25, 8, 'SERIAL NO.', 0, 0, 'C', true);
$pdf->Cell(35, 8, 'MAXIMUM CAPACITY', 0, 0, 'C', true);
$pdf->Cell(25, 8, 'READABILITY', 0, 1, 'C', true);

// Equipment table data - aligned with MEASUREMENT RESULTS table
$pdf->SetFont('Arial', '', 10);
$pdf->Cell(40, 8, 'Mass Comparator', 1, 0, 'L');
$pdf->Cell(40, 8, 'Sartorius CCE60K2', 1, 0, 'L');
$pdf->Cell(25, 8, '28802669', 1, 0, 'C');
$pdf->Cell(35, 8, '64 kg', 1, 0, 'C');
$pdf->Cell(25, 8, '0.01 g', 1, 1, 'C');
$pdf->Cell(40, 8, 'Analytical Balance', 1, 0, 'L');
$pdf->Cell(40, 8, 'Sartorius MCM5004', 1, 0, 'L');
$pdf->Cell(25, 8, '44501027', 1, 0, 'C');
$pdf->Cell(35, 8, '5100 g', 1, 0, 'C');
$pdf->Cell(25, 8, '0.01 mg', 1, 1, 'C');

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'CALIBRATION PROCEDURE:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$pdf->MultiCell(0, 4.5, 'The procedure used is the calibration of mass standards with results in conventional mass by direct comparison using double substitution (ABBA) weighing. This technique involves the comparison of one weight with another of equal nominal value.', 0, 'L');

// Add second page
$pdf->AddPage();

// Second page header - same as page 1
// DOST Logo (left side)
$pdf->Image(__DIR__ . '/../../assets/dost_logo.png', 12, 12, 22);

// PAB Logo and Accreditation (right side, left position)
$pab_logo_path = __DIR__ . '/../../assets/pab_logo.png';
if (file_exists($pab_logo_path)) {
    $pdf->Image($pab_logo_path, 150, 12, 15); // PAB logo positioned on the left side of right area
}
$pdf->SetXY(150, 30);
$pdf->SetFont('Arial', 'B', 6);
$pdf->SetTextColor(0, 0, 0);
$pdf->Cell(15, 3, 'PAB ACCREDITED', 0, 1, 'C');
$pdf->SetX(150);
$pdf->Cell(15, 3, 'CALIBRATION LABORATORY', 0, 1, 'C');
$pdf->SetX(150);
$pdf->SetFont('Arial', '', 5);
$pdf->Cell(15, 3, 'PNS ISO/IEC 17025:2017', 0, 1, 'C');
$pdf->SetX(150);
$pdf->Cell(15, 3, 'LA-2014-2668', 0, 1, 'C');

// Bagong-Pilipinas Logo (right side, right position)
$bagong_pilipinas_logo_path = __DIR__ . '/../../assets/bagong_pilipinas_logo.png';
if (file_exists($bagong_pilipinas_logo_path)) {
    $pdf->Image($bagong_pilipinas_logo_path, 175, 12, 22); // Bagong-Pilipinas logo positioned on the right side
}

// Agency name and address - positioned right beside DOST logo
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
$pdf->Cell(0, 6, 'Regional Standards and Testing Laboratory', 0, 1, 'L');

// Horizontal line
$lineY = 42; // Moved line upward for more table space
$pdf->SetY($lineY);
$pdf->SetDrawColor(0,0,0);
$pdf->Line(12, $lineY, 198, $lineY);
$pdf->Ln(8);

// Second page content
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'MEASUREMENT CONDITIONS:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$pdf->MultiCell(0, 4.5, 'Prior to performing any calibration tests, the weights need to be acclimated to the ambient conditions of the laboratory. In particular, the sample was left close to the temperature in the weighing area for at least 24 hours.', 0, 'L');
$pdf->Ln(3);

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'ENVIRONMENTAL CONDITIONS:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$pdf->Cell(40, 6, 'Ambient Temperature :', 0, 0, 'L');
$pdf->Cell(20, 6, '23.0 °C', 0, 1, 'L');
$pdf->Cell(40, 6, 'Relative Humidity :', 0, 0, 'L');
$pdf->Cell(20, 6, '50.0 % RH', 0, 1, 'L');
$pdf->Ln(3);

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'REMARKS:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$pdf->Cell(5, 4, '1.', 0, 0, 'L');
$pdf->MultiCell(180, 4, 'The results given in this report are obtained at the time of the test and refer only to the particular instrument submitted. This report shall not be reproduced except in full, without the written approval of the laboratory.', 0, 'L');
$pdf->Cell(5, 4, '2.', 0, 0, 'L');
$pdf->MultiCell(180, 4, 'This instrument was calibrated using reference standard traceable to SI Units of measurement through National Metrology Laboratory.', 0, 'L');
$pdf->Cell(5, 4, '3.', 0, 0, 'L');
$pdf->MultiCell(180, 4, 'The End user should determine the suitability of equipment for it\'s intended use.', 0, 'L');
$pdf->Ln(10);

// Signatures section
$pdf->Ln(10); // Add some space before signatures

// Fetch calibrator details
$calibrator_name = 'JULIUS R. ALVIOR'; // Default fallback
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

// Left column - Calibrated by
$startY = $pdf->GetY();
$pdf->SetXY(20, $startY);
$pdf->SetFont('Arial', 'I', 9);
$pdf->Cell(70, 5, 'Calibrated by:', 0, 1, 'L');

$pdf->SetXY(20, $startY + 8); // Add space between label and name
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(70, 5, strtoupper($calibrator_name), 0, 1, 'L');

$pdf->SetXY(20, $startY + 16); // Add space between name and title
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(70, 5, ucfirst(strtolower($calibrator_title)), 0, 1, 'L');

// Right column - Certified by (moved downward)
$certifiedY = $startY + 20; // Move down by 20mm
$pdf->SetXY(120, $certifiedY);
$pdf->SetFont('Arial', 'I', 9);
$pdf->Cell(70, 5, 'Certified by:', 0, 1, 'L');

$pdf->SetXY(120, $certifiedY + 8); // Add space between label and name
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(70, 5, $technical_manager_name, 0, 1, 'L');

$pdf->SetXY(120, $certifiedY + 16); // Add space between name and title
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(70, 5, $technical_manager_title, 0, 1, 'L');

$pdf->SetXY(120, $certifiedY + 24); // Add space for PAB signatory
$pdf->Cell(70, 5, 'PAB Approved Signatory', 0, 1, 'L');

$pdf->Output('I', 'TestWeights_Certificate.pdf');
?>