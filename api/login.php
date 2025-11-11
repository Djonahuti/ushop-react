<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid method', 405);
}

$body = json_input();
$email = $body['email'] ?? '';
$password = $body['password'] ?? '';

if (!$email || !$password) {
    fail('Email and password are required');
}

// Try admin
$stmt = $pdo->prepare('SELECT admin_email AS email, admin_pass AS pass FROM public.admins WHERE admin_email = :email');
$stmt->execute([':email' => $email]);
$row = $stmt->fetch();
if ($row && $row['pass'] === $password) {
    ok(['role' => 'admin', 'email' => $email]);
}

// Try customer
$stmt = $pdo->prepare('SELECT customer_email AS email, customer_pass AS pass FROM public.customers WHERE customer_email = :email');
$stmt->execute([':email' => $email]);
$row = $stmt->fetch();
if ($row && ($row['pass'] ?? '') === $password) {
    ok(['role' => 'customer', 'email' => $email]);
}

// Try seller
$stmt = $pdo->prepare('SELECT seller_email AS email, seller_pass AS pass FROM public.sellers WHERE seller_email = :email');
$stmt->execute([':email' => $email]);
$row = $stmt->fetch();
if ($row && $row['pass'] === $password) {
    ok(['role' => 'seller', 'email' => $email]);
}

fail('Invalid credentials', 401);


