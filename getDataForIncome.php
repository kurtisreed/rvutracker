<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

// Query for this year
$sql_this_year = "SELECT DATE(`date`) as entry_date, SUM(`totalincome`) as total_income
                  FROM rvudata
                  WHERE YEAR(`date`) = YEAR(CURDATE())
                  GROUP BY DATE(`date`)
                  ORDER BY `date` ASC";

// Query for last year
$sql_last_year = "SELECT DATE(`date`) as entry_date, SUM(`totalincome`) as total_income
                  FROM rvudata
                  WHERE YEAR(`date`) = YEAR(CURDATE()) - 1
                  GROUP BY DATE(`date`)
                  ORDER BY `date` ASC";

$result_this_year = $conn->query($sql_this_year);
$result_last_year = $conn->query($sql_last_year);

$data = [
    'this_year' => [],
    'last_year' => []
];

// Fetch data for this year
if ($result_this_year->num_rows > 0) {
    while($row = $result_this_year->fetch_assoc()) {
        $data['this_year'][] = $row;
    }
}

// Fetch data for last year
if ($result_last_year->num_rows > 0) {
    while($row = $result_last_year->fetch_assoc()) {
        $data['last_year'][] = $row;
    }
}

    $conn->close();

    header('Content-Type: application/json');
    echo json_encode($data);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch income data']);
    error_log($e->getMessage());
}
?>