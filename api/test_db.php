<?php
// Database connection test endpoint
// This file helps diagnose database connection issues
// Remove this file after fixing the connection

header('Content-Type: application/json');

$dbHost = 'localhost';
$dbName = 'yastvanu_shop';
$dbUser = 'yastvanu_ushop';
$dbPass = 'Xcalibar12$';
$dbPort = '5432';

$results = [
    'php_version' => PHP_VERSION,
    'pdo_pgsql_loaded' => extension_loaded('pdo_pgsql'),
    'pgsql_loaded' => extension_loaded('pgsql'),
];

// Test connection with port
try {
    $dsn = "pgsql:host=$dbHost;port=$dbPort;dbname=$dbName";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5,
    ]);
    $results['connection_with_port'] = 'SUCCESS';
    $results['connection_method'] = 'with_port';
    
    // Test a simple query
    $stmt = $pdo->query('SELECT 1 as test');
    $results['query_test'] = 'SUCCESS';
    $results['test_value'] = $stmt->fetch(PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    $results['connection_with_port'] = 'FAILED';
    $results['connection_with_port_error'] = $e->getMessage();
    
    // Try without port
    try {
        $dsn = "pgsql:host=$dbHost;dbname=$dbName";
        $pdo = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ]);
        $results['connection_without_port'] = 'SUCCESS';
        $results['connection_method'] = 'without_port';
        
        // Test a simple query
        $stmt = $pdo->query('SELECT 1 as test');
        $results['query_test'] = 'SUCCESS';
        $results['test_value'] = $stmt->fetch(PDO::FETCH_ASSOC);
        
    } catch (PDOException $e2) {
        $results['connection_without_port'] = 'FAILED';
        $results['connection_without_port_error'] = $e2->getMessage();
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>

