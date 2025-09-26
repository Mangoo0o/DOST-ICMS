<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

require_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
  http_response_code(503);
  header('Content-Type: application/json');
  echo json_encode(['message' => 'Database connection failed.']);
  exit();
}

$ref = isset($_GET['ref']) ? $_GET['ref'] : null;
if (!$ref) {
  http_response_code(400);
  header('Content-Type: application/json');
  echo json_encode(['message' => 'Reference number is required.']);
  exit();
}

try {
  // Fetch attachment metadata
  $stmt = $db->prepare("SELECT attachment_file_name, attachment_file_path, attachment_mime_type, attachment_file_size FROM requests WHERE reference_number = ?");
  $stmt->execute([$ref]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Reservation not found.']);
    exit();
  }

  $filePathRel = $row['attachment_file_path'] ?? '';
  $fileName = $row['attachment_file_name'] ?? '';
  $mime = $row['attachment_mime_type'] ?? '';

  // Resolve filesystem path from relative web path
  // Expected form: /uploads/reservations/{ref}/{filename}
  $rootDir = dirname(__DIR__, 2); // ICMS_backend
  $absolutePath = $filePathRel ? ($rootDir . $filePathRel) : '';

  if (!$absolutePath || !is_file($absolutePath)) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Attachment not found.']);
    exit();
  }

  $mimeType = $mime ?: (function($path) {
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    switch ($ext) {
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'webp': return 'image/webp';
      case 'pdf': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  })($absolutePath);

  // Stream file for inline display
  header('Content-Type: ' . $mimeType);
  header('Content-Length: ' . filesize($absolutePath));
  header('Content-Disposition: inline; filename="' . basename($fileName ?: $absolutePath) . '"');
  header('Accept-Ranges: bytes');
  // Intentionally NOT setting X-Frame-Options to allow embedding in iframe

  readfile($absolutePath);
  exit();

} catch (Exception $e) {
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['message' => 'Failed to fetch attachment', 'error' => $e->getMessage()]);
  exit();
} 