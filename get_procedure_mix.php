<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

    $categories = [
        'E&M'           => ['99212','99213','99214','99203','99204'],
        'Mohs'          => ['17311','17312','17313','17314','17315'],
        'Primary Repair'=> ['13132','13133','13151','13152','13121','12032','12034','12042','12052'],
        'Flaps & Grafts'=> ['14040','14041','14060','14061','14301','15260','15240'],
        'Destruction'   => ['17262','17263','17272','17281','17282'],
        'Clinic'        => ['11102','11103','11104','11105','17000','17003','17004','17110','88331','88305','11900','11901','11200'],
    ];

    $counts = array_fill_keys(array_keys($categories), 0);

    $year = (int)date('Y');
    $sql = "SELECT inputs FROM rvudata WHERE YEAR(date) = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $year);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        foreach (explode(',', $row['inputs']) as $code) {
            $code = trim($code);
            foreach ($categories as $cat => $codes) {
                if (in_array($code, $codes)) {
                    $counts[$cat]++;
                    break;
                }
            }
        }
    }

    $stmt->close();
    $conn->close();

    header('Content-Type: application/json');
    echo json_encode($counts);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch data']);
    error_log($e->getMessage());
}
?>
