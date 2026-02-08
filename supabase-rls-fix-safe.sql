-- ============================================================================
-- FIX RLS POLICIES - KLUB Platform (VERSION SAFE)
-- ============================================================================
-- Ce script corrige les politiques RLS de manière sécurisée
-- Il supprime TOUTES les politiques existantes avant de les recréer
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
-- ============================================================================

-- PROFILES
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- CONVERSATIONS
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON conversations';
    END LOOP;
END $$;

-- MESSAGES
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON messages';
    END LOOP;
END $$;

-- PROJECTS
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'projects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON projects';
    END LOOP;
END $$;

-- INVENTORY
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'inventory') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON inventory';
    END LOOP;
END $$;

-- REVIEWS
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'reviews') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON reviews';
    END LOOP;
END $$;

-- RENTALS
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'rentals') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON rentals';
    END LOOP;
END $$;

-- PROJECT_APPLICATIONS
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'project_applications') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON project_applications';
    END LOOP;
END $$;

-- ============================================================================
-- ÉTAPE 2 : RECRÉER LES POLITIQUES CORRECTES
-- ============================================================================

-- ============================================================================
-- PROFILES
-- ============================================================================

CREATE POLICY "Public can view ORGA profiles"
ON profiles FOR SELECT
USING (role = 'ORGA' OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================

CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
USING (
  auth.uid() = participant1_id
  OR auth.uid() = participant2_id
);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (
  auth.uid() = participant1_id
);

CREATE POLICY "Users can update their conversations"
ON conversations FOR UPDATE
USING (
  auth.uid() = participant1_id
  OR auth.uid() = participant2_id
);

-- ============================================================================
-- MESSAGES
-- ============================================================================

CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  )
);

CREATE POLICY "Users can update message read status"
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  )
);

-- ============================================================================
-- PROJECTS
-- ============================================================================

CREATE POLICY "Public can view published projects"
ON projects FOR SELECT
USING (
  status = 'published'
  OR auth.uid() = bde_id
);

CREATE POLICY "BDE can create projects"
ON projects FOR INSERT
WITH CHECK (
  auth.uid() = bde_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'BDE'
  )
);

CREATE POLICY "BDE can update their own projects"
ON projects FOR UPDATE
USING (auth.uid() = bde_id);

-- ============================================================================
-- INVENTORY
-- ============================================================================

CREATE POLICY "Public can view available inventory"
ON inventory FOR SELECT
USING (
  available = true
  OR auth.uid() = owner_id
);

CREATE POLICY "Users can create inventory"
ON inventory FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their inventory"
ON inventory FOR UPDATE
USING (auth.uid() = owner_id);

-- ============================================================================
-- REVIEWS
-- ============================================================================

CREATE POLICY "Public can view reviews"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "BDE can create reviews"
ON reviews FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'BDE'
  )
  AND EXISTS (
    SELECT 1 FROM projects
    WHERE id = reviews.project_id
    AND bde_id = auth.uid()
    AND status = 'completed'
  )
);

-- ============================================================================
-- RENTALS
-- ============================================================================

CREATE POLICY "Users can view their rentals"
ON rentals FOR SELECT
USING (
  auth.uid() = renter_id
  OR auth.uid() = owner_id
);

CREATE POLICY "Users can create rentals"
ON rentals FOR INSERT
WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users can update their rentals"
ON rentals FOR UPDATE
USING (
  auth.uid() = renter_id
  OR auth.uid() = owner_id
);

-- ============================================================================
-- PROJECT_APPLICATIONS
-- ============================================================================

CREATE POLICY "Users can view relevant applications"
ON project_applications FOR SELECT
USING (
  auth.uid() = orga_id
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_applications.project_id
    AND bde_id = auth.uid()
  )
);

CREATE POLICY "ORGA can create applications"
ON project_applications FOR INSERT
WITH CHECK (
  auth.uid() = orga_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'ORGA'
  )
);

CREATE POLICY "Users can update applications"
ON project_applications FOR UPDATE
USING (
  auth.uid() = orga_id
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_applications.project_id
    AND bde_id = auth.uid()
  )
);

-- ============================================================================
-- VÉRIFICATIONS
-- ============================================================================

-- Afficher toutes les politiques créées
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
