<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email and password are required']);
    exit;
}

try {
    // Check admin
    $stmt = $pdo->prepare("SELECT admin_email, admin_name FROM public.admins WHERE admin_email = ? AND admin_pass = ?");
    $stmt->execute([$email, $password]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin) {
        echo json_encode([
            'success' => true,
            'role' => 'admin',
            'email' => $admin['admin_email'],
            'name' => $admin['admin_name']
        ]);
        exit;
    }
    
    // Check seller
    $stmt = $pdo->prepare("SELECT seller_email, seller_name FROM public.sellers WHERE seller_email = ? AND seller_pass = ?");
    $stmt->execute([$email, $password]);
    $seller = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($seller) {
        echo json_encode([
            'success' => true,
            'role' => 'seller',
            'email' => $seller['seller_email'],
            'name' => $seller['seller_name']
        ]);
        exit;
    }
    
    // Check customer
    $stmt = $pdo->prepare("SELECT customer_email, customer_name FROM public.customers WHERE customer_email = ? AND customer_pass = ?");
    $stmt->execute([$email, $password]);
    $customer = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($customer) {
        echo json_encode([
            'success' => true,
            'role' => 'customer',
            'email' => $customer['customer_email'],
            'name' => $customer['customer_name']
        ]);
        exit;
    }
    
    // No match found
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
