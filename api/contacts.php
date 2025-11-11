<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['customer_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.contacts WHERE customer_id = :cid ORDER BY submitted_at DESC');
        $stmt->execute([':cid' => (int)$_GET['customer_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.contacts ORDER BY submitted_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.contacts (subject_id, message, customer_id, is_starred, is_read) VALUES (:sid, :msg, :cid, :star, :read) RETURNING *');
    $stmt->execute([
        ':sid' => $body['subject_id'] ?? null,
        ':msg' => $body['message'] ?? null,
        ':cid' => $body['customer_id'] ?? null,
        ':star' => isset($body['is_starred']) ? (bool)$body['is_starred'] : false,
        ':read' => isset($body['is_read']) ? (bool)$body['is_read'] : false,
    ]);
    ok($stmt->fetch());
}

fail('Invalid method', 405);


