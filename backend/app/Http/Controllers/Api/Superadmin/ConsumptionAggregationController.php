<?php

declare(strict_types=1);

/**
 * @package App\Http\Controllers\Api\Superadmin
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - BILLING FASE 5.2)
 * @date 2026-02-25
 * @purpose Aggregazione consumo feature: ledger utilizzo e transazioni AI credits
 */

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsumptionAggregationController extends Controller
{
    /**
     * GET /superadmin/analytics/consumption
     *
     * @param months int Quanti mesi indietro (default 12)
     * @param group  string monthly|yearly (default monthly)
     */
    public function index(Request $request): JsonResponse
    {
        $months = (int) $request->input('months', 12);
        $group  = $request->input('group', 'monthly');
        $months = max(1, min(60, $months));

        $truncUnit = $group === 'yearly' ? 'year' : 'month';
        $since     = now()->subMonths($months)->startOfDay();

        // ─── Feature Consumption Ledger: per feature_code ───
        $byFeature = DB::table('feature_consumption_ledger')
            ->select([
                'feature_code',
                DB::raw('COUNT(*) AS events'),
                DB::raw('SUM(units_consumed) AS total_units'),
                DB::raw('SUM(total_cost_egili) AS total_cost_egili'),
                DB::raw('COUNT(DISTINCT user_id) AS unique_users'),
                DB::raw('MAX(consumed_at) AS last_used_at'),
            ])
            ->where('consumed_at', '>=', $since)
            ->groupBy('feature_code')
            ->orderByRaw('SUM(total_cost_egili) DESC')
            ->limit(20)
            ->get()
            ->map(fn ($r) => [
                'feature_code'     => $r->feature_code,
                'events'          => (int) $r->events,
                'total_units'     => (float) $r->total_units,
                'total_cost_egili'=> round((float) $r->total_cost_egili, 4),
                'unique_users'    => (int) $r->unique_users,
                'last_used_at'    => $r->last_used_at,
            ]);

        // ─── Feature Consumption Ledger: per periodo ───
        $consumptionByPeriod = DB::table('feature_consumption_ledger')
            ->select([
                DB::raw("DATE_TRUNC('{$truncUnit}', consumed_at) AS period"),
                DB::raw('COUNT(*) AS events'),
                DB::raw('SUM(units_consumed) AS total_units'),
                DB::raw('SUM(total_cost_egili) AS total_cost_egili'),
            ])
            ->where('consumed_at', '>=', $since)
            ->groupByRaw("DATE_TRUNC('{$truncUnit}', consumed_at)")
            ->orderByRaw("DATE_TRUNC('{$truncUnit}', consumed_at) ASC")
            ->get()
            ->map(fn ($r) => [
                'period'           => substr((string) $r->period, 0, 7),
                'events'           => (int) $r->events,
                'total_units'      => (float) $r->total_units,
                'total_cost_egili' => round((float) $r->total_cost_egili, 4),
            ]);

        // ─── Feature Consumption Ledger: summary ───
        $consumptionSummary = DB::table('feature_consumption_ledger')
            ->where('consumed_at', '>=', $since)
            ->selectRaw('
                COUNT(*) AS total_events,
                COUNT(DISTINCT user_id) AS unique_users,
                SUM(units_consumed) AS total_units,
                SUM(total_cost_egili) AS total_cost_egili,
                COUNT(DISTINCT feature_code) AS distinct_features
            ')
            ->first();

        // ─── AI Credits Transactions: per transaction_type ───
        $aiByType = DB::table('ai_credits_transactions')
            ->select([
                'transaction_type',
                DB::raw('COUNT(*) AS count'),
                DB::raw('SUM(amount) AS total_amount'),
                DB::raw('SUM(COALESCE(tokens_consumed, 0)) AS total_tokens'),
            ])
            ->where('created_at', '>=', $since)
            ->where('status', 'completed')
            ->groupBy('transaction_type')
            ->orderByRaw('COUNT(*) DESC')
            ->get()
            ->map(fn ($r) => [
                'transaction_type' => $r->transaction_type,
                'count'            => (int) $r->count,
                'total_amount'     => round((float) $r->total_amount, 4),
                'total_tokens'     => (int) $r->total_tokens,
            ]);

        // ─── AI Credits Transactions: per feature ───
        $aiByFeature = DB::table('ai_credits_transactions')
            ->select([
                DB::raw('COALESCE(feature_used, \'unknown\') AS feature_used'),
                DB::raw('COUNT(*) AS count'),
                DB::raw('SUM(ABS(amount)) AS total_amount'),
                DB::raw('SUM(COALESCE(tokens_consumed, 0)) AS total_tokens'),
            ])
            ->where('created_at', '>=', $since)
            ->where('status', 'completed')
            ->whereIn('transaction_type', ['debit', 'consumption', 'usage'])
            ->groupBy('feature_used')
            ->orderByRaw('SUM(ABS(amount)) DESC')
            ->limit(15)
            ->get()
            ->map(fn ($r) => [
                'feature_used' => $r->feature_used,
                'count'        => (int) $r->count,
                'total_amount' => round((float) $r->total_amount, 4),
                'total_tokens' => (int) $r->total_tokens,
            ]);

        // ─── AI Credits: summary ───
        $aiSummary = DB::table('ai_credits_transactions')
            ->where('created_at', '>=', $since)
            ->where('status', 'completed')
            ->selectRaw('
                COUNT(*) AS total_transactions,
                SUM(CASE WHEN transaction_type IN (\'top_up\',\'purchase\',\'grant\',\'bonus\') THEN amount ELSE 0 END) AS total_purchased,
                SUM(CASE WHEN transaction_type IN (\'debit\',\'consumption\',\'usage\') THEN ABS(amount) ELSE 0 END) AS total_consumed,
                SUM(CASE WHEN is_expired = true THEN ABS(amount) ELSE 0 END) AS total_expired,
                SUM(COALESCE(tokens_consumed, 0)) AS total_tokens
            ')
            ->first();

        return response()->json([
            'success' => true,
            'data'    => [
                'period' => ['months' => $months, 'group' => $group, 'since' => $since->toDateString()],
                'feature_consumption' => [
                    'summary'   => [
                        'total_events'      => (int) ($consumptionSummary->total_events ?? 0),
                        'unique_users'      => (int) ($consumptionSummary->unique_users ?? 0),
                        'total_units'       => (float) ($consumptionSummary->total_units ?? 0),
                        'total_cost_egili'  => round((float) ($consumptionSummary->total_cost_egili ?? 0), 4),
                        'distinct_features' => (int) ($consumptionSummary->distinct_features ?? 0),
                    ],
                    'by_feature' => $byFeature,
                    'by_period'  => $consumptionByPeriod,
                ],
                'ai_credits' => [
                    'summary'    => [
                        'total_transactions' => (int) ($aiSummary->total_transactions ?? 0),
                        'total_purchased'    => round((float) ($aiSummary->total_purchased ?? 0), 4),
                        'total_consumed'     => round((float) ($aiSummary->total_consumed ?? 0), 4),
                        'total_expired'      => round((float) ($aiSummary->total_expired ?? 0), 4),
                        'total_tokens'       => (int) ($aiSummary->total_tokens ?? 0),
                    ],
                    'by_type'    => $aiByType,
                    'by_feature' => $aiByFeature,
                ],
            ],
        ]);
    }
}
