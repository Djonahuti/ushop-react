<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['order_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.order_items WHERE order_id = :oid');
        $stmt->execute([':oid' => (int)$_GET['order_id']]);
        ok($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    if (isset($_GET['order_item_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.order_items WHERE order_item_id = :oid');
        $stmt->execute([':oid' => (int)$_GET['order_item_id']]);
        ok($stmt->fetch(PDO::FETCH_ASSOC));
    }
    $stmt = $pdo->query('SELECT * FROM public.order_items ORDER BY order_item_id DESC');
    ok($stmt->fetchAll(PDO::FETCH_ASSOC));
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.order_items (order_id, product_id, qty, price, size) VALUES (:oid, :pid, :qty, :price, :size) RETURNING *');
    $stmt->execute([
        ':oid' => $body['order_id'] ?? null,
        ':pid' => $body['product_id'] ?? null,
        ':qty' => $body['qty'] ?? null,
        ':price' => $body['price'] ?? null,
        ':size' => $body['size'] ?? null,
    ]);
    ok($stmt->fetch(PDO::FETCH_ASSOC));
}

fail('Invalid method', 405);
?>
