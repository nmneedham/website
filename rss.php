<?php
header('Content-Type: application/rss+xml; charset=utf-8');
$SPACE_ID = 'fviougkbi52t';
$ACCESS_TOKEN = '-s8slzxy4UvY1VOFDR9gZwEWm3xWsTjIl21TWM7-8oA';
$staticPosts = [
    ['date' => '2025-08-07T00:00:00Z', 'title' => 'Gameboy Advance SP Reshell', 'url' => 'https://nmneedham.dev/blog/gbaspreshell.html', 'description' => 'Shell replacement for my wife\'s GBA SP using Aliexpress kit.', 'author' => 'Nick'],
    ['date' => '2025-07-12T00:00:00Z', 'title' => 'My Upcoming Projects', 'url' => 'https://nmneedham.dev/blog/upcomingprojects.html', 'description' => 'USB-C cords, Gamecube paracord, and N64 Steel Sticks projects.', 'author' => 'Nick'],
    ['date' => '2025-07-01T00:00:00Z', 'title' => 'SNES Restoration', 'url' => 'https://nmneedham.dev/blog/snesresto.html', 'description' => 'Restoring a 1993 SNES found in a backyard shed.', 'author' => 'Nick']
];
$allPosts = $staticPosts;
try {
    $url = "https://cdn.contentful.com/spaces/{$SPACE_ID}/entries?content_type=blogPost&access_token={$ACCESS_TOKEN}&order=-sys.createdAt";
    $response = @file_get_contents($url);
    if ($response) {
        $data = json_decode($response, true);
        if (isset($data['items'])) {
            foreach ($data['items'] as $post) {
                $fields = $post['fields'];
                $allPosts[] = [
                    'date' => $fields['publishedDate'] ?? $post['sys']['createdAt'],
                    'title' => $fields['title'] ?? 'Untitled',
                    'url' => "https://nmneedham.dev/blog/blog-post.html?slug=" . ($fields['slug'] ?? $post['sys']['id']),
                    'description' => $fields['excerpt'] ?? 'No description',
                    'author' => $fields['author'] ?? 'Nick'
                ];
            }
        }
    }
} catch (Exception $e) {}
usort($allPosts, fn($a, $b) => strtotime($b['date']) - strtotime($a['date']));
echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<rss version="2.0">
    <channel>
        <title>nmneedham.dev</title>
        <link>https://nmneedham.dev</link>
        <description>Programming, gaming, and electronics blog</description>
        <language>en-us</language>
<?php foreach ($allPosts as $post): ?>
        <item>
            <title><?= htmlspecialchars($post['title']) ?></title>
            <link><?= htmlspecialchars($post['url']) ?></link>
            <description><?= htmlspecialchars($post['description']) ?></description>
            <pubDate><?= date(DATE_RSS, strtotime($post['date'])) ?></pubDate>
        </item>
<?php endforeach; ?>
    </channel>
</rss>
