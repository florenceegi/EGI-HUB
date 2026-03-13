<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\TenantAdminBootstrap;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * @package App\Mail
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - TenantAdminBootstrap)
 * @date 2026-03-13
 * @purpose Email di invito per un nuovo Tenant Admin — invia URL di attivazione monouso
 */
class TenantAdminInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param TenantAdminBootstrap $bootstrap  Il record di bootstrap (senza token in chiaro)
     * @param string               $token      Il token in chiaro — usato solo per costruire l'URL
     */
    public function __construct(
        public readonly TenantAdminBootstrap $bootstrap,
        public readonly string $token
    ) {}

    /**
     * Oggetto email.
     */
    public function envelope(): Envelope
    {
        $tenantName = $this->bootstrap->tenant->name ?? 'Tenant';

        return new Envelope(
            subject: 'Invito amministratore - ' . $tenantName,
        );
    }

    /**
     * Contenuto email: Blade view con dati strutturati.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.tenant-admin-invitation',
            with: [
                'adminFirstName'      => $this->bootstrap->first_name_snapshot,
                'adminLastName'       => $this->bootstrap->last_name_snapshot,
                'tenantName'          => $this->bootstrap->tenant->name ?? 'Tenant',
                'projectName'         => $this->bootstrap->project->name ?? 'Progetto',
                'contractReference'   => $this->bootstrap->contract_reference,
                'activationUrl'       => url('/activate/tenant-admin/' . $this->token),
                'expiresAt'           => $this->bootstrap->invitation_expires_at,
            ],
        );
    }
}
