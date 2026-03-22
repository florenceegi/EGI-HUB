<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * @package Database\Seeders
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 3.0.0 (FlorenceEGI - NATAN LOC Query Packages)
 * @date 2026-03-21
 * @purpose Inserisce i pacchetti Token AI per NATAN_LOC (versione citizen) nella tabella ai_feature_pricing.
 *
 *          ECONOMIA EGILI — MECCANISMO MARGINE (v3.0.0):
 *
 *          Tasso deduzione: 0,0125 Egili per token consumato
 *          → tokens_per_egili = 1 / 0,0125 = 80
 *
 *          Il margine piattaforma è incorporato nel regalo (ratio 0,8):
 *          - Egili "pieni" per 1M token: 1.000.000 × 0,0125 = 12.500 Egili
 *          - Egili effettivamente regalati: 12.500 × 0,8 = 10.000 Egili
 *          - Token coperti dagli Egili: 10.000 / 0,0125 = 800.000 token
 *          - Token residui (margine): 200.000 = 20% di 1M → non consumati dall'API
 *
 *          Formula egili_gift = (ai_tokens_included × 0,0125) × 0,8
 *          Query stimate = floor(egili_gift / 296)   [296 = egili_per_query reale, media 5 campioni]
 *
 *          PREZZI non impostati — is_active=false — attivare via EGI-HUB Superadmin dopo pricing.
 *          Riferimento prezzo: costo API Claude puro × 1,15 buffer provider.
 *          Mini ~€4,44 | Standard ~€13,33 | Plus ~€33,33 | Maxi ~€66,65
 */
