# 🚀 Guide de Configuration KLUB - Supabase Storage

Ce guide te permettra de configurer complètement le Storage Supabase en **5 minutes** pour tester le système de location.

---

## 📋 Prérequis

- ✅ Compte Supabase créé
- ✅ Projet KLUB créé dans Supabase
- ✅ Tables créées via `supabase-schema.sql`
- ✅ Variables d'environnement configurées dans `.env.local`

---

## 🗄️ ÉTAPE 1: Créer le Bucket Storage

### Option A: Via l'Interface Supabase (Recommandé)

1. **Ouvre ton projet Supabase** sur https://supabase.com/dashboard

2. **Va dans Storage** (icône 📁 dans le menu de gauche)

3. **Clique sur "New Bucket"**

4. **Configure le bucket:**
   ```
   Name: inventory-images
   Public bucket: ✅ COCHÉ
   File size limit: 5 MB
   Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif
   ```

5. **Clique "Create bucket"**

6. ✅ **Vérifie** que le bucket `inventory-images` apparaît dans la liste

---

### Option B: Via SQL (Automatique)

Si tu préfères créer le bucket via SQL, tu peux exécuter cette commande dans **SQL Editor** :

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inventory-images',
  'inventory-images',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;
```

---

## 🔐 ÉTAPE 2: Configurer les Politiques RLS

### Méthode Rapide (1 clic)

1. **Ouvre SQL Editor** dans Supabase

2. **Copie tout le contenu du fichier `supabase-storage-setup.sql`**

3. **Colle dans SQL Editor**

4. **Clique "Run"** (ou Ctrl+Enter)

5. ✅ **Vérifie qu'il n'y a pas d'erreurs** dans la sortie

---

### Vérification des Politiques

1. Va dans **Storage > Policies**

2. Sélectionne le bucket `inventory-images`

3. Tu devrais voir **4 politiques actives** :
   - ✅ Public Access to Inventory Images (SELECT)
   - ✅ Authenticated users can upload inventory images (INSERT)
   - ✅ Users can update their own inventory images (UPDATE)
   - ✅ Users can delete their own inventory images (DELETE)

---

## 🧪 ÉTAPE 3: Tester le Storage

### Test 1: Upload depuis l'interface Supabase

1. Va dans **Storage > inventory-images**

2. **Crée un dossier** avec ton `user_id` (récupère-le depuis `auth.users`)
   ```
   Exemple: 12345678-1234-1234-1234-123456789abc/
   ```

3. **Upload une image test** dans ce dossier

4. **Clique sur l'image** → "Get public URL"

5. **Copie l'URL** et ouvre-la dans un navigateur

6. ✅ **Vérifie** que l'image s'affiche correctement

---

### Test 2: Upload depuis l'application

1. **Lance l'application** :
   ```bash
   npm run dev
   ```

2. **Connecte-toi** avec un compte BDE ou ORGA

3. **Va sur `/rental/create`**

4. **Remplis le formulaire** :
   - Titre: "Test Équipement"
   - Catégorie: "Son"
   - Prix/jour: 100
   - Quantité: 1
   - Localisation: "Paris"
   - Description: "Ceci est un test"

5. **Upload 2-3 images** (n'importe lesquelles)

6. **Clique "Publier l'annonce"**

7. ✅ **Tu devrais être redirigé** vers `/rental/[id]` avec tes images affichées

---

## 🔍 ÉTAPE 4: Vérifier dans Supabase

1. **Va dans Storage > inventory-images**

2. **Ouvre le dossier** `{ton_user_id}/`

3. ✅ **Tu devrais voir** tes images uploadées avec des noms comme :
   ```
   1738234567890_abc123.jpg
   1738234567891_def456.png
   ```

---

## 🎯 ÉTAPE 5: Tester le Workflow Complet

### Scénario de Test

1. **En tant que Propriétaire (BDE/ORGA):**
   - ✅ Crée un équipement avec images sur `/rental/create`
   - ✅ Va sur `/rental/manage`
   - ✅ Vérifie l'onglet "📥 Demandes Reçues"

2. **En tant que Renter (autre compte):**
   - ✅ Va sur `/rental` et trouve l'équipement
   - ✅ Clique sur l'équipement
   - ✅ Clique "📅 Réserver maintenant"
   - ✅ Remplis les dates (ex: aujourd'hui → demain)
   - ✅ Accepte les conditions
   - ✅ Clique "Envoyer la demande"

3. **Retour au Propriétaire:**
   - ✅ Va sur `/rental/manage`
   - ✅ Tu devrais voir la demande dans "📥 Demandes Reçues"
   - ✅ Clique "✅ Approuver"
   - ✅ Le statut change en "✅ Approuvée"

4. **Vérifier le Calendrier:**
   - ✅ Va sur `/rental/[id]` de l'équipement
   - ✅ Clique "📅 Réserver maintenant"
   - ✅ Tu devrais voir **"📅 Dates déjà réservées"** avec la période bloquée

---

## 🐛 Troubleshooting

### Problème 1: "Policy violation" lors de l'upload

**Cause:** Les politiques RLS ne sont pas configurées correctement.

**Solution:**
```bash
# Vérifie que les politiques existent
1. Va dans Storage > Policies
2. Sélectionne 'inventory-images'
3. Vérifie qu'il y a 4 politiques actives
4. Si manquantes, réexécute supabase-storage-setup.sql
```

---

### Problème 2: "Bucket not found"

**Cause:** Le bucket `inventory-images` n'a pas été créé.

**Solution:**
```bash
1. Va dans Storage
2. Vérifie la liste des buckets
3. Si absent, crée-le manuellement (voir ÉTAPE 1)
```

---

### Problème 3: Images ne s'affichent pas

**Cause:** Le bucket n'est pas PUBLIC ou les URLs sont incorrectes.

**Solution:**
```bash
1. Va dans Storage > inventory-images
2. Clique sur "Settings" (⚙️)
3. Vérifie que "Public bucket" est ✅ COCHÉ
4. Sauvegarde si modifié
```

---

### Problème 4: "File too large"

**Cause:** L'image dépasse 5MB.

**Solution:**
```bash
1. Compresse l'image avec https://tinypng.com/
2. Ou augmente la limite dans Storage Settings
```

---

## ✅ Checklist de Validation

Avant de considérer la configuration terminée, vérifie :

- [ ] Le bucket `inventory-images` existe
- [ ] Le bucket est **PUBLIC**
- [ ] Les 4 politiques RLS sont actives
- [ ] Tu peux uploader une image via l'interface Supabase
- [ ] Tu peux créer un équipement depuis `/rental/create`
- [ ] Les images s'affichent dans `/rental/[id]`
- [ ] Tu peux faire une demande de location
- [ ] La demande apparaît dans `/rental/manage`
- [ ] Tu peux approuver/refuser une demande
- [ ] Les dates bloquées s'affichent correctement

---

## 📊 Structure Finale du Storage

```
storage/
└── inventory-images/ (PUBLIC)
    ├── user_id_1/
    │   ├── 1738234567890_abc123.jpg
    │   ├── 1738234567891_def456.png
    │   └── 1738234567892_ghi789.webp
    ├── user_id_2/
    │   └── 1738234567893_jkl012.jpg
    └── ...
