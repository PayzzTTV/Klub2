-- ============================================
-- KLUB - Supabase Storage Configuration
-- ============================================
-- Bucket pour les images d'inventaire
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

-- ============================================
-- Bucket pour les avatars (OPTIONNEL - FUTUR)
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Policy: Public read
CREATE POLICY "Public Access to Avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- ============================================
-- Notes d'utilisation
-- ============================================
-- 1. Exécuter ce script dans Supabase SQL Editor
-- 2. Vérifier que les buckets apparaissent dans Storage
-- 3. Les images seront stockées avec la structure:
--    inventory-images/{user_id}/{timestamp}_{random}.{ext}
-- 4. URLs publiques accessibles via getPublicUrl()
