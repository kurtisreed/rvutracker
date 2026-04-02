<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

    $sql = "SELECT YEAR(date) as yr, MONTH(date) as mo, COUNT(*) as cases
            FROM mohsdata
            WHERE date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01')
            GROUP BY yr, mo
            ORDER BY yr, mo";

    $result = $conn->query($sql);
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            'yr'    => (int)$row['yr'],
            'mo'    => (int)$row['mo'],
            'cases' => (int)$row['cases'],
        ];
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
