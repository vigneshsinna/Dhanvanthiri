<?php

namespace App\Modules\CMS\Services;

class SeoAnalysisService
{
    public function analyze(string $content, array $meta): array
    {
        $title = (string) ($meta['title'] ?? '');
        $description = (string) ($meta['description'] ?? '');
        $wordCount = str_word_count(strip_tags($content));

        $titleScore = strlen($title) >= 50 && strlen($title) <= 60 ? 20 : 10;
        $descriptionScore = strlen($description) >= 120 && strlen($description) <= 160 ? 20 : 10;
        $contentScore = $wordCount >= 300 ? 20 : 10;

        $score = min(100, $titleScore + $descriptionScore + $contentScore + 40);

        return [
            'score' => $score,
            'title_score' => $titleScore,
            'description_score' => $descriptionScore,
            'content_score' => $contentScore,
            'recommendations' => [
                'Keep one H1 and structured H2/H3 headings',
                'Ensure all images include alt text',
                'Add internal links to related products/posts',
            ],
        ];
    }
}
