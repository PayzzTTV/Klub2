# 🗄️ Configuration Supabase Storage - KLUB

Ce guide explique comment configurer le **Supabase Storage** pour l'upload d'images d'équipement.

---

## 📦 Pourquoi Supabase Storage ?

Le Storage Supabase permet de :
- ✅ Stocker des images de matériel (max 5 images par annonce)
- ✅ Générer des URLs publiques automatiquement
- ✅ Limiter la taille des fichiers (5MB/image)
- ✅ Sécuriser l'upload avec RLS (Row Level Security)
- ✅ Supprimer automatiquement les images orphelines

---

## 🚀 Installation (5 minutes)

### Étape 1: Créer le Bucket

1. Ouvrez votre projet Supabase
2. Allez dans **Storage** (icône dossier à gauche)
3. Cliquez sur **"New Bucket"**
4. Configurez :
   - **Bucket name:** `inventory-images`
   - **Public bucket:** ✅ Coché (pour accès public aux images)
   - **File size limit:** `5 MB`
   - **Allowed MIME types:** `image/jpeg, image/jpg, image/png, image/webp, image/gif`
5. Cliquez **"Save"**

---

### Étape 2: Configurer les Politiques RLS

#### Méthode Automatique (Recommandée)

1. Ouvrez **SQL Editor** dans Supabase
2. Copiez-collez le contenu du fichier `supabase-storage-setup.sql`
3. Cliquez **"Run"**
4. ✅ Vérifiez qu'il n'y a pas d'erreurs

#### Méthode Manuelle

Si vous préférez configurer manuellement :

1. Allez dans **Storage > Policies**
2. Sélectionnez le bucket `inventory-images`
3. Ajoutez ces 4 politiques :

**Policy 1: Public Read (SELECT)**
```sql
CREATE POLICY "Public Access to Inventory Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'inventory-images');
```

**Policy 2: Authenticated Upload (INSERT)**
```sql
CREATE POLICY "Authenticated users can upload inventory images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'inventory-images' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
```

**Policy 3: Own Files Update (UPDATE)**
```sql
CREATE POLICY "Users can update their own inventory images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'inventory-images' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'inventory-images' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
```

**Policy 4: Own Files Delete (DELETE)**
```sql
CREATE POLICY "Users can delete their own inventory images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'inventory-images' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
```

---

## 🧪 Tester le Storage

### Test 1: Vérifier les Buckets

Dans Supabase > Storage, vous devriez voir :
- ✅ `inventory-images` (Public, 5MB limit)
- (Optionnel) `avatars` (Public, 2MB limit)

### Test 2: Créer une annonce avec images

1. Lancez l'app en local : `npm run dev`
2. Connectez-vous avec un compte BDE ou ORGA
3. Allez sur `/rental/create`
4. Remplissez le formulaire et uploadez 1-3 images
5. Cliquez **"Publier l'annonce"**
6. ✅ Vous devriez être redirigé vers la page détail du matériel

### Test 3: Vérifier les images dans Supabase

1. Allez dans **Storage > inventory-images**
2. Vous devriez voir un dossier nommé `{user_id}/`
3. À l'intérieur, vos images uploadées (format: `timestamp_random.jpg`)
4. Cliquez sur une image → **"Get public URL"**
5. ✅ L'URL doit être accessible publiquement

---

## 📂 Structure des Fichiers

Le Storage est organisé ainsi :

```
inventory-images/
├── {user_id_1}/
│   ├── 1712345678_a1b2c3.jpg
│   ├── 1712345679_d4e5f6.png
│   └── 1712345680_g7h8i9.webp
├── {user_id_2}/
│   └── 1712345681_j0k1l2.jpg
└── ...
```

**Avantages :**
- Chaque utilisateur a son propre dossier (RLS)
- Noms de fichiers uniques (timestamp + random)
- Facile de supprimer toutes les images d'un utilisateur

---

## 🔐 Sécurité RLS Expliquée

### Qui peut faire quoi ?

| Action | Qui ? | Condition |
|--------|-------|-----------|
| **Voir les images** | Tout le monde (public) | Aucune |
| **Upload une image** | Utilisateur connecté | Seulement dans son propre dossier (`/user_id/`) |
| **Modifier une image** | Utilisateur connecté | Seulement ses propres images |
| **Supprimer une image** | Utilisateur connecté | Seulement ses propres images |

### Exemple de Protection

❌ **Impossible :**
```typescript
// Un utilisateur A ne peut PAS uploader dans le dossier d'un utilisateur B
supabase.storage.from('inventory-images')
  .upload('user_B_id/hack.jpg', file)
// Error: RLS policy violation
```

✅ **Autorisé :**
```typescript
// Un utilisateur A peut uploader dans SON dossier
supabase.storage.from('inventory-images')
  .upload('user_A_id/my_image.jpg', file)
// Success!
```

---

## 🛠️ Troubleshooting

### Erreur: "Policy violation" lors de l'upload

**Cause:** Les politiques RLS ne sont pas correctement configurées.

**Solution:**
1. Vérifiez que les 4 politiques existent dans Storage > Policies
2. Exécutez à nouveau `supabase-storage-setup.sql`
3. Vérifiez que l'utilisateur est bien authentifié (`auth.uid()` retourne une valeur)

---

### Erreur: "File size too large"

**Cause:** L'image dépasse 5MB.

**Solution:**
- Compressez l'image avec [TinyPNG](https://tinypng.com/)
- Ou modifiez la limite dans le bucket (Storage > Settings)

---

### Erreur: "Bucket not found"

**Cause:** Le bucket `inventory-images` n'existe pas.

**Solution:**
1. Allez dans Storage
2. Créez le bucket manuellement (voir Étape 1)
3. Ou exécutez `supabase-storage-setup.sql`

---

### Les images ne s'affichent pas

**Cause:** Les URLs générées ne sont pas correctes.

**Solution:**
1. Vérifiez que le bucket est **PUBLIC**
2. Testez l'URL dans le navigateur (doit afficher l'image)
3. Exemple d'URL valide :
   ```
   https://project-id.supabase.co/storage/v1/object/public/inventory-images/user_id/image.jpg
   ```

---

## 🔄 Nettoyage des Images Orphelines (Optionnel)

Si une annonce est supprimée mais que les images restent dans le Storage, vous pouvez créer une fonction PostgreSQL pour le nettoyage automatique.

**TODO (Phase future):**
```sql
-- Créer une fonction trigger qui supprime les images
-- quand un item de l'inventory est deleted
```

---

## ✅ Checklist de Validation

Avant de passer à la suite, vérifiez :

- [ ] Le bucket `inventory-images` existe et est PUBLIC
- [ ] Les 4 politiques RLS sont actives
- [ ] Vous pouvez créer une annonce avec images depuis `/rental/create`
- [ ] Les images s'affichent correctement sur `/rental/[id]`
- [ ] Les images sont bien stockées dans `{user_id}/` folders
- [ ] Les URLs publiques sont accessibles

---

## 📚 Ressources

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [RLS Policies pour Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Upload depuis JavaScript](https://supabase.com/docs/reference/javascript/storage-from-upload)

---

**Dernière mise à jour:** 2026-02-08
**Version:** 1.0.0
**Statut:** ✅ Prêt pour production
