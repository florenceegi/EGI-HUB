<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\BootstrapStatus;
use App\Enums\UserStatus;
use App\Mail\TenantAdminInvitationMail;
use App\Models\ProjectAdmin;
use App\Models\Tenant;
use App\Models\TenantAdminBootstrap;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Ultra\UltraLogManager\UltraLogManager;
use Ultra\ErrorManager\Interfaces\ErrorManagerInterface;

/**
 * @package App\Services
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - TenantAdminBootstrap)
 * @date 2026-03-13
 * @purpose Orchestrazione del ciclo di vita completo del Tenant Admin Bootstrap
 */
class TenantAdminBootstrapService
{
    /** Ore di validità del token di invito. */
    private const INVITE_EXPIRY_HOURS = 72;

    public function __construct(
        private readonly UltraLogManager $logger,
        private readonly ErrorManagerInterface $errorManager
    ) {}

    // =========================================================================
    // CREAZIONE
    // =========================================================================

    /**
     * Crea un nuovo bootstrap record.
     * Se tenant_mode = create_new crea anche il tenant.
     * Crea l'utente placeholder in stato pending.
     *
     * @param array{
     *   system_project_id: int,
     *   tenant_mode: string,
     *   tenant_id?: int,
     *   tenant_name?: string,
     *   tenant_slug?: string,
     *   contract_reference: string,
     *   contract_date?: string,
     *   first_name: string,
     *   last_name: string,
     *   email: string,
     *   phone?: string,
     *   job_title?: string,
     *   notes?: string,
     * } $data
     */
    public function createBootstrap(array $data, User $createdBy): TenantAdminBootstrap
    {
        return DB::transaction(function () use ($data, $createdBy) {

            // Risolvi o crea il tenant
            $tenant = $this->resolveOrCreateTenant($data, $createdBy);

            // Crea utente placeholder in stato pending
            $user = User::create([
                'name'           => $data['first_name'] . ' ' . $data['last_name'],
                'email'          => $data['email'],
                'password'       => Hash::make(Str::random(32)), // password temporanea sicura
                'is_super_admin' => false,
                'status'         => UserStatus::Pending->value,
            ]);

            $this->logger->info('TenantAdminBootstrap: utente placeholder creato', [
                'user_id'   => $user->id,
                'email'     => $user->email,
                'tenant_id' => $tenant->id,
            ]);

            // Crea il record di bootstrap
            $bootstrap = TenantAdminBootstrap::create([
                'system_project_id'  => $data['system_project_id'],
                'tenant_id'          => $tenant->id,
                'user_id'            => $user->id,
                'contract_reference' => $data['contract_reference'],
                'contract_date'      => $data['contract_date'] ?? null,
                'first_name_snapshot' => $data['first_name'],
                'last_name_snapshot'  => $data['last_name'],
                'email_snapshot'      => $data['email'],
                'phone_snapshot'      => $data['phone'] ?? null,
                'job_title_snapshot'  => $data['job_title'] ?? null,
                'status'             => BootstrapStatus::Pending->value,
                'notes'              => $data['notes'] ?? null,
                'created_by'         => $createdBy->id,
            ]);

            $this->logger->info('TenantAdminBootstrap: bootstrap creato', [
                'bootstrap_id' => $bootstrap->id,
                'tenant_id'    => $tenant->id,
                'created_by'   => $createdBy->id,
            ]);

            return $bootstrap;
        });
    }

    // =========================================================================
    // INVITO
    // =========================================================================

    /**
     * Genera un token monouso, aggiorna il bootstrap a invited e spedisce l'email.
     */
    public function sendInvitation(TenantAdminBootstrap $bootstrap): void
    {
        if (! $bootstrap->status->canBeInvited()) {
            throw new \LogicException(
                'Bootstrap in stato ' . $bootstrap->status->value . ' non può ricevere un invito.'
            );
        }

        $token = $this->generateAndStoreToken($bootstrap);

        Mail::to($bootstrap->email_snapshot)
            ->send(new TenantAdminInvitationMail($bootstrap, $token));

        $this->logger->info('TenantAdminBootstrap: invito spedito', [
            'bootstrap_id' => $bootstrap->id,
            'email'        => $bootstrap->email_snapshot,
        ]);
    }

    /**
     * Invalida il token precedente, ne genera uno nuovo e reinvia l'email.
     */
    public function resendInvitation(TenantAdminBootstrap $bootstrap): void
    {
        if (! $bootstrap->canResendInvite()) {
            throw new \LogicException(
                'Bootstrap in stato ' . $bootstrap->status->value . ' non permette un reinvio.'
            );
        }

        $token = $this->generateAndStoreToken($bootstrap);

        Mail::to($bootstrap->email_snapshot)
            ->send(new TenantAdminInvitationMail($bootstrap, $token));

        $this->logger->info('TenantAdminBootstrap: reinvio effettuato', [
            'bootstrap_id' => $bootstrap->id,
            'email'        => $bootstrap->email_snapshot,
        ]);
    }

    // =========================================================================
    // ATTIVAZIONE
    // =========================================================================

