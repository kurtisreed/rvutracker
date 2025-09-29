<?php
/**
 * Authentication Troubleshooting Tool
 * This helps diagnose PIN authentication issues
 *
 * Upload this to your server and access it via browser
 * DELETE THIS FILE after troubleshooting!
 */

echo "<h1>Authentication Test</h1>";

// Test 1: Check if auth_config.php exists
echo "<h2>Test 1: Configuration File</h2>";
if (file_exists('auth_config.php')) {
    echo "✅ auth_config.php exists<br>";
    require_once 'auth_config.php';

    if (defined('AUTH_PIN_HASH')) {
        echo "✅ AUTH_PIN_HASH is defined<br>";
        echo "Hash length: " . strlen(AUTH_PIN_HASH) . " characters<br>";
        echo "Hash starts with: " . substr(AUTH_PIN_HASH, 0, 7) . "...<br>";
    } else {
        echo "❌ AUTH_PIN_HASH is NOT defined<br>";
    }
} else {
    echo "❌ auth_config.php does NOT exist<br>";
}

// Test 2: Check password_verify function
echo "<h2>Test 2: Password Functions</h2>";
if (function_exists('password_hash')) {
    echo "✅ password_hash() is available<br>";
} else {
    echo "❌ password_hash() is NOT available (PHP version too old?)<br>";
}

if (function_exists('password_verify')) {
    echo "✅ password_verify() is available<br>";
} else {
    echo "❌ password_verify() is NOT available (PHP version too old?)<br>";
}

// Test 3: PHP Version
echo "<h2>Test 3: PHP Version</h2>";
echo "PHP Version: " . phpversion() . "<br>";
if (version_compare(phpversion(), '5.5.0', '>=')) {
    echo "✅ PHP version is compatible (5.5.0+)<br>";
} else {
    echo "❌ PHP version is too old (need 5.5.0+)<br>";
}

// Test 4: Test PIN verification
echo "<h2>Test 4: PIN Verification Test</h2>";
if (defined('AUTH_PIN_HASH') && function_exists('password_verify')) {
    $test_pin = "1640";
    $result = password_verify($test_pin, AUTH_PIN_HASH);

    if ($result) {
        echo "✅ PIN '1640' verifies correctly<br>";
    } else {
        echo "❌ PIN '1640' does NOT verify<br>";
        echo "This means your hash might be incorrect or corrupted<br>";
    }

    // Try creating a fresh hash
    echo "<h3>Generate Fresh Hash:</h3>";
    $fresh_hash = password_hash($test_pin, PASSWORD_BCRYPT);
    echo "Fresh hash for PIN '1640':<br>";
    echo "<textarea style='width:100%;height:60px;'>$fresh_hash</textarea><br>";
    echo "Copy this hash to auth_config.php if needed<br>";
} else {
    echo "⚠️ Cannot test - missing requirements<br>";
}

// Test 5: Session support
echo "<h2>Test 5: Session Support</h2>";
if (session_status() === PHP_SESSION_DISABLED) {
    echo "❌ Sessions are DISABLED<br>";
} else {
    echo "✅ Sessions are available<br>";
    if (session_status() === PHP_SESSION_NONE) {
        echo "Session not started yet (normal)<br>";
    } else {
        echo "Session already active<br>";
    }
}

echo "<hr>";
echo "<p><strong>IMPORTANT: Delete this file after troubleshooting!</strong></p>";
?>