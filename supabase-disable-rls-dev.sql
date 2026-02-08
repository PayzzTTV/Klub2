-- ============================================================================
-- DÉSACTIVER COMPLÈTEMENT LE RLS POUR LE DÉVELOPPEMENT
-- ⚠️ À RÉACTIVER EN PRODUCTION !
-- ============================================================================

-- 1. Supprimer TOUTES les politiques sur profiles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- 2. DÉSACTIVER le RLS sur la table profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Vérifier que le RLS est bien désactivé
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'profiles';

-- 4. Vérifier qu'il n'y a plus de politiques
SELECT COUNT(*) as nombre_politiques
FROM pg_policies
WHERE tablename = 'profiles';
