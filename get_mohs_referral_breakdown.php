<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

try {
    $conn = get_db_connection();

    $this_year = (int)date('Y');
    $last_year = $this_year - 1;

    $sql = "SELECT
                CASE WHEN referral IN ('Me', 'Amanda') THEN referral ELSE 'Other' END AS referral,
                SUM(CASE WHEN YEAR(date) = ? THEN 1 ELSE 0 END) AS this_year,
                SUM(CASE WHEN YEAR(date) = ? THEN 1 ELSE 0 END) AS last_year
            FROM mohsdata
            WHERE YEAR(date) IN (?, ?)
            GROUP BY CASE WHEN referral IN ('Me', 'Amanda') THEN referral ELSE 'Other' END";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiii", $this_year, $last_year, $this_year, $last_year);
    $stmt->execute();
    $result = $stmt->get_result();

    // Collect rows then sort: Me, Amanda, Other
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[$row['referral']] = [
            'referral'  => $row['referral'],
            'this_year' => (int)$row['this_year'],
            'last_year' => (int)$row['last_year']
        ];
    }

    $data = [];
    foreach (['Me', 'Amanda', 'Other'] as $key) {
        if (isset($rows[$key])) {
            $data[] = $rows[$key];
        }
    }

    $stmt->close();
    $conn->close();

    header('Content-Type: application/json');
    echo json_encode($data);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch data']);
    error_log($e->getMessage());
}
?>
