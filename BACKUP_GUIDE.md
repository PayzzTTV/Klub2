# 💾 KLUB - Guide de Backup & Récupération

**Date:** 09 Février 2026
**Version:** 0.5.0

---

## 🎯 Stratégie de Backup

### Niveaux de Backup

| Type | Fréquence | Rétention | Automatique |
|------|-----------|-----------|-------------|
| **Database** | Quotidien | 7 jours | ✅ Supabase |
| **Storage (images)** | Quotidien | 30 jours | ✅ Supabase |
| **Code** | À chaque commit | ∞ | ✅ GitHub |
| **Configuration** | Manuel | ∞ | ❌ |

---

## 📦 1. DATABASE BACKUP (Supabase Auto)

### Configuration Supabase

Supabase Pro/Team plan offre des backups automatiques :

```
✅ Point-in-time recovery (PITR)
✅ Daily automated backups
✅ 7 days retention (Free tier)
✅ 30 days retention (Pro tier)
```

### Vérifier les Backups

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. **Settings** → **Database** → **Backups**
4. Vérifier que **Daily Backups** = `Enabled`

### Backup Manuel (Urgent)

```bash
# Via pg_dump (PostgreSQL)
pg_dump -h db.YOUR_PROJECT_REF.supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -b -v \
        -f backup_$(date +%Y%m%d).dump

# Mot de passe: Database password (dans Supabase Settings)
```

**⚠️ Important:** Stocker le fichier `.dump` en lieu sûr (Google Drive, S3, etc.)

---

## 📁 2. STORAGE BACKUP (Images/Fichiers)

### Supabase Storage Auto-Backup

Supabase Storage est automatiquement sauvegardé avec la database.

### Backup Manuel via CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lister les buckets
supabase storage ls

# Télécharger tout le bucket inventory-images
supabase storage download inventory-images --recursive
```

### Script Python pour Backup Storage

```python
# backup_storage.py
import os
from supabase import create_client, Client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

# Liste tous les fichiers du bucket
files = supabase.storage.from_('inventory-images').list()

# Télécharge chaque fichier
for file in files:
    data = supabase.storage.from_('inventory-images').download(file['name'])
    with open(f"backup/{file['name']}", 'wb') as f:
        f.write(data)

print(f"✅ {len(files)} fichiers sauvegardés")
```

---

## 💻 3. CODE BACKUP (GitHub)

### Statut Actuel

✅ **Repository:** [github.com/PayzzTTV/Klub2](https://github.com/PayzzTTV/Klub2)
✅ **Branch principale:** `main`
✅ **Commits:** 10+ commits pushed
✅ **Tags:** À créer pour chaque version

### Créer des Tags de Version

```bash
# Tag la version actuelle
git tag -a v0.5.0 -m "Version 0.5.0 - Production ready"
git push origin v0.5.0

# Lister les tags
git tag -l
```

### GitHub Actions - Auto Backup (Recommandé)

Créer `.github/workflows/backup.yml`:

```yaml
name: Daily Backup

on:
  schedule:
    - cron: '0 3 * * *'  # Tous les jours à 3h du matin
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Backup database
        run: |
          pg_dump ${{ secrets.DATABASE_URL }} > backup.sql

      - name: Upload to S3/Drive
        # Script pour uploader le backup
```

---

## ⚙️ 4. CONFIGURATION BACKUP

### Fichiers à Sauvegarder Manuellement

```bash
# Variables d'environnement
cp .env.local .env.backup

# Configuration Supabase
# Sauvegarder manuellement depuis Dashboard:
# - Project Settings → API
# - Database → Connection String
# - Storage → Policies
```

### Checklist de Configuration à Noter

- [ ] **Supabase Project URL**
- [ ] **Supabase Anon Key**
- [ ] **Supabase Service Role Key** (🔒 Secret!)
- [ ] **Database Password**
- [ ] **Storage Bucket Names**
- [ ] **RLS Policies** (déjà dans `supabase-schema.sql`)

**⚠️ Stocker dans un gestionnaire de mots de passe sécurisé (1Password, Bitwarden)**

---

## 🔄 5. PROCÉDURE DE RESTAURATION

### Restaurer la Database

```bash
# 1. Télécharger le backup depuis Supabase Dashboard
# Settings → Database → Backups → Download

# 2. Restaurer via pg_restore
pg_restore -h db.YOUR_PROJECT_REF.supabase.co \
           -U postgres \
           -d postgres \
           -v backup_20260209.dump

