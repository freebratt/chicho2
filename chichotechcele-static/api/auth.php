<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/session.php';

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

// Login
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email a heslo sú povinné']);
        exit();
    }

    // Nájdi používateľa
    $user = $db->fetchOne(
        'SELECT * FROM users WHERE email = ?',
        [$email]
    );

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Nesprávne prihlasovacie údaje']);
        exit();
    }

    // Overiť heslo
    $passwordHash = hash('sha256', $password . PASSWORD_SALT);
    
    if ($passwordHash !== $user['password_hash']) {
        http_response_code(401);
        echo json_encode(['error' => 'Nesprávne prihlasovacie údaje']);
        exit();
    }

    // Aktualizovať last login
    $db->query(
        'UPDATE users SET last_login = ?, total_visits = total_visits + 1 WHERE id = ?',
        [time(), $user['id']]
    );

    // Prihlás používateľa
    Session::login($user);

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
    exit();
}

// Logout
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'logout') {
    Session::logout();
    echo json_encode(['success' => true]);
    exit();
}

// Check auth status
if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'check') {
    if (Session::isLoggedIn()) {
        echo json_encode([
            'loggedIn' => true,
            'user' => Session::getUser()
        ]);
    } else {
        echo json_encode([
            'loggedIn' => false
        ]);
    }
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
