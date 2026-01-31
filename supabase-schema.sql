-- =============================================
-- KLUB - Schéma SQL Complet Supabase
-- Plateforme Intercommunautaire BDE & Orgas
-- =============================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TYPES ÉNUMÉRÉS
-- =============================================

CREATE TYPE user_role AS ENUM ('BDE', 'ORGA');

CREATE TYPE project_type AS ENUM (
  'Gala',
  'Soirée',
  'Festival',
  'Conférence',
  'Concert',
  'Compétition',
  'Autre'
);

CREATE TYPE project_status AS ENUM (
  'draft',
  'published',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE inventory_category AS ENUM (
  'Son',
  'Image',
  'Lumière',
  'Logistique'
);

CREATE TYPE rental_status AS ENUM (
  'pending',
  'approved',
  'ongoing',
  'completed',
  'cancelled',
  'rejected'
);

-- =============================================
-- TABLE: profiles
-- Profils utilisateurs (BDE et ORGA)
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  name TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_organization ON profiles(organization_name);
CREATE INDEX idx_profiles_location ON profiles(location);

-- =============================================
-- TABLE: projects
-- Projets d'événements postés par les BDE
-- =============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bde_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type project_type NOT NULL,
  budget NUMERIC(10, 2),
  capacity INTEGER,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status project_status DEFAULT 'draft',
  feedback_given BOOLEAN DEFAULT FALSE,
  selected_orga_id UUID REFERENCES profiles(id),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT positive_budget CHECK (budget >= 0),
  CONSTRAINT positive_capacity CHECK (capacity > 0)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_projects_bde ON projects(bde_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_projects_feedback ON projects(feedback_given);

-- =============================================
-- TABLE: inventory
-- Matériel mis en location
-- =============================================

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category inventory_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  daily_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  available BOOLEAN DEFAULT TRUE,
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  location TEXT,
  condition TEXT DEFAULT 'Excellent',
  min_rental_days INTEGER DEFAULT 1,
  max_rental_days INTEGER,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT positive_price CHECK (daily_price >= 0),
  CONSTRAINT positive_quantity CHECK (quantity >= 0),
  CONSTRAINT valid_rental_days CHECK (max_rental_days IS NULL OR max_rental_days >= min_rental_days)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_inventory_owner ON inventory(owner_id);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_available ON inventory(available);
CREATE INDEX idx_inventory_price ON inventory(daily_price);

-- =============================================
-- TABLE: rentals
-- Locations de matériel
-- =============================================

CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  status rental_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT valid_rental_dates CHECK (end_date > start_date),
  CONSTRAINT positive_total_price CHECK (total_price >= 0),
  CONSTRAINT no_self_rental CHECK (renter_id != owner_id)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_rentals_item ON rentals(item_id);
CREATE INDEX idx_rentals_renter ON rentals(renter_id);
CREATE INDEX idx_rentals_owner ON rentals(owner_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date);

-- =============================================
-- TABLE: reviews
-- Avis sur les Orgas (système de réputation)
-- =============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notations (1-5)
  global_rating NUMERIC(2, 1) NOT NULL,
  punctuality_rating NUMERIC(2, 1) NOT NULL,
  quality_rating NUMERIC(2, 1) NOT NULL,
  communication_rating NUMERIC(2, 1) NOT NULL,
  value_rating NUMERIC(2, 1) NOT NULL,

  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT valid_global_rating CHECK (global_rating >= 1 AND global_rating <= 5),
  CONSTRAINT valid_punctuality CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  CONSTRAINT valid_quality CHECK (quality_rating >= 1 AND quality_rating <= 5),
  CONSTRAINT valid_communication CHECK (communication_rating >= 1 AND communication_rating <= 5),
  CONSTRAINT valid_value CHECK (value_rating >= 1 AND value_rating <= 5),
  CONSTRAINT no_self_review CHECK (reviewer_id != reviewee_id),
  CONSTRAINT one_review_per_project UNIQUE(project_id, reviewer_id)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_reviews_project ON reviews(project_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON reviews(global_rating);

-- =============================================
-- TABLE: conversations
-- Conversations entre utilisateurs
-- =============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT different_participants CHECK (participant1_id != participant2_id),
  CONSTRAINT unique_conversation UNIQUE(participant1_id, participant2_id)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- =============================================
-- TABLE: messages
-- Messages dans les conversations
-- =============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- =============================================
-- TABLE: project_applications
-- Candidatures des Orgas aux projets
-- =============================================

CREATE TABLE project_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  orga_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  proposed_price NUMERIC(10, 2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT unique_application UNIQUE(project_id, orga_id),
  CONSTRAINT positive_proposed_price CHECK (proposed_price >= 0)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_applications_project ON project_applications(project_id);
CREATE INDEX idx_applications_orga ON project_applications(orga_id);
CREATE INDEX idx_applications_status ON project_applications(status);

-- =============================================
-- FONCTION: Calcul du score global d'une Orga
-- =============================================

CREATE OR REPLACE FUNCTION calculate_global_score(orga_uuid UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  total_reviews INTEGER,
  punctuality_avg NUMERIC,
  quality_avg NUMERIC,
  communication_avg NUMERIC,
  value_avg NUMERIC,
  weighted_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(global_rating), 2) as average_rating,
    COUNT(*)::INTEGER as total_reviews,
    ROUND(AVG(punctuality_rating), 2) as punctuality_avg,
    ROUND(AVG(quality_rating), 2) as quality_avg,
    ROUND(AVG(communication_rating), 2) as communication_avg,
    ROUND(AVG(value_rating), 2) as value_avg,
    -- Score pondéré: moyenne * log(nombre d'avis + 1) pour favoriser les orgas avec beaucoup d'avis
    ROUND((AVG(global_rating) * LN(COUNT(*) + 1))::numeric, 2) as weighted_score
  FROM reviews
  WHERE reviewee_id = orga_uuid;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FONCTION: Vérifier si un BDE peut poster un projet
-- (feedback obligatoire pour les projets terminés)
-- =============================================

CREATE OR REPLACE FUNCTION can_post_new_project(bde_uuid UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;

-- =============================================
-- FONCTION: Marquer automatiquement les projets comme terminés
-- (Trigger qui s'exécute après la date de fin)
-- =============================================

CREATE OR REPLACE FUNCTION auto_complete_projects()
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET status = 'completed'
  WHERE status = 'in_progress'
    AND end_date < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FONCTION: Mettre à jour updated_at automatiquement
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à toutes les tables concernées
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FONCTION: Mettre à jour last_message_at dans conversations
-- =============================================

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLITIQUES RLS: profiles
-- =============================================

-- Lecture: Tout le monde peut voir les profils ORGA, seulement soi-même pour BDE
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (role = 'ORGA' OR auth.uid() = id);

-- Insertion: Seulement lors de la création du compte
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Modification: Seulement son propre profil
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- POLITIQUES RLS: projects
-- =============================================

-- Lecture: Tous les utilisateurs authentifiés peuvent voir les projets publiés
CREATE POLICY "Published projects are viewable by everyone"
  ON projects FOR SELECT
  USING (status != 'draft' OR auth.uid() = bde_id);

-- Insertion: Seulement les BDE qui n'ont pas de feedback en attente
CREATE POLICY "BDE can insert projects if no pending feedback"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'BDE'
    )
    AND can_post_new_project(auth.uid())
  );

-- Modification: Seulement le créateur
CREATE POLICY "BDE can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = bde_id);

-- Suppression: Seulement le créateur
CREATE POLICY "BDE can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = bde_id);

-- =============================================
-- POLITIQUES RLS: inventory
-- =============================================

-- Lecture: Tout le monde peut voir le matériel disponible
CREATE POLICY "Available inventory is viewable by everyone"
  ON inventory FOR SELECT
  USING (available = TRUE OR auth.uid() = owner_id);

-- Insertion: BDE et ORGA peuvent ajouter du matériel
CREATE POLICY "Authenticated users can insert inventory"
  ON inventory FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Modification: Seulement le propriétaire
CREATE POLICY "Users can update their own inventory"
  ON inventory FOR UPDATE
  USING (auth.uid() = owner_id);

-- Suppression: Seulement le propriétaire
CREATE POLICY "Users can delete their own inventory"
  ON inventory FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================
-- POLITIQUES RLS: rentals
-- =============================================

-- Lecture: Seulement le loueur ou le propriétaire
CREATE POLICY "Users can view their own rentals"
  ON rentals FOR SELECT
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Insertion: Utilisateurs authentifiés
CREATE POLICY "Users can create rental requests"
  ON rentals FOR INSERT
  WITH CHECK (auth.uid() = renter_id);

-- Modification: Seulement le propriétaire (pour approuver/rejeter)
CREATE POLICY "Owners can update rental status"
  ON rentals FOR UPDATE
  USING (auth.uid() = owner_id);

-- =============================================
-- POLITIQUES RLS: reviews
-- =============================================

-- Lecture: Public (transparence)
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (TRUE);

-- Insertion: Seulement si projet terminé et pas déjà noté
CREATE POLICY "BDE can insert reviews for completed projects"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
        AND bde_id = auth.uid()
        AND status = 'completed'
        AND feedback_given = FALSE
    )
  );

-- Modification: Impossible (immutable)
CREATE POLICY "Reviews cannot be updated"
  ON reviews FOR UPDATE
  USING (FALSE);

-- Suppression: Impossible
CREATE POLICY "Reviews cannot be deleted"
  ON reviews FOR DELETE
  USING (FALSE);

-- =============================================
-- POLITIQUES RLS: conversations
-- =============================================

-- Lecture: Seulement les participants
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Insertion: Utilisateurs authentifiés
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- =============================================
-- POLITIQUES RLS: messages
-- =============================================

-- Lecture: Seulement les participants de la conversation
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- Insertion: Seulement l'expéditeur dans sa conversation
CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- Modification: Seulement pour marquer comme lu
CREATE POLICY "Users can update read status"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- =============================================
-- POLITIQUES RLS: project_applications
-- =============================================

-- Lecture: BDE créateur ou Orga candidate
CREATE POLICY "Users can view relevant applications"
  ON project_applications FOR SELECT
  USING (
    auth.uid() = orga_id
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND bde_id = auth.uid()
    )
  );

-- Insertion: Seulement les ORGA
CREATE POLICY "ORGA can apply to projects"
  ON project_applications FOR INSERT
  WITH CHECK (
    auth.uid() = orga_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ORGA'
    )
  );

-- Modification: BDE pour accepter/rejeter
CREATE POLICY "BDE can update application status"
  ON project_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND bde_id = auth.uid()
    )
  );

