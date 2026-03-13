<?php

declare(strict_types=1);

namespace App\Http\Requests\TenantAdminBootstrap;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @package App\Http\Requests\TenantAdminBootstrap
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - TenantAdminBootstrap)
 * @date 2026-03-13
 * @purpose Validazione della richiesta di creazione di un Tenant Admin Bootstrap
 */
class StoreTenantAdminBootstrapRequest extends FormRequest
{
    /**
     * Solo i SuperAdmin possono creare bootstrap.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isSuperAdmin();
    }

    /**
     * Regole di validazione.
     */
    public function rules(): array
    {
        return [
            'system_project_id' => ['required', 'integer', 'exists:system_projects,id'],

            'tenant_mode' => ['required', 'string', 'in:create_new,use_existing'],

            // Tenant esistente
            'tenant_id' => [
                'required_if:tenant_mode,use_existing',
                'nullable',
                'integer',
                'exists:tenants,id',
            ],

            // Nuovo tenant
            'tenant_name' => [
                'required_if:tenant_mode,create_new',
                'nullable',
                'string',
                'max:255',
            ],
            'tenant_slug' => [
                'required_if:tenant_mode,create_new',
                'nullable',
                'string',
                'max:100',
                'alpha_dash',
                'unique:tenants,slug',
            ],

            // Dati contrattuali
            'contract_reference' => ['required', 'string', 'max:255'],
            'contract_date'      => ['nullable', 'date'],

            // Anagrafica admin
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'unique:users,email'],
            'phone'      => ['nullable', 'string', 'max:50'],
            'job_title'  => ['nullable', 'string', 'max:150'],
            'notes'      => ['nullable', 'string', 'max:1000'],

            // Checkbox di conferma obbligatoria
            'confirmed' => ['required', 'accepted'],
        ];
    }

    /**
     * Messaggi di errore personalizzati.
     */
    public function messages(): array
    {
        return [
            'confirmed.accepted'        => 'È necessario confermare la creazione del bootstrap.',
            'email.unique'              => 'Esiste già un utente con questa email.',
            'tenant_slug.unique'        => 'Questo slug è già in uso da un altro tenant.',
            'system_project_id.exists'  => 'Il progetto selezionato non esiste.',
            'tenant_id.exists'          => 'Il tenant selezionato non esiste.',
        ];
    }
}
