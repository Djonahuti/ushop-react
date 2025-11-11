<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid method', 405);
}

$body = json_input();
$invoice = $body['invoice_no'] ?? $_GET['invoice_no'] ?? null;
$status = $body['status'] ?? $_GET['status'] ?? null;
if (!$invoice || !$status) fail('invoice_no and status required');

try {
    // Get pending order and customer details before update
    $stmt = $pdo->prepare('SELECT po.*, c.customer_name, c.customer_email FROM public.pending_orders po LEFT JOIN public.customers c ON po.customer_id = c.customer_id WHERE po.invoice_no = :inv');
    $stmt->execute([':inv' => $invoice]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        fail('Pending order not found');
    }
    
    // Update pending order status
    $stmt = $pdo->prepare('UPDATE public.pending_orders SET order_status = :s WHERE invoice_no = :inv');
    $stmt->execute([':s' => $status, ':inv' => $invoice]);
    
    // Send email notification if customer exists
    if ($order['customer_email']) {
        $mailData = [
            'action' => 'order_status',
            'email' => $order['customer_email'],
            'name' => $order['customer_name'],
            'invoice_no' => $invoice,
            'status' => $status,
        ];
        
        $ch = curl_init('https://ushop.com.ng/mail/mailto.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($mailData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_exec($ch);
        curl_close($ch);
    }
    
    ok(['updated' => true]);
} catch (PDOException $e) {
    fail('Error: ' . $e->getMessage(), 500);
}


