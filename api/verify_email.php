<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    fail('Invalid method', 405);
}

$code = $_GET['code'] ?? null;
$email = $_GET['email'] ?? null;

if (!$code || !$email) {
    fail('Verification code and email are required');
}

try {
    // Verify the code matches
    $stmt = $pdo->prepare('SELECT customer_id, customer_name FROM public.customers WHERE customer_email = :email AND customer_confirm_code = :code');
    $stmt->execute([':email' => $email, ':code' => $code]);
    $customer = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$customer) {
        fail('Invalid verification code or email', 400);
    }
    
    // Clear the verification code (mark as verified)
    $stmt = $pdo->prepare('UPDATE public.customers SET customer_confirm_code = NULL WHERE customer_id = :id');
    $stmt->execute([':id' => $customer['customer_id']]);
    
    ok(['verified' => true, 'message' => 'Email verified successfully']);
} catch (PDOException $e) {
    fail('Verification failed: ' . $e->getMessage(), 500);
}

