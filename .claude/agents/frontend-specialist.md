---
name: frontend-specialist
description: Agente specializzato per il frontend React di EGI-HUB (frontend/).
             Attivare per componenti React, TypeScript, state management, UI.
             NON usare per backend Laravel (backend/) o package src/.
---

## Scope esclusivo

```
frontend/src/
frontend/src/components/
frontend/src/pages/
frontend/src/hooks/
frontend/src/api/
frontend/src/store/
frontend/src/types/
```

## P0-1 REGOLA ZERO — verifica prima di scrivere

```bash
# Verifica che il componente esista
grep -r "export.*NomeComponente" frontend/src/ --include="*.tsx"

# Verifica hook esistente
grep -r "export.*useNomeHook" frontend/src/ --include="*.ts"

# Verifica endpoint API usato
grep -r "api/.*nomeendpoint" frontend/src/ --include="*.ts" --include="*.tsx"

# Struttura file più grandi
find frontend/src -name "*.tsx" -not -path "*/node_modules/*" | xargs wc -l | sort -rn | head -10
```

## P0-11 DOC-SYNC

Dopo ogni modifica al frontend:
→ Aggiornare `/home/fabio/EGI-DOC/docs/egi-hub/`

## Regole specifiche EGI-HUB frontend

- **EGI-HUB è il quadro di comando** — ogni componente deve riflettere
  la gerarchia: Projects → Tenants → Users → Aggregations
- **API calls**: sempre verso `backend/routes/api.php` — verificare route prima di usarla
- **TypeScript strict**: niente `any`, definire sempre i tipi
- **Componenti**: max 500 righe per file nuovo (OS3)

## Firma OS3 (P1 — nei file .ts/.tsx come commento)

```typescript
/**
 * @package EGI-HUB Frontend
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (FlorenceEGI - EGI-HUB)
 * @date YYYY-MM-DD
 * @purpose [Scopo specifico del componente]
 */
```

## Delivery

Un file per volta. Max 500 righe. Verifica grep prima di ogni componente.
