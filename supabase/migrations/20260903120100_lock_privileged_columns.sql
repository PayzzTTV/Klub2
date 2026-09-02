-- ============================================================================
-- KLB-02 : Élévation de privilège ORGA -> BDE en une requête
-- KLB-05 : Contournement du feedback obligatoire
-- ============================================================================
-- Les policies UPDATE portaient sur la ligne entière. Supabase accordant par
-- défaut UPDATE sur toutes les colonnes de public.* au rôle `authenticated`,
-- un utilisateur pouvait écrire dans n'importe quelle colonne de SA ligne :
--
--   * profiles.role      -> un ORGA se promeut BDE et publie des projets
--   * profiles.verified  -> auto-attribution du badge de vérification
--   * projects.feedback_given -> désarme le verrou can_post_new_project()
--
-- Le RLS est row-level : il ne peut pas filtrer par colonne. Le contrôle
-- correct est le privilège colonne de PostgreSQL.
--
-- ATTENTION à l'ordre : un GRANT au niveau table prime sur tout GRANT colonne.
-- Il faut donc REVOKE au niveau table AVANT de GRANT les colonnes autorisées.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- PROFILES : role, verified, email et id deviennent non modifiables
-- ---------------------------------------------------------------------------
REVOKE UPDATE ON public.profiles FROM authenticated;

GRANT UPDATE (
  name,
  organization_name,
  avatar_url,
  bio,
  location,
  phone,
  website,
  updated_at
) ON public.profiles TO authenticated;

COMMENT ON COLUMN public.profiles.role IS
  'Non modifiable par le client (KLB-02). Fixé au signup par handle_new_user().';
COMMENT ON COLUMN public.profiles.verified IS
  'Non modifiable par le client (KLB-02). Réservé à un back-office.';

-- ---------------------------------------------------------------------------
-- PROJECTS : bde_id et feedback_given deviennent non modifiables
-- ---------------------------------------------------------------------------
REVOKE UPDATE ON public.projects FROM authenticated;

GRANT UPDATE (
  title,
  type,
  budget,
  capacity,
  location,
  description,
  requirements,
  start_date,
  end_date,
  status,
  selected_orga_id,
  views_count,
  updated_at
) ON public.projects TO authenticated;

COMMENT ON COLUMN public.projects.feedback_given IS
  'État dérivé, non modifiable par le client (KLB-05). Piloté par le trigger '
  'on_review_created -> mark_feedback_given().';

-- ---------------------------------------------------------------------------
-- RENTALS : owner_id et total_price sont dérivés de l''inventaire (KLB-04)
-- ---------------------------------------------------------------------------
REVOKE UPDATE ON public.rentals FROM authenticated;

GRANT UPDATE (
  status,
  message,
  updated_at
) ON public.rentals TO authenticated;

COMMENT ON COLUMN public.rentals.total_price IS
  'Calculé côté base par le trigger set_rental_owner_and_price() (KLB-04).';
COMMENT ON COLUMN public.rentals.owner_id IS
  'Dérivé de inventory.owner_id par le trigger set_rental_owner_and_price() (KLB-04).';

COMMIT;
