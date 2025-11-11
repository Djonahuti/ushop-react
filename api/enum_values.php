<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    fail('Invalid method', 405);
}

if (!isset($_GET['enum'])) {
    fail('enum parameter required');
}

$enum = $_GET['enum'];

$sql = "SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = :enum ORDER BY e.enumsortorder";
$stmt = $pdo->prepare($sql);
$stmt->execute([':enum' => $enum]);
$values = array_map(static fn($row) => $row['enumlabel'], $stmt->fetchAll());

ok($values);


