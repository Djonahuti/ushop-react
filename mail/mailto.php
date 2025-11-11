<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once __DIR__ . '/mail_helper.php';

// Database connection (using same config as API)
define('DB_HOST', 'localhost');
define('DB_NAME', 'yastvanu_shop');
define('DB_USER', 'yastvanu_ushop');
define('DB_PASS', 'Xcalibar12$');

try {
    $pdo = new PDO("pgsql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$response = ["status" => "", "message" => ""];
$mailHelper = new MailHelper();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? $_POST['action'] ?? 'contact';
    
    switch ($action) {
        case 'contact':
            // Handle contact form submission
            $customerId = $input['customer_id'] ?? $_POST['customer_id'] ?? null;
            $subjectId = $input['subject_id'] ?? $_POST['subject_id'] ?? null;
            $message = $input['message'] ?? $_POST['message'] ?? null;
            
            if (!$customerId || !$subjectId || !$message) {
        $response["status"] = "error";
                $response["message"] = "customer_id, subject_id, and message are required";
        echo json_encode($response);
        exit;
    }

            try {
                // Get customer details
                $stmt = $pdo->prepare('SELECT customer_name, customer_email FROM public.customers WHERE customer_id = :cid');
                $stmt->execute([':cid' => (int)$customerId]);
                $customer = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$customer) {
                    $response["status"] = "error";
                    $response["message"] = "Customer not found";
                    echo json_encode($response);
                    exit;
                }
                
                // Get subject
                $stmt = $pdo->prepare('SELECT subject FROM public.subject WHERE subject_id = :sid');
                $stmt->execute([':sid' => (int)$subjectId]);
                $subjectData = $stmt->fetch(PDO::FETCH_ASSOC);
                $subjectText = $subjectData['subject'] ?? 'General Inquiry';
                
                // Insert contact
                $stmt = $pdo->prepare('INSERT INTO public.contacts (subject_id, message, customer_id, is_starred, is_read) VALUES (:sid, :msg, :cid, false, false) RETURNING id');
                $stmt->execute([
                    ':sid' => (int)$subjectId,
                    ':msg' => $message,
                    ':cid' => (int)$customerId,
                ]);
                
                // Send confirmation to customer
                $mailHelper->sendContactConfirmation($customer['customer_email'], $customer['customer_name'], $subjectText);
                
                // Send notification to admin
                $mailHelper->sendContactNotification('noreply@ushop.com.ng', $customer['customer_name'], $customer['customer_email'], $subjectText, $message);
                
                $response["status"] = "success";
                $response["message"] = "Thank you for your message. An auto-reply has been sent to your email.";
            } catch (Exception $e) {
                $response["status"] = "error";
                $response["message"] = "Error: " . $e->getMessage();
            }
            break;
            
        case 'invoice':
            // Send invoice email
            $email = $input['email'] ?? $_POST['email'] ?? null;
            $name = $input['name'] ?? $_POST['name'] ?? null;
            $invoiceNo = $input['invoice_no'] ?? $_POST['invoice_no'] ?? null;
            $orderDetails = $input['order_details'] ?? $_POST['order_details'] ?? [];
            $totalAmount = $input['total_amount'] ?? $_POST['total_amount'] ?? 0;
            
            if (!$email || !$name || !$invoiceNo) {
                $response["status"] = "error";
                $response["message"] = "email, name, and invoice_no are required";
                echo json_encode($response);
                exit;
            }
            
            if ($mailHelper->sendInvoiceEmail($email, $name, $invoiceNo, $orderDetails, $totalAmount)) {
                $response["status"] = "success";
                $response["message"] = "Invoice email sent successfully";
            } else {
                $response["status"] = "error";
                $response["message"] = "Failed to send invoice email";
            }
            break;
            
        case 'order_status':
            // Send order status update email
            $email = $input['email'] ?? $_POST['email'] ?? null;
            $name = $input['name'] ?? $_POST['name'] ?? null;
            $invoiceNo = $input['invoice_no'] ?? $_POST['invoice_no'] ?? null;
            $status = $input['status'] ?? $_POST['status'] ?? null;
            
            if (!$email || !$name || !$invoiceNo || !$status) {
                $response["status"] = "error";
                $response["message"] = "email, name, invoice_no, and status are required";
                echo json_encode($response);
                exit;
            }
            
            if ($mailHelper->sendOrderStatusUpdate($email, $name, $invoiceNo, $status)) {
                $response["status"] = "success";
                $response["message"] = "Order status update email sent successfully";
            } else {
                $response["status"] = "error";
                $response["message"] = "Failed to send order status update email";
            }
            break;
            
        case 'verification':
            // Send verification email
            $email = $input['email'] ?? $_POST['email'] ?? null;
            $name = $input['name'] ?? $_POST['name'] ?? null;
            $code = $input['code'] ?? $_POST['code'] ?? null;
            
            if (!$email || !$name || !$code) {
                $response["status"] = "error";
                $response["message"] = "email, name, and code are required";
                echo json_encode($response);
                exit;
            }
            
            if ($mailHelper->sendVerificationEmail($email, $name, $code)) {
                $response["status"] = "success";
                $response["message"] = "Verification email sent successfully";
            } else {
                $response["status"] = "error";
                $response["message"] = "Failed to send verification email";
            }
            break;
            
        default:
            $response["status"] = "error";
            $response["message"] = "Invalid action";
    }
    
    echo json_encode($response);
    exit;
}

// GET request - return available actions
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    echo json_encode([
        "status" => "success",
        "message" => "Mail service is available",
        "actions" => ["contact", "invoice", "order_status", "verification"]
    ]);
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid request method"]);
exit;
