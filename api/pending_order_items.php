<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['pending_order_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.pending_order_items WHERE pending_order_id = :pid ORDER BY pending_order_item_id ASC');
        $stmt->execute([':pid' => (int)$_GET['pending_order_id']]);
        ok($stmt->fetchAll());
    }
    if (isset($_GET['seller_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.pending_order_items WHERE seller_id = :sid ORDER BY pending_order_item_id DESC');
        $stmt->execute([':sid' => (int)$_GET['seller_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.pending_order_items ORDER BY pending_order_item_id DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.pending_order_items (pending_order_id, product_id, qty, size, seller_id) VALUES (:poid, :pid, :qty, :size, :sid) RETURNING *');
    $stmt->execute([
        ':poid' => $body['pending_order_id'] ?? null,
        ':pid' => $body['product_id'] ?? null,
        ':qty' => $body['qty'] ?? 1,
        ':size' => $body['size'] ?? null,
        ':sid' => $body['seller_id'] ?? null,
    ]);
    ok($stmt->fetch());
}

fail('Invalid method', 405);


