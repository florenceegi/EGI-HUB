# EGI-HUB (hub.florenceegi.com) — AI Agent Instructions (OS3.0)

> **Control Plane dell'Ecosistema FlorenceEGI — Dashboard SuperAdmin**
> **"L'AI non pensa. Predice. Non deduce logicamente. Completa statisticamente."**

---

<!-- ══════════════════════════════════════════════════════════════
     CORE CONDIVISO — Questa sezione è IDENTICA in tutti i progetti
     dell'ecosistema FlorenceEGI (EGI, EGI-HUB-HOME-REACT, NATAN_LOC, EGI-INFO, EGI-HUB).
     Qualsiasi modifica va replicata in tutti e 5 i file.
     ══════════════════════════════════════════════════════════════ -->

## 🛑 REGOLE P0 - BLOCCANTI (Violazione = STOP immediato)

| #        | Regola                 | Cosa Fare                                                           |
| -------- | ---------------------- | ------------------------------------------------------------------- |
| **P0-0** | **NO ALPINE/LIVEWIRE** | **VIETATO SCRIVERE NUOVO CODICE ALPINE/LIVEWIRE. Solo Vanilla/TS.** |
| **P0-1** | REGOLA ZERO            | MAI dedurre. Se non sai → 🛑 CHIEDI                                 |
| **P0-2** | Translation Keys       | `__('key')` mai stringhe hardcoded                                  |
| **P0-3** | Statistics Rule        | No `->take(10)` nascosti, sempre param espliciti                    |
| **P0-4** | Anti-Method-Invention  | Verifica metodo esiste PRIMA di usarlo                              |
| **P0-5** | UEM-First              | Errori → `$errorManager->handle()`, mai solo ULM                    |
| **P0-6** | Anti-Service-Method    | `read_file` + `grep` prima di usare service                         |
| **P0-7** | Anti-Enum-Constant     | Verifica costanti enum esistono                                     |
| **P0-8** | Complete Flow Analysis | Map ENTIRE flow BEFORE any fix (15-35 min)                          |
| **P0-9** | i18n 6 Lingue          | Traduzioni in TUTTE: `it`, `en`, `de`, `es`, `fr`, `pt`             |

### 🔍 Prima di Ogni Risposta

```
1. Ho TUTTE le info? → NO = 🛑 CHIEDI
2. Metodi VERIFICATI? → NO = 🛑 semantic_search/grep/read_file
3. Pattern simile esiste? → Non so = 🛑 CHIEDI esempio
4. Sto ASSUMENDO? → SÌ = 🛑 DICHIARA e CHIEDI
5. Limiti impliciti? → SÌ = 🛑 RENDI ESPLICITO
```

### 🔄 Prima di Ogni FIX/DEBUG (P0-8)

```
1. Flow MAPPATO? (user action → response) → NO = 🛑 MAP FIRST
2. Types TRACCIATI? (ogni variabile/step) → NO = 🛑 TRACE FIRST
3. ALL occurrences TROVATE? (grep/search) → NO = 🛑 FIND ALL
4. Context VERIFICATO? (dependencies/patterns) → NO = 🛑 VERIFY

TEMPO: 15-35 min | RISPARMIO: 2+ ore debugging
```

---

## ♿ ACCESSIBILITY (A11Y) - Incrementale

**FILOSOFIA**: Non stop totale, ma **miglioramento incrementale**. Ogni fix/refactor su una pagina = occasione per sistemare A11Y.

### 📋 Checklist per OGNI pagina modificata

```
✅ 1. SEMANTIC HTML (P2)
   <main>, <nav>, <header>/<footer>, <section>/<article>, <aside>

✅ 2. ARIA LABELS (P2)
   aria-label per icon-only buttons, aria-label per nav multiple
   alt SEMPRE su <img>, aria-hidden="true" su icone decorative

✅ 3. KEYBOARD NAVIGATION (P2)
   focus:ring-2 focus:ring-oro-fiorentino, tabindex="0" per custom elements

✅ 4. SCREEN READER TEXT (P2)
   <span class="sr-only">, aria-live="polite"/"assertive", role="status"

✅ 5. FORM ACCESSIBILITY (P1)
   <label for="id"> SEMPRE, aria-describedby per help text, aria-invalid per errori
```

