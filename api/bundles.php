<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['bundle_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.bundles WHERE bundle_id = :id');
        $stmt->execute([':id' => (int)$_GET['bundle_id']]);
        ok($stmt->fetch());
    }
    if (isset($_GET['seller_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.bundles WHERE seller_id = :sid ORDER BY created_at DESC');
        $stmt->execute([':sid' => (int)$_GET['seller_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.bundles ORDER BY created_at DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    $stmt = $pdo->prepare('INSERT INTO public.bundles (seller_id, bundle_title, bundle_description, total_price) VALUES (:sid, :title, :desc, :price) RETURNING *');
    $stmt->execute([
        ':sid' => $body['seller_id'] ?? null,
        ':title' => $body['bundle_title'] ?? null,
        ':desc' => $body['bundle_description'] ?? null,
        ':price' => $body['total_price'] ?? null,
    ]);
    ok($stmt->fetch());
}

if ($method === 'PUT' || $method === 'PATCH') {
    $body = json_input();
    $bundleId = $body['bundle_id'] ?? null;
    if (!$bundleId) fail('bundle_id required');
    
    $updates = [];
    $params = [':id' => (int)$bundleId];
    
    $allowedFields = ['bundle_title', 'bundle_description', 'total_price', 'seller_id'];
    foreach ($allowedFields as $field) {
        if (isset($body[$field])) {
            $updates[] = "$field = :$field";
            $params[":$field"] = $body[$field];
        }
    }
    
    if (empty($updates)) fail('No fields to update');
    $sql = 'UPDATE public.bundles SET ' . implode(', ', $updates) . ' WHERE bundle_id = :id RETURNING *';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    ok($stmt->fetch());
}

if ($method === 'DELETE') {
    $bundleId = $_GET['bundle_id'] ?? null;
    if (!$bundleId) fail('bundle_id required');
    $stmt = $pdo->prepare('DELETE FROM public.bundles WHERE bundle_id = :id');
    $stmt->execute([':id' => (int)$bundleId]);
    ok(['deleted' => true]);
}

fail('Invalid method', 405);

