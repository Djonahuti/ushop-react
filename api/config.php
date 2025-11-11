<?php
// Database connection via PDO
// Update path assumptions as needed on cPanel; this file will be deployed to public_html/api/config.php

// Set content type for all API responses
header('Content-Type: application/json');

// Database configuration - Update these with your cPanel PostgreSQL credentials
$dbHost = 'localhost';
$dbName = 'yastvanu_shop';
$dbUser = 'yastvanu_ushop';
$dbPass = 'Xcalibar12$';
// Some cPanel setups require a port (default PostgreSQL port is 5432)
$dbPort = '5432';

// Initialize $pdo as null - will be set if connection succeeds
$pdo = null;

try {
    // Try connecting with port first (common in cPanel)
    $dsn = "pgsql:host=$dbHost;port=$dbPort;dbname=$dbName";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5, // 5 second timeout
    ]);
} catch (PDOException $e) {
    // If connection with port fails, try without port
    try {
        $dsn = "pgsql:host=$dbHost;dbname=$dbName";
        $pdo = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5,
        ]);
    } catch (PDOException $e2) {
        // If both fail, return error in consistent format
        http_response_code(500);
        echo json_encode([
            'ok' => false,
            'success' => false,
            'error' => 'Database connection failed',
            'message' => $e2->getMessage()
        ]);
        exit;
    }
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


