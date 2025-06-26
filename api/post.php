<?php
header("Access-Control-Allow-Headers: Content-Type, X-Api-Key");

$cred = json_decode(file_get_contents(__DIR__ . '/credentials.json'), true);
$db_name = $cred['db_name'];
$db_user = $cred['db_user'];
$db_pass = $cred['db_pass'];
$api_key = $cred['api_key'];

$headers = getallheaders();
if (!isset($headers['X-Api-Key']) || $headers['X-Api-Key'] !== $api_key) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Database credentials
$host = 'localhost';

// Connect to MariaDB
$mysqli = new mysqli($host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST requests are allowed']);
    exit;
}

// Get the JSON payload from the request body
$data = json_decode(file_get_contents('php://input'), true);

// Basic validation
if (!$data || !isset($data['unix'], $data['temp'], $data['humidity'], $data['pressure'], $data['light'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or incomplete data']);
    exit;
}

// Prepare the SQL statement
$stmt = $mysqli->prepare("INSERT INTO readings (unix_ts, temp, humidity, pressure, light) VALUES (?, ?, ?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to prepare statement']);
    exit;
}

// Bind parameters and execute
$stmt->bind_param(
    "idddd",
    $data['unix'],
    $data['temp'],
    $data['humidity'],
    $data['pressure'],
    $data['light']
);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to insert data']);
}

$stmt->close();
$mysqli->close();
