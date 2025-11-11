<?php
require_once __DIR__ . '/config.php';

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['product_id'])) {
            $stmt = $pdo->prepare('SELECT * FROM public.products WHERE product_id = :id');
            $stmt->execute([':id' => (int)$_GET['product_id']]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            ok(count($result) > 0 ? $result[0] : null);
        }
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare('SELECT * FROM public.products WHERE product_id = :id');
            $stmt->execute([':id' => (int)$_GET['id']]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            ok(count($result) > 0 ? $result[0] : null);
        }
        if (isset($_GET['seller_id'])) {
            $stmt = $pdo->prepare('SELECT * FROM public.products WHERE seller_id = :sid ORDER BY product_id DESC');
            $stmt->execute([':sid' => (int)$_GET['seller_id']]);
            ok($stmt->fetchAll());
        }
        if (isset($_GET['manufacturer_id'])) {
            $stmt = $pdo->prepare('SELECT * FROM public.products WHERE manufacturer_id = :mid ORDER BY product_id DESC');
            $stmt->execute([':mid' => (int)$_GET['manufacturer_id']]);
            ok($stmt->fetchAll());
        }
        if (isset($_GET['p_cat_id'])) {
            $stmt = $pdo->prepare('SELECT * FROM public.products WHERE p_cat_id = :pcid ORDER BY product_id DESC');
            $stmt->execute([':pcid' => (int)$_GET['p_cat_id']]);
            ok($stmt->fetchAll());
        }
        $stmt = $pdo->query('SELECT * FROM public.products ORDER BY product_id DESC');
        ok($stmt->fetchAll());
    case 'POST':
        $body = json_input();
        $sql = 'INSERT INTO public.products (
            product_title, product_price, product_desc, product_keywords, product_label,
            status, product_psp_price, product_features, product_url, product_video,
            product_img1, product_img2, product_img3, cat_id, manufacturer_id, p_cat_id,
            seller_id, item_qty
        ) VALUES (
            :title, :price, :desc, :keywords, :label,
            :status, :psp, :features, :url, :video,
            :img1, :img2, :img3, :cat, :manu, :pcat,
            :seller, :qty
        ) RETURNING *';

        $stmt = $pdo->prepare($sql);
        $features = isset($body['product_features']) && is_array($body['product_features']) ? '{' . implode(',', array_map(fn($s) => '"' . str_replace('"', '\"', $s) . '"', $body['product_features'])) . '}' : null;

        $stmt->execute([
            ':title' => $body['product_title'] ?? null,
            ':price' => $body['product_price'] ?? null,
            ':desc' => $body['product_desc'] ?? null,
            ':keywords' => $body['product_keywords'] ?? null,
            ':label' => $body['product_label'] ?? null,
            ':status' => $body['status'] ?? null,
            ':psp' => $body['product_psp_price'] ?? null,
            ':features' => $features,
            ':url' => $body['product_url'] ?? null,
            ':video' => $body['product_video'] ?? null,
            ':img1' => $body['product_img1'] ?? null,
            ':img2' => $body['product_img2'] ?? null,
            ':img3' => $body['product_img3'] ?? null,
            ':cat' => $body['cat_id'] ?? null,
            ':manu' => $body['manufacturer_id'] ?? null,
            ':pcat' => $body['p_cat_id'] ?? null,
            ':seller' => $body['seller_id'] ?? null,
            ':qty' => $body['item_qty'] ?? 0,
        ]);
        ok($stmt->fetch());
    case 'PUT':
    case 'PATCH':
        $body = json_input();
        $productId = $body['product_id'] ?? null;
        if (!$productId) fail('product_id required');
        
        $updates = [];
        $params = [':id' => (int)$productId];
        
        $allowedFields = ['product_title', 'product_price', 'product_desc', 'product_keywords', 'product_label', 'status', 'product_psp_price', 'product_url', 'product_video', 'product_img1', 'product_img2', 'product_img3', 'cat_id', 'manufacturer_id', 'p_cat_id', 'item_qty'];
        foreach ($allowedFields as $field) {
            if (isset($body[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $body[$field];
            }
        }
        if (isset($body['product_features']) && is_array($body['product_features'])) {
            $updates[] = "product_features = :features";
            $params[':features'] = '{' . implode(',', array_map(fn($s) => '"' . str_replace('"', '\"', $s) . '"', $body['product_features'])) . '}';
        }
        
        if (empty($updates)) fail('No fields to update');
        $sql = 'UPDATE public.products SET ' . implode(', ', $updates) . ' WHERE product_id = :id RETURNING *';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        ok($stmt->fetch());
    case 'DELETE':
        $productId = $_GET['product_id'] ?? null;
        if (!$productId) fail('product_id required');
        $stmt = $pdo->prepare('DELETE FROM public.products WHERE product_id = :id');
        $stmt->execute([':id' => (int)$productId]);
        ok(['deleted' => true]);
    default:
        fail('Invalid method', 405);
}


