<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid method', 405);
}

$oid = isset($_GET['order_id']) ? (int)$_GET['order_id'] : null;
$feedbackComplete = isset($_GET['feedback_complete']) ? (bool)$_GET['feedback_complete'] : null;
if (!$oid) fail('order_id required');

if ($feedbackComplete !== null) {
    $stmt = $pdo->prepare('UPDATE public.orders SET feedback_complete = :fb WHERE order_id = :oid');
    $stmt->execute([':fb' => $feedbackComplete, ':oid' => $oid]);
    ok(['updated' => true]);
}

fail('No update applied', 400);


