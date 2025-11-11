<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid method', 405);
}

$body = json_input();
$email = $body['customer_email'] ?? null;
$password = $body['customer_pass'] ?? null;

if (!$email || !$password) {
    fail('Email and password are required');
}

// Ensure unique email
$stmt = $pdo->prepare('SELECT customer_id FROM public.customers WHERE customer_email = :email');
$stmt->execute([':email' => $email]);
if ($stmt->fetch()) {
    fail('Email already registered', 409);
}

// Generate verification code
$verificationCode = bin2hex(random_bytes(16));

$fields = [
    'customer_name' => $body['customer_name'] ?? null,
    'customer_email' => $email,
    'customer_pass' => $password,
    'customer_country' => $body['customer_country'] ?? null,
    'state' => $body['state'] ?? null,
    'customer_city' => $body['customer_city'] ?? null,
    'customer_contact' => $body['customer_contact'] ?? null,
    'customer_address' => $body['customer_address'] ?? null,
    'provider' => 'custom',
    'provider_id' => $body['provider_id'] ?? null,
    'customer_confirm_code' => $verificationCode,
];

$columns = array_keys($fields);
$placeholders = array_map(static fn($c) => ':' . $c, $columns);

$sql = 'INSERT INTO public.customers (' . implode(',', $columns) . ') VALUES (' . implode(',', $placeholders) . ') RETURNING customer_id, customer_name';
$stmt = $pdo->prepare($sql);

try {
    $stmt->execute(array_combine($placeholders, array_values($fields)));
} catch (PDOException $e) {
    fail('Failed to create customer: ' . $e->getMessage(), 500);
}

$result = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$result) {
    fail('Failed to create customer', 500);
}

$customerId = $result['customer_id'];
$customerName = $result['customer_name'];

// Send verification email (ignore failures but log them)
$mailData = [
    'action' => 'verification',
    'email' => $email,
    'name' => $customerName,
    'code' => $verificationCode,
];

$ch = curl_init('https://ushop.com.ng/mail/mailto.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($mailData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$mailResponse = curl_exec($ch);

if ($mailResponse === false) {
    error_log('Failed to send verification email via mailto.php: ' . curl_error($ch));
}

curl_close($ch);

ok([
    'customer_id' => $customerId,
    'message' => 'Registration successful. Please check your email for verification link.'
]);


