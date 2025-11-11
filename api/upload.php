<?php
// Handle file uploads to /uploads
require_once __DIR__ . '/config.php';

// Allow only POST with multipart/form-data
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid method', 405);
}

if (!isset($_FILES['file'])) {
    fail('No file provided');
}

// Resolve uploads directory relative to domain root
$uploadsDir = realpath(__DIR__ . '/../uploads');
if ($uploadsDir === false) {
    fail('Uploads directory not found on server', 500);
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    fail('Upload error: ' . $file['error']);
}

// Sanitize filename and ensure uniqueness
$originalName = basename($file['name']);
$safeName = preg_replace('/[^A-Za-z0-9_\.-]/', '_', $originalName);
$ext = pathinfo($safeName, PATHINFO_EXTENSION);
$base = pathinfo($safeName, PATHINFO_FILENAME);
$unique = $base . '_' . time() . '_' . bin2hex(random_bytes(4));
$finalName = $unique . ($ext ? ('.' . $ext) : '');

$targetPath = $uploadsDir . DIRECTORY_SEPARATOR . $finalName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    fail('Failed to move uploaded file', 500);
}

// Build public relative URL path from domain root
$publicPath = 'uploads/' . $finalName;

ok(['path' => $publicPath]);


