<?php
require_once __DIR__ . '/config.php';

// Helper function to parse PostgreSQL array string to PHP array
// PostgreSQL arrays are returned as strings like: "{value1,value2}" or "{\"value1\",\"value2\"}"
function parse_pg_array($pg_array) {
    if (empty($pg_array) || $pg_array === null) {
        return [];
    }
    
    // If it's already an array, return it
    if (is_array($pg_array)) {
        return $pg_array;
    }
    
    // If it's not a string, return empty array
    if (!is_string($pg_array)) {
        return [];
    }
    
    // Remove outer braces
    $pg_array = trim($pg_array, '{}');
    if (empty($pg_array)) {
        return [];
    }
    
    // Handle empty array case
    if ($pg_array === 'NULL' || $pg_array === 'null') {
        return [];
    }
    
    // Try to parse as JSON first (sometimes PDO returns JSON-encoded arrays)
    $decoded = json_decode($pg_array, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return $decoded;
    }
    
    // Parse PostgreSQL array format
    $result = [];
    $current = '';
    $in_quotes = false;
    $len = strlen($pg_array);
    
    for ($i = 0; $i < $len; $i++) {
        $char = $pg_array[$i];
        
        // Check for escaped quotes
        if ($char === '"' && $i > 0 && $pg_array[$i-1] === '\\') {
            $current .= $char;
            continue;
        }
        
        // Toggle quote state
        if ($char === '"') {
            $in_quotes = !$in_quotes;
            continue;
        }
        
        // Handle comma separator (only outside quotes)
        if ($char === ',' && !$in_quotes) {
            if (!empty($current) || $current === '0' || $current === '') {
                $value = trim($current);
                // Remove surrounding quotes if present
                if (substr($value, 0, 1) === '"' && substr($value, -1) === '"') {
                    $value = substr($value, 1, -1);
                }
                // Unescape quotes
                $value = str_replace('\\"', '"', $value);
                if ($value !== '') {
                    $result[] = $value;
                }
            }
            $current = '';
            continue;
        }
        
        $current .= $char;
    }
    
    // Add last item
    if (!empty($current) || $current === '0') {
        $value = trim($current);
        if (substr($value, 0, 1) === '"' && substr($value, -1) === '"') {
            $value = substr($value, 1, -1);
        }
        $value = str_replace('\\"', '"', $value);
        if ($value !== '') {
            $result[] = $value;
        }
    }
    
    return $result;
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['product_id'])) {
            $stmt = $pdo->prepare('SELECT * FROM public.products WHERE product_id = :id');
            $stmt->execute([':id' => (int)$_GET['product_id']]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (count($result) > 0) {
                $product = $result[0];
                // Parse product_features from PostgreSQL array string to array
                if (isset($product['product_features']) && is_string($product['product_features'])) {
                    $product['product_features'] = parse_pg_array($product['product_features']);
                } elseif (!isset($product['product_features']) || $product['product_features'] === null) {
                    $product['product_features'] = [];
                }
                ok($product);
            } else {
                ok(null);
            }
        }
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare('SELECT * FROM public.products WHERE product_id = :id');
            $stmt->execute([':id' => (int)$_GET['id']]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (count($result) > 0) {
                $product = $result[0];
                // Parse product_features from PostgreSQL array string to array
                if (isset($product['product_features']) && is_string($product['product_features'])) {
                    $product['product_features'] = parse_pg_array($product['product_features']);
                } elseif (!isset($product['product_features']) || $product['product_features'] === null) {
                    $product['product_features'] = [];
                }
                ok($product);
            } else {
                ok(null);
            }
        }
        if (isset($_GET['seller_id'])) {
            $stmt = $pdo->prepare('SELECT * FROM public.products WHERE seller_id = :sid ORDER BY product_id DESC');
            $stmt->execute([':sid' => (int)$_GET['seller_id']]);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // Parse product_features for each product
            foreach ($products as &$product) {
                if (isset($product['product_features']) && is_string($product['product_features'])) {
                    $product['product_features'] = parse_pg_array($product['product_features']);
                } elseif (!isset($product['product_features']) || $product['product_features'] === null) {
                    $product['product_features'] = [];
                }
            }
            ok($products);
        }
        if (isset($_GET['manufacturer_id'])) {
            $stmt = $pdo->prepare('SELECT * FROM public.products WHERE manufacturer_id = :mid ORDER BY product_id DESC');
            $stmt->execute([':mid' => (int)$_GET['manufacturer_id']]);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // Parse product_features for each product
            foreach ($products as &$product) {
                if (isset($product['product_features']) && is_string($product['product_features'])) {
                    $product['product_features'] = parse_pg_array($product['product_features']);
                } elseif (!isset($product['product_features']) || $product['product_features'] === null) {
                    $product['product_features'] = [];
                }
            }
            ok($products);
        }
        if (isset($_GET['p_cat_id'])) {
            $stmt = $pdo->prepare('SELECT * FROM public.products WHERE p_cat_id = :pcid ORDER BY product_id DESC');
            $stmt->execute([':pcid' => (int)$_GET['p_cat_id']]);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // Parse product_features for each product
            foreach ($products as &$product) {
                if (isset($product['product_features']) && is_string($product['product_features'])) {
                    $product['product_features'] = parse_pg_array($product['product_features']);
                } elseif (!isset($product['product_features']) || $product['product_features'] === null) {
                    $product['product_features'] = [];
                }
            }
            ok($products);
        }
        $stmt = $pdo->query('SELECT * FROM public.products ORDER BY product_id DESC');
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Parse product_features for each product
        foreach ($products as &$product) {
            if (isset($product['product_features']) && is_string($product['product_features'])) {
                $product['product_features'] = parse_pg_array($product['product_features']);
            } elseif (!isset($product['product_features']) || $product['product_features'] === null) {
                $product['product_features'] = [];
            }
        }
        ok($products);
        break;
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
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        // Parse product_features from PostgreSQL array string to array
        if (isset($product['product_features']) && is_string($product['product_features'])) {
            $product['product_features'] = parse_pg_array($product['product_features']);
        } elseif (!isset($product['product_features']) || $product['product_features'] === null) {
            $product['product_features'] = [];
        }
        ok($product);
        break;
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
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        // Parse product_features from PostgreSQL array string to array
        if (isset($product['product_features']) && is_string($product['product_features'])) {
            $product['product_features'] = parse_pg_array($product['product_features']);
        } elseif (!isset($product['product_features']) || $product['product_features'] === null) {
            $product['product_features'] = [];
        }
        ok($product);
        break;
    case 'DELETE':
        $productId = $_GET['product_id'] ?? null;
        if (!$productId) fail('product_id required');
        $stmt = $pdo->prepare('DELETE FROM public.products WHERE product_id = :id');
        $stmt->execute([':id' => (int)$productId]);
        ok(['deleted' => true]);
        break;
    default:
        fail('Invalid method', 405);
}


