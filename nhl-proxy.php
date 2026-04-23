<?php

declare(strict_types=1);

require_once __DIR__ . '/backend-utils.php';

app_method('GET');

try {
    $payload = app_fetch_json('https://api-web.nhle.com/v1/score/now');
} catch (Throwable $error) {
    app_fail('Unable to load NHL scores right now.', 502, ['details' => $error->getMessage()]);
}

app_json([
    'ok' => true,
    'generatedAt' => gmdate(DATE_ATOM),
    'games' => $payload['games'] ?? [],
]);
