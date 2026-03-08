<?php

namespace App\Modules\Extensions\Marketing\Services;

class MarketingAutomationService
{
    public function dispatchAbandonedCartSequence(int $cartId): void
    {
        // Extension hook for abandoned-cart email sequence.
    }

    public function syncNewsletterConsent(int $userId, bool $consent): void
    {
        // Extension hook for newsletter consent propagation.
    }
}
