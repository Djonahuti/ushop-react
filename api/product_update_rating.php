<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid method', 405);
}

$pid = isset($_GET['product_id']) ? (int)$_GET['product_id'] : null;
$rating = isset($_GET['rating']) ? (int)$_GET['rating'] : null;
if (!$pid || $rating === null) fail('product_id and rating required');

$stmt = $pdo->prepare('UPDATE public.products SET rating = :r WHERE product_id = :pid');
$stmt->execute([':r' => $rating, ':pid' => $pid]);
ok(['updated' => true]);


