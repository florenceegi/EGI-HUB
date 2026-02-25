<?php

declare(strict_types=1);

/**
 * @package App\Http\Controllers\Api\Superadmin
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - BILLING FASE 5.1)
 * @date 2026-02-25
 * @purpose Aggregazione dati revenue: ordini e fatture per periodo e tipologia
 */

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RevenueAggregationController extends Controller
{
    /**
     * GET /superadmin/analytics/revenue
     *
     * @param months int Quanti mesi indietro (default 12)
     * @param group  string monthly|yearly (default monthly)
     */
    public function index(Request $request): JsonResponse
    {
        $months = (int) $request->input('months', 12);
        $group  = $request->input('group', 'monthly');
        $months = max(1, min(60, $months)); // clamp 1-60

        $truncUnit = $group === 'yearly' ? 'year' : 'month';
        $since     = now()->subMonths($months)->startOfDay();

        // ─── Ordini per periodo ───
        $ordersByPeriod = DB::table('orders')
            ->select([
                DB::raw("DATE_TRUNC('{$truncUnit}', created_at) AS period"),
                DB::raw('COUNT(*) AS total_orders'),
                DB::raw('SUM(CASE WHEN status IN (\'completed\',\'minted\') THEN COALESCE(amount_eur, amount_cents::numeric / 100) ELSE 0 END) AS revenue_eur'),
                DB::raw('COUNT(CASE WHEN status IN (\'completed\',\'minted\') THEN 1 END) AS completed_count'),
            ])
            ->where('created_at', '>=', $since)
            ->groupByRaw("DATE_TRUNC('{$truncUnit}', created_at)")
            ->orderByRaw("DATE_TRUNC('{$truncUnit}', created_at) ASC")
            ->get()
            ->map(fn ($r) => [
                'period'          => substr((string) $r->period, 0, 7),
                'total_orders'    => (int) $r->total_orders,
                'revenue_eur'     => round((float) $r->revenue_eur, 2),
                'completed_count' => (int) $r->completed_count,
            ]);

        // ─── Ordini per tipologia di pagamento ───
        $ordersByPaymentType = DB::table('orders')
            ->select([
                DB::raw('COALESCE(payment_type, \'unknown\') AS payment_type'),
                DB::raw('COUNT(*) AS count'),
                DB::raw('SUM(CASE WHEN status IN (\'completed\',\'minted\') THEN COALESCE(amount_eur, amount_cents::numeric / 100) ELSE 0 END) AS revenue_eur'),
            ])
            ->where('created_at', '>=', $since)
            ->groupBy('payment_type')
            ->orderByRaw('SUM(COALESCE(amount_eur, amount_cents::numeric / 100)) DESC')
            ->get()
            ->map(fn ($r) => [
                'payment_type' => $r->payment_type,
                'count'        => (int) $r->count,
                'revenue_eur'  => round((float) $r->revenue_eur, 2),
            ]);

        // ─── Ordini per stato ───
        $ordersByStatus = DB::table('orders')
            ->select([
                'status',
                DB::raw('COUNT(*) AS count'),
                DB::raw('SUM(COALESCE(amount_eur, amount_cents::numeric / 100)) AS total_eur'),
            ])
            ->where('created_at', '>=', $since)
            ->groupBy('status')
            ->orderByRaw('COUNT(*) DESC')
            ->get()
            ->map(fn ($r) => [
                'status'    => $r->status,
                'count'     => (int) $r->count,
                'total_eur' => round((float) $r->total_eur, 2),
            ]);

        // ─── Fatture per periodo ───
        $invoicesByPeriod = DB::table('invoices')
            ->select([
                DB::raw("DATE_TRUNC('{$truncUnit}', created_at) AS period"),
                DB::raw('COUNT(*) AS total_invoices'),
                DB::raw('SUM(CASE WHEN invoice_status = \'paid\' THEN COALESCE(total_eur, 0) ELSE 0 END) AS paid_eur'),
                DB::raw('COUNT(CASE WHEN invoice_status = \'paid\' THEN 1 END) AS paid_count'),
            ])
            ->where('created_at', '>=', $since)
            ->groupByRaw("DATE_TRUNC('{$truncUnit}', created_at)")
            ->orderByRaw("DATE_TRUNC('{$truncUnit}', created_at) ASC")
            ->get()
            ->map(fn ($r) => [
                'period'         => substr((string) $r->period, 0, 7),
                'total_invoices' => (int) $r->total_invoices,
                'paid_eur'       => round((float) $r->paid_eur, 2),
                'paid_count'     => (int) $r->paid_count,
            ]);

        // ─── Summary totali ───
        $orderSummary = DB::table('orders')
            ->where('created_at', '>=', $since)
            ->selectRaw('
                COUNT(*) AS total_orders,
                COUNT(CASE WHEN status IN (\'completed\',\'minted\') THEN 1 END) AS completed_orders,
                SUM(CASE WHEN status IN (\'completed\',\'minted\') THEN COALESCE(amount_eur, amount_cents::numeric / 100) ELSE 0 END) AS total_revenue_eur,
                AVG(CASE WHEN status IN (\'completed\',\'minted\') THEN COALESCE(amount_eur, amount_cents::numeric / 100) END) AS avg_order_eur
            ')
            ->first();

        $invoiceSummary = DB::table('invoices')
            ->where('created_at', '>=', $since)
            ->selectRaw('
                COUNT(*) AS total_invoices,
                COUNT(CASE WHEN invoice_status = \'paid\' THEN 1 END) AS paid_invoices,
                SUM(CASE WHEN invoice_status = \'paid\' THEN COALESCE(total_eur, 0) ELSE 0 END) AS total_invoiced_eur
            ')
            ->first();

        return response()->json([
            'success' => true,
            'data'    => [
                'period'        => ['months' => $months, 'group' => $group, 'since' => $since->toDateString()],
                'orders'        => [
                    'summary'       => [
                        'total_orders'    => (int) ($orderSummary->total_orders ?? 0),
                        'completed_orders'=> (int) ($orderSummary->completed_orders ?? 0),
                        'total_revenue_eur' => round((float) ($orderSummary->total_revenue_eur ?? 0), 2),
                        'avg_order_eur'   => round((float) ($orderSummary->avg_order_eur ?? 0), 2),
                    ],
                    'by_period'     => $ordersByPeriod,
                    'by_payment_type' => $ordersByPaymentType,
                    'by_status'     => $ordersByStatus,
                ],
                'invoices'      => [
                    'summary'   => [
                        'total_invoices'  => (int) ($invoiceSummary->total_invoices ?? 0),
                        'paid_invoices'   => (int) ($invoiceSummary->paid_invoices ?? 0),
                        'total_invoiced_eur' => round((float) ($invoiceSummary->total_invoiced_eur ?? 0), 2),
                    ],
                    'by_period' => $invoicesByPeriod,
                ],
            ],
        ]);
    }
}
