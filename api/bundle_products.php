<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['bundle_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM public.bundle_products WHERE bundle_id = :id');
        $stmt->execute([':id' => (int)$_GET['bundle_id']]);
        ok($stmt->fetchAll());
    }
    $stmt = $pdo->query('SELECT * FROM public.bundle_products ORDER BY bundle_id DESC');
    ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body = json_input();
    if (is_array($body) && isset($body[0])) {
        // Bulk insert
        $sql = 'INSERT INTO public.bundle_products (bundle_id, product_id, original_price, discounted_price) VALUES ';
        $values = [];
        $params = [];
        foreach ($body as $index => $item) {
            $values[] = "(:bundle_id_{$index}, :product_id_{$index}, :original_price_{$index}, :discounted_price_{$index})";
            $params[":bundle_id_{$index}"] = $item['bundle_id'] ?? null;
            $params[":product_id_{$index}"] = $item['product_id'] ?? null;
            $params[":original_price_{$index}"] = $item['original_price'] ?? null;
            $params[":discounted_price_{$index}"] = $item['discounted_price'] ?? null;
        }
        $sql .= implode(', ', $values) . ' RETURNING *';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        ok($stmt->fetchAll());
    } else {
        // Single insert
        $stmt = $pdo->prepare('INSERT INTO public.bundle_products (bundle_id, product_id, original_price, discounted_price) VALUES (:bid, :pid, :orig, :disc) RETURNING *');
        $stmt->execute([
            ':bid' => $body['bundle_id'] ?? null,
            ':pid' => $body['product_id'] ?? null,
            ':orig' => $body['original_price'] ?? null,
            ':disc' => $body['discounted_price'] ?? null,
        ]);
        ok($stmt->fetch());
    }
}

if ($method === 'DELETE') {
    $bundleId = $_GET['bundle_id'] ?? null;
    if ($bundleId) {
        $stmt = $pdo->prepare('DELETE FROM public.bundle_products WHERE bundle_id = :id');
        $stmt->execute([':id' => (int)$bundleId]);
        ok(['deleted' => true]);
    } else {
        fail('bundle_id required');
    }
}

fail('Invalid method', 405);

