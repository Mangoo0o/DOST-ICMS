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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get pricing for specific sample type or all pricing
    try {
        $section = isset($_GET['section']) ? trim($_GET['section']) : null;
        $type = isset($_GET['type']) ? trim($_GET['type']) : null;
        
        if ($section && $type) {
            // Get specific pricing
            $stmt = $db->prepare("SELECT * FROM sample_pricing WHERE section = ? AND type = ? AND is_active = 1");
            $stmt->execute([$section, $type]);
            $pricing = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($pricing) {
                echo json_encode([
                    'success' => true,
                    'data' => $pricing
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Pricing not found for this sample type',
                    'data' => null
                ]);
            }
        } elseif ($section) {
            // Get all pricing for a section
            $stmt = $db->prepare("SELECT * FROM sample_pricing WHERE section = ? AND is_active = 1 ORDER BY type, `range`");
            $stmt->execute([$section]);
            $pricing = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $pricing
            ]);
        } else {
            // Get all active pricing grouped by section
            $stmt = $db->prepare("SELECT * FROM sample_pricing WHERE is_active = 1 ORDER BY section, type, `range`");
            $stmt->execute();
            $allPricing = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Group by section
            $groupedPricing = [];
            foreach ($allPricing as $pricing) {
                $section = $pricing['section'];
                if (!isset($groupedPricing[$section])) {
                    $groupedPricing[$section] = [];
                }
                $groupedPricing[$section][] = $pricing;
            }
            
            echo json_encode([
                'success' => true,
                'data' => $groupedPricing
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error retrieving sample pricing: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}
?>
