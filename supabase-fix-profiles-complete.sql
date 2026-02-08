-- ============================================================================
-- FIX COMPLET - Profiles et Signup
-- ============================================================================

-- 1. Supprimer toutes les anciennes politiques sur profiles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- 2. Créer des politiques simples et permissives pour le développement
-- LECTURE : Tous peuvent lire les profils ORGA, chacun peut lire son propre profil
CREATE POLICY "Anyone can view ORGA profiles"
ON profiles FOR SELECT
USING (role = 'ORGA' OR auth.uid() = id);

-- INSERTION : Chaque utilisateur authentifié peut créer SON PROPRE profil
CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- MODIFICATION : Chaque utilisateur peut modifier son propre profil
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Vérifier les politiques
SELECT
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE cmd
  END as operation,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
