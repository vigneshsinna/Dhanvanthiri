<?php

namespace Tests\Feature;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class LegalPageMetadataTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'CMS Admin',
            'email' => 'cms-admin@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->adminToken = JWTAuth::fromUser($this->admin);
    }

    public function test_admin_can_create_page_with_effective_date(): void
    {
        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/admin/pages', [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'content' => '<h2>Privacy Policy</h2><p>Content</p>',
                'excerpt' => 'How we collect and use customer information.',
                'status' => 'published',
                'effective_date' => '2026-03-08',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.data.effective_date', '2026-03-08');

        $this->assertDatabaseHas('pages', [
            'slug' => 'privacy-policy',
            'effective_date' => '2026-03-08',
        ]);
    }

    public function test_admin_can_update_page_effective_date(): void
    {
        $page = Page::create([
            'title' => 'Terms & Conditions',
            'slug' => 'terms-and-conditions',
            'content' => '<h2>Terms</h2><p>Content</p>',
            'status' => 'published',
            'author_id' => $this->admin->id,
        ]);

        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson("/api/admin/pages/{$page->id}", [
                'effective_date' => '2026-03-09',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.data.effective_date', '2026-03-09');
    }

    public function test_public_page_response_includes_effective_date(): void
    {
        Page::create([
            'title' => 'Shipping Policy',
            'slug' => 'shipping-policy',
            'content' => '<h2>Shipping</h2><p>Content</p>',
            'excerpt' => 'Shipping coverage and timelines.',
            'status' => 'published',
            'author_id' => $this->admin->id,
            'effective_date' => '2026-03-10',
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/pages/shipping-policy');

        $response->assertOk()
            ->assertJsonPath('data.data.effective_date', '2026-03-10')
            ->assertJsonPath('data.data.excerpt', 'Shipping coverage and timelines.');
    }
}
