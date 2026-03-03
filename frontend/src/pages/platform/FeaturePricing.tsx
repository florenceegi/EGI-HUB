import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Loader2, AlertCircle, Edit2, Check, X, Trash2, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
import api from '../../services/api';

// === TYPES — allineati ai campi reali di ai_feature_pricing ===

interface AiFeaturePricing {
  id: number;
  feature_code: string;
  feature_name: string;
  feature_description: string | null;
  feature_category: string;
  bundle_type: string | null;
  cost_egili: number;
  cost_fiat_eur: string | null;
  is_active: boolean;
  is_free: boolean;
  is_bundle: boolean;
  is_featured: boolean;
  feature_parameters: Record<string, unknown> | null;
  benefits: string[] | null;
  display_order: number;
  total_purchases: number;
  admin_notes: string | null;
  ai_tokens_included: number | null;
  ai_tokens_bonus_percentage: number;
}

interface ApiResponse {
  success: boolean;
  data: AiFeaturePricing[];
  total: number;
}

// === LABEL MAPS ===

const CATEGORY_LABELS: Record<string, string> = {
  ai_services: 'Servizi AI',
  platform_services: 'Servizi Piattaforma',
  premium_visibility: 'Visibilità Premium',
  governance: 'Governance',
};

const BUNDLE_LABELS: Record<string, string> = {
  credit_package: 'Pacchetto Crediti',
  subscription: 'Abbonamento',
  one_time: 'Singolo Acquisto',
};

const labelCategory = (key: string) => CATEGORY_LABELS[key] ?? key;
const labelBundle = (key: string) => BUNDLE_LABELS[key] ?? key;

// === COMPONENT ===

