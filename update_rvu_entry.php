<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $conn = get_db_connection();

        $id = intval($_POST['id']);
        $inputs = $_POST['inputs'];
        $totalrvus = floatval($_POST['totalrvus']);
        $totalincome = floatval($_POST['totalincome']);
        $date = $_POST['date'];

        $sql = "UPDATE rvudata SET inputs=?, totalrvus=?, totalincome=?, date=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sddsi", $inputs, $totalrvus, $totalincome, $date, $id);

        if ($stmt->execute()) {
            echo "Entry updated successfully.";
        } else {
            echo "Error updating entry.";
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        echo "Error: Unable to update entry.";
        error_log($e->getMessage());
    }
}
?>
