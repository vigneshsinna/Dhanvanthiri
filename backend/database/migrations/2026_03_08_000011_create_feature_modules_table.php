<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('feature_modules', function (Blueprint $table) {
            $table->id();
            $table->string('module_code', 80)->unique();
            $table->string('module_name', 120);
            $table->text('description')->nullable();
            $table->boolean('is_enabled')->default(false)->index();

            $table->string('license_type', 50)->nullable();
            $table->text('license_key')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable()->index();

            $table->enum('integration_status', ['not_configured', 'configured', 'healthy', 'degraded', 'failed'])
                ->default('not_configured')
                ->index();
            $table->enum('health_status', ['unknown', 'healthy', 'degraded', 'failed'])
                ->default('unknown')
                ->index();
            $table->timestamp('last_validated_at')->nullable();

            $table->json('config_json')->nullable();
            $table->string('vendor_name', 120)->nullable();
            $table->text('notes')->nullable();

            $table->foreignId('activated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('activated_on')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_modules');
    }
};
