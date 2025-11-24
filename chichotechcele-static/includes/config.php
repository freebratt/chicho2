<?php
// Konfigurácia aplikácie
define('DB_PATH', __DIR__ . '/../data/chicho.db');
define('SESSION_NAME', 'CHICHO_SESSION');
define('SESSION_LIFETIME', 3600 * 24); // 24 hodín

// Bezpečnostné nastavenia
define('PASSWORD_SALT', 'chicho_2025_secure_salt');

// Časová zóna
date_default_timezone_set('Europe/Bratislava');

// Error reporting (vypnuté v produkcii)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers pre local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
