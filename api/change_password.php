<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid method', 405);
}

$body = json_input();
$email = $body['email'] ?? null;
$currentPassword = $body['current_password'] ?? null;
$newPassword = $body['new_password'] ?? null;

if (!$email || !$currentPassword || !$newPassword) {
    fail('email, current_password, and new_password are required');
}

// Verify current password by checking against the appropriate table
$role = $body['role'] ?? 'customer';
$table = $role === 'admin' ? 'admins' : ($role === 'seller' ? 'sellers' : 'customers');
$emailField = $role === 'admin' ? 'admin_email' : ($role === 'seller' ? 'seller_email' : 'customer_email');
$passField = $role === 'admin' ? 'admin_pass' : ($role === 'seller' ? 'seller_pass' : 'customer_pass');

$stmt = $pdo->prepare("SELECT $passField FROM public.$table WHERE $emailField = :email");
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user || $user[$passField] !== $currentPassword) {
    fail('Current password is incorrect', 401);
}

// Update password
$stmt = $pdo->prepare("UPDATE public.$table SET $passField = :pass WHERE $emailField = :email");
$stmt->execute([':pass' => $newPassword, ':email' => $email]);

ok(['updated' => true]);

