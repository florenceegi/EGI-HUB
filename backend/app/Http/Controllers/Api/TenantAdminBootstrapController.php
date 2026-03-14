<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TenantAdminBootstrap\ResendInvitationRequest;
use App\Http\Requests\TenantAdminBootstrap\StoreTenantAdminBootstrapRequest;
use App\Models\TenantAdminBootstrap;
use App\Services\TenantAdminBootstrapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Ultra\ErrorManager\Interfaces\ErrorManagerInterface;
use Ultra\UltraLogManager\UltraLogManager;

/**
 * @package App\Http\Controllers\Api
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - TenantAdminBootstrap)
 * @date 2026-03-13
 * @purpose Gestione CRUD e azioni sui Tenant Admin Bootstrap — accessibile solo a SuperAdmin
 */
class TenantAdminBootstrapController extends Controller
{
    public function __construct(
        private readonly TenantAdminBootstrapService $bootstrapService,
        private readonly UltraLogManager $logger,
        private readonly ErrorManagerInterface $errorManager
    ) {}

    /**
     * Lista i bootstrap con filtri opzionali.
     * GET /api/admin/bootstraps
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = TenantAdminBootstrap::with(['project', 'tenant', 'user', 'createdBy']);

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            if ($request->filled('system_project_id')) {
                $query->forProject((int) $request->input('system_project_id'));
            }

            if ($request->filled('tenant_id')) {
                $query->forTenant((int) $request->input('tenant_id'));
            }

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('email_snapshot', 'like', "%{$search}%")
                      ->orWhere('first_name_snapshot', 'like', "%{$search}%")
                      ->orWhere('last_name_snapshot', 'like', "%{$search}%");
                });
            }

            $query->orderBy('created_at', 'desc');

            $bootstraps = $request->has('per_page')
                ? $query->paginate($request->integer('per_page', 15))
                : $query->get();

            return response()->json([
                'success' => true,
                'data'    => $bootstraps,
            ]);
        } catch (\Exception $e) {
            return $this->errorManager->handle('BOOTSTRAP_LIST_ERROR', [
                'action'       => 'bootstrap_index',
                'log_category' => 'BOOTSTRAP_LIST_ERROR',
            ], $e);
        }
    }

    /**
     * Dettaglio di un singolo bootstrap.
     * GET /api/admin/bootstraps/{bootstrap}
     */
    public function show(TenantAdminBootstrap $bootstrap): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $bootstrap->load(['project', 'tenant', 'user', 'createdBy', 'updatedBy', 'revokedBy']),
        ]);
    }

    /**
     * Crea un nuovo bootstrap (e opzionalmente il tenant).
     * POST /api/admin/bootstraps
     */
    public function store(StoreTenantAdminBootstrapRequest $request): JsonResponse
    {
        try {
            $bootstrap = $this->bootstrapService->createBootstrap(
                $request->validated(),
                $request->user()
            );

            // Invia subito l'invito email dopo la creazione
            $this->bootstrapService->sendInvitation($bootstrap);

            return response()->json([
                'success' => true,
                'message' => 'Bootstrap creato e invito inviato.',
                'data'    => $bootstrap->load(['project', 'tenant', 'user']),
            ], 201);
        } catch (\Exception $e) {
            return $this->errorManager->handle('BOOTSTRAP_CREATE_ERROR', [
                'action'       => 'bootstrap_store',
                'log_category' => 'BOOTSTRAP_CREATE_ERROR',
            ], $e);
        }
    }

    /**
     * Reinvia l'email di invito.
     * POST /api/admin/bootstraps/{bootstrap}/resend
     */
    public function resend(TenantAdminBootstrap $bootstrap, ResendInvitationRequest $request): JsonResponse
    {
        try {
            $this->bootstrapService->resendInvitation($bootstrap);

            return response()->json([
                'success' => true,
                'message' => 'Invito reinviato.',
                'data'    => $bootstrap->fresh(),
            ]);
        } catch (\LogicException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return $this->errorManager->handle('BOOTSTRAP_RESEND_ERROR', [
                'bootstrap_id' => $bootstrap->id,
                'log_category' => 'BOOTSTRAP_RESEND_ERROR',
            ], $e);
        }
    }

    /**
     * Sospende un bootstrap attivo.
     * POST /api/admin/bootstraps/{bootstrap}/suspend
     */
    public function suspend(TenantAdminBootstrap $bootstrap): JsonResponse
    {
        try {
            $this->bootstrapService->suspendBootstrap($bootstrap, request()->user());

            return response()->json([
                'success' => true,
                'message' => 'Bootstrap sospeso.',
                'data'    => $bootstrap->fresh(),
            ]);
        } catch (\LogicException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return $this->errorManager->handle('BOOTSTRAP_SUSPEND_ERROR', [
                'bootstrap_id' => $bootstrap->id,
                'log_category' => 'BOOTSTRAP_SUSPEND_ERROR',
            ], $e);
        }
    }

    /**
     * Revoca definitivamente un bootstrap.
     * POST /api/admin/bootstraps/{bootstrap}/revoke
     */
    public function revoke(TenantAdminBootstrap $bootstrap): JsonResponse
    {
        try {
            $this->bootstrapService->revokeBootstrap($bootstrap, request()->user());

            return response()->json([
                'success' => true,
                'message' => 'Bootstrap revocato.',
                'data'    => $bootstrap->fresh(),
            ]);
        } catch (\LogicException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return $this->errorManager->handle('BOOTSTRAP_REVOKE_ERROR', [
                'bootstrap_id' => $bootstrap->id,
                'log_category' => 'BOOTSTRAP_REVOKE_ERROR',
            ], $e);
        }
    }
}
