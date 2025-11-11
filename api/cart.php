<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['customer_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.cart WHERE customer_id = :cid ORDER BY created_at DESC');
        $stmt->execute([':cid' => (int)$_GET['customer_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.cart ORDER BY created_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $sql = 'INSERT INTO public.cart (customer_id, product_id, qty, p_price, size, ip_add) VALUES (:cid, :pid, :qty, :price, :size, :ip) RETURNING *';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':cid' => (int)($body['customer_id'] ?? 0),
        ':pid' => (int)($body['product_id'] ?? 0),
        ':qty' => (int)($body['qty'] ?? 1),
        ':price' => (float)($body['p_price'] ?? 0),
        ':size' => $body['size'] ?? 'M',
        ':ip' => $body['ip_add'] ?? $_SERVER['REMOTE_ADDR'] ?? '',
    ]);
    ok($stmt->fetch());
}

if ($method === 'DELETE') {
    if (isset($_GET['cart_id'])) {
        $stmt = $pdo->prepare('DELETE FROM public.cart WHERE cart_id = :id');
        $stmt->execute([':id' => (int)$_GET['cart_id']]);
        ok(['deleted' => true]);
    }
    if (isset($_GET['customer_id'])) {
        $stmt = $pdo->prepare('DELETE FROM public.cart WHERE customer_id = :cid');
        $stmt->execute([':cid' => (int)$_GET['customer_id']]);
        ok(['deleted' => true]);
    }
    fail('cart_id or customer_id required');
}

fail('Invalid method', 405);


