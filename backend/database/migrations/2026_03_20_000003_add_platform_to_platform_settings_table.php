<?php

declare(strict_types=1);

/**
 * @package Database\Migrations
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (FlorenceEGI - Platform Settings multi-platform)
 * @date 2026-03-20
 * @purpose Aggiunge colonna `platform` a platform_settings.
 *          Permette di filtrare i setting per organo dell'ecosistema
 *          (es. 'egi', 'natan_loc', 'egi_hub', NULL = globale).
 *          NULL = setting globale, visibile e usato da tutti gli organi.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->string('platform', 50)
                ->nullable()
                ->default(null)
                ->after('key')
                ->comment(
                    'Organo destinatario del setting (es: egi, natan_loc, egi_hub). ' .
                    'NULL = setting globale condiviso da tutti gli organi.'
                );
        });
    }

    public function down(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn('platform');
        });
    }
};
