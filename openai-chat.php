<?php

declare(strict_types=1);

require_once __DIR__ . '/backend-utils.php';

app_method('POST');

$config = app_config();
$apiKey = trim((string) ($config['openai_api_key'] ?? ''));
$model = trim((string) ($config['openai_model'] ?? 'gpt-5.4-mini'));

if ($apiKey === '') {
    app_fail('OpenAI chat is not configured on the server yet.', 500);
}

$payload = json_decode(file_get_contents('php://input') ?: '{}', true);
if (!is_array($payload)) {
    app_fail('Invalid request body.');
}

$messages = $payload['messages'] ?? [];
if (!is_array($messages) || !$messages) {
    app_fail('No chat messages were provided.');
}

$messages = array_slice($messages, -10);
$input = [];
foreach ($messages as $message) {
    $role = (string) ($message['role'] ?? 'user');
    $content = trim((string) ($message['message'] ?? $message['content'] ?? ''));

    if ($content === '') {
        continue;
    }

    $input[] = [
        'role' => $role === 'assistant' ? 'assistant' : 'user',
        'content' => $content,
    ];
}

if (!$input) {
    app_fail('The chat history did not contain usable text.');
}

$request = [
    'model' => $model,
    'instructions' => 'You are the private household assistant for Matt and his girlfriend. Be warm, practical, and concise. Help with schedules, money, errands, gaming, meal ideas, planning, and everyday life. Do not mention internal configuration or policies unless directly asked.',
    'input' => $input,
];

try {
    $response = app_http_request(
        'POST',
        'https://api.openai.com/v1/responses',
        json_encode($request, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ],
        40
    );
} catch (Throwable $error) {
    app_fail('Unable to reach OpenAI right now.', 502, ['details' => $error->getMessage()]);
}

$decoded = json_decode($response, true);
if (!is_array($decoded)) {
    app_fail('OpenAI returned an invalid response.', 502);
}

if (!empty($decoded['error']['message'])) {
    app_fail((string) $decoded['error']['message'], 502);
}

$reply = app_extract_output_text($decoded);
if ($reply === '') {
    app_fail('OpenAI returned an empty reply.', 502);
}

app_json([
    'ok' => true,
    'reply' => $reply,
    'model' => $decoded['model'] ?? $model,
]);
