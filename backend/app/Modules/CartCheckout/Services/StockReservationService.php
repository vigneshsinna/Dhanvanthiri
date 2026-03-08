<?php

namespace App\Modules\CartCheckout\Services;

use App\Modules\CartCheckout\Models\StockReservation;
use App\Modules\CartCheckout\Models\Cart;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class StockReservationService
{
    private const RESERVATION_TTL_MINUTES = 15;

    /**
     * Reserve stock for all items in a cart. Throws on insufficient stock.
     */
    public function reserveForCart(Cart $cart): array
    {
        $cart->loadMissing(['items.product', 'items.variant']);
        $reservations = [];

        DB::transaction(function () use ($cart, &$reservations) {
            // Release any prior held reservations for this cart
            StockReservation::where('cart_id', $cart->id)
                ->where('status', 'held')
                ->update(['status' => 'released']);

            foreach ($cart->items as $item) {
                $availableStock = $this->getAvailableStock($item->product_id, $item->variant_id);

                if ($availableStock < $item->quantity) {
                    $name = $item->product->name;
                    throw new \RuntimeException("Insufficient stock for {$name} (available: {$availableStock}, requested: {$item->quantity})");
                }

                $reservations[] = StockReservation::create([
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'cart_id' => $cart->id,
                    'status' => 'held',
                    'expires_at' => now()->addMinutes(self::RESERVATION_TTL_MINUTES),
                ]);
            }
        });

        return $reservations;
    }

    /**
     * Confirm reservations — typically on payment success. Decrements actual stock.
     */
    public function confirmForOrder(int $orderId, int $cartId): void
    {
        DB::transaction(function () use ($orderId, $cartId) {
            $reservations = StockReservation::where('cart_id', $cartId)
                ->where('status', 'held')
                ->lockForUpdate()
                ->get();

            foreach ($reservations as $reservation) {
                if ($reservation->variant_id) {
                    ProductVariant::where('id', $reservation->variant_id)
                        ->where('stock_quantity', '>=', $reservation->quantity)
                        ->update(['stock_quantity' => DB::raw("stock_quantity - {$reservation->quantity}")]);
                } else {
                    Product::where('id', $reservation->product_id)
                        ->where('stock_quantity', '>=', $reservation->quantity)
                        ->update(['stock_quantity' => DB::raw("stock_quantity - {$reservation->quantity}")]);
                }

                $reservation->update([
                    'status' => 'confirmed',
                    'order_id' => $orderId,
                ]);
            }
        });
    }

    /**
     * Release held reservations for a cart (e.g., on abandonment or expiry).
     */
    public function releaseForCart(int $cartId): void
    {
        StockReservation::where('cart_id', $cartId)
            ->where('status', 'held')
            ->update(['status' => 'released']);
    }

    /**
     * Release expired reservations (scheduled job).
     */
    public function releaseExpired(): int
    {
        return StockReservation::where('status', 'held')
            ->where('expires_at', '<', now())
            ->update(['status' => 'released']);
    }

    /**
     * Get available stock considering active reservations.
     */
    private function getAvailableStock(int $productId, ?int $variantId): int
    {
        $heldQty = StockReservation::where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->where('status', 'held')
            ->where('expires_at', '>', now())
            ->sum('quantity');

        if ($variantId) {
            $totalStock = ProductVariant::where('id', $variantId)->value('stock_quantity') ?? 0;
        } else {
            $totalStock = Product::where('id', $productId)->value('stock_quantity') ?? 0;
        }

        return max(0, $totalStock - $heldQty);
    }
}
