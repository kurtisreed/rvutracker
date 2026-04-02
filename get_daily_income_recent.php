<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

    $sql = "SELECT DATE(date) as day, SUM(totalincome) as income
            FROM rvudata
            WHERE DATE(date) >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
            GROUP BY day
            ORDER BY day";

    $result = $conn->query($sql);
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = ['day' => $row['day'], 'income' => (float)$row['income']];
    }

    $conn->close();

    header('Content-Type: application/json');
    echo json_encode($rows);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch data']);
    error_log($e->getMessage());
}
?>
