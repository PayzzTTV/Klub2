-- ============================================================================
-- KLB-01 : Toutes les policies RLS s'appliquaient au rôle `anon`
-- ============================================================================
-- Aucune policy n'était restreinte par `TO authenticated`. PostgreSQL les
-- attachait donc au rôle `public`, qui inclut `anon`. Combiné à la policy
-- `USING (role = 'ORGA' OR auth.uid() = id)` sur profiles, n'importe qui
-- pouvait aspirer email + téléphone de tous les ORGA avec la seule clé anon,
-- publique par construction puisqu'elle est servie dans le bundle JS.
--
-- Cette migration recrée l'intégralité des policies avec `TO authenticated`,
-- et retire tout privilège au rôle `anon` sur le schéma public.
--
-- Note : l'exposition des colonnes de contact aux membres *authentifiés* reste
-- volontaire (la messagerie a été retirée du scope, le contact direct est le
-- mécanisme de mise en relation). Gater email/phone derrière une candidature
-- acceptée serait un durcissement supplémentaire, mais c'est une décision
-- produit et non un correctif de sécurité.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Table rase : supprimer toutes les policies existantes du schéma public
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2. RLS actif et forcé sur les 8 tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. Le rôle `anon` n'a plus aucun accès aux données applicatives
-- ---------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES    FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT TO authenticated
  USING (role = 'ORGA' OR auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Le verrouillage colonne par colonne (role, verified, email) est appliqué
-- dans la migration 20260903120100_lock_privileged_columns.sql
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- PROJECTS
-- ---------------------------------------------------------------------------
CREATE POLICY "projects_select_published_or_own"
  ON public.projects FOR SELECT TO authenticated
  USING (status <> 'draft' OR auth.uid() = bde_id);

CREATE POLICY "projects_insert_bde"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = bde_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'BDE'
    )
    AND public.can_post_new_project(auth.uid())
  );

CREATE POLICY "projects_update_own"
  ON public.projects FOR UPDATE TO authenticated
  USING (auth.uid() = bde_id)
  WITH CHECK (auth.uid() = bde_id);

CREATE POLICY "projects_delete_own"
  ON public.projects FOR DELETE TO authenticated
  USING (auth.uid() = bde_id);

-- ---------------------------------------------------------------------------
-- INVENTORY
-- ---------------------------------------------------------------------------
CREATE POLICY "inventory_select_available_or_own"
  ON public.inventory FOR SELECT TO authenticated
  USING (available = TRUE OR auth.uid() = owner_id);

CREATE POLICY "inventory_insert_own"
  ON public.inventory FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "inventory_update_own"
  ON public.inventory FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "inventory_delete_own"
  ON public.inventory FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- REVIEWS  (la policy d'insertion durcie arrive en 20260903120200)
-- ---------------------------------------------------------------------------
CREATE POLICY "reviews_select_authenticated"
  ON public.reviews FOR SELECT TO authenticated
  USING (TRUE);

-- Immuabilité : aucune policy UPDATE ni DELETE n'est créée.
-- RLS refuse par défaut ce qu'aucune policy n'autorise.

-- ---------------------------------------------------------------------------
-- RENTALS  (les policies d'écriture durcies arrivent en 20260903120200)
-- ---------------------------------------------------------------------------
CREATE POLICY "rentals_select_party"
  ON public.rentals FOR SELECT TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- PROJECT_APPLICATIONS
-- ---------------------------------------------------------------------------
CREATE POLICY "applications_select_party"
  ON public.project_applications FOR SELECT TO authenticated
  USING (
    auth.uid() = orga_id
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_applications.project_id AND bde_id = auth.uid()
    )
  );

CREATE POLICY "applications_insert_orga"
  ON public.project_applications FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = orga_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ORGA'
    )
  );

-- L'ORGA peut retirer sa candidature ; le BDE propriétaire du projet statue.
CREATE POLICY "applications_update_party"
  ON public.project_applications FOR UPDATE TO authenticated
  USING (
    auth.uid() = orga_id
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_applications.project_id AND bde_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = orga_id
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_applications.project_id AND bde_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- CONVERSATIONS / MESSAGES
-- ---------------------------------------------------------------------------
CREATE POLICY "conversations_select_participant"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "conversations_insert_self"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant1_id);

CREATE POLICY "conversations_update_participant"
  ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id)
    )
  );

CREATE POLICY "messages_insert_sender"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id)
    )
  );

CREATE POLICY "messages_update_participant"
  ON public.messages FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id)
    )
  );

COMMIT;
