import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { createBootstrap } from '@/services/bootstrapApi';

export default function ProjectCreateAdminBootstrap() {
  const { slug, tenantId } = useParams<{ slug: string; tenantId: string }>();
  const navigate = useNavigate();
  const { projects } = useProject();
  const currentProject = projects.find(p => p.slug === slug);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !tenantId) {
      setError('Dati mancanti. Ricarica la pagina.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await createBootstrap({
        system_project_id: currentProject.id,
        tenant_mode: 'use_existing',
        tenant_id: parseInt(tenantId, 10),
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
      const msg = err?.response?.data?.message || 'Errore durante la creazione dell\'admin.';
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
            <h2 className="card-title text-xl">Admin creato!</h2>
            <p className="text-base-content/70">
              Invito inviato a <strong>{invitedEmail}</strong>.<br />
              L'amministratore riceverà un'email per attivare il proprio account.
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
            <UserPlus className="w-8 h-8 text-primary" />
            Crea Amministratore
          </h1>
          <p className="text-base-content/60 mt-1">
            Assegna un amministratore a questo tenant
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Admin */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">
              <UserPlus className="w-5 h-5" />
              Dati Amministratore
            </h2>
            <div className="alert alert-info mb-4">
              <span className="text-sm">L'amministratore riceverà un'email con il link di attivazione e potrà impostare la propria password.</span>
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
            Invia Invito
          </button>
        </div>
      </form>
    </div>
  );
}
