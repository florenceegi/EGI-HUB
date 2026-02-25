/**
 * @package frontend/src/pages/billing
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - BILLING FASE 3.5)
 * @date 2026-02-25
 * @purpose Gestione piani di abbonamento e sottoscrizioni tenant — FASE 3
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard, Plus, Trash2, Edit2, Check, X, Users,
  FileText, Zap,
} from 'lucide-react'
import api from '../../services/api'
import { getProjects } from '../../services/projectApi'
import type { Project } from '../../types/project'

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface SubscriptionPlan {
  id: number
  project_id: number
  name: string
  slug: string
  description: string | null
  price_monthly_eur: string
  price_annual_eur: string
  max_users: number
  max_documents: number
  max_queries_monthly: number
  features: Record<string, unknown> | null
  is_active: boolean
  display_order: number
  active_subscriptions_count: number
  project?: { id: number; name: string; slug: string }
}

interface TenantSubscription {
  id: number
  tenant_id: number
  plan_id: number
  status: 'active' | 'trial' | 'suspended' | 'cancelled'
  starts_at: string | null
  ends_at: string | null
  trial_ends_at: string | null
  price_paid_eur: string | null
  billing_cycle: 'monthly' | 'annual' | 'custom'
  stripe_subscription_id: string | null
  paypal_subscription_id: string | null
  tenant?: { id: number; name: string; slug: string }
  plan?: { id: number; name: string; slug: string; price_monthly_eur: string }
}

interface PlansResponse {
  success: boolean
  data: SubscriptionPlan[]
  total: number
}

interface SubsResponse {
  success: boolean
  data: TenantSubscription[]
  total: number
}

type PlanFormData = Omit<SubscriptionPlan, 'id' | 'active_subscriptions_count' | 'project'>

const EMPTY_PLAN: PlanFormData = {
  project_id: 0,
  name: '',
  slug: '',
  description: '',
  price_monthly_eur: '0.00',
  price_annual_eur: '0.00',
  max_users: 0,
  max_documents: 0,
  max_queries_monthly: 0,
  features: null,
  is_active: true,
  display_order: 0,
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function statusBadge(status: TenantSubscription['status']): string {
  const map: Record<string, string> = {
    active:    'badge-success',
    trial:     'badge-warning',
    suspended: 'badge-error',
    cancelled: 'badge-ghost',
  }
  return map[status] ?? 'badge-ghost'
}

function fmt0(n: number): string {
  return n === 0 ? '∞' : n.toLocaleString('it-IT')
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan Form Modal
// ─────────────────────────────────────────────────────────────────────────────

interface PlanModalProps {
  open: boolean
  plan: SubscriptionPlan | null      // null = create
  projects: Project[]
  onClose: () => void
  onSave: (data: Partial<PlanFormData>, id?: number) => void
  saving: boolean
}

function PlanModal({ open, plan, projects, onClose, onSave, saving }: PlanModalProps) {
  const [form, setForm] = useState<PlanFormData>(() =>
    plan
      ? {
          project_id:           plan.project_id,
          name:                 plan.name,
          slug:                 plan.slug,
          description:          plan.description ?? '',
          price_monthly_eur:    plan.price_monthly_eur,
          price_annual_eur:     plan.price_annual_eur,
          max_users:            plan.max_users,
          max_documents:        plan.max_documents,
          max_queries_monthly:  plan.max_queries_monthly,
          features:             plan.features,
          is_active:            plan.is_active,
          display_order:        plan.display_order,
        }
      : { ...EMPTY_PLAN }
  )

  if (!open) return null

  const set = (key: keyof PlanFormData, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }))

  const handleNameChange = (v: string) => {
    set('name', v)
    if (!plan) set('slug', slugify(v))  // auto-slug solo in creazione
  }

  const handleSubmit = () => {
    onSave(form, plan?.id)
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {plan ? `Modifica piano: ${plan.name}` : 'Nuovo piano di abbonamento'}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Progetto */}
          <div className="form-control col-span-2">
            <label className="label"><span className="label-text">Progetto *</span></label>
            <select
              className="select select-bordered"
              value={form.project_id}
              onChange={(e) => set('project_id', parseInt(e.target.value))}
              disabled={!!plan}
            >
              <option value={0} disabled>Seleziona progetto...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Nome */}
          <div className="form-control">
            <label className="label"><span className="label-text">Nome *</span></label>
            <input
              type="text"
              className="input input-bordered"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Starter PA"
            />
          </div>

          {/* Slug */}
          <div className="form-control">
            <label className="label"><span className="label-text">Slug *</span></label>
            <input
              type="text"
              className="input input-bordered font-mono"
              value={form.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              placeholder="starter-pa"
            />
          </div>

          {/* Prezzi */}
          <div className="form-control">
            <label className="label"><span className="label-text">Prezzo mensile (€)</span></label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input input-bordered"
              value={form.price_monthly_eur}
              onChange={(e) => set('price_monthly_eur', e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Prezzo annuale (€)</span></label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input input-bordered"
              value={form.price_annual_eur}
              onChange={(e) => set('price_annual_eur', e.target.value)}
            />
          </div>

          {/* Limiti */}
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-1"><Users size={12} /> Max utenti (0=∞)</span>
            </label>
            <input
              type="number"
              min="0"
              className="input input-bordered"
              value={form.max_users}
              onChange={(e) => set('max_users', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-1"><FileText size={12} /> Max documenti (0=∞)</span>
            </label>
            <input
              type="number"
              min="0"
              className="input input-bordered"
              value={form.max_documents}
              onChange={(e) => set('max_documents', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-control col-span-2">
            <label className="label">
              <span className="label-text flex items-center gap-1"><Zap size={12} /> Max query/mese (0=∞)</span>
            </label>
            <input
              type="number"
              min="0"
              className="input input-bordered"
              value={form.max_queries_monthly}
              onChange={(e) => set('max_queries_monthly', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Descrizione */}
          <div className="form-control col-span-2">
            <label className="label"><span className="label-text">Descrizione</span></label>
            <textarea
              className="textarea textarea-bordered"
              rows={2}
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Piano ideale per comuni e piccole PA..."
            />
          </div>

          {/* Ordine + is_active */}
          <div className="form-control">
            <label className="label"><span className="label-text">Ordine visualizzazione</span></label>
            <input
              type="number"
              min="0"
              className="input input-bordered"
              value={form.display_order}
              onChange={(e) => set('display_order', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-control justify-end">
            <label className="label cursor-pointer">
              <span className="label-text">Attivo</span>
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={form.is_active}
                onChange={(e) => set('is_active', e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            <X size={16} /> Annulla
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving || !form.project_id || !form.name || !form.slug}
          >
            {saving
              ? <span className="loading loading-spinner loading-xs" />
              : <Check size={16} />
            }
            {plan ? 'Salva modifiche' : 'Crea piano'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SubscriptionPlans() {
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('plans')

  // Filtri piani
  const [filterProjectId, setFilterProjectId] = useState('')
  const [filterActive, setFilterActive]       = useState('')

  // Filtri sottoscrizioni
  const [subFilterStatus, setSubFilterStatus]       = useState('')
  const [subFilterProjectId, setSubFilterProjectId] = useState('')

  // Modal
  const [modalOpen, setModalOpen]   = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)

  // ── Query: progetti ────────────────────────────────────────────────────────
  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => getProjects(),
  })
  const projects: Project[] = projectsData ?? []

  // ── Query: piani ───────────────────────────────────────────────────────────
  const { data: plansData, isLoading: plansLoading, isError: plansError } =
    useQuery<PlansResponse>({
      queryKey: ['billing-plans', filterProjectId, filterActive],
      queryFn: async () => {
        const params = new URLSearchParams()
        if (filterProjectId) params.set('project_id', filterProjectId)
        if (filterActive !== '') params.set('is_active', filterActive)
        const res = await api.get('/superadmin/billing/plans?' + params.toString())
        return res.data
      },
    })

  // ── Query: sottoscrizioni ──────────────────────────────────────────────────
  const { data: subsData, isLoading: subsLoading, isError: subsError } =
    useQuery<SubsResponse>({
      queryKey: ['billing-subscriptions', subFilterStatus, subFilterProjectId],
      queryFn: async () => {
        const params = new URLSearchParams()
        if (subFilterStatus) params.set('status', subFilterStatus)
        if (subFilterProjectId) params.set('project_id', subFilterProjectId)
        const res = await api.get('/superadmin/billing/subscriptions?' + params.toString())
        return res.data
      },
      enabled: activeTab === 'subscriptions',
    })

  // ── Mutation: crea/aggiorna piano ──────────────────────────────────────────
  const savePlan = useMutation({
    mutationFn: async ({ data, id }: { data: Partial<PlanFormData>; id?: number }) => {
      if (id) {
        await api.put(`/superadmin/billing/plans/${id}`, data)
      } else {
        await api.post('/superadmin/billing/plans', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-plans'] })
      setModalOpen(false)
      setEditingPlan(null)
    },
    onError: (err: Error) => alert(`Errore: ${err.message}`),
  })

  // ── Mutation: toggle is_active ─────────────────────────────────────────────
  const togglePlan = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) =>
      api.put(`/superadmin/billing/plans/${id}`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing-plans'] }),
    onError: (err: Error) => alert(`Errore: ${err.message}`),
  })

  // ── Mutation: elimina piano ────────────────────────────────────────────────
  const deletePlan = useMutation({
    mutationFn: async (id: number) => api.delete(`/superadmin/billing/plans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing-plans'] }),
    onError: (err: Error) => alert(`Errore: ${err.message}`),
  })

  // ── Mutation: aggiorna status sottoscrizione ───────────────────────────────
  const updateSubStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) =>
      api.put(`/superadmin/billing/subscriptions/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing-subscriptions'] }),
    onError: (err: Error) => alert(`Errore: ${err.message}`),
  })

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDeletePlan = (plan: SubscriptionPlan) => {
    if (!window.confirm(`Eliminare il piano "${plan.name}"? L'operazione è irreversibile.`)) return
    deletePlan.mutate(plan.id)
  }

  const handleSavePlan = (data: Partial<PlanFormData>, id?: number) => {
    savePlan.mutate({ data, id })
  }

  const openCreate = () => {
    setEditingPlan(null)
    setModalOpen(true)
  }

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setModalOpen(true)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const plans = plansData?.data ?? []
  const subs  = subsData?.data ?? []

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard size={28} className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Subscription Plans</h1>
            <p className="text-base-content/60 text-sm">Gestione piani e abbonamenti tenant</p>
          </div>
        </div>
        {activeTab === 'plans' && (
          <button className="btn btn-primary gap-2" onClick={openCreate}>
            <Plus size={16} /> Nuovo piano
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed w-fit">
        <button
          className={`tab ${activeTab === 'plans' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Piani
          {plansData && (
            <span className="badge badge-sm ml-2">{plansData.total}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'subscriptions' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Sottoscrizioni
          {subsData && (
            <span className="badge badge-sm ml-2">{subsData.total}</span>
          )}
        </button>
      </div>

      {/* ── TAB PIANI ─────────────────────────────────────────────────────── */}
      {activeTab === 'plans' && (
        <>
          {/* Filtri */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Progetto</span></label>
              <select
                className="select select-bordered select-sm w-48"
                value={filterProjectId}
                onChange={(e) => setFilterProjectId(e.target.value)}
              >
                <option value="">Tutti i progetti</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Stato</span></label>
              <select
                className="select select-bordered select-sm w-36"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="">Tutti</option>
                <option value="1">Attivi</option>
                <option value="0">Disattivi</option>
              </select>
            </div>
          </div>

          {/* Loading / Error */}
          {plansLoading && (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          )}
          {plansError && (
            <div className="alert alert-error">
              <span>Impossibile caricare i piani.</span>
            </div>
          )}

          {/* Tabella piani */}
          {!plansLoading && !plansError && (
            <div className="overflow-x-auto rounded-xl border border-base-200">
              <table className="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Piano</th>
                    <th>Progetto</th>
                    <th className="text-right">€/mese</th>
                    <th className="text-right">€/anno</th>
                    <th className="text-center">Utenti</th>
                    <th className="text-center">Docs</th>
                    <th className="text-center">Query/m</th>
                    <th className="text-center">Abbonati</th>
                    <th className="text-center">Attivo</th>
                    <th className="text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.length === 0 && (
                    <tr><td colSpan={10} className="text-center py-8 text-base-content/40">
                      Nessun piano trovato.
                    </td></tr>
                  )}
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover">
                      <td>
                        <div className="font-semibold">{plan.name}</div>
                        <div className="text-xs font-mono text-base-content/40">{plan.slug}</div>
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {plan.project?.name ?? `#${plan.project_id}`}
                        </span>
                      </td>
                      <td className="text-right font-mono">
                        € {parseFloat(plan.price_monthly_eur).toFixed(2)}
                      </td>
                      <td className="text-right font-mono">
                        € {parseFloat(plan.price_annual_eur).toFixed(2)}
                      </td>
                      <td className="text-center text-sm">{fmt0(plan.max_users)}</td>
                      <td className="text-center text-sm">{fmt0(plan.max_documents)}</td>
                      <td className="text-center text-sm">{fmt0(plan.max_queries_monthly)}</td>
                      <td className="text-center">
                        <span className="badge badge-info badge-sm">
                          {plan.active_subscriptions_count}
                        </span>
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="toggle toggle-sm toggle-success"
                          checked={plan.is_active}
                          onChange={() => togglePlan.mutate({ id: plan.id, is_active: !plan.is_active })}
                        />
                      </td>
                      <td>
                        <div className="flex gap-1 justify-center">
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() => openEdit(plan)}
                            title="Modifica"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="btn btn-xs btn-ghost text-error"
                            onClick={() => handleDeletePlan(plan)}
                            disabled={plan.active_subscriptions_count > 0}
                            title={
                              plan.active_subscriptions_count > 0
                                ? 'Abbonamenti attivi — impossibile eliminare'
                                : 'Elimina piano'
                            }
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── TAB SOTTOSCRIZIONI ────────────────────────────────────────────── */}
      {activeTab === 'subscriptions' && (
        <>
          {/* Filtri */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Stato</span></label>
              <select
                className="select select-bordered select-sm w-40"
                value={subFilterStatus}
                onChange={(e) => setSubFilterStatus(e.target.value)}
              >
                <option value="">Tutti gli stati</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Progetto</span></label>
              <select
                className="select select-bordered select-sm w-48"
                value={subFilterProjectId}
                onChange={(e) => setSubFilterProjectId(e.target.value)}
              >
                <option value="">Tutti i progetti</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading / Error */}
          {subsLoading && (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          )}
          {subsError && (
            <div className="alert alert-error">
              <span>Impossibile caricare le sottoscrizioni.</span>
            </div>
          )}

          {/* Tabella sottoscrizioni */}
          {!subsLoading && !subsError && (
            <div className="overflow-x-auto rounded-xl border border-base-200">
              <table className="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Piano</th>
                    <th className="text-center">Stato</th>
                    <th className="text-center">Ciclo</th>
                    <th className="text-right">€ pagato</th>
                    <th>Inizio</th>
                    <th>Fine</th>
                    <th>Stripe ID</th>
                    <th className="text-center">Cambia stato</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.length === 0 && (
                    <tr><td colSpan={9} className="text-center py-8 text-base-content/40">
                      Nessuna sottoscrizione trovata.
                    </td></tr>
                  )}
                  {subs.map((sub) => (
                    <tr key={sub.id} className="hover">
                      <td>
                        <div className="font-medium">{sub.tenant?.name ?? `#${sub.tenant_id}`}</div>
                        <div className="text-xs font-mono text-base-content/40">{sub.tenant?.slug}</div>
                      </td>
                      <td>
                        <div>{sub.plan?.name ?? `#${sub.plan_id}`}</div>
                        <div className="text-xs text-base-content/40">
                          {sub.plan ? `€ ${parseFloat(sub.plan.price_monthly_eur).toFixed(2)}/m` : ''}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge badge-sm ${statusBadge(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-ghost badge-xs">{sub.billing_cycle}</span>
                      </td>
                      <td className="text-right font-mono">
                        {sub.price_paid_eur
                          ? `€ ${parseFloat(sub.price_paid_eur).toFixed(2)}`
                          : '—'}
                      </td>
                      <td className="text-xs">
                        {sub.starts_at ? new Date(sub.starts_at).toLocaleDateString('it-IT') : '—'}
                      </td>
                      <td className="text-xs">
                        {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString('it-IT') : '—'}
                      </td>
                      <td className="font-mono text-xs truncate max-w-[120px]">
                        {sub.stripe_subscription_id ?? '—'}
                      </td>
                      <td className="text-center">
                        <div className="relative group inline-block">
                          <select
                            className="select select-xs select-bordered"
                            value={sub.status}
                            onChange={(e) =>
                              updateSubStatus.mutate({ id: sub.id, status: e.target.value })
                            }
                          >
                            <option value="active">active</option>
                            <option value="trial">trial</option>
                            <option value="suspended">suspended</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Plan Modal */}
      {modalOpen && (
        <PlanModal
          open={modalOpen}
          plan={editingPlan}
          projects={projects}
          onClose={() => { setModalOpen(false); setEditingPlan(null) }}
          onSave={handleSavePlan}
          saving={savePlan.isPending}
        />
      )}
    </div>
  )
}
