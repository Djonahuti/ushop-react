<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

class MailHelper {
    private $mail;
    
    public function __construct() {
        $this->mail = new PHPMailer(true);
        $this->mail->isSMTP();
        $this->mail->Host = 'mail.ushop.com.ng';
        $this->mail->SMTPAuth = true;
        $this->mail->Username = 'noreply@ushop.com.ng';
        $this->mail->Password = 'Xcalibar12$';
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $this->mail->Port = 465;
        $this->mail->setFrom('noreply@ushop.com.ng', 'U Shop');
    }
    
    public function getEmailStyles() {
        return "
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .email-container {
                max-width: 600px;
                margin: auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                text-align: center;
                padding: 20px 0;
            }
            .header h1 {
                margin: 0;
                font-size: 22px;
            }
            .content {
                padding: 20px;
            }
            .content h2 {
                color: #f4623a;
                margin-top: 0;
            }
            .cta {
                display: inline-block;
                padding: 10px 20px;
                color: #ffffff;
                background-color: #f4623a;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 20px;
            }
            .cta:hover {
                background-color: #f05f42;
            }
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 14px;
                color: #777777;
            }
            .footer a {
                color: #f4623a;
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }
        </style>";
    }
    
    public function sendVerificationEmail($email, $name, $verificationCode) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($email);
            $this->mail->isHTML(true);
            $this->mail->Subject = 'Verify Your U Shop Account';
            $verificationLink = "https://ushop.com.ng/verify?code=" . urlencode($verificationCode) . "&email=" . urlencode($email);
            
            $this->mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>" . $this->getEmailStyles() . "</head>
            <body>
                <div class='email-container'>
                    <div class='header'>
                        <h1>Welcome to U Shop, $name!</h1>
                        <small>Please verify your email address</small>
                    </div>
                    <div class='content'>
                        <h2>Hi $name,</h2>
                        <p>Thank you for registering with U Shop! To complete your registration, please verify your email address by clicking the button below:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='$verificationLink' class='cta'>Verify Email Address</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style='word-break: break-all; color: #666;'>$verificationLink</p>
                        <p>This verification link will expire in 24 hours.</p>
                        <p>If you did not create an account with U Shop, please ignore this email.</p>
                        <p>Warm regards,<br/>U Shop Team</p>
                    </div>
                    <div class='footer'>
                        <p>&copy; 2024 U Shop. All rights reserved.</p>
                        <p><a href='https://ushop.com.ng'>Visit Our Homepage</a></p>
                    </div>
                </div>
            </body>
            </html>";
            
            return $this->mail->send();
        } catch (Exception $e) {
            error_log("Mail Error: " . $this->mail->ErrorInfo);
            return false;
        }
    }
    
    public function sendInvoiceEmail($email, $name, $invoiceNo, $orderDetails, $totalAmount) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($email);
            $this->mail->isHTML(true);
            $this->mail->Subject = "Your Order Invoice #$invoiceNo - U Shop";
            
            $itemsHtml = '';
            foreach ($orderDetails as $item) {
                $itemsHtml .= "<tr>
                    <td>{$item['product_title']}</td>
                    <td>{$item['qty']}</td>
                    <td>₦" . number_format($item['price'], 2) . "</td>
                    <td>₦" . number_format($item['qty'] * $item['price'], 2) . "</td>
                </tr>";
            }
            
            $this->mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>" . $this->getEmailStyles() . "</head>
            <body>
                <div class='email-container'>
                    <div class='header'>
                        <h1>Order Invoice #$invoiceNo</h1>
                        <small>Thank you for your purchase!</small>
                    </div>
                    <div class='content'>
                        <h2>Hi $name,</h2>
                        <p>Thank you for your order! Below are the details of your purchase:</p>
                        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                            <thead>
                                <tr style='background-color: #f4623a; color: white;'>
                                    <th style='padding: 10px; text-align: left;'>Product</th>
                                    <th style='padding: 10px; text-align: left;'>Quantity</th>
                                    <th style='padding: 10px; text-align: left;'>Price</th>
                                    <th style='padding: 10px; text-align: left;'>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                $itemsHtml
                            </tbody>
                            <tfoot>
                                <tr style='font-weight: bold; border-top: 2px solid #f4623a;'>
                                    <td colspan='3' style='padding: 10px; text-align: right;'>Total Amount:</td>
                                    <td style='padding: 10px;'>₦" . number_format($totalAmount, 2) . "</td>
                                </tr>
                            </tfoot>
                        </table>
                        <p>We will process your order and notify you once it's shipped.</p>
                        <p>Warm regards,<br/>U Shop Team</p>
                    </div>
                    <div class='footer'>
                        <p>&copy; 2024 U Shop. All rights reserved.</p>
                        <p><a href='https://ushop.com.ng'>Visit Our Homepage</a></p>
                    </div>
                </div>
            </body>
            </html>";
            
            return $this->mail->send();
        } catch (Exception $e) {
            error_log("Mail Error: " . $this->mail->ErrorInfo);
            return false;
        }
    }
    
    public function sendOrderStatusUpdate($email, $name, $invoiceNo, $status) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($email);
            $this->mail->isHTML(true);
            
            $statusMessages = [
                'pending' => 'Your order is being processed',
                'processing' => 'Your order is being prepared',
                'shipped' => 'Your order has been shipped',
                'delivered' => 'Your order has been delivered',
                'cancelled' => 'Your order has been cancelled'
            ];
            
            $statusMessage = $statusMessages[$status] ?? 'Your order status has been updated';
            $this->mail->Subject = "Order #$invoiceNo Status Update - U Shop";
            
            $this->mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>" . $this->getEmailStyles() . "</head>
            <body>
                <div class='email-container'>
                    <div class='header'>
                        <h1>Order Status Update</h1>
                        <small>Order #$invoiceNo</small>
                    </div>
                    <div class='content'>
                        <h2>Hi $name,</h2>
                        <p>$statusMessage.</p>
                        <p><strong>Order Number:</strong> #$invoiceNo</p>
                        <p><strong>Status:</strong> " . ucfirst($status) . "</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='https://ushop.com.ng/my-orders' class='cta'>View Order Details</a>
                        </div>
                        <p>If you have any questions, please don't hesitate to contact us.</p>
                        <p>Warm regards,<br/>U Shop Team</p>
                    </div>
                    <div class='footer'>
                        <p>&copy; 2024 U Shop. All rights reserved.</p>
                        <p><a href='https://ushop.com.ng'>Visit Our Homepage</a></p>
                    </div>
                </div>
            </body>
            </html>";
            
            return $this->mail->send();
        } catch (Exception $e) {
            error_log("Mail Error: " . $this->mail->ErrorInfo);
            return false;
        }
    }
    
    public function sendContactConfirmation($email, $name, $subject) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($email);
            $this->mail->isHTML(true);
            $this->mail->Subject = 'Thank you for contacting us!';
            
            $this->mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>" . $this->getEmailStyles() . "</head>
            <body>
                <div class='email-container'>
                    <div class='header'>
                        <h1>Dear $name,</h1>
                        <small>You are a valued Customer!</small>
                    </div>
                    <div class='content'>
                        <h2>Hi $name,</h2>
                        <p>Thank you for contacting U Shop regarding: <strong>$subject</strong></p>
                        <p>This is a system-generated reply sent on receipt of your message.</p>
                        <p>Our goal is to respond to your message within 24hrs; But given the unusual high volume of messages we have received; it might take us longer than usual to respond.<br/>
                        Nevertheless, be assured that we will reply as soon as we can.</p>
                        <p>Please feel free to reach out if you have any further inquiries or need assistance.</p>
                        <p>Warm regards,<br/>U Shop</p>
                    </div>
                    <div class='content'>
                        <h2>Explore U Shop</h2>
                        <a href='https://ushop.com.ng' target='_blank'>
                            <img src='https://ushop.com.ng/img/ushop.PNG' alt='Homepage Preview' style='width:100%; border-radius: 8px;'>
                        </a>
                        <p style='text-align: center; margin-top: 10px;'>Discover the latest deals and products!</p>
                    </div>
                    <div class='footer'>
                        <p>&copy; 2024 U Shop. All rights reserved.</p>
                        <p><a href='https://ushop.com.ng'>Visit Our Homepage</a></p>
                    </div>
                </div>
            </body>
            </html>";
            
            return $this->mail->send();
        } catch (Exception $e) {
            error_log("Mail Error: " . $this->mail->ErrorInfo);
            return false;
        }
    }
    
    public function sendContactNotification($adminEmail, $customerName, $customerEmail, $subject, $message) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($adminEmail);
            $this->mail->isHTML(true);
            $this->mail->Subject = 'New Contact Form Submission';
            
            $this->mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>" . $this->getEmailStyles() . "</head>
            <body>
                <div class='email-container'>
                    <div class='header'>
                        <h1>New contact form submission:</h1>
                    </div>
                    <div class='content'>
                        <h2>Contact Details</h2>
                        <p><strong>Name:</strong> $customerName</p>
                        <p><strong>Email:</strong> $customerEmail</p>
                        <p><strong>Subject:</strong> $subject</p>
                        <p><strong>Message:</strong> $message</p>
                    </div>
                    <div class='footer'>
                        <p>&copy; 2024 U Shop. All rights reserved.</p>
                        <p><a href='https://ushop.com.ng'>Visit Our Homepage</a></p>
                    </div>
                </div>
            </body>
            </html>";
            
            return $this->mail->send();
        } catch (Exception $e) {
            error_log("Mail Error: " . $this->mail->ErrorInfo);
            return false;
        }
    }
}

