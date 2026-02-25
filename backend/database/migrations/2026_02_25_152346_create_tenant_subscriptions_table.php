<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
     * @version 1.0.0 (EGI-HUB - BILLING FASE 3.3)
     * @date 2026-02-25
     * @purpose Associazione tenant ↔ piano di abbonamento con ciclo di vita completo
     */
    public function up(): void
    {
        Schema::create('tenant_subscriptions', function (Blueprint $table) {
            $table->id();

            // FK tenant
            $table->unsignedBigInteger('tenant_id')
                  ->comment('FK tenants.id');
            $table->foreign('tenant_id')
                  ->references('id')->on('tenants')
                  ->onDelete('cascade');

            // FK piano
            $table->unsignedBigInteger('plan_id')
                  ->comment('FK subscription_plans.id');
            $table->foreign('plan_id')
                  ->references('id')->on('subscription_plans')
                  ->onDelete('restrict');

            // Stato ciclo di vita
            $table->enum('status', ['active', 'trial', 'suspended', 'cancelled'])
                  ->default('trial')
                  ->comment('Stato corrente della sottoscrizione');

            // Date
            $table->timestamp('starts_at')->nullable()->comment('Inizio abbonamento');
            $table->timestamp('ends_at')->nullable()->comment('Fine abbonamento (null = no scadenza)');
            $table->timestamp('trial_ends_at')->nullable()->comment('Fine periodo di trial');

            // Fatturazione
            $table->decimal('price_paid_eur', 10, 2)->nullable()
                  ->comment('Prezzo effettivamente pagato (può differire dal listino)');
            $table->enum('billing_cycle', ['monthly', 'annual', 'custom'])
                  ->default('monthly')
                  ->comment('Frequenza di fatturazione');

            // Provider pagamento (nullable — popolati solo dopo il pagamento)
            $table->string('stripe_subscription_id', 255)->nullable()
                  ->comment('ID sottoscrizione Stripe');
            $table->string('paypal_subscription_id', 255)->nullable()
                  ->comment('ID sottoscrizione PayPal');

            $table->timestamps();
            $table->softDeletes();

            // Un tenant può avere una sola sottoscrizione attiva per piano
            $table->unique(['tenant_id', 'plan_id'], 'tenant_subs_tenant_plan_unique');
            $table->index('tenant_id');
            $table->index('plan_id');
            $table->index('status');
            $table->index('stripe_subscription_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_subscriptions');
    }
};
