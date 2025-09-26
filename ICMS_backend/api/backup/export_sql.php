<?php
// Stream a full MySQL database export as a downloadable .sql file
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo json_encode(['message' => 'Method Not Allowed']);
	exit();
}

// Verify authentication
require_once __DIR__ . '/../auth/verify_token.php';
$user_data = verifyToken();

$db = new Database();
$pdo = $db->getConnection();

if (!$pdo) {
	http_response_code(500);
	echo json_encode(['message' => 'Database connection failed']);
	exit();
}

// Helper: escape value for SQL
function sql_escape_value($pdo, $value) {
	if (is_null($value)) {
		return 'NULL';
	}
	if (is_bool($value)) {
		return $value ? '1' : '0';
	}
	// Use PDO quote for strings
	return $pdo->quote((string)$value);
}

// Determine database name
$dbNameStmt = $pdo->query('SELECT DATABASE()');
$databaseName = $dbNameStmt ? $dbNameStmt->fetchColumn() : 'database';

$filename = $databaseName . '_' . date('Ymd_His') . '.sql';

// Output headers to trigger browser Save As dialog
header('Content-Type: application/sql');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// Start of dump
echo "-- SQL Dump for {$databaseName}\n";
echo "-- Generated at: " . date('Y-m-d H:i:s') . "\n\n";
echo "SET NAMES utf8mb4;\n";
echo "SET FOREIGN_KEY_CHECKS=0;\n\n";

// List tables
$tables = [];
$stmt = $pdo->query('SHOW TABLES');
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
	$tables[] = $row[0];
}

foreach ($tables as $table) {
	// Drop table if exists
	echo "--\n-- Table structure for table `{$table}`\n--\n\n";
	echo "DROP TABLE IF EXISTS `{$table}`;\n";

	// Create table
	$createStmt = $pdo->query("SHOW CREATE TABLE `{$table}`");
	$createRow = $createStmt->fetch(PDO::FETCH_ASSOC);
	$createSql = $createRow['Create Table'] ?? '';
	echo $createSql . ";\n\n";

	// Dump data
	$dataStmt = $pdo->query("SELECT * FROM `{$table}`");
	$firstRow = $dataStmt->fetch(PDO::FETCH_ASSOC);
	if ($firstRow) {
		$columns = array_keys($firstRow);
		echo "--\n-- Dumping data for table `{$table}`\n--\n\n";
		echo "LOCK TABLES `{$table}` WRITE;\n";
		echo "ALTER TABLE `{$table}` DISABLE KEYS;\n";

		// Write first row
		$values = [];
		foreach ($columns as $col) {
			$values[] = sql_escape_value($pdo, $firstRow[$col]);
		}
		echo "INSERT INTO `{$table}` (`" . implode('`, `', $columns) . "`) VALUES\n(" . implode(', ', $values) . ")";

		// Remaining rows
		while ($row = $dataStmt->fetch(PDO::FETCH_ASSOC)) {
			$values = [];
			foreach ($columns as $col) {
				$values[] = sql_escape_value($pdo, $row[$col]);
			}
			echo ",\n(" . implode(', ', $values) . ")";
		}
		echo ";\n";
		echo "ALTER TABLE `{$table}` ENABLE KEYS;\n";
		echo "UNLOCK TABLES;\n\n";
	}
}

echo "SET FOREIGN_KEY_CHECKS=1;\n";
// Log the backup export action (best-effort)
try {
    $logPdo = $db->getConnection();
    if ($logPdo) {
        $logPdo->exec("CREATE TABLE IF NOT EXISTS system_logs (id INT AUTO_INCREMENT PRIMARY KEY, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, user_id INT NULL, action VARCHAR(255) NOT NULL, details TEXT NULL, ip_address VARCHAR(45) NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $stmt = $logPdo->prepare("INSERT INTO system_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)");
        $details = json_encode(['filename' => $filename]);
        $stmt->execute([$user_data->id ?? null, 'backup_export_sql', $details, null]);
    }
} catch (Exception $ignore) {}
exit();
?>


