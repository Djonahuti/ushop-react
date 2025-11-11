<?php
// Database connection via PDO
// Update path assumptions as needed on cPanel; this file will be deployed to public_html/api/config.php

header('Content-Type: application/json');

$dbHost = 'localhost';
$dbName = 'yastvanu_shop';
$dbUser = 'yastvanu_ushop';
$dbPass = 'Xcalibar12$';

try {
    $dsn = "pgsql:host=$dbHost;dbname=$dbName";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'details' => $e->getMessage()]);
    exit;
}

function json_input() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function ok($data) {
    echo json_encode(['ok' => true, 'data' => $data]);
    exit;
}

function fail($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}


