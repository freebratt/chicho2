<?php
require_once __DIR__ . '/config.php';

// Spustiť session
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_set_cookie_params(SESSION_LIFETIME);
    session_start();
}

class Session {
    public static function login($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        
        // Regenerate session ID pre bezpečnosť
        session_regenerate_id(true);
    }

    public static function logout() {
        $_SESSION = array();
        
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 42000, '/');
        }
        
        session_destroy();
    }

    public static function isLoggedIn() {
        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }

    public static function getUser() {
        if (!self::isLoggedIn()) {
            return null;
        }

        return [
            'id' => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'],
            'name' => $_SESSION['user_name'],
            'role' => $_SESSION['user_role']
        ];
    }

    public static function isAdmin() {
        $user = self::getUser();
        return $user && $user['role'] === 'admin';
    }

    public static function requireLogin() {
        if (!self::isLoggedIn()) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Musíte byť prihlásený']);
            exit();
        }
    }

    public static function requireAdmin() {
        self::requireLogin();
        
        if (!self::isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden', 'message' => 'Nemáte oprávnenie']);
            exit();
        }
    }
}
