<?php
require 'api/config.php';
$stmt = $pdo->query('SELECT id, title, content_json FROM posttest_cases ORDER BY id ASC');
while ($row = $stmt->fetch()) {
    echo "=== CASE " . $row['id'] . ": " . $row['title'] . " ===\n";
    $elements = json_decode($row['content_json'], true);
    foreach ($elements as $el) {
        if ($el['type'] === 'image') {
            echo " - IMAGE: " . ($el['values'] ? implode(', ', $el['values']) : $el['value']) . " (Caption: " . ($el['caption'] ?? 'None') . ")\n";
        } else if ($el['type'] === 'table') {
            echo " - TABLE: (Caption: " . ($el['caption'] ?? 'None') . ")\n";
        }
    }
}
