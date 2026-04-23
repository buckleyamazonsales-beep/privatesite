<?php

declare(strict_types=1);

require_once __DIR__ . '/backend-utils.php';

app_method('GET');

$region = strtolower(trim((string) ($_GET['region'] ?? 'na')));
$playersRaw = trim((string) ($_GET['players'] ?? ''));

if ($playersRaw === '') {
    app_fail('No players were provided.');
}

$players = array_values(array_filter(array_map('trim', explode(',', $playersRaw))));
if (!$players) {
    app_fail('No valid players were provided.');
}

$results = [];
foreach (array_slice($players, 0, 6) as $player) {
    $results[] = fetch_player_profile($player, $region);
}

app_json([
    'ok' => true,
    'region' => $region,
    'players' => $results,
]);

function fetch_player_profile(string $player, string $region): array
{
    $normalized = str_replace('#', '-', $player);
    $slug = rawurlencode($normalized);
    $url = "https://op.gg/lol/summoners/{$region}/{$slug}";

    try {
        $html = app_fetch_text($url, ['Accept-Language: en-US,en;q=0.9']);
    } catch (Throwable $error) {
        return [
            'player' => $player,
            'ok' => false,
            'error' => 'Unable to load OP.GG right now.',
            'source' => $url,
            'details' => $error->getMessage(),
        ];
    }

    $description = '';
    if (preg_match('/<meta name="description" content="([^"]+)"/i', $html, $matches)) {
        $description = html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    if ($description === '') {
        return [
            'player' => $player,
            'ok' => false,
            'error' => 'OP.GG did not return a usable profile summary.',
            'source' => $url,
        ];
    }

    $summary = parse_opgg_summary($description, $player, $url);
    $summary['champions'] = array_map('enrich_champion_stats', $summary['champions']);

    return $summary;
}

function parse_opgg_summary(string $description, string $fallbackName, string $source): array
{
    $parts = array_map('trim', explode(' / ', $description));
    $displayName = $parts[0] ?: $fallbackName;
    $rankBlock = $parts[1] ?? 'Unranked';
    $recordBlock = $parts[2] ?? '';

    preg_match('/(?P<wins>\d+)Win\s+(?P<losses>\d+)Lose\s+Win rate\s+(?P<winrate>\d+)%/i', $recordBlock, $record);
    preg_match('/(?P<lp>\d+)LP/i', $rankBlock, $lpMatch);

    $lp = isset($lpMatch['lp']) ? (int) $lpMatch['lp'] : null;
    $rank = trim((string) preg_replace('/\s*\d+LP/i', '', $rankBlock));

    $championBlock = implode(' / ', array_slice($parts, 3));
    $champions = [];
    foreach (preg_split('/,\s*/', $championBlock) as $chunk) {
        if (preg_match('/^(.*?)\s*-\s*(\d+)Win\s*(\d+)Lose\s*Win rate\s*(\d+)%$/i', trim($chunk), $matches)) {
            $champions[] = [
                'name' => trim($matches[1]),
                'wins' => (int) $matches[2],
                'losses' => (int) $matches[3],
                'winRate' => (int) $matches[4],
            ];
        }
    }

    return [
        'player' => $displayName,
        'ok' => true,
        'rank' => $rank,
        'lp' => $lp,
        'record' => [
            'wins' => isset($record['wins']) ? (int) $record['wins'] : 0,
            'losses' => isset($record['losses']) ? (int) $record['losses'] : 0,
            'winRate' => isset($record['winrate']) ? (int) $record['winrate'] : 0,
        ],
        'champions' => array_slice($champions, 0, 6),
        'source' => $source,
    ];
}

function enrich_champion_stats(array $champion): array
{
    $slug = champion_slug($champion['name']);
    if ($slug === '') {
        return $champion;
    }

    $url = "https://www.lolalytics.com/lol/{$slug}/build/";

    try {
        $html = app_fetch_text($url, ['Accept-Language: en-US,en;q=0.9']);
    } catch (Throwable) {
        $champion['lolalytics'] = null;
        $champion['lolalyticsUrl'] = $url;
        return $champion;
    }

    $text = app_plain_text($html);
    $stats = [
        'tier' => null,
        'pickRate' => match_stat('/([\d.]+)\s*%\s*Pick Rate/i', $text),
        'banRate' => match_stat('/([\d.]+)\s*%\s*Ban Rate/i', $text),
        'winRate' => match_stat('/([\d.]+)\s*%\s*Win Rate/i', $text),
    ];

    if (preg_match('/([SABCDF][+-]?)\s*Tier/i', $text, $tierMatch)) {
        $stats['tier'] = $tierMatch[1];
    }

    $champion['lolalytics'] = $stats;
    $champion['lolalyticsUrl'] = $url;

    return $champion;
}

function match_stat(string $pattern, string $text): ?float
{
    if (preg_match($pattern, $text, $matches)) {
        return (float) $matches[1];
    }

    return null;
}

function champion_slug(string $name): string
{
    $overrides = [
        "Cho'Gath" => 'chogath',
        "Kai'Sa" => 'kaisa',
        "Kha'Zix" => 'khazix',
        "Kog'Maw" => 'kogmaw',
        "Lee Sin" => 'leesin',
        "Master Yi" => 'masteryi',
        "Miss Fortune" => 'missfortune',
        "Nunu & Willump" => 'nunu',
        "Rek'Sai" => 'reksai',
        "Renata Glasc" => 'renata',
        "Tahm Kench" => 'tahmkench',
        "Twisted Fate" => 'twistedfate',
        "Vel'Koz" => 'velkoz',
        "Bel'Veth" => 'belveth',
        "Dr. Mundo" => 'drmundo',
        "Jarvan IV" => 'jarvaniv',
        "Aurelion Sol" => 'aurelionsol',
        "LeBlanc" => 'leblanc',
        "Wukong" => 'monkeyking',
        "Xin Zhao" => 'xinzhao',
    ];

    if (isset($overrides[$name])) {
        return $overrides[$name];
    }

    $slug = strtolower($name);
    $slug = str_replace([' ', "'", '.', '&'], '', $slug);
    $slug = preg_replace('/[^a-z0-9]/', '', $slug);

    return (string) $slug;
}
