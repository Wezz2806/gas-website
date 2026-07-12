<?php
$content = file_get_contents(__DIR__ . "/sample.docx");
echo "First 500 chars:\n" . substr($content, 0, 500) . "\n";
