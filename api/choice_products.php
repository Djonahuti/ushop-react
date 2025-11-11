<?php
require_once __DIR__ . '/config.php';


$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['choice_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.choice_products WHERE choice_id = :cid');
        $stmt->execute([':cid' => (int)$_GET['choice_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.choice_products ORDER BY choice_product_id DESC');
    ok($stmt->fetchAll());
}

if ($method === 'DELETE') {
    if (!isset($_GET['choice_id'])) fail('choice_id required');
    $stmt = $pdo->prepare('DELETE FROM public.choice_products WHERE choice_id = :cid');
    $stmt->execute([':cid' => (int)$_GET['choice_id']]);
    ok(['deleted' => true]);
}

fail('Invalid method', 405);


