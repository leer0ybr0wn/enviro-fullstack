<?php

$cred = json_decode(file_get_contents('/home/lee/enviro/credentials.json'), true);

// DB credentials
$host = 'localhost';
$db_name = $cred['db_name'];
$db_user = $cred['db_user'];
$db_pass = $cred['db_pass'];

$mysqli = new mysqli($host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Only GET requests are allowed']);
    exit;
}

// Define parameters
$param = $_GET['limit'] ?? '24hr';

$intervals = [
    '1hr'  => ['seconds' => 3600,     'step' => 60],    // 1 min
    '24hr' => ['seconds' => 86400,    'step' => 600],   // 10 min
    '1wk'  => ['seconds' => 604800,   'step' => 1800],  // 30 min
    '1mo'  => ['seconds' => 2592000,  'step' => 3600],  // 1 hr
    '1yr'  => ['seconds' => 31536000, 'step' => 21600], // 6 hrs
    'all'  => ['seconds' => null,     'step' => 43200], // 12 hrs
];

if (!isset($intervals[$param])) {
    $param = '24hr';
}

$range = $intervals[$param]['seconds'];
$bucket = $intervals[$param]['step'];

$now = time();
$start = $range ? ($now - $range) : 0;

// SQL query
$query = "
    SELECT
        FLOOR(unix_ts / $bucket) * $bucket AS bucket_ts,
        AVG(temp)     AS temp,
        AVG(humidity) AS humidity,
        AVG(pressure) AS pressure,
        AVG(light)    AS light
    FROM readings
    " . ($param !== 'all' ? "WHERE unix_ts >= $start" : "") . "
    GROUP BY bucket_ts
    ORDER BY bucket_ts ASC
";

$result = $mysqli->query($query);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed']);
    exit;
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'unix'     => (int) $row['bucket_ts'],
        'temp'     => round((float) $row['temp'], 2),
        'humidity' => round((float) $row['humidity'], 2),
        'pressure' => round((float) $row['pressure'], 2),
        'light'    => round((float) $row['light'], 2),
    ];
}

echo json_encode($data);
$mysqli->close();
