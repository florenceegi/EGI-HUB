/**
 * BootstrapsList — EGI-HUB Frontend
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0
 * @purpose Lista e gestione dei Tenant Admin Bootstrap con filtri e azioni inline
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  RefreshCw,
  AlertTriangle,
  MoreVertical,
  Send,
  PauseCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import {
  getBootstraps,
  resendInvitation,
  suspendBootstrap,
  revokeBootstrap,
} from '@/services/bootstrapApi';
import type { TenantAdminBootstrap } from '@/types/bootstrap';
import BootstrapStatusBadge from './BootstrapStatusBadge';

// --- Sub-component: ConfirmModal ---

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="modal-box">
        <h3 id="confirm-modal-title" className="font-bold text-lg">{title}</h3>
        <p className="py-4 text-base-content/70">{message}</p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onCancel}>
            Annulla
          </button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel} />
    </div>
  );
}

// --- Main Component ---

interface ActionPending {
  type: 'suspend' | 'revoke';
  bootstrapId: number;
  bootstrapRef: string;
}

export default function BootstrapsList() {
  const [bootstraps, setBootstraps] = useState<TenantAdminBootstrap[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [actionPending, setActionPending] = useState<ActionPending | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const params: { status?: string; project_id?: number } = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (projectFilter !== 'all') params.project_id = parseInt(projectFilter, 10);
      const data = await getBootstraps(params);
      setBootstraps(data);
    } catch {
      setError('Errore nel caricamento dei bootstrap');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, projectFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleResend = async (id: number) => {
    setActionLoading(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await resendInvitation(id);
      setActionSuccess('Invito reinviato con successo');
    } catch {
      setActionError('Errore durante il reinvio dell\'invito');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmAction = async () => {
    if (!actionPending) return;
    setActionLoading(actionPending.bootstrapId);
    setActionError(null);
    setActionSuccess(null);
    const { type, bootstrapId } = actionPending;
    setActionPending(null);
    try {
      if (type === 'suspend') {
        await suspendBootstrap(bootstrapId);
        setActionSuccess('Bootstrap sospeso');
      } else {
        await revokeBootstrap(bootstrapId);
        setActionSuccess('Bootstrap revocato');
      }
      await fetchData();
    } catch {
      setActionError(`Errore durante l'operazione`);
    } finally {
      setActionLoading(null);
    }
  };

  const canResend = (b: TenantAdminBootstrap) =>
    b.status === 'invited' || b.status === 'pending';

  const canSuspend = (b: TenantAdminBootstrap) => b.status === 'activated';

  const canRevoke = (b: TenantAdminBootstrap) => b.status !== 'revoked';

  // Collect unique projects for filter
  const projectOptions = Array.from(
    new Map(
      bootstraps
        .filter((b) => b.project)
        .map((b) => [b.project!.id, b.project!])
    ).values()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary" aria-label="Caricamento in corso" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confirm Modal */}
      {actionPending && (
        <ConfirmModal
          title={actionPending.type === 'suspend' ? 'Sospendi Bootstrap' : 'Revoca Bootstrap'}
          message={
            actionPending.type === 'suspend'
              ? `Vuoi sospendere il bootstrap #${actionPending.bootstrapRef}? L'admin non potrà più accedere.`
              : `Vuoi revocare definitivamente il bootstrap #${actionPending.bootstrapRef}? L'operazione non è reversibile.`
          }
          confirmLabel={actionPending.type === 'suspend' ? 'Sospendi' : 'Revoca'}
          confirmClass={actionPending.type === 'suspend' ? 'btn-warning' : 'btn-error'}
          onConfirm={handleConfirmAction}
          onCancel={() => setActionPending(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" aria-hidden="true" />
            Tenant Admin Bootstraps
          </h1>
          <p className="text-base-content/60 mt-1">
            {bootstraps.length} bootstrap totali
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-ghost gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Aggiorna lista"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            Aggiorna
          </button>
          <Link to="/admin/bootstraps/new" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" aria-hidden="true" />
            Nuovo Bootstrap
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {actionError && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="alert alert-success" role="status" aria-live="polite">
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-2 flex-wrap">
              <label className="sr-only" htmlFor="filter-status">Filtra per stato</label>
              <select
                id="filter-status"
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">Pending</option>
                <option value="invited">Invited</option>
                <option value="activated">Activated</option>
                <option value="suspended">Suspended</option>
                <option value="revoked">Revoked</option>
              </select>
              <label className="sr-only" htmlFor="filter-project">Filtra per progetto</label>
              <select
                id="filter-project"
                className="select select-bordered"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="all">Tutti i progetti</option>
                {projectOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Project</th>
                <th>Tenant</th>
                <th>Contratto</th>
                <th>Admin</th>
                <th>Status</th>
                <th>Invito</th>
                <th>Creato il</th>
                <th aria-label="Azioni" />
              </tr>
            </thead>
            <tbody>
              {bootstraps.map((b) => (
                <tr key={b.id} className="hover">
                  <td className="font-mono text-sm">#{b.id}</td>
                  <td>
                    <span className="font-medium">
                      {b.project?.name ?? <span className="text-base-content/40">—</span>}
                    </span>
                  </td>
                  <td>
                    {b.tenant?.name ?? <span className="text-base-content/40">—</span>}
                  </td>
                  <td>
                    <div className="font-mono text-sm">{b.contract_reference}</div>
                    {b.contract_date && (
                      <div className="text-xs text-base-content/50">
                        {new Date(b.contract_date).toLocaleDateString('it-IT')}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="font-medium">
                      {b.first_name_snapshot} {b.last_name_snapshot}
                    </div>
                    <div className="text-sm text-base-content/60">{b.email_snapshot}</div>
                  </td>
                  <td>
                    <BootstrapStatusBadge status={b.status} />
                  </td>
                  <td>
                    {b.invitation_sent_at ? (
                      <div>
                        <div className="text-sm">
                          {new Date(b.invitation_sent_at).toLocaleDateString('it-IT')}
                        </div>
                        {b.invitation_expires_at && (
                          <div className="text-xs text-base-content/50">
                            scade {new Date(b.invitation_expires_at).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-base-content/40">—</span>
                    )}
                  </td>
                  <td className="text-sm text-base-content/60">
                    {new Date(b.created_at).toLocaleDateString('it-IT')}
                  </td>
                  <td>
                    <div className="dropdown dropdown-end">
                      <label
                        tabIndex={0}
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label={`Azioni per bootstrap #${b.id}`}
                      >
                        {actionLoading === b.id ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <MoreVertical className="w-4 h-4" aria-hidden="true" />
                        )}
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                      >
                        <li>
                          <Link to={`/admin/bootstraps/${b.id}`}>
                            <Eye className="w-4 h-4" aria-hidden="true" />
                            Dettaglio
                          </Link>
                        </li>
                        {canResend(b) && (
                          <li>
                            <button onClick={() => handleResend(b.id)}>
                              <Send className="w-4 h-4" aria-hidden="true" />
                              Reinvia invito
                            </button>
                          </li>
                        )}
                        {canSuspend(b) && (
                          <li>
                            <button
                              onClick={() =>
                                setActionPending({
                                  type: 'suspend',
                                  bootstrapId: b.id,
                                  bootstrapRef: b.contract_reference,
                                })
                              }
                            >
                              <PauseCircle className="w-4 h-4" aria-hidden="true" />
                              Sospendi
                            </button>
                          </li>
                        )}
                        {canRevoke(b) && (
                          <li className="text-error">
                            <button
                              onClick={() =>
                                setActionPending({
                                  type: 'revoke',
                                  bootstrapId: b.id,
                                  bootstrapRef: b.contract_reference,
                                })
                              }
                            >
                              <XCircle className="w-4 h-4" aria-hidden="true" />
                              Revoca
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bootstraps.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-base-content/20" aria-hidden="true" />
            <p className="mt-4 text-base-content/60">Nessun bootstrap trovato</p>
            <Link to="/admin/bootstraps/new" className="btn btn-primary btn-sm mt-4 gap-2">
              <Plus className="w-4 h-4" aria-hidden="true" />
              Crea il primo bootstrap
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
