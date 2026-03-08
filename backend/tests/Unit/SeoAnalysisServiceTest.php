<?php

namespace Tests\Unit;

use App\Modules\CMS\Services\SeoAnalysisService;
use PHPUnit\Framework\TestCase;

class SeoAnalysisServiceTest extends TestCase
{
    private SeoAnalysisService $service;

    protected function setUp(): void
    {
        $this->service = new SeoAnalysisService();
    }

    public function test_perfect_score_with_optimal_content(): void
    {
        $content = str_repeat('word ', 300); // 300 words
        $meta = [
            'title' => str_repeat('x', 55),       // 50-60 chars
            'description' => str_repeat('y', 140), // 120-160 chars
        ];

        $result = $this->service->analyze($content, $meta);
        $this->assertSame(100, $result['score']);
        $this->assertSame(20, $result['title_score']);
        $this->assertSame(20, $result['description_score']);
        $this->assertSame(20, $result['content_score']);
    }

    public function test_reduced_score_with_short_title(): void
    {
        $content = str_repeat('word ', 300);
        $meta = [
            'title' => 'Short',
            'description' => str_repeat('y', 140),
        ];

        $result = $this->service->analyze($content, $meta);
        $this->assertSame(10, $result['title_score']);
        $this->assertSame(90, $result['score']); // 10 + 20 + 20 + 40
    }

    public function test_reduced_score_with_short_description(): void
    {
        $content = str_repeat('word ', 300);
        $meta = [
            'title' => str_repeat('x', 55),
            'description' => 'Short desc',
        ];

        $result = $this->service->analyze($content, $meta);
        $this->assertSame(10, $result['description_score']);
        $this->assertSame(90, $result['score']);
    }

    public function test_reduced_score_with_insufficient_word_count(): void
    {
        $content = 'Just a few words here.';
        $meta = [
            'title' => str_repeat('x', 55),
            'description' => str_repeat('y', 140),
        ];

        $result = $this->service->analyze($content, $meta);
        $this->assertSame(10, $result['content_score']);
        $this->assertSame(90, $result['score']);
    }

    public function test_minimum_score_with_all_poor_content(): void
    {
        $content = 'Hello';
        $meta = ['title' => 'Hi', 'description' => 'Short'];

        $result = $this->service->analyze($content, $meta);
        $this->assertSame(10, $result['title_score']);
        $this->assertSame(10, $result['description_score']);
        $this->assertSame(10, $result['content_score']);
        $this->assertSame(70, $result['score']); // 10+10+10+40
    }

    public function test_recommendations_always_present(): void
    {
        $result = $this->service->analyze('', []);
        $this->assertIsArray($result['recommendations']);
        $this->assertNotEmpty($result['recommendations']);
    }

    public function test_empty_meta_uses_defaults(): void
    {
        $result = $this->service->analyze('', []);
        // Empty title/description → 10 each, empty content → 10
        $this->assertSame(70, $result['score']);
    }

    public function test_html_tags_stripped_from_word_count(): void
    {
        $content = '<p>Hello</p><div>world</div>'; // 2 words only
        $meta = ['title' => str_repeat('x', 55), 'description' => str_repeat('y', 140)];

        $result = $this->service->analyze($content, $meta);
        $this->assertSame(10, $result['content_score']); // 2 words < 300
    }

    public function test_score_capped_at_100(): void
    {
        $content = str_repeat('word ', 1000);
        $meta = [
            'title' => str_repeat('x', 55),
            'description' => str_repeat('y', 140),
        ];

        $result = $this->service->analyze($content, $meta);
        $this->assertLessThanOrEqual(100, $result['score']);
    }

    public function test_title_at_boundary_50_chars(): void
    {
        $meta = ['title' => str_repeat('a', 50), 'description' => ''];
        $result = $this->service->analyze('', $meta);
        $this->assertSame(20, $result['title_score']);
    }

    public function test_title_at_boundary_60_chars(): void
    {
        $meta = ['title' => str_repeat('a', 60), 'description' => ''];
        $result = $this->service->analyze('', $meta);
        $this->assertSame(20, $result['title_score']);
    }

    public function test_title_at_61_chars_gets_reduced_score(): void
    {
        $meta = ['title' => str_repeat('a', 61), 'description' => ''];
        $result = $this->service->analyze('', $meta);
        $this->assertSame(10, $result['title_score']);
    }

    public function test_description_at_boundary_120_chars(): void
    {
        $meta = ['title' => '', 'description' => str_repeat('a', 120)];
        $result = $this->service->analyze('', $meta);
        $this->assertSame(20, $result['description_score']);
    }

    public function test_description_at_boundary_160_chars(): void
    {
        $meta = ['title' => '', 'description' => str_repeat('a', 160)];
        $result = $this->service->analyze('', $meta);
        $this->assertSame(20, $result['description_score']);
    }
}
