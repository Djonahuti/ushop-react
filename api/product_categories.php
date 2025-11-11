<?php
require_once __DIR__ . '/config.php';

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM public.product_categories ORDER BY p_cat_id DESC');
        ok($stmt->fetchAll());
    case 'POST':
        $body = json_input();
        $stmt = $pdo->prepare('INSERT INTO public.product_categories (p_cat_title, p_cat_top, p_cat_image) VALUES (:title, :top, :image) RETURNING *');
        $stmt->execute([
            ':title' => $body['p_cat_title'] ?? null,
            ':top' => isset($body['p_cat_top']) ? (bool)$body['p_cat_top'] : null,
            ':image' => $body['p_cat_image'] ?? null,
        ]);
        ok($stmt->fetch());
    default:
        fail('Invalid method', 405);
}


