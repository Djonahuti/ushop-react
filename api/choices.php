<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['choice_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.choices WHERE choice_id = :cid');
        $stmt->execute([':cid' => (int)$_GET['choice_id']]);
        ok($stmt->fetch());
    }
    if (isset($_GET['customer_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.choices WHERE customer_id = :cust ORDER BY created_at DESC');
        $stmt->execute([':cust' => (int)$_GET['customer_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.choices ORDER BY created_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'DELETE') {
    if (!isset($_GET['choice_id'])) fail('choice_id required');
    $stmt = $pdo->prepare('DELETE FROM public.choices WHERE choice_id = :cid');
    $stmt->execute([':cid' => (int)$_GET['choice_id']]);
    ok(['deleted' => true]);
}

fail('Invalid method', 405);


