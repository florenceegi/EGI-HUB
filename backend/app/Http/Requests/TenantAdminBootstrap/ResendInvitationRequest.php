<?php

declare(strict_types=1);

namespace App\Http\Requests\TenantAdminBootstrap;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @package App\Http\Requests\TenantAdminBootstrap
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - TenantAdminBootstrap)
 * @date 2026-03-13
 * @purpose Autorizzazione del reinvio email per un bootstrap esistente
 */
class ResendInvitationRequest extends FormRequest
{
    /**
     * Solo i SuperAdmin possono inviare reinviti.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isSuperAdmin();
    }

    /**
     * Nessun campo aggiuntivo richiesto per il reinvio.
     */
    public function rules(): array
    {
        return [];
    }
}
