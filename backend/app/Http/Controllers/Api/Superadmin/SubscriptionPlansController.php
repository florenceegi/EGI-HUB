<?php

declare(strict_types=1);

/**
 * @package App\Http\Controllers\Api\Superadmin
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - BILLING FASE 3.4)
 * @date 2026-02-25
 * @purpose CRUD piani di abbonamento e gestione sottoscrizioni tenant
 */

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubscriptionPlansController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // PIANI
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /superadmin/billing/plans
     * Lista piani — filtri: project_id, is_active
     */
    public function index(Request $request): JsonResponse
    {
        $query = SubscriptionPlan::withCount('activeSubscriptions')
            ->with('project:id,name,slug');

        if ($request->filled('project_id')) {
            $query->forProject((int) $request->project_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $plans = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data'    => $plans,
            'total'   => $plans->count(),
        ]);
    }

    /**
     * GET /superadmin/billing/plans/{id}
     */
    public function show(int $id): JsonResponse
    {
        $plan = SubscriptionPlan::withCount('activeSubscriptions')
            ->with('project:id,name,slug')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $plan,
        ]);
    }

    /**
     * POST /superadmin/billing/plans
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id'           => ['required', 'integer', 'exists:system_projects,id'],
            'name'                 => ['required', 'string', 'max:100'],
            'slug'                 => [
                'required', 'string', 'max:100', 'regex:/^[a-z0-9\-]+$/',
                Rule::unique('subscription_plans')->where('project_id', $request->project_id),
            ],
            'description'          => ['nullable', 'string'],
            'price_monthly_eur'    => ['required', 'numeric', 'min:0'],
            'price_annual_eur'     => ['required', 'numeric', 'min:0'],
            'max_users'            => ['required', 'integer', 'min:0'],
            'max_documents'        => ['required', 'integer', 'min:0'],
            'max_queries_monthly'  => ['required', 'integer', 'min:0'],
            'features'             => ['nullable', 'array'],
            'is_active'            => ['boolean'],
            'display_order'        => ['integer', 'min:0'],
        ]);

        $plan = SubscriptionPlan::create($validated);

        return response()->json([
            'success' => true,
            'data'    => $plan,
            'message' => 'Piano creato con successo.',
        ], 201);
    }

    /**
     * PUT /superadmin/billing/plans/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $plan = SubscriptionPlan::findOrFail($id);

        $validated = $request->validate([
            'name'                 => ['sometimes', 'string', 'max:100'],
            'slug'                 => [
                'sometimes', 'string', 'max:100', 'regex:/^[a-z0-9\-]+$/',
                Rule::unique('subscription_plans')
                    ->where('project_id', $plan->project_id)
                    ->ignore($plan->id),
            ],
            'description'          => ['nullable', 'string'],
            'price_monthly_eur'    => ['sometimes', 'numeric', 'min:0'],
            'price_annual_eur'     => ['sometimes', 'numeric', 'min:0'],
            'max_users'            => ['sometimes', 'integer', 'min:0'],
            'max_documents'        => ['sometimes', 'integer', 'min:0'],
            'max_queries_monthly'  => ['sometimes', 'integer', 'min:0'],
            'features'             => ['nullable', 'array'],
            'is_active'            => ['boolean'],
            'display_order'        => ['integer', 'min:0'],
        ]);

        $plan->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $plan->fresh(),
            'message' => 'Piano aggiornato con successo.',
        ]);
    }

    /**
     * DELETE /superadmin/billing/plans/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $plan = SubscriptionPlan::findOrFail($id);

        // Blocca se ci sono abbonamenti attivi
        $activeCount = $plan->activeSubscriptions()->count();
        if ($activeCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Impossibile eliminare: {$activeCount} abbonamenti attivi su questo piano.",
            ], 422);
        }

        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Piano eliminato (soft delete).',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SOTTOSCRIZIONI TENANT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /superadmin/billing/subscriptions
     * Lista tutte le sottoscrizioni — filtri: plan_id, project_id, status, tenant_id
     */
    public function subscriptions(Request $request): JsonResponse
    {
        $query = TenantSubscription::with([
            'tenant:id,name,slug,project_id',
            'plan:id,name,slug,project_id,price_monthly_eur',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('tenant_id')) {
            $query->forTenant((int) $request->tenant_id);
        }

        if ($request->filled('plan_id')) {
            $query->where('plan_id', (int) $request->plan_id);
        }

        if ($request->filled('project_id')) {
            $query->forProject((int) $request->project_id);
        }

        $subs = $query->orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'data'    => $subs,
            'total'   => $subs->count(),
        ]);
    }

    /**
     * POST /superadmin/billing/subscriptions
     * Assegna un piano a un tenant (crea o aggiorna)
     */
    public function storeSubscription(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id'              => ['required', 'integer', 'exists:tenants,id'],
            'plan_id'                => ['required', 'integer', 'exists:subscription_plans,id'],
            'status'                 => ['required', Rule::in(['active', 'trial', 'suspended', 'cancelled'])],
            'starts_at'              => ['nullable', 'date'],
            'ends_at'                => ['nullable', 'date', 'after_or_equal:starts_at'],
            'trial_ends_at'          => ['nullable', 'date'],
            'price_paid_eur'         => ['nullable', 'numeric', 'min:0'],
            'billing_cycle'          => ['required', Rule::in(['monthly', 'annual', 'custom'])],
            'stripe_subscription_id' => ['nullable', 'string', 'max:255'],
            'paypal_subscription_id' => ['nullable', 'string', 'max:255'],
        ]);

        $sub = TenantSubscription::updateOrCreate(
            ['tenant_id' => $validated['tenant_id'], 'plan_id' => $validated['plan_id']],
            $validated
        );

        return response()->json([
            'success' => true,
            'data'    => $sub->fresh(['tenant:id,name,slug', 'plan:id,name,slug']),
            'message' => 'Sottoscrizione salvata.',
        ], 201);
    }

    /**
     * PUT /superadmin/billing/subscriptions/{id}
     */
    public function updateSubscription(Request $request, int $id): JsonResponse
    {
        $sub = TenantSubscription::findOrFail($id);

        $validated = $request->validate([
            'status'                 => ['sometimes', Rule::in(['active', 'trial', 'suspended', 'cancelled'])],
            'starts_at'              => ['nullable', 'date'],
            'ends_at'                => ['nullable', 'date'],
            'trial_ends_at'          => ['nullable', 'date'],
            'price_paid_eur'         => ['nullable', 'numeric', 'min:0'],
            'billing_cycle'          => ['sometimes', Rule::in(['monthly', 'annual', 'custom'])],
            'stripe_subscription_id' => ['nullable', 'string', 'max:255'],
            'paypal_subscription_id' => ['nullable', 'string', 'max:255'],
        ]);

        $sub->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $sub->fresh(['tenant:id,name,slug', 'plan:id,name,slug']),
            'message' => 'Sottoscrizione aggiornata.',
        ]);
    }

    /**
     * DELETE /superadmin/billing/subscriptions/{id}
     */
    public function destroySubscription(int $id): JsonResponse
    {
        $sub = TenantSubscription::findOrFail($id);
        $sub->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sottoscrizione eliminata.',
        ]);
    }
}
