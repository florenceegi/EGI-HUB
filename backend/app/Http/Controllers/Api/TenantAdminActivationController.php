<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TenantAdminBootstrap\ActivateTenantAdminRequest;
use App\Services\TenantAdminBootstrapService;
use Illuminate\Http\JsonResponse;
use Ultra\ErrorManager\Interfaces\ErrorManagerInterface;
use Ultra\UltraLogManager\UltraLogManager;

/**
 * @package App\Http\Controllers\Api
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - TenantAdminBootstrap)
 * @date 2026-03-13
 * @purpose Endpoint pubblico per l'attivazione dell'account Tenant Admin tramite token monouso
 */
class TenantAdminActivationController extends Controller
{
    public function __construct(
        private readonly TenantAdminBootstrapService $bootstrapService,
        private readonly UltraLogManager $logger,
        private readonly ErrorManagerInterface $errorManager
    ) {}

    /**
     * Restituisce le informazioni pubbliche del bootstrap identificato dal token.
     * Usato dal frontend per pre-compilare il form di attivazione.
     *
     * GET /api/activate/tenant-admin/{token}
     */
    public function show(string $token): JsonResponse
    {
        try {
            $tokenHash = hash('sha256', $token);

            $bootstrap = \App\Models\TenantAdminBootstrap::where('invitation_token_hash', $tokenHash)
                ->with(['tenant', 'project'])
                ->first();

            if ($bootstrap === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token non valido o già utilizzato.',
                ], 404);
            }

            if ($bootstrap->isExpired()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Il link di attivazione è scaduto. Contatta l\'amministratore per un nuovo invito.',
                    'expired' => true,
                ], 410);
            }

            if (! $bootstrap->isActivatable()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Questo invito non è più attivabile.',
                ], 422);
            }

            return response()->json([
                'success' => true,
                'data'    => [
                    'first_name'         => $bootstrap->first_name_snapshot,
                    'last_name'          => $bootstrap->last_name_snapshot,
                    'email'              => $bootstrap->email_snapshot,
                    'tenant_name'        => $bootstrap->tenant->name ?? null,
                    'project_name'       => $bootstrap->project->name ?? null,
                    'contract_reference' => $bootstrap->contract_reference,
                    'expires_at'         => $bootstrap->invitation_expires_at?->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->errorManager->handle('ACTIVATION_SHOW_ERROR', [
                'action'       => 'activation_show',
                'log_category' => 'ACTIVATION_SHOW_ERROR',
            ], $e);
        }
    }

    /**
     * Completa l'attivazione: verifica il token, imposta la password e attiva l'account.
     *
     * POST /api/activate/tenant-admin/{token}
     */
    public function activate(string $token, ActivateTenantAdminRequest $request): JsonResponse
    {
        try {
            $bootstrap = $this->bootstrapService->activateBootstrap(
                $token,
                $request->validated('password')
            );

            return response()->json([
                'success' => true,
                'message' => 'Account attivato con successo. Puoi ora effettuare il login.',
                'data'    => [
                    'email'       => $bootstrap->email_snapshot,
                    'tenant_name' => $bootstrap->tenant->name ?? null,
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\LogicException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return $this->errorManager->handle('ACTIVATION_ERROR', [
                'action'       => 'activation_activate',
                'log_category' => 'ACTIVATION_ERROR',
            ], $e);
        }
    }
}
