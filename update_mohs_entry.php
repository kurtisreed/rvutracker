<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $conn = get_db_connection();

        $id       = intval($_POST['id']);
        $date     = $_POST['date'];
        $name     = $_POST['name'];
        $site     = $_POST['site'];
        $nyu      = $_POST['nyu'];
        $diagnosis = $_POST['diagnosis'] == 'other' ? $_POST['diagnosis-other'] : $_POST['diagnosis'];
        $stages   = $_POST['stages'];
        $repair   = $_POST['repair'] == 'other' ? $_POST['repair-other'] : $_POST['repair'];
        $comments = $_POST['comments'];
        $referral = $_POST['referral'] == 'other' ? $_POST['referral-other'] : $_POST['referral'];
        $addon    = $_POST['addon'];

        $sql = "UPDATE mohsdata SET date=?, name=?, site=?, NYU=?, diagnosis=?, stages=?, repair=?, comments=?, referral=?, addon=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssssssssi", $date, $name, $site, $nyu, $diagnosis, $stages, $repair, $comments, $referral, $addon, $id);

        if ($stmt->execute()) {
            echo "Entry updated successfully.";
        } else {
            echo "Error updating entry.";
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        echo "Error: Unable to update entry.";
        error_log($e->getMessage());
    }
}
?>