```

**Organisation:**
- Chaque user a son propre dossier (`/user_id/`)
- Les noms de fichiers sont uniques (timestamp + random)
- Les URLs publiques sont accessibles sans auth

---

## 🎓 Bonnes Pratiques

### Sécurité

✅ **DO:**
- Toujours limiter la taille des fichiers (5MB max)
- Utiliser RLS pour contrôler l'accès
- Valider les types MIME côté client ET serveur
- Générer des noms de fichiers uniques

❌ **DON'T:**
- Ne jamais stocker de données sensibles dans un bucket PUBLIC
- Ne pas permettre l'upload sans authentification
- Ne pas accepter de fichiers > 5MB (risque de coût)

### Performance

✅ **Optimisations:**
- Compresser les images avant upload (TinyPNG)
- Utiliser WebP quand possible (meilleure compression)
- Lazy load les images avec `loading="lazy"`
- Utiliser des thumbnails pour les previews

---

## 📚 Ressources

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [RLS Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)
- [Upload Images with JavaScript](https://supabase.com/docs/reference/javascript/storage-from-upload)

---

## 🎉 C'est Prêt !

Une fois ces étapes terminées, ton système de rental avec upload d'images est **100% opérationnel** ! 🚀

**Prochaines étapes suggérées:**
1. Tester avec plusieurs utilisateurs
2. Vérifier les performances avec 10+ images
3. Implémenter la suppression d'images orphelines (Phase future)
4. Ajouter la compression automatique côté serveur (optionnel)

---

**Dernière mise à jour:** 2026-02-08
**Version:** 1.0.0
**Auteur:** Claude Code
