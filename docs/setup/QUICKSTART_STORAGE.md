# ⚡ Quick Start - Configuration Storage (5 minutes)

Ce guide rapide te permet de configurer le Supabase Storage en **5 minutes chrono** pour tester immédiatement le système de location.

---

## 🚀 Configuration Express

### Étape 1: Ouvre Supabase SQL Editor (1 min)

```bash
1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet KLUB
3. Clique sur "SQL Editor" dans la barre latérale gauche (icône </> )
```

---

### Étape 2: Exécute le Script SQL (2 min)

1. **Clique sur "New Query"**

2. **Copie-colle CE CODE** dans l'éditeur :

```sql
-- ============================================
-- KLUB - Supabase Storage Configuration
-- ============================================

-- 1. Créer le bucket 'inventory-images' (PUBLIC)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inventory-images',
  'inventory-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies pour 'inventory-images'

-- Policy: Tout le monde peut lire les images publiques
CREATE POLICY "Public Access to Inventory Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'inventory-images');

-- Policy: Utilisateurs authentifiés peuvent uploader leurs propres images
CREATE POLICY "Authenticated users can upload inventory images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'inventory-images' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres images
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

-- Policy: Les utilisateurs peuvent supprimer leurs propres images
CREATE POLICY "Users can delete their own inventory images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'inventory-images' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
```

3. **Clique sur "Run"** (ou appuie sur `Ctrl+Enter`)

4. **Vérifie** qu'il n'y a pas d'erreurs dans la sortie en bas

✅ **Résultat attendu:** "Success. No rows returned"

---

### Étape 3: Vérification (1 min)

1. **Va dans "Storage"** (icône 📁 dans la barre latérale)

2. **Tu devrais voir le bucket `inventory-images`**

3. **Clique dessus** et vérifie qu'il est vide (normal)

✅ **C'est prêt !** Le Storage est configuré.

---

### Étape 4: Test Rapide (1 min)

1. **Retourne dans ton terminal** (projet KLUB)

2. **Lance l'app** :
   ```bash
   npm run dev
   ```

3. **Ouvre** http://localhost:3000

4. **Connecte-toi** avec ton compte

✅ **Tu es prêt pour les tests !**

---

## 🧪 Test du Workflow Complet

### Test 1: Créer un Équipement avec Images

```bash
1. Va sur /rental/create
2. Remplis le formulaire :
   - Titre: "Test Sonorisation"
   - Catégorie: "Son"
   - Prix/jour: 150
   - Quantité: 1
   - Localisation: "Paris"
   - Description: "Test upload images"

3. Upload 2-3 images (n'importe lesquelles < 5MB)
4. Clique "Publier l'annonce"
5. ✅ Tu devrais voir tes images sur /rental/[id]
```

**Vérification dans Supabase:**
```bash
1. Va dans Storage > inventory-images
2. Tu devrais voir un dossier {ton_user_id}/
3. À l'intérieur: tes images uploadées
```

---

### Test 2: Demander une Location

**Compte A (Propriétaire):** Vient de créer l'équipement

**Compte B (Renter):**
```bash
1. Va sur /rental
2. Trouve l'équipement "Test Sonorisation"
3. Clique dessus
4. Clique "📅 Réserver maintenant"
5. Sélectionne des dates (ex: demain → après-demain)
6. Coche "J'accepte les conditions"
7. Clique "Envoyer la demande"
8. ✅ Tu devrais voir "Demande envoyée avec succès"
```

---

### Test 3: Gérer les Locations (Owner Side)

**Retour au Compte A (Propriétaire):**
```bash
1. Va sur /rental/manage
2. Onglet "📥 Demandes Reçues"
3. Tu devrais voir la demande du Compte B
4. Détails visibles:
   - Nom du renter
   - Dates demandées
   - Prix total calculé
   - Email + téléphone du renter

5. Clique "✅ Approuver"
6. ✅ Le statut change en "✅ Approuvée"
```

---

### Test 4: Voir les Dates Bloquées

**N'importe quel compte:**
```bash
1. Va sur /rental
2. Clique sur "Test Sonorisation"
3. Clique "📅 Réserver maintenant"
4. Tu devrais voir une section:
   "📅 Dates déjà réservées"
   avec les dates du Test 2
5. ✅ Confirmation que le calendrier fonctionne
```

---

### Test 5: Suivre ses Demandes (Renter Side)

**Compte B (Renter):**
```bash
1. Va sur /rental/manage
2. Onglet "📤 Mes Demandes"
3. Tu devrais voir ta demande pour "Test Sonorisation"
4. Statut: "✅ Approuvée"
5. ✅ Confirmation que le système bidirectionnel fonctionne
```

---

## ✅ Checklist de Validation

Coche chaque test au fur et à mesure :

- [ ] Storage bucket créé dans Supabase
- [ ] 4 politiques RLS actives
- [ ] Upload d'images fonctionne (/rental/create)
- [ ] Images visibles sur /rental/[id]
- [ ] Images stockées dans Supabase Storage
- [ ] Demande de location envoyée
- [ ] Demande visible dans /rental/manage (owner)
- [ ] Approbation de demande fonctionne
- [ ] Dates bloquées s'affichent
- [ ] Demande visible dans /rental/manage (renter)

---

## 🐛 Problèmes Courants

### Erreur: "Policy violation"

**Solution:**
```bash
1. Retourne dans SQL Editor
2. Réexécute le script SQL
3. Vérifie dans Storage > Policies qu'il y a 4 politiques
```

---

### Erreur: "Bucket not found"

**Solution:**
```bash
1. Va dans Storage
2. Clique "New Bucket"
3. Nom: inventory-images
4. Public: ✅ COCHÉ
5. File size limit: 5 MB
6. Save
```

---

### Images ne s'affichent pas

**Solution:**
```bash
1. Va dans Storage > inventory-images
2. Clique "Settings" (⚙️)
3. Vérifie "Public bucket" est ✅ COCHÉ
4. Save
5. Recharge la page /rental/[id]
```

---

### "File too large"

**Solution:**
```bash
1. Compresse tes images avec https://tinypng.com/
2. Ou utilise des images < 5MB
```

---

## 🎉 C'est Terminé !

Si tous les tests passent, **ton système de Rental Hub est 100% opérationnel** ! 🚀

**Prochaines étapes suggérées:**
1. Teste avec plusieurs équipements
2. Teste avec plusieurs utilisateurs
3. Vérifie le responsive design
4. Passe à Phase 9 (Optimisations)

---

## 📞 Besoin d'Aide ?

Si tu rencontres un problème :

1. **Vérifie les logs** dans la console navigateur (F12)
2. **Vérifie les logs** Supabase (Dashboard > Logs)
3. **Consulte** [GUIDE_CONFIGURATION.md](GUIDE_CONFIGURATION.md) pour plus de détails
4. **Consulte** [PROCHAINES_TACHES.md](PROCHAINES_TACHES.md) pour les bugs connus

---

**Temps total:** ~5 min configuration + 10 min tests = **15 minutes** ⏱️

**Dernière mise à jour:** 2026-02-08
