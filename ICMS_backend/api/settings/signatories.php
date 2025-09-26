<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all signatories
    try {
        $stmt = $pdo->prepare("SELECT * FROM signatories ORDER BY role, name");
        $stmt->execute();
        $signatories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $signatories,
            'message' => 'Signatories retrieved successfully'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error retrieving signatories: ' . $e->getMessage()
        ]);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new signatory
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    
    if (!isset($data['name']) || !isset($data['title']) || !isset($data['role'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Name, title, and role are required']);
        exit();
    }
    
    $name = trim($data['name']);
    $title = trim($data['title']);
    $role = $data['role'];
    $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;
    
    // Validate role - allow any role for custom roles
    if (empty($role)) {
        http_response_code(400);
        echo json_encode(['message' => 'Role is required']);
        exit();
    }
    
    try {
        $pdo->beginTransaction();
        
        // If this is a technical_manager and we're setting it as active, deactivate others
        if ($role === 'technical_manager' && $is_active) {
            $stmt = $pdo->prepare("UPDATE signatories SET is_active = 0 WHERE role = 'technical_manager'");
            $stmt->execute();
        }
        
        $stmt = $pdo->prepare("INSERT INTO signatories (name, title, role, is_active) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $title, $role, $is_active]);
        
        $signatory_id = $pdo->lastInsertId();
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'data' => ['id' => $signatory_id, 'name' => $name, 'title' => $title, 'role' => $role, 'is_active' => $is_active],
            'message' => 'Signatory created successfully'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Signatory create error: " . $e->getMessage());
        error_log("Create data: " . json_encode($data));
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error creating signatory: ' . $e->getMessage(),
            'debug' => $data
        ]);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update signatory
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Signatory ID is required']);
        exit();
    }
    
    $id = (int)$data['id'];
    $name = isset($data['name']) ? trim($data['name']) : null;
    $title = isset($data['title']) ? trim($data['title']) : null;
    $role = isset($data['role']) ? $data['role'] : null;
    $is_active = isset($data['is_active']) ? (int)$data['is_active'] : null;
    
    // Validate role if provided
    if ($role !== null && empty($role)) {
        http_response_code(400);
        echo json_encode(['message' => 'Role cannot be empty']);
        exit();
    }
    
    try {
        $pdo->beginTransaction();
        
        // Build update query dynamically
        $updateFields = [];
        $updateValues = [];
        
        if ($name !== null) {
            $updateFields[] = "name = ?";
            $updateValues[] = $name;
        }
        if ($title !== null) {
            $updateFields[] = "title = ?";
            $updateValues[] = $title;
        }
        if ($role !== null) {
            $updateFields[] = "role = ?";
            $updateValues[] = $role;
        }
        if ($is_active !== null) {
            $updateFields[] = "is_active = ?";
            $updateValues[] = $is_active;
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['message' => 'No fields to update']);
            exit();
        }
        
        // Check if we need to deactivate other technical managers
        $shouldDeactivateOthers = false;
        
        // Case 1: We're updating the role to technical_manager and setting as active
        if ($role !== null && $role === 'technical_manager' && $is_active === 1) {
            $shouldDeactivateOthers = true;
        }
        
        // Case 2: We're only updating is_active to 1 and the current role is technical_manager
        if ($role === null && $is_active === 1) {
            // Get current role from database
            $currentStmt = $pdo->prepare("SELECT role FROM signatories WHERE id = ?");
            $currentStmt->execute([$id]);
            $currentRole = $currentStmt->fetchColumn();
            if ($currentRole === 'technical_manager') {
                $shouldDeactivateOthers = true;
            }
        }
        
        if ($shouldDeactivateOthers) {
            try {
                $stmt = $pdo->prepare("UPDATE signatories SET is_active = 0 WHERE role = 'technical_manager' AND id != ?");
                $stmt->execute([$id]);
            } catch (Exception $e) {
                error_log("Error deactivating other technical managers: " . $e->getMessage());
                // Continue with the main update even if this fails
            }
        }
        
        $updateValues[] = $id;
        $sql = "UPDATE signatories SET " . implode(', ', $updateFields) . " WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($updateValues);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Signatory updated successfully'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Signatory update error: " . $e->getMessage());
        error_log("Update data: " . json_encode($data));
        error_log("Update fields: " . json_encode($updateFields));
        error_log("Update values: " . json_encode($updateValues));
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error updating signatory: ' . $e->getMessage(),
            'debug' => [
                'data' => $data,
                'updateFields' => $updateFields,
                'updateValues' => $updateValues
            ]
        ]);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete signatory
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Signatory ID is required']);
        exit();
    }
    
    $id = (int)$data['id'];
    
    try {
        $stmt = $pdo->prepare("DELETE FROM signatories WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Signatory deleted successfully'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting signatory: ' . $e->getMessage()
        ]);
    }
    
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}
?>
