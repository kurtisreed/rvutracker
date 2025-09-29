<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

function get_income($conn, $start_date, $end_date) {
    $sql = "SELECT SUM(totalincome) as total_income FROM rvudata WHERE DATE(date) BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['total_income'] ?? 0;
    } else {
        return 0;
    }
}

$today = date('Y-m-d');
$this_week_start = date('Y-m-d', strtotime('monday this week'));
$this_week_end = date('Y-m-d', strtotime('sunday this week'));
$last_week_start = date('Y-m-d', strtotime('monday last week'));
$last_week_end = date('Y-m-d', strtotime('sunday last week'));
$this_month_start = date('Y-m-01');
$this_month_end = date('Y-m-t');
$last_month_start = date('Y-m-d', strtotime('first day of last month'));
$last_month_end = date('Y-m-d', strtotime('last day of last month'));
$this_year_start = date('Y-01-01');
$this_year_end = date('Y-12-31');
$last_year_start = date('Y-m-d', strtotime('first day of january last year'));
$last_year_end = date('Y-m-d', strtotime('last day of december last year'));

$data = array(
    "today" => get_income($conn, $today, $today),
    "this_week" => get_income($conn, $this_week_start, $this_week_end),
    "last_week" => get_income($conn, $last_week_start, $last_week_end),
    "this_month" => get_income($conn, $this_month_start, $this_month_end),
    "last_month" => get_income($conn, $last_month_start, $last_month_end),
    "this_year" => get_income($conn, $this_year_start, $this_year_end),
    "last_year" => get_income($conn, $last_year_start, $last_year_end)
);

    header('Content-Type: application/json');
    echo json_encode($data);

    $conn->close();
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch income data']);
    error_log($e->getMessage());
}
?>