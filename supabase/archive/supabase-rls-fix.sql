-- ============================================================================
-- FIX RLS POLICIES - KLUB Platform
-- ============================================================================
-- Ce script corrige les politiques RLS pour permettre :
-- 1. La lecture publique des profils ORGA (nécessaire pour la recherche)
-- 2. La création de conversations entre utilisateurs authentifiés
-- 3. L'accès aux messages pour les participants
-- ============================================================================

-- ============================================================================
-- PROFILES - Politiques corrigées
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Public can view ORGA profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Lecture : Profils ORGA publics, profils BDE seulement pour le propriétaire
CREATE POLICY "Public can view ORGA profiles"
ON profiles FOR SELECT
USING (role = 'ORGA' OR auth.uid() = id);

-- Création : Utilisateur peut créer son propre profil
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Modification : Utilisateur peut modifier son propre profil
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================================================
-- CONVERSATIONS - Politiques corrigées
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Lecture : Seulement les conversations où l'utilisateur est participant
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
USING (
  auth.uid() = participant1_id
  OR auth.uid() = participant2_id
);

-- Création : Utilisateur authentifié peut créer une conversation
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (
  auth.uid() = participant1_id
);

-- Modification : Seulement les participants peuvent modifier (pour last_message_at)
CREATE POLICY "Users can update their conversations"
ON conversations FOR UPDATE
USING (
  auth.uid() = participant1_id
  OR auth.uid() = participant2_id
);

-- ============================================================================
-- MESSAGES - Politiques corrigées
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update message read status" ON messages;

-- Lecture : Seulement les messages des conversations où l'utilisateur est participant
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  )
);

-- Création : Utilisateur peut envoyer un message dans ses conversations
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

-- Modification : Utilisateur peut marquer comme lu les messages reçus
CREATE POLICY "Users can update message read status"
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  )
);

-- ============================================================================
-- PROJECTS - Politiques pour lecture publique
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Public can view published projects" ON projects;
DROP POLICY IF EXISTS "BDE can create projects" ON projects;
DROP POLICY IF EXISTS "BDE can update their own projects" ON projects;

-- Lecture : Tout le monde peut voir les projets publiés
CREATE POLICY "Public can view published projects"
ON projects FOR SELECT
USING (
  status = 'published'
  OR auth.uid() = bde_id
);

-- Création : Seulement les BDE peuvent créer des projets
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

-- Modification : Seulement le créateur peut modifier
CREATE POLICY "BDE can update their own projects"
ON projects FOR UPDATE
USING (auth.uid() = bde_id);

-- ============================================================================
-- INVENTORY - Politiques pour catalogue public
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Public can view available inventory" ON inventory;
DROP POLICY IF EXISTS "Users can create inventory" ON inventory;
DROP POLICY IF EXISTS "Owners can update their inventory" ON inventory;

-- Lecture : Tout le monde peut voir le matériel disponible
CREATE POLICY "Public can view available inventory"
ON inventory FOR SELECT
USING (
  available = true
  OR auth.uid() = owner_id
);

-- Création : Utilisateurs authentifiés peuvent ajouter du matériel
CREATE POLICY "Users can create inventory"
ON inventory FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Modification : Seulement le propriétaire peut modifier
CREATE POLICY "Owners can update their inventory"
ON inventory FOR UPDATE
USING (auth.uid() = owner_id);

-- ============================================================================
-- REVIEWS - Politiques pour lecture publique
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "BDE can create reviews" ON reviews;

-- Lecture : Tout le monde peut voir les avis
CREATE POLICY "Public can view reviews"
ON reviews FOR SELECT
USING (true);

-- Création : Seulement les BDE peuvent créer des avis (après projet terminé)
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
-- RENTALS - Politiques de location
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their rentals" ON rentals;
DROP POLICY IF EXISTS "Users can create rentals" ON rentals;
DROP POLICY IF EXISTS "Users can update their rentals" ON rentals;

-- Lecture : Utilisateur peut voir ses locations (locataire ou propriétaire)
CREATE POLICY "Users can view their rentals"
ON rentals FOR SELECT
USING (
  auth.uid() = renter_id
  OR auth.uid() = owner_id
);

-- Création : Utilisateur authentifié peut créer une demande de location
CREATE POLICY "Users can create rentals"
ON rentals FOR INSERT
WITH CHECK (auth.uid() = renter_id);

-- Modification : Locataire ou propriétaire peut modifier le statut
CREATE POLICY "Users can update their rentals"
ON rentals FOR UPDATE
USING (
  auth.uid() = renter_id
  OR auth.uid() = owner_id
);

-- ============================================================================
-- PROJECT_APPLICATIONS - Politiques de candidatures
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "BDE can view applications for their projects" ON project_applications;
DROP POLICY IF EXISTS "ORGA can view their own applications" ON project_applications;
DROP POLICY IF EXISTS "ORGA can create applications" ON project_applications;
DROP POLICY IF EXISTS "Users can update applications" ON project_applications;

-- Lecture : BDE voit les candidatures de ses projets, ORGA voit les siennes
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

-- Création : Seulement les ORGA peuvent candidater
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

-- Modification : BDE peut changer le statut, ORGA peut modifier sa candidature
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

-- Vérifier que toutes les politiques sont bien en place
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
