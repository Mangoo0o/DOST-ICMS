<?php
require_once __DIR__ . '/api/config/db.php';

$database = new Database();
$db = $database->getConnection();

// Get client with email angelojonesjaramilla@gmail.com
$query = "SELECT id, email, password, first_name, last_name, updated_at FROM clients WHERE email = ?";
$stmt = $db->prepare($query);
$stmt->execute(['angelojonesjaramilla@gmail.com']);

if($stmt->rowCount() > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "=== CURRENT CLIENT DATA ===\n";
    echo "ID: " . $row['id'] . "\n";
    echo "Email: " . $row['email'] . "\n";
    echo "Name: " . $row['first_name'] . " " . $row['last_name'] . "\n";
    echo "Password Hash: " . $row['password'] . "\n";
    echo "Password Hash Length: " . strlen($row['password']) . "\n";
    echo "Last Updated: " . $row['updated_at'] . "\n";
    
    // Test password verification with common passwords
    echo "\n=== TESTING PASSWORD VERIFICATION ===\n";
    $test_passwords = ['test123', 'password', '123456', 'admin', 'client123'];
    foreach($test_passwords as $test_password) {
        $result = password_verify($test_password, $row['password']) ? 'TRUE' : 'FALSE';
        echo "Password '$test_password': " . $result . "\n";
    }
    
    // Check if password hash looks like a proper bcrypt hash
    echo "\n=== PASSWORD HASH ANALYSIS ===\n";
    if (strpos($row['password'], '$2y$') === 0 && strlen($row['password']) === 60) {
        echo "Password hash format: VALID bcrypt hash\n";
    } else {
        echo "Password hash format: INVALID or not bcrypt\n";
    }
    
} else {
    echo "Client not found\n";
}

// Also check all clients to see if there are any with empty passwords
echo "\n=== CHECKING ALL CLIENTS FOR EMPTY PASSWORDS ===\n";
$all_query = "SELECT id, email, password, first_name, last_name FROM clients";
$all_stmt = $db->prepare($all_query);
$all_stmt->execute();
$all_clients = $all_stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($all_clients as $client) {
    if(empty($client['password']) || $client['password'] === '') {
        echo "WARNING: Client ID {$client['id']} ({$client['email']}) has empty password!\n";
    }
}
?>
