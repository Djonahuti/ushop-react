<?php
require_once __DIR__ . '/config.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PATCH', 'PUT'], true)) {
    fail('Invalid method', 405);
}

$body = json_input();
$cartId = $body['cart_id'] ?? null;
$qty = $body['qty'] ?? null;

if (!$cartId || $qty === null) {
    fail('cart_id and qty are required');
}

$stmt = $pdo->prepare('UPDATE public.cart SET qty = :qty WHERE cart_id = :cid');
$stmt->execute([':qty' => (int)$qty, ':cid' => (int)$cartId]);
ok(['updated' => true]);


