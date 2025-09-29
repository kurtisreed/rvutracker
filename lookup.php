<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $conn = get_db_connection();
    $code = $_POST['code'];

    $sql = "SELECT value FROM rvu_tracker_2024 WHERE code = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $stmt->bind_result($value);
    
    if ($stmt->fetch()) {
        echo "Value: " . $value;
    } else {
        echo "No value found for the given code.";
    }

    $stmt->close();
    $conn->close();
    } catch (Exception $e) {
        echo "Error: Unable to process request.";
        error_log($e->getMessage());
    }
}
?>
