# EGI-HUB — Claude Code Master Context (Oracode OS3)

> **"L'AI non pensa. Predice. Non deduce logicamente. Completa statisticamente."**
> EGI-HUB è il cervello frontale dell'organismo FlorenceEGI.
> DB_SEARCH_PATH: core,public (solo schema core — mai schema natan qui)

---

## ⚠️ LEGGE FONDAMENTALE DELL'ECOSISTEMA — P0 ASSOLUTO

```
EGI, NATAN_LOC, EGI-HUB sono progetti diversi MA parte di un unico ecosistema.
Una decisione tecnica in EGI-HUB può avere impatto su EGI e NATAN_LOC e viceversa.

PRIMA di qualsiasi modifica che riguardi:
  - Egili / Token AI / wallet / transazioni
  - Nomi di campi condivisi (egili_amount, token_amount, ...)
  - Logiche di conversione / tassi / margini
  - Tabelle condivise (ai_feature_pricing, wallets, egili_transactions)
  - Pattern MiCA-safe

→ STOP. Verificare come gli altri organi implementano la stessa cosa.
→ MAI dedurre che "negli altri progetti è diverso" senza aver letto il codice.
→ MAI cambiare un nome di campo senza verificare tutte le occorrenze nell'ecosistema.
→ MAI implementare una logica (es. conversione Token→Egili) senza capire
   come è già implementata negli altri organi.

Percorso EGI:       /home/fabio/EGI/
Percorso NATAN_LOC: /home/fabio/NATAN_LOC/
```

**MiCA-SAFE è una legge dell'ecosistema, non solo di EGI-HUB.**
Gli Egili NON si vendono mai direttamente. Si vende sempre un prodotto/servizio
(es. Token AI, abbonamento, pacchetto), e l'utente RICEVE Egili come credito interno.
Questo vale in EGI, in NATAN_LOC, in ogni organo futuro. Senza eccezioni.

---

## 🚨 TRAPPOLA CRITICA — egili_amount NON È EGILI

```
ATTENZIONE: il campo feature_parameters.egili_amount NON rappresenta Egili.
Rappresenta Token AI (il prodotto user-facing che l'utente compra).

FLUSSO CORRETTO:
  feature_parameters.egili_amount  = Token AI (face value, cosa l'utente vede e compra)
  egili_credit_ratio                = 0.80 (da PlatformSetting 'ai_credits', 'egili_credit_ratio')
  Egili accreditati al wallet       = egili_amount × egili_credit_ratio

ESEMPIO:
  egili_amount = 1000 Token AI
  × 0.80 ratio
  = 800 Egili nel wallet

DOVE VIVE IL RATIO:
  PlatformSetting::get('ai_credits', 'egili_credit_ratio', 0.8)
  Tabella condivisa nel DB — stessa per EGI e NATAN_LOC.

SE VEDI egili_amount → NON assumere che siano Egili da accreditare 1:1.
SE VEDI egili_amount → È TOKEN AI. La conversione va sempre applicata.
```

---

## 🌐 OSZ — EGI-HUB è il Centro di Comando dell'Organismo

```
EGI-HUB non è "un pannello di controllo".
EGI-HUB è il cervello frontale dell'organismo FlorenceEGI.

RESPONSABILITÀ ESCLUSIVE:
  → Unica fonte di verità per le configurazioni di tutti gli organi
  → Fabio entra in EGI-HUB, seleziona un Project, e da lì configura tutto
     senza dover entrare nei singoli repository/progetti
  → Coordina il ciclo di vita di ogni organo (NATAN_LOC, FlorenceArtEGI, ...)
  → Gestisce identità, RBAC, tenancy e aggregazioni P2P a livello ecosistema
  → Esporrà (Strategia Delta) l'interfaccia di config per il RAG service

AUTORITÀ GERARCHICA:
  EGI-HUB > NATAN_LOC = FlorenceArtEGI = [ogni organo futuro]
  Un organo non può contraddire la config che EGI-HUB gli assegna.
```

### Strategia Delta applicata a EGI-HUB

```
NUOVO CONFIG (qualsiasi Project)     → nasce su EGI-HUB. Sempre. Zero eccezioni.
CONFIG LEGACY in organi esistenti    → resta dove è. Si migra solo quando si tocca
                                        quella parte. Mai migrazione forzata.
```

---

