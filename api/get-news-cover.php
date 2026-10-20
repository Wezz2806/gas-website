<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$url = isset($_GET['url']) ? $_GET['url'] : '';

if (empty($url)) {
    echo json_encode(['error' => 'URL is required']);
    exit;
}

// Validate URL
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    echo json_encode(['error' => 'Invalid URL']);
    exit;
}

// Simple local cache to speed up requests and avoid overloading target servers
$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0777, true);
}
$cacheFile = $cacheDir . '/' . md5($url) . '.json';
$cacheTime = 86400; // 24 hours

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    $cachedData = file_get_contents($cacheFile);
    if ($cachedData !== false) {
        echo $cachedData;
        exit;
    }
}

// Fetch content using curl with standard User-Agent
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
curl_setopt($ch, CURLOPT_TIMEOUT, 3);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$html) {
    echo json_encode(['error' => 'Failed to fetch the URL', 'http_code' => $httpCode]);
    exit;
}

// Parse HTML to extract og:image or twitter:image
$imageUrl = '';

// Regex for og:image
if (preg_match('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $matches)) {
    $imageUrl = $matches[1];
} elseif (preg_match('/<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']/i', $html, $matches)) {
    $imageUrl = $matches[1];
}
// Fallback to twitter:image
elseif (preg_match('/<meta[^>]*name=["\']twitter:image["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $matches)) {
    $imageUrl = $matches[1];
} elseif (preg_match('/<meta[^>]*content=["\']([^"\']+)["\'][^>]*name=["\']twitter:image["\']/i', $html, $matches)) {
    $imageUrl = $matches[1];
}

// Clean and resolve relative URLs
if (!empty($imageUrl)) {
    $imageUrl = html_entity_decode($imageUrl);
    if (strpos($imageUrl, '//') === 0) {
        $parsedUrl = parse_url($url);
        $scheme = isset($parsedUrl['scheme']) ? $parsedUrl['scheme'] : 'https';
        $imageUrl = $scheme . ':' . $imageUrl;
    } elseif (strpos($imageUrl, '/') === 0) {
        $parsedUrl = parse_url($url);
        $scheme = isset($parsedUrl['scheme']) ? $parsedUrl['scheme'] : 'https';
        $host = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';
        $imageUrl = $scheme . '://' . $host . $imageUrl;
    }
}

$response = [
    'url' => $url,
    'image' => $imageUrl
];

$jsonResponse = json_encode($response);
file_put_contents($cacheFile, $jsonResponse);

echo $jsonResponse;
