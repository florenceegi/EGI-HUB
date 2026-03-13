/**
 * Bootstrap API Service — EGI-HUB Frontend
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0
 * @purpose Chiamate API per il flusso Tenant Admin Bootstrap
 */

import api from './api';
import type {
  TenantAdminBootstrap,
  CreateBootstrapPayload,
  ActivateBootstrapPayload,
  ActivationInfo,
} from '../types/bootstrap';
import type { ApiResponse } from '../types/tenant';

/**
 * Recupera la lista dei bootstrap con filtri opzionali
 */
export async function getBootstraps(params?: {
  project_id?: number;
  status?: string;
}): Promise<TenantAdminBootstrap[]> {
  const response = await api.get<ApiResponse<TenantAdminBootstrap[]>>(
    '/admin/bootstraps',
    { params }
  );
  return response.data.data;
}

/**
 * Recupera un singolo bootstrap per ID
 */
export async function getBootstrap(id: number): Promise<TenantAdminBootstrap> {
  const response = await api.get<ApiResponse<TenantAdminBootstrap>>(
    `/admin/bootstraps/${id}`
  );
  return response.data.data;
}

/**
 * Crea un nuovo bootstrap e invia l'invito
 */
export async function createBootstrap(
  data: CreateBootstrapPayload
): Promise<TenantAdminBootstrap> {
  const response = await api.post<ApiResponse<TenantAdminBootstrap>>(
    '/admin/bootstraps',
    data
  );
  return response.data.data;
}

/**
 * Reinvia l'email di invito per un bootstrap
 */
export async function resendInvitation(id: number): Promise<void> {
  await api.post(`/admin/bootstraps/${id}/resend`);
}

/**
 * Sospende un bootstrap attivo
 */
export async function suspendBootstrap(id: number): Promise<TenantAdminBootstrap> {
  const response = await api.post<ApiResponse<TenantAdminBootstrap>>(
    `/admin/bootstraps/${id}/suspend`
  );
  return response.data.data;
}

/**
 * Revoca un bootstrap
 */
export async function revokeBootstrap(id: number): Promise<TenantAdminBootstrap> {
  const response = await api.post<ApiResponse<TenantAdminBootstrap>>(
    `/admin/bootstraps/${id}/revoke`
  );
  return response.data.data;
}

/**
 * Recupera le informazioni di attivazione da token (rotta pubblica)
 */
export async function getActivationInfo(token: string): Promise<ActivationInfo> {
  const response = await api.get<ApiResponse<ActivationInfo>>(
    `/activate/tenant-admin/${token}`
  );
  return response.data.data;
}

/**
 * Completa l'attivazione dell'account admin tramite token (rotta pubblica)
 */
export async function activateBootstrap(
  token: string,
  data: ActivateBootstrapPayload
): Promise<void> {
  await api.post(`/activate/tenant-admin/${token}`, data);
}

export default {
  getBootstraps,
  getBootstrap,
  createBootstrap,
  resendInvitation,
  suspendBootstrap,
  revokeBootstrap,
  getActivationInfo,
  activateBootstrap,
};
