<?php
// Authentication configuration example
// Copy this file to auth_config.php and update with your actual hashed PIN

// To generate a new hash for your PIN/password, run generate_hash.php
// Then copy the generated hash here

// Example hash (for PIN "1640" - CHANGE THIS!)
define('AUTH_PIN_HASH', '$2y$10$abcdefghijklmnopqrstuO8X7KQZCCzGQZCCzGQZCCzGQZCCzGQZCCu');

// Session configuration
define('SESSION_TIMEOUT', 3600); // 1 hour in seconds (3600)
define('SESSION_NAME', 'RVU_TRACKER_SESSION');
?>