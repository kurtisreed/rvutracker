<?php
// Database configuration
// Copy this file to db_connect.php and update with your actual credentials

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'your_username');
define('DB_PASSWORD', 'your_password');
define('DB_NAME', 'your_database');

/**
 * Create and return a database connection
 * @return mysqli Database connection object
 * @throws Exception if connection fails
 */
function get_db_connection() {
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        throw new Exception("Database connection failed. Please try again later.");
    }

    // Set charset to prevent encoding issues
    $conn->set_charset("utf8mb4");

    return $conn;
}
?>