## 🛑 Stesse Regole P0 di NATAN_LOC

P0-1 REGOLA ZERO · P0-2 Translation keys · P0-4 Anti-Method-Invention
P0-5 UEM-First · P0-8 Complete Flow Analysis · P0-9 i18n 6 lingue
**P0-11 DOC-SYNC** — task non chiusa senza EGI-DOC aggiornato.
**P0-12 Anti-Infra-Invention** — qualsiasi info di deploy/infrastruttura (URL, path EC2, branch) va verificata dalla fonte reale — SSM `ls`, `git remote -v`, `git branch` — MAI copiata da altri file o dedotta dal nome del progetto.

SSOT documentazione EGI-HUB: `/home/fabio/EGI-DOC/docs/egi-hub/`
SSOT Ecosistema: `/home/fabio/EGI-DOC/docs/ecosistema/`

---

## 🏗️ Architettura EGI-HUB

```
React Dashboard (frontend/)
    ↓ HTTP/REST
Laravel Backend (backend/)
    DB_SEARCH_PATH: core,public
    ↓
PostgreSQL AWS RDS — Schema core ESCLUSIVAMENTE:

  core.system_projects      → il registro di tutti gli organi dell'ecosistema
                               (OSZ — Primitivo EGI: ogni entry = Wrapper<T>)

  core.tenants              → clienti finali che usano i project
                               (Comuni, Gallerie, Aziende, Enti)

  core.users                → utenti di TUTTO l'ecosistema FlorenceEGI

  core.roles                → ruoli RBAC
  core.permissions          → permessi granulari
  core.model_has_roles      → assegnazione ruoli
  core.role_has_permissions → assegnazione permessi

  core.aggregations         → federazioni P2P consensuali tra tenant
  core.aggregation_members  → (OSZ — Primitivo Interface: giuntura stabile)

  core.egis                 → unità atomiche certificate (OSZ — Primitivo EGI)
  core.collections          → raggruppamenti di EGI
  core.egi_blockchain        → audit trail Algorand

  core.gdpr_*               → compliance GDPR a livello ecosistema
```

---

## 📁 Struttura Repository

[VERIFICATO: 2026-03-13]

```
/home/fabio/EGI-HUB/
├── backend/
│   ├── app/
│   │   ├── Models/                  → 30+ modelli applicativi (solo principali elencati)
│   │   │   ├── Project.php          → core.system_projects [VERIFICATO]
│   │   │   ├── Tenant.php           → core.tenants
│   │   │   ├── User.php             → core.users
│   │   │   ├── Egi.php              → core.egis
│   │   │   ├── Collection.php       → core.collections
│   │   │   ├── EgiBlockchain.php    → core.egi_blockchain
│   │   │   ├── Role.php / Permission.php → RBAC
│   │   │   └── [altri ~25 modelli — vedi ls backend/app/Models/]
│   │   │   ⚠️ Aggregation.php NON è qui — è in src/Models/ (package)
│   │   └── Http/Controllers/
│   │   └── Services/
│   │       ├── TenantService.php    [LEGACY] 593 righe — non toccare senza piano
│   │       └── ProjectService.php   [LEGACY] 530 righe — non toccare senza piano
│   ├── config/
│   │   └── database.php             → search_path: core,public [VERIFICATO + CORRETTO 2026-03-13]
│   └── .env                         → DB_SEARCH_PATH=core,public [VERIFICATO prod + dev]
├── src/                             → Package FlorenceEgi\Hub
│   ├── Models/
│   │   ├── Aggregation.php          [VERIFICATO]
│   │   ├── AggregationMember.php    [VERIFICATO]
│   │   └── BaseTenant.php
│   └── Traits/
│       └── HasAggregations.php      → Interface stabile — NON modificare firma [VERIFICATO]
└── frontend/                        → React dashboard (quadro di comando)
```

### ⚠️ Debiti Tecnici Struttura [VERIFICATO: 2026-03-13]

