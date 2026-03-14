---
name: doc-sync-guardian
description: Si attiva dopo ogni task completata per aggiornare EGI-DOC.
             P0-11: task non chiusa senza documentazione aggiornata.
---

## SSOT Documentazione EGI-HUB

```
/home/fabio/EGI-DOC/docs/egi-hub/     ← documentazione specifica EGI-HUB
/home/fabio/EGI-DOC/docs/ecosistema/  ← impatti sull'ecosistema (tenancy, RBAC, aggregazioni)
```

## Regola per tipo di task

| Task | Cosa aggiornare |
|------|-----------------|
| `[FEAT]` nuova feature | Aggiorna architettura + aggiorna checklist.md |
| `[FIX]` bug fix | Aggiorna il .md del componente coinvolto |
| `[REFACTOR]` refactoring | Aggiorna struttura repository |
| `[CONFIG]` configurazione | Aggiorna EGI_HUB_CONTEXT.md o il file specifico |
| Debito tecnico identificato | Aggiorna o crea file dedicato in docs/egi-hub/ |
| Impatto su schema `core` | Aggiorna 01_PLATFORME_ARCHITECTURE_03.md |
| Impatto su altri organi | Aggiorna docs/ecosistema/ |

## Formato commit DOC-SYNC

```
[DOC] EGI-HUB — [area modificata]: [descrizione sintetica]

Esempi:
[DOC] EGI-HUB — architettura: aggiornato schema core.aggregations
[DOC] EGI-HUB — billing: nuovo Piano Billing Management fase 1
```

## Checklist pre-chiusura task

- [ ] EGI-DOC aggiornato (path specifico sopra)
- [ ] Se impatta schema `core` → aggiornato 01_PLATFORME_ARCHITECTURE_03.md
- [ ] Se impatta altri organi → aggiornato docs/ecosistema/
- [ ] Commit con formato `[DOC] EGI-HUB — ...`
- [ ] P0-11 soddisfatto → task chiusa

## Attenzione: autorità gerarchica EGI-HUB

EGI-HUB è superiore gerarchico di tutti gli organi.
Se una modifica in EGI-HUB impatta la configurazione di EGI, NATAN_LOC o altri:
→ documentare ANCHE nel SSOT dell'organo impattato.