-- =============================================
-- VUES UTILES
-- =============================================

-- Vue: Top Orgas (score > 4.5 et min 5 avis)
CREATE OR REPLACE VIEW top_orgas AS
SELECT
  p.id,
  p.name,
  p.organization_name,
  p.avatar_url,
  p.location,
  ROUND(AVG(r.global_rating)::numeric, 2) as average_rating,
  COUNT(r.id)::integer as total_reviews,
  ROUND((AVG(r.global_rating) * LN(COUNT(r.id) + 1))::numeric, 2) as weighted_score
FROM profiles p
INNER JOIN reviews r ON r.reviewee_id = p.id
WHERE p.role = 'ORGA'
GROUP BY p.id
HAVING AVG(r.global_rating) >= 4.5 AND COUNT(r.id) >= 5
ORDER BY weighted_score DESC;

-- Vue: Projets nécessitant un feedback
CREATE OR REPLACE VIEW projects_needing_feedback AS
SELECT
  p.*,
  prof.name as bde_name,
  prof.email as bde_email
FROM projects p
INNER JOIN profiles prof ON prof.id = p.bde_id
WHERE p.status = 'completed'
  AND p.feedback_given = FALSE
  AND p.end_date < NOW() - INTERVAL '1 day';

-- =============================================
-- DONNÉES DE TEST (Optionnel)
-- =============================================

-- Insérer des profils de test
-- Note: Les UUID doivent correspondre à des utilisateurs créés via Supabase Auth

-- INSERT INTO profiles (id, role, name, organization_name, email, location, bio) VALUES
-- ('uuid-bde-1', 'BDE', 'Jean Dupont', 'BDE Polytechnique', 'jean@bde-polytech.fr', 'Paris', 'BDE actif depuis 2020'),
-- ('uuid-orga-1', 'ORGA', 'Marie Martin', 'SoundPro Events', 'marie@soundpro.fr', 'Lyon', 'Spécialiste son et lumière depuis 10 ans');

-- =============================================
-- FIN DU SCHÉMA
-- =============================================
