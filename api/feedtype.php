<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    fail('Invalid method', 405);
}

$stmt = $pdo->query('SELECT feedtype_id, feedback_type FROM public.feedtype ORDER BY feedtype_id ASC');
ok($stmt->fetchAll());


