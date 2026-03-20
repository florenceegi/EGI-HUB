<?php

declare(strict_types=1);

/**
 * @package Database\Migrations
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (FlorenceEGI - NATAN LOC egili_gift SSOT)
 * @date 2026-03-20
 * @purpose Aggiunge colonna egili_gift ad ai_feature_pricing.
 *
 *          egili_gift = Egili che l'utente RICEVE come regalo all'acquisto del pacchetto.
 *          Scritto UNA VOLTA dall'admin (Seeder o EGI-HUB UI).
 *          Letto da tutta la logica di acquisto come SSOT.
 *
 *          Sostituisce il calcolo runtime: ai_tokens_included × egili_credit_ratio.
 *          Il ratio in platform_settings rimane come check di sicurezza interno,
 *          ma egili_gift è il valore autorevole per UI e webhook Stripe.
 *
 *          Valori iniziali (definiti nel NatanLocQueryPackagesSeeder v2.2.0):
 *            natan_loc_token_1000  → egili_gift =   800
 *            natan_loc_token_2500  → egili_gift =  2000
 *            natan_loc_token_6250  → egili_gift =  5000
 *            natan_loc_token_12500 → egili_gift = 10000
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_feature_pricing', function (Blueprint $table) {
            $table->unsignedBigInteger('egili_gift')
                ->nullable()
                ->default(null)
                ->after('ai_tokens_included')
                ->comment(
                    'Egili accreditati al wallet utente all\'acquisto (SSOT). ' .
                    'Scritto dall\'admin. NULL = non è un pacchetto con regalo Egili. ' .
                    'Sostituisce il calcolo runtime ai_tokens_included × egili_credit_ratio.'
                );
        });
    }

    public function down(): void
    {
        Schema::table('ai_feature_pricing', function (Blueprint $table) {
            $table->dropColumn('egili_gift');
        });
    }
};
