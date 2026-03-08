<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->string('order_number', 30)->unique();
            $table->enum('status', ['pending_payment','paid','payment_failed','processing','shipped','delivered','completed','cancelled','refunded','partially_refunded'])->index();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('shipping_cost', 10, 2);
            $table->decimal('tax_amount', 10, 2);
            $table->decimal('grand_total', 10, 2);
            $table->char('currency', 3)->default('INR');
            $table->string('coupon_code', 50)->nullable();
            $table->text('notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status', 'created_at']);
        });

        Schema::create('order_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->enum('type', ['shipping', 'billing']);
            $table->string('recipient_name', 100);
            $table->string('phone', 20);
            $table->string('line1', 200);
            $table->string('line2', 200)->nullable();
            $table->string('city', 100);
            $table->string('state', 100);
            $table->string('postal_code', 20);
            $table->char('country_code', 2);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('gateway', 30);
            $table->string('gateway_transaction_id', 200)->nullable();
            $table->string('gateway_payment_intent_id', 200)->nullable();
            $table->unsignedBigInteger('amount_minor');
            $table->decimal('amount_decimal', 10, 2);
            $table->char('currency', 3);
            $table->enum('status', ['pending','paid','failed','refunded','partially_refunded'])->index();
            $table->string('payment_method_type', 50)->nullable();
            $table->char('payment_method_last4', 4)->nullable();
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->unique(['gateway', 'gateway_transaction_id']);
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('reason', 255);
            $table->string('gateway_refund_id', 200)->nullable()->unique();
            $table->enum('status', ['pending','succeeded','failed'])->index();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('payment_webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('gateway', 30);
            $table->string('gateway_event_id', 200)->nullable();
            $table->string('event_type', 100);
            $table->longText('payload');
            $table->string('signature', 300);
            $table->boolean('processed')->default(false)->index();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->unique(['gateway', 'gateway_event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_webhooks');
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_addresses');
        Schema::dropIfExists('orders');
    }
};
