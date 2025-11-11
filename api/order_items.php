<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['order_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.order_items WHERE order_id = :oid ORDER BY order_item_id ASC');
        $stmt->execute([':oid' => (int)$_GET['order_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.order_items ORDER BY order_item_id DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.order_items (order_id, product_id, qty, size) VALUES (:oid, :pid, :qty, :size) RETURNING *');
    $stmt->execute([
        ':oid' => $body['order_id'] ?? null,
        ':pid' => $body['product_id'] ?? null,
        ':qty' => $body['qty'] ?? 1,
        ':size' => $body['size'] ?? null,
    ]);
    ok($stmt->fetch());
}

fail('Invalid method', 405);


