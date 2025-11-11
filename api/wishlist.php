<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['customer_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.wishlist WHERE customer_id = :cid ORDER BY created_at DESC');
        $stmt->execute([':cid' => (int)$_GET['customer_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.wishlist ORDER BY created_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.wishlist (customer_id, product_id) VALUES (:cid, :pid) RETURNING *');
    $stmt->execute([':cid' => $body['customer_id'] ?? null, ':pid' => $body['product_id'] ?? null]);
    ok($stmt->fetch());
}

if ($method === 'DELETE') {
    parse_str($_SERVER['QUERY_STRING'] ?? '', $qs);
    $cid = isset($qs['customer_id']) ? (int)$qs['customer_id'] : null;
    $pid = isset($qs['product_id']) ? (int)$qs['product_id'] : null;
    if (!$cid || !$pid) fail('customer_id and product_id required', 400);
    $stmt = $pdo->prepare('DELETE FROM public.wishlist WHERE customer_id = :cid AND product_id = :pid');
    $stmt->execute([':cid' => $cid, ':pid' => $pid]);
    ok(['deleted' => true]);
}

fail('Invalid method', 405);


