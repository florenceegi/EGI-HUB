/**
 * CreateBootstrap — EGI-HUB Frontend
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0
 * @purpose Form creazione Tenant Admin Bootstrap con validazione client-side
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Building2,
  CheckSquare,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { createBootstrap } from '@/services/bootstrapApi';
import { getProjects } from '@/services/projectApi';
import { getTenants } from '@/services/tenantApi';
import type { CreateBootstrapPayload } from '@/types/bootstrap';
import type { Project } from '@/types/project';
import type { Tenant } from '@/types/tenant';
import AdminReferentFields from './AdminReferentFields';
import ContractFields from './ContractFields';

// --- Helpers ---

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

// --- Main Component ---

export default function CreateBootstrap() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    system_project_id: string;
    tenant_mode: 'create_new' | 'use_existing';
    tenant_id: string;
    tenant_name: string;
    tenant_slug: string;
    contract_reference: string;
    contract_date: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    job_title: string;
    notes: string;
    confirmed: boolean;
  }>({
    system_project_id: '',
    tenant_mode: 'create_new',
    tenant_id: '',
    tenant_name: '',
    tenant_slug: '',
    contract_reference: '',
    contract_date: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    notes: '',
    confirmed: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const [p, t] = await Promise.all([getProjects(), getTenants()]);
        setProjects(p);
        setTenants(t);
      } catch {
        setLoadError('Errore nel caricamento di progetti e tenant');
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  const set = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleTenantNameChange = (value: string) => {
    set('tenant_name', value);
    set('tenant_slug', slugify(value));
  };

  const filteredTenants =
    form.system_project_id
      ? tenants
      : tenants;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.system_project_id) errors.system_project_id = 'Seleziona un progetto';
    if (!form.contract_reference.trim()) errors.contract_reference = 'Campo obbligatorio';
    if (!form.first_name.trim()) errors.first_name = 'Campo obbligatorio';
    if (!form.last_name.trim()) errors.last_name = 'Campo obbligatorio';
    if (!form.email.trim()) {
      errors.email = 'Campo obbligatorio';
    } else if (!validateEmail(form.email)) {
      errors.email = 'Email non valida';
    }
    if (!form.confirmed) errors.confirmed = 'Devi confermare prima di procedere';

    if (form.tenant_mode === 'create_new') {
      if (!form.tenant_name.trim()) errors.tenant_name = 'Campo obbligatorio';
      if (!form.tenant_slug.trim()) {
        errors.tenant_slug = 'Campo obbligatorio';
      } else if (!validateSlug(form.tenant_slug)) {
        errors.tenant_slug = 'Solo lettere minuscole, numeri e trattini';
      }
    } else {
      if (!form.tenant_id) errors.tenant_id = 'Seleziona un tenant';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload: CreateBootstrapPayload = {
      system_project_id: parseInt(form.system_project_id, 10),
      tenant_mode: form.tenant_mode,
      contract_reference: form.contract_reference.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      confirmed: form.confirmed,
    };

    if (form.tenant_mode === 'create_new') {
      payload.tenant_name = form.tenant_name.trim();
      payload.tenant_slug = form.tenant_slug.trim();
    } else {
      payload.tenant_id = parseInt(form.tenant_id, 10);
    }

    if (form.contract_date) payload.contract_date = form.contract_date;
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.job_title.trim()) payload.job_title = form.job_title.trim();
    if (form.notes.trim()) payload.notes = form.notes.trim();

    try {
      const created = await createBootstrap(payload);
      navigate(`/admin/bootstraps/${created.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Errore durante la creazione del bootstrap';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary" aria-label="Caricamento in corso" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/bootstraps')}
          className="btn btn-ghost btn-square"
          aria-label="Torna alla lista"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" aria-hidden="true" />
            Nuovo Tenant Admin Bootstrap
          </h1>
          <p className="text-base-content/60 mt-1">
            Crea un bootstrap e invia l'invito al referente admin
          </p>
        </div>
      </div>

      {/* Load error */}
      {loadError && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          <span>{loadError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Submit error */}
        {submitError && (
          <div className="alert alert-error" role="alert">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Section: Project */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">
              <Building2 className="w-5 h-5" aria-hidden="true" />
              Progetto
            </h2>
            <div className="form-control max-w-md">
              <label className="label" htmlFor="system_project_id">
                <span className="label-text font-medium">Progetto SaaS *</span>
              </label>
              <select
                id="system_project_id"
                className={`select select-bordered ${fieldErrors.system_project_id ? 'select-error' : ''}`}
                value={form.system_project_id}
                onChange={(e) => set('system_project_id', e.target.value)}
              >
                <option value="">Seleziona un progetto</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {fieldErrors.system_project_id && (
                <label className="label">
                  <span className="label-text-alt text-error">{fieldErrors.system_project_id}</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Section: Tenant */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">
              <Building2 className="w-5 h-5" aria-hidden="true" />
              Tenant
            </h2>

            {/* Radio tenant mode */}
            <div className="flex gap-6 mb-4">
              <label className="label cursor-pointer gap-3">
                <input
                  type="radio"
                  name="tenant_mode"
                  className="radio radio-primary"
                  checked={form.tenant_mode === 'create_new'}
                  onChange={() => set('tenant_mode', 'create_new')}
                />
                <span className="label-text font-medium">Crea nuovo tenant</span>
              </label>
              <label className="label cursor-pointer gap-3">
                <input
                  type="radio"
                  name="tenant_mode"
                  className="radio radio-primary"
                  checked={form.tenant_mode === 'use_existing'}
                  onChange={() => set('tenant_mode', 'use_existing')}
                />
                <span className="label-text font-medium">Usa tenant esistente</span>
              </label>
            </div>

            {form.tenant_mode === 'create_new' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label" htmlFor="tenant_name">
                    <span className="label-text font-medium">Nome Tenant *</span>
                  </label>
                  <input
                    id="tenant_name"
                    type="text"
                    placeholder="es. Comune di Firenze"
                    className={`input input-bordered ${fieldErrors.tenant_name ? 'input-error' : ''}`}
                    value={form.tenant_name}
                    onChange={(e) => handleTenantNameChange(e.target.value)}
                  />
                  {fieldErrors.tenant_name && (
                    <label className="label">
                      <span className="label-text-alt text-error">{fieldErrors.tenant_name}</span>
                    </label>
                  )}
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="tenant_slug">
                    <span className="label-text font-medium">Slug Tenant *</span>
                  </label>
                  <input
                    id="tenant_slug"
                    type="text"
                    placeholder="comune-di-firenze"
                    className={`input input-bordered font-mono ${fieldErrors.tenant_slug ? 'input-error' : ''}`}
                    value={form.tenant_slug}
                    onChange={(e) =>
                      set('tenant_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    aria-describedby="slug-help"
                  />
                  <label className="label" id="slug-help">
                    <span className="label-text-alt text-base-content/60">
                      Solo lettere minuscole, numeri e trattini
                    </span>
                  </label>
                  {fieldErrors.tenant_slug && (
                    <label className="label">
                      <span className="label-text-alt text-error">{fieldErrors.tenant_slug}</span>
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <div className="form-control max-w-md">
                <label className="label" htmlFor="tenant_id">
                  <span className="label-text font-medium">Tenant esistente *</span>
                </label>
                <select
                  id="tenant_id"
                  className={`select select-bordered ${fieldErrors.tenant_id ? 'select-error' : ''}`}
                  value={form.tenant_id}
                  onChange={(e) => set('tenant_id', e.target.value)}
                >
                  <option value="">Seleziona un tenant</option>
                  {filteredTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
                {fieldErrors.tenant_id && (
                  <label className="label">
                    <span className="label-text-alt text-error">{fieldErrors.tenant_id}</span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section: Contratto */}
        <ContractFields
          values={{
            contract_reference: form.contract_reference,
            contract_date: form.contract_date,
            notes: form.notes,
          }}
          errors={{ contract_reference: fieldErrors.contract_reference }}
          onChange={set}
        />

        {/* Section: Referente Admin */}
        <AdminReferentFields
          values={{
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
            job_title: form.job_title,
          }}
          errors={{
            first_name: fieldErrors.first_name,
            last_name: fieldErrors.last_name,
            email: fieldErrors.email,
          }}
          onChange={set}
        />

        {/* Section: Conferma */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">
              <CheckSquare className="w-5 h-5" aria-hidden="true" />
              Conferma
            </h2>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className={`checkbox checkbox-primary ${fieldErrors.confirmed ? 'checkbox-error' : ''}`}
                  checked={form.confirmed}
                  onChange={(e) => set('confirmed', e.target.checked)}
                  aria-describedby="confirm-help"
                />
                <span className="label-text font-medium" id="confirm-help">
                  Confermo che questo nominativo è autorizzato alla creazione dell'account admin
                  e che i dati inseriti sono corretti e verificati.
                </span>
              </label>
              {fieldErrors.confirmed && (
                <p className="text-error text-sm mt-1 ml-10">{fieldErrors.confirmed}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/admin/bootstraps')}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="btn btn-primary gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <span className="loading loading-spinner loading-sm" aria-label="Creazione in corso" />
            ) : (
              <Save className="w-5 h-5" aria-hidden="true" />
            )}
            Crea Bootstrap e Invia Invito
          </button>
        </div>
      </form>
    </div>
  );
}
