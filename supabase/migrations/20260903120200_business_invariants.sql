-- ============================================================================
-- KLB-04 : Le locataire fixait son prix et approuvait sa propre location
-- KLB-05 : feedback_given piloté par un trigger et non par le client
-- KLB-06 : Un BDE pouvait noter un ORGA étranger au projet
-- KLB-07 : La « validation serveur » s'exécutait dans le navigateur
-- ============================================================================
-- Le projet n'expose aucune route API : tout part du client avec la clé anon.
-- Chaque invariant métier doit donc vivre dans PostgreSQL, seul endroit qu'un
-- appel direct à PostgREST ne peut pas contourner.
-- ============================================================================

BEGIN;

-- ===========================================================================
-- RENTALS
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Propriétaire et prix dérivés de l'inventaire, jamais du client (KLB-04)
-- + contrôle de disponibilité respectant la quantité en stock (KLB-07)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_rental_owner_and_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item        RECORD;
  v_days        INTEGER;
  v_concurrent  INTEGER;
BEGIN
  -- FOR UPDATE sérialise les demandes concurrentes sur le même article :
  -- sans ce verrou, deux insertions simultanées pourraient chacune constater
  -- une place libre et dépasser la quantité disponible.
  SELECT id, owner_id, daily_price, quantity, available,
         min_rental_days, max_rental_days
    INTO v_item
    FROM inventory
   WHERE id = NEW.item_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Article introuvable' USING ERRCODE = 'foreign_key_violation';
  END IF;

  IF v_item.available IS NOT TRUE THEN
    RAISE EXCEPTION 'Cet article n''est pas disponible à la location'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Le propriétaire ne peut pas être choisi par le demandeur
  NEW.owner_id := v_item.owner_id;

  IF NEW.renter_id = NEW.owner_id THEN
    RAISE EXCEPTION 'Impossible de louer son propre matériel'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Doit reproduire exactement le calcul affiché à l'utilisateur, sans quoi le
  -- prix stocké différerait du prix annoncé. Interface (app/rental/[id]) :
  --   Math.ceil((fin - début) / 86400000) + 1   -- +1 pour inclure le jour de fin
  v_days := GREATEST(
    1,
    CEIL(EXTRACT(EPOCH FROM (NEW.end_date - NEW.start_date)) / 86400)::INTEGER + 1
  );

  IF v_item.min_rental_days IS NOT NULL AND v_days < v_item.min_rental_days THEN
    RAISE EXCEPTION 'Durée inférieure au minimum de % jour(s)', v_item.min_rental_days
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_item.max_rental_days IS NOT NULL AND v_days > v_item.max_rental_days THEN
    RAISE EXCEPTION 'Durée supérieure au maximum de % jour(s)', v_item.max_rental_days
      USING ERRCODE = 'check_violation';
  END IF;

  -- Le prix n'est jamais lu depuis la requête cliente
  NEW.total_price := v_days * v_item.daily_price;

  -- Une nouvelle demande démarre toujours en attente d'approbation
  NEW.status := 'pending';

  -- Disponibilité : compter les locations actives qui chevauchent la période
  SELECT COUNT(*)
    INTO v_concurrent
    FROM rentals r
   WHERE r.item_id = NEW.item_id
     AND r.status IN ('pending', 'approved', 'ongoing')
     AND tstzrange(r.start_date, r.end_date) && tstzrange(NEW.start_date, NEW.end_date);

  IF v_concurrent >= COALESCE(v_item.quantity, 1) THEN
    RAISE EXCEPTION 'Plus aucun exemplaire disponible sur cette période (% / %)',
      v_concurrent, COALESCE(v_item.quantity, 1)
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_rental_created ON public.rentals;
CREATE TRIGGER on_rental_created
  BEFORE INSERT ON public.rentals
  FOR EACH ROW EXECUTE FUNCTION public.set_rental_owner_and_price();

-- ---------------------------------------------------------------------------
-- Transitions de statut cloisonnées par rôle (KLB-04)
-- ---------------------------------------------------------------------------
CREATE POLICY "rentals_insert_renter"
  ON public.rentals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = renter_id);

-- Le propriétaire statue sur les demandes qui le concernent
CREATE POLICY "rentals_update_owner"
  ON public.rentals FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Le locataire ne peut qu'annuler, et seulement tant que rien n'est engagé
CREATE POLICY "rentals_cancel_renter"
  ON public.rentals FOR UPDATE TO authenticated
  USING (auth.uid() = renter_id AND status IN ('pending', 'approved'))
  WITH CHECK (auth.uid() = renter_id AND status = 'cancelled');

-- ===========================================================================
-- REVIEWS
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- L'évalué doit avoir réellement collaboré sur le projet évalué (KLB-06)
-- ---------------------------------------------------------------------------
CREATE POLICY "reviews_insert_verified_collaboration"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.projects p
       WHERE p.id = reviews.project_id
         AND p.bde_id = auth.uid()
         AND p.status = 'completed'
    )
    -- Le point qui manquait : reviewee_id n'était jamais rattaché au projet
    AND EXISTS (
      SELECT 1 FROM public.projects p
       WHERE p.id = reviews.project_id
         AND p.selected_orga_id = reviews.reviewee_id
      UNION ALL
      SELECT 1 FROM public.project_applications a
       WHERE a.project_id = reviews.project_id
         AND a.orga_id = reviews.reviewee_id
         AND a.status = 'accepted'
    )
  );

-- ---------------------------------------------------------------------------
-- feedback_given devient un état dérivé (KLB-05)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_feedback_given()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE projects
     SET feedback_given = TRUE,
         updated_at     = NOW()
   WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.mark_feedback_given();

COMMIT;
