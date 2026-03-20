<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * @package Database\Seeders
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (FlorenceEGI - NATAN LOC Query Packages)
 * @date 2026-03-20
 * @purpose Inserisce i pacchetti Token AI per NATAN_LOC nella tabella ai_feature_pricing.
 *          Ogni pacchetto è venduto in "Token AI" (MiCA-safe) e credita Egili al wallet.
 *          PREZZI non impostati — is_active=false — attivare via EGI-HUB Superadmin dopo pricing.
 *
 *          Proporzioni verificate:
 *          TOKENS_PER_EGILI = 800 (FeatureConsumptionService)
 *          Query media NATAN ≈ 50-70k tokens → 63-87 Egili per query → ~€0.65-0.87
 *          1 Token AI (user-facing) = 1 Egilo = 800 actual AI tokens capacity
 */
class NatanLocQueryPackagesSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'feature_code'        => 'natan_loc_token_800',
                'feature_name'        => 'NATAN Token 800',
                'feature_description' => 'Pacchetto 800 Token AI per NATAN LOC — ideale per uso occasionale. Consente circa 10-12 query tipiche al sistema documentale AI.',
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
                'stackable'           => true,   // I Token si sommano al saldo esistente
                'is_active'           => false,  // ⚠️ Attivare SOLO dopo aver impostato il prezzo
                'is_featured'         => false,
                'display_order'       => 100,
                'feature_parameters'  => json_encode([
                    'egili_amount'    => 800,    // Egili creditati al wallet
                    'token_unit'      => 'Token AI',
                    'approx_queries'  => 11,     // 800 / 70 Egili/query ≈ 11
                    'platform'        => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    '800 Token AI accreditati istantaneamente',
                    'Utilizzo su tutte le funzioni AI di NATAN',
                    'Pagamento sicuro Stripe',
                    'Token non scadono',
                ]),
                'metadata' => json_encode([
                    'created_by' => 'NatanLocQueryPackagesSeeder',
                    'version'    => '1.0.0',
                ]),
            ],
            [
                'feature_code'        => 'natan_loc_token_2000',
                'feature_name'        => 'NATAN Token 2.000',
                'feature_description' => 'Pacchetto 2.000 Token AI per NATAN LOC — uso regolare. Consente circa 28 query tipiche al sistema documentale AI.',
                'feature_category'    => 'natan_loc',
                'cost_fiat_eur'       => null,
                'cost_egili'          => 0,
                'is_free'             => false,
                'free_monthly_limit'  => 0,
                'is_bundle'           => true,
                'bundle_type'         => 'credit_package',
                'discount_percentage' => 0,      // ⚠️ Eventuale sconto bulk da impostare
                'is_recurring'        => false,
                'recurrence_period'   => 'one_time',
                'expires'             => false,
                'stackable'           => true,
                'is_active'           => false,
                'is_featured'         => true,   // Evidenziato come scelta consigliata
                'display_order'       => 110,
                'feature_parameters'  => json_encode([
                    'egili_amount'    => 2000,
                    'token_unit'      => 'Token AI',
                    'approx_queries'  => 28,
                    'platform'        => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    '2.000 Token AI accreditati istantaneamente',
                    'Utilizzo su tutte le funzioni AI di NATAN',
                    'Pagamento sicuro Stripe',
                    'Token non scadono',
                    'Scelta più popolare',
                ]),
                'metadata' => json_encode([
                    'created_by' => 'NatanLocQueryPackagesSeeder',
                    'version'    => '1.0.0',
                ]),
            ],
            [
                'feature_code'        => 'natan_loc_token_5000',
                'feature_name'        => 'NATAN Token 5.000',
                'feature_description' => 'Pacchetto 5.000 Token AI per NATAN LOC — uso intensivo. Consente circa 71 query tipiche al sistema documentale AI.',
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
                    'egili_amount'    => 5000,
                    'token_unit'      => 'Token AI',
                    'approx_queries'  => 71,
                    'platform'        => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    '5.000 Token AI accreditati istantaneamente',
                    'Utilizzo su tutte le funzioni AI di NATAN',
                    'Pagamento sicuro Stripe',
                    'Token non scadono',
                    'Ideale per team e uffici',
                ]),
                'metadata' => json_encode([
                    'created_by' => 'NatanLocQueryPackagesSeeder',
                    'version'    => '1.0.0',
                ]),
            ],
            [
                'feature_code'        => 'natan_loc_token_10000',
                'feature_name'        => 'NATAN Token 10.000',
                'feature_description' => 'Pacchetto 10.000 Token AI per NATAN LOC — uso enterprise. Consente circa 142 query tipiche al sistema documentale AI.',
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
                    'egili_amount'    => 10000,
                    'token_unit'      => 'Token AI',
                    'approx_queries'  => 142,
                    'platform'        => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    '10.000 Token AI accreditati istantaneamente',
                    'Utilizzo su tutte le funzioni AI di NATAN',
                    'Pagamento sicuro Stripe',
                    'Token non scadono',
                    'Per Pubbliche Amministrazioni e grandi team',
                    'Priorità supporto',
                ]),
                'metadata' => json_encode([
                    'created_by' => 'NatanLocQueryPackagesSeeder',
                    'version'    => '1.0.0',
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

        $this->command->info('✓ NatanLoc query packages seeded (4 packages, is_active=false)');
        $this->command->warn('  ⚠️  Imposta i prezzi (cost_fiat_eur) e attiva (is_active=true) via EGI-HUB Superadmin');
    }
}
