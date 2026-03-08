<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Guest checkout: make user_id nullable, add guest fields
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->string('guest_email', 255)->nullable()->after('user_id');
            $table->string('guest_phone', 20)->nullable()->after('guest_email');
        });

        // Stock reservations for oversell protection
        Schema::create('stock_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->cascadeOnDelete();
            $table->integer('quantity');
            $table->foreignId('cart_id')->nullable()->constrained('carts')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->cascadeOnDelete();
            $table->enum('status', ['held', 'confirmed', 'released'])->default('held')->index();
            $table->timestamp('expires_at')->index();
            $table->timestamps();
            $table->index(['product_id', 'variant_id', 'status']);
        });

        // Wishlists
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 100)->default('My Wishlist');
            $table->timestamps();
            $table->unique(['user_id', 'name']);
        });

        Schema::create('wishlist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wishlist_id')->constrained('wishlists')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->timestamps();
            $table->unique(['wishlist_id', 'product_id', 'variant_id'], 'uq_wishlist_product_variant');
        });

        // Customer notifications
        Schema::create('customer_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->cascadeOnDelete();
            $table->string('channel', 20)->default('email'); // email, sms, whatsapp
            $table->string('type', 50)->index(); // order_confirmed, payment_success, shipped, delivered, etc.
            $table->string('recipient', 255);
            $table->string('subject', 255)->nullable();
            $table->text('body')->nullable();
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending')->index();
            $table->timestamp('sent_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_notifications');
        Schema::dropIfExists('wishlist_items');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('stock_reservations');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['guest_email', 'guest_phone']);
            $table->dropForeign(['user_id']);
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
        });
    }
};
