<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

    // SQL query to get the 10 most recent records
    $sql = "SELECT * FROM mohsdata ORDER BY date DESC LIMIT 10";
    $result = $conn->query($sql);

    $records = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $records[] = $row;
        }
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
