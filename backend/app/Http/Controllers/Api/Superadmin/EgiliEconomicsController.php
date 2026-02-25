<?php

declare(strict_types=1);

/**
 * @package App\Http\Controllers\Api\Superadmin
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - BILLING FASE 5.3)
 * @date 2026-02-25
 * @purpose Aggregazione economia Egili: circolazione, top-up, conversioni, flussi
 */

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EgiliEconomicsController extends Controller
{
    /**
     * GET /superadmin/analytics/egili
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

        // ─── Circolazione: balance totale corrente (ultimo balance_after per wallet) ───
        $currentCirculation = DB::table('egili_transactions as et')
            ->join(DB::raw('(
                SELECT wallet_id, MAX(created_at) AS last_at
                FROM egili_transactions
                WHERE status = \'completed\'
                GROUP BY wallet_id
            ) AS latest'), function ($join) {
                $join->on('et.wallet_id', '=', 'latest.wallet_id')
                     ->on('et.created_at', '=', 'latest.last_at');
            })
            ->where('et.status', 'completed')
            ->selectRaw('COALESCE(SUM(et.balance_after), 0) AS total_circulation')
            ->value('total_circulation');

        // ─── Transazioni per tipo (periodo filtrato) ───
        $byType = DB::table('egili_transactions')
            ->select([
                'transaction_type',
                DB::raw('COUNT(*) AS count'),
                DB::raw('SUM(amount) AS total_amount'),
                DB::raw('COUNT(DISTINCT wallet_id) AS wallets_involved'),
            ])
            ->where('created_at', '>=', $since)
            ->where('status', 'completed')
            ->groupBy('transaction_type')
            ->orderByRaw('SUM(amount) DESC')
            ->get()
            ->map(fn ($r) => [
                'transaction_type'  => $r->transaction_type,
                'count'             => (int) $r->count,
                'total_amount'      => round((float) $r->total_amount, 4),
                'wallets_involved'  => (int) $r->wallets_involved,
            ]);

        // ─── Transazioni per categoria (periodo filtrato) ───
        $byCategory = DB::table('egili_transactions')
            ->select([
                DB::raw('COALESCE(category, \'uncategorized\') AS category'),
                DB::raw('COUNT(*) AS count'),
                DB::raw('SUM(amount) AS total_amount'),
            ])
            ->where('created_at', '>=', $since)
            ->where('status', 'completed')
            ->groupBy('category')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(15)
            ->get()
            ->map(fn ($r) => [
                'category'     => $r->category,
                'count'        => (int) $r->count,
                'total_amount' => round((float) $r->total_amount, 4),
            ]);

        // ─── Flussi per periodo ───
        $byPeriod = DB::table('egili_transactions')
            ->select([
                DB::raw("DATE_TRUNC('{$truncUnit}', created_at) AS period"),
                DB::raw('COUNT(*) AS total_transactions'),
                DB::raw('SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS total_in'),
                DB::raw('SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) AS total_out'),
                DB::raw('SUM(amount) AS net_flow'),
            ])
            ->where('created_at', '>=', $since)
            ->where('status', 'completed')
            ->groupByRaw("DATE_TRUNC('{$truncUnit}', created_at)")
            ->orderByRaw("DATE_TRUNC('{$truncUnit}', created_at) ASC")
            ->get()
            ->map(fn ($r) => [
                'period'             => substr((string) $r->period, 0, 7),
                'total_transactions' => (int) $r->total_transactions,
                'total_in'           => round((float) $r->total_in, 4),
                'total_out'          => round((float) $r->total_out, 4),
                'net_flow'           => round((float) $r->net_flow, 4),
            ]);

        // ─── Summary periodo ───
        $summary = DB::table('egili_transactions')
            ->where('created_at', '>=', $since)
            ->where('status', 'completed')
            ->selectRaw('
                COUNT(*) AS total_transactions,
                COUNT(DISTINCT wallet_id) AS active_wallets,
                SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS total_in,
                SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) AS total_out,
                SUM(amount) AS net_flow,
                SUM(CASE WHEN is_expired = true THEN ABS(amount) ELSE 0 END) AS total_expired,
                COUNT(CASE WHEN is_expired = true THEN 1 END) AS expired_count
            ')
            ->first();

        return response()->json([
            'success' => true,
            'data'    => [
                'period' => ['months' => $months, 'group' => $group, 'since' => $since->toDateString()],
                'circulation' => [
                    'current_total' => round((float) ($currentCirculation ?? 0), 4),
                ],
                'summary' => [
                    'total_transactions' => (int) ($summary->total_transactions ?? 0),
                    'active_wallets'     => (int) ($summary->active_wallets ?? 0),
                    'total_in'           => round((float) ($summary->total_in ?? 0), 4),
                    'total_out'          => round((float) ($summary->total_out ?? 0), 4),
                    'net_flow'           => round((float) ($summary->net_flow ?? 0), 4),
                    'total_expired'      => round((float) ($summary->total_expired ?? 0), 4),
                    'expired_count'      => (int) ($summary->expired_count ?? 0),
                ],
                'by_type'     => $byType,
                'by_category' => $byCategory,
                'by_period'   => $byPeriod,
            ],
        ]);
    }
}