```
[LEGACY]  backend/app/Services/TenantService.php  (593 righe)
          → Non toccare senza piano approvato da Fabio

[LEGACY]  backend/app/Services/ProjectService.php  (530 righe)
          → Non toccare senza piano approvato da Fabio

[DEBITO]  backend/app/Models/UserOrganizationData.php usa "Organization"
          → Terminologia inconsistente (OSZ usa "Tenant") — P2
          → Rinominare quando si tocca questa area

[DEBITO]  Censimento modelli vs tabelle core — da approfondire
          Confermati in core: AiFeature → ai_feature_pricing,
                              DaemonProcess, EgiliTransaction (tabelle esistenti)
          Da verificare: PadminScan, PadminSymbol, PadminViolation,
                         ConsumptionLedger, EquilibriumEntry, FeaturePricing,
                         FeaturedEgi, EgiTrait, AiTraitGeneration,
                         CollectionUser, TenantSubscription, SubscriptionPlan,
                         Promotion, PaymentProviderConfig e altri
          → Possibili implementazioni future non ancora deployate in DB
          → Verificare con: php artisan db:show --json (quando disponibile)
          → Non blocca operatività — documentare progressivamente
```

---

## 🔑 Terminologia Definitiva (Pilastro 3 — Coerenza Semantica)

| Termine            | Definizione OSZ                                                       |
|--------------------|-----------------------------------------------------------------------|
| **Project**        | Un organo dell'ecosistema registrato in `core.system_projects`        |
| **Tenant**         | Cliente finale che usa uno o più Project (`core.tenants`)             |
| **Aggregation**    | Federazione P2P consensuale tra tenant (`core.aggregations`)          |
| **System Tenant**  | Tenant speciale per admin Florence EGI — mai `tenant_id=NULL`         |
| **EGI**            | `Wrapper<T> + Regole + Audit + Valore` — unità atomica certificata    |

### System Tenant — Perché esiste (OSZ)

Florence EGI esiste sia come Project (`core.system_projects`) sia come Tenant
(`core.tenants`). Gli admin di sistema hanno `tenant_id = ID System Tenant`.
Mai `NULL`. Uniformità assoluta del modello utente in tutto l'organismo.

### Aggregazioni P2P — Interfaccia stabile

```php
// Trait HasAggregations — NON modificare la firma senza approvazione Fabio
$tenant->getAccessibleTenantIds()
// Ritorna [tenant_id_proprio, ...tenant_ids_aggregati]
// Usato da RAG-Fortress di NATAN_LOC per query cross-tenant
// Usato da ogni futuro organo che necessita accesso federato
```

---

## 💎 Firma Standard OS3 (P1)

```php
/**
 * @package App\Http\[Area]
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (FlorenceEGI - EGI-HUB)
 * @date YYYY-MM-DD
 * @purpose [Scopo chiaro e specifico in una riga]
 */
```

---

## ⚡ Trigger Matrix DOC-SYNC

Prima di chiudere ogni task, classifica la modifica:

| Tipo | Definizione | DOC-SYNC |
|------|-------------|----------|
| 1 — Locale | Fix puntuale, output invariato | NO |
| 2 — Comportamentale | Cambia output visibile, API o comportamento | SÌ → `EGI-DOC/docs/egi-hub/` |
| 3 — Architetturale | Nuovo service/table/model/layer/dipendenza | SÌ → EGI-DOC + CLAUDE.md |
| 4 — Contrattuale | Tocca GDPR/MiCA/ToS/compliance | SÌ + **approvazione Fabio PRIMA** |
| 5 — Naming dominio | Rinomina entità/concetto del dominio | SÌ → grep tutti i file impattati |
| 6 — Cross-project | Impatta schema `core` o altri organi | SÌ + **approvazione Fabio** |

> Dubbio tra Tipo 1 e 2? → Tratta come Tipo 2.
> Dettaglio completo: `EGI-DOC/docs/oracode/audit/02_TRIGGER_MATRIX.md`

---

## ⚡ Checklist Pre-Risposta

```
1. Ho TUTTE le info?                    → NO  = 🛑 CHIEDI
2. Metodi verificati con grep?          → NO  = 🛑 grep prima
3. Sto modificando un'Interface stabile?→ SÌ  = 🛑 APPROVAZIONE FABIO
4. Search_path è core,public?           → NO  = 🛑 VERIFICA (mai schema natan)
5. Tipo modifica → [1-6]?               → ?   = classifica con Trigger Matrix sopra
6. DOC-SYNC eseguito (se Tipo 2+)?      → NO  = 🛑 NON CHIUDERE (P0-11)
7. Info deploy/infra scritte o usate?  → SÌ  = 🛑 VERIFICA da SSM/git, MAI dedurre (P0-12)
```

