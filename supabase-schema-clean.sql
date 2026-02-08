-- =============================================
-- KLUB - Nettoyage Complet de la Base de Données
-- ATTENTION: Ceci supprime TOUTES les données !
-- =============================================

-- Désactiver les triggers temporairement
SET session_replication_role = replica;

-- Supprimer les vues
DROP VIEW IF EXISTS top_orgas CASCADE;
DROP VIEW IF EXISTS projects_needing_feedback CASCADE;

-- Supprimer les politiques RLS (si elles existent)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "Published projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "BDE can insert projects if no pending feedback" ON projects;
DROP POLICY IF EXISTS "BDE can update their own projects" ON projects;
DROP POLICY IF EXISTS "BDE can delete their own projects" ON projects;

DROP POLICY IF EXISTS "Available inventory is viewable by everyone" ON inventory;
DROP POLICY IF EXISTS "Authenticated users can insert inventory" ON inventory;
DROP POLICY IF EXISTS "Users can update their own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can delete their own inventory" ON inventory;

DROP POLICY IF EXISTS "Users can view their own rentals" ON rentals;
DROP POLICY IF EXISTS "Users can create rental requests" ON rentals;
DROP POLICY IF EXISTS "Owners can update rental status" ON rentals;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "BDE can insert reviews for completed projects" ON reviews;
DROP POLICY IF EXISTS "Reviews cannot be updated" ON reviews;
DROP POLICY IF EXISTS "Reviews cannot be deleted" ON reviews;

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update read status" ON messages;

DROP POLICY IF EXISTS "Users can view relevant applications" ON project_applications;
DROP POLICY IF EXISTS "ORGA can apply to projects" ON project_applications;
DROP POLICY IF EXISTS "BDE can update application status" ON project_applications;

-- Supprimer les tables (l'ordre est important à cause des foreign keys)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS project_applications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS rentals CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS calculate_global_score(UUID);
DROP FUNCTION IF EXISTS can_post_new_project(UUID);
DROP FUNCTION IF EXISTS auto_complete_projects();
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;

-- Supprimer les types énumérés
DROP TYPE IF EXISTS rental_status CASCADE;
DROP TYPE IF EXISTS inventory_category CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS project_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Réactiver les triggers
SET session_replication_role = DEFAULT;

-- =============================================
-- FIN DU NETTOYAGE
-- =============================================
-- Vous pouvez maintenant exécuter supabase-schema.sql
