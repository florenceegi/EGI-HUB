<?php

declare(strict_types=1);

namespace App\Http\Requests\TenantAdminBootstrap;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @package App\Http\Requests\TenantAdminBootstrap
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - TenantAdminBootstrap)
 * @date 2026-03-13
 * @purpose Validazione della password al momento dell'attivazione del Tenant Admin
 */
class ActivateTenantAdminRequest extends FormRequest
{
    /**
     * Endpoint pubblico: chiunque abbia il token può attivare.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * La password deve rispettare i requisiti minimi e coincidere con la conferma.
     */
    public function rules(): array
    {
        return [
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ];
    }

    /**
     * Messaggi di errore personalizzati.
     */
    public function messages(): array
    {
        return [
            'password.min'       => 'La password deve essere di almeno 8 caratteri.',
            'password.confirmed' => 'La password e la conferma non corrispondono.',
        ];
    }
}
