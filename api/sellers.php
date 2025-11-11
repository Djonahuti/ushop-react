<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['email'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.sellers WHERE seller_email = :email');
        $stmt->execute([':email' => $_GET['email']]);
        ok($stmt->fetchAll());
    }
    if (isset($_GET['seller_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.sellers WHERE seller_id = :id');
        $stmt->execute([':id' => (int)$_GET['seller_id']]);
        ok($stmt->fetch());
    }
    $stmt = $pdo->query('SELECT seller_id, seller_email FROM public.sellers ORDER BY seller_id DESC');
    ok($stmt->fetchAll());
} elseif ($method === 'PUT' || $method === 'PATCH') {
    $body = json_input();
    $email = $body['seller_email'] ?? $_GET['email'] ?? null;
    if (!$email) fail('seller_email required');
    
    $updates = [];
    $params = [':email' => $email];
    
    $allowedFields = ['seller_name', 'seller_email', 'seller_contact', 'business_name', 'shop_address', 'shop_city', 'shop_country', 'seller_image', 'cac_no'];
    foreach ($allowedFields as $field) {
        if (isset($body[$field])) {
            $updates[] = "$field = :$field";
            $params[":$field"] = $body[$field];
        }
    }
    
    if (empty($updates)) fail('No fields to update');
    $sql = 'UPDATE public.sellers SET ' . implode(', ', $updates) . ' WHERE seller_email = :email RETURNING *';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    ok($stmt->fetch());
} elseif ($method === 'DELETE') {
    $email = $_GET['email'] ?? null;
    if (!$email) fail('email required');
    $stmt = $pdo->prepare('DELETE FROM public.sellers WHERE seller_email = :email');
    $stmt->execute([':email' => $email]);
    ok(['deleted' => true]);
} else {
    fail('Invalid method', 405);
}


