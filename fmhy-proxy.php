<?php

declare(strict_types=1);

require_once __DIR__ . '/backend-utils.php';

app_method('GET');

$page = trim((string) ($_GET['page'] ?? 'video'));
$page = preg_replace('/[^a-z0-9\-]/i', '', $page) ?: 'video';

try {
    $html = app_fetch_text("https://fmhy.net/{$page}");
} catch (Throwable $error) {
    app_fail('Unable to load FMHY right now.', 502, ['details' => $error->getMessage()]);
}

libxml_use_internal_errors(true);
$doc = new DOMDocument();
@$doc->loadHTML($html);
$xpath = new DOMXPath($doc);

$root = $xpath->query("//main//div[contains(@class, 'vp-doc')]")->item(0);
if (!$root) {
    $root = $xpath->query('//main')->item(0);
}

if (!$root) {
    app_fail('FMHY content could not be parsed.', 502);
}

$title = trim((string) ($xpath->query('//title')->item(0)?->textContent ?? 'FMHY'));
$description = trim((string) ($xpath->query("//meta[@name='description']")->item(0)?->getAttribute('content') ?? ''));
$sections = [];
$currentSectionIndex = -1;

foreach ($root->childNodes as $node) {
    if (!($node instanceof DOMElement)) {
        continue;
    }

    if (in_array(strtolower($node->tagName), ['h2', 'h3'], true)) {
        $heading = trim(app_plain_text($doc->saveHTML($node)));
        if ($heading === '') {
            continue;
        }

        $currentSection = [
            'title' => preg_replace('/\s+​$/u', '', $heading),
            'items' => [],
        ];
        $sections[] = $currentSection;
        $currentSectionIndex = count($sections) - 1;
        continue;
    }

    if (strtolower($node->tagName) !== 'ul' || $currentSectionIndex < 0) {
        continue;
    }

    foreach ($node->childNodes as $li) {
        if (!($li instanceof DOMElement) || strtolower($li->tagName) !== 'li') {
            continue;
        }

        $anchors = $li->getElementsByTagName('a');
        if ($anchors->length === 0) {
            continue;
        }

        $fullText = trim(app_plain_text($doc->saveHTML($li)));

        foreach ($anchors as $anchor) {
            $href = trim((string) $anchor->getAttribute('href'));
            $label = trim(app_plain_text($doc->saveHTML($anchor)));

            if ($href === '' || $label === '') {
                continue;
            }

            if (str_starts_with($href, '/')) {
                $href = 'https://fmhy.net' . $href;
            }

            $descriptionText = trim(str_replace($label, '', $fullText));
            $descriptionText = preg_replace('/\s+/', ' ', $descriptionText);

            $sections[$currentSectionIndex]['items'][] = [
                'label' => $label,
                'url' => $href,
                'description' => trim((string) $descriptionText, " -\t\n\r\0\x0B"),
            ];
        }
    }
}

$sections = array_values(array_filter($sections, static fn(array $section): bool => !empty($section['items'])));
libxml_clear_errors();

app_json([
    'ok' => true,
    'page' => $page,
    'title' => $title,
    'description' => $description,
    'sections' => $sections,
    'source' => "https://fmhy.net/{$page}",
]);
