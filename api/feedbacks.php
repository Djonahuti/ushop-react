<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Filters: order_id, customer_id via join
    if (isset($_GET['order_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.feedbacks WHERE order_id = :oid ORDER BY created_at DESC');
        $stmt->execute([':oid' => (int)$_GET['order_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.feedbacks ORDER BY created_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.feedbacks (order_id, order_item_id, rating, comment, feedtype_id) VALUES (:oid, :oiid, :rating, :comment, :feed) RETURNING *');
    $stmt->execute([
        ':oid' => $body['order_id'] ?? null,
        ':oiid' => $body['order_item_id'] ?? null,
        ':rating' => $body['rating'] ?? null,
        ':comment' => $body['comment'] ?? null,
        ':feed' => $body['feedtype_id'] ?? null,
    ]);
    ok($stmt->fetch());
}

fail('Invalid method', 405);


