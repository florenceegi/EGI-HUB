/**
 * @package frontend/src/pages/billing
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (EGI-HUB - BILLING FASE 4.3)
 * @date 2026-02-25
 * @purpose Configurazione provider di pagamento per progetto — FASE 4
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard, Settings, Eye, EyeOff, Save, Plus,
  Trash2, AlertTriangle, Check,
} from 'lucide-react'
import api from '../../services/api'
import { getProjects } from '../../services/projectApi'
import type { Project } from '../../types/project'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Provider = 'stripe' | 'paypal' | 'crypto'
type Environment = 'sandbox' | 'live'

interface PaymentConfig {
  id: number
  project_id: number
  provider: Provider
  is_enabled: boolean
  environment: Environment
  notes: string | null
  config_masked: Record<string, string>
  config_schema: string[]
  project?: { id: number; name: string; slug: string }
  created_at: string
  updated_at: string
}

interface ConfigsResponse {
  success: boolean
  data: PaymentConfig[]
  total: number
}

const PROVIDER_LABELS: Record<Provider, string> = {
  stripe:  'Stripe',
  paypal:  'PayPal',
  crypto:  'Crypto / Algorand',
}

const PROVIDER_COLORS: Record<Provider, string> = {
  stripe:  'badge-primary',
  paypal:  'badge-info',
  crypto:  'badge-warning',
}

// ─────────────────────────────────────────────────────────────────────────────
// Config Form Modal
// ─────────────────────────────────────────────────────────────────────────────

interface ConfigModalProps {
  open: boolean
  config: PaymentConfig | null
  projects: Project[]
  onClose: () => void
  onSave: (data: Record<string, unknown>, id?: number) => void
  saving: boolean
}

function ConfigModal({ open, config, projects, onClose, onSave, saving }: ConfigModalProps) {
  const [projectId, setProjectId] = useState(config?.project_id ?? 0)
  const [provider, setProvider]   = useState<Provider>(config?.provider ?? 'stripe')
  const [environment, setEnvironment] = useState<Environment>(config?.environment ?? 'sandbox')
  const [isEnabled, setIsEnabled] = useState(config?.is_enabled ?? false)
  const [notes, setNotes]         = useState(config?.notes ?? '')

  // Chiavi config: inizializzate vuote (non prefillate per sicurezza)
  const schema = config?.config_schema ?? (
    provider === 'stripe'  ? ['publishable_key', 'secret_key', 'webhook_secret'] :
    provider === 'paypal'  ? ['client_id', 'client_secret', 'webhook_id'] :
                             ['api_key', 'api_secret', 'wallet_address']
  )
  const [configFields, setConfigFields] = useState<Record<string, string>>(
    () => Object.fromEntries(schema.map((k) => [k, '']))
  )
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})

  if (!open) return null

  const handleProviderChange = (v: Provider) => {
    setProvider(v)
    // Reset campi quando cambia provider
    const newSchema =
      v === 'stripe'  ? ['publishable_key', 'secret_key', 'webhook_secret'] :
      v === 'paypal'  ? ['client_id', 'client_secret', 'webhook_id'] :
                       ['api_key', 'api_secret', 'wallet_address']
    setConfigFields(Object.fromEntries(newSchema.map((k) => [k, ''])))
  }

  const handleSubmit = () => {
    // Includi solo i campi config non vuoti (evita di sovrascrivere con stringa vuota)
    const configPayload: Record<string, string> = {}
    for (const [k, v] of Object.entries(configFields)) {
      if (v.trim() !== '') configPayload[k] = v.trim()
    }

    onSave({
      project_id:  config ? undefined : projectId,   // project_id non modificabile
      provider:    config ? undefined : provider,
      is_enabled:  isEnabled,
      environment,
      notes:       notes || null,
      ...(Object.keys(configPayload).length > 0 ? { config: configPayload } : {}),
    }, config?.id)
  }

  const currentSchema = config?.config_schema ?? (
    provider === 'stripe'  ? ['publishable_key', 'secret_key', 'webhook_secret'] :
    provider === 'paypal'  ? ['client_id', 'client_secret', 'webhook_id'] :
                             ['api_key', 'api_secret', 'wallet_address']
  )

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Settings size={18} />
          {config
            ? `Modifica — ${PROVIDER_LABELS[config.provider]} (${config.project?.name})`
            : 'Nuova configurazione provider'
          }
        </h3>

        <div className="space-y-4">
          {/* Progetto + Provider (solo in creazione) */}
          {!config && (
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Progetto *</span></label>
                <select
                  className="select select-bordered"
                  value={projectId}
                  onChange={(e) => setProjectId(parseInt(e.target.value))}
                >
                  <option value={0} disabled>Seleziona...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Provider *</span></label>
                <select
                  className="select select-bordered"
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value as Provider)}
                >
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="crypto">Crypto / Algorand</option>
                </select>
              </div>
            </div>
          )}

          {/* Environment + is_enabled */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="form-control">
              <label className="label"><span className="label-text">Ambiente</span></label>
              <select
                className="select select-bordered"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as Environment)}
              >
                <option value="sandbox">🧪 Sandbox (test)</option>
                <option value="live">🟢 Live (produzione)</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Attivo</span>
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Warning live */}
          {environment === 'live' && (
            <div className="alert alert-warning py-2 text-sm">
              <AlertTriangle size={14} />
              <span>Stai configurando un ambiente di <strong>produzione</strong>. Le chiavi sono cifrate.</span>
            </div>
          )}

          {/* Chiavi API */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Chiavi API — {PROVIDER_LABELS[config?.provider ?? provider]}
              </span>
              {config && (
                <span className="label-text-alt text-xs text-base-content/40">
                  Lascia vuoto per non modificare
                </span>
              )}
            </label>
            <div className="space-y-2 border border-base-300 rounded-lg p-3">
              {currentSchema.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <label className="font-mono text-xs w-36 shrink-0 text-base-content/60">
                    {key}
                  </label>
                  <div className="relative flex-1">
                    <input
                      type={showValues[key] ? 'text' : 'password'}
                      className="input input-sm input-bordered w-full font-mono pr-8"
                      placeholder={
                        config?.config_masked[key]
                          ? '••••••••  (invariato)'
                          : `Inserisci ${key}...`
                      }
                      value={configFields[key] ?? ''}
                      onChange={(e) =>
                        setConfigFields((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                      onClick={() =>
                        setShowValues((s) => ({ ...s, [key]: !s[key] }))
                      }
                    >
                      {showValues[key] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="form-control">
            <label className="label"><span className="label-text">Note operative</span></label>
            <textarea
              className="textarea textarea-bordered"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Es. Stripe test account di Mario Rossi — VIETATO usare in produzione"
            />
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Annulla
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving || (!config && (!projectId || !provider))}
          >
            {saving
              ? <span className="loading loading-spinner loading-xs" />
              : <Save size={14} />
            }
            {config ? 'Salva modifiche' : 'Crea configurazione'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider Card
// ─────────────────────────────────────────────────────────────────────────────

interface ProviderCardProps {
  config: PaymentConfig
  onEdit: (cfg: PaymentConfig) => void
  onToggle: (id: number, enabled: boolean) => void
  onDelete: (cfg: PaymentConfig) => void
}

function ProviderCard({ config, onEdit, onToggle, onDelete }: ProviderCardProps) {
  return (
    <div className={`card border ${config.is_enabled ? 'border-success/40 bg-success/5' : 'border-base-200 bg-base-100'} shadow-sm`}>
      <div className="card-body p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`badge ${PROVIDER_COLORS[config.provider]}`}>
              {PROVIDER_LABELS[config.provider]}
            </span>
            <span className={`badge badge-xs ${config.environment === 'live' ? 'badge-success' : 'badge-warning'}`}>
              {config.environment}
            </span>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-sm toggle-success"
            checked={config.is_enabled}
            onChange={() => onToggle(config.id, !config.is_enabled)}
            title={config.is_enabled ? 'Disabilita' : 'Abilita'}
          />
        </div>

        {/* Chiavi (mascherate) */}
        <div className="space-y-1">
          {config.config_schema.map((key) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="font-mono text-base-content/50">{key}</span>
              <span className="font-mono text-base-content/30">
                {config.config_masked[key] ? '••••••••' : (
                  <span className="text-error">non impostato</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Note */}
        {config.notes && (
          <p className="text-xs text-base-content/40 truncate" title={config.notes}>
            {config.notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            className="btn btn-xs btn-outline flex-1 gap-1"
            onClick={() => onEdit(config)}
          >
            <Settings size={10} /> Configura
          </button>
          <button
            className="btn btn-xs btn-ghost text-error"
            onClick={() => onDelete(config)}
            title="Elimina configurazione"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentProviders() {
  const queryClient = useQueryClient()

  const [filterProjectId, setFilterProjectId] = useState('')
  const [filterProvider, setFilterProvider]   = useState('')
  const [modalOpen, setModalOpen]     = useState(false)
  const [editingConfig, setEditingConfig] = useState<PaymentConfig | null>(null)
  const [successMsg, setSuccessMsg]   = useState<string | null>(null)

  // ── Query: progetti ────────────────────────────────────────────────────────
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => getProjects(),
  })

  // ── Query: configs ─────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery<ConfigsResponse>({
    queryKey: ['payment-providers', filterProjectId, filterProvider],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filterProjectId) params.set('project_id', filterProjectId)
      if (filterProvider)  params.set('provider', filterProvider)
      const res = await api.get('/superadmin/billing/payment-providers?' + params.toString())
      return res.data
    },
  })

  // ── Mutation: crea/aggiorna ────────────────────────────────────────────────
  const saveConfig = useMutation({
    mutationFn: async ({ payload, id }: { payload: Record<string, unknown>; id?: number }) => {
      if (id) {
        await api.put(`/superadmin/billing/payment-providers/${id}`, payload)
      } else {
        await api.post('/superadmin/billing/payment-providers', payload)
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['payment-providers'] })
      setModalOpen(false)
      setEditingConfig(null)
      flash(vars.id ? 'Configurazione aggiornata.' : 'Configurazione creata.')
    },
    onError: (err: Error) => alert(`Errore: ${err.message}`),
  })

  // ── Mutation: toggle ───────────────────────────────────────────────────────
  const toggleConfig = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: number; is_enabled: boolean }) =>
      api.put(`/superadmin/billing/payment-providers/${id}`, { is_enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-providers'] }),
    onError: (err: Error) => alert(`Errore: ${err.message}`),
  })

  // ── Mutation: elimina ──────────────────────────────────────────────────────
  const deleteConfig = useMutation({
    mutationFn: async (id: number) => api.delete(`/superadmin/billing/payment-providers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-providers'] })
      flash('Configurazione eliminata.')
    },
    onError: (err: Error) => alert(`Errore: ${err.message}`),
  })

  const flash = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 2500)
  }

  const handleDelete = (cfg: PaymentConfig) => {
    if (!window.confirm(`Eliminare la configurazione ${PROVIDER_LABELS[cfg.provider]} per "${cfg.project?.name}"?`)) return
    deleteConfig.mutate(cfg.id)
  }

  const handleSave = (payload: Record<string, unknown>, id?: number) => {
    saveConfig.mutate({ payload, id })
  }

  // ── Raggruppamento per progetto ────────────────────────────────────────────
  const configs = data?.data ?? []
  const byProject: Record<number, { project: PaymentConfig['project']; configs: PaymentConfig[] }> = {}
  for (const cfg of configs) {
    if (!byProject[cfg.project_id]) {
      byProject[cfg.project_id] = { project: cfg.project, configs: [] }
    }
    byProject[cfg.project_id].configs.push(cfg)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard size={28} className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Payment Providers</h1>
            <p className="text-base-content/60 text-sm">
              Configurazione Stripe / PayPal / Crypto per ogni progetto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {successMsg && (
            <div className="alert alert-success alert-sm py-1 px-3 text-sm">
              <Check size={14} /> {successMsg}
            </div>
          )}
          <button
            className="btn btn-primary gap-2"
            onClick={() => { setEditingConfig(null); setModalOpen(true) }}
          >
            <Plus size={16} /> Aggiungi provider
          </button>
        </div>
      </div>

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
            {(projects as Project[]).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="form-control">
          <label className="label py-0"><span className="label-text text-xs">Provider</span></label>
          <select
            className="select select-bordered select-sm w-36"
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
          >
            <option value="">Tutti</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}
      {isError && (
        <div className="alert alert-error"><span>Impossibile caricare le configurazioni.</span></div>
      )}

      {/* Nessun risultato */}
      {!isLoading && !isError && configs.length === 0 && (
        <div className="alert alert-info">
          <span>Nessuna configurazione trovata. Aggiungi il primo provider.</span>
        </div>
      )}

      {/* Vista raggruppata per progetto */}
      {!isLoading && !isError && Object.entries(byProject).map(([pid, group]) => (
        <div key={pid} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-base">
              {group.project?.name ?? `Progetto #${pid}`}
            </h2>
            <span className="badge badge-ghost badge-sm">{group.configs.length} provider</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.configs.map((cfg) => (
              <ProviderCard
                key={cfg.id}
                config={cfg}
                onEdit={(c) => { setEditingConfig(c); setModalOpen(true) }}
                onToggle={(id, enabled) => toggleConfig.mutate({ id, is_enabled: enabled })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Modal */}
      {modalOpen && (
        <ConfigModal
          open={modalOpen}
          config={editingConfig}
          projects={projects as Project[]}
          onClose={() => { setModalOpen(false); setEditingConfig(null) }}
          onSave={handleSave}
          saving={saveConfig.isPending}
        />
      )}
    </div>
  )
}