# 3. Vérifier les données
psql -h db.YOUR_PROJECT_REF.supabase.co \
     -U postgres \
     -d postgres \
     -c "SELECT COUNT(*) FROM profiles;"
```

### Restaurer le Storage

```bash
# Upload via Supabase Dashboard ou CLI
supabase storage upload inventory-images backup/*
```

### Restaurer le Code

```bash
# Revenir à une version précédente
git checkout v0.5.0

# Ou restaurer depuis GitHub
git clone https://github.com/PayzzTTV/Klub2.git
cd Klub2
npm install
```

---

## 📊 6. MONITORING & ALERTES

### Supabase Dashboard

Surveiller quotidiennement :
- ✅ **Database size** (< 500MB Free tier)
- ✅ **Storage usage** (< 1GB Free tier)
- ✅ **API requests** (< 50k/month Free tier)
- ✅ **Backup status** (Last backup < 24h)

### Email Alerts (Supabase)

Configurer dans **Project Settings → Email Alerts**:
- ✅ Database size > 80%
- ✅ Storage size > 80%
- ✅ Backup failed
- ✅ Downtime detected

---

## 🚨 7. DISASTER RECOVERY PLAN

### Scénario 1: Perte de Données (< 24h)

**Temps de récupération:** ~10 minutes

1. Aller sur Supabase Dashboard → Backups
2. Sélectionner le backup le plus récent
3. Cliquer "Restore"
4. Attendre la restauration (5-10 min)
5. Vérifier les données dans l'app

### Scénario 2: Projet Supabase Supprimé

**Temps de récupération:** ~2 heures

1. Créer un nouveau projet Supabase
2. Restaurer le schema: `psql < supabase-schema.sql`
3. Restaurer le backup database
4. Restaurer le storage (upload manuel)
5. Mettre à jour `.env.local` avec nouvelles clés
6. Redéployer sur Vercel

### Scénario 3: Code Repository Perdu

**Temps de récupération:** ~30 minutes

1. Cloner depuis GitHub: `git clone https://github.com/PayzzTTV/Klub2.git`
2. Ou utiliser backup local
3. Re-push sur nouveau repo si nécessaire

---

## ✅ CHECKLIST PRÉ-PRODUCTION

### Avant le Déploiement

- [ ] Vérifier dernier backup database (< 24h)
- [ ] Créer un tag Git de la version
- [ ] Sauvegarder `.env.local` en lieu sûr
- [ ] Noter toutes les clés API
- [ ] Tester la restauration backup (dry-run)
- [ ] Configurer monitoring/alertes
- [ ] Documenter procédure de récupération

### Après le Déploiement

- [ ] Vérifier backup automatique fonctionne
- [ ] Tester alertes email
- [ ] Créer backup manuel initial
- [ ] Planifier backup mensuel complet

---

## 📅 CALENDRIER DE MAINTENANCE

| Action | Fréquence | Responsable |
|--------|-----------|-------------|
| Vérifier backups auto | Hebdomadaire | DevOps |
| Backup manuel database | Mensuel | Admin |
| Test de restauration | Trimestriel | Dev Team |
| Audit sécurité | Trimestriel | Security |
| Nettoyage vieux backups | Mensuel | DevOps |

---

## 🔐 SÉCURITÉ DES BACKUPS

### Bonnes Pratiques

✅ **Chiffrement:** Backups Supabase chiffrés par défaut
✅ **Accès:** Limiter l'accès aux backups (IAM roles)
✅ **Storage:** Stocker dans 2 endroits différents (S3 + Drive)
✅ **Test:** Tester la restauration tous les 3 mois
❌ **Jamais:** Commit les backups dans Git
❌ **Jamais:** Partager les clés de backup publiquement

---

## 📞 CONTACTS D'URGENCE

**Supabase Support:** support@supabase.io
**GitHub Support:** https://support.github.com
**Team Lead:** [À définir]

---

## 📝 HISTORIQUE DES RESTAURATIONS

| Date | Type | Raison | Durée | Statut |
|------|------|--------|-------|--------|
| - | - | - | - | - |

---

**Conclusion:** ✅ KLUB dispose d'une stratégie de backup robuste avec Supabase auto-backup, GitHub versioning, et procédures de récupération documentées.

**Temps de récupération estimé (RTO):** < 2 heures
**Perte de données maximale (RPO):** < 24 heures

**Prochaine action:** Tester la restauration d'un backup (dry-run) avant production.
