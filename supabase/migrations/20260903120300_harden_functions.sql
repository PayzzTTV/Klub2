-- ============================================================================
-- KLB-13 : SECURITY DEFINER sans search_path figé
-- ============================================================================
-- handle_new_user() s'exécute avec les privilèges de son propriétaire mais ne
-- fixait pas son search_path (motif `function_search_path_mutable` du linter
-- Supabase) : un schéma placé en amont du chemin de recherche permet de
-- détourner la résolution des objets appelés.
--
-- Deux versions contradictoires coexistaient dans le dépôt
-- (supabase-auto-profile-trigger.sql et supabase-fix-trigger-v2.sql) sans
-- qu'on puisse déterminer laquelle était déployée. Cette migration fait foi.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Création automatique du profil au signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, organization_name, role, location)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 'Utilisateur'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'organization_name', ''), 'Organisation'),
    -- Le rôle est déclaré au signup puis devient immuable (cf. KLB-02).
    -- Une valeur hors énumération retombe sur le rôle le moins privilégié.
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', '')::user_role,
      'ORGA'
    ),
    COALESCE(NEW.raw_user_meta_data->>'location', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN invalid_text_representation THEN
    -- Rôle non reconnu : on crée quand même le profil, en ORGA
    INSERT INTO public.profiles (id, email, name, organization_name, role, location)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 'Utilisateur'),
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'organization_name', ''), 'Organisation'),
      'ORGA',
      COALESCE(NEW.raw_user_meta_data->>'location', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Verrou du feedback obligatoire : search_path figé également
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_post_new_project(bde_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_feedback_count INTEGER;
BEGIN
  SELECT COUNT(*)
    INTO pending_feedback_count
    FROM projects
   WHERE bde_id = bde_uuid
     AND status = 'completed'
     AND feedback_given = FALSE;

  RETURN pending_feedback_count = 0;
END;
$$;

-- La fonction est appelée depuis la policy d'insertion de projects : elle doit
-- rester exécutable par les sessions authentifiées, et par elles seules.
REVOKE ALL ON FUNCTION public.can_post_new_project(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_post_new_project(UUID) TO authenticated;

COMMIT;
