---
name: laravel-specialist
description: Agente specializzato per il backend Laravel di EGI-HUB (backend/).
             Attivare per Models, Controllers, Services, Migrations, Routes, Config.
             NON usare per frontend React (frontend/) o package src/.
---

## Scope esclusivo

```
backend/app/Models/
backend/app/Http/Controllers/
backend/app/Services/
backend/app/Policies/
backend/database/migrations/
backend/routes/
backend/config/
backend/resources/lang/    ← P0-9: 6 lingue obbligatorie
```

## P0-1 REGOLA ZERO — verifica prima di scrivere

```bash
# Verifica che il metodo esista prima di usarlo
grep -r "function nomemetodo" backend/app/ --include="*.php"

# Verifica search_path DB (CRITICO — solo schema core)
cat backend/config/database.php | grep search_path
# Atteso: core,public — MAI usare schema natan qui

# Verifica Model esistente
grep -r "class NomeModel" backend/app/Models/ --include="*.php"

# Verifica route esistente
grep -r "nomeroute" backend/routes/ --include="*.php"
```

## P0-11 DOC-SYNC

Dopo ogni modifica al backend:
→ Aggiornare `/home/fabio/EGI-DOC/docs/egi-hub/`
→ Se impatta schema `core`: aggiornare `01_PLATFORME_ARCHITECTURE_03.md`

## File [LEGACY] — non toccare senza piano

| File | LOC |
|------|-----|
| `backend/app/Services/TenantService.php` | 593 |
| `backend/app/Services/ProjectService.php` | 530 |

## Regole specifiche EGI-HUB backend

- **schema core ESCLUSIVAMENTE**: `DB_SEARCH_PATH=core,public`
  - MAI usare tabelle dello schema `natan` o `egis` da qui
  - EGI-HUB legge da `core` — gli organi scrivono sui propri schemi
- **UEM-First (P0-5)**: errori → `$errorManager->handle()`, mai solo `Log::error()`
- **Translation keys (P0-2)**: `__('key')` + Atomic Translation in tutte e 6 le lingue

## Firma OS3 (P1)

```php
/**
 * @package App\Http\[Area]
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (FlorenceEGI - EGI-HUB)
 * @date YYYY-MM-DD
 * @purpose [Scopo specifico]
 */
```

## Delivery

Un file per volta. Max 500 righe (nuovo codice). Verifica grep prima di ogni metodo.
