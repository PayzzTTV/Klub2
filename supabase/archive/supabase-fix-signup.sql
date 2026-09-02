-- ============================================================================
-- FIX SIGNUP - Permettre la création de profils
-- ============================================================================
-- Ce script corrige les politiques RLS pour permettre l'inscription
-- ============================================================================

-- Supprimer l'ancienne politique d'insertion
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Créer une nouvelle politique qui permet l'insertion lors du signup
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Vérifier que la politique est bien créée
SELECT
  schemaname,
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE cmd
  END as operation
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
