<?php
// Test database connection and inventory query
include_once 'api/config/db.php';

echo "Testing database connection...\n";

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo "❌ Database connection failed\n";
    exit;
}

echo "✅ Database connected successfully\n";

// Test inventory query
$query = "SELECT COUNT(*) as count FROM inventory_items";
$stmt = $db->prepare($query);
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);

echo "📊 Total inventory items: " . $result['count'] . "\n";

// Test the actual inventory query
$query = "SELECT id, name, category FROM inventory_items LIMIT 5";
$stmt = $db->prepare($query);
$stmt->execute();

if($stmt->rowCount() > 0) {
    echo "✅ Found " . $stmt->rowCount() . " items\n";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "  - ID: " . $row['id'] . ", Name: " . $row['name'] . ", Category: " . $row['category'] . "\n";
    }
} else {
    echo "❌ No items found\n";
}

// Test the full query that the API uses
echo "\nTesting full API query...\n";
$query = "SELECT id, name, description, quantity, unit_price, category, status, created_at, 
          sticker, nomval, conventional_mass as conventionalMass, class, min_temperature, max_temperature, humidity, measurement_range, accuracy, min_capacity, max_capacity, date_calibrated
          FROM inventory_items 
          ORDER BY created_at DESC
          LIMIT 3";
$stmt = $db->prepare($query);
$stmt->execute();

if($stmt->rowCount() > 0) {
    echo "✅ Full query works - found " . $stmt->rowCount() . " items\n";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "  - ID: " . $row['id'] . ", Name: " . $row['name'] . ", Category: " . $row['category'] . "\n";
    }
} else {
    echo "❌ Full query failed - no items found\n";
}
?> 