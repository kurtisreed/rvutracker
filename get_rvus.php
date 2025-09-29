<?php
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

function get_rvus($conn, $start_date, $end_date) {
    $sql = "SELECT SUM(totalrvus) as total_rvus FROM rvudata WHERE DATE(date) BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['total_rvus'] ?? 0;
    } else {
        return 0;
    }
}

function get_encounters($conn, $start_date, $end_date) {
    $sql = "SELECT COUNT(*) as total_encounters FROM rvudata WHERE DATE(date) BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['total_encounters'] ?? 0;
    } else {
        return 0;
    }
}

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

function count_code_occurrences($conn, $start_date, $end_date, $codes) {
    $total_count = 0;
    foreach ($codes as $code) {
        $sql = "SELECT SUM((LENGTH(inputs) - LENGTH(REPLACE(inputs, '$code', ''))) / LENGTH('$code')) AS total_occurrence_count 
                FROM rvudata 
                WHERE DATE(date) BETWEEN '$start_date' AND '$end_date' AND inputs LIKE '%$code%'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $total_count += $row['total_occurrence_count'] ?? 0;
        }
    }

    return $total_count;
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

$codes_173 = ['17311', '17313'];
$codes_111 = ['11102', '11103', '11104', '11105'];
$codes_17312 = ['17312', '17314'];
$codes_cryo = ['17000', '17004'];
$codes_88305 = ['88305'];

$data = array(
    "today" => get_rvus($conn, $today, $today),
    "this_week" => get_rvus($conn, $this_week_start, $this_week_end),
    "last_week" => get_rvus($conn, $last_week_start, $last_week_end),
    "this_month" => get_rvus($conn, $this_month_start, $this_month_end),
    "last_month" => get_rvus($conn, $last_month_start, $last_month_end),
    "this_year" => get_rvus($conn, $this_year_start, $this_year_end),
    "last_year" => get_rvus($conn, $last_year_start, $last_year_end),
    "today_income" => get_income($conn, $today, $today),
    "this_week_income" => get_income($conn, $this_week_start, $this_week_end),
    "last_week_income" => get_income($conn, $last_week_start, $last_week_end),
    "this_month_income" => get_income($conn, $this_month_start, $this_month_end),
    "last_month_income" => get_income($conn, $last_month_start, $last_month_end),
    "this_year_income" => get_income($conn, $this_year_start, $this_year_end),
    "last_year_income" => get_income($conn, $last_year_start, $last_year_end),    
    "today_encounters" => get_encounters($conn, $today, $today),
    "this_week_encounters" => get_encounters($conn, $this_week_start, $this_week_end),
    "last_week_encounters" => get_encounters($conn, $last_week_start, $last_week_end),
    "this_month_encounters" => get_encounters($conn, $this_month_start, $this_month_end),
    "last_month_encounters" => get_encounters($conn, $last_month_start, $last_month_end),
    "this_year_encounters" => get_encounters($conn, $this_year_start, $this_year_end),
    "last_year_encounters" => get_encounters($conn, $last_year_start, $last_year_end),
    "today_code_173" => count_code_occurrences($conn, $today, $today, $codes_173),
    "this_week_code_173" => count_code_occurrences($conn, $this_week_start, $this_week_end, $codes_173),
    "last_week_code_173" => count_code_occurrences($conn, $last_week_start, $last_week_end, $codes_173),
    "this_month_code_173" => count_code_occurrences($conn, $this_month_start, $this_month_end, $codes_173),
    "last_month_code_173" => count_code_occurrences($conn, $last_month_start, $last_month_end, $codes_173),
    "this_year_code_173" => count_code_occurrences($conn, $this_year_start, $this_year_end, $codes_173),
    "last_year_code_173" => count_code_occurrences($conn, $last_year_start, $last_year_end, $codes_173),
    "today_code_17312" => count_code_occurrences($conn, $today, $today, $codes_17312),
    "this_week_code_17312" => count_code_occurrences($conn, $this_week_start, $this_week_end, $codes_17312),
    "last_week_code_17312" => count_code_occurrences($conn, $last_week_start, $last_week_end, $codes_17312),
    "this_month_code_17312" => count_code_occurrences($conn, $this_month_start, $this_month_end, $codes_17312),
    "last_month_code_17312" => count_code_occurrences($conn, $last_month_start, $last_month_end, $codes_17312),
    "this_year_code_17312" => count_code_occurrences($conn, $this_year_start, $this_year_end, $codes_17312),
    "last_year_code_17312" => count_code_occurrences($conn, $last_year_start, $last_year_end, $codes_17312),   
    "today_code_cryo" => count_code_occurrences($conn, $today, $today, $codes_cryo),
    "this_week_code_cryo" => count_code_occurrences($conn, $this_week_start, $this_week_end, $codes_cryo),
    "last_week_code_cryo" => count_code_occurrences($conn, $last_week_start, $last_week_end, $codes_cryo),
    "this_month_code_cryo" => count_code_occurrences($conn, $this_month_start, $this_month_end, $codes_cryo),
    "last_month_code_cryo" => count_code_occurrences($conn, $last_month_start, $last_month_end, $codes_cryo),
    "this_year_code_cryo" => count_code_occurrences($conn, $this_year_start, $this_year_end, $codes_cryo),
    "last_year_code_cryo" => count_code_occurrences($conn, $last_year_start, $last_year_end, $codes_cryo),
    "today_code_88305" => count_code_occurrences($conn, $today, $today, $codes_88305),
    "this_week_code_88305" => count_code_occurrences($conn, $this_week_start, $this_week_end, $codes_88305),
    "last_week_code_88305" => count_code_occurrences($conn, $last_week_start, $last_week_end, $codes_88305),
    "this_month_code_88305" => count_code_occurrences($conn, $this_month_start, $this_month_end, $codes_88305),
    "last_month_code_88305" => count_code_occurrences($conn, $last_month_start, $last_month_end, $codes_88305),
    "this_year_code_88305" => count_code_occurrences($conn, $this_year_start, $this_year_end, $codes_88305),
    "last_year_code_88305" => count_code_occurrences($conn, $last_year_start, $last_year_end, $codes_88305), 
    "today_code_111" => count_code_occurrences($conn, $today, $today, $codes_111),
    "this_week_code_111" => count_code_occurrences($conn, $this_week_start, $this_week_end, $codes_111),
    "last_week_code_111" => count_code_occurrences($conn, $last_week_start, $last_week_end, $codes_111),
    "this_month_code_111" => count_code_occurrences($conn, $this_month_start, $this_month_end, $codes_111),
    "last_month_code_111" => count_code_occurrences($conn, $last_month_start, $last_month_end, $codes_111),
    "this_year_code_111" => count_code_occurrences($conn, $this_year_start, $this_year_end, $codes_111),
    "last_year_code_111" => count_code_occurrences($conn, $last_year_start, $last_year_end, $codes_111)
);

    header('Content-Type: application/json');
    echo json_encode($data, JSON_PRETTY_PRINT);

    $conn->close();
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch data']);
    error_log($e->getMessage());
}
?>