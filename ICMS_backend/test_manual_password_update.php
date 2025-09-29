<?php
require_once __DIR__ . '/api/config/db.php';

$database = new Database();
$db = $database->getConnection();

// Test password update manually
$test_password = "newpassword123";
$hashed_password = password_hash($test_password, PASSWORD_BCRYPT);

echo "=== MANUAL PASSWORD UPDATE TEST ===\n";
echo "Test password: " . $test_password . "\n";
echo "Hashed password: " . $hashed_password . "\n";

// Update the password
$update_query = "UPDATE clients SET password = ?, updated_at = NOW() WHERE email = ?";
$update_stmt = $db->prepare($update_query);
$result = $update_stmt->execute([$hashed_password, 'angelojonesjaramilla@gmail.com']);

if($result) {
    echo "Password update: SUCCESS\n";
    
    // Verify the update
    $verify_query = "SELECT password, updated_at FROM clients WHERE email = ?";
    $verify_stmt = $db->prepare($verify_query);
    $verify_stmt->execute(['angelojonesjaramilla@gmail.com']);
    $row = $verify_stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "New password hash: " . $row['password'] . "\n";
    echo "Updated at: " . $row['updated_at'] . "\n";
    
    // Test password verification
    $verify_result = password_verify($test_password, $row['password']);
    echo "Password verification test: " . ($verify_result ? 'SUCCESS' : 'FAILED') . "\n";
    
    if($verify_result) {
        echo "\n✅ MANUAL PASSWORD UPDATE WORKING!\n";
        echo "You can now login with password: " . $test_password . "\n";
    }
} else {
    echo "Password update: FAILED\n";
}
?>
