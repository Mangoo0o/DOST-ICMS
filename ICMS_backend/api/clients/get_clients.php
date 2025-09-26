<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once __DIR__ . '/../config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if the table exists
    $check_table = "SHOW TABLES LIKE 'clients'";
    $table_exists = $db->query($check_table)->rowCount() > 0;

    if (!$table_exists) {
        throw new Exception("Clients table does not exist");
    }

    $query = "SELECT id, first_name, last_name, age, gender, province, city, barangay, contact_number, email, company, industry_type, service_line, company_head, is_pwd, is_4ps FROM clients ORDER BY created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $clients_arr = array();
        $clients_arr["records"] = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $client_item = array(
                "id" => $row['id'],
                "client_id" => $row['id'],
                "fullname" => $row['first_name'] . ' ' . $row['last_name'],
                "first_name" => $row['first_name'],
                "last_name" => $row['last_name'],
                "age" => $row['age'],
                "gender" => $row['gender'],
                "province" => $row['province'],
                "city" => $row['city'],
                "barangay" => $row['barangay'],
                "email" => $row['email'],
                "contact_number" => $row['contact_number'],
                "company" => $row['company'],
                "industry_type" => $row['industry_type'],
                "service_line" => $row['service_line'],
                "company_head" => $row['company_head'],
                "is_pwd" => $row['is_pwd'],
                "is_4ps" => $row['is_4ps']
            );
            array_push($clients_arr["records"], $client_item);
        }

        http_response_code(200);
        echo json_encode($clients_arr);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "No clients found."));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Database error occurred",
        "error" => $e->getMessage()
    ));
}
?> 