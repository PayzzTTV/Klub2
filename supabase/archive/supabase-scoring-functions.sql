-- =====================================================
-- KLUB - Scoring & Badge System for ORGAs
-- =====================================================

-- Function to calculate global score for an ORGA
-- Based on weighted average of reviews
CREATE OR REPLACE FUNCTION calculate_global_score(orga_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  global_score NUMERIC;
BEGIN
  SELECT
    ROUND(
      AVG(
        (punctuality_rating * 0.25) +
        (quality_rating * 0.30) +
        (communication_rating * 0.25) +
        (value_rating * 0.20)
      ),
      2
    )
  INTO global_score
  FROM reviews
  WHERE reviewee_id = orga_user_id;

  RETURN COALESCE(global_score, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function to get ORGA statistics
-- =====================================================
CREATE OR REPLACE FUNCTION get_orga_stats(orga_user_id UUID)
RETURNS TABLE (
  total_reviews BIGINT,
  global_score NUMERIC,
  avg_punctuality NUMERIC,
  avg_quality NUMERIC,
  avg_communication NUMERIC,
  avg_value NUMERIC,
  is_top_provider BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_reviews,
    ROUND(AVG((punctuality_rating * 0.25) + (quality_rating * 0.30) + (communication_rating * 0.25) + (value_rating * 0.20)), 2) as global_score,
    ROUND(AVG(punctuality_rating), 2) as avg_punctuality,
    ROUND(AVG(quality_rating), 2) as avg_quality,
    ROUND(AVG(communication_rating), 2) as avg_communication,
    ROUND(AVG(value_rating), 2) as avg_value,
    (ROUND(AVG((punctuality_rating * 0.25) + (quality_rating * 0.30) + (communication_rating * 0.25) + (value_rating * 0.20)), 2) >= 4.5 AND COUNT(*) >= 5) as is_top_provider
  FROM reviews
  WHERE reviewee_id = orga_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function to get top ORGAs (leaderboard)
-- =====================================================
CREATE OR REPLACE FUNCTION get_top_orgas(limit_count INT DEFAULT 10)
RETURNS TABLE (
  orga_id UUID,
  orga_name TEXT,
  organization_name TEXT,
  global_score NUMERIC,
  total_reviews BIGINT,
  is_top_provider BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as orga_id,
    p.name as orga_name,
    p.organization_name,
    ROUND(AVG((r.punctuality_rating * 0.25) + (r.quality_rating * 0.30) + (r.communication_rating * 0.25) + (r.value_rating * 0.20)), 2) as global_score,
    COUNT(r.id)::BIGINT as total_reviews,
    (ROUND(AVG((r.punctuality_rating * 0.25) + (r.quality_rating * 0.30) + (r.communication_rating * 0.25) + (r.value_rating * 0.20)), 2) >= 4.5 AND COUNT(r.id) >= 5) as is_top_provider
  FROM profiles p
  INNER JOIN reviews r ON r.reviewee_id = p.id
  WHERE p.role = 'ORGA'
  GROUP BY p.id, p.name, p.organization_name
  HAVING COUNT(r.id) >= 3 -- Minimum 3 reviews to appear
  ORDER BY global_score DESC, total_reviews DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Example usage:
-- =====================================================

-- Get score for a specific ORGA
-- SELECT calculate_global_score('orga-uuid-here');

-- Get full statistics for an ORGA
-- SELECT * FROM get_orga_stats('orga-uuid-here');

-- Get top 10 ORGAs
-- SELECT * FROM get_top_orgas(10);

-- =====================================================
-- Notes:
-- =====================================================
-- Scoring weights:
-- - Quality: 30% (most important)
-- - Punctuality: 25%
-- - Communication: 25%
-- - Value: 20%
--
-- "Top Prestataire" Badge criteria:
-- - Global score >= 4.5 / 5.0
-- - Minimum 5 reviews
