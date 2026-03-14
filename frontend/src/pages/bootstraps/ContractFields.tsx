/**
 * ContractFields — EGI-HUB Frontend
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0
 * @purpose Sezione form dati contrattuali nel flusso Bootstrap
 */

import { FileText } from 'lucide-react';

interface ContractValues {
  notes: string;
}

interface Props {
  values: ContractValues;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export default function ContractFields({ values, onChange }: Props) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-lg mb-4">
          <FileText className="w-5 h-5" aria-hidden="true" />
          Note
        </h2>
        <div className="form-control">
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
