<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

    $this_year = (int)date('Y');
    $last_year = $this_year - 1;

    $sql = "SELECT YEAR(date) as yr, MONTH(date) as mo, COUNT(*) as cases
            FROM mohsdata
            WHERE YEAR(date) IN (?, ?)
            GROUP BY yr, mo
            ORDER BY yr, mo";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $this_year, $last_year);
    $stmt->execute();
    $result = $stmt->get_result();

    $this_year_data = array_fill(0, 12, 0);
    $last_year_data = array_fill(0, 12, 0);

    while ($row = $result->fetch_assoc()) {
        $mo_idx = (int)$row['mo'] - 1;
        if ((int)$row['yr'] === $this_year) {
            $this_year_data[$mo_idx] = (int)$row['cases'];
        } else {
            $last_year_data[$mo_idx] = (int)$row['cases'];
        }
    }

    $stmt->close();
    $conn->close();

    header('Content-Type: application/json');
    echo json_encode([
        'this_year'       => $this_year_data,
        'last_year'       => $last_year_data,
        'this_year_label' => $this_year,
        'last_year_label' => $last_year
    ]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch data']);
    error_log($e->getMessage());
}
?>
