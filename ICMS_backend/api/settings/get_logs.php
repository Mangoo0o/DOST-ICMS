<?php
// System logs - admin only
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
	http_response_code(405);
	echo json_encode(['message' => 'Method Not Allowed']);
	exit();
}

// Auth and role check
require_once __DIR__ . '/../auth/verify_token.php';
$user = verifyToken();
if (!isset($user->role) || $user->role !== 'admin') {
	http_response_code(403);
	echo json_encode(['success' => false, 'message' => 'Forbidden: Admins only']);
	exit();
}

$db = new Database();
$pdo = $db->getConnection();
if (!$pdo) {
	http_response_code(200);
	echo json_encode(['success' => false, 'message' => 'Database connection failed', 'data' => []]);
	exit();
}

try {
	// Ensure logs table exists
	$pdo->exec(
		"CREATE TABLE IF NOT EXISTS system_logs (
			id INT AUTO_INCREMENT PRIMARY KEY,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			user_id INT NULL,
			action VARCHAR(255) NOT NULL,
			details TEXT NULL,
			ip_address VARCHAR(45) NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
	);

	$limit = isset($_GET['limit']) ? max(1, min(1000, (int)$_GET['limit'])) : 200;
	$offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

	$stmt = $pdo->prepare("SELECT l.id, l.created_at, l.user_id, l.action, l.details, l.ip_address,
		COALESCE(CONCAT(u.first_name, ' ', u.last_name), CONCAT(c.first_name, ' ', c.last_name)) AS user_name
	FROM system_logs l
	LEFT JOIN users u ON u.id = l.user_id
	LEFT JOIN clients c ON c.id = l.user_id
	ORDER BY l.created_at DESC, l.id DESC
	LIMIT :limit OFFSET :offset");
	$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
	$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
	$stmt->execute();
	$logs = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

	echo json_encode([
		'success' => true,
		'data' => [
			'logs' => $logs,
			'limit' => $limit,
			'offset' => $offset
		],
		'message' => 'Logs retrieved successfully'
	]);
} catch (Exception $e) {
	http_response_code(500);
	echo json_encode(['success' => false, 'message' => 'Failed to load logs: ' . $e->getMessage()]);
}

?>


