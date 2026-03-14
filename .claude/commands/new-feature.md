# /new-feature — Progettazione Feature Completa (EGI-HUB)

Protocollo per feature che toccano più layer o più file.
Usa Plan Mode (Shift+Tab x2) durante questa sessione.

## Fase 1 — Feature brief

Chiedi (tutto in una volta):

1. **Nome feature**: Come si chiama?
2. **Problema che risolve**: Qual è il pain point?
3. **Layer coinvolti**: backend Laravel / frontend React / package src/ / tutti
4. **Entità target**: Project / Tenant / User / Aggregation / RBAC
5. **Vincoli**: Schema core only? Impatta altri organi? RBAC?
6. **Priority**: P0/P1/P2 secondo standard OS3?

## Fase 2 — Spec tecnica

Dopo brief, genera spec strutturata:

```markdown
## SPEC: [Nome Feature]
**Priority**: P[n]
**Branch target**: [branch]
**Stima**: [n file, n righe]

### Comportamento atteso
[Descrizione precisa input → processo → output]

### File da creare
- [ ] `backend/path/file.php` — [scopo] — Agente: [laravel-specialist]
- [ ] `frontend/src/path/file.tsx` — [scopo] — Agente: [frontend-specialist]

### File da modificare
- [ ] `path/file.php` riga ~[n] — [modifica]

### File [LEGACY] coinvolti — piano approvazione richiesta
- [file LEGACY] — [motivo] — [piano minimo]

### Schema dati (se applicabile)
[Schema: ESCLUSIVAMENTE core.* — mai natan o egis da qui]
[Nuove colonne / tabelle / migration]

### API contract (se applicabile)
Request: { ... }
Response: { ... }

### Impatto su altri organi (se applicabile)
[EGI-HUB è superiore gerarchico — documentare se la feature cambia
 configurazioni che altri organi leggono da EGI-HUB]

### DOC-SYNC richiesto
- [ ] `EGI-DOC/docs/egi-hub/[file.md]`
- [ ] `EGI-DOC/docs/ecosistema/[file.md]` (se impatta altri organi)
```

## Fase 3 — Approval e suddivisione in task

Dopo approvazione della spec:

```
TASK BREAKDOWN: [Nome Feature]

TASK 1: [titolo] — Agent: [laravel-specialist / frontend-specialist]
TASK 2: [titolo] — Agent: [...]
TASK N: DOC-SYNC — Agent: [doc-sync-guardian]

Procedo con Task 1? (sì/modifica)
```

## Fase 4 — Implementazione task-by-task

Per ogni task:
- Un file per volta
- Verifica grep preventivo (P0-4, P0-6)
- Firma OS3.0 obbligatoria
- Max 500 righe per file nuovo
- Verificare search_path `core,public` in ogni nuova query

## Fase 5 — Integration test

Prima del merge:

```
INTEGRATION CHECKLIST:
□ Backend Laravel: php artisan config:cache OK
□ Frontend React: npm run build 0 errors TypeScript
□ API: endpoint risponde correttamente
□ Schema: solo tabelle core.* usate
□ Impatto organi: documentato se la feature cambia config globale
```

## Fase 6 — Chiusura e DOC-SYNC

```
FEATURE COMPLETATA: [Nome Feature]
Branch: [branch]
Commit: [hash o descrizione]

Attiva /doc-sync-guardian per aggiornare EGI-DOC/docs/egi-hub/.
```
