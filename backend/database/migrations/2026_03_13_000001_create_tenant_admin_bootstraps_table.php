<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: tenant_admin_bootstraps
 *
 * Traccia il processo di onboarding degli amministratori tenant.
 * Ogni record rappresenta un invito ufficiale per un Tenant Admin,
 * collegato a un contratto, un tenant e (opzionalmente) un utente creato.
 *
 * @package Database\Migrations
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - TenantAdminBootstrap)
 * @date 2026-03-13
 * @purpose Onboarding controllato degli amministratori tenant con tracciabilità completa
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenant_admin_bootstraps', function (Blueprint $table) {
            $table->id();

            // Riferimento al progetto SaaS (NATAN_LOC, FlorenceArtEGI, etc.)
            $table->unsignedBigInteger('system_project_id')
                  ->comment('Progetto SaaS di appartenenza');
            $table->foreign('system_project_id')
                  ->references('id')
                  ->on('system_projects')
                  ->onDelete('restrict');

            // Tenant a cui appartiene questo admin
            $table->unsignedBigInteger('tenant_id')
                  ->comment('Tenant di destinazione');
            $table->foreign('tenant_id')
                  ->references('id')
                  ->on('tenants')
                  ->onDelete('restrict');

            // Utente creato (null finché non completata l'attivazione)
            $table->unsignedBigInteger('user_id')
                  ->nullable()
                  ->comment('Utente creato dopo attivazione');
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');

            // Riferimento contrattuale obbligatorio
            $table->string('contract_reference', 255)
                  ->comment('Numero/codice contratto o delibera');
            $table->date('contract_date')
                  ->nullable()
                  ->comment('Data firma contratto');

            // Snapshot anagrafico al momento della creazione
            $table->string('first_name_snapshot', 100)
                  ->comment('Nome al momento della creazione');
            $table->string('last_name_snapshot', 100)
                  ->comment('Cognome al momento della creazione');
            $table->string('email_snapshot', 255)
                  ->comment('Email al momento della creazione');
            $table->string('phone_snapshot', 50)
                  ->nullable()
                  ->comment('Telefono al momento della creazione');
            $table->string('job_title_snapshot', 150)
                  ->nullable()
                  ->comment('Ruolo/titolo al momento della creazione');

            // Stato del processo di bootstrap
            $table->string('status', 50)
                  ->default('pending')
                  ->comment('pending|invited|activated|suspended|revoked');

            // Token di invito (solo hash, mai plaintext)
            $table->string('invitation_token_hash', 255)
                  ->nullable()
                  ->comment('SHA-256 del token monouso — mai il token in chiaro');
            $table->timestamp('invitation_sent_at')
                  ->nullable()
                  ->comment('Timestamp invio email');
            $table->timestamp('invitation_expires_at')
                  ->nullable()
                  ->comment('Scadenza token (72h dalla spedizione)');

            // Timestamp di transizione di stato
            $table->timestamp('activated_at')
                  ->nullable()
                  ->comment('Quando l\'admin ha completato l\'attivazione');
            $table->timestamp('suspended_at')
                  ->nullable()
                  ->comment('Quando è stato sospeso');
            $table->timestamp('revoked_at')
                  ->nullable()
                  ->comment('Quando è stato revocato');

            // Audit trail operatori
            $table->unsignedBigInteger('created_by')
                  ->comment('SuperAdmin che ha creato il bootstrap');
            $table->foreign('created_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('restrict');

            $table->unsignedBigInteger('updated_by')
                  ->nullable()
                  ->comment('Ultimo SuperAdmin che ha modificato');
            $table->foreign('updated_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');

            $table->unsignedBigInteger('revoked_by')
                  ->nullable()
                  ->comment('SuperAdmin che ha revocato');
            $table->foreign('revoked_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');

            // Note interne
            $table->text('notes')
                  ->nullable()
                  ->comment('Note interne non visibili all\'admin invitato');

            $table->timestamps();

            // Indici per query frequenti
            $table->index('system_project_id');
            $table->index('tenant_id');
            $table->index('status');
            $table->index('email_snapshot');
            $table->index(['tenant_id', 'status']);
            $table->index('invitation_token_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_admin_bootstraps');
    }
};
