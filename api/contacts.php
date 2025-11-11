<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM public.contacts ORDER BY submitted_at DESC');
    ok($stmt->fetchAll(PDO::FETCH_ASSOC));
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.contacts (subject_id, message, customer_id, is_starred, is_read) VALUES (:subject_id, :message, :customer_id, :is_starred, :is_read) RETURNING *');
    $stmt->execute([
        ':subject_id' => $body['subject_id'] ?? null,
        ':message' => $body['message'] ?? null,
        ':customer_id' => $body['customer_id'] ?? null,
        ':is_starred' => $body['is_starred'] ?? false,
        ':is_read' => $body['is_read'] ?? false,
    ]);
    ok($stmt->fetch(PDO::FETCH_ASSOC));
}

if ($method === 'PUT' || $method === 'PATCH') {
    $body = json_input();
    if (!isset($body['id'])) {
        fail('id is required', 400);
    }
    
    $updates = [];
    $params = [':id' => $body['id']];
    
    if (isset($body['is_read'])) {
        $updates[] = 'is_read = :is_read';
        $params[':is_read'] = $body['is_read'];
    }
    if (isset($body['is_starred'])) {
        $updates[] = 'is_starred = :is_starred';
        $params[':is_starred'] = $body['is_starred'];
    }
    
    if (empty($updates)) {
        fail('No fields to update', 400);
    }
    
    $sql = 'UPDATE public.contacts SET ' . implode(', ', $updates) . ' WHERE id = :id RETURNING *';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    ok($stmt->fetch(PDO::FETCH_ASSOC));
}

fail('Invalid method', 405);
?>