**Target**: WCAG 2.1 Level AA — A11Y è **P2 (SHOULD)**, non P0.

---

## 🧬 Oracode System

**3 Livelli**: OSZ (kernel) → OS3 (AI discipline) → OS4 (human education)

**6+1 Pilastri**: Intenzionalità, Semplicità, Coerenza, Circolarità, Evoluzione, Sicurezza + **REGOLA ZERO**

**Concetti OSZ**:

- **EGI**: `Wrapper<T> + Regole + Audit + Valore`
- **USE**: Ultra Semantic Engine — pipeline query semantiche
- **URS**: Unified Reliability Score — metrica affidabilità risposta AI
- **Nerve**: Sistema nervoso AI (governatori, validatori)

---

## ⚡ Priorità

| P      | Nome      | Conseguenza          |
| ------ | --------- | -------------------- |
| **P0** | BLOCKING  | 🛑 STOP totale       |
| **P1** | MUST      | Non production-ready |
| **P2** | SHOULD    | Debt tecnico         |
| **P3** | REFERENCE | Info only            |

---

## 📝 TAG System v2.0

Formato: `[TAG] Descrizione breve`

| Tag    | Peso | Tag   | Peso | Tag      | Peso | Tag    | Peso |
| ------ | ---- | ----- | ---- | -------- | ---- | ------ | ---- |
| FEAT   | 1.0  | FIX   | 1.5  | REFACTOR | 2.0  | TEST   | 1.2  |
| DEBUG  | 1.3  | DOC   | 0.8  | CONFIG   | 0.7  | CHORE  | 0.6  |
| I18N   | 0.7  | PERF  | 1.4  | SECURITY | 1.8  | WIP    | 0.3  |
| REVERT | 0.5  | MERGE | 0.4  | DEPLOY   | 0.8  | UPDATE | 0.6  |

Alias: `[FEAT]` = `feat:` = ✨

---

## 🔒 Git Hooks

| Regola | Trigger                   | Azione     |
| ------ | ------------------------- | ---------- |
| R1     | >100 righe rimosse/file   | 🛑 BLOCCA  |
| R2     | 50-100 righe rimosse      | ⚠️ WARNING |
| R3     | >50% contenuto rimosso    | 🛑 BLOCCA  |
| R4     | >500 righe totali rimosse | 🛑 BLOCCA  |

Bypass: `git commit --no-verify` (solo se intenzionale)

---

## 💎 FIRMA STANDARD

```php
/**
 * @package App\Http\Controllers\[Area]
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (FlorenceEGI - [Context])
 * @date 2025-10-28
 * @purpose [Clear, specific purpose]
 */
```

<!-- ══════════════════════════════════════════════════════════════
     FINE CORE CONDIVISO — Da qui in poi: specifico per EGI-HUB
     ══════════════════════════════════════════════════════════════ -->

---

## 🏗️ Architettura EGI-HUB

```
Frontend React 18 :5173 → Laravel 11 Backend :7000
                                ↓
                    PostgreSQL (AWS RDS)
                    Database: florenceegi
                    Schema: core (users, tenants, projects)
```

| Componente  | Tecnologia                                              | Porta |
| ----------- | ------------------------------------------------------- | ----- |
| Backend     | Laravel 11 + PHP 8.2+                                   | 7000  |
| Frontend    | React 18 + TS 5.3 + Vite 5 + Tailwind 3.4 + DaisyUI 5.5 | 5173  |
| Database    | PostgreSQL AWS RDS (`florenceegi`, schema `core`)       | 5432  |
| Auth        | Sanctum (token-based)                                   | —     |
| Permissions | Spatie laravel-permission                               | —     |
| Package Hub | `florenceegi/hub` (Aggregations + traits)               | —     |

**IMPORTANTE**: EGI-HUB è **DIVERSO** da NATAN_LOC:

- ❌ NO Python FastAPI
- ❌ NO MongoDB
- ❌ NO AI services integrati
- ✅ Solo Laravel + React + PostgreSQL

---

### 🌍 Lingue Obbligatorie (P0-9)

Ogni traduzione DEVE essere in **tutte e 6** le lingue:

| Codice | Lingua    | Path                         |
| ------ | --------- | ---------------------------- |
| `it`   | Italiano  | `backend/resources/lang/it/` |
| `en`   | English   | `backend/resources/lang/en/` |
| `de`   | Deutsch   | `backend/resources/lang/de/` |
| `es`   | Español   | `backend/resources/lang/es/` |
| `fr`   | Français  | `backend/resources/lang/fr/` |
| `pt`   | Português | `backend/resources/lang/pt/` |

❌ **VIETATO** tradurre solo in `it` + `en` → 🛑 BLOCCA

---

## 🔌 Pattern Laravel (ULM/UEM/GDPR)

```php
use Ultra\UltraLogManager\UltraLogManager;
use Ultra\ErrorManager\Interfaces\ErrorManagerInterface;
use App\Services\Gdpr\AuditLogService;
use App\Enums\Gdpr\GdprActivityCategory;

class ExampleController extends Controller
{
    public function __construct(
        private UltraLogManager $logger,
        private ErrorManagerInterface $errorManager,
        private AuditLogService $auditService
    ) {}

    public function update(Request $request): RedirectResponse
    {
        try {
            $this->logger->info('Operation started', ['user_id' => $user->id]);
            $user->update($validated);

            // GDPR Audit (P0-7: enum verificato)
            $this->auditService->logUserAction($user, 'data_updated', $context,
                GdprActivityCategory::PERSONAL_DATA_UPDATE);

            return redirect()->with('success', __('messages.updated')); // P0-2
        } catch (\Exception $e) {
            return $this->errorManager->handle('OP_FAILED', [...], $e); // P0-5
        }
    }
}
```

---

## ⚡ Ultra Translation Manager (CRITICAL)

**PROBLEM**: UTM caches translated strings aggressively. Dynamic parameters (`__('key', ['param' => $val])`) may cache with the FIRST user's data and serve to ALL users.

**RULE**: Use **Atomic Translations** (split static text + dynamic variables).

