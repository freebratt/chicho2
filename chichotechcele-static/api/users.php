<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/session.php';

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Zoznam všetkých používateľov (admin only)
if ($method === 'GET' && !isset($_GET['id'])) {
    Session::requireAdmin();

    $users = $db->fetchAll('
        SELECT 
            id,
            name,
            email,
            role,
            created_at,
            last_login,
            total_visits
        FROM users
        ORDER BY created_at DESC
    ');

    echo json_encode(['users' => $users]);
    exit();
}

// GET - Detail používateľa
if ($method === 'GET' && isset($_GET['id'])) {
    Session::requireAdmin();

    $user = $db->fetchOne('SELECT * FROM users WHERE id = ?', [$_GET['id']]);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'Používateľ nenájdený']);
        exit();
    }

    // Odstráň password hash z odpovede
    unset($user['password_hash']);

    echo json_encode(['user' => $user]);
    exit();
}

// POST - Vytvor nového používateľa
if ($method === 'POST') {
    Session::requireAdmin();

    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['name']) || empty($data['email']) || empty($data['password']) || empty($data['role'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Všetky polia sú povinné']);
        exit();
    }

    // Skontroluj či email už existuje
    $existing = $db->fetchOne('SELECT id FROM users WHERE email = ?', [$data['email']]);
    if ($existing) {
        http_response_code(400);
        echo json_encode(['error' => 'Email už existuje']);
        exit();
    }

    $passwordHash = hash('sha256', $data['password'] . PASSWORD_SALT);

    $db->query('
        INSERT INTO users (name, email, password_hash, role, created_at, total_visits)
        VALUES (?, ?, ?, ?, ?, 0)
    ', [
        $data['name'],
        $data['email'],
        $passwordHash,
        $data['role'],
        time()
    ]);

    $userId = $db->lastInsertId();

    echo json_encode(['success' => true, 'userId' => $userId]);
    exit();
}

// PUT - Aktualizuj používateľa
if ($method === 'PUT') {
    Session::requireAdmin();

    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id']) || empty($data['name']) || empty($data['email']) || empty($data['role'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID, meno, email a rola sú povinné']);
        exit();
    }

    // Ak sa mení heslo
    if (!empty($data['password'])) {
        $passwordHash = hash('sha256', $data['password'] . PASSWORD_SALT);
        $db->query('
            UPDATE users 
            SET name = ?, email = ?, password_hash = ?, role = ?
            WHERE id = ?
        ', [
            $data['name'],
            $data['email'],
            $passwordHash,
            $data['role'],
            $data['id']
        ]);
    } else {
        $db->query('
            UPDATE users 
            SET name = ?, email = ?, role = ?
            WHERE id = ?
        ', [
            $data['name'],
            $data['email'],
            $data['role'],
            $data['id']
        ]);
    }

    echo json_encode(['success' => true]);
    exit();
}

// DELETE - Vymaž používateľa
if ($method === 'DELETE') {
    Session::requireAdmin();

    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID je povinné']);
        exit();
    }

    // Nemôžeš vymazať sám seba
    $currentUser = Session::getUser();
    if ($currentUser['id'] == $data['id']) {
        http_response_code(400);
        echo json_encode(['error' => 'Nemôžete vymazať svoj vlastný účet']);
        exit();
    }

    $db->query('DELETE FROM users WHERE id = ?', [$data['id']]);

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
