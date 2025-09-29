<?php
require_once 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $conn = get_db_connection();

        $inputs = $_POST['inputs'];
        $totalrvus = $_POST['totalrvus'];
        $totalincome = $_POST['totalincome'];

        // Use prepared statement to prevent SQL injection
        $sql = "INSERT INTO rvudata (inputs, totalrvus, totalincome, date) VALUES (?, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sdd", $inputs, $totalrvus, $totalincome);


    if ($stmt->execute()) {
        $stmt->close();
        echo "Data saved successfully.<br>";
        echo "$inputs <br>";
        echo "$totalrvus <br>";
        echo number_format("$totalincome", 2). "<br>";

        $sql_count = "SELECT COUNT(*) AS total_records FROM rvudata WHERE DATE(date) = CURDATE()";
        $result = $conn->query($sql_count);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo $row['total_records'] . "<br>";
        } else {
            echo "Error fetching record count.<br>";
        }
        
        // SQL to calculate the average of totalincome for today's records
        $sql_avg_income = "SELECT AVG(totalincome) AS avg_income FROM rvudata WHERE DATE(date) = CURDATE()";
        $result_avg = $conn->query($sql_avg_income);

        if ($result_avg->num_rows > 0) {
            $row_avg = $result_avg->fetch_assoc();
            echo number_format($row_avg['avg_income'], 2) . "<br>";
        } else {
            echo "Error fetching average total income.<br>";
        }
    } else {
        echo "Error saving data. Please try again.";
    }

    $conn->close();
    } catch (Exception $e) {
        echo "Error: Unable to save data.";
        error_log($e->getMessage());
    }
}
?>
