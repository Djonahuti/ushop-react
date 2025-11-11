<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    fail('Invalid method', 405);
}

$stmt = $pdo->query('SELECT * FROM public.banks ORDER BY bank_id ASC');
ok($stmt->fetchAll());


