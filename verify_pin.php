<?php
// verify_pin.php

$correct_pin = "1640"; // Set your desired PIN here

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $pin = $_POST['pin'];

    if ($pin === $correct_pin) {
        echo "success";
    } else {
        echo "failure";
    }
}
?>
