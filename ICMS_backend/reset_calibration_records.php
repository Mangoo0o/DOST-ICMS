<?php
/**
 * Reset Calibration Records Script
 * This script helps reset the calibration_records table for testing purposes
 */

require_once __DIR__ . '/config/db.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die('Database connection failed.');
}

echo "<h2>Calibration Records Reset Tool</h2>";

if (isset($_POST['action'])) {
    if ($_POST['action'] === 'clear') {
        try {
            $stmt = $db->prepare('DELETE FROM calibration_records');
            $stmt->execute();
            $deletedRows = $stmt->rowCount();
            echo "<p style='color: green;'>✅ Successfully deleted {$deletedRows} calibration records.</p>";
        } catch (Exception $e) {
            echo "<p style='color: red;'>❌ Error deleting records: " . $e->getMessage() . "</p>";
        }
    } elseif ($_POST['action'] === 'reset_auto_increment') {
        try {
            $stmt = $db->prepare('ALTER TABLE calibration_records AUTO_INCREMENT = 1');
            $stmt->execute();
            echo "<p style='color: green;'>✅ Successfully reset auto-increment counter.</p>";
        } catch (Exception $e) {
            echo "<p style='color: red;'>❌ Error resetting auto-increment: " . $e->getMessage() . "</p>";
        }
    }
}

// Show current records count
try {
    $stmt = $db->prepare('SELECT COUNT(*) as count FROM calibration_records');
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p><strong>Current calibration records count:</strong> {$result['count']}</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error getting count: " . $e->getMessage() . "</p>";
}

?>

<form method="post" style="margin: 20px 0;">
    <button type="submit" name="action" value="clear" 
            style="background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;"
            onclick="return confirm('Are you sure you want to delete ALL calibration records? This cannot be undone!')">
        🗑️ Clear All Calibration Records
    </button>
    
    <button type="submit" name="action" value="reset_auto_increment" 
            style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
        🔄 Reset Auto-Increment Counter
    </button>
</form>

<div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
    <h3>📋 Instructions:</h3>
    <ul>
        <li><strong>Clear All Calibration Records:</strong> Deletes all records from the calibration_records table</li>
        <li><strong>Reset Auto-Increment Counter:</strong> Resets the ID counter back to 1</li>
        <li>After clearing records, you can test the calibration save functionality again</li>
        <li>This tool is useful for testing and debugging calibration save issues</li>
    </ul>
</div>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
button:hover { opacity: 0.8; }
</style>
