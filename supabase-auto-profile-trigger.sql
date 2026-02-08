-- ============================================================================
-- TRIGGER AUTOMATIQUE - Création de profil lors du signup
-- ============================================================================
-- Cette solution utilise un trigger PostgreSQL qui crée automatiquement
-- un profil dans la table `profiles` dès qu'un utilisateur est créé dans auth.users
-- C'est la méthode RECOMMANDÉE par Supabase

-- 1. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Créer la fonction qui sera appelée par le trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'ORGA'),
    COALESCE(NEW.raw_user_meta_data->>'location', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger qui s'exécute APRÈS la création d'un utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Vérifier que le trigger est bien créé
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
