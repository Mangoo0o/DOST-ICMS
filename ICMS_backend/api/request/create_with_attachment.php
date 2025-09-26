<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers, Access-Control-Allow-Methods');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';
require_once '../auth/verify_token.php';
require_once '../services/EmailService.php';

// Enable error reporting for diagnostics
ini_set('display_errors', 1);
error_reporting(E_ALL);

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503);
    echo json_encode(['message' => 'Database connection failed.']);
    exit();
}

// Expecting multipart/form-data with fields:
// client_id (optional for attach flow), address (optional), date_scheduled (optional, YYYY-MM-DD),
// date_expected_completion (optional, YYYY-MM-DD), status (optional), samples (JSON array),
// attachment (file)

$client_id = $_POST['client_id'] ?? null;
$address = $_POST['address'] ?? null;
$date_scheduled = !empty($_POST['date_scheduled']) ? $_POST['date_scheduled'] : null;
$date_expected_completion = !empty($_POST['date_expected_completion']) ? $_POST['date_expected_completion'] : null;
$status = $_POST['status'] ?? 'pending';
$attachment_text = isset($_POST['attachment_text']) ? trim($_POST['attachment_text']) : null;
$samplesJson = $_POST['samples'] ?? '[]';

// Optional parsed fields from PDF (client and address)
$client_name = $_POST['client_name'] ?? null;
$first_name_in = $_POST['first_name'] ?? null;
$last_name_in = $_POST['last_name'] ?? null;
$age_in = $_POST['age'] ?? null;
$client_contact_number = $_POST['client_contact_number'] ?? null;
$client_email = $_POST['client_email'] ?? null;
$client_company = $_POST['client_company'] ?? null;
$client_industry_type = $_POST['client_industry_type'] ?? null;
$client_company_head = $_POST['client_company_head'] ?? null;

// Treat 'N/A' or empty strings as nulls
$normalize = function($v) {
    if (!isset($v)) return null;
    $t = trim((string)$v);
    if ($t === '' || strcasecmp($t, 'N/A') === 0) return null;
    return $t;
};
$client_name = $normalize($client_name);
$first_name_in = $normalize($first_name_in);
$last_name_in = $normalize($last_name_in);
$age_in = $normalize($age_in);
$client_contact_number = $normalize($client_contact_number);
$client_email = $normalize($client_email);
$client_company = $normalize($client_company);
$client_industry_type = $normalize($client_industry_type);
$client_company_head = $normalize($client_company_head);

$province = $normalize($_POST['province'] ?? null);
$city = $normalize($_POST['city'] ?? null);
$barangay = $normalize($_POST['barangay'] ?? null);

// If address not provided but components are, construct address string
if (empty($address)) {
    $parts = [];
    if (!empty($barangay)) { $parts[] = $barangay; }
    if (!empty($city)) { $parts[] = $city; }
    if (!empty($province)) { $parts[] = $province; }
    if (!empty($parts)) {
        $address = implode(', ', $parts);
    }
}

// Normalize dates to DATETIME if only date provided
if (!empty($date_scheduled) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_scheduled)) {
    $date_scheduled .= ' 00:00:00';
}
if (!empty($date_expected_completion) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_expected_completion)) {
    $date_expected_completion .= ' 00:00:00';
}

// If client_id not provided, try to derive from JWT (client role). If not a client or no token, proceed with NULL.
if (empty($client_id)) {
    try {
        $userData = verifyToken();
        if (!empty($userData) && isset($userData->role) && $userData->role === 'client' && isset($userData->id)) {
            $client_id = $userData->id;
        }
    } catch (Exception $e) {
        // no-op; allow NULL client_id
    }
}

