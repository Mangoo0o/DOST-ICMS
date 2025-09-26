<?php
// Test script to verify client registration process
echo "Testing Client Registration Process\n";
echo "==================================\n\n";

// Test data
$test_user = [
    'first_name' => 'Test',
    'last_name' => 'Client',
    'email' => 'testclient@example.com',
    'password' => 'test123',
    'role' => 'client'
];

$test_client = [
    'user_id' => null, // Will be set after user creation
    'first_name' => 'Test',
    'last_name' => 'Client',
    'age' => 25,
    'gender' => 'male',
    'province' => 'Metro Manila',
    'city' => 'Quezon City',
    'barangay' => 'Diliman',
    'contact_number' => '09123456789',
    'email' => 'testclient@example.com',
    'company' => 'Test Company',
    'industry_type' => 'Technology',
    'service_line' => 'Software Development',
    'company_head' => 'John Doe'
];

echo "Step 1: Creating user account...\n";
$user_response = file_get_contents('http://localhost/ICMS_backend/api/users/create_user.php', false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($test_user)
    ]
]));

$user_data = json_decode($user_response, true);
echo "User creation response: " . $user_response . "\n\n";

if (isset($user_data['id'])) {
    $test_client['user_id'] = $user_data['id'];
    
    echo "Step 2: Creating client profile...\n";
    $client_response = file_get_contents('http://localhost/ICMS_backend/api/clients/create_client.php', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode($test_client)
        ]
    ]));
    
    echo "Client creation response: " . $client_response . "\n\n";
    
    echo "Step 3: Verifying client was created...\n";
    $clients_response = file_get_contents('http://localhost/ICMS_backend/api/clients/get_clients.php');
    $clients_data = json_decode($clients_response, true);
    
    if (isset($clients_data['records'])) {
        $found = false;
        foreach ($clients_data['records'] as $client) {
            if ($client['email'] === $test_client['email']) {
                echo "✓ Client found in database!\n";
                echo "  - ID: " . $client['id'] . "\n";
                echo "  - User ID: " . $client['user_id'] . "\n";
                echo "  - Name: " . $client['fullname'] . "\n";
                echo "  - Email: " . $client['email'] . "\n";
                echo "  - Company: " . $client['company'] . "\n";
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            echo "✗ Client not found in database\n";
        }
    }
    
} else {
    echo "✗ User creation failed\n";
}

echo "\nTest completed!\n";
?> 