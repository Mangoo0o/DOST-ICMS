<?php
// Include centralized CORS configuration
require_once __DIR__ . '/../config/cors.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once __DIR__ . '/../config/db.php';

// Only allow PUT requests
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get the raw input data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate required fields
    if (!isset($data['id']) || !isset($data['first_name']) || !isset($data['last_name']) || 
        !isset($data['email']) || !isset($data['contact_number']) || !isset($data['company'])) {
        http_response_code(400);
        echo json_encode(array("message" => "Missing required fields"));
        exit();
    }

    // Check if client exists
    $check_query = "SELECT id FROM clients WHERE id = :id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':id', $data['id']);
    $check_stmt->execute();

    if ($check_stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(array("message" => "Client not found"));
        exit();
    }

    // Check if email already exists for another client
    $email_check_query = "SELECT id FROM clients WHERE email = :email AND id != :id";
    $email_check_stmt = $db->prepare($email_check_query);
    $email_check_stmt->bindParam(':email', $data['email']);
    $email_check_stmt->bindParam(':id', $data['id']);
    $email_check_stmt->execute();

    if ($email_check_stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(array("message" => "Email already exists for another client"));
        exit();
    }

    // Update the client
    $query = "UPDATE clients SET 
              first_name = :first_name,
              last_name = :last_name,
              age = :age,
              gender = :gender,
              province = :province,
              city = :city,
              barangay = :barangay,
              contact_number = :contact_number,
              email = :email,
              company = :company,
              industry_type = :industry_type,
              service_line = :service_line,
              company_head = :company_head,
              is_pwd = :is_pwd,
              is_4ps = :is_4ps,
              updated_at = NOW()
              WHERE id = :id";

    $stmt = $db->prepare($query);

    // Bind parameters
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':first_name', $data['first_name']);
    $stmt->bindParam(':last_name', $data['last_name']);
    $stmt->bindParam(':age', $data['age']);
    $stmt->bindParam(':gender', $data['gender']);
    $stmt->bindParam(':province', $data['province']);
    $stmt->bindParam(':city', $data['city']);
    $stmt->bindParam(':barangay', $data['barangay']);
    $stmt->bindParam(':contact_number', $data['contact_number']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':company', $data['company']);
    $stmt->bindParam(':industry_type', $data['industry_type']);
    $stmt->bindParam(':service_line', $data['service_line']);
    $stmt->bindParam(':company_head', $data['company_head']);
    $stmt->bindParam(':is_pwd', $data['is_pwd']);
    $stmt->bindParam(':is_4ps', $data['is_4ps']);

    if ($stmt->execute()) {
        // Fetch the updated client data
        $fetch_query = "SELECT id, first_name, last_name, age, gender, province, city, barangay, 
                               contact_number, email, company, industry_type, service_line, company_head,
                               is_pwd, is_4ps
                        FROM clients WHERE id = :id";
        $fetch_stmt = $db->prepare($fetch_query);
        $fetch_stmt->bindParam(':id', $data['id']);
        $fetch_stmt->execute();
        
        $updated_client = $fetch_stmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(array(
            "message" => "Client updated successfully",
            "data" => $updated_client
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to update client"));
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Database error occurred",
        "error" => $e->getMessage()
    ));
}
?> 