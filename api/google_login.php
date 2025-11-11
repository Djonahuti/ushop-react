<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$idToken = $input['id_token'] ?? '';

if (!$idToken) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'id_token is required']);
    exit;
}

// Verify the token with Google
$verifyUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);
$verifyResponse = @file_get_contents($verifyUrl);
if ($verifyResponse === false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Failed to verify token with Google']);
    exit;
}
$payload = json_decode($verifyResponse, true);
if (!$payload || !isset($payload['aud']) || !isset($payload['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid Google token payload']);
    exit;
}

// Optional: Validate audience matches configured client id (if provided)
$expectedClientId = getenv('GOOGLE_CLIENT_ID') ?: null;
if ($expectedClientId && $payload['aud'] !== $expectedClientId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Token audience mismatch']);
    exit;
}

$email = $payload['email'];
$name = $payload['name'] ?? ($payload['given_name'] ?? '');
$sub = $payload['sub'] ?? null;

try {
    // Check if email belongs to an admin
    $stmt = $pdo->prepare('SELECT admin_id, admin_name FROM public.admins WHERE admin_email = :email');
    $stmt->execute([':email' => $email]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($admin) {
        // Update admin name if provided and different
        if ($name && $name !== $admin['admin_name']) {
            $upd = $pdo->prepare('UPDATE public.admins SET admin_name = :name WHERE admin_email = :email');
            $upd->execute([':name' => $name, ':email' => $email]);
        }
        echo json_encode(['success' => true, 'role' => 'admin', 'email' => $email, 'name' => $name ?: $admin['admin_name']]);
        exit;
    }

    // Check if email belongs to a seller
    $stmt = $pdo->prepare('SELECT seller_id, seller_name FROM public.sellers WHERE seller_email = :email');
    $stmt->execute([':email' => $email]);
    $seller = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($seller) {
        // Update seller name if provided and different
        if ($name && $name !== $seller['seller_name']) {
            $upd = $pdo->prepare('UPDATE public.sellers SET seller_name = :name WHERE seller_email = :email');
            $upd->execute([':name' => $name, ':email' => $email]);
        }
        echo json_encode(['success' => true, 'role' => 'seller', 'email' => $email, 'name' => $name ?: $seller['seller_name']]);
        exit;
    }

    // Check if customer exists
    $stmt = $pdo->prepare('SELECT customer_id FROM public.customers WHERE customer_email = :email');
    $stmt->execute([':email' => $email]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // Update provider fields if available
        $upd = $pdo->prepare('UPDATE public.customers SET provider = :provider, provider_id = :provider_id WHERE customer_email = :email');
        $upd->execute([':provider' => 'google', ':provider_id' => $sub, ':email' => $email]);

        echo json_encode(['success' => true, 'role' => 'customer', 'email' => $email, 'name' => $name]);
        exit;
    }

    // Create customer if not already an admin or seller
    $ins = $pdo->prepare('INSERT INTO public.customers (customer_name, customer_email, provider, provider_id, customer_verified) VALUES (:name, :email, :provider, :provider_id, true) RETURNING customer_id');
    $ins->execute([
        ':name' => $name ?: $email,
        ':email' => $email,
        ':provider' => 'google',
        ':provider_id' => $sub,
    ]);
    $created = $ins->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'role' => 'customer',
        'email' => $email,
        'name' => $name,
        'customer_id' => $created['customer_id'] ?? null
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