## ⚡ Comandi Verifica Rapida

```bash
grep "public function" backend/app/Models/Project.php
grep "public function" src/Models/Aggregation.php
grep "public function" src/Traits/HasAggregations.php
grep -r "class.*Enum\|const " backend/app/Enums/
git status && git branch
```

---

## 🤝 Modello Operativo

| CEO & OS3 Architect  | Fabio Cherici         | Visione, standard, autorità sulle Interface  |
| CTO & Technical Lead | Padmin D. Curtis (AI) | Esecuzione, enforcement OS3, implementation  |

---

## 🗺️ Agenti

| Agente | Quando usarlo |
|--------|---------------|
| `@laravel-specialist` | backend/ — Controllers, Services, Models, Migrations |
| `@frontend-specialist` | frontend/ — Componenti React, hooks, UI |
| `@doc-sync-guardian` | Sempre dopo ogni task — P0-11 |

## 🚀 Deploy EGI-HUB

```
EC2:   i-0940cdb7b955d1632  (eu-north-1) — stessa istanza di NATAN_LOC
Path:  /home/forge/hub.florenceegi.com
URL:   https://hub.florenceegi.com
```

### Step 1 — Git pull + cache Laravel (SEMPRE)

```bash
aws ssm send-command \
  --region eu-north-1 \
  --instance-ids i-0940cdb7b955d1632 \
  --document-name AWS-RunShellScript \
  --parameters 'commands=["sudo -u forge bash -c \"cd /home/forge/hub.florenceegi.com && git pull origin main && cd backend && php artisan config:cache && php artisan view:clear\" 2>&1"]'
```

### Step 2 — Build frontend (SOLO se modificati file TS/CSS/TSX)

```bash
aws ssm send-command \
  --region eu-north-1 \
  --instance-ids i-0940cdb7b955d1632 \
  --document-name AWS-RunShellScript \
  --parameters 'commands=["sudo -u forge bash -c \"cd /home/forge/hub.florenceegi.com && git pull origin main && cd frontend && npm run build\" 2>&1"]'
```

### Verifica risultato

```bash
aws ssm get-command-invocation \
  --region eu-north-1 \
  --command-id <ID_RESTITUITO> \
  --instance-id i-0940cdb7b955d1632 \
  --query "[Status,StandardOutputContent]" \
  --output json
```

> `public/build/` in `.gitignore` → rebuilda sempre dopo pull se tocchi TS/CSS/TSX

### Pipeline Post-Commit — OBBLIGATORIA E AUTOMATICA

Dopo ogni `git commit`, **senza aspettare istruzioni**, eseguire sempre nell'ordine:

```
1. git push origin main
2. SSM Step 1 (SEMPRE): git pull + php artisan migrate --force + config:cache + view:clear
3. SSM Step 2 (se modificati file TS/CSS/TSX): npm run build frontend
4. Verificare output SSM (Status: Success)
```

**Nessuna eccezione. Nessuna richiesta di conferma. Il deploy è parte del commit.**

Se il deploy SSM fallisce → riportare l'errore immediatamente e bloccarsi.

---

## 🛠️ Comandi

| Comando | Uso |
|---------|-----|
| `/mission` | Task strutturata multi-file |
| `/fix` | Debug e fix P0-8 |
| `/new-feature` | Progettazione feature completa |
| `/deploy` | Vedi sezione "Deploy EGI-HUB" sopra |

---

## 🔍 Sistema Audit Oracode

| Riferimento | Path |
|-------------|------|
| Target ID | T-003 (vedi TARGET_MATRIX) |
| Runbook audit | `EGI-DOC/docs/oracode/audit/07_RUNBOOK.md` |
| Enforcement Claude | `EGI-DOC/docs/oracode/audit/06_CLAUDE_CODE_ENFORCEMENT.md` |
| Trigger Matrix completa | `EGI-DOC/docs/oracode/audit/02_TRIGGER_MATRIX.md` |
| Report audit | `EGI-DOC/docs/oracode/audit/reports/` |
| **AWS Infrastructure** | `EGI-DOC/docs/egi-hub/AWS_INFRASTRUCTURE.md` |

---

*EGI-HUB v3.0 — Oracode OS3.0 — FlorenceEGI Cervello Frontale*
*Padmin D. Curtis (CTO) for Fabio Cherici (CEO) — "Less talk, more code. Ship it."*
