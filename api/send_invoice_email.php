<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid method', 405);
}

$body = json_input();
$orderId = $body['order_id'] ?? null;

if (!$orderId) {
    fail('order_id is required');
}

try {
    // Get order details
    $stmt = $pdo->prepare('SELECT * FROM public.orders WHERE order_id = :oid');
    $stmt->execute([':oid' => (int)$orderId]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        fail('Order not found');
    }
    
    // Get customer details
    $stmt = $pdo->prepare('SELECT customer_name, customer_email FROM public.customers WHERE customer_id = :cid');
    $stmt->execute([':cid' => (int)$order['customer_id']]);
    $customer = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$customer) {
        fail('Customer not found');
    }
    
    // Get order items
    $stmt = $pdo->prepare('SELECT oi.*, p.product_title FROM public.order_items oi LEFT JOIN public.products p ON oi.product_id = p.product_id WHERE oi.order_id = :oid');
    $stmt->execute([':oid' => (int)$orderId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $orderDetails = [];
    foreach ($items as $item) {
        $orderDetails[] = [
            'product_title' => $item['product_title'] ?? 'Unknown Product',
            'qty' => $item['qty'],
            'price' => $item['p_price'] ?? 0,
        ];
    }
    
    // Send invoice email
    $mailData = [
        'action' => 'invoice',
        'email' => $customer['customer_email'],
        'name' => $customer['customer_name'],
        'invoice_no' => $order['invoice_no'],
        'order_details' => $orderDetails,
        'total_amount' => $order['due_amount'],
    ];
    
    $ch = curl_init('https://ushop.com.ng/mail/mailto.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($mailData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $result = curl_exec($ch);
    curl_close($ch);
    
    ok(['sent' => true, 'message' => 'Invoice email sent successfully']);
} catch (PDOException $e) {
    fail('Error: ' . $e->getMessage(), 500);
}