// If still no client_id and we have client information, try to resolve existing client or create new one
if (empty($client_id) && (!empty($client_email) || !empty($client_name) || !empty($first_name_in) || !empty($last_name_in) || !empty($client_contact_number))) {
    try {
        // Try to find existing client by multiple criteria to prevent duplicates
        $existingClientId = null;
        
        // 1. Check by email first (most reliable)
        if (!empty($client_email) && filter_var($client_email, FILTER_VALIDATE_EMAIL)) {
        $resolve = $db->prepare("SELECT id FROM clients WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) LIMIT 1");
        $resolve->execute([$client_email]);
        $row = $resolve->fetch(PDO::FETCH_ASSOC);
        if ($row && isset($row['id'])) {
                $existingClientId = $row['id'];
                $client_id = $existingClientId;
                error_log('[create_with_attachment] Found existing client with email: ' . $client_email . ', ID: ' . $existingClientId);
            }
        }
        
        // 2. If no email match, check by phone number
        if (!$existingClientId && !empty($client_contact_number)) {
            // Normalize phone number (remove spaces, dashes, parentheses)
            $normalized_phone = preg_replace('/[\s\-\(\)]/', '', $client_contact_number);
            $resolve = $db->prepare("SELECT id FROM clients WHERE REPLACE(REPLACE(REPLACE(contact_number, ' ', ''), '-', ''), '(', '') = ? LIMIT 1");
            $resolve->execute([$normalized_phone]);
            $row = $resolve->fetch(PDO::FETCH_ASSOC);
            if ($row && isset($row['id'])) {
                $existingClientId = $row['id'];
                $client_id = $existingClientId;
                error_log('[create_with_attachment] Found existing client with phone: ' . $client_contact_number . ', ID: ' . $existingClientId);
            }
        }
        
        // 3. If still no match, check by name (first name + last name)
        if (!$existingClientId && (!empty($first_name_val) || !empty($last_name_val))) {
            $name_query = "SELECT id FROM clients WHERE ";
            $name_params = [];
            
            if (!empty($first_name_val) && !empty($last_name_val)) {
                $name_query .= "LOWER(TRIM(CONCAT(first_name, ' ', last_name))) = LOWER(TRIM(?))";
                $name_params[] = trim($first_name_val . ' ' . $last_name_val);
            } elseif (!empty($first_name_val)) {
                $name_query .= "LOWER(TRIM(first_name)) = LOWER(TRIM(?))";
                $name_params[] = $first_name_val;
            } elseif (!empty($last_name_val)) {
                $name_query .= "LOWER(TRIM(last_name)) = LOWER(TRIM(?))";
                $name_params[] = $last_name_val;
            }
            
            if (!empty($name_params)) {
                $name_query .= " LIMIT 1";
                $resolve = $db->prepare($name_query);
                $resolve->execute($name_params);
                $row = $resolve->fetch(PDO::FETCH_ASSOC);
                if ($row && isset($row['id'])) {
                    $existingClientId = $row['id'];
                    $client_id = $existingClientId;
                    error_log('[create_with_attachment] Found existing client with name: ' . implode(' ', $name_params) . ', ID: ' . $existingClientId);
                }
            }
        }
        
        // 4. If still no match, check by company name
        if (!$existingClientId && !empty($client_company)) {
            $resolve = $db->prepare("SELECT id FROM clients WHERE LOWER(TRIM(company)) = LOWER(TRIM(?)) LIMIT 1");
            $resolve->execute([$client_company]);
            $row = $resolve->fetch(PDO::FETCH_ASSOC);
            if ($row && isset($row['id'])) {
                $existingClientId = $row['id'];
                $client_id = $existingClientId;
                error_log('[create_with_attachment] Found existing client with company: ' . $client_company . ', ID: ' . $existingClientId);
            }
        }
        
        // If we found an existing client, update it with any new information
        if ($existingClientId) {
            error_log('[create_with_attachment] Updating existing client ID: ' . $existingClientId . ' with new information');
            
            // Update client with any new information provided
            $update_fields = [];
            $update_params = [];
            
            if (!empty($first_name_val)) {
                $update_fields[] = "first_name = ?";
                $update_params[] = $first_name_val;
            }
            if (!empty($last_name_val)) {
                $update_fields[] = "last_name = ?";
                $update_params[] = $last_name_val;
            }
            if (!empty($client_email) && filter_var($client_email, FILTER_VALIDATE_EMAIL)) {
                $update_fields[] = "email = ?";
                $update_params[] = $client_email;
            }
            if (!empty($client_contact_number)) {
                $update_fields[] = "contact_number = ?";
                $update_params[] = $client_contact_number;
            }
            if (!empty($client_company)) {
                $update_fields[] = "company = ?";
                $update_params[] = $client_company;
            }
            if (!empty($province)) {
                $update_fields[] = "province = ?";
                $update_params[] = $province;
            }
            if (!empty($city)) {
                $update_fields[] = "city = ?";
                $update_params[] = $city;
            }
            if (!empty($barangay)) {
                $update_fields[] = "barangay = ?";
                $update_params[] = $barangay;
            }
            
            if (!empty($update_fields)) {
                $update_params[] = $existingClientId;
                $update_sql = "UPDATE clients SET " . implode(', ', $update_fields) . " WHERE id = ?";
                $update_stmt = $db->prepare($update_sql);
                $update_result = $update_stmt->execute($update_params);
                
                if ($update_result) {
                    error_log('[create_with_attachment] Successfully updated existing client with new information');
        } else {
                    error_log('[create_with_attachment] Failed to update existing client: ' . json_encode($update_stmt->errorInfo()));
                }
            }
        }
        
        // If no existing client found, create a new one
        if (!$existingClientId) {
            // Create a minimal client using available fields (at least email)
            $existingCols = [];
            $colStmt = $db->prepare("SHOW COLUMNS FROM clients");
            $colStmt->execute();
            foreach ($colStmt->fetchAll(PDO::FETCH_ASSOC) as $c) {
                $existingCols[$c['Field']] = true;
            }

            $first_name_val = $first_name_in;
            $last_name_val = $last_name_in;
            if (!$first_name_val && !$last_name_val && !empty($client_name)) {
                $nameParts = preg_split('/\s+/', trim($client_name));
                if ($nameParts && count($nameParts) > 1) {
                    $last_name_val = array_pop($nameParts);
                    $first_name_val = implode(' ', $nameParts);
                } else {
                    $first_name_val = $client_name;
                }
            }

            $toInsert = [];
            // Required NOT NULL fields with defaults
            if (isset($existingCols['first_name'])) { $toInsert['first_name'] = $first_name_val ?: ''; }
            if (isset($existingCols['last_name'])) { $toInsert['last_name'] = $last_name_val ?: ''; }
            if (isset($existingCols['age'])) { $toInsert['age'] = $age_in ?: 0; }
            if (isset($existingCols['gender'])) { $toInsert['gender'] = 'other'; }
            if (isset($existingCols['province'])) { $toInsert['province'] = $province ?: ''; }
            if (isset($existingCols['city'])) { $toInsert['city'] = $city ?: ''; }
            if (isset($existingCols['barangay'])) { $toInsert['barangay'] = $barangay ?: ''; }
            if (isset($existingCols['contact_number'])) { $toInsert['contact_number'] = $client_contact_number ?: ''; }
            if (isset($existingCols['email'])) { $toInsert['email'] = $client_email ?: ''; }
            if (isset($existingCols['company'])) { $toInsert['company'] = $client_company ?: ''; }
            if (isset($existingCols['industry_type'])) { $toInsert['industry_type'] = ''; }
            if (isset($existingCols['service_line'])) { $toInsert['service_line'] = ''; }
            if (isset($existingCols['company_head'])) { $toInsert['company_head'] = ''; }
            if (isset($existingCols['password'])) {
                try {
                    $plain = bin2hex(random_bytes(6));
                } catch (Throwable $e) {
                    $plain = substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'), 0, 10);
                }
                $toInsert['password'] = password_hash($plain, PASSWORD_BCRYPT);
            }

            if (!empty($toInsert)) {
                error_log('[create_with_attachment] Creating client with data: ' . json_encode($toInsert));
                $fields = array_keys($toInsert);
                $placeholders = array_fill(0, count($fields), '?');
                $params = array_values($toInsert);
                $sql = "INSERT INTO clients (" . implode(',', $fields) . ") VALUES (" . implode(',', $placeholders) . ")";
                error_log('[create_with_attachment] SQL: ' . $sql);
                error_log('[create_with_attachment] Params: ' . json_encode($params));
                
                $ins = $db->prepare($sql);
                $result = $ins->execute($params);
                if ($result) {
                $client_id = $db->lastInsertId();
                    error_log('[create_with_attachment] Client created successfully with ID: ' . $client_id);
                } else {
                    error_log('[create_with_attachment] Client creation failed: ' . json_encode($ins->errorInfo()));
                }

                // Send welcome email with credentials if we have a real email and generated password
                try {
                    if (!empty($client_email) && filter_var($client_email, FILTER_VALIDATE_EMAIL) && isset($plain)) {
                        $fname = isset($toInsert['first_name']) ? $toInsert['first_name'] : '';
                        $lname = isset($toInsert['last_name']) ? $toInsert['last_name'] : '';
                        $fullName = trim($fname . ' ' . $lname);
                        if (!empty($fullName)) {
                            $emailService = new EmailService();
                            $emailService->sendClientWelcomeEmail($client_email, $fullName, $plain);
                            error_log('[create_with_attachment] Welcome email sent to: ' . $client_email);
                        }
                    }
                } catch (Throwable $e) {
                    error_log('[create_with_attachment] Welcome email failed: ' . $e->getMessage());
                }
            }
        }
    } catch (Exception $e) {
        error_log('[create_with_attachment] Exception in client creation: ' . $e->getMessage());
        // Continue without client_id - don't fail the entire request
    }
}

