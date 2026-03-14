import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, MoreVertical, RefreshCw, CheckCircle, XCircle, Clock, UserPlus, AlertTriangle, FileText } from 'lucide-react';
import { getProjectTenants, type ProjectTenant } from '@/services/projectApi';

export default function ProjectTenantsList() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<ProjectTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchTenants(); }, [slug]);

  const fetchTenants = async () => {
    if (!slug) return;
    try {
      setError(null);
      const data = await getProjectTenants(slug);
      setTenants(data);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError('Errore nel caricamento dei tenant');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => { setRefreshing(true); fetchTenants(); };

  const getStatusBadge = (status: ProjectTenant['status']) => {
    switch (status) {
      case 'active':    return <span className="badge badge-success gap-1"><CheckCircle className="w-3 h-3" />Attivo</span>;
      case 'trial':     return <span className="badge badge-info gap-1"><Clock className="w-3 h-3" />Trial</span>;
      case 'suspended': return <span className="badge badge-error gap-1"><XCircle className="w-3 h-3" />Sospeso</span>;
      default:          return <span className="badge badge-ghost gap-1"><Clock className="w-3 h-3" />Inattivo</span>;
    }
  };

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Tenant
          </h1>
          <p className="text-base-content/60 mt-1">
            {tenants.length} tenant registrati
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-ghost gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Aggiorna
          </button>
          <Link to={`/project/${slug}/tenants/create`} className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nuovo Tenant
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
            <input
              type="text"
              placeholder="Cerca tenant per nome o slug..."
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Contatto</th>
                <th>Stato</th>
                <th>Piano</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tenant) => (
                <tr key={tenant.id} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="rounded-lg w-10 h-10 bg-primary/10 text-primary flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{tenant.name}</div>
                        <div className="text-sm text-base-content/60 font-mono">{tenant.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {tenant.contact_name ? (
                      <div>
                        <div className="text-sm">{tenant.contact_name}</div>
                        <div className="text-xs text-base-content/60">{tenant.contact_email}</div>
                      </div>
                    ) : (
                      <span className="text-base-content/40 text-sm">—</span>
                    )}
                  </td>
                  <td>{getStatusBadge(tenant.status)}</td>
                  <td>
                    <span className="badge badge-ghost">{tenant.plan || 'Nessun piano'}</span>
                  </td>
                  <td>
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-sm btn-square">
                        <MoreVertical className="w-4 h-4" />
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                          <button
                            className="flex items-center gap-2 text-primary"
                            onClick={() => navigate(`/project/${slug}/tenants/${tenant.id}/admin/create`)}
                          >
                            <UserPlus className="w-4 h-4" />
                            Crea Admin
                          </button>
                        </li>
                        <li>
                          <button
                            className="flex items-center gap-2"
                            onClick={() => navigate(`/project/${slug}/tenants/${tenant.id}/contracts`)}
                          >
                            <FileText className="w-4 h-4" />
                            Contratti
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-base-content/20" />
            <p className="mt-4 text-base-content/60">
              {tenants.length === 0 ? 'Nessun tenant registrato' : 'Nessun tenant trovato'}
            </p>
            {tenants.length === 0 && (
              <Link to={`/project/${slug}/tenants/create`} className="btn btn-primary btn-sm mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Aggiungi il primo tenant
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
