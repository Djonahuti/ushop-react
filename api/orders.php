<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Filters: customer_id, order_id, invoice_no
    if (isset($_GET['order_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.orders WHERE order_id = :oid');
        $stmt->execute([':oid' => (int)$_GET['order_id']]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        ok(count($result) > 0 ? $result[0] : null);
    }
    if (isset($_GET['invoice_no'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.orders WHERE invoice_no = :inv');
        $stmt->execute([':inv' => $_GET['invoice_no']]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        ok($result);
    }
    if (isset($_GET['customer_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.orders WHERE customer_id = :cid ORDER BY created_at DESC');
        $stmt->execute([':cid' => (int)$_GET['customer_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.orders ORDER BY created_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.orders (customer_id, due_amount, invoice_no, order_status, order_date, feedback_complete) VALUES (:cid, :amt, :inv, :status, :date, :fb) RETURNING *');
    $stmt->execute([
        ':cid' => $body['customer_id'] ?? null,
        ':amt' => $body['due_amount'] ?? null,
        ':inv' => $body['invoice_no'] ?? null,
        ':status' => $body['order_status'] ?? null,
        ':date' => $body['order_date'] ?? null,
        ':fb' => isset($body['feedback_complete']) ? (bool)$body['feedback_complete'] : false,
    ]);
    ok($stmt->fetch());
}

fail('Invalid method', 405);


