<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

    // Query to fetch data ordered by date
    $sql = "SELECT date, repair FROM mohsdata
            WHERE repair IN ('ILC', 'CLC', 'FTSG', 'Flap', '2nd')
            ORDER BY date ASC";
    $result = $conn->query($sql);

    // Prepare data array
    $data = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    $conn->close();

    header('Content-Type: application/json');
    echo json_encode($data);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch repair data']);
    error_log($e->getMessage());
}
?>