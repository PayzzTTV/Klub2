import { SupabaseClient } from '@supabase/supabase-js';
import { Review, ReviewFormData } from '@/types';

/**
 * Create a new review for an ORGA after a completed project
 */
export async function createReview(
  supabase: SupabaseClient,
  reviewData: ReviewFormData
): Promise<Review | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        project_id: reviewData.project_id,
        reviewer_id: reviewData.reviewer_id,
        reviewee_id: reviewData.reviewee_id,
        global_rating: reviewData.global_rating,
        punctuality_rating: reviewData.punctuality_rating,
        quality_rating: reviewData.quality_rating,
        communication_rating: reviewData.communication_rating,
        value_rating: reviewData.value_rating,
        comment: reviewData.comment,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return null;
    }

    return data as Review;
  } catch (error) {
    console.error('Exception in createReview:', error);
    return null;
  }
}

/**
 * Get all reviews for a specific ORGA
 */
export async function getOrgaReviews(
  supabase: SupabaseClient,
  orgaId: string
): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        project:projects (
          id,
          title,
          type
        ),
        reviewer:profiles!reviewer_id (
          id,
          name,
          organization_name,
          avatar_url
        )
      `)
      .eq('reviewee_id', orgaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orga reviews:', error);
      return [];
    }

    return data as Review[];
  } catch (error) {
    console.error('Exception in getOrgaReviews:', error);
    return [];
  }
}

/**
 * Get detailed review statistics for an ORGA
 */
export async function getReviewStats(
  supabase: SupabaseClient,
  orgaId: string
): Promise<{
  avgGlobal: number;
  avgPunctuality: number;
  avgQuality: number;
  avgCommunication: number;
  avgValue: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
} | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewee_id', orgaId);

    if (error) {
      console.error('Error fetching review stats:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        avgGlobal: 0,
        avgPunctuality: 0,
        avgQuality: 0,
        avgCommunication: 0,
        avgValue: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalReviews = data.length;

    // Calculate averages
    const avgGlobal = data.reduce((sum, r) => sum + r.global_rating, 0) / totalReviews;
    const avgPunctuality = data.reduce((sum, r) => sum + r.punctuality_rating, 0) / totalReviews;
    const avgQuality = data.reduce((sum, r) => sum + r.quality_rating, 0) / totalReviews;
    const avgCommunication = data.reduce((sum, r) => sum + r.communication_rating, 0) / totalReviews;
    const avgValue = data.reduce((sum, r) => sum + r.value_rating, 0) / totalReviews;

    // Calculate rating distribution
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach((review) => {
      const rating = Math.round(review.global_rating);
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++;
      }
    });

    return {
      avgGlobal: Math.round(avgGlobal * 10) / 10,
      avgPunctuality: Math.round(avgPunctuality * 10) / 10,
      avgQuality: Math.round(avgQuality * 10) / 10,
      avgCommunication: Math.round(avgCommunication * 10) / 10,
      avgValue: Math.round(avgValue * 10) / 10,
      totalReviews,
      ratingDistribution,
    };
  } catch (error) {
    console.error('Exception in getReviewStats:', error);
    return null;
  }
}

/**
 * Check if a BDE can review a specific project
 * (project must be completed, BDE must be the owner, and no review exists yet)
 */
export async function canReview(
  supabase: SupabaseClient,
  bdeId: string,
  projectId: string
): Promise<boolean> {
  try {
    // Check if project is completed and belongs to BDE
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, status, bde_id, feedback_given')
      .eq('id', projectId)
      .eq('bde_id', bdeId)
      .eq('status', 'completed')
      .single();

    if (projectError || !project) {
      return false;
    }

    // Check if feedback already given
    if (project.feedback_given) {
      return false;
    }

    // Check if a review already exists
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('project_id', projectId)
      .eq('reviewer_id', bdeId)
      .maybeSingle();

    if (reviewError) {
      console.error('Error checking existing review:', reviewError);
      return false;
    }

    return !existingReview;
  } catch (error) {
    console.error('Exception in canReview:', error);
    return false;
  }
}

/**
 * Get a specific review by project and reviewer
 */
export async function getReviewByProject(
  supabase: SupabaseClient,
  projectId: string,
  reviewerId: string
): Promise<Review | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        project:projects (
          id,
          title,
          type
        ),
        reviewee:profiles!reviewee_id (
          id,
          name,
          organization_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .eq('reviewer_id', reviewerId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching review:', error);
      return null;
    }

    return data as Review;
  } catch (error) {
    console.error('Exception in getReviewByProject:', error);
    return null;
  }
}
