/**
 * Bootstrap Types — EGI-HUB Frontend
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0
 * @purpose Definizione tipi TypeScript per il flusso Tenant Admin Bootstrap
 */

export type BootstrapStatus = 'pending' | 'invited' | 'activated' | 'suspended' | 'revoked';

export interface TenantAdminBootstrap {
  id: number;
  system_project_id: number;
  tenant_id: number;
  user_id: number | null;
  contract_reference: string;
  contract_date: string | null;
  first_name_snapshot: string;
  last_name_snapshot: string;
  email_snapshot: string;
  phone_snapshot: string | null;
  job_title_snapshot: string | null;
  status: BootstrapStatus;
  invitation_sent_at: string | null;
  invitation_expires_at: string | null;
  activated_at: string | null;
  suspended_at: string | null;
  revoked_at: string | null;
  notes: string | null;
  created_at: string;
  // Relations (quando loaded)
  project?: { id: number; name: string; slug: string };
  tenant?: { id: number; name: string; slug: string };
  user?: { id: number; name: string; email: string };
  created_by_user?: { id: number; name: string };
}

export interface CreateBootstrapPayload {
  system_project_id: number;
  tenant_mode: 'create_new' | 'use_existing';
  tenant_id?: number;
  tenant_name?: string;
  tenant_slug?: string;
  contract_reference: string;
  contract_date?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  notes?: string;
  confirmed: boolean;
}

export interface ActivateBootstrapPayload {
  password: string;
  password_confirmation: string;
}

export interface ActivationInfo {
  bootstrap: {
    id: number;
    status: BootstrapStatus;
    first_name_snapshot: string;
    last_name_snapshot: string;
    email_snapshot: string;
    invitation_expires_at: string | null;
  };
  project: { id: number; name: string; slug: string };
  tenant: { id: number; name: string; slug: string };
}
