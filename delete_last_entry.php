<?php
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

    $sql = "DELETE FROM rvudata ORDER BY date DESC LIMIT 1";

    if ($conn->query($sql) === TRUE) {
        echo "Last entry deleted successfully.";
    } else {
        echo "Error deleting entry.";
    }

    $conn->close();
} catch (Exception $e) {
    echo "Error: Unable to delete entry.";
    error_log($e->getMessage());
}
?>
