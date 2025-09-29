<?php
session_start();
require_once 'auth_config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $pin = $_POST['pin'] ?? '';

    // Verify the PIN against the hashed value
    if (password_verify($pin, AUTH_PIN_HASH)) {
        // Regenerate session ID to prevent session fixation
        session_regenerate_id(true);

        // Set session variables
        $_SESSION['authenticated'] = true;
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();

        echo "success";
    } else {
        // Log failed attempt (optional)
        error_log("Failed login attempt from IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));

        // Add small delay to prevent brute force
        sleep(1);

        echo "failure";
    }
} else {
    http_response_code(405);
    echo "Method not allowed";
}
?>
