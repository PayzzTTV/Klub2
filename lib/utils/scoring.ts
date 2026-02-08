import { SupabaseClient } from '@supabase/supabase-js';

export type OrgaStats = {
  total_reviews: number;
  global_score: number;
  avg_punctuality: number;
  avg_quality: number;
  avg_communication: number;
  avg_value: number;
  is_top_provider: boolean;
};

export type TopOrga = {
  orga_id: string;
  orga_name: string;
  organization_name: string;
  global_score: number;
  total_reviews: number;
  is_top_provider: boolean;
};

/**
 * Calculate global score for an ORGA
 */
export async function calculateGlobalScore(
  supabase: SupabaseClient,
  orgaId: string
): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_global_score', {
    orga_user_id: orgaId,
  });

  if (error) {
    console.error('Error calculating global score:', error);
    return 0;
  }

  return data || 0;
}

/**
 * Get comprehensive statistics for an ORGA
 */
export async function getOrgaStats(
  supabase: SupabaseClient,
  orgaId: string
): Promise<OrgaStats | null> {
  const { data, error } = await supabase.rpc('get_orga_stats', {
    orga_user_id: orgaId,
  });

  if (error) {
    console.error('Error getting ORGA stats:', error);
    return null;
  }

  // RPC returns array, get first result
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Get top ORGAs leaderboard
 */
export async function getTopOrgas(
  supabase: SupabaseClient,
  limitCount: number = 10
): Promise<TopOrga[]> {
  const { data, error } = await supabase.rpc('get_top_orgas', {
    limit_count: limitCount,
  });

  if (error) {
    console.error('Error getting top ORGAs:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if an ORGA qualifies for Top Provider badge
 */
export function isTopProvider(stats: OrgaStats | null): boolean {
  if (!stats) return false;
  return stats.is_top_provider;
}

/**
 * Calculate weighted score from individual ratings
 * Weights: Quality 30%, Punctuality 25%, Communication 25%, Value 20%
 */
export function calculateWeightedScore(
  punctuality: number,
  quality: number,
  communication: number,
  value: number
): number {
  return Number(
    (
      punctuality * 0.25 +
      quality * 0.3 +
      communication * 0.25 +
      value * 0.2
    ).toFixed(2)
  );
}
