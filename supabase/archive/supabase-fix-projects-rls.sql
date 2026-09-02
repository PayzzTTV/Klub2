-- ============================================================================
-- FIX: Politique RLS pour la création de projets par les BDE
-- Exécuter dans l'éditeur SQL de Supabase
-- ============================================================================

-- Supprimer les politiques existantes sur projects
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'projects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON projects';
    END LOOP;
END $$;

-- Recréer les politiques correctes

-- Lecture: tout le monde peut voir les projets publiés + le BDE voit les siens
CREATE POLICY "Published projects are viewable by everyone"
  ON projects FOR SELECT
  USING (status != 'draft' OR auth.uid() = bde_id);

-- Insertion: BDE peuvent créer des projets si leur profil est BDE
-- et s'il n'y a pas de feedback en attente
CREATE POLICY "BDE can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    auth.uid() = bde_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'BDE'
    )
    AND can_post_new_project(auth.uid())
  );

-- Modification: seulement le créateur
CREATE POLICY "BDE can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = bde_id);

-- Suppression: seulement le créateur
CREATE POLICY "BDE can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = bde_id);

-- Vérifier les politiques créées
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'projects';
