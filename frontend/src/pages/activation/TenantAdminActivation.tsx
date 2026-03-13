/**
 * TenantAdminActivation — EGI-HUB Frontend
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0
 * @purpose Pagina pubblica di attivazione account Tenant Admin tramite token
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, KeyRound, CheckCircle, LogIn } from 'lucide-react';
import { getActivationInfo, activateBootstrap } from '@/services/bootstrapApi';
import type { ActivationInfo, ActivateBootstrapPayload } from '@/types/bootstrap';

// --- Step types ---

type Step = 'loading' | 'error' | 'already_activated' | 'revoked' | 'form' | 'success';

// --- Sub: ErrorCard ---

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body items-center text-center gap-4">
          <AlertTriangle className="w-14 h-14 text-error" aria-hidden="true" />
          <h1 className="card-title text-xl">{title}</h1>
          <p className="text-base-content/70">{message}</p>
          <div className="card-actions mt-2">
            <Link to="/login" className="btn btn-primary gap-2">
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Vai al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub: SuccessCard ---

function SuccessCard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body items-center text-center gap-4">
          <CheckCircle className="w-14 h-14 text-success" aria-hidden="true" />
          <h1 className="card-title text-xl">Account attivato con successo</h1>
          <p className="text-base-content/70">
            Il tuo account amministratore è ora attivo. Accedi per iniziare.
          </p>
          <div className="card-actions mt-2">
            <Link to="/login" className="btn btn-primary gap-2">
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Accedi ora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function TenantAdminActivation() {
  const { token } = useParams<{ token: string }>();
  const [step, setStep] = useState<Step>('loading');
  const [info, setInfo] = useState<ActivationInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmation?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMsg('Token mancante nell\'URL');
      setStep('error');
      return;
    }

    (async () => {
      try {
        const data = await getActivationInfo(token);
        const status = data.bootstrap.status;

        if (status === 'revoked') {
          setStep('revoked');
          return;
        }
        if (status === 'activated') {
          setStep('already_activated');
          return;
        }
        if (status === 'suspended') {
          setErrorMsg('Questo invito è stato sospeso. Contatta il tuo referente.');
          setStep('error');
          return;
        }

        // Controlla scadenza
        if (data.bootstrap.invitation_expires_at) {
          const expires = new Date(data.bootstrap.invitation_expires_at);
          if (expires < new Date()) {
            setErrorMsg('Il link di attivazione è scaduto. Richiedi un nuovo invito al tuo referente.');
            setStep('error');
            return;
          }
        }

        setInfo(data);
        setStep('form');
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setErrorMsg('Link non valido o scaduto. Contatta il tuo referente per ricevere un nuovo invito.');
        } else {
          setErrorMsg('Errore durante il caricamento. Riprova più tardi.');
        }
        setStep('error');
      }
    })();
  }, [token]);

  const validate = (): boolean => {
    const errors: { password?: string; confirmation?: string } = {};
    if (!password) {
      errors.password = 'La password è obbligatoria';
    } else if (password.length < 8) {
      errors.password = 'La password deve essere di almeno 8 caratteri';
    }
    if (!passwordConfirmation) {
      errors.confirmation = 'Conferma la password';
    } else if (password !== passwordConfirmation) {
      errors.confirmation = 'Le password non corrispondono';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload: ActivateBootstrapPayload = {
      password,
      password_confirmation: passwordConfirmation,
    };

    try {
      await activateBootstrap(token, payload);
      setStep('success');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Errore durante l\'attivazione. Riprova.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render per step ---

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" aria-label="Verifica del link in corso" />
      </div>
    );
  }

  if (step === 'success') {
    return <SuccessCard />;
  }

  if (step === 'already_activated') {
    return (
      <ErrorCard
        title="Account già attivato"
        message="Questo account è già stato attivato in precedenza. Puoi accedere direttamente."
      />
    );
  }

  if (step === 'revoked') {
    return (
      <ErrorCard
        title="Invito revocato"
        message="Questo invito è stato revocato. Contatta il tuo referente per ricevere assistenza."
      />
    );
  }

  if (step === 'error') {
    return (
      <ErrorCard
        title="Link non valido"
        message={errorMsg || 'Questo link non è valido o è scaduto.'}
      />
    );
  }

  // step === 'form'
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-12">
      <div className="card bg-base-100 shadow-xl w-full max-w-lg">
        <div className="card-body gap-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <ShieldCheck className="w-14 h-14 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-bold">Attiva il tuo account</h1>
            {info && (
              <div className="bg-base-200 rounded-lg p-4 w-full text-left mt-2">
                <p className="text-sm text-base-content/70 mb-1">Stai attivando l'account admin per</p>
                <p className="font-bold text-base">{info.tenant.name}</p>
                <p className="text-sm text-base-content/60">
                  su <span className="font-medium">{info.project.name}</span>
                </p>
                <p className="text-sm text-base-content/60 mt-2">
                  Account:{' '}
                  <span className="font-medium">
                    {info.bootstrap.first_name_snapshot} {info.bootstrap.last_name_snapshot}
                  </span>{' '}
                  — {info.bootstrap.email_snapshot}
                </p>
              </div>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="alert alert-error" role="alert">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text font-medium">Password *</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="Minimo 8 caratteri"
                className={`input input-bordered ${fieldErrors.password ? 'input-error' : ''}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                autoComplete="new-password"
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              />
              {fieldErrors.password && (
                <label className="label" id="password-error">
                  <span className="label-text-alt text-error">{fieldErrors.password}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label" htmlFor="password_confirmation">
                <span className="label-text font-medium">Conferma Password *</span>
              </label>
              <input
                id="password_confirmation"
                type="password"
                placeholder="Ripeti la password"
                className={`input input-bordered ${fieldErrors.confirmation ? 'input-error' : ''}`}
                value={passwordConfirmation}
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, confirmation: '' }));
                }}
                autoComplete="new-password"
                aria-describedby={fieldErrors.confirmation ? 'confirm-error' : undefined}
              />
              {fieldErrors.confirmation && (
                <label className="label" id="confirm-error">
                  <span className="label-text-alt text-error">{fieldErrors.confirmation}</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full gap-2 mt-2"
              disabled={submitting}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm" aria-label="Attivazione in corso" />
              ) : (
                <KeyRound className="w-5 h-5" aria-hidden="true" />
              )}
              Attiva Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
