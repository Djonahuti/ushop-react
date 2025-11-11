<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['invoice_no'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.payments WHERE invoice_no = :inv ORDER BY created_at DESC');
        $stmt->execute([':inv' => $_GET['invoice_no']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.payments ORDER BY created_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.payments (invoice_no, amount, payment_mode, ref_no, bank_id, payment_date) VALUES (:inv, :amt, :mode, :ref, :bank, :date) RETURNING *');
    $stmt->execute([
        ':inv' => $body['invoice_no'] ?? null,
        ':amt' => $body['amount'] ?? null,
        ':mode' => $body['payment_mode'] ?? 'offline',
        ':ref' => $body['ref_no'] ?? null,
        ':bank' => $body['bank_id'] ?? null,
        ':date' => $body['payment_date'] ?? null,
    ]);
    ok($stmt->fetch());
}

fail('Invalid method', 405);


