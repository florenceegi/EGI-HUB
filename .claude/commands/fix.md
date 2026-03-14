# /fix — Debug e Fix Strutturato (P0-8) — EGI-HUB

Protocollo obbligatorio per qualsiasi fix. Non saltare nessuna fase.

## Fase 1 — Descrizione del problema

Chiedi (tutto in una volta):

1. **Sintomo**: Cosa succede esattamente? (messaggio di errore, comportamento errato)
2. **Quando**: Quando si manifesta? (sempre / a volte / dopo X azione)
3. **Layer**: Dove appare l'errore? (browser React / Laravel backend logs / DB / API)
4. **Log**: Incollami il log esatto se disponibile
5. **Branch**: Su quale branch?
6. **Ultimo cambiamento**: Cosa è stato modificato di recente?

## Fase 2 — Mappatura flusso completo (P0-8)

**Non skippare questa fase. Mai.**

```
FLOW MAP:
User action: [cosa fa l'utente in EGI-HUB]
    ↓
Frontend React: [componente / hook / pagina in frontend/src/]
    ↓
API call: [endpoint backend/routes/api.php]
    ↓
Laravel backend: [Controller → Service → Model → ...]
    ↓
Database: [query PostgreSQL / schema core ESCLUSIVAMENTE / search_path: core,public]
    ↓
Response: [formato atteso JSON]
```

Leggi ogni file nel flow. Verifica che search_path sia `core,public` in ogni query.

## Fase 3 — Identificazione causa root

Dopo la mappatura:

```
CAUSA ROOT PROBABILE: [descrizione]
FILE COINVOLTO: [path]
RIGA APPROSSIMATIVA: [numero]
CONFIDENCE: [alta/media/bassa]

FILE [LEGACY]? [sì/no — se sì dichiara e proponi piano minimale]
IMPATTA ALTRI ORGANI? [sì/no — EGI-HUB è superiore gerarchico]

CAUSE ALTERNATIVE DA ESCLUDERE:
- [causa alternativa 1]
- [causa alternativa 2]
```

Se confidence < alta → cerca tutte le occorrenze con grep prima di procedere.

## Fase 4 — Fix minimale

Il fix deve essere il più chirurgico possibile:
- Tocca solo i file strettamente necessari
- Non introduce nuove dipendenze
- Non cambia comportamento di feature non coinvolte
- Non tocca la struttura schema `core` senza migration approvata da Fabio

## Fase 5 — Verifica

```bash
# Se Laravel backend
cd backend && php artisan config:cache

# Se Migration schema core
cd backend && php artisan migrate:status

# Se Frontend React
npm run build

# Verifica search_path
grep -r "search_path\|DB_SEARCH_PATH" backend/config/ backend/.env
# Atteso: core,public — MAI natan qui
```

## Fase 6 — Chiusura

```
FIX COMPLETATO: [titolo]

CAUSA ROOT: [descrizione]
FILE MODIFICATI: [lista]
TIPO FIX: [one-liner / patch / refactor]
FILE [LEGACY] TOCCATI: [se presenti — con dichiarazione esplicita]

COMMIT: [FIX] [descrizione causa + soluzione]

REGRESSIONI DA VERIFICARE:
- [area 1 potenzialmente impattata]

DOC-SYNC: [sì/no — quale file aggiornare in EGI-DOC/docs/egi-hub/]
```
