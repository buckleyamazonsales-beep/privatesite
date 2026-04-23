<?php

declare(strict_types=1);

function app_config(): array
{
    static $config = null;

    if ($config !== null) {
        return $config;
    }

    $configPath = __DIR__ . DIRECTORY_SEPARATOR . 'server-config.php';
    $config = file_exists($configPath) ? require $configPath : [];

    return is_array($config) ? $config : [];
}

function app_json(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function app_fail(string $message, int $status = 400, array $extra = []): void
{
    app_json(array_merge(['ok' => false, 'error' => $message], $extra), $status);
}

function app_method(string $expected): void
{
    $actual = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if ($actual !== strtoupper($expected)) {
        app_fail("Method {$actual} not allowed.", 405);
    }
}

function app_http_request(string $method, string $url, ?string $body = null, array $headers = [], int $timeout = 20): string
{
    $baseHeaders = [
        'User-Agent: imbuckleyy-dashboard/1.0 (+https://imbuckleyy.xyz)',
        'Accept: text/html,application/json;q=0.9,*/*;q=0.8',
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_HTTPHEADER => array_merge($baseHeaders, $headers),
        ]);

        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }

        $response = curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false || $statusCode >= 400) {
            throw new RuntimeException($error ?: "Request failed with status {$statusCode}.");
        }

        return (string) $response;
    }

    $context = stream_context_create([
        'http' => [
            'method' => strtoupper($method),
            'header' => implode("\r\n", array_merge($baseHeaders, $headers)),
            'timeout' => $timeout,
            'ignore_errors' => true,
            'content' => $body ?? '',
        ],
    ]);

    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        throw new RuntimeException('Unable to fetch remote content.');
    }

    return (string) $response;
}

function app_fetch_text(string $url, array $headers = [], int $timeout = 20): string
{
    return app_http_request('GET', $url, null, $headers, $timeout);
}

function app_fetch_json(string $url, array $headers = [], int $timeout = 20): array
{
    $response = app_fetch_text($url, $headers, $timeout);
    $decoded = json_decode($response, true);

    if (!is_array($decoded)) {
        throw new RuntimeException('Invalid JSON response.');
    }

    return $decoded;
}

function app_plain_text(string $html): string
{
    $text = preg_replace('/<script\b[^>]*>[\s\S]*?<\/script>/i', ' ', $html);
    $text = preg_replace('/<style\b[^>]*>[\s\S]*?<\/style>/i', ' ', (string) $text);
    $text = strip_tags((string) $text);
    $text = html_entity_decode((string) $text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = preg_replace('/\s+/u', ' ', (string) $text);

    return trim((string) $text);
}

function app_last_day_of_month(DateTimeImmutable $date): int
{
    return (int) $date->format('t');
}

function app_month_add(DateTimeImmutable $date, int $months): DateTimeImmutable
{
    $target = $date->modify("first day of +{$months} month");
    $day = min((int) $date->format('j'), app_last_day_of_month($target));
    return $target->setDate((int) $target->format('Y'), (int) $target->format('n'), $day);
}

function app_extract_output_text(array $payload): string
{
    if (!empty($payload['output_text']) && is_string($payload['output_text'])) {
        return trim($payload['output_text']);
    }

    if (!empty($payload['output']) && is_array($payload['output'])) {
        foreach ($payload['output'] as $item) {
            if (($item['type'] ?? '') !== 'message' || empty($item['content']) || !is_array($item['content'])) {
                continue;
            }

            $parts = [];
            foreach ($item['content'] as $contentItem) {
                if (($contentItem['type'] ?? '') === 'output_text' && !empty($contentItem['text'])) {
                    $parts[] = $contentItem['text'];
                }
            }

            if ($parts) {
                return trim(implode("\n", $parts));
            }
        }
    }

    return '';
}
