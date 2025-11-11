<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    fail('Invalid method', 405);
}

$stmt = $pdo->query('SELECT subject_id, subject FROM public.subject ORDER BY subject_id ASC');
ok($stmt->fetchAll());


