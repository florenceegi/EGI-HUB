/**
 * Project Maintenance Page
 *
 * Operazioni di manutenzione distruttive su un progetto remoto.
 * Attualmente: EGI Asset Purge (S3 + Pinata IPFS + EgiTrait + DB hard-delete).
 *
 * Sicurezze implementate:
 *  1. Accessibile solo ai SuperAdmin con 2FA verificato (middleware backend)
 *  2. Sempre mostrare il Dry-Run prima di abilitare l'esecuzione reale
 *  3. Conferma tipizzata obbligatoria ("PURGE ALL EGI") prima di procedere
 *  4. Backend valida nuovamente il token di conferma
 *  5. Log backend con IP, user-agent e admin_id per ogni esecuzione
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Trash2,
  FlaskConical,
  Terminal,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { getProjects } from '../../services/projectApi';
import { egiPurgeDryRun, egiPurgeExecute } from '../../services/projectApi';
import { useToast } from '../../contexts/ToastContext';
import type { Project } from '../../types/project';

const CONFIRM_TOKEN = 'PURGE ALL EGI';

export default function ProjectMaintenance() {
  const { slug } = useParams<{ slug: string }>();
  const { success: toastSuccess, error: toastError } = useToast();

  const [project, setProject]               = useState<Project | null>(null);
  const [loadingProject, setLoadingProject]  = useState(true);

  // Dry-run state
  const [dryRunLoading, setDryRunLoading]    = useState(false);
  const [dryRunOutput, setDryRunOutput]      = useState<string | null>(null);
  const [dryRunSuccess, setDryRunSuccess]    = useState<boolean | null>(null);
  const [dryRunDone, setDryRunDone]          = useState(false);

  // Execute state
  const [confirmInput, setConfirmInput]      = useState('');
  const [executeLoading, setExecuteLoading]  = useState(false);
  const [executeOutput, setExecuteOutput]    = useState<string | null>(null);
  const [executeSuccess, setExecuteSuccess]  = useState<boolean | null>(null);
  const [executeDone, setExecuteDone]        = useState(false);

  const outputRef = useRef<HTMLPreElement>(null);

  // ── Load project ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    setLoadingProject(true);
    getProjects()
      .then((projects) => {
        const found = projects.find((p: Project) => p.slug === slug);
        setProject(found ?? null);
      })
      .catch(() => toastError('Impossibile caricare i dati del progetto.'))
      .finally(() => setLoadingProject(false));
  }, [slug]);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [dryRunOutput, executeOutput]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDryRun = async () => {
    if (!project) return;
    setDryRunLoading(true);
    setDryRunOutput(null);
    setDryRunSuccess(null);
    setDryRunDone(false);
    // Reset execute state ogni volta che si fa un nuovo dry-run
    setExecuteOutput(null);
    setExecuteSuccess(null);
    setExecuteDone(false);
    setConfirmInput('');
    try {
      const result = await egiPurgeDryRun(project.id);
      setDryRunOutput(result.output);
      setDryRunSuccess(result.success);
      setDryRunDone(true);
      if (result.success) {
        toastSuccess('Dry-run completato. Verifica il piano prima di procedere.');
      } else {
        toastError('Dry-run fallito. Controlla l\'output per i dettagli.');
      }
    } catch {
      setDryRunOutput('Errore di connessione al server.');
      setDryRunSuccess(false);
      toastError('Errore durante il dry-run.');
    } finally {
      setDryRunLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!project || confirmInput !== CONFIRM_TOKEN) return;
    setExecuteLoading(true);
    setExecuteOutput(null);
    setExecuteSuccess(null);
    setExecuteDone(false);
    try {
      const result = await egiPurgeExecute(project.id, confirmInput);
      setExecuteOutput(result.output);
      setExecuteSuccess(result.success);
      setExecuteDone(true);
      if (result.success) {
        toastSuccess('✅ Purge completata con successo. Tutti gli asset EGI sono stati eliminati.');
      } else {
        toastError('❌ Purge fallita parzialmente. Controlla l\'output.');
      }
    } catch {
      setExecuteOutput('Errore di connessione al server.');
      setExecuteSuccess(false);
      toastError('Errore durante l\'esecuzione della purge.');
    } finally {
      setExecuteLoading(false);
    }
  };

  const isConfirmValid = confirmInput === CONFIRM_TOKEN;

  // ── Render ────────────────────────────────────────────────────────────────
  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="alert alert-error">Progetto non trovato: <code>{slug}</code></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link to={`/project/${slug}`} className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-error" />
            Manutenzione — {project.name}
          </h1>
          <p className="text-base-content/60 text-sm mt-0.5">
            Operazioni distruttive e irreversibili. Procedere con la massima attenzione.
          </p>
        </div>
      </div>

      {/* ── Global WARNING banner ── */}
      <div role="alert" className="alert alert-error shadow-lg">
        <AlertTriangle className="w-6 h-6 shrink-0" />
        <div>
          <h3 className="font-bold text-lg">Zona ad Alto Rischio</h3>
          <p className="text-sm">
            Le operazioni in questa pagina sono <strong>irreversibili</strong>. S3, Pinata IPFS e i record
            del database verranno eliminati permanentemente. Eseguire sempre il <strong>Dry-Run</strong> prima
            di procedere con l'esecuzione reale.
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          CARD: EGI Asset Purge
          ════════════════════════════════════════════════════════════════════ */}
      <div className="card bg-base-200 shadow-md border border-base-300">
        <div className="card-body gap-4">

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-error/10">
              <Trash2 className="w-6 h-6 text-error" />
            </div>
            <div>
              <h2 className="card-title text-xl">EGI Asset Purge</h2>
              <p className="text-base-content/60 text-sm">
                Elimina tutti gli EGI del progetto: file S3 (originale + 4 varianti WebP),
                pin Pinata IPFS, record EgiTrait (Spatie media incluso) e hard-delete dei record EGI dal DB.
              </p>
            </div>
          </div>

          <div className="divider my-0" />

          {/* What will be deleted */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'File S3', desc: 'JPG originali + WebP varianti (thumbnail, mobile, tablet, desktop)', color: 'text-warning' },
              { label: 'Pinata IPFS', desc: 'CID unpinati da Pinata (deduplicati)', color: 'text-warning' },
              { label: 'Spatie Media', desc: 'Tabella media + file storage di EgiTrait', color: 'text-warning' },
              { label: 'DB Records', desc: 'Hard-delete EGI + tabelle FK collegate', color: 'text-error' },
            ].map((item) => (
              <div key={item.label} className="bg-base-300 rounded-lg p-3">
                <p className={`font-bold text-sm ${item.color}`}>{item.label}</p>
                <p className="text-xs text-base-content/60 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="divider my-0" />

          {/* ── STEP 1: DRY-RUN ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="badge badge-neutral badge-lg font-bold">STEP 1</span>
              <h3 className="font-semibold text-base flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-info" />
                Dry-Run — Analisi Piano (nessuna modifica)
              </h3>
            </div>
            <p className="text-sm text-base-content/60">
              Esegue <code className="bg-base-300 px-1 rounded text-xs">php artisan egi:purge-all</code> (senza <code className="bg-base-300 px-1 rounded text-xs">--force</code>).
              Mostra esattamente cosa verrebbe eliminato.
            </p>
            <button
              className="btn btn-info btn-sm gap-2"
              onClick={handleDryRun}
              disabled={dryRunLoading || executeLoading}
            >
              {dryRunLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Analisi in corso...</>
              ) : (
                <><FlaskConical className="w-4 h-4" />Esegui Dry-Run</>
              )}
            </button>
          </div>

          {/* Dry-Run output */}
          {dryRunOutput !== null && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Terminal className="w-4 h-4" />
                Output Dry-Run
                {dryRunDone && dryRunSuccess === true && (
                  <span className="badge badge-success badge-sm gap-1">
                    <CheckCircle2 className="w-3 h-3" />OK
                  </span>
                )}
                {dryRunDone && dryRunSuccess === false && (
                  <span className="badge badge-error badge-sm gap-1">
                    <XCircle className="w-3 h-3" />Errore
                  </span>
                )}
              </div>
              <pre
                ref={outputRef}
                className="bg-base-300 rounded-lg p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-80 leading-relaxed"
              >
                {dryRunOutput}
              </pre>
            </div>
          )}

          {/* ── STEP 2: ESECUZIONE REALE — solo dopo dry-run OK ── */}
          {dryRunDone && (
            <>
              <div className="divider my-0" />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="badge badge-error badge-lg font-bold">STEP 2</span>
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-error" />
                    Esecuzione Reale — IRREVERSIBILE
                  </h3>
                </div>

                {/* Confirm zone */}
                {!executeDone && (
                  <div className="bg-error/5 border border-error/30 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-error flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Per procedere, digita esattamente nel campo qui sotto:
                    </p>
                    <div className="font-mono font-bold text-lg text-center py-2 bg-base-300 rounded-lg tracking-wider select-all">
                      {CONFIRM_TOKEN}
                    </div>
                    <input
                      type="text"
                      className={`input input-bordered w-full font-mono transition-colors ${
                        confirmInput && !isConfirmValid ? 'input-error' : ''
                      } ${isConfirmValid ? 'input-success' : ''}`}
                      placeholder="Digita qui il testo di conferma..."
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      disabled={executeLoading}
                      autoComplete="off"
                      spellCheck={false}
                    />

                    <button
                      className="btn btn-error w-full gap-2"
                      onClick={handleExecute}
                      disabled={!isConfirmValid || executeLoading}
                    >
                      {executeLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Purge in esecuzione... (può richiedere 2-3 minuti)</>
                      ) : (
                        <><Trash2 className="w-4 h-4" />PURGE — Elimina tutti gli EGI</>
                      )}
                    </button>
                  </div>
                )}

                {/* Execute output */}
                {executeOutput !== null && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Terminal className="w-4 h-4" />
                      Output Purge
                      {executeDone && executeSuccess === true && (
                        <span className="badge badge-success badge-sm gap-1">
                          <CheckCircle2 className="w-3 h-3" />COMPLETATA
                        </span>
                      )}
                      {executeDone && executeSuccess === false && (
                        <span className="badge badge-error badge-sm gap-1">
                          <XCircle className="w-3 h-3" />ERRORI
                        </span>
                      )}
                    </div>
                    <pre className="bg-base-300 rounded-lg p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-96 leading-relaxed">
                      {executeOutput}
                    </pre>
                    {executeDone && executeSuccess && (
                      <div role="alert" className="alert alert-success text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Purge completata. Tutti gli asset EGI sono stati eliminati da S3, Pinata e DB.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
}
