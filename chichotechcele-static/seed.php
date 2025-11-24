<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';

$db = Database::getInstance();

echo "🌱 Seedujem databázu...\n\n";

// 1. TAGY
echo "📌 Vytváram tagy...\n";
$tags = [
    ['vrtanie', 'typ-prace', '#3B82F6'],
    ['frézovanie', 'typ-prace', '#10B981'],
    ['montáž', 'typ-prace', '#F59E0B'],
    ['kontrola', 'typ-prace', '#EF4444'],
    ['balenie', 'typ-prace', '#8B5CF6'],
    ['jebacka', 'typ-prace', '#EC4899'],
    ['okno', 'produkt', '#06B6D4'],
    ['dvere', 'produkt', '#84CC16'],
    ['HS portál', 'produkt', '#F97316'],
    ['rám', 'produkt', '#EC4899'],
    ['geno', 'produkt', '#06B6D4'],
];

foreach ($tags as $tag) {
    $db->query('INSERT OR IGNORE INTO tags (name, typ, color) VALUES (?, ?, ?)', $tag);
}
echo "  ✅ " . count($tags) . " tagov vytvorených\n\n";

// 2. POUŽÍVATELIA
echo "👥 Vytváram používateľov...\n";
$users = [
    ['Admin User', 'admin@chicho.tech', hash('sha256', 'Chicho123' . PASSWORD_SALT), 'admin'],
    ['Ján Pracovník', 'jan.pracovnik@chicho.tech', hash('sha256', 'Chicho123' . PASSWORD_SALT), 'pracovnik'],
    ['Peter Svoboda', 'peter.svoboda@chicho.tech', hash('sha256', 'Chicho123' . PASSWORD_SALT), 'pracovnik'],
];

foreach ($users as $user) {
    $db->query(
        'INSERT OR IGNORE INTO users (name, email, password_hash, role, created_at, total_visits) VALUES (?, ?, ?, ?, ?, 0)',
        [$user[0], $user[1], $user[2], $user[3], strtotime('2025-01-01')]
    );
}
echo "  ✅ " . count($users) . " používateľov vytvorených\n\n";

// 3. NÁVODY
echo "📚 Vytváram návody...\n";

// Návod 1: Vŕtanie diery na kľučku
$db->query('INSERT OR IGNORE INTO navody (nazov, slug, video_url, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, 1)', [
    'Vŕtanie diery na kľučku – okno',
    'vrtanie-diery-na-klucku-okno',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    strtotime('2025-07-25'),
    strtotime('2025-07-25')
]);
$navod1Id = $db->lastInsertId();

// Pridaj tagy
$vrtanieTag = $db->fetchOne('SELECT id FROM tags WHERE name = ?', ['vrtanie']);
$oknoTag = $db->fetchOne('SELECT id FROM tags WHERE name = ?', ['okno']);
$db->query('INSERT OR IGNORE INTO navod_typ_prace (navod_id, tag_id) VALUES (?, ?)', [$navod1Id, $vrtanieTag['id']]);
$db->query('INSERT OR IGNORE INTO navod_produkt (navod_id, tag_id) VALUES (?, ?)', [$navod1Id, $oknoTag['id']]);

// Náradie
$naradie = [
    'Vŕtačka s vrtákom 68mm',
    'Šablóna na označenie',
    'Ceruzka na označenie'
];
foreach ($naradie as $i => $item) {
    $db->query('INSERT INTO navod_naradie (navod_id, order_num, popis) VALUES (?, ?, ?)', [$navod1Id, $i, $item]);
}

