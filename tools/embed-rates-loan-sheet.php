<?php
/**
 * Merge partials/rates-loan-sheet-inner.html into data/content.json (pages.rates loan block).
 * Usage (from namefed-demo): php tools/embed-rates-loan-sheet.php
 */
$root = dirname(__DIR__);
$jsonPath = $root . '/data/content.json';
$htmlPath = $root . '/partials/rates-loan-sheet-inner.html';

$data = json_decode(file_get_contents($jsonPath), true);
if (!is_array($data)) {
    fwrite(STDERR, "Invalid JSON: {$jsonPath}\n");
    exit(1);
}
$html = file_get_contents($htmlPath);
if ($html === false) {
    fwrite(STDERR, "Missing: {$htmlPath}\n");
    exit(1);
}

foreach ($data['pages']['rates']['blocks'] as $i => &$b) {
    if (($b['type'] ?? '') === 'content' && ($b['data']['modifiers'] ?? '') === 'section--alt') {
        $inner = $b['data']['innerHtml'] ?? '';
        if (str_contains($inner, 'rates-sheet-wrapper')) {
            $b['data'] = ['modifiers' => 'section--alt', 'innerHtml' => $html];
            file_put_contents(
                $jsonPath,
                json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n"
            );
            echo "Updated block index {$i} in content.json.\n";
            exit(0);
        }
    }
}

fwrite(STDERR, "Could not find loan rates block with rates-sheet-wrapper.\n");
exit(1);
