/**
 * AdminReferentFields — EGI-HUB Frontend
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0
 * @purpose Sezione form campi del Referente Amministratore nel flusso Bootstrap
 */

import { Users } from 'lucide-react';

interface AdminReferentValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
}

interface FieldErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface Props {
  values: AdminReferentValues;
  errors: FieldErrors;
  onChange: (field: string, value: string) => void;
}

export default function AdminReferentFields({ values, errors, onChange }: Props) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-lg mb-4">
          <Users className="w-5 h-5" aria-hidden="true" />
          Referente Amministratore
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label" htmlFor="first_name">
              <span className="label-text font-medium">Nome *</span>
            </label>
            <input
              id="first_name"
              type="text"
              placeholder="Mario"
              className={`input input-bordered ${errors.first_name ? 'input-error' : ''}`}
              value={values.first_name}
              onChange={(e) => onChange('first_name', e.target.value)}
            />
            {errors.first_name && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.first_name}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label" htmlFor="last_name">
              <span className="label-text font-medium">Cognome *</span>
            </label>
            <input
              id="last_name"
              type="text"
              placeholder="Rossi"
              className={`input input-bordered ${errors.last_name ? 'input-error' : ''}`}
              value={values.last_name}
              onChange={(e) => onChange('last_name', e.target.value)}
            />
            {errors.last_name && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.last_name}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label" htmlFor="email">
              <span className="label-text font-medium">Email *</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@comune.fi.it"
              className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
              value={values.email}
              onChange={(e) => onChange('email', e.target.value)}
              aria-describedby="email-help"
            />
            <label className="label" id="email-help">
              <span className="label-text-alt text-base-content/60">
                Riceverà il link di attivazione a questo indirizzo
              </span>
            </label>
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.email}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label" htmlFor="phone">
              <span className="label-text font-medium">Telefono</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+39 055 000 0000"
              className="input input-bordered"
              value={values.phone}
              onChange={(e) => onChange('phone', e.target.value)}
            />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label" htmlFor="job_title">
              <span className="label-text font-medium">Ruolo / Qualifica</span>
            </label>
            <input
              id="job_title"
              type="text"
              placeholder="es. Responsabile Sistemi Informativi"
              className="input input-bordered"
              value={values.job_title}
              onChange={(e) => onChange('job_title', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