// If still no client_id and we have basic identity (customer name, contact number, or email), create a minimal client
error_log('[create_with_attachment] Checking for client creation - client_id: ' . ($client_id ?: 'null') . ', client_name: ' . ($client_name ?: 'null') . ', client_contact_number: ' . ($client_contact_number ?: 'null') . ', client_email: ' . ($client_email ?: 'null'));
// Note: Client creation logic is handled above in the email-based block

$samples = json_decode($samplesJson, true);
// Debug log received samples payload size/content (truncated)
if ($samplesJson) {
    $logPreview = substr($samplesJson, 0, 500);
    error_log('[create_with_attachment] samplesJson preview: ' . $logPreview);
}
if ($samplesJson !== '[]' && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid samples JSON']);
    exit();
}

$external_reference_number = isset($_POST['external_reference_number']) ? trim($_POST['external_reference_number']) : null;
$incoming_reference_number = isset($_POST['reference_number']) ? trim($_POST['reference_number']) : null;
$pdf_reference_number = isset($_POST['pdf_reference_number']) ? trim($_POST['pdf_reference_number']) : null;

// Debug: Log all POST data for reference numbers
error_log('[create_with_attachment] DEBUG - All POST data: ' . print_r($_POST, true));
error_log('[create_with_attachment] DEBUG - client_email received: ' . ($client_email ?: 'null'));
error_log('[create_with_attachment] DEBUG - client_company received: ' . ($client_company ?: 'null'));

