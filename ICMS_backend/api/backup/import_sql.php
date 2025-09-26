<?php
// Restore MySQL database from uploaded .sql file
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(0);
header('Content-Type: application/json');
// Increase limits for large SQL uploads
ini_set('upload_max_filesize', '256M');
ini_set('post_max_size', '256M');
ini_set('memory_limit', '512M');

// Ensure all errors are converted to JSON responses
set_error_handler(function($severity, $message, $file, $line) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'PHP Error: ' . $message,
        'error_file' => $file,
        'error_line' => $line
    ]);
    exit();
});

set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unhandled Exception: ' . $e->getMessage(),
    ]);
    exit();
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Fatal Error: ' . $error['message'],
            'error_file' => $error['file'],
            'error_line' => $error['line']
        ]);
    }
});

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo json_encode(['message' => 'Method Not Allowed']);
	exit();
}

// Verify authentication
require_once __DIR__ . '/../auth/verify_token.php';
$user_data = verifyToken();

if (!isset($_FILES['sql_file']) || $_FILES['sql_file']['error'] !== UPLOAD_ERR_OK) {
	http_response_code(400);
	echo json_encode(['success' => false, 'message' => 'SQL file upload required']);
	exit();
}

$tmpPath = $_FILES['sql_file']['tmp_name'];
$maxSize = 50 * 1024 * 1024; // 50MB

if ($_FILES['sql_file']['size'] > $maxSize) {
	http_response_code(413);
	echo json_encode(['success' => false, 'message' => 'SQL file too large']);
	exit();
}

$sqlContent = file_get_contents($tmpPath);
if ($sqlContent === false) {
	http_response_code(500);
	echo json_encode(['success' => false, 'message' => 'Failed to read uploaded file']);
	exit();
}

$db = new Database();
$pdo = $db->getConnection();

if (!$pdo) {
	http_response_code(500);
	echo json_encode(['message' => 'Database connection failed']);
	exit();
}

try {
	// Avoid wrapping in transaction: DDL may implicitly commit in MySQL
	$pdo->exec('SET FOREIGN_KEY_CHECKS=0');

	$statement = '';
	$inString = false;
	$stringChar = '';
	$len = strlen($sqlContent);
	$line = 1;
    $lastStatementPreview = '';

	for ($i = 0; $i < $len; $i++) {
		$char = $sqlContent[$i];
		$nextChar = $i + 1 < $len ? $sqlContent[$i + 1] : '';
		if ($char === "\n") { $line++; }

		// Handle string literals to avoid splitting on semicolons inside strings
		if ($inString) {
			$statement .= $char;
			if ($char === $stringChar && ($i === 0 || $sqlContent[$i - 1] !== '\\')) {
				$inString = false;
			}
			continue;
		}

		if ($char === '\'' || $char === '"') {
			$inString = true;
			$stringChar = $char;
			$statement .= $char;
			continue;
		}

		// Skip comments (-- ... or # ... until end of line)
		if (($char === '-' && $nextChar === '-') || $char === '#') {
			while ($i < $len && $sqlContent[$i] !== "\n") { $i++; }
			continue;
		}
		// Skip block comments /* ... */
		if ($char === '/' && $nextChar === '*') {
			$i += 2;
			while ($i < $len - 1 && !($sqlContent[$i] === '*' && $sqlContent[$i + 1] === '/')) {
				if ($sqlContent[$i] === "\n") { $line++; }
				$i++;
			}
			$i++; // skip closing '/'
			continue;
		}

		$statement .= $char;
		if ($char === ';') {
			$trimmed = trim($statement);
			if ($trimmed !== '') {
				try {
					$lastStatementPreview = substr($trimmed, 0, 200);
					// Skip non-critical statements commonly present in dumps
					if (preg_match('/^LOCK TABLES/i', $trimmed) || preg_match('/^UNLOCK TABLES/i', $trimmed)) {
						$statement = '';
						continue;
					}
					if (preg_match('/^SET\s+[^;]+/i', $trimmed)) {
						$statement = '';
						continue;
					}
					$pdo->exec($trimmed);
				} catch (Exception $execErr) {
					http_response_code(500);
					echo json_encode([
						'success' => false,
						'message' => 'Restore failed: ' . $execErr->getMessage(),
						'error_line' => $line,
						'last_statement_preview' => $lastStatementPreview
					]);
					if ($pdo->inTransaction()) { $pdo->rollBack(); }
					exit();
				}
			}
			$statement = '';
		}
	}

	// Execute any remaining statement without trailing semicolon
	$trimmed = trim($statement);
	if ($trimmed !== '') {
		try {
			$lastStatementPreview = substr($trimmed, 0, 200);
			// Skip final dangling non-critical SET/LOCK statements if present
			if (preg_match('/^LOCK TABLES/i', $trimmed) || preg_match('/^UNLOCK TABLES/i', $trimmed)) {
				$pdo->exec('SET FOREIGN_KEY_CHECKS=1');
				echo json_encode(['success' => true, 'message' => 'Database restored from SQL successfully']);
				exit();
			}
			if (preg_match('/^SET\s+[^;]+/i', $trimmed)) {
				$pdo->exec('SET FOREIGN_KEY_CHECKS=1');
				echo json_encode(['success' => true, 'message' => 'Database restored from SQL successfully']);
				exit();
			}
			$pdo->exec($trimmed);
		} catch (Exception $execErr) {
			http_response_code(500);
			echo json_encode([
				'success' => false,
				'message' => 'Restore failed: ' . $execErr->getMessage(),
				'error_line' => $line,
				'last_statement_preview' => $lastStatementPreview
			]);
			if ($pdo->inTransaction()) { $pdo->rollBack(); }
			exit();
		}
	}

	$pdo->exec('SET FOREIGN_KEY_CHECKS=1');
 
	// Log restore action (best-effort)
	try {
		$pdo->exec("CREATE TABLE IF NOT EXISTS system_logs (id INT AUTO_INCREMENT PRIMARY KEY, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, user_id INT NULL, action VARCHAR(255) NOT NULL, details TEXT NULL, ip_address VARCHAR(45) NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
		$details = json_encode(['size_bytes' => strlen($sqlContent)]);
		$stmt = $pdo->prepare("INSERT INTO system_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
		$stmt->execute([$user_data->id ?? null, 'backup_import_sql', $details, null]);
	} catch (Exception $ignore) {}

	echo json_encode(['success' => true, 'message' => 'Database restored from SQL successfully']);
} catch (Exception $e) {
	// Ensure foreign key checks are re-enabled on error
	try { $pdo->exec('SET FOREIGN_KEY_CHECKS=1'); } catch (Exception $ignore) {}
	http_response_code(500);
	echo json_encode([
		'success' => false,
		'message' => 'Restore failed: ' . $e->getMessage()
	]);
}

?>