    /**
     * Verifica il token, controlla la scadenza e lo stato.
     * Imposta la password definitiva, attiva utente e bootstrap.
     */
    public function activateBootstrap(string $token, string $password): TenantAdminBootstrap
    {
        $tokenHash = hash('sha256', $token);

        $bootstrap = TenantAdminBootstrap::where('invitation_token_hash', $tokenHash)->first();

        if ($bootstrap === null) {
            throw new \InvalidArgumentException('Token di attivazione non valido.');
        }

        if (! $bootstrap->isActivatable()) {
            $reason = $bootstrap->isExpired()
                ? 'Il token di invito è scaduto.'
                : 'Il bootstrap non è in uno stato attivabile (stato: ' . $bootstrap->status->value . ').';
            throw new \LogicException($reason);
        }

        return DB::transaction(function () use ($bootstrap, $password) {

            // Aggiorna la password dell'utente, attivalo e assegna il ruolo admin
            if ($bootstrap->user_id) {
                $user = User::find($bootstrap->user_id);
                if ($user) {
                    $user->update([
                        'password'          => Hash::make($password),
                        'email_verified_at' => now(),
                        'status'            => UserStatus::Active->value,
                    ]);

                    // Crea il record ProjectAdmin: l'utente diventa admin del progetto
                    ProjectAdmin::create([
                        'project_id'  => $bootstrap->system_project_id,
                        'user_id'     => $user->id,
                        'role'        => ProjectAdmin::ROLE_ADMIN,
                        'permissions' => ProjectAdmin::DEFAULT_PERMISSIONS[ProjectAdmin::ROLE_ADMIN],
                        'assigned_by' => $bootstrap->created_by,
                        'assigned_at' => now(),
                        'is_active'   => true,
                        'notes'       => 'Creato da bootstrap ' . $bootstrap->id . ' (contratto: ' . $bootstrap->contract_reference . ')',
                    ]);

                    $this->logger->info('TenantAdminBootstrap: ruolo ProjectAdmin assegnato', [
                        'user_id'    => $user->id,
                        'project_id' => $bootstrap->system_project_id,
                        'role'       => ProjectAdmin::ROLE_ADMIN,
                    ]);
                }
            }

            // Attiva il bootstrap
            $bootstrap->update([
                'status'                 => BootstrapStatus::Activated->value,
                'activated_at'           => now(),
                'invitation_token_hash'  => null, // invalida il token usato
            ]);

            $this->logger->info('TenantAdminBootstrap: attivazione completata', [
                'bootstrap_id' => $bootstrap->id,
                'user_id'      => $bootstrap->user_id,
            ]);

            return $bootstrap->fresh();
        });
    }

    // =========================================================================
    // SOSPENSIONE E REVOCA
    // =========================================================================

    /**
     * Sospende un bootstrap attivo.
     */
    public function suspendBootstrap(TenantAdminBootstrap $bootstrap, User $by): void
    {
        if (! $bootstrap->status->canBeSuspended()) {
            throw new \LogicException(
                'Bootstrap in stato ' . $bootstrap->status->value . ' non può essere sospeso.'
            );
        }

        $bootstrap->update([
            'status'       => BootstrapStatus::Suspended->value,
            'suspended_at' => now(),
            'updated_by'   => $by->id,
        ]);

        $this->logger->info('TenantAdminBootstrap: sospeso', [
            'bootstrap_id' => $bootstrap->id,
            'suspended_by' => $by->id,
        ]);
    }

    /**
     * Revoca definitivamente un bootstrap.
     */
    public function revokeBootstrap(TenantAdminBootstrap $bootstrap, User $by): void
    {
        if (! $bootstrap->status->canBeRevoked()) {
            throw new \LogicException('Bootstrap già revocato.');
        }

        $bootstrap->update([
            'status'                => BootstrapStatus::Revoked->value,
            'revoked_at'            => now(),
            'revoked_by'            => $by->id,
            'updated_by'            => $by->id,
            'invitation_token_hash' => null, // invalida eventuale token pendente
        ]);

        $this->logger->info('TenantAdminBootstrap: revocato', [
            'bootstrap_id' => $bootstrap->id,
            'revoked_by'   => $by->id,
        ]);
    }

    // =========================================================================
    // METODI PRIVATI
    // =========================================================================

    /**
     * Risolve il tenant esistente o ne crea uno nuovo in base a tenant_mode.
     */
    private function resolveOrCreateTenant(array $data, User $createdBy): Tenant
    {
        if ($data['tenant_mode'] === 'use_existing') {
            return Tenant::findOrFail((int) $data['tenant_id']);
        }

        $tenant = Tenant::create([
            'system_project_id' => $data['system_project_id'],
            'name'              => $data['tenant_name'],
            'slug'              => $data['tenant_slug'],
            'status'            => Tenant::STATUS_ACTIVE,
        ]);

        $this->logger->info('TenantAdminBootstrap: nuovo tenant creato', [
            'tenant_id'  => $tenant->id,
            'slug'       => $tenant->slug,
            'created_by' => $createdBy->id,
        ]);

        return $tenant;
    }

    /**
     * Genera un token sicuro, ne salva il hash e aggiorna invitation_* sul bootstrap.
     * Restituisce il token in chiaro (per l'email).
     */
    private function generateAndStoreToken(TenantAdminBootstrap $bootstrap): string
    {
        $token     = Str::random(64);
        $tokenHash = hash('sha256', $token);
        $expiresAt = now()->addHours(self::INVITE_EXPIRY_HOURS);

        $bootstrap->update([
            'status'                => BootstrapStatus::Invited->value,
            'invitation_token_hash' => $tokenHash,
            'invitation_sent_at'    => now(),
            'invitation_expires_at' => $expiresAt,
        ]);

        return $token;
    }
}
