<?php
require_once __DIR__ . '/config.php';

class Database {
    private static $instance = null;
    private $db;

    private function __construct() {
        try {
            // Vytvor data priečinok ak neexistuje
            $dataDir = dirname(DB_PATH);
            if (!file_exists($dataDir)) {
                mkdir($dataDir, 0777, true);
            }

            $this->db = new PDO('sqlite:' . DB_PATH);
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Povoliť foreign keys
            $this->db->exec('PRAGMA foreign_keys = ON;');
            
            $this->initDatabase();
        } catch (PDOException $e) {
            die('Database connection failed: ' . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->db;
    }

    private function initDatabase() {
        $sql = "
        -- Používatelia
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT CHECK(role IN ('admin', 'pracovnik')) NOT NULL,
            created_at INTEGER NOT NULL,
            last_login INTEGER,
            total_visits INTEGER DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

        -- Tagy
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            typ TEXT CHECK(typ IN ('typ-prace', 'produkt', 'pozicia')) NOT NULL,
            color TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
        CREATE INDEX IF NOT EXISTS idx_tags_typ ON tags(typ);

        -- Návody
        CREATE TABLE IF NOT EXISTS navody (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nazov TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            video_url TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            version INTEGER DEFAULT 1
        );

        CREATE INDEX IF NOT EXISTS idx_navody_slug ON navody(slug);

        -- Prepojenie návod <-> tag (typ práce)
        CREATE TABLE IF NOT EXISTS navod_typ_prace (
            navod_id INTEGER,
            tag_id INTEGER,
            FOREIGN KEY (navod_id) REFERENCES navody(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
            PRIMARY KEY (navod_id, tag_id)
        );

        -- Prepojenie návod <-> tag (produkt)
        CREATE TABLE IF NOT EXISTS navod_produkt (
            navod_id INTEGER,
            tag_id INTEGER,
            FOREIGN KEY (navod_id) REFERENCES navody(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
            PRIMARY KEY (navod_id, tag_id)
        );

        -- Potrebné náradie
        CREATE TABLE IF NOT EXISTS navod_naradie (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            navod_id INTEGER,
            order_num INTEGER NOT NULL,
            popis TEXT NOT NULL,
            FOREIGN KEY (navod_id) REFERENCES navody(id) ON DELETE CASCADE
        );

        -- Postup práce - kroky
        CREATE TABLE IF NOT EXISTS navod_kroky (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            navod_id INTEGER,
            cislo INTEGER NOT NULL,
            popis TEXT NOT NULL,
            FOREIGN KEY (navod_id) REFERENCES navody(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_kroky_navod ON navod_kroky(navod_id, cislo);

        -- Na čo si dať pozor
        CREATE TABLE IF NOT EXISTS navod_pozor (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            navod_id INTEGER,
            order_num INTEGER NOT NULL,
            popis TEXT NOT NULL,
            FOREIGN KEY (navod_id) REFERENCES navody(id) ON DELETE CASCADE
        );

        -- Časté chyby
        CREATE TABLE IF NOT EXISTS navod_chyby (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            navod_id INTEGER,
            order_num INTEGER NOT NULL,
            popis TEXT NOT NULL,
            FOREIGN KEY (navod_id) REFERENCES navody(id) ON DELETE CASCADE
        );

        -- Obrázky
        CREATE TABLE IF NOT EXISTS navod_obrazky (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            navod_id INTEGER,
            url TEXT NOT NULL,
            cislo_kroku INTEGER NOT NULL,
            popis TEXT,
            FOREIGN KEY (navod_id) REFERENCES navody(id) ON DELETE CASCADE
        );

        -- Pripomienky (feedback)
        CREATE TABLE IF NOT EXISTS pripomienky (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            navod_id INTEGER,
            user_id INTEGER,
            sprava TEXT NOT NULL,
            cislo_kroku INTEGER,
            stav TEXT CHECK(stav IN ('nevybavena', 'vybavena')) DEFAULT 'nevybavena',
            created_at INTEGER NOT NULL,
            resolved_at INTEGER,
            FOREIGN KEY (navod_id) REFERENCES navody(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_feedback_navod ON pripomienky(navod_id);
        CREATE INDEX IF NOT EXISTS idx_feedback_stav ON pripomienky(stav);
        ";

        $this->db->exec($sql);
    }

    public function query($sql, $params = []) {
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log('Query error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    public function lastInsertId() {
        return $this->db->lastInsertId();
    }
}
