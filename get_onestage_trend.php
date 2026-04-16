<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

    $sql = "SELECT DATE(date) as entry_date, stages
            FROM mohsdata
            ORDER BY date ASC";

    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'date'   => $row['entry_date'],
            'stages' => $row['stages']
        ];
    }

    $conn->close();

    header('Content-Type: application/json');
    echo json_encode($data);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch data']);
    error_log($e->getMessage());
}
?>
