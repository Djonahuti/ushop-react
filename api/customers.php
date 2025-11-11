<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['email'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.customers WHERE customer_email = :email');
        $stmt->execute([':email' => $_GET['email']]);
        ok($stmt->fetchAll());
    }
    if (isset($_GET['customer_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.customers WHERE customer_id = :id');
        $stmt->execute([':id' => (int)$_GET['customer_id']]);
        ok($stmt->fetch());
    }
    $stmt = $pdo->query('SELECT customer_id, customer_email, customer_name FROM public.customers ORDER BY created_at DESC');
    ok($stmt->fetchAll());
} elseif ($method === 'PUT' || $method === 'PATCH') {
    $body = json_input();
    $email = $body['customer_email'] ?? $_GET['email'] ?? null;
    if (!$email) fail('customer_email required');
    
    $updates = [];
    $params = [':email' => $email];
    
    $allowedFields = ['customer_name', 'customer_email', 'customer_country', 'state', 'customer_city', 'customer_contact', 'customer_address', 'customer_image'];
    foreach ($allowedFields as $field) {
        if (isset($body[$field])) {
            $updates[] = "$field = :$field";
            $params[":$field"] = $body[$field];
        }
    }
    
    if (empty($updates)) fail('No fields to update');
    $sql = 'UPDATE public.customers SET ' . implode(', ', $updates) . ' WHERE customer_email = :email RETURNING *';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    ok($stmt->fetch());
} elseif ($method === 'DELETE') {
    $email = $_GET['email'] ?? null;
    if (!$email) fail('email required');
    $stmt = $pdo->prepare('DELETE FROM public.customers WHERE customer_email = :email');
    $stmt->execute([':email' => $email]);
    ok(['deleted' => true]);
} else {
    fail('Invalid method', 405);
}


