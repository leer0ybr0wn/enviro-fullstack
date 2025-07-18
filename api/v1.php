<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

$method = $_SERVER['REQUEST_METHOD'];
$cred = json_decode(file_get_contents('/home/lee/enviro/credentials.json'), true);

if (!$cred) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load credentials']);
    exit;
}

switch ($method) {
    case 'GET':
        require 'get.php';
        break;

    case 'POST':
        require 'post.php';
        break;

    case 'OPTIONS':
        http_response_code(204);
        // No content
        exit;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
