<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['customer_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.pending_orders WHERE customer_id = :cid ORDER BY created_at DESC');
        $stmt->execute([':cid' => (int)$_GET['customer_id']]);
        ok($stmt->fetchAll());
    }
    if (isset($_GET['invoice_no'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.pending_orders WHERE invoice_no = :inv');
        $stmt->execute([':inv' => $_GET['invoice_no']]);
        ok($stmt->fetch());
    }
    $stmt = $pdo->query('SELECT * FROM public.pending_orders ORDER BY created_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.pending_orders (customer_id, invoice_no, order_status, order_id) VALUES (:cid, :inv, :status, :oid) RETURNING *');
    $stmt->execute([
        ':cid' => $body['customer_id'] ?? null,
        ':inv' => $body['invoice_no'] ?? null,
        ':status' => $body['order_status'] ?? null,
        ':oid' => $body['order_id'] ?? null,
    ]);
    ok($stmt->fetch());
}

fail('Invalid method', 405);


