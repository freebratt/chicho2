<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/session.php';

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Zoznam všetkých návodov
if ($method === 'GET' && !isset($_GET['slug'])) {
    Session::requireLogin();

    $navody = $db->fetchAll('
        SELECT 
            n.id,
            n.nazov,
            n.slug,
            n.video_url,
            n.created_at,
            n.updated_at
        FROM navody n
        ORDER BY n.updated_at DESC
    ');

    // Pre každý návod načítaj tagy
    foreach ($navody as &$navod) {
        // Typ práce
        $typPrace = $db->fetchAll('
            SELECT t.name 
            FROM tags t
            JOIN navod_typ_prace ntp ON t.id = ntp.tag_id
            WHERE ntp.navod_id = ?
        ', [$navod['id']]);
        $navod['typPrace'] = array_column($typPrace, 'name');

        // Produkt
        $produkt = $db->fetchAll('
            SELECT t.name 
            FROM tags t
            JOIN navod_produkt np ON t.id = np.tag_id
            WHERE np.navod_id = ?
        ', [$navod['id']]);
        $navod['produkt'] = array_column($produkt, 'name');
    }

    echo json_encode(['navody' => $navody]);
    exit();
}

// GET - Detail návodu podľa slug
if ($method === 'GET' && isset($_GET['slug'])) {
    Session::requireLogin();

    $slug = $_GET['slug'];
    
    $navod = $db->fetchOne('
        SELECT * FROM navody WHERE slug = ?
    ', [$slug]);

    if (!$navod) {
        http_response_code(404);
        echo json_encode(['error' => 'Návod nenájdený']);
        exit();
    }

    // Načítaj všetky súvisiace dáta
    $navod['typPrace'] = array_column($db->fetchAll('
        SELECT t.name FROM tags t
        JOIN navod_typ_prace ntp ON t.id = ntp.tag_id
        WHERE ntp.navod_id = ?
    ', [$navod['id']]), 'name');

    $navod['produkt'] = array_column($db->fetchAll('
        SELECT t.name FROM tags t
        JOIN navod_produkt np ON t.id = np.tag_id
        WHERE np.navod_id = ?
    ', [$navod['id']]), 'name');

    $navod['potrebneNaradie'] = $db->fetchAll('
        SELECT popis FROM navod_naradie
        WHERE navod_id = ?
        ORDER BY order_num
    ', [$navod['id']]);

    $navod['postupPrace'] = $db->fetchAll('
        SELECT cislo, popis FROM navod_kroky
        WHERE navod_id = ?
        ORDER BY cislo
    ', [$navod['id']]);

    $navod['naCoSiDatPozor'] = $db->fetchAll('
        SELECT popis FROM navod_pozor
        WHERE navod_id = ?
        ORDER BY order_num
    ', [$navod['id']]);

    $navod['casteChyby'] = $db->fetchAll('
        SELECT popis FROM navod_chyby
        WHERE navod_id = ?
        ORDER BY order_num
    ', [$navod['id']]);

    $navod['obrazky'] = $db->fetchAll('
        SELECT url, cislo_kroku, popis FROM navod_obrazky
        WHERE navod_id = ?
        ORDER BY cislo_kroku
    ', [$navod['id']]);

    echo json_encode(['navod' => $navod]);
    exit();
}

// POST - Vytvor nový návod (admin only)
if ($method === 'POST') {
    Session::requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Základné údaje
    $db->query('
        INSERT INTO navody (nazov, slug, video_url, created_at, updated_at, version)
        VALUES (?, ?, ?, ?, ?, 1)
    ', [
        $data['nazov'],
        $data['slug'],
        $data['videoUrl'] ?? null,
        time(),
        time()
    ]);
    
    $navodId = $db->lastInsertId();
    
    echo json_encode(['success' => true, 'id' => $navodId]);
    exit();
}

// PUT - Aktualizuj návod (admin only)
if ($method === 'PUT') {
    Session::requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['id']) || empty($data['nazov'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID a názov sú povinné']);
        exit();
    }
    
    $db->query('
        UPDATE navody 
        SET nazov = ?, video_url = ?, updated_at = ?
        WHERE id = ?
    ', [
        $data['nazov'],
        $data['videoUrl'] ?? null,
        time(),
        $data['id']
    ]);
    
    echo json_encode(['success' => true]);
    exit();
}

// DELETE - Vymaž návod (admin only)
if ($method === 'DELETE') {
    Session::requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID je povinné']);
        exit();
    }
    
    $db->query('DELETE FROM navody WHERE id = ?', [$data['id']]);
    
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
