/**
 * ContractFields — EGI-HUB Frontend
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0
 * @purpose Sezione form dati contrattuali nel flusso Bootstrap
 */

import { FileText } from 'lucide-react';

interface ContractValues {
  contract_reference: string;
  contract_date: string;
  notes: string;
}

interface Props {
  values: ContractValues;
  errors: { contract_reference?: string };
  onChange: (field: string, value: string) => void;
}

export default function ContractFields({ values, errors, onChange }: Props) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-lg mb-4">
          <FileText className="w-5 h-5" aria-hidden="true" />
          Contratto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label" htmlFor="contract_reference">
              <span className="label-text font-medium">Riferimento Contratto *</span>
            </label>
            <input
              id="contract_reference"
              type="text"
              placeholder="es. CONTR-2026-001"
              className={`input input-bordered ${errors.contract_reference ? 'input-error' : ''}`}
              value={values.contract_reference}
              onChange={(e) => onChange('contract_reference', e.target.value)}
            />
            {errors.contract_reference && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.contract_reference}</span>
              </label>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="contract_date">
              <span className="label-text font-medium">Data Contratto</span>
            </label>
            <input
              id="contract_date"
              type="date"
              className="input input-bordered"
              value={values.contract_date}
              onChange={(e) => onChange('contract_date', e.target.value)}
            />
          </div>
        </div>
        <div className="form-control mt-4">
          <label className="label" htmlFor="notes">
            <span className="label-text font-medium">Note</span>
          </label>
          <textarea
            id="notes"
            className="textarea textarea-bordered h-24"
            placeholder="Note interne (non visibili al destinatario)"
            value={values.notes}
            onChange={(e) => onChange('notes', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