try {
    $db->beginTransaction();

    // Use the external reference number from the PDF if provided; otherwise auto-generate
    if (!empty($incoming_reference_number) || !empty($external_reference_number) || !empty($pdf_reference_number)) {
        // Ensure it does not already exist
        $providedRef = null;
        if (!empty($incoming_reference_number)) {
            $providedRef = $incoming_reference_number;
        } elseif (!empty($external_reference_number)) {
            $providedRef = $external_reference_number;
        } else {
            $providedRef = $pdf_reference_number;
        }
        error_log('[create_with_attachment] provided reference_number candidate: ' . $providedRef);
        error_log('[create_with_attachment] incoming_reference_number: ' . ($incoming_reference_number ?: 'null'));
        error_log('[create_with_attachment] external_reference_number: ' . ($external_reference_number ?: 'null'));
        error_log('[create_with_attachment] pdf_reference_number: ' . ($pdf_reference_number ?: 'null'));
        $chk = $db->prepare("SELECT COUNT(*) FROM requests WHERE reference_number = ?");
        $chk->execute([$providedRef]);
        if ((int)$chk->fetchColumn() > 0) {
            $db->rollBack();
            http_response_code(409);
            echo json_encode(['message' => 'Reference number already exists.']);
            exit();
        }
        $reference_number = $providedRef;
        error_log('[create_with_attachment] final reference_number to be saved: ' . $reference_number);
    } else {
        // Generate a unique reference number similar to create_reservation.php
        $date_part = date('Ymd');
        $stmt = $db->prepare("SELECT reference_number FROM requests WHERE reference_number LIKE ? ORDER BY reference_number DESC LIMIT 1");
        $like = "REF-{$date_part}-%";
        $stmt->execute([$like]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && preg_match('/REF-' . $date_part . '-(\d{4})/', $row['reference_number'], $matches)) {
            $lastCounter = intval($matches[1]);
            $newCounter = $lastCounter + 1;
        } else {
            $newCounter = 1;
        }
        $reference_number = "REF-{$date_part}-" . str_pad($newCounter, 4, '0', STR_PAD_LEFT);
    }

    // Insert request (client_id may be NULL if not provided and not derivable)
    // Do NOT store attachment_text in remarks; only populate existing columns

// Try to detect if requests table has an external_reference_number column
$hasExternalRef = false;
// Since we know the table doesn't have this column, set it to false
$hasExternalRef = false;

error_log('[create_with_attachment] Reached request insertion section, hasExternalRef: ' . ($hasExternalRef ? 'true' : 'false'));

// Insert request without external_reference_number column
error_log('[create_with_attachment] About to insert request with reference_number: ' . $reference_number . ', client_id: ' . ($client_id ?: 'null'));
$stmt = $db->prepare(
    "INSERT INTO requests (client_id, reference_number, address, status, date_created, date_scheduled, date_expected_completion)
         VALUES (?, ?, ?, ?, NOW(), ?, ?)"
);
$stmt->execute([
    $client_id ?: null,
    $reference_number,
    $address,
    $status,
    $date_scheduled,
    $date_expected_completion
]);
error_log('[create_with_attachment] Request inserted successfully with ID: ' . $db->lastInsertId());

    // If we have client fields and a clients table with a matching record, update basic profile fields
    error_log('[create_with_attachment] Client update check - client_id: ' . ($client_id ?: 'null') . ', client_name: ' . ($client_name ?: 'null') . ', client_contact_number: ' . ($client_contact_number ?: 'null') . ', client_email: ' . ($client_email ?: 'null'));
    if (!empty($client_id) && (!empty($client_name) || !empty($client_contact_number) || !empty($client_email) || !empty($province) || !empty($city) || !empty($barangay))) {
        try {
            // Update only columns that exist; prefer explicit first_name/last_name, else split client_name
            $first_name_val = $first_name_in;
            $last_name_val = $last_name_in;
            if (!$first_name_val && !$last_name_val && !empty($client_name)) {
                $nameParts = preg_split('/\s+/', trim($client_name));
                if ($nameParts && count($nameParts) > 1) {
                    $last_name_val = array_pop($nameParts);
                    $first_name_val = implode(' ', $nameParts);
                } else {
                    $first_name_val = $client_name;
                }
            }

            $cols = [
                'first_name' => $first_name_val,
                'last_name' => $last_name_val,
                'contact_number' => $client_contact_number,
                'email' => $client_email,
                'province' => $province,
                'city' => $city,
                'barangay' => $barangay,
                'age' => $age_in !== null && $age_in !== '' ? intval($age_in) : null,
            ];
            error_log('[create_with_attachment] Client update - email value: ' . ($client_email ?: 'null'));
            $existingCols = [];
            $colStmt = $db->prepare("SHOW COLUMNS FROM clients");
            $colStmt->execute();
            foreach ($colStmt->fetchAll(PDO::FETCH_ASSOC) as $c) {
                $existingCols[$c['Field']] = true;
            }
            $setParts = [];
            $params = [];
            foreach ($cols as $field => $value) {
                if (isset($existingCols[$field]) && $value !== null && $value !== '') {
                    $setParts[] = "$field = ?";
                    $params[] = $value;
                }
            }
            if (!empty($setParts)) {
                $params[] = $client_id;
                $upd = $db->prepare("UPDATE clients SET " . implode(', ', $setParts) . " WHERE id = ?");
                $result = $upd->execute($params);
                error_log('[create_with_attachment] Client update result: ' . ($result ? 'success' : 'failed') . ', SQL: UPDATE clients SET ' . implode(', ', $setParts) . ' WHERE id = ?');
                if (!$result) {
                    error_log('[create_with_attachment] Client update error: ' . json_encode($upd->errorInfo()));
                }
            }
        } catch (Exception $e) {
            // silent fail on profile update
        }
    }

    // Validate duplicates in incoming samples (per request)
    $insertedCount = 0;
    if (!empty($samples) && is_array($samples)) {
        $serials = [];
        foreach ($samples as $sample) {
            if (!empty($sample['serialNo'])) {
                $norm = strtolower(trim($sample['serialNo']));
                if (isset($serials[$norm])) {
                    $db->rollBack();
                    http_response_code(409);
                    echo json_encode(['message' => 'Duplicate serial numbers found in samples for this request.']);
                    exit();
                }
                $serials[$norm] = true;
            }
        }

        // Insert samples as equipment (with quantity)
        $stmtInsert = $db->prepare("INSERT INTO sample (reservation_ref_no, section, type, `range`, serial_no, price, quantity, status, is_calibrated, date_completed) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, NULL)");
        foreach ($samples as $sample) {
            // Support multiple input schemas: canonical (section,type,range,serialNo),
            // new frontend (sample, sampleCode, testRequested, testMethod),
            // and PDF-parsed labels (Calibration or Test Requested/Method)
            $section = '';
            $type = '';
            $range = '';
            $serial_no = '';

            // Canonical keys
            if (isset($sample['section'])) { $section = $sample['section']; }
            if (isset($sample['type'])) { $type = $sample['type']; }
            if (isset($sample['range'])) { $range = $sample['range']; }
            if (isset($sample['serialNo'])) { $serial_no = $sample['serialNo']; }

            // New frontend keys
            if (isset($sample['testRequested'])) { $section = $sample['testRequested']; }
            if (isset($sample['sample'])) { $type = $sample['sample']; }
            if (isset($sample['testMethod'])) { $range = $sample['testMethod']; }
            if (isset($sample['sampleCode'])) { $serial_no = $sample['sampleCode']; }

            // PDF-friendly label variations
            if (isset($sample['Calibration or Test Requested'])) { $section = $sample['Calibration or Test Requested']; }
            if (isset($sample['Calibration or Test Request'])) { $section = $sample['Calibration or Test Request']; }
            if (isset($sample['Test Request/Calibration'])) { $section = $sample['Test Request/Calibration']; }
            if (isset($sample['Sample'])) { $type = $sample['Sample']; }
            if (isset($sample['Calibration or Test Method'])) { $range = $sample['Calibration or Test Method']; }
            if (isset($sample['Calibration Test/Method'])) { $range = $sample['Calibration Test/Method']; }
            if (isset($sample['Sample Code'])) { $serial_no = $sample['Sample Code']; }

            $price = isset($sample['price']) ? str_replace(',', '', (string)$sample['price']) : '0';
            if ($price === '' || !is_numeric($price)) { $price = '0'; }
            $quantity = isset($sample['quantity']) ? intval($sample['quantity']) : 1;
            if ($quantity <= 0) { $quantity = 1; }

            // Log per-sample parsed values
            error_log('[create_with_attachment] sample parsed: ' . json_encode([
                'section' => $section,
                'type' => $type,
                'range' => $range,
                'serial_no' => $serial_no,
                'price' => $price,
                'quantity' => $quantity,
            ]));

            // Relaxed validation: require at least serial number; other fields can be empty
            if (!$serial_no) {
                $db->rollBack();
                http_response_code(400);
                echo json_encode(['message' => 'Missing serial number in samples']);
                exit();
            }

            // Ensure no duplicate with already inserted rows for the same reservation
            $dupStmt = $db->prepare("SELECT COUNT(*) FROM sample WHERE reservation_ref_no = ? AND LOWER(TRIM(serial_no)) = LOWER(TRIM(?))");
            $dupStmt->execute([$reference_number, $serial_no]);
            if ($dupStmt->fetchColumn() > 0) {
                $db->rollBack();
                http_response_code(409);
                echo json_encode(['message' => 'Duplicate serial number for this request.']);
                exit();
            }

            // Optional global duplicate check if DB enforces unique serial numbers
            $dupGlobal = $db->prepare("SELECT COUNT(*) FROM sample WHERE LOWER(TRIM(serial_no)) = LOWER(TRIM(?))");
            $dupGlobal->execute([$serial_no]);
            if ($dupGlobal->fetchColumn() > 0) {
                $db->rollBack();
                http_response_code(409);
                echo json_encode(['message' => 'Duplicate serial number exists in the system.']);
                exit();
            }

            try {
                $stmtInsert->execute([
                    $reference_number,
                    $section,
                    $type,
                    $range,
                    $serial_no,
                    $price,
                    $quantity
                ]);
                $insertedCount++;
            } catch (PDOException $e) {
                error_log('[create_with_attachment] Insert sample failed: ' . $e->getMessage());
                $db->rollBack();
                if ($e->getCode() === '23000') {
                    http_response_code(409);
                    echo json_encode(['message' => 'Duplicate constraint while saving sample code.']);
                } else {
                    http_response_code(500);
                    echo json_encode(['message' => 'Database error inserting sample.']);
                }
                exit();
            }
        }
        if (count($samples) > 0 && $insertedCount === 0) {
            error_log('[create_with_attachment] No samples inserted despite non-empty samples payload');
        }
    }
    error_log('[create_with_attachment] Sample processing completed, proceeding to client creation check');

    // Handle file upload if present
    $uploaded = null;
    if (!empty($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = dirname(__DIR__, 2) . '/uploads/reservations/' . $reference_number . '/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $originalName = basename($_FILES['attachment']['name']);
        $safeName = preg_replace('/[^A-Za-z0-9_\.-]/', '_', $originalName);
        $targetPath = $uploadDir . $safeName;
        if (!move_uploaded_file($_FILES['attachment']['tmp_name'], $targetPath)) {
            // If file upload fails, we can still keep the reservation; just report failure
            $uploaded = ['success' => false, 'message' => 'Attachment upload failed'];
        } else {
            $publicPath = '/uploads/reservations/' . $reference_number . '/' . $safeName;
            $uploaded = ['success' => true, 'file_name' => $safeName, 'file_path' => $publicPath];
            // Save attachment metadata directly on reservations table (non-fatal if columns do not exist)
            try {
                $mime = isset($_FILES['attachment']['type']) ? $_FILES['attachment']['type'] : null;
                $size = isset($_FILES['attachment']['size']) ? intval($_FILES['attachment']['size']) : null;
                $stmtUpd = $db->prepare(
                    "UPDATE requests SET attachment_file_name = ?, attachment_file_path = ?, attachment_mime_type = ?, attachment_file_size = ? WHERE reference_number = ?"
                );
                $stmtUpd->execute([$safeName, $publicPath, $mime, $size, $reference_number]);
            } catch (Exception $e) {
                // Ignore if columns do not exist; reservation remains valid
            }
        }
    }

    $db->commit();

    http_response_code(201);
    echo json_encode([
        'message' => 'Request created successfully',
        'reference_number' => $reference_number,
        'samples_inserted' => isset($insertedCount) ? $insertedCount : 0,
        'attachment' => $uploaded
    ]);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['message' => 'Failed to create request with attachment', 'error' => $e->getMessage()]);
} 