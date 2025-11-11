<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['product_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.coupons WHERE product_id = :pid ORDER BY created_at DESC');
        $stmt->execute([':pid' => (int)$_GET['product_id']]);
        ok($stmt->fetchAll());
    }
    if (isset($_GET['code'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.coupons WHERE coupon_code = :code');
        $stmt->execute([':code' => $_GET['code']]);
        ok($stmt->fetch());
    }
    $stmt = $pdo->query('SELECT * FROM public.coupons ORDER BY created_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.coupons (product_id, coupon_title, coupon_price, coupon_code, coupon_limit, coupon_used) VALUES (:pid, :title, :price, :code, :limit, :used) RETURNING *');
    $stmt->execute([
        ':pid' => $body['product_id'] ?? null,
        ':title' => $body['coupon_title'] ?? null,
        ':price' => $body['coupon_price'] ?? null,
        ':code' => $body['coupon_code'] ?? null,
        ':limit' => $body['coupon_limit'] ?? 0,
        ':used' => $body['coupon_used'] ?? 0,
    ]);
    ok($stmt->fetch());
}

fail('Invalid method', 405);


