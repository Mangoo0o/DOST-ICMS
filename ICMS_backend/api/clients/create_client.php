<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';

require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit();
}

// Log the incoming request
error_log("Client creation request received: " . file_get_contents('php://input'));

$data = json_decode(file_get_contents('php://input'), true);

// Log the decoded data
error_log("Decoded data: " . print_r($data, true));

$required_fields = [
	'first_name', 'last_name', 'age', 'gender',
	'province', 'city', 'barangay',
	'contact_number', 'email', 'company',
	'industry_type', 'service_line', 'company_head'
];

// Optional fields with defaults
$optional_fields = [
    'is_pwd' => 0,
    'is_4ps' => 0
];

foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['message' => "Missing field: $field"]);
        exit();
    }
}

// Set default values for optional fields if not provided
foreach ($optional_fields as $field => $default_value) {
    if (!isset($data[$field])) {
        $data[$field] = $default_value;
    }
}

$db = new Database();
$pdo = $db->getConnection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed']);
    exit();
}

try {
	// Validate email format
	if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
		http_response_code(400);
		echo json_encode(['message' => 'Invalid email format']);
		exit();
	}

	// Check if email already exists
	$check = $pdo->prepare('SELECT id FROM clients WHERE email = ? LIMIT 1');
	$check->execute([$data['email']]);
	if ($check->fetch(PDO::FETCH_ASSOC)) {
		http_response_code(409);
		echo json_encode(['message' => 'Email already exists']);
		exit();
	}

	// Generate a secure random temporary password
	$plain_password = bin2hex(random_bytes(6)); // 12 hex chars
	$password_hash = password_hash($plain_password, PASSWORD_BCRYPT);

	$stmt = $pdo->prepare('INSERT INTO clients (first_name, last_name, age, gender, province, city, barangay, contact_number, email, company, industry_type, service_line, company_head, password, is_pwd, is_4ps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
	$stmt->execute([
		$data['first_name'],
		$data['last_name'],
		$data['age'],
		$data['gender'],
		$data['province'],
		$data['city'],
		$data['barangay'],
		$data['contact_number'],
		$data['email'],
		$data['company'],
		$data['industry_type'],
		$data['service_line'],
		$data['company_head'],
		$password_hash,
		$data['is_pwd'],
		$data['is_4ps']
	]);

	$client_id = $pdo->lastInsertId();

	// Attempt to send welcome email with credentials
	$emailSent = false;
	$emailError = null;
	$fullName = trim($data['first_name'] . ' ' . $data['last_name']);
	try {
		require_once __DIR__ . '/../services/EmailService.php';
		$emailService = new EmailService();
		$emailSent = $emailService->sendClientWelcomeEmail($data['email'], $fullName, $plain_password);
		if (!$emailSent) {
			$emailError = 'Email service reported failure (check SMTP settings).';
		}
	} catch (Throwable $te) {
		$emailError = $te->getMessage();
		error_log('create_client: failed to send welcome email - ' . $te->getMessage());
	}

	echo json_encode([
		'message' => 'Client registered successfully',
		'id' => $client_id,
		'client_id' => $client_id,
		'email_sent' => $emailSent,
		'email_error' => $emailError
	]);
} catch (PDOException $e) {
	error_log("Database error: " . $e->getMessage());
	http_response_code(500);
	echo json_encode(['message' => 'Database error', 'error' => $e->getMessage()]);
}