# /deploy — Checklist Deploy Produzione EGI-HUB

Protocollo sicuro per deploy su EC2 eu-north-1 (i-0940cdb7b955d1632).
URL produzione: hub.florenceegi.com
Path EC2: /home/forge/hub.florenceegi.com/

**IMPORTANTE**: Fornisci i comandi da eseguire via SSM. NON eseguirli direttamente — li esegue Fabio.

## Prerequisiti obbligatori prima del deploy

```
□ npm run build senza errori TypeScript (se frontend modificato)
□ cd backend && php artisan config:cache OK in locale
□ git status pulito (no unstaged changes)
□ Branch corretto: git branch
□ Commit firmato con tag corretto ([FEAT]/[FIX]/[REFACTOR]/etc.)
□ Nessun file [LEGACY] toccato senza piano approvato
□ Nessuna modifica allo schema core senza migration + approvazione Fabio
```

## Sequenza deploy — EGI-HUB (Laravel backend + React frontend)

### Step 1 — Git pull + cache Laravel backend

```bash
sudo -u forge bash -c 'cd /home/forge/hub.florenceegi.com && \
  git pull origin main && \
  cd backend && \
  php artisan cache:clear && \
  php artisan config:cache && \
  php artisan view:clear && \
  php artisan route:clear'
```

### Step 2 — Migration schema core (SOLO se ci sono nuove migration)

```bash
sudo -u forge bash -c 'cd /home/forge/hub.florenceegi.com/backend && \
  php artisan migrate --force'
```

**ATTENZIONE**: Migration su schema `core` = impatto su TUTTI gli organi.
Approvazione esplicita di Fabio OBBLIGATORIA.

### Step 3 — Build frontend React (SOLO se modificati file TS/CSS/TSX)

```bash
sudo -u forge bash -c 'cd /home/forge/hub.florenceegi.com && \
  npm run build'
```

Nota: `frontend/dist/` è in `.gitignore` → rebuilda sempre dopo pull se tocchi frontend.

### Step 4 — Verifica health

```bash
# EGI-HUB risponde
curl -s -o /dev/null -w "%{http_code}" https://hub.florenceegi.com/

# API backend risponde
curl -s -o /dev/null -w "%{http_code}" https://hub.florenceegi.com/api/health
```

## Accesso SSM (NO SSH diretto)

```bash
aws ssm send-command \
  --instance-ids i-0940cdb7b955d1632 \
  --document-name AWS-RunShellScript \
  --parameters 'commands=["COMANDO_QUI"]' \
  --region eu-north-1 \
  --query 'Command.CommandId' --output text

# Poi verifica con:
aws ssm get-command-invocation \
  --command-id "[ID_RESTITUITO]" \
  --instance-id i-0940cdb7b955d1632 \
  --region eu-north-1 \
  --query '[Status,StandardOutputContent,StandardErrorContent]' \
  --output text
```

## Post-deploy checklist

```
□ Homepage risponde: https://hub.florenceegi.com
□ API risponde: https://hub.florenceegi.com/api/health
□ Login funziona
□ Nessun errore nei log Laravel backend
□ DOC-SYNC completato se necessario
```

## Note critiche

- Schema `core` è condiviso tra TUTTI gli organi — migration con massima cautela
- Branch di sviluppo EGI-HUB: verificare con Fabio prima del deploy
- Rollback migration schema core: richiede piano separato + approvazione Fabio
