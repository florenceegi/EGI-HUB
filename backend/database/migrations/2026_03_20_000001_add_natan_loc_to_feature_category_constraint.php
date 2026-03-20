<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * @package Database\Migrations
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (FlorenceEGI - EGI-HUB)
 * @date 2026-03-20
 * @purpose Estende il check constraint di ai_feature_pricing.feature_category
 *          per includere 'natan_loc' — necessario per i pacchetti Token AI di NATAN_LOC.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE ai_feature_pricing DROP CONSTRAINT IF EXISTS ai_feature_pricing_feature_category_check');
        DB::statement("ALTER TABLE ai_feature_pricing ADD CONSTRAINT ai_feature_pricing_feature_category_check CHECK (feature_category::text = ANY (ARRAY['ai_services'::varchar, 'premium_visibility'::varchar, 'premium_profile'::varchar, 'premium_analytics'::varchar, 'exclusive_access'::varchar, 'platform_services'::varchar, 'natan_loc'::varchar]::text[]))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE ai_feature_pricing DROP CONSTRAINT IF EXISTS ai_feature_pricing_feature_category_check');
        DB::statement("ALTER TABLE ai_feature_pricing ADD CONSTRAINT ai_feature_pricing_feature_category_check CHECK (feature_category::text = ANY (ARRAY['ai_services'::varchar, 'premium_visibility'::varchar, 'premium_profile'::varchar, 'premium_analytics'::varchar, 'exclusive_access'::varchar, 'platform_services'::varchar]::text[]))");
    }
};
