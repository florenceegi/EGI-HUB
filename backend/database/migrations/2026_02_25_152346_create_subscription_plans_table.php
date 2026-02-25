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
     * @version 1.0.0 (EGI-HUB - BILLING FASE 3.2)
     * @date 2026-02-25
     * @purpose Piani di abbonamento per NATAN-LOC e futuri prodotti PA
     */
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();

            // FK al progetto a cui appartiene il piano (system_projects)
            $table->unsignedBigInteger('project_id')
                  ->comment('FK system_projects.id — progetto che usa questo piano');
            $table->foreign('project_id')
                  ->references('id')->on('system_projects')
                  ->onDelete('cascade');

            $table->string('name', 100)->comment('Nome pubblico del piano (es. Starter PA)');
            $table->string('slug', 100)->comment('Slug URL-friendly univoco per progetto');
            $table->text('description')->nullable()->comment('Descrizione del piano');

            // Prezzi
            $table->decimal('price_monthly_eur', 10, 2)->default(0)
                  ->comment('Prezzo mensile in EUR');
            $table->decimal('price_annual_eur', 10, 2)->default(0)
                  ->comment('Prezzo annuale in EUR (di solito scontato)');

            // Limiti
            $table->unsignedInteger('max_users')->default(0)
                  ->comment('Max utenti per tenant — 0 = illimitato');
            $table->unsignedInteger('max_documents')->default(0)
                  ->comment('Max documenti RAG — 0 = illimitato');
            $table->unsignedInteger('max_queries_monthly')->default(0)
                  ->comment('Max query al mese — 0 = illimitato');

            // Feature flags e configurazioni JSON
            $table->json('features')->nullable()
                  ->comment('Feature abilitate: {rag: true, memory: true, ...}');

            $table->boolean('is_active')->default(true)
                  ->comment('Piano visibile e acquistabile');
            $table->unsignedSmallInteger('display_order')->default(0)
                  ->comment('Ordine di visualizzazione in UI');

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['project_id', 'slug'], 'subs_plans_project_slug_unique');
            $table->index('project_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
