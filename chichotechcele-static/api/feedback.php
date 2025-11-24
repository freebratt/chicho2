<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/session.php';

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Zoznam pripomienok
if ($method === 'GET' && !isset($_GET['id'])) {
    Session::requireLogin();

    $user = Session::getUser();
    
    if ($user['role'] === 'admin') {
        // Admin vidí všetky pripomienky
        $pripomienky = $db->fetchAll('
            SELECT 
                p.*,
                u.name as user_name,
                u.email as user_email,
                n.nazov as navod_nazov,
                n.slug as navod_slug
            FROM pripomienky p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN navody n ON p.navod_id = n.id
            ORDER BY p.created_at DESC
        ');
    } else {
        // Pracovníci vidia len svoje
        $pripomienky = $db->fetchAll('
            SELECT 
                p.*,
                n.nazov as navod_nazov,
                n.slug as navod_slug
            FROM pripomienky p
            LEFT JOIN navody n ON p.navod_id = n.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        ', [$user['id']]);
    }

    echo json_encode(['pripomienky' => $pripomienky]);
    exit();
}

// GET - Pripomienky pre konkrétny návod
if ($method === 'GET' && isset($_GET['navod_id'])) {
    Session::requireLogin();

    $pripomienky = $db->fetchAll('
        SELECT 
            p.*,
            u.name as user_name,
            u.email as user_email
        FROM pripomienky p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.navod_id = ?
        ORDER BY p.created_at DESC
    ', [$_GET['navod_id']]);

    echo json_encode(['pripomienky' => $pripomienky]);
    exit();
}

// POST - Vytvor pripomienku
if ($method === 'POST') {
    Session::requireLogin();

    $data = json_decode(file_get_contents('php://input'), true);
    $user = Session::getUser();

    if (empty($data['navod_id']) || empty($data['sprava'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Návod ID a správa sú povinné']);
        exit();
    }

    $db->query('
        INSERT INTO pripomienky (navod_id, user_id, sprava, cislo_kroku, stav, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ', [
        $data['navod_id'],
        $user['id'],
        $data['sprava'],
        $data['cislo_kroku'] ?? null,
        'nevybavena',
        time()
    ]);

    $feedbackId = $db->lastInsertId();

    echo json_encode(['success' => true, 'id' => $feedbackId]);
    exit();
}

// PUT - Vyriešiť pripomienku (admin only)
if ($method === 'PUT') {
    Session::requireAdmin();

    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID je povinné']);
        exit();
    }

    $db->query('
        UPDATE pripomienky 
        SET stav = ?, resolved_at = ?
        WHERE id = ?
    ', [
        'vybavena',
        time(),
        $data['id']
    ]);

    echo json_encode(['success' => true]);
    exit();
}

// DELETE - Vymaž pripomienku (admin only)
if ($method === 'DELETE') {
    Session::requireAdmin();

    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID je povinné']);
        exit();
    }

    $db->query('DELETE FROM pripomienky WHERE id = ?', [$data['id']]);

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
