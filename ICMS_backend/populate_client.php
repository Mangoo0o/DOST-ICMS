<?php
// Database connection
include_once __DIR__ . '/api/config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if the table exists
    $check_table = "SHOW TABLES LIKE 'clients'";
    $table_exists = $db->query($check_table)->rowCount() > 0;

    if (!$table_exists) {
        echo "Clients table does not exist. Please run the database schema first.\n";
        exit();
    }

    // Check if client already exists
    $check_client = "SELECT COUNT(*) as count FROM clients WHERE email = 'john.doe@example.com'";
    $stmt = $db->query($check_client);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] > 0) {
        echo "Sample client already exists in the database.\n";
        exit();
    }

    // Insert sample client
    $query = "INSERT INTO clients (
        first_name, 
        last_name, 
        age, 
        gender, 
        province, 
        city, 
        barangay, 
        contact_number, 
        email, 
        company, 
        industry_type, 
        service_line, 
        company_head
    ) VALUES (
        'John',
        'Doe',
        35,
        'male',
        'Metro Manila',
        'Quezon City',
        'Diliman',
        '+639123456789',
        'john.doe@example.com',
        'Tech Solutions Inc.',
        'Information Technology',
        'Software Development',
        'Jane Smith'
    )";

    $stmt = $db->prepare($query);
    $stmt->execute();

    echo "Sample client added successfully!\n";
    echo "Name: John Doe\n";
    echo "Email: john.doe@example.com\n";
    echo "Company: Tech Solutions Inc.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?> 