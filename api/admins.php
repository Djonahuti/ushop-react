<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['email'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.admins WHERE admin_email = :email');
        $stmt->execute([':email' => $_GET['email']]);
        ok($stmt->fetchAll());
    }
    if (isset($_GET['admin_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.admins WHERE admin_id = :id');
        $stmt->execute([':id' => (int)$_GET['admin_id']]);
        ok($stmt->fetch());
    }
    $stmt = $pdo->query('SELECT admin_id, admin_email, admin_name FROM public.admins ORDER BY admin_id DESC');
    ok($stmt->fetchAll());
} elseif ($method === 'PUT' || $method === 'PATCH') {
    $body = json_input();
    $email = $body['admin_email'] ?? $_GET['email'] ?? null;
    if (!$email) fail('admin_email required');
    
    $updates = [];
    $params = [':email' => $email];
    
    $allowedFields = ['admin_name', 'admin_email', 'admin_contact', 'admin_about', 'admin_country', 'admin_image', 'admin_job'];
    foreach ($allowedFields as $field) {
        if (isset($body[$field])) {
            $updates[] = "$field = :$field";
            $params[":$field"] = $body[$field];
        }
    }
    
    if (empty($updates)) fail('No fields to update');
    $sql = 'UPDATE public.admins SET ' . implode(', ', $updates) . ' WHERE admin_email = :email RETURNING *';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    ok($stmt->fetch());
} elseif ($method === 'DELETE') {
    $email = $_GET['email'] ?? null;
    if (!$email) fail('email required');
    $stmt = $pdo->prepare('DELETE FROM public.admins WHERE admin_email = :email');
    $stmt->execute([':email' => $email]);
    ok(['deleted' => true]);
} else {
    fail('Invalid method', 405);
}