❌ **BAD (UTM caches with first user's data)**:

```php
{{ __('messages.greeting', ['name' => $user->name]) }}
```

✅ **GOOD (Atomic & Cache-Safe)**:

```php
{{ __('messages.greeting') }} {{ $user->name }}{{ __('messages.greeting_suffix') }}
```

**Migration Pattern**:

```php
// OLD: 'greeting' => 'Hello :name! Welcome back.',
// NEW:
'greeting' => 'Hello',
'greeting_suffix' => '! Welcome back.',
```

**IMPORTANT**: When migrating to atomic translations, update ALL 6 languages (P0-9).

---

## 🎯 Ruolo di EGI-HUB

**EGI-HUB è il Control Plane** dell'ecosistema FlorenceEGI: una dashboard SuperAdmin full-stack che orchestra, monitora e gestisce tutte le applicazioni SaaS.

**È:**

- Il centro di comando per tutti i progetti verticali (NATAN_LOC, FlorenceArtEGI, etc.)
- Un monorepo con `backend/` (Laravel 11 API) + `frontend/` (React 18 SPA)
- L'orchestratore delle aggregazioni P2P tra tenant di progetti diversi
- Il provider del package `florenceegi/hub` usato dai verticali

**NON È:**

- Un'app rivolta all'utente finale
- Un modulo di EGI (FlorenceArtEGI)
- Un semplice pannello admin

---

## 📦 Struttura Monorepo

```
EGI-HUB/
├── backend/                    # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── ProjectController.php
│   │   │   ├── ProjectAdminController.php
│   │   │   ├── ProjectProxyController.php
│   │   │   ├── ProjectActivityController.php
│   │   │   ├── AggregationController.php
│   │   │   ├── EcosystemController.php
│   │   │   ├── GdprController.php
│   │   │   ├── ConsentController.php
│   │   │   └── Superadmin/          # 16 controller
│   │   │       ├── DashboardController.php
│   │   │       ├── Ai*.php          (4 controller)
│   │   │       ├── Egili/Equilibrium (2 controller)
│   │   │       ├── Padmin*.php      (5 controller)
│   │   │       └── Platform*.php    (5 controller)
│   │   ├── Models/                  # 32 modelli
│   │   │   ├── Project.php, ProjectAdmin.php, ProjectActivity.php
│   │   │   ├── User.php, Role.php, Permission.php
│   │   │   ├── Egi.php, Collection.php, EgiBlockchain.php
│   │   │   ├── AiFeature.php, PadminViolation.php, PadminSymbol.php
│   │   │   ├── EgiliTransaction.php, EquilibriumEntry.php
│   │   │   ├── Promotion.php, FeaturedEgi.php, FeaturePricing.php
│   │   │   └── UserConsent.php, UserProfile.php, ...
│   │   └── Services/                # 4 services
│   │       ├── ProjectService.php
│   │       ├── TenantService.php
│   │       ├── RemoteCommandService.php (AWS SSM)
│   │       └── DaemonService.php
│   ├── routes/api.php              # ~80 API endpoints
│   ├── config/
│   └── composer.json
│
├── frontend/                   # React 18 SPA
│   ├── src/
│   │   ├── pages/              # 37 pagine
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Aggregations.tsx
│   │   │   ├── ComingSoon.tsx
│   │   │   ├── auth/           (Login, Register)
│   │   │   ├── projects/       (List, Dashboard, Activity, Admins, Create, My)
│   │   │   ├── tenants/        (List, Plans, Activity, Storage, Config, Create)
│   │   │   ├── ai/             (Consultations, Credits, Features, Statistics)
│   │   │   ├── tokenomics/     (Egili, Equilibrium)
│   │   │   ├── platform/       (Roles, Pricing, Promotions, Calendar, Ledger)
│   │   │   ├── padmin/         (Dashboard, Violations, Symbols, Search, Statistics)
│   │   │   └── system/         (Config, Security, Domains, Notifications)
│   │   ├── components/
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
│
├── src/                        # Package florenceegi/hub
│   ├── Models/
│   │   ├── Aggregation.php
│   │   └── AggregationMember.php
│   ├── Traits/
│   │   └── HasAggregations.php
│   ├── Http/Controllers/
│   └── HubServiceProvider.php
│
├── docs/                       # Documentazione
│   ├── 00_ECOSISTEMA.md
│   ├── 01_PLATFORME_ARCHITECTURE_03.md
│   ├── EGI_HUB_CONTEXT.md
│   ├── AWS_INFRASTRUCTURE.md
│   ├── CHECKLIST_SVILUPPO.md
│   ├── PROGETTO_EXECUTIVE_SUMMARY.md
│   └── Oracode_Systems/
│
└── composer.json               # Package definition (root)
```

---

## 🗄️ Database (SSOT — Single Source of Truth)

EGI-HUB usa il database **unificato** `florenceegi` su AWS RDS PostgreSQL.

**Schema utilizzato**: `core` (dati condivisi di tutto l'ecosistema)

**Search Path**: `core, public`

### Tabelle Principali (schema `core`)

| Gruppo           | Tabelle                                            | Descrizione                                 |
| ---------------- | -------------------------------------------------- | ------------------------------------------- |
| **Projects**     | `system_projects`                                  | Le applicazioni SaaS (NATAN_LOC, EGI, etc.) |
| **Users**        | `users`, `roles`, `permissions`, `model_has_roles` | Autenticazione e RBAC                       |
| **Tenants**      | `tenants`                                          | Clienti finali (Comuni, Gallerie, Aziende)  |
| **Aggregations** | `aggregations`, `aggregation_members`              | Federazioni P2P tra tenant                  |
| **EGI Core**     | `egis`, `collections`, `egi_blockchain`            | Asset digitali certificati                  |
| **GDPR**         | `consent_*`, `privacy_*`, `gdpr_*`                 | Compliance e audit                          |

> 📌 **Riferimento completo**: `docs/01_PLATFORME_ARCHITECTURE_03.md`

---

## 🔧 Moduli Funzionali (Tutti Implementati ✅)

### 1. Gestione Progetti

**Rotte**: `/api/projects/*`
**Controller**: `ProjectController`, `ProjectAdminController`, `ProjectActivityController`

Gestisce le applicazioni SaaS dell'ecosistema. Ogni "project" è un'app indipendente (NATAN_LOC, FlorenceArtEGI, etc.).

Funzionalità:

- CRUD progetti
- Health check singolo e globale
- Start/stop servizi (via AWS SSM)
- Gestione admin per progetto (owner/admin/viewer)
- Activity log
- Statistiche (attivi/inattivi/maintenance/errore)

### 2. Aggregazioni P2P

**Rotte**: `/api/aggregations/*`
**Controller**: `AggregationController`
**Package**: `florenceegi/hub` (trait `HasAggregations`)

Federazioni consensuali tra tenant di progetti diversi. Es: Comune di Firenze + Comune di Prato creano "Piana Fiorentina" per condividere documenti.

Funzionalità:

- CRUD aggregazioni
- Sistema inviti (invite, accept, reject)
- Gestione membri
- Configurazione condivisione dati

### 3. AI Management

**Rotte**: `/api/superadmin/ai/*`
**Controller**: 4 (Consultations, Credits, Features, Statistics)
**Pagine**: 4

Gestione centralizzata delle funzionalità AI per tutto l'ecosistema.

| Modulo        | Funzione                                           |
| ------------- | -------------------------------------------------- |
| Consultations | Visualizza/gestisci conversazioni AI cross-project |
| Credits       | Allocazione e reset crediti AI per utente          |
| Features      | Feature flags AI (toggle per slug)                 |
| Statistics    | Analytics d'uso, costi, token consumati            |

### 4. Tokenomics

**Rotte**: `/api/superadmin/tokenomics/*`
**Controller**: 2 (Egili, Equilibrium)
**Pagine**: 2

| Modulo      | Funzione                                     |
| ----------- | -------------------------------------------- |
| Egili       | Mint/burn token Egili, circolazione, storico |
| Equilibrium | Monitoraggio equilibrio economico, ricalcolo |

### 5. Platform Management

**Rotte**: `/api/superadmin/platform/*`
**Controller**: 5 (Roles, Pricing, Promotions, Calendar, Ledger)
**Pagine**: 5

| Modulo             | Funzione                            |
| ------------------ | ----------------------------------- |
| Roles              | Gestione ruoli RBAC (Spatie)        |
| Feature Pricing    | Prezzi per funzionalità piattaforma |
| Promotions         | Campagne promozionali               |
| Featured Calendar  | Calendario contenuti in evidenza    |
| Consumption Ledger | Registro consumi risorse, export    |

### 6. Padmin / Oracode OS3

**Rotte**: `/api/superadmin/padmin/*`
**Controller**: 5 (Dashboard, Violations, Symbols, Search, Statistics)
**Pagine**: 5

Analisi qualità codice basata su Oracode System 3.0.

| Modulo     | Funzione                                        |
| ---------- | ----------------------------------------------- |
| Dashboard  | Overview metriche + trigger scan                |
| Violations | Violazioni regole OS3, severity P0-P3, auto-fix |
| Symbols    | Analisi simboli codice (classi, funzioni)       |
| Search     | Ricerca pattern nel codebase                    |
| Statistics | Metriche qualità nel tempo                      |

### 7. Proxy API

**Rotte**: `/api/proxy/*`
**Controller**: `ProjectProxyController`

Proxy per eseguire operazioni su progetti remoti via HTTP.

### 8. Ecosystem API (Pubbliche)

**Rotte**: `/api/ecosystem/*`
**Controller**: `EcosystemController`

API pubbliche consumate da EGI-HUB-HOME-REACT per visualizzare metriche dell'ecosistema.

---

## 🔧 Processo Verifica Metodi (EGI-HUB)

```bash
grep "public function" backend/app/Services/ProjectService.php
grep "public function" backend/app/Services/RemoteCommandService.php
grep "public function" backend/app/Services/DaemonService.php
grep "public function" backend/app/Http/Controllers/Api/ProjectController.php
# SE non trovo → 🛑 STOP e CHIEDI
```

---

## 📁 File Chiave EGI-HUB

| Scopo                   | Path                                                         |
| ----------------------- | ------------------------------------------------------------ |
| Routes API              | `backend/routes/api.php`                                     |
| Project Controller      | `backend/app/Http/Controllers/Api/ProjectController.php`     |
| Project Service         | `backend/app/Services/ProjectService.php`                    |
| Remote Command Service  | `backend/app/Services/RemoteCommandService.php`              |
| Daemon Service          | `backend/app/Services/DaemonService.php`                     |
| Aggregation Controller  | `backend/app/Http/Controllers/Api/AggregationController.php` |
| GDPR Enums              | `backend/app/Enums/Gdpr/`                                    |
| Package Hub             | `src/` (Models, Traits, ServiceProvider)                     |
| Contesto EGI-HUB        | `docs/EGI_HUB_CONTEXT.md`                                    |
| Architettura Ecosistema | `docs/01_PLATFORME_ARCHITECTURE_03.md`                       |
| Infrastruttura AWS      | `docs/AWS_INFRASTRUCTURE.md`                                 |
| Checklist Sviluppo      | `docs/CHECKLIST_SVILUPPO.md`                                 |
| Executive Summary       | `docs/PROGETTO_EXECUTIVE_SUMMARY.md`                         |
| Oracode Docs            | `docs/Oracode_Systems/`                                      |

---

## ☁️ AWS Infrastructure

| Risorsa             | Identificativo                                                       | Dettaglio                                |
| ------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| **EC2 prod**        | `i-0940cdb7b955d1632`                                                | florenceegi-private, 10.0.3.21, t3.small |
| **Region**          | `eu-north-1`                                                         | (Route53 usa `us-east-1`)                |
| **Deploy path**     | `/home/forge/hub.florenceegi.com`                                    |                                          |
| **Accesso**         | AWS SSM (no SSH)                                                     |                                          |
| **RDS**             | `florenceegi-postgres-dev.c1i0048yu660.eu-north-1.rds.amazonaws.com` |                                          |
| **IAM Role EC2**    | `florenceegi-ec2-role`                                               | Include SSMFullAccess                    |
| **IAM User locale** | `egi-hub-deploy`                                                     | Per CLI: SSMFullAccess + Route53ReadOnly |

### Deploy Path (CRITICAL)

- `artisan` è in `backend/` (NON in root!)
- `composer.lock` è in root
- Frontend build → `frontend/dist/`

### Deploy Commands

```bash
cd /home/forge/hub.florenceegi.com
git pull
composer install --no-dev --optimize-autoloader
cd backend && php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan cache:clear
cd ../frontend && npm install && npm run build
```

---

## 🛠️ Comandi EGI-HUB

```bash
./start.sh                                             # Avvia tutto
./stop.sh                                              # Ferma tutto
cd backend && php artisan serve --port=7000            # Laravel dev
cd frontend && npm run dev                             # React dev :5173
php artisan config:cache && php artisan cache:clear    # Dopo modifiche config
```

---

**OS3.0 — "Less talk, more code. Ship it."**
