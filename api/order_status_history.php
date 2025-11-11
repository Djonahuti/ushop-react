<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['order_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.order_status_history WHERE order_id = :oid ORDER BY updated_at ASC');
        $stmt->execute([':oid' => (int)$_GET['order_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.order_status_history ORDER BY updated_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.order_status_history (order_id, status) VALUES (:oid, :status) RETURNING *');
    $stmt->execute([
        ':oid' => $body['order_id'] ?? null,
        ':status' => $body['status'] ?? null,
    ]);
    ok($stmt->fetch());
}

fail('Invalid method', 405);


