<?php
// api/docx-parser.php

/**
 * Parses a DOCX file and extracts text paragraphs, images, tables, and questions.
 *
 * @param string $filePath Absolute path to the uploaded .docx file
 * @param string $uploadDir Absolute path to save extracted images
 * @param string $webPathPrefix Public web URL prefix to the uploads folder
 * @return array Structured array of 'title', 'elements', and 'questions'
 */
function parseDocx(string $filePath, string $uploadDir, string $webPathPrefix): array {
    if (!class_exists('ZipArchive')) {
        throw new Exception("ZipArchive PHP extension is not enabled.");
    }

    $zip = new ZipArchive();
    if ($zip->open($filePath) !== TRUE) {
        throw new Exception("Gagal membuka file DOCX.");
    }

    // Ensure upload directory exists
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // 1. Read relationships from word/_rels/document.xml.rels
    $relsMap = [];
    $relsXml = $zip->getFromName('word/_rels/document.xml.rels');
    if ($relsXml) {
        $relsDom = new DOMDocument();
        // Prevent XML parsing errors on malformed docs
        libxml_use_internal_errors(true);
        $relsDom->loadXML($relsXml);
        libxml_clear_errors();
        $relsList = $relsDom->getElementsByTagName('Relationship');
        foreach ($relsList as $rel) {
            $id = $rel->getAttribute('Id');
            $target = $rel->getAttribute('Target');
            $type = $rel->getAttribute('Type');
            if (strpos($type, '/image') !== false) {
                $relsMap[$id] = basename($target);
            }
        }
    }

    // 2. Extract media images and map to web paths
    $imageWebPaths = [];
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $stat = $zip->statIndex($i);
        $name = $stat['name'];
        if (strpos($name, 'word/media/') === 0) {
            $baseName = basename($name);
            $ext = pathinfo($baseName, PATHINFO_EXTENSION);
            $newName = uniqid('test_img_') . '.' . $ext;
            $destPath = $uploadDir . '/' . $newName;

            $content = $zip->getFromIndex($i);
            if ($content !== false) {
                file_put_contents($destPath, $content);
                $imageWebPaths[$baseName] = $webPathPrefix . '/' . $newName;
            }
        }
    }

    // 3. Read word/document.xml
    $docXml = $zip->getFromName('word/document.xml');
    if (!$docXml) {
        $zip->close();
        throw new Exception("File word/document.xml tidak ditemukan di dalam DOCX.");
    }

    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadXML($docXml);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);
    $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
    $xpath->registerNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
    $xpath->registerNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main');

    $body = $dom->getElementsByTagName('body')->item(0);
    if (!$body) {
        $zip->close();
        throw new Exception("Tag body tidak ditemukan di document.xml.");
    }

    $elements = [];
    $questions = [];
    $skippedNodes = [];
    $pendingTableCaption = null;

    // Traverse body children to maintain sequential order
    foreach ($body->childNodes as $node) {
        if (in_array($node, $skippedNodes, true)) {
            continue;
        }

        if ($node->nodeName === 'w:p') {
            // Check for images embedded in this paragraph
            $drawings = $xpath->query('.//w:drawing', $node);
            if ($drawings && $drawings->length > 0) {
                foreach ($drawings as $drawing) {
                    $blips = $xpath->query('.//a:blip', $drawing);
                    if ($blips && $blips->length > 0) {
                        $embedId = $blips->item(0)->getAttribute('r:embed');
                        if ($embedId && isset($relsMap[$embedId])) {
                            $mediaFile = $relsMap[$embedId];
                            if (isset($imageWebPaths[$mediaFile])) {
                                $elements[] = [
                                    'type' => 'image',
                                    'value' => $imageWebPaths[$mediaFile]
                                ];
                            }
                        }
                    }
                }
            }

            // Extract text from w:t elements inside the paragraph
            $text = '';
            $tNodes = $xpath->query('.//w:t', $node);
            if ($tNodes) {
                foreach ($tNodes as $tNode) {
                    $text .= $tNode->nodeValue;
                }
            }
            $text = trim($text);

            if ($text !== '') {
                // If it starts with a number followed by . or ), e.g., "1. " or "1) "
                // and has a length of less than 400 chars, treat as a question
                if (preg_match('/^\s*([0-9]+)[\.\)]\s*(.+)$/u', $text, $matches)) {
                    $qNum = (int)$matches[1];
                    
                    // Look ahead for w:tbl immediately following the question
                    $questionTable = null;
                    $next = $node->nextSibling;
                    while ($next && $next->nodeType !== XML_ELEMENT_NODE) {
                        $next = $next->nextSibling;
                    }
                    if ($next && $next->nodeName === 'w:tbl') {
                        // Parse table
                        $tableRows = [];
                        $trNodes = $xpath->query('.//w:tr', $next);
                        if ($trNodes) {
                            foreach ($trNodes as $trNode) {
                                $rowCells = [];
                                $tcNodes = $xpath->query('.//w:tc', $trNode);
                                if ($tcNodes) {
                                    foreach ($tcNodes as $tcNode) {
                                        $cellText = '';
                                        $tNodes = $xpath->query('.//w:t', $tcNode);
                                        if ($tNodes) {
                                            foreach ($tNodes as $tNode) {
                                                $cellText .= $tNode->nodeValue;
                                            }
                                        }
                                        $rowCells[] = trim($cellText);
                                    }
                                }
                                $tableRows[] = $rowCells;
                            }
                        }
                        if (!empty($tableRows)) {
                            $headers = array_shift($tableRows);
                            $questionTable = [
                                'headers' => $headers,
                                'rows' => $tableRows
                            ];
                            $skippedNodes[] = $next;
                        }
                    }

                    $questions[] = [
                        'id' => 'q' . $qNum,
                        'label' => $text,
                        'question_table' => $questionTable
                    ];
                } else {
                    // Check if this text is a label/caption (starts with Gambar, Tabel, Diagram, Figure)
                    if (preg_match('/^(Gambar|Tabel|Diagram|Figure)\s+\d+[\.:\-\s]/ui', $text, $capMatches)) {
                        $capType = strtolower($capMatches[1]);
                        $attached = false;
                        
                        if (!empty($elements)) {
                            $lastIdx = count($elements) - 1;
                            $lastType = $elements[$lastIdx]['type'];
                            
                            if (($capType === 'gambar' || $capType === 'figure' || $capType === 'diagram') && $lastType === 'image') {
                                $elements[$lastIdx]['caption'] = $text;
                                $attached = true;
                            } elseif ($capType === 'tabel' && $lastType === 'table') {
                                $elements[$lastIdx]['caption'] = $text;
                                $attached = true;
                            }
                        }
                        
                        if (!$attached) {
                            if ($capType === 'tabel') {
                                $pendingTableCaption = $text;
                            } else {
                                $elements[] = [
                                    'type' => 'paragraph',
                                    'value' => $text,
                                    'is_caption' => true
                                ];
                            }
                        }
                    } else {
                        $elements[] = [
                            'type' => 'paragraph',
                            'value' => $text
                        ];
                    }
                }
            }
        } elseif ($node->nodeName === 'w:tbl') {
            // Parse table
            $rows = [];
            $trNodes = $xpath->query('.//w:tr', $node);
            if ($trNodes) {
                foreach ($trNodes as $trNode) {
                    $rowCells = [];
                    $tcNodes = $xpath->query('.//w:tc', $trNode);
                    if ($tcNodes) {
                        foreach ($tcNodes as $tcNode) {
                            $cellText = '';
                            $tNodes = $xpath->query('.//w:t', $tcNode);
                            if ($tNodes) {
                                foreach ($tNodes as $tNode) {
                                    $cellText .= $tNode->nodeValue;
                                }
                            }
                            $rowCells[] = trim($cellText);
                        }
                    }
                    $rows[] = $rowCells;
                }
            }

            if (!empty($rows)) {
                $headers = array_shift($rows);
                $tableEl = [
                    'type' => 'table',
                    'value' => [
                        'headers' => $headers,
                        'rows' => $rows
                    ]
                ];
                if ($pendingTableCaption !== null) {
                    $tableEl['caption'] = $pendingTableCaption;
                    $pendingTableCaption = null;
                }
                $elements[] = $tableEl;
            }
        }
    }

    $zip->close();

    // Merge consecutive images into a single group if they are adjacent
    $mergedElements = [];
    $count = count($elements);
    for ($i = 0; $i < $count; $i++) {
        $el = $elements[$i];
        if ($el['type'] === 'image') {
            $group = [$el['value']];
            $caption = isset($el['caption']) ? $el['caption'] : null;
            
            while ($i + 1 < $count && $elements[$i + 1]['type'] === 'image') {
                $i++;
                $group[] = $elements[$i]['value'];
                if (isset($elements[$i]['caption']) && $caption === null) {
                    $caption = $elements[$i]['caption'];
                }
            }
            
            if (count($group) > 1) {
                $mergedElements[] = [
                    'type' => 'image',
                    'value' => $group[0],
                    'values' => $group,
                    'caption' => $caption
                ];
            } else {
                $el['caption'] = $caption;
                $mergedElements[] = $el;
            }
        } else {
            $mergedElements[] = $el;
        }
    }
    $elements = $mergedElements;

    // Title auto-detection: first paragraph if short or case header
    $title = "Kasus Baru";
    if (!empty($elements)) {
        if ($elements[0]['type'] === 'paragraph') {
            $firstText = $elements[0]['value'];
            // Check if first text is just a case marker like "KASUS 1" or "KASUS 1:"
            if (preg_match('/^kasus\s+\d+\s*:?$/i', $firstText)) {
                // Combine with next paragraph if it exists and is short
                if (count($elements) > 1 && $elements[1]['type'] === 'paragraph' && strlen($elements[1]['value']) < 200) {
                    $title = $firstText . ' ' . $elements[1]['value'];
                    array_shift($elements);
                    array_shift($elements);
                } else {
                    $title = $firstText;
                    array_shift($elements);
                }
            } elseif (preg_match('/^kasus\s+\d+/i', $firstText) || strlen($firstText) < 180) {
                $title = $firstText;
                array_shift($elements);
            }
        }
    }

    return [
        'title' => $title,
        'elements' => $elements,
        'questions' => $questions
    ];
}
