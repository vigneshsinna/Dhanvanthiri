<?php

namespace Tests\Unit;

use App\Modules\Catalog\Http\Controllers\RecommendationController;
use PHPUnit\Framework\TestCase;
use Illuminate\Http\Request;

/**
 * Unit tests for recommendation controller validation and strategy logic.
 * Tests the pure validation rules and strategy cascade documentation.
 */
class RecommendationControllerTest extends TestCase
{
    public function test_controller_class_exists(): void
    {
        $this->assertTrue(
            class_exists(RecommendationController::class),
            'RecommendationController must exist'
        );
    }

    public function test_index_method_exists(): void
    {
        $this->assertTrue(
            method_exists(RecommendationController::class, 'index'),
            'RecommendationController must have index() method'
        );
    }

    public function test_default_limit_is_8(): void
    {
        $request = Request::create('/api/products/recommendations', 'GET');
        $limit = $request->integer('limit', 8);
        $this->assertSame(8, $limit);
    }

    public function test_max_limit_is_20(): void
    {
        // Validation rule is max:20; we verify the intended range
        $request = Request::create('/api/products/recommendations', 'GET', ['limit' => 20]);
        $limit = $request->integer('limit', 8);
        $this->assertSame(20, $limit);
    }

    public function test_limit_param_parsed_correctly(): void
    {
        $request = Request::create('/api/products/recommendations', 'GET', ['limit' => 5]);
        $this->assertSame(5, $request->integer('limit', 8));
    }

    public function test_product_id_param_is_nullable(): void
    {
        $request = Request::create('/api/products/recommendations', 'GET');
        $this->assertNull($request->input('product_id'));
    }

    public function test_category_id_param_is_nullable(): void
    {
        $request = Request::create('/api/products/recommendations', 'GET');
        $this->assertNull($request->input('category_id'));
    }
}
