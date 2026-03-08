<?php

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;

class PaymentWebhookReplayTest extends TestCase
{
    public function test_webhook_replay_is_idempotent_placeholder(): void
    {
        $this->assertTrue(true);
    }
}
