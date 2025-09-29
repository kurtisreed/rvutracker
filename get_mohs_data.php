<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

function get_onestage($conn, $start_date, $end_date) {
    $sql = "SELECT 
                (SUM(CASE WHEN stages = '1' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS percentage_of_ones
              FROM 
                mohsdata
              WHERE 
                date BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['percentage_of_ones'] ?? 0;
    } else {
        return 0;
    }
}

function get_addon($conn, $start_date, $end_date) {
    $sql = "SELECT 
                (SUM(CASE WHEN addon = 'Y' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS percentage_of_addon
              FROM 
                mohsdata
              WHERE 
                date BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['percentage_of_addon'] ?? 0;
    } else {
        return 0;
    }
}

function get_closure($conn, $start_date, $end_date, $type) {
    $sql = "SELECT 
                (SUM(CASE WHEN repair = '$type' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS percentage_of_closure
              FROM 
                mohsdata
              WHERE 
                date BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['percentage_of_closure'] ?? 0;
    } else {
        return 0;
    }
}

function get_diagnosis($conn, $start_date, $end_date, $type) {
    $sql = "SELECT 
                (SUM(CASE WHEN diagnosis = '$type' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS percentage_of_diagnosis
              FROM 
                mohsdata
              WHERE 
                date BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['percentage_of_diagnosis'] ?? 0;
    } else {
        return 0;
    }
}

function other_diagnosis($conn, $start_date, $end_date) {
    $sql = "SELECT 
                (SUM(CASE WHEN diagnosis NOT IN ('BCC', 'SCC') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS percentage_other
              FROM  
                mohsdata
              WHERE 
                date BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['percentage_other'] ?? 0;
    } else {
        return 0;
    }
}

function get_referral($conn, $start_date, $end_date, $type) {
    $sql = "SELECT 
                (SUM(CASE WHEN referral = '$type' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS percentage_of_diagnosis
              FROM 
                mohsdata
              WHERE 
                date BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['percentage_of_diagnosis'] ?? 0;
    } else {
        return 0;
    }
}

function other_referral($conn, $start_date, $end_date) {
    $sql = "SELECT 
                (SUM(CASE WHEN referral NOT IN ('Me', 'Amanda') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS percentage_other
              FROM  
                mohsdata
              WHERE 
                date BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['percentage_other'] ?? 0;
    } else {
        return 0;
    }
}




function get_total($conn, $start_date, $end_date) {
    $sql = "SELECT COUNT(*) as total_encounters FROM mohsdata WHERE DATE(date) BETWEEN '$start_date' AND '$end_date'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['total_encounters'] ?? 0;
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
$all_time_start = date('2012-01-01');


$data = array(
    "this_month_total" => get_total($conn, $this_month_start, $this_month_end),
    "last_month_total" => get_total($conn, $last_month_start, $last_month_end),
    "this_year_total" => get_total($conn, $this_year_start, $this_year_end),
    "last_year_total" => get_total($conn, $last_year_start, $last_year_end),
    "all_time_total" => get_total($conn, $all_time_start, $today),
    "this_month_onestage" => get_onestage($conn, $this_month_start, $this_month_end),
    "last_month_onestage" => get_onestage($conn, $last_month_start, $last_month_end),
    "this_year_onestage" => get_onestage($conn, $this_year_start, $this_year_end),
    "last_year_onestage" => get_onestage($conn, $last_year_start, $last_year_end),
    "all_time_onestage" => get_onestage($conn, $all_time_start, $today),
    "this_month_addon" => get_addon($conn, $this_month_start, $this_month_end),
    "last_month_addon" => get_addon($conn, $last_month_start, $last_month_end),
    "this_year_addon" => get_addon($conn, $this_year_start, $this_year_end),
    "last_year_addon" => get_addon($conn, $last_year_start, $last_year_end),
    "all_time_addon" => get_addon($conn, $all_time_start, $today),
    "this_month_CLC" => get_closure($conn, $this_month_start, $this_month_end, 'CLC'),
    "last_month_CLC" => get_closure($conn, $last_month_start, $last_month_end, 'CLC'),
    "this_year_CLC" => get_closure($conn, $this_year_start, $this_year_end, 'CLC'),
    "last_year_CLC" => get_closure($conn, $last_year_start, $last_year_end, 'CLC'),
    "all_time_CLC" => get_closure($conn, $all_time_start, $today, 'CLC'),
    "this_month_ILC" => get_closure($conn, $this_month_start, $this_month_end, 'ILC'),
    "last_month_ILC" => get_closure($conn, $last_month_start, $last_month_end, 'ILC'),
    "this_year_ILC" => get_closure($conn, $this_year_start, $this_year_end, 'ILC'),
    "last_year_ILC" => get_closure($conn, $last_year_start, $last_year_end, 'ILC'),
    "all_time_ILC" => get_closure($conn, $all_time_start, $today, 'ILC'),
    "this_month_flap" => get_closure($conn, $this_month_start, $this_month_end, 'Flap'),
    "last_month_flap" => get_closure($conn, $last_month_start, $last_month_end, 'Flap'),
    "this_year_flap" => get_closure($conn, $this_year_start, $this_year_end, 'Flap'),
    "last_year_flap" => get_closure($conn, $last_year_start, $last_year_end, 'Flap'),
    "all_time_flap" => get_closure($conn, $all_time_start, $today, 'Flap'),
    "this_month_FTSG" => get_closure($conn, $this_month_start, $this_month_end, 'FTSG'),
    "last_month_FTSG" => get_closure($conn, $last_month_start, $last_month_end, 'FTSG'),
    "this_year_FTSG" => get_closure($conn, $this_year_start, $this_year_end, 'FTSG'),
    "last_year_FTSG" => get_closure($conn, $last_year_start, $last_year_end, 'FTSG'),
    "all_time_FTSG" => get_closure($conn, $all_time_start, $today, 'FTSG'),
    "this_month_secondintent" => get_closure($conn, $this_month_start, $this_month_end, '2nd'),
    "last_month_secondintent" => get_closure($conn, $last_month_start, $last_month_end, '2nd'),
    "this_year_secondintent" => get_closure($conn, $this_year_start, $this_year_end, '2nd'),
    "last_year_secondintent" => get_closure($conn, $last_year_start, $last_year_end, '2nd'),
    "all_time_secondintent" => get_closure($conn, $all_time_start, $today, '2nd'),
    "this_month_BCC" => get_diagnosis($conn, $this_month_start, $this_month_end, 'BCC'),
    "last_month_BCC" => get_diagnosis($conn, $last_month_start, $last_month_end, 'BCC'),
    "this_year_BCC" => get_diagnosis($conn, $this_year_start, $this_year_end, 'BCC'),
    "last_year_BCC" => get_diagnosis($conn, $last_year_start, $last_year_end, 'BCC'),
    "all_time_BCC" => get_diagnosis($conn, $all_time_start, $today, 'BCC'),
    "this_month_SCC" => get_diagnosis($conn, $this_month_start, $this_month_end, 'SCC'),
    "last_month_SCC" => get_diagnosis($conn, $last_month_start, $last_month_end, 'SCC'),
    "this_year_SCC" => get_diagnosis($conn, $this_year_start, $this_year_end, 'SCC'),
    "last_year_SCC" => get_diagnosis($conn, $last_year_start, $last_year_end, 'SCC'),
    "all_time_SCC" => get_diagnosis($conn, $all_time_start, $today, 'SCC'),
    "this_month_me" => get_referral($conn, $this_month_start, $this_month_end, 'Me'),
    "last_month_me" => get_referral($conn, $last_month_start, $last_month_end, 'Me'),
    "this_year_me" => get_referral($conn, $this_year_start, $this_year_end, 'Me'),
    "last_year_me" => get_referral($conn, $last_year_start, $last_year_end, 'Me'),
    "all_time_me" => get_referral($conn, $all_time_start, $today, 'Me'), 
    "this_month_amanda" => get_referral($conn, $this_month_start, $this_month_end, 'Amanda'),
    "last_month_amanda" => get_referral($conn, $last_month_start, $last_month_end, 'Amanda'),
    "this_year_amanda" => get_referral($conn, $this_year_start, $this_year_end, 'Amanda'),
    "last_year_amanda" => get_referral($conn, $last_year_start, $last_year_end, 'Amanda'),
    "all_time_amanda" => get_referral($conn, $all_time_start, $today, 'Amanda'),  
    "this_month_outside" => other_referral($conn, $this_month_start, $this_month_end),
    "last_month_outside" => other_referral($conn, $last_month_start, $last_month_end),
    "this_year_outside" => other_referral($conn, $this_year_start, $this_year_end),
    "last_year_outside" => other_referral($conn, $last_year_start, $last_year_end),
    "all_time_outside" => other_referral($conn, $all_time_start, $today),     
    "this_month_other" => other_diagnosis($conn, $this_month_start, $this_month_end),
    "last_month_other" => other_diagnosis($conn, $last_month_start, $last_month_end),
    "this_year_other" => other_diagnosis($conn, $this_year_start, $this_year_end),
    "last_year_other" => other_diagnosis($conn, $last_year_start, $last_year_end),
    "all_time_other" => other_diagnosis($conn, $all_time_start, $today)    
);

    header('Content-Type: application/json');
    echo json_encode($data, JSON_PRETTY_PRINT);

    $conn->close();
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch Mohs data']);
    error_log($e->getMessage());
}
?>