-- ============================================================================
-- FIX TRIGGER - Version robuste avec gestion d'erreurs
-- ============================================================================

-- 1. Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Créer une fonction plus robuste avec gestion d'erreurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Convertir le rôle depuis les metadata
  BEGIN
    user_role_value := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'ORGA'::user_role);
  EXCEPTION WHEN OTHERS THEN
    user_role_value := 'ORGA'::user_role;
  END;

  -- Insérer le profil
  INSERT INTO public.profiles (
    id,
    email,
    name,
    organization_name,
    role,
    location
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'organization_name', 'Organisation'),
    user_role_value,
    COALESCE(NEW.raw_user_meta_data->>'location', '')
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Logger l'erreur mais ne pas bloquer la création de l'utilisateur
  RAISE WARNING 'Erreur lors de la création du profil pour %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 3. Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Vérifier que tout est OK
SELECT
  'Trigger créé' as status,
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Vérifier le RLS
SELECT
  'RLS Status' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'profiles';
