<?php
header('Content-Type: application/json');
echo json_encode([
    'message' => 'Hello from envlock + PHP',
    'secret'  => getenv('API_SECRET') ? '[set]' : '[missing]',
    'env'     => getenv('APP_ENV') ?: 'unknown',
]);