// Kroky
$kroky = [
    [1, 'Pripravte si potrebné náradie: vŕtačku, vrták 68mm, šablónu na označenie'],
    [2, 'Označte správnu stranu krídla podľa typu kľučky (ľava/pravá)'],
    [3, 'Nastavte šablónu vo výške 1050mm od spodku krídla'],
    [4, 'Označte stred diery pomocou šablóny a ceruzky'],
    [5, 'Nasaďte vrták 68mm do vŕtačky a skontrolujte jeho pevnosť'],
    [6, 'Začnite vŕtať pomaly na nízkych otáčkach'],
    [7, 'Udržujte vŕtačku kolmo na povrch krídla'],
    [8, 'Dokončite vŕtanie a očistite dieru od pilín']
];
foreach ($kroky as $krok) {
    $db->query('INSERT INTO navod_kroky (navod_id, cislo, popis) VALUES (?, ?, ?)', [$navod1Id, $krok[0], $krok[1]]);
}

// Pozor
$pozor = [
    'Vždy skontrolujte správnu stranu krídla pred vŕtaním',
    'Výška šablóny musí byť presne 1050mm od spodku',
    'Vrták musí byť ostrý a v dobrom stave',
    'Vŕtanie vykonávajte na nízkych otáčkach',
    'Udržujte vŕtačku kolmo na povrch',
    'Po vŕtaní očistite dieru od všetkých pilín'
];
foreach ($pozor as $i => $item) {
    $db->query('INSERT INTO navod_pozor (navod_id, order_num, popis) VALUES (?, ?, ?)', [$navod1Id, $i, $item]);
}

// Chyby
$chyby = [
    'Zvolená nesprávna strana krídla',
    'Nesprávna výška šablóny',
    'Zle nastavená vŕtačka - vysoké otáčky',
    'Vrták nie je kolmo na povrch',
    'Neočistená diera po vŕtaní'
];
foreach ($chyby as $i => $item) {
    $db->query('INSERT INTO navod_chyby (navod_id, order_num, popis) VALUES (?, ?, ?)', [$navod1Id, $i, $item]);
}

// Obrázky
$obrazky = [
    ['https://images.pexels.com/photos/5691660/pexels-photo-5691660.jpeg', 1, 'Označenie miesta frézovanie na profile'],
    ['https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg', 3, 'Frézovanie drážky v správnom smere']
];
foreach ($obrazky as $obr) {
    $db->query('INSERT INTO navod_obrazky (navod_id, url, cislo_kroku, popis) VALUES (?, ?, ?, ?)', [$navod1Id, $obr[0], $obr[1], $obr[2]]);
}

echo "  ✅ Návod 1: Vŕtanie diery...\n";

// Pridaj ostatné návody podobným spôsobom...
// (Montáž dverí, Frézovanie drážky, Kontrola kvality, Balenie okien, Jebacka geno)

// Návod 2: Montáž dvere
$db->query('INSERT OR IGNORE INTO navody (nazov, slug, video_url, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, 1)', [
    'Montáž dvere - kompletný postup',
    'montaz-dvere-kompletny-postup',
    null,
    strtotime('2025-07-20'),
    strtotime('2025-07-22')
]);
$navod2Id = $db->lastInsertId();
$montazTag = $db->fetchOne('SELECT id FROM tags WHERE name = ?', ['montáž']);
$dvereTag = $db->fetchOne('SELECT id FROM tags WHERE name = ?', ['dvere']);
$db->query('INSERT OR IGNORE INTO navod_typ_prace (navod_id, tag_id) VALUES (?, ?)', [$navod2Id, $montazTag['id']]);
$db->query('INSERT OR IGNORE INTO navod_produkt (navod_id, tag_id) VALUES (?, ?)', [$navod2Id, $dvereTag['id']]);

echo "  ✅ Návod 2: Montáž dverí...\n";

echo "\n✅ Seeding hotový!\n";
echo "📊 Vytvorených:\n";
echo "  - " . count($tags) . " tagov\n";
echo "  - " . count($users) . " používateľov\n";
echo "  - 2+ návodov\n\n";
echo "🔑 Prihlasovacie údaje:\n";
echo "  Admin: admin@chicho.tech / Chicho123\n";
echo "  Pracovník: jan.pracovnik@chicho.tech / Chicho123\n";
