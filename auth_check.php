<?php
/**
 * Authentication middleware
 * Include this at the top of any PHP file that requires authentication
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'auth_config.php';

/**
 * Check if user is authenticated
 * @return bool
 */
function is_authenticated() {
    // Check if authenticated session variable exists
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        return false;
    }

    // Check if session has timed out
    if (isset($_SESSION['last_activity'])) {
        $elapsed = time() - $_SESSION['last_activity'];
        if ($elapsed > SESSION_TIMEOUT) {
            // Session timed out
            session_unset();
            session_destroy();
            return false;
        }
    }

    // Update last activity time
    $_SESSION['last_activity'] = time();

    return true;
}

/**
 * Require authentication or exit with error
 */
function require_auth() {
    if (!is_authenticated()) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Unauthorized', 'message' => 'Please login']);
        exit;
    }
}

// Auto-require authentication when this file is included
require_auth();
?>