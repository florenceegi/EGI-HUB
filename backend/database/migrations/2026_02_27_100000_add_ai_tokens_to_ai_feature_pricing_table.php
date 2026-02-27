<?php

/**
 * @package Database\Migrations
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (FlorenceEGI - AI Token Recharge Model)
 * @date 2026-02-27
 * @purpose Aggiunge colonne per modello ricarica AI Token → Egili
 *
 * Modello:
 *   Cliente acquista FIAT → accreditati ai_tokens_included Egili (1:1)
 *   Consumo query: token_consumati × 1.20 scalati dal saldo
 *   Bonus volume: ai_tokens_bonus_percentage % di token extra (es. 10% su grandi pack)
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void {
        Schema::table('ai_feature_pricing', function (Blueprint $table) {
            $table->unsignedBigInteger('ai_tokens_included')->nullable()->after('cost_egili')
                ->comment('AI Token inclusi nel pacchetto (accreditati 1:1 come Egili). NULL = non è un pacchetto ricarica.');

            $table->unsignedTinyInteger('ai_tokens_bonus_percentage')->nullable()->default(0)->after('ai_tokens_included')
                ->comment('Percentuale bonus token su volume (es: 10 = +10% token aggiuntivi). 0 = nessun bonus.');
        });
    }

    public function down(): void {
        Schema::table('ai_feature_pricing', function (Blueprint $table) {
            $table->dropColumn(['ai_tokens_included', 'ai_tokens_bonus_percentage']);
        });
    }
};
