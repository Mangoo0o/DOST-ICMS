<?php
require_once '../config/cors.php';
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verify authentication
require_once '../auth/verify_token.php';
$authResult = verifyToken();
if (!$authResult['success']) {
    http_response_code(401);
    echo json_encode(['message' => $authResult['message'] || 'Unauthorized access']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all sample pricing configurations
    try {
        // Check if database connection is working
        if (!$db) {
            throw new Exception('Database connection failed');
        }
        
        $stmt = $db->prepare("SELECT * FROM sample_pricing ORDER BY section, type, `range`");
        $stmt->execute();
        $pricing = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $pricing
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error retrieving sample pricing: ' . $e->getMessage()
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create or update sample pricing
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['section']) || !isset($data['type']) || !isset($data['range']) || !isset($data['price'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Missing required fields: section, type, range, price']);
        exit();
    }
    
    $section = trim($data['section']);
    $type = trim($data['type']);
    $range = trim($data['range']);
    $price = floatval($data['price']);
    $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
    
    if ($price < 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Price cannot be negative']);
        exit();
    }
    
    try {
        $db->beginTransaction();
        
        // Check if pricing already exists
        $stmt = $db->prepare("SELECT id FROM sample_pricing WHERE section = ? AND type = ? AND `range` = ?");
        $stmt->execute([$section, $type, $range]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Update existing pricing
            $stmt = $db->prepare("UPDATE sample_pricing SET price = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$price, $is_active, $existing['id']]);
            $pricing_id = $existing['id'];
        } else {
            // Insert new pricing
            $stmt = $db->prepare("INSERT INTO sample_pricing (section, type, `range`, price, is_active) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$section, $type, $range, $price, $is_active]);
            $pricing_id = $db->lastInsertId();
        }
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Sample pricing saved successfully',
            'data' => ['id' => $pricing_id]
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error saving sample pricing: ' . $e->getMessage()
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update existing sample pricing
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || !isset($data['section']) || !isset($data['type']) || !isset($data['range']) || !isset($data['price'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Missing required fields: id, section, type, range, price']);
        exit();
    }
    
    $id = intval($data['id']);
    $section = trim($data['section']);
    $type = trim($data['type']);
    $range = trim($data['range']);
    $price = floatval($data['price']);
    $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
    
    if ($price < 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Price cannot be negative']);
        exit();
    }
    
    try {
        $db->beginTransaction();
        
        // Check if another pricing exists with same section/type/range
        $stmt = $db->prepare("SELECT id FROM sample_pricing WHERE section = ? AND type = ? AND `range` = ? AND id != ?");
        $stmt->execute([$section, $type, $range, $id]);
        $duplicate = $stmt->fetch();
        
        if ($duplicate) {
            $db->rollBack();
            http_response_code(409);
            echo json_encode(['message' => 'A pricing configuration with the same section, type, and range already exists']);
            exit();
        }
        
        // Update pricing
        $stmt = $db->prepare("UPDATE sample_pricing SET section = ?, type = ?, `range` = ?, price = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$section, $type, $range, $price, $is_active, $id]);
        
        if ($stmt->rowCount() === 0) {
            $db->rollBack();
            http_response_code(404);
            echo json_encode(['message' => 'Sample pricing not found']);
            exit();
        }
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Sample pricing updated successfully'
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error updating sample pricing: ' . $e->getMessage()
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete sample pricing
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Missing required field: id']);
        exit();
    }
    
    $id = intval($data['id']);
    
    try {
        $db->beginTransaction();
        
        $stmt = $db->prepare("DELETE FROM sample_pricing WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() === 0) {
            $db->rollBack();
            http_response_code(404);
            echo json_encode(['message' => 'Sample pricing not found']);
            exit();
        }
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Sample pricing deleted successfully'
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting sample pricing: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}
?>
