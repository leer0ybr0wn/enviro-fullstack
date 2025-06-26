<?php

$cred = json_decode(file_get_contents(__DIR__ . '/credentials.json'), true);

// Database credentials
$host = 'localhost';
$db_name = $cred['db_name'];
$db_user = $cred['db_user'];
$db_pass = $cred['db_pass'];

// Connect to MariaDB
$mysqli = new mysqli($host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Only GET requests are allowed']);
    exit;
}

$limit_param = $_GET['limit'] ?? '100';

if (strtolower($limit_param) === 'all') {
    $limit_sql = "";
} else {
    $limit = (int)$limit_param;
    if ($limit < 1 || $limit > 10000) {
        $limit = 100;
    }
    $limit_sql = "LIMIT $limit";
}

// Prepare and execute query
$query = "SELECT unix_ts, temp, humidity, pressure, light FROM readings ORDER BY id DESC $limit_sql";
$result = $mysqli->query($query);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'unix'     => (int) $row['unix_ts'],
        'temp'     => (float) $row['temp'],
        'humidity' => (float) $row['humidity'],
        'pressure' => (float) $row['pressure'],
        'light'    => (float) $row['light']
    ];
}

// Reverse the data to appear in chronological order
$data = array_reverse($data);
echo json_encode($data);
$mysqli->close();
