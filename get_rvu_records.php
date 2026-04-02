<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();
    $sql = "SELECT id, date, inputs, totalrvus, totalincome FROM rvudata ORDER BY date DESC LIMIT 20";
    $result = $conn->query($sql);
    $records = [];
    while ($row = $result->fetch_assoc()) {
        $records[] = $row;
    }
    $conn->close();
    header('Content-Type: application/json');
    echo json_encode($records);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch records']);
    error_log($e->getMessage());
}
?>
