<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

    $this_year = array_fill(0, 12, 0);
    $last_year = array_fill(0, 12, 0);
    $current_year = (int)date('Y');

    $sql = "SELECT YEAR(date) as yr, MONTH(date) as mo, SUM(totalincome) as income
            FROM rvudata
            WHERE YEAR(date) IN (?, ?)
            GROUP BY yr, mo";
    $stmt = $conn->prepare($sql);
    $last = $current_year - 1;
    $stmt->bind_param("ii", $current_year, $last);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $idx = (int)$row['mo'] - 1;
        if ((int)$row['yr'] === $current_year) {
            $this_year[$idx] = (float)$row['income'];
        } else {
            $last_year[$idx] = (float)$row['income'];
        }
    }

    $stmt->close();
    $conn->close();

    header('Content-Type: application/json');
    echo json_encode([
        'this_year' => $this_year,
        'last_year' => $last_year,
        'this_year_label' => $current_year,
        'last_year_label' => $current_year - 1
    ]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch data']);
    error_log($e->getMessage());
}
?>
