<?php
require_once __DIR__ . '/config.php';

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM public.manufacturers ORDER BY manufacturer_id DESC');
        ok($stmt->fetchAll());
        break;
    case 'POST':
        $body = json_input();
        $stmt = $pdo->prepare('INSERT INTO public.manufacturers (manufacturer_title, manufacturer_top, manufacturer_image) VALUES (:title, :top, :image) RETURNING *');
        $stmt->execute([
            ':title' => $body['manufacturer_title'] ?? null,
            ':top' => isset($body['manufacturer_top']) ? (bool)$body['manufacturer_top'] : null,
            ':image' => $body['manufacturer_image'] ?? null,
        ]);
        ok($stmt->fetch());
        break;
    default:
        fail('Invalid method', 405);
}


