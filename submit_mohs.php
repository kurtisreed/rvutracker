<?php
require_once 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $conn = get_db_connection();

        // Get form data
        $date = $_POST['date'];
        $name = $_POST['name'];
        $site = $_POST['site'];
        $nyu = $_POST['nyu'];
        $diagnosis = $_POST['diagnosis'] == 'other' ? $_POST['diagnosis-other'] : $_POST['diagnosis'];
        $stages = $_POST['stages'];
        $repair = $_POST['repair'] == 'other' ? $_POST['repair-other'] : $_POST['repair'];
        $comments = $_POST['comments'];
        $referral = $_POST['referral'] == 'other' ? $_POST['referral-other'] : $_POST['referral'];
        $addon = $_POST['addon'];
        $today = date('Y-m-d');

        // Use prepared statement to prevent SQL injection
        $sql = "INSERT INTO mohsdata (date, name, site, nyu, diagnosis, stages, repair, comments, referral, addon)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssssssss", $date, $name, $site, $nyu, $diagnosis, $stages, $repair, $comments, $referral, $addon);
    
    function get_total($conn, $today) {
        $sql = "SELECT COUNT(*) as total_encounters FROM mohsdata WHERE DATE(date) = '$today'";
        $result = $conn->query($sql);
    
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return $row['total_encounters'] ?? 0;
        } else {
            return 0;
        }
    }

        if ($stmt->execute()) {
            $stmt->close();
            $today_total = get_total($conn, $today);
            echo "New record created successfully: <br>";
            echo "$date $name $site $nyu $diagnosis $stages $repair $comments $referral $addon <br>";
            echo "Today's total Mohs entered: $today_total";
        } else {
            echo "Error saving Mohs data. Please try again.";
        }

        $conn->close();
    } catch (Exception $e) {
        echo "Error: Unable to save Mohs data.";
        error_log($e->getMessage());
    }
}
?>