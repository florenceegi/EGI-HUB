<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * @package Database\Seeders
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 2.0.0 (FlorenceEGI - NATAN LOC Query Packages)
 * @date 2026-03-20
 * @purpose Inserisce i pacchetti Token AI per NATAN_LOC nella tabella ai_feature_pricing.
 *
 *          SEMANTICA CORRETTA (allineata a EGI):
 *          feature_parameters.egili_amount = Token AI (prodotto user-facing, MiCA-safe)
 *          Egili accreditati al wallet      = egili_amount × egili_credit_ratio (0.80)
 *          egili_credit_ratio da PlatformSetting 'ai_credits','egili_credit_ratio'
 *
 *          ESEMPIO: NATAN Token 1.000 → utente compra 1000 Token AI → riceve 800 Egili
 *
 *          Query stimate su Egili ricevuti (÷ 70 Egili/query media NATAN):
 *          1000 Token AI → 800 Egili → ~11 query
 *          2500 Token AI → 2000 Egili → ~28 query
 *          6250 Token AI → 5000 Egili → ~71 query
 *          12500 Token AI → 10000 Egili → ~142 query
 *
 *          PREZZI non impostati — is_active=false — attivare via EGI-HUB Superadmin dopo pricing.
 */
class NatanLocQueryPackagesSeeder extends Seeder
{
    public function run(): void
    {
        // Rimuovi i vecchi record con feature_code obsoleti (v1.0.0 usava valori errati)
        DB::table('ai_feature_pricing')->whereIn('feature_code', [
            'natan_loc_token_800',
            'natan_loc_token_2000',
            'natan_loc_token_5000',
            'natan_loc_token_10000',
        ])->delete();

        $packages = [
            [
                'feature_code'        => 'natan_loc_token_1000',
                'feature_name'        => 'NATAN Token 1.000',
                'feature_description' => 'Pacchetto 1.000 Token AI per NATAN LOC — ideale per uso occasionale. Credita 800 Egili al wallet. Consente circa 11 query tipiche al sistema documentale AI.',
                'feature_category'    => 'natan_loc',
                'cost_fiat_eur'       => null,   // ⚠️ DA IMPOSTARE via EGI-HUB Superadmin
                'cost_egili'          => 0,       // Acquistato con EUR, non con Egili
                'is_free'             => false,
                'free_monthly_limit'  => 0,
                'is_bundle'           => true,
                'bundle_type'         => 'credit_package',
                'discount_percentage' => 0,
                'is_recurring'        => false,
                'recurrence_period'   => 'one_time',
                'expires'             => false,
                'stackable'           => true,
                'is_active'           => false,  // ⚠️ Attivare SOLO dopo aver impostato il prezzo
                'is_featured'         => false,
                'display_order'       => 100,
                'feature_parameters'  => json_encode([
                    'egili_amount'    => 1000,   // Token AI venduti (user-facing)
                    'egili_credited'  => 800,    // Egili al wallet (egili_amount × 0.80)
                    'token_unit'      => 'Token AI',
                    'approx_queries'  => 11,     // 800 Egili ÷ 70 Egili/query
                    'platform'        => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    '1.000 Token AI — 800 Egili accreditati al wallet',
                    'Utilizzo su tutte le funzioni AI di NATAN',
                    'Pagamento sicuro Stripe',
                    'Token non scadono',
                ]),
                'metadata' => json_encode([
                    'created_by' => 'NatanLocQueryPackagesSeeder',
                    'version'    => '2.0.0',
                ]),
            ],
            [
                'feature_code'        => 'natan_loc_token_2500',
                'feature_name'        => 'NATAN Token 2.500',
                'feature_description' => 'Pacchetto 2.500 Token AI per NATAN LOC — uso regolare. Credita 2.000 Egili al wallet. Consente circa 28 query tipiche al sistema documentale AI.',
                'feature_category'    => 'natan_loc',
                'cost_fiat_eur'       => null,
                'cost_egili'          => 0,
                'is_free'             => false,
                'free_monthly_limit'  => 0,
                'is_bundle'           => true,
                'bundle_type'         => 'credit_package',
                'discount_percentage' => 0,
                'is_recurring'        => false,
                'recurrence_period'   => 'one_time',
                'expires'             => false,
                'stackable'           => true,
                'is_active'           => false,
                'is_featured'         => true,   // Scelta consigliata
                'display_order'       => 110,
                'feature_parameters'  => json_encode([
                    'egili_amount'    => 2500,
                    'egili_credited'  => 2000,   // 2500 × 0.80
                    'token_unit'      => 'Token AI',
                    'approx_queries'  => 28,     // 2000 ÷ 70
                    'platform'        => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    '2.500 Token AI — 2.000 Egili accreditati al wallet',
                    'Utilizzo su tutte le funzioni AI di NATAN',
                    'Pagamento sicuro Stripe',
                    'Token non scadono',
                    'Scelta più popolare',
                ]),
                'metadata' => json_encode([
                    'created_by' => 'NatanLocQueryPackagesSeeder',
                    'version'    => '2.0.0',
                ]),
            ],
            [
                'feature_code'        => 'natan_loc_token_6250',
                'feature_name'        => 'NATAN Token 6.250',
                'feature_description' => 'Pacchetto 6.250 Token AI per NATAN LOC — uso intensivo. Credita 5.000 Egili al wallet. Consente circa 71 query tipiche al sistema documentale AI.',
                'feature_category'    => 'natan_loc',
                'cost_fiat_eur'       => null,
                'cost_egili'          => 0,
                'is_free'             => false,
                'free_monthly_limit'  => 0,
                'is_bundle'           => true,
                'bundle_type'         => 'credit_package',
                'discount_percentage' => 0,
                'is_recurring'        => false,
                'recurrence_period'   => 'one_time',
                'expires'             => false,
                'stackable'           => true,
                'is_active'           => false,
                'is_featured'         => false,
                'display_order'       => 120,
                'feature_parameters'  => json_encode([
                    'egili_amount'    => 6250,
                    'egili_credited'  => 5000,   // 6250 × 0.80
                    'token_unit'      => 'Token AI',
                    'approx_queries'  => 71,     // 5000 ÷ 70
                    'platform'        => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    '6.250 Token AI — 5.000 Egili accreditati al wallet',
                    'Utilizzo su tutte le funzioni AI di NATAN',
                    'Pagamento sicuro Stripe',
                    'Token non scadono',
                    'Ideale per team e uffici',
                ]),
                'metadata' => json_encode([
                    'created_by' => 'NatanLocQueryPackagesSeeder',
                    'version'    => '2.0.0',
                ]),
            ],
            [
                'feature_code'        => 'natan_loc_token_12500',
                'feature_name'        => 'NATAN Token 12.500',
                'feature_description' => 'Pacchetto 12.500 Token AI per NATAN LOC — uso enterprise. Credita 10.000 Egili al wallet. Consente circa 142 query tipiche al sistema documentale AI.',
                'feature_category'    => 'natan_loc',
                'cost_fiat_eur'       => null,
                'cost_egili'          => 0,
                'is_free'             => false,
                'free_monthly_limit'  => 0,
                'is_bundle'           => true,
                'bundle_type'         => 'credit_package',
                'discount_percentage' => 0,
                'is_recurring'        => false,
                'recurrence_period'   => 'one_time',
                'expires'             => false,
                'stackable'           => true,
                'is_active'           => false,
                'is_featured'         => false,
                'display_order'       => 130,
                'feature_parameters'  => json_encode([
                    'egili_amount'    => 12500,
                    'egili_credited'  => 10000,  // 12500 × 0.80
                    'token_unit'      => 'Token AI',
                    'approx_queries'  => 142,    // 10000 ÷ 70
                    'platform'        => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    '12.500 Token AI — 10.000 Egili accreditati al wallet',
                    'Utilizzo su tutte le funzioni AI di NATAN',
                    'Pagamento sicuro Stripe',
                    'Token non scadono',
                    'Per Pubbliche Amministrazioni e grandi team',
                    'Priorità supporto',
                ]),
                'metadata' => json_encode([
                    'created_by' => 'NatanLocQueryPackagesSeeder',
                    'version'    => '2.0.0',
                ]),
            ],
        ];

        foreach ($packages as $package) {
            DB::table('ai_feature_pricing')->updateOrInsert(
                ['feature_code' => $package['feature_code']],
                array_merge($package, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        $this->command->info('✓ NatanLoc query packages seeded v2.0.0 (4 packages, is_active=false)');
        $this->command->info('  Token AI → Egili: ×0.80 (egili_credit_ratio da PlatformSetting)');
        $this->command->warn('  ⚠️  Imposta i prezzi (cost_fiat_eur) e attiva (is_active=true) via EGI-HUB Superadmin');
    }
}
