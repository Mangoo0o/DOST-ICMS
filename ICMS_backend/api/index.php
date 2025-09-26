<?php
// Include centralized CORS configuration
require_once __DIR__ . '/config/cors.php';

// Get the request method
$request_method = $_SERVER["REQUEST_METHOD"];

// Get the request URI
$request_uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('/', trim($request_uri, '/'));

// Debug: Log the URI parts
error_log("Request URI: " . $request_uri);
error_log("URI parts: " . print_r($uri_parts, true));

// Find the 'api' part and get everything after it
$api_index = array_search('api', $uri_parts);
if ($api_index !== false) {
    $uri_parts = array_slice($uri_parts, $api_index + 1);
}

// Get the endpoint
$endpoint = isset($uri_parts[0]) ? $uri_parts[0] : '';
$action = isset($uri_parts[1]) ? $uri_parts[1] : '';

error_log("Endpoint: " . $endpoint);
error_log("Action: " . $action);

// API Documentation
if ($request_method === 'GET' && empty($endpoint)) {
    echo json_encode([
        "message" => "ICMS API Documentation",
        "endpoints" => [
            "auth" => [
                "login" => "POST /api/auth/login",
                "register" => "POST /api/auth/register"
            ],
            "users" => [
                "get_users" => "GET /api/users/get_users",
                "create_user" => "POST /api/users/create_user",
                "update_user" => "PUT /api/users/update_user",
                "delete_user" => "DELETE /api/users/delete_user"
            ],
            "inventory" => [
                "get_items" => "GET /api/inventory/get_items",
                "add_item" => "POST /api/inventory/add_item",
                "update_item" => "PUT /api/inventory/update_item",
                "delete_item" => "DELETE /api/inventory/delete_item"
            ],
            "request" => [
                "get_requests" => "GET /api/request/read",
                "create_request" => "POST /api/request/create_reservation",
                "update_request" => "POST /api/request/update_reservation",
                "update_status" => "PUT /api/request/update_status"
            ],
            "reports" => [
                "generate_report" => "GET /api/reports/generate_report?type=[inventory|reservations|users]"
            ]
        ]
    ]);
    exit();
}

// Route the request to the appropriate endpoint
switch($endpoint) {
    case 'auth':
        if (file_exists('auth/' . $action . '.php')) {
            require_once 'auth/' . $action . '.php';
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Auth endpoint not found: " . $action));
        }
        break;
        
    case 'users':
        if (file_exists('users/' . $action . '.php')) {
            require_once 'users/' . $action . '.php';
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Users endpoint not found: " . $action));
        }
        break;
        
    case 'inventory':
        if (file_exists('inventory/' . $action . '.php')) {
            require_once 'inventory/' . $action . '.php';
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Inventory endpoint not found: " . $action));
        }
        break;
        
    case 'request':
        if (file_exists('request/' . $action . '.php')) {
            require_once 'request/' . $action . '.php';
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Request endpoint not found: " . $action));
        }
        break;
        
    case 'reports':
        if (file_exists('reports/' . $action . '.php')) {
            require_once 'reports/' . $action . '.php';
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Reports endpoint not found: " . $action));
        }
        break;
        
    case 'clients':
        if (file_exists('clients/' . $action . '.php')) {
            require_once 'clients/' . $action . '.php';
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Clients endpoint not found: " . $action));
        }
        break;
        
    case 'transaction':
        if (file_exists('transaction/' . $action . '.php')) {
            require_once 'transaction/' . $action . '.php';
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Transaction endpoint not found: " . $action));
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(array("message" => "Endpoint not found: " . $endpoint));
        break;
}
?> 