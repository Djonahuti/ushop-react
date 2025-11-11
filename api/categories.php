<?php
require_once __DIR__ . '/config.php';

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM public.categories ORDER BY cat_id DESC');
        ok($stmt->fetchAll());
    case 'POST':
        $body = json_input();
        $stmt = $pdo->prepare('INSERT INTO public.categories (cat_title, cat_top, cat_image) VALUES (:title, :top, :image) RETURNING *');
        $stmt->execute([
            ':title' => $body['cat_title'] ?? null,
            ':top' => isset($body['cat_top']) ? (bool)$body['cat_top'] : null,
            ':image' => $body['cat_image'] ?? null,
        ]);
        ok($stmt->fetch());
    default:
        fail('Invalid method', 405);
}


