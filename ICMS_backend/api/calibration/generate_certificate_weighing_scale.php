<?php
require_once __DIR__ . '/../../vendor/setasign/fpdf/fpdf.php';
include_once __DIR__ . '/../config/db.php';

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
            $this->Image($pab_logo_path, 150, 12, 15);
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
        $this->Cell(15, 3, 'LA-2017-388B', 0, 1, 'C');
        
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
        $this->Cell(0, 6, 'Regional Standards and Testing Laboratory', 0, 1, 'L');
        
        // Horizontal line
        $lineY = 42;
        $this->SetY($lineY);
        $this->SetDrawColor(0,0,0);
        $this->Line(12, $lineY, 198, $lineY);
        $this->Ln(8);
    }
    
    function Footer() {
        $left_margin = 20;
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
        $this->Cell(30, 5, 'Weighing-Scale', 0, 0, 'R');
    }
}

require_once __DIR__ . '/../config/cors.php';

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
$calibrator_name = 'MA. FERNANDA I BANDA'; // Default fallback
$calibrator_title = 'Calibration Engineer';
if ($record['calibrated_by']) {
    $calibrator_stmt = $db->prepare('SELECT first_name, last_name, role FROM users WHERE id = :id');
    $calibrator_stmt->bindParam(':id', $record['calibrated_by'], PDO::PARAM_INT);
    $calibrator_stmt->execute();
    $calibrator = $calibrator_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($calibrator) {
        $calibrator_name = strtoupper($calibrator['first_name'] . ' ' . $calibrator['last_name']);
        $calibrator_title = 'Calibration Engineer';
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

// Fetch sample details with comprehensive data
$sample_stmt = $db->prepare('SELECT * FROM sample WHERE id = :id');
$sample_stmt->bindParam(':id', $sample_id, PDO::PARAM_INT);
$sample_stmt->execute();
$sample = $sample_stmt->fetch(PDO::FETCH_ASSOC);

// Debug: Log sample data
error_log("Sample data: " . print_r($sample, true));

$ref_no = $sample['reservation_ref_no'] ?? '';
$section = $sample['section'] ?? '';
$type = $sample['type'] ?? '';
$range = $sample['range'] ?? '';
$serial_no = $sample['serial_no'] ?? '';
$make = $sample['make'] ?? $section; // Use make field if available, fallback to section
$model = $sample['model'] ?? $serial_no; // Use model field if available, fallback to serial_no
$capacity = $sample['capacity'] ?? $range; // Use capacity field if available, fallback to range
$graduation = $sample['graduation'] ?? '0.1 g'; // Use graduation field if available

// Debug: Log extracted sample fields
error_log("Extracted sample fields - ref_no: $ref_no, section: $section, type: $type, range: $range, serial_no: $serial_no");

// Fetch customer details with comprehensive data
$customer_name = 'N/A';
$customer_address = 'N/A';
$customer_company = 'N/A';
$customer_phone = 'N/A';
$customer_email = 'N/A';

if ($ref_no) {
    $reservation_stmt = $db->prepare('SELECT * FROM requests WHERE reference_number = :ref');
    $reservation_stmt->bindParam(':ref', $ref_no);
    $reservation_stmt->execute();
    $reservation = $reservation_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Debug: Log reservation data
    error_log("Reservation data: " . print_r($reservation, true));
    
    if ($reservation && isset($reservation['client_id'])) {
        $client_stmt = $db->prepare('SELECT * FROM clients WHERE id = :id');
        $client_stmt->bindParam(':id', $reservation['client_id'], PDO::PARAM_INT);
        $client_stmt->execute();
        $client = $client_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Debug: Log client data
        error_log("Client data: " . print_r($client, true));
        
        if ($client) {
            $customer_name = trim(($client['first_name'] ?? '') . ' ' . ($client['last_name'] ?? ''));
            $customer_company = $client['company'] ?? '';
            $customer_phone = $client['phone'] ?? '';
            $customer_email = $client['email'] ?? '';
            
            // Build comprehensive address
            $address_parts = [];
            if (!empty($client['barangay'])) $address_parts[] = $client['barangay'];
            if (!empty($client['city'])) $address_parts[] = $client['city'];
            if (!empty($client['province'])) $address_parts[] = $client['province'];
            
            $customer_address = implode(', ', $address_parts);
            if (empty($customer_address)) {
                $customer_address = $client['address'] ?? 'N/A';
            }
        }
    }
}

// Debug: Log final customer data
error_log("Final customer data - name: $customer_name, address: $customer_address, company: $customer_company");

// Debug: Log all certificate data
error_log("Certificate data - ref_no: $ref_no, serial_no: $serial_no, type: $type, section: $section, make: $make, model: $model, capacity: $capacity, graduation: $graduation");

$pdf = new PDF('P', 'mm', 'A4');
$pdf->SetMargins(19, 12, 19);
$left_margin = 19;
$pdf->AliasNbPages();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetY(45); // Move title up closer to horizontal line
$pdf->Cell(0, 10, 'CALIBRATION CERTIFICATE', 0, 1, 'C');
$pdf->Ln(1);

// Details section - Two column format
$pdf->SetFont('Arial', '', 8); // Increased from 7 to 8 for better readability
$leftX = 20; $topY = $pdf->GetY();
$rightX = 120; // Start of right column - moved slightly right

// Debug: Log the address data
error_log("Customer address data: " . $customer_address);

// Left column details
$leftDetails = [
    ['Customer', $customer_name],
    ['Address', $customer_address],
    ['Reference No.', $ref_no],
    ['Sample No.', $serial_no],
    ['Date Submitted', $record['date_started'] ? date('d M Y', strtotime($record['date_started'])) : ''],
    ['Date Calibrated', $record['date_completed'] ? date('d M Y', strtotime($record['date_completed'])) : date('d M Y', strtotime($record['created_at']))],
    ['Place of Calibration', 'DOST Regional Office No. I - RSTL'],
];

// Right column details - using comprehensive data
$rightDetails = [
    ['Particulars', $type],
    ['Type', $section],
    ['Make', $make],
    ['Model', $model],
    ['Serial No.', $serial_no],
    ['Capacity', $capacity],
    ['Graduation', $graduation],
];

// Function to wrap text properly
function wrapText($pdf, $x, $y, $width, $text, $lineHeight = 4) { // Increased from 3 to 4 for better readability
    // Clean the text first
    $text = trim($text);
    if (empty($text)) {
        return 0;
    }
    
    $words = explode(' ', $text);
    $lines = array();
    $currentLine = '';
    
    foreach ($words as $word) {
        $testLine = $currentLine . ($currentLine ? ' ' : '') . $word;
        $textWidth = $pdf->GetStringWidth($testLine);
        
        if ($textWidth <= $width) {
            $currentLine = $testLine;
        } else {
            if ($currentLine) {
                $lines[] = $currentLine;
                $currentLine = $word;
            } else {
                // If even a single word is too long, force break it
                if ($pdf->GetStringWidth($word) > $width) {
                    // Break the word by character if it's too long
                    $chars = str_split($word);
                    $currentWord = '';
                    foreach ($chars as $char) {
                        $testChar = $currentWord . $char;
                        if ($pdf->GetStringWidth($testChar) <= $width) {
                            $currentWord .= $char;
                        } else {
                            if ($currentWord) {
                                $lines[] = $currentWord;
                                $currentWord = $char;
                            } else {
                                $lines[] = $char;
                            }
                        }
                    }
                    if ($currentWord) {
                        $currentLine = $currentWord;
                    }
                } else {
                    $lines[] = $word;
                }
            }
        }
    }
    
    if ($currentLine) {
        $lines[] = $currentLine;
    }
    
    $currentY = $y;
    foreach ($lines as $line) {
        $pdf->SetXY($x, $currentY);
        $pdf->Cell($width, $lineHeight, $line, 0, 0, 'L');
        $currentY += $lineHeight;
    }
    
    return $currentY - $y; // Return height used
}

// Display both columns with proper text wrapping
$currentY = $topY;
$maxY = $topY; // Track the maximum Y position used

for ($i = 0; $i < count($leftDetails); $i++) {
    $leftRow = $leftDetails[$i];
    $rightRow = $rightDetails[$i];
    
    // Store current Y position
    $rowStartY = $currentY;
    
    // Display left column label
    $pdf->SetXY($leftX, $currentY);
    $pdf->Cell(30, 4, $leftRow[0] . ' :', 0, 0, 'L'); // Increased height from 3 to 4
    
    // Display left column value with compact text wrapping
    $leftHeight = wrapText($pdf, $leftX + 30, $currentY, 85, $leftRow[1]);
    
    // Display right column label
    $pdf->SetXY($rightX, $rowStartY);
    $pdf->Cell(30, 4, $rightRow[0] . ' :', 0, 0, 'L'); // Increased height from 3 to 4
    
    // Display right column value with compact text wrapping
    $rightHeight = wrapText($pdf, $rightX + 30, $rowStartY, 85, $rightRow[1]);
    
    // Move to the next row based on whichever column took more space
    $maxHeight = max($leftHeight, $rightHeight);
    $currentY = $rowStartY + $maxHeight + 0.5; // Increased spacing from 0.2 to 0.5
    
    // Update maxY for final positioning
    if ($currentY > $maxY) {
        $maxY = $currentY;
    }
}

// Set Y position after the details section
$pdf->SetY($maxY + 2); // Further reduced from 3 to 2

// Add margin before tables
$pdf->Ln(1); // Further reduced from 2 to 1
// Measurement Results
$pdf->SetFont('Arial', 'B', 10); // Increased from 9 to 10
$pdf->Cell(0, 6, 'MEASUREMENT RESULTS:', 0, 1, 'L'); // Increased height from 5 to 6
$pdf->SetFont('Arial', '', 9); // Increased from 8 to 9

// Repeatability Table - Compressed vertical format with 10 trials (2 columns of 5 each)
$pdf->Cell(0, 4, 'Repeatability', 0, 1, 'L'); // Increased height from 3 to 4
$pdf->SetFont('Arial', 'B', 8);

$repeatabilityReadings = $input_data['repeatabilityReadings'] ?? [];
$colWidths = [25, 45]; // Much wider width for Trial and Indication columns

// Left side header
$pdf->Cell($colWidths[0], 5, "Trial", 1, 0, 'C');
$pdf->Cell($colWidths[1], 5, "Indication (g)", 1, 0, 'C');
// Right side header
$pdf->Cell($colWidths[0], 5, "Trial", 1, 0, 'C');
$pdf->Cell($colWidths[1], 5, "Indication (g)", 1, 1, 'C');

$pdf->SetFont('Arial', '', 7);

// Display 10 trials in 2 columns (5 trials each)
for ($i = 0; $i < 5; $i++) {
    // Left side - trials 1-5
    $reading = isset($repeatabilityReadings[$i]) && is_numeric($repeatabilityReadings[$i]) ? number_format((float)$repeatabilityReadings[$i], 3) : '0.000';
    $pdf->Cell($colWidths[0], 5, ($i + 1), 1, 0, 'C');
    $pdf->Cell($colWidths[1], 5, $reading, 1, 0, 'C');
    
    // Right side - trials 6-10
    $rightIndex = $i + 5;
    $rightReading = isset($repeatabilityReadings[$rightIndex]) && is_numeric($repeatabilityReadings[$rightIndex]) ? number_format((float)$repeatabilityReadings[$rightIndex], 3) : '0.000';
    $pdf->Cell($colWidths[0], 5, ($rightIndex + 1), 1, 0, 'C');
    $pdf->Cell($colWidths[1], 5, $rightReading, 1, 1, 'C');
}

// Calculate standard deviation using all 10 readings
$stdDev = 0;
if (count($repeatabilityReadings) > 1) {
    $mean = array_sum($repeatabilityReadings) / count($repeatabilityReadings);
    $variance = array_sum(array_map(function($x) use ($mean) { return pow($x - $mean, 2); }, $repeatabilityReadings)) / (count($repeatabilityReadings) - 1);
    $stdDev = sqrt($variance);
}

$pdf->SetFont('Arial', 'B', 10); // Increased from 8 to 10 for bigger font
$pdf->Cell(0, 5, 'Std. Deviation: ' . (is_numeric($stdDev) ? number_format((float)$stdDev, 6) : '0.000000') . ' g', 0, 1, 'C'); // Center aligned without box
$pdf->Ln(0.5); // Increased from 0.2 to 0.5

// Eccentricity Table - Compact with diagram
$pdf->SetFont('Arial', '', 8); // Increased from 7 to 8
$pdf->Cell(0, 4, 'Eccentricity', 0, 1, 'L'); // Increased height from 3 to 4

// Start table and diagram side by side
$tableStartY = $pdf->GetY();
$tableX = 20;
$diagramX = 145; 

// Eccentricity Table
$pdf->SetFont('Arial', 'B', 7); 
$colWidths = [40, 40, 25]; 
$pdf->SetXY($tableX, $tableStartY);
$pdf->Cell($colWidths[0], 5, "Position", 1, 0, 'C'); 
$pdf->Cell($colWidths[1], 5, "Indication (g)", 1, 0, 'C'); 
$pdf->Cell($colWidths[2], 5, "Error (g)", 1, 1, 'C'); 
$pdf->SetFont('Arial', '', 7);

$eccRows = $input_data['eccRows'] ?? [];
$positions = ['Center', 'Front Left', 'Back Left', 'Back Right', 'Front Right', 'Center'];
for ($i = 0; $i < 6; $i++) {
    $indication = isset($eccRows[$i]['indication']) && is_numeric($eccRows[$i]['indication']) ? number_format((float)$eccRows[$i]['indication'], 3) : '0.000';
    $error = isset($eccRows[$i]['error']) && is_numeric($eccRows[$i]['error']) ? number_format((float)$eccRows[$i]['error'], 3) : '0.000';
    $pdf->SetXY($tableX, $pdf->GetY());
    $pdf->Cell($colWidths[0], 5, $positions[$i], 1, 0, 'C'); // Reduced height from 6 to 5
    $pdf->Cell($colWidths[1], 5, $indication, 1, 0, 'C'); // Reduced height from 6 to 5
    $pdf->Cell($colWidths[2], 5, $error, 1, 1, 'C'); // Reduced height from 6 to 5
}

// Draw eccentricity diagram
$diagramY = $tableStartY;
$pdf->SetXY($diagramX, $diagramY);

// Draw the platform outline (rounded square)
$platformX = $diagramX;
$platformY = $diagramY + 2; // Moved up from 8 to 2
$platformSize = 25; // Further reduced from 30 to 25 for smaller diagram

// Draw squircle (rounded square) for platform
$pdf->SetDrawColor(0, 0, 0);
$pdf->SetLineWidth(0.1);

// Draw squircle using improved method
$cornerRadius = 4; // Smaller radius for better proportions
$steps = 50; // More steps for smoother curve

// Draw rounded corners with better coverage
for ($i = 0; $i <= $steps; $i++) {
    $angle = $i * (M_PI/2) / $steps;
    
    // Top-left corner
    $x = $platformX + $cornerRadius - $cornerRadius * cos($angle);
    $y = $platformY + $cornerRadius - $cornerRadius * sin($angle);
    $pdf->Rect($x, $y, 0.1, 0.1);
    
    // Top-right corner
    $x2 = $platformX + $platformSize - $cornerRadius + $cornerRadius * cos($angle);
    $y2 = $platformY + $cornerRadius - $cornerRadius * sin($angle);
    $pdf->Rect($x2, $y2, 0.1, 0.1);
    
    // Bottom-left corner
    $x3 = $platformX + $cornerRadius - $cornerRadius * cos($angle);
    $y3 = $platformY + $platformSize - $cornerRadius + $cornerRadius * sin($angle);
    $pdf->Rect($x3, $y3, 0.1, 0.1);
    
    // Bottom-right corner
    $x4 = $platformX + $platformSize - $cornerRadius + $cornerRadius * cos($angle);
    $y4 = $platformY + $platformSize - $cornerRadius + $cornerRadius * sin($angle);
    $pdf->Rect($x4, $y4, 0.1, 0.1);
}

// Draw the straight edges with better coverage
// Top edge
for ($x = $platformX + $cornerRadius; $x < $platformX + $platformSize - $cornerRadius; $x += 0.1) {
    $pdf->Rect($x, $platformY, 0.1, 0.1);
}
// Bottom edge
for ($x = $platformX + $cornerRadius; $x < $platformX + $platformSize - $cornerRadius; $x += 0.1) {
    $pdf->Rect($x, $platformY + $platformSize - 0.1, 0.1, 0.1);
}
// Left edge
for ($y = $platformY + $cornerRadius; $y < $platformY + $platformSize - $cornerRadius; $y += 0.1) {
    $pdf->Rect($platformX, $y, 0.1, 0.1);
}
// Right edge
for ($y = $platformY + $cornerRadius; $y < $platformY + $platformSize - $cornerRadius; $y += 0.1) {
    $pdf->Rect($platformX + $platformSize - 0.1, $y, 0.1, 0.1);
}

// Draw circle inside for test area
$circleX = $platformX + 3; // Further adjusted for smaller diagram
$circleY = $platformY + 3; // Further adjusted for smaller diagram
$circleSize = $platformSize - 6; // Further adjusted for smaller diagram
$circleCenterX = $circleX + $circleSize/2;
$circleCenterY = $circleY + $circleSize/2;
$circleRadius = $circleSize/2;

// Draw circle using small rectangles (approximation)
$pdf->SetLineWidth(0.1);
for ($angle = 0; $angle < 360; $angle += 1.5) {
    $x = $circleCenterX + $circleRadius * cos(deg2rad($angle));
    $y = $circleCenterY + $circleRadius * sin(deg2rad($angle));
    $pdf->Rect($x, $y, 0.2, 0.2);
}

// Draw position points based on fetched data
$centerX = $circleX + $circleSize/2;
$centerY = $circleY + $circleSize/2;
$radius = $circleSize/2 - 4; // Further adjusted for smaller diagram

// Get eccentricity data from database
$eccRows = $input_data['eccRows'] ?? [];
$positions = ['Center', 'Front Left', 'Back Left', 'Back Right', 'Front Right', 'Center'];

// Draw positions based on actual data
for ($i = 0; $i < 5; $i++) { // Only draw first 5 positions (skip duplicate Center)
    $positionName = $positions[$i];
    $hasData = isset($eccRows[$i]) && isset($eccRows[$i]['indication']);
    
    // Calculate position coordinates
    if ($i == 0) { // Center
        $posX = $centerX;
        $posY = $centerY;
    } else { // Corner positions
        $angle = ($i - 1) * 90; // 0, 90, 180, 270 degrees
        $posX = $centerX + $radius * 0.7 * cos(deg2rad($angle));
        $posY = $centerY + $radius * 0.7 * sin(deg2rad($angle));
    }
    
    // Draw position number
    $pdf->SetXY($posX - 1, $posY - 1);
    $pdf->SetFont('Arial', 'B', 7);
    
    // Color code based on data availability
    if ($hasData) {
        $pdf->SetTextColor(0, 0, 0); // Black for positions with data
    } else {
        $pdf->SetTextColor(150, 150, 150); // Gray for positions without data
    }
    
    $pdf->Cell(2, 2, ($i + 1), 0, 0, 'C');
    
    // Reset text color
    $pdf->SetTextColor(0, 0, 0);
}

// Legend - positioned to the right of the diagram with data status
$legendX = $diagramX + $platformSize + 5; // Further adjusted for smaller diagram
$legendY = $platformY;
$pdf->SetXY($legendX, $legendY);
$pdf->SetFont('Arial', '', 7);

// Draw legend
for ($i = 0; $i < 5; $i++) {
    $positionName = $positions[$i];
    
    $pdf->SetXY($legendX, $legendY + ($i * 4));
    $pdf->Cell(0, 4, ($i + 1) . ' - ' . $positionName, 0, 1, 'L');
}

// Add title below the diagram
$titleY = $platformY + $platformSize + 5;
$pdf->SetXY($diagramX, $titleY);
$pdf->SetFont('Arial', 'B', 8);
$pdf->Cell(0, 6, 'Positions on eccentricity test', 0, 1, 'L');

// Move to next section
$pdf->SetY(max($tableStartY + 6 * 6 + 5, $titleY + 5)); // Reduced spacing to move Linearity table upward
$pdf->Ln(0.5); // Reduced spacing

// Linearity Table - Compact
$pdf->SetFont('Arial', '', 8); // Increased from 7 to 8
$pdf->Cell(0, 4, 'Linearity', 0, 1, 'L'); // Increased height from 3 to 4
$pdf->SetFont('Arial', 'B', 8); // Increased from 7 to 8
$colWidths = [25, 35, 30, 25, 35]; // Increased column widths for wider table
$pdf->Cell($colWidths[0], 5, "No.", 1, 0, 'C'); // Reduced height from 6 to 5
$pdf->Cell($colWidths[1], 5, "Load (g)", 1, 0, 'C'); // Reduced height from 6 to 5
$pdf->Cell($colWidths[2], 5, "Indication (g)", 1, 0, 'C'); // Reduced height from 6 to 5
$pdf->Cell($colWidths[3], 5, "Error (g)", 1, 0, 'C'); // Reduced height from 6 to 5
$pdf->Cell($colWidths[4], 5, "Uncertainty (g)", 1, 1, 'C'); // Reduced height from 6 to 5
$pdf->SetFont('Arial', '', 7); // Increased from 6 to 7

$linearityResults = $input_data['linearityResults'] ?? [];
for ($i = 0; $i < 6; $i++) {
    $load = isset($linearityResults[$i]['load']) && is_numeric($linearityResults[$i]['load']) ? number_format((float)$linearityResults[$i]['load'], 3) : '0.000'; // Reduced decimal places
    $indication = isset($linearityResults[$i]['indication']) && is_numeric($linearityResults[$i]['indication']) ? number_format((float)$linearityResults[$i]['indication'], 3) : '0.000';
    $error = isset($linearityResults[$i]['error']) && is_numeric($linearityResults[$i]['error']) ? number_format((float)$linearityResults[$i]['error'], 3) : '0.000';
    $uncertainty = isset($result_data['U_expanded']) && is_numeric($result_data['U_expanded']) ? number_format((float)$result_data['U_expanded'], 4) : '0.0000'; // Reduced decimal places
    $pdf->Cell($colWidths[0], 5, ($i + 1), 1, 0, 'C'); // Reduced height from 6 to 5
    $pdf->Cell($colWidths[1], 5, $load, 1, 0, 'C'); // Reduced height from 6 to 5
    $pdf->Cell($colWidths[2], 5, $indication, 1, 0, 'C'); // Reduced height from 6 to 5
    $pdf->Cell($colWidths[3], 5, $error, 1, 0, 'C'); // Reduced height from 6 to 5
    $pdf->Cell($colWidths[4], 5, $uncertainty, 1, 1, 'C'); // Reduced height from 6 to 5
}
$pdf->Ln(0.5); // Further reduced spacing

// Linearity Graph - Aligned with table
$graphStartY = $pdf->GetY() + 0.5; // Further reduced from 1 to 0.5
$graphX = 20; // Same as table start position
$graphY = $graphStartY;
$graphWidth = 150; // Match table width (25+35+30+25+35 = 150)
$graphHeight = 40; // Further reduced from 45 to 40 for maximum compactness

// Draw graph border
$pdf->SetDrawColor(0, 0, 0);
$pdf->SetLineWidth(0.2);
$pdf->Rect($graphX, $graphY, $graphWidth, $graphHeight);

// Draw axes
$pdf->Line($graphX + 20, $graphY + $graphHeight - 10, $graphX + $graphWidth - 10, $graphY + $graphHeight - 10); // X-axis
$pdf->Line($graphX + 20, $graphY + 10, $graphX + 20, $graphY + $graphHeight - 10); // Y-axis

// Draw axis labels
$pdf->SetFont('Arial', 'B', 9); // Smaller font size
$pdf->SetXY($graphX + $graphWidth/2 - 20, $graphY + $graphHeight - 2);
$pdf->Cell(40, 4, 'Load (g)', 0, 0, 'C');

$pdf->SetXY($graphX + 5, $graphY + $graphHeight/2 - 15);
$pdf->Cell(15, 4, 'Error (g)', 0, 0, 'C');

// Draw Y-axis labels
$maxError = 0;
$minError = 0;
if (!empty($linearityResults)) {
    $errors = array_column($linearityResults, 'error');
    $errors = array_filter($errors, function($val) { return $val !== null && $val !== ''; }); // Remove null/empty values
    
    if (!empty($errors)) {
        $maxError = max($errors);
        $minError = min($errors);
        $errorRange = $maxError - $minError;
        if ($errorRange == 0) $errorRange = 1; // Avoid division by zero
    } else {
        $errorRange = 1;
    }
} else {
    $errorRange = 1;
}

// Y-axis scale
$pdf->SetFont('Arial', '', 8); // Larger font for Y-axis labels
$yScale = ($graphHeight - 20) / $errorRange;
for ($i = 0; $i <= 5; $i++) {
    $value = $minError + ($errorRange * $i / 5);
    $y = $graphY + $graphHeight - 10 - ($i * ($graphHeight - 20) / 5);
    $pdf->SetXY($graphX + 15, $y - 2);
    $pdf->Cell(10, 4, is_numeric($value) ? number_format((float)$value, 3) : '0.000', 0, 0, 'R');
    
    // Draw horizontal grid line
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->Line($graphX + 20, $y, $graphX + $graphWidth - 10, $y);
    $pdf->SetDrawColor(0, 0, 0);
}

// Draw X-axis labels and data points
$maxLoad = 0;
if (!empty($linearityResults)) {
    $loads = array_column($linearityResults, 'load');
    $loads = array_filter($loads, function($val) { return $val !== null && $val !== ''; }); // Remove null/empty values
    
    if (!empty($loads)) {
        $maxLoad = max($loads);
        if ($maxLoad == 0) $maxLoad = 1; // Avoid division by zero
    } else {
        $maxLoad = 1;
    }
} else {
    $maxLoad = 1;
}

$xScale = ($graphWidth - 30) / $maxLoad;

// Draw data points and connecting line
$pdf->SetDrawColor(0, 0, 255); // Blue for data points and line
$pdf->SetLineWidth(0.5); // Thicker line for visibility

$points = [];
for ($i = 0; $i < count($linearityResults); $i++) {
    if (isset($linearityResults[$i]['load']) && isset($linearityResults[$i]['error'])) {
        $load = $linearityResults[$i]['load'];
        $error = $linearityResults[$i]['error'];
        
        $x = $graphX + 20 + ($load * $xScale);
        $y = $graphY + $graphHeight - 10 - (($error - $minError) * $yScale);
        
        $points[] = ['x' => $x, 'y' => $y];
        
        // Draw data point as small circle
        for ($angle = 0; $angle < 360; $angle += 10) {
            $px = $x + 1.5 * cos(deg2rad($angle));
            $py = $y + 1.5 * sin(deg2rad($angle));
            $pdf->Rect($px, $py, 0.3, 0.3);
        }
    }
}

// Draw connecting line between data points
if (count($points) > 1) {
    for ($i = 0; $i < count($points) - 1; $i++) {
        $pdf->Line($points[$i]['x'], $points[$i]['y'], $points[$i + 1]['x'], $points[$i + 1]['y']);
    }
}

// Draw shaded area under the linearity line
if (count($points) > 1) {
    $pdf->SetFillColor(200, 230, 255); // Light blue shading
    
    // Draw the shaded area using multiple small rectangles
    $stepSize = 1; // Smaller steps for smoother shading
    for ($x = $graphX + 20; $x < $graphX + $graphWidth - 10; $x += $stepSize) {
        // Find the Y value at this X position
        $yValue = $graphY + $graphHeight - 10; // Default to bottom
        
        // Check which segment this X falls into
        for ($i = 0; $i < count($points) - 1; $i++) {
            if ($x >= $points[$i]['x'] && $x <= $points[$i + 1]['x']) {
                // Linear interpolation
                if ($points[$i + 1]['x'] != $points[$i]['x']) {
                    $ratio = ($x - $points[$i]['x']) / ($points[$i + 1]['x'] - $points[$i]['x']);
                    $yValue = $points[$i]['y'] + $ratio * ($points[$i + 1]['y'] - $points[$i]['y']);
                } else {
                    $yValue = $points[$i]['y'];
                }
                break;
            }
        }
        
        // Draw small rectangle from bottom to line
        $height = ($graphY + $graphHeight - 10) - $yValue;
        if ($height > 0) {
            $pdf->Rect($x, $yValue, $stepSize, $height, 'F');
        }
    }
}

// Reset line width for other elements
$pdf->SetLineWidth(0.2);

// Draw X-axis scale
$pdf->SetFont('Arial', '', 8); // Larger font for X-axis labels
for ($i = 0; $i <= 5; $i++) {
    $value = ($maxLoad * $i / 5);
    $x = $graphX + 20 + ($i * ($graphWidth - 30) / 5);
    $pdf->SetXY($x - 10, $graphY + $graphHeight - 5);
    $pdf->Cell(20, 4, is_numeric($value) ? number_format((float)$value, 1) : '0.0', 0, 0, 'C');
    
    // Draw vertical grid line
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->Line($x, $graphY + 10, $x, $graphY + $graphHeight - 10);
    $pdf->SetDrawColor(0, 0, 0);
}

// Reset colors
$pdf->SetDrawColor(0, 0, 0);
$pdf->SetTextColor(0, 0, 0);

$pdf->Ln(2); // Reduced space after graph

// End of page 1 - move remaining content to page 2
$pdf->AddPage();

// Uncertainty Statement
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'UNCERTAINTY OF MEASUREMENT:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$pdf->MultiCell(0, 5, 'The expanded uncertainty is obtained by multiplying the standard uncertainty by a coverage factor k=2, in accordance with the "Guide to the Expression of Uncertainty (GUM)". The value of the measurand lies within the assigned range of values with a probability of 95%.', 0, 'L');
$pdf->Ln(3);

// Standards Used
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'STANDARDS USED AND TRACEABILITY:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$pdf->Cell(0, 5, '• Mettler Toledo (Class F1 set) 15981', 0, 1, 'L');
$pdf->Cell(0, 5, '• Hafner (Class E2 set) 1131018', 0, 1, 'L');
$pdf->Ln(3);

// Calibration Procedure
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'CALIBRATION PROCEDURE:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$pdf->MultiCell(0, 5, 'The procedure is based on "EURAMET cg-18, Guidelines on the Calibration of Non-Automatic Weighing Instruments."', 0, 'L');
$pdf->Ln(3);

// Environmental Conditions
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'ENVIRONMENTAL CONDITIONS:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$temp = $input_data['equipment']['tempStart'] ?? '23.0';
$humidity = $input_data['equipment']['humidityStart'] ?? '45';
$pdf->Cell(40, 6, 'Ambient Temperature :', 0, 0, 'L');
$pdf->Cell(20, 6, $temp . ' °C', 0, 1, 'L');
$pdf->Cell(40, 6, 'Relative Humidity :', 0, 0, 'L');
$pdf->Cell(20, 6, $humidity . ' % RH', 0, 1, 'L');
$pdf->Ln(3);

// Remarks
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'REMARKS:', 0, 1, 'L');
$pdf->SetFont('Arial', '', 10);
$pdf->MultiCell(0, 5, "1. The results given in this report are obtained at the time of the test and refer only to the particular instrument submitted. This report shall not be reproduced except in full, without the written approval of the laboratory.\n2. This instrument was calibrated using reference standard traceable to SI Units of measurement through National Metrology Laboratory.\n3. The End user should determine the suitability of equipment for it's intended use.", 0, 'L');
$pdf->Ln(10);

// SIGNATURE BLOCKS
$pdf->Ln(5);

// Get starting Y position for both columns
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
$certifiedY = $startY + 20;
$pdf->SetXY(120, $certifiedY);
$pdf->SetFont('Arial', 'I', 9);
$pdf->Cell(70, 5, 'Certified by:', 0, 1, 'L');

$pdf->SetXY(120, $certifiedY + 8);
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(70, 5, $technical_manager_name, 0, 1, 'L');

$pdf->SetXY(120, $certifiedY + 16);
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(70, 5, $technical_manager_title, 0, 1, 'L');

$pdf->SetXY(120, $certifiedY + 24);
$pdf->Cell(70, 5, 'PAB Approved Signatory', 0, 1, 'L');

$pdf->Output('I', 'WeighingScale_Certificate.pdf');
exit();
?>
