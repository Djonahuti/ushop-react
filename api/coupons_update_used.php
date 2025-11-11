<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid method', 405);
}

$body = json_input();
$id = $body['coupon_id'] ?? null;
$used = $body['coupon_used'] ?? null;
if (!$id || $used === null) fail('coupon_id and coupon_used required');

$stmt = $pdo->prepare('UPDATE public.coupons SET coupon_used = :u WHERE coupon_id = :id');
$stmt->execute([':u' => (int)$used, ':id' => (int)$id]);
ok(['updated' => true]);