export default function FeaturePricing() {
  const queryClient = useQueryClient();

  // Filtri
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBundleType, setFilterBundleType] = useState('');
  const [filterActive, setFilterActive] = useState<'' | '1' | '0'>('');

  // Edit inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ cost_egili: string; cost_fiat_eur: string; ai_tokens_included: string; ai_tokens_bonus_percentage: string }>({
    cost_egili: '',
    cost_fiat_eur: '',
    ai_tokens_included: '',
    ai_tokens_bonus_percentage: '0',
  });

  // Modal dettaglio (feature_name, benefits, max_egis)
  const [detailItem, setDetailItem] = useState<AiFeaturePricing | null>(null);
  const [detailName, setDetailName] = useState('');
  const [detailBenefits, setDetailBenefits] = useState('');
  const [detailMaxEgis, setDetailMaxEgis] = useState('');

  // === QUERY ===
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['platform-pricing', filterCategory, filterBundleType, filterActive],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterCategory) params.set('category', filterCategory);
      if (filterBundleType) params.set('bundle_type', filterBundleType);
      if (filterActive !== '') params.set('is_active', filterActive);
      return api.get('/superadmin/platform/pricing?' + params.toString()).then(res => res.data);
    },
  });

  // === MUTATION: toggle is_active ===
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      api.put('/superadmin/platform/pricing/' + id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-pricing'] }),
  });

  // === MUTATION: update prezzi ===
  const updateMutation = useMutation({
    mutationFn: ({ id, cost_egili, cost_fiat_eur, ai_tokens_included, ai_tokens_bonus_percentage }: { id: number; cost_egili: number; cost_fiat_eur: number | null; ai_tokens_included: number | null; ai_tokens_bonus_percentage: number }) =>
      api.put('/superadmin/platform/pricing/' + id, { cost_egili, cost_fiat_eur, ai_tokens_included, ai_tokens_bonus_percentage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-pricing'] });
      setEditingId(null);
    },
  });

  // === MUTATION: update dettaglio (name, benefits, feature_parameters) ===
  const detailMutation = useMutation({
    mutationFn: ({ id, feature_name, benefits, feature_parameters }: {
      id: number;
      feature_name: string;
      benefits: string[];
      feature_parameters: Record<string, unknown>;
    }) => api.put('/superadmin/platform/pricing/' + id, { feature_name, benefits, feature_parameters }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-pricing'] });
      setDetailItem(null);
    },
  });

  // === MUTATION: delete ===
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete('/superadmin/platform/pricing/' + id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-pricing'] }),
  });

  // === HANDLERS ===
  const startEdit = (item: AiFeaturePricing) => {
    setEditingId(item.id);
    setEditValues({
      cost_egili: String(item.cost_egili ?? 0),
      cost_fiat_eur: item.cost_fiat_eur ?? '',
      ai_tokens_included: item.ai_tokens_included != null ? String(item.ai_tokens_included) : '',
      ai_tokens_bonus_percentage: String(item.ai_tokens_bonus_percentage ?? 0),
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id: number) => {
    const egili = parseInt(editValues.cost_egili, 10);
    const eur = editValues.cost_fiat_eur !== '' ? parseFloat(editValues.cost_fiat_eur) : null;
    const tokens = editValues.ai_tokens_included !== '' ? parseInt(editValues.ai_tokens_included, 10) : null;
    const bonus = parseInt(editValues.ai_tokens_bonus_percentage, 10);
    if (isNaN(egili) || egili < 0) return;
    if (tokens !== null && isNaN(tokens)) return;
    updateMutation.mutate({ id, cost_egili: egili, cost_fiat_eur: eur, ai_tokens_included: tokens, ai_tokens_bonus_percentage: isNaN(bonus) ? 0 : bonus });
  };

  const openDetail = (item: AiFeaturePricing) => {
    setDetailItem(item);
    setDetailName(item.feature_name);
    const rawBenefits = item.benefits;
    if (Array.isArray(rawBenefits)) {
      // Array di stringhe → join (formato corretto)
      setDetailBenefits((rawBenefits as unknown[]).filter(v => typeof v === 'string').join('\n'));
    } else if (rawBenefits && typeof rawBenefits === 'object') {
      // Oggetto associativo (formato legacy) → mostra come JSON per editing
      setDetailBenefits(Object.entries(rawBenefits).map(([k, v]) => `${k}: ${v}`).join('\n'));
    } else {
      setDetailBenefits('');
    }
    const params = item.feature_parameters ?? {};
    setDetailMaxEgis(params['max_egis'] != null ? String(params['max_egis']) : '');
  };

  const saveDetail = () => {
    if (!detailItem) return;
    const benefits = detailBenefits.split('\n').map(s => s.trim()).filter(Boolean);
    const existingParams = detailItem.feature_parameters ?? {};
    const feature_parameters = detailMaxEgis !== ''
      ? { ...existingParams, max_egis: parseInt(detailMaxEgis, 10) }
      : { ...existingParams, max_egis: null };
    detailMutation.mutate({ id: detailItem.id, feature_name: detailName, benefits, feature_parameters });
  };

  const handleDelete = (item: AiFeaturePricing) => {
    if (!window.confirm('Eliminare "' + item.feature_name + '"?\nQuesta operazione è irreversibile (soft delete).')) return;
    deleteMutation.mutate(item.id);
  };

  // Categorie e bundle disponibili dai dati
  const categories = Array.from(new Set((data?.data ?? []).map(i => i.feature_category))).sort();
  const bundleTypes = Array.from(new Set((data?.data ?? []).map(i => i.bundle_type).filter(Boolean))).sort() as string[];

  // === RENDER ===
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle className="w-6 h-6" />
        <span>Errore nel caricamento dei prezzi. Assicurati che il backend EGI-HUB sia attivo.</span>
      </div>
    );
  }

  const items = data?.data ?? [];

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Feature Pricing</h1>
          <p className="text-base-content/60">
            Prezzi e attivazione pacchetti AI — {data?.total ?? 0} record totali
          </p>
        </div>
      </div>

      {/* Filtri */}
      <div className="flex flex-wrap gap-3">
        <select
          className="select select-bordered select-sm"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="">Tutte le categorie</option>
          {categories.map(c => <option key={c} value={c}>{labelCategory(c)}</option>)}
        </select>

        <select
          className="select select-bordered select-sm"
          value={filterBundleType}
          onChange={e => setFilterBundleType(e.target.value)}
        >
          <option value="">Tutti i bundle</option>
          {bundleTypes.map(b => <option key={b} value={b}>{labelBundle(b)}</option>)}
        </select>

        <select
          className="select select-bordered select-sm"
          value={filterActive}
          onChange={e => setFilterActive(e.target.value as '' | '1' | '0')}
        >
          <option value="">Tutti gli stati</option>
          <option value="1">Attivi</option>
          <option value="0">Inattivi</option>
        </select>

        {(filterCategory || filterBundleType || filterActive !== '') && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setFilterCategory(''); setFilterBundleType(''); setFilterActive(''); }}
          >
            <X className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      {/* Tabella */}
      <div className="shadow-xl card bg-base-100">
        <div className="p-0 card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Categoria</th>
                  <th>AI Token</th>
                  <th>Bonus %</th>
                  <th>Egili costo</th>
                  <th>EUR</th>
                  <th>Attivo</th>
                  <th>Acquisti</th>
                  <th className="text-right">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? items.map((item) => (
                  <tr key={item.id} className={!item.is_active ? 'opacity-50' : ''}>

                    {/* Feature */}
                    <td>
                      <div className="font-semibold">{item.feature_name}</div>
                      {item.feature_description && (
                        <div className="text-xs text-base-content/50 mt-0.5">{item.feature_description}</div>
                      )}
                      {item.bundle_type && (
                        <span className="mt-1 badge badge-outline badge-xs">{labelBundle(item.bundle_type)}</span>
                      )}
                    </td>

                    {/* Categoria */}
                    <td>
                      <span className="badge badge-ghost badge-sm">{labelCategory(item.feature_category)}</span>
                    </td>

                    {/* AI Token inclusi — edit inline */}
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          className="w-28 input input-bordered input-xs"
                          value={editValues.ai_tokens_included}
                          placeholder="—"
                          onChange={e => setEditValues(v => ({ ...v, ai_tokens_included: e.target.value }))}
                        />
                      ) : (
                        item.ai_tokens_included != null ? (
                          <span className="font-semibold text-blue-500">
                            {item.ai_tokens_included.toLocaleString('it-IT')}
                          </span>
                        ) : (
                          <span className="badge badge-warning badge-xs">Da conf.</span>
                        )
                      )}
                    </td>

                    {/* Bonus % — edit inline */}
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-16 input input-bordered input-xs"
                          value={editValues.ai_tokens_bonus_percentage}
                          onChange={e => setEditValues(v => ({ ...v, ai_tokens_bonus_percentage: e.target.value }))}
                        />
                      ) : (
                        item.ai_tokens_bonus_percentage > 0 ? (
                          <span className="text-green-500 font-semibold">+{item.ai_tokens_bonus_percentage}%</span>
                        ) : (
                          <span className="text-base-content/30">—</span>
                        )
                      )}
                    </td>

                    {/* Egili costo — edit inline */}
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          className="w-24 input input-bordered input-xs"
                          value={editValues.cost_egili}
                          onChange={e => setEditValues(v => ({ ...v, cost_egili: e.target.value }))}
                        />
                      ) : (
                        <span className="font-semibold text-yellow-600">
                          {item.cost_egili ?? '—'}
                        </span>
                      )}
                    </td>

                    {/* EUR — edit inline */}
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 input input-bordered input-xs"
                          value={editValues.cost_fiat_eur}
                          placeholder="—"
                          onChange={e => setEditValues(v => ({ ...v, cost_fiat_eur: e.target.value }))}
                        />
                      ) : (
                        <span className="font-semibold">
                          {item.cost_fiat_eur ? '€' + parseFloat(item.cost_fiat_eur).toFixed(2) : '—'}
                        </span>
                      )}
                    </td>

                    {/* Toggle is_active inline */}
                    <td>
                      <button
                        className="gap-1 btn btn-ghost btn-xs"
                        disabled={toggleMutation.isPending}
                        onClick={() => toggleMutation.mutate({ id: item.id, is_active: !item.is_active })}
                        title={item.is_active ? 'Disattiva' : 'Attiva'}
                      >
                        {item.is_active
                          ? <ToggleRight className="w-5 h-5 text-success" />
                          : <ToggleLeft className="w-5 h-5 text-error" />
                        }
                        <span className="text-xs">{item.is_active ? 'Attivo' : 'Off'}</span>
                      </button>
                    </td>

                    {/* Acquisti totali */}
                    <td>
                      <span className="text-sm text-base-content/60">{item.total_purchases ?? 0}</span>
                    </td>

                    {/* Azioni */}
                    <td className="text-right">
                      {editingId === item.id ? (
                        <div className="flex justify-end gap-1">
                          <button
                            className="btn btn-success btn-xs"
                            disabled={updateMutation.isPending}
                            onClick={() => saveEdit(item.id)}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button className="btn btn-ghost btn-xs" onClick={cancelEdit}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => startEdit(item)}
                            title="Modifica prezzi"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-info"
                            onClick={() => openDetail(item)}
                            title="Modifica nome/benefits/max_egis"
                          >
                            <Settings className="w-3 h-3" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(item)}
                            title="Elimina"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-base-content/30" />
                      <p className="text-base-content/60">Nessuna feature trovata con i filtri selezionati</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

      {/* MODAL DETTAGLIO — overlay Tailwind puro, nessuna dipendenza DaisyUI modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setDetailItem(null)} />

          {/* Box */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl shadow-2xl p-6 flex flex-col gap-5" style={{ backgroundColor: '#ffffff', color: '#111827' }}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Modifica dettagli piano</h3>
                <p className="text-xs font-mono mt-1" style={{ color: '#6b7280' }}>
                  <span className="font-sans not-italic" style={{ color: '#9ca3af' }}>Codice interno: </span>
                  {detailItem.feature_code}
                </p>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                style={{ color: '#6b7280' }}
                onClick={() => setDetailItem(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Campi */}
            <div className="flex flex-col gap-4">
              {/* Nome piano */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Nome piano</label>
                <input
                  type="text"
                    className="w-full rounded-lg px-3 py-2 text-sm"
                    style={{ border: '1px solid #d1d5db', backgroundColor: '#f9fafb', color: '#111827' }}
                  value={detailName}
                  onChange={e => setDetailName(e.target.value)}
                />
              </div>

              {/* max_egis — solo platform_services */}
              {detailItem.feature_category === 'platform_services' && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-semibold">Max EGI per collezione</label>
                    <span className="text-xs" style={{ color: '#9ca3af' }}>vuoto = illimitato</span>
                  </div>
                  <input
                      type="number"
                      min="1"
                      placeholder="es. 19"
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={{ border: '1px solid #d1d5db', backgroundColor: '#f9fafb', color: '#111827' }}
                      value={detailMaxEgis}
                      onChange={e => setDetailMaxEgis(e.target.value)}
                    />
                </div>
              )}

              {/* Benefits */}
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-semibold">Benefits</label>
                    <span className="text-xs" style={{ color: '#9ca3af' }}>una riga per voce</span>
                </div>
                <textarea
                  rows={6}
                  className="w-full rounded-lg px-3 py-2 font-mono text-sm resize-y"
                  style={{ border: '1px solid #d1d5db', backgroundColor: '#f9fafb', color: '#111827' }}
                  placeholder={"Fino a 19 EGI per collezione\nAnalytics completo\nSupporto prioritario"}
                  value={detailBenefits}
                  onChange={e => setDetailBenefits(e.target.value)}
                />
              </div>
            </div>

            {/* Azioni */}
            <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid #e5e7eb' }}>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                style={{ color: '#374151' }}
                onClick={() => setDetailItem(null)}>Annulla</button>
              <button
                className="btn btn-primary"
                disabled={detailMutation.isPending || !detailName.trim()}
                onClick={saveDetail}
              >
                {detailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
