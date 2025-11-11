<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    fail('Invalid method', 405);
}

if (!isset($_GET['product_id'])) {
    fail('product_id is required');
}

$stmt = $pdo->prepare('SELECT * FROM public.products WHERE product_id = :pid');
$stmt->execute([':pid' => (int)$_GET['product_id']]);
$product = $stmt->fetch();
if (!$product) ok(null);

// load manufacturer title
if ($product['manufacturer_id']) {
    $m = $pdo->prepare('SELECT manufacturer_title FROM public.manufacturers WHERE manufacturer_id = :mid');
    $m->execute([':mid' => (int)$product['manufacturer_id']]);
    $mt = $m->fetch();
    $product['manufacturers'] = $mt ? ['manufacturer_title' => $mt['manufacturer_title']] : null;
}

ok($product);


