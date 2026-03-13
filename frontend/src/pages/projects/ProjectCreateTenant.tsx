import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Send, Users, FileText, CheckCircle } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { createBootstrap } from '@/services/bootstrapApi';

export default function ProjectCreateTenant() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { projects } = useProject();
  const currentProject = projects.find(p => p.slug === slug);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tenant_name: '',
    tenant_slug: '',
    contract_reference: '',
    contract_date: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Auto-genera slug dal nome tenant
      if (field === 'tenant_name') {
        next.tenant_slug = value.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) {
      setError('Progetto non trovato. Ricarica la pagina.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await createBootstrap({
        system_project_id: currentProject.id,
        tenant_mode: 'create_new',
        tenant_name: formData.tenant_name,
        tenant_slug: formData.tenant_slug,
        contract_reference: formData.contract_reference,
        contract_date: formData.contract_date || undefined,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || undefined,
        job_title: formData.job_title || undefined,
        confirmed: true,
      });
      setInvitedEmail(formData.email);
      setDone(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Errore durante la creazione del tenant.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="card bg-base-100 shadow-sm text-center">
          <div className="card-body items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="card-title text-xl">Tenant creato!</h2>
            <p className="text-base-content/70">
              Invito inviato a <strong>{invitedEmail}</strong>.<br />
              L'amministratore riceverà un'email per impostare la password e attivare l'account.
            </p>
            <div className="card-actions mt-4">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/project/${slug}/tenants`)}
              >
                Torna alla lista tenant
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/project/${slug}/tenants`)} className="btn btn-ghost btn-square">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Nuovo Tenant
          </h1>
          <p className="text-base-content/60 mt-1">
            Crea un nuovo tenant e invita il suo amministratore
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tenant Info */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">
              <Building2 className="w-5 h-5" />
              Informazioni Tenant
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Nome Tenant *</span>
                </label>
                <input
                  type="text"
                  placeholder="es. Comune di Firenze"
                  className="input input-bordered"
                  value={formData.tenant_name}
                  onChange={(e) => handleChange('tenant_name', e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Slug *</span>
                </label>
                <input
                  type="text"
                  placeholder="comune-di-firenze"
                  className="input input-bordered font-mono"
                  value={formData.tenant_slug}
                  onChange={(e) => handleChange('tenant_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contract */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">
              <FileText className="w-5 h-5" />
              Riferimento Contrattuale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Numero Contratto *</span>
                </label>
                <input
                  type="text"
                  placeholder="es. CNTR-2026-001"
                  className="input input-bordered"
                  value={formData.contract_reference}
                  onChange={(e) => handleChange('contract_reference', e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Data Contratto</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={formData.contract_date}
                  onChange={(e) => handleChange('contract_date', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Admin */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">
              <Users className="w-5 h-5" />
              Amministratore Tenant
            </h2>
            <div className="alert alert-info mb-4">
              <span className="text-sm">Verrà inviata un'email con il link di attivazione. L'admin potrà impostare la propria password.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Nome *</span>
                </label>
                <input
                  type="text"
                  placeholder="Mario"
                  className="input input-bordered"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Cognome *</span>
                </label>
                <input
                  type="text"
                  placeholder="Rossi"
                  className="input input-bordered"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email *</span>
                </label>
                <input
                  type="email"
                  placeholder="mario.rossi@comune.fi.it"
                  className="input input-bordered"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Telefono</span>
                </label>
                <input
                  type="tel"
                  placeholder="+39 055 000000"
                  className="input input-bordered"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Ruolo / Qualifica</span>
                </label>
                <input
                  type="text"
                  placeholder="es. Responsabile IT"
                  className="input input-bordered"
                  value={formData.job_title}
                  onChange={(e) => handleChange('job_title', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(`/project/${slug}/tenants`)}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="btn btn-primary gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Send className="w-5 h-5" />
            )}
            Crea e Invia Invito
          </button>
        </div>
      </form>
    </div>
  );
}