class NatanLocQueryPackagesSeeder extends Seeder
{
    public function run(): void
    {
        // Rimuovi tutti i record NATAN LOC precedenti (v1, v2)
        DB::table('ai_feature_pricing')->whereIn('feature_code', [
            'natan_loc_token_800',
            'natan_loc_token_2000',
            'natan_loc_token_5000',
            'natan_loc_token_10000',
            'natan_loc_token_1000',
            'natan_loc_token_2500',
            'natan_loc_token_6250',
            'natan_loc_token_12500',
        ])->delete();

        $packages = [
            [
                'feature_code'        => 'natan_loc_mini',
                'feature_name'        => 'NATAN Mini',
                'feature_description' => 'Pacchetto per uso occasionale. Circa 33 risposte AI ai tuoi documenti della Pubblica Amministrazione.',
                'feature_category'    => 'natan_loc',
                'ai_tokens_included'  => 1000000,    // 1M Token LLM — SSOT prodotto
                'egili_gift'          => 10000,      // 1M × 0,0125 × 0,8 = 10.000 Egili
                'cost_fiat_eur'       => null,        // ⚠️ DA IMPOSTARE via EGI-HUB Superadmin (~€4,44)
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
                'is_active'           => false,       // ⚠️ Attivare dopo aver impostato il prezzo
                'is_featured'         => false,
                'display_order'       => 100,
                'feature_parameters'  => json_encode([
                    'approx_queries' => 33,           // floor(10.000 / 296)
                    'token_unit'     => 'Token LLM',
                    'platform'       => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    'Circa 33 risposte AI ai documenti PA',
                    'Accesso immediato dopo l\'acquisto',
                    'Pagamento sicuro Stripe',
                    'Non scadono',
                ]),
                'metadata' => json_encode([
                    'created_by'       => 'NatanLocQueryPackagesSeeder',
                    'version'          => '3.0.0',
                    'egili_rate'       => 0.0125,
                    'egili_ratio'      => 0.8,
                    'tokens_per_egili' => 80,
                ]),
            ],
            [
                'feature_code'        => 'natan_loc_standard',
                'feature_name'        => 'NATAN Standard',
                'feature_description' => 'Pacchetto per uso regolare. Circa 101 risposte AI ai tuoi documenti della Pubblica Amministrazione.',
                'feature_category'    => 'natan_loc',
                'ai_tokens_included'  => 3000000,    // 3M Token LLM
                'egili_gift'          => 30000,      // 3M × 0,0125 × 0,8 = 30.000 Egili
                'cost_fiat_eur'       => null,        // ⚠️ DA IMPOSTARE (~€13,33)
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
                'is_featured'         => true,        // Scelta consigliata
                'display_order'       => 110,
                'feature_parameters'  => json_encode([
                    'approx_queries' => 101,          // floor(30.000 / 296)
                    'token_unit'     => 'Token LLM',
                    'platform'       => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    'Circa 101 risposte AI ai documenti PA',
                    'Accesso immediato dopo l\'acquisto',
                    'Pagamento sicuro Stripe',
                    'Non scadono',
                    'Scelta più popolare',
                ]),
                'metadata' => json_encode([
                    'created_by'       => 'NatanLocQueryPackagesSeeder',
                    'version'          => '3.0.0',
                    'egili_rate'       => 0.0125,
                    'egili_ratio'      => 0.8,
                    'tokens_per_egili' => 80,
                ]),
            ],
            [
                'feature_code'        => 'natan_loc_plus',
                'feature_name'        => 'NATAN Plus',
                'feature_description' => 'Pacchetto per uso frequente. Circa 253 risposte AI ai tuoi documenti della Pubblica Amministrazione.',
                'feature_category'    => 'natan_loc',
                'ai_tokens_included'  => 7500000,    // 7,5M Token LLM
                'egili_gift'          => 75000,      // 7,5M × 0,0125 × 0,8 = 75.000 Egili
                'cost_fiat_eur'       => null,        // ⚠️ DA IMPOSTARE (~€33,33)
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
                    'approx_queries' => 253,          // floor(75.000 / 296)
                    'token_unit'     => 'Token LLM',
                    'platform'       => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    'Circa 253 risposte AI ai documenti PA',
                    'Accesso immediato dopo l\'acquisto',
                    'Pagamento sicuro Stripe',
                    'Non scadono',
                    'Ideale per uso continuativo',
                ]),
                'metadata' => json_encode([
                    'created_by'       => 'NatanLocQueryPackagesSeeder',
                    'version'          => '3.0.0',
                    'egili_rate'       => 0.0125,
                    'egili_ratio'      => 0.8,
                    'tokens_per_egili' => 80,
                ]),
            ],
            [
                'feature_code'        => 'natan_loc_maxi',
                'feature_name'        => 'NATAN Maxi',
                'feature_description' => 'Pacchetto per uso intensivo. Circa 506 risposte AI ai tuoi documenti della Pubblica Amministrazione.',
                'feature_category'    => 'natan_loc',
                'ai_tokens_included'  => 15000000,   // 15M Token LLM
                'egili_gift'          => 150000,     // 15M × 0,0125 × 0,8 = 150.000 Egili
                'cost_fiat_eur'       => null,        // ⚠️ DA IMPOSTARE (~€66,65)
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
                    'approx_queries' => 506,          // floor(150.000 / 296)
                    'token_unit'     => 'Token LLM',
                    'platform'       => 'natan_loc',
                ]),
                'benefits' => json_encode([
                    'Circa 506 risposte AI ai documenti PA',
                    'Accesso immediato dopo l\'acquisto',
                    'Pagamento sicuro Stripe',
                    'Non scadono',
                    'Per uso intensivo e continuativo',
                ]),
                'metadata' => json_encode([
                    'created_by'       => 'NatanLocQueryPackagesSeeder',
                    'version'          => '3.0.0',
                    'egili_rate'       => 0.0125,
                    'egili_ratio'      => 0.8,
                    'tokens_per_egili' => 80,
                ]),
            ],
        ];

        foreach ($packages as $package) {
            $data = array_merge($package, [
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Upsert su feature_code (evita conflitti su ID sequence)
            $columns     = array_keys($data);
            $placeholders = implode(', ', array_fill(0, count($columns), '?'));
            $colList      = implode(', ', array_map(fn($c) => '"' . $c . '"', $columns));
            $updateCols   = implode(', ', array_map(
                fn($c) => '"' . $c . '" = EXCLUDED."' . $c . '"',
                array_filter($columns, fn($c) => $c !== 'feature_code' && $c !== 'created_at')
            ));

            DB::statement(
                "INSERT INTO ai_feature_pricing ({$colList}) VALUES ({$placeholders})
                 ON CONFLICT (feature_code) DO UPDATE SET {$updateCols}",
                array_values($data)
            );
        }

        $this->command->info('NatanLoc query packages seeded v3.0.0 (4 packages, is_active=false)');
        $this->command->info('  Nomi: Mini / Standard / Plus / Maxi');
        $this->command->info('  Token LLM: 1M / 3M / 7,5M / 15M');
        $this->command->info('  Egili gift: 10.000 / 30.000 / 75.000 / 150.000');
        $this->command->info('  Tasso deduzione: 0,0125 Egili/token (tokens_per_egili=80)');
        $this->command->info('  Margine: 20% token non consumati (ratio regalo 0,8)');
        $this->command->info('  Query stimate: ~33 / ~101 / ~253 / ~506');
        $this->command->warn('  Imposta i prezzi (cost_fiat_eur) e attiva (is_active=true) via EGI-HUB Superadmin');
        $this->command->warn('  Riferimento: Mini ~€4,44 | Standard ~€13,33 | Plus ~€33,33 | Maxi ~€66,65');
    }
}
