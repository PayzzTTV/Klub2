import { SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '@/types';

/**
 * Get a user's profile by ID
 */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Exception in getProfile:', error);
    return null;
  }
}

/**
 * Update a user's profile
 */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Exception in updateProfile:', error);
    return null;
  }
}

/**
 * Upload avatar to Supabase Storage and update profile
 */
export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL
    await updateProfile(supabase, userId, { avatar_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error('Exception in uploadAvatar:', error);
    return null;
  }
}

/**
 * Get top-rated ORGAs based on their global score
 */
export async function getTopOrgas(
  supabase: SupabaseClient,
  limit: number = 10
): Promise<Profile[]> {
  try {
    // Use the top_orgas view created in Supabase schema
    const { data, error } = await supabase
      .from('top_orgas')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching top orgas:', error);
      return [];
    }

    return data as Profile[];
  } catch (error) {
    console.error('Exception in getTopOrgas:', error);
    return [];
  }
}

/**
 * Get ORGA statistics (for ORGA dashboard)
 */
export async function getOrgaStats(
  supabase: SupabaseClient,
  orgaId: string
): Promise<{
  averageRating: number;
  totalReviews: number;
  activeApplications: number;
  completedProjects: number;
} | null> {
  try {
    // Calculate average rating from reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('global_rating, project_id')
      .eq('reviewee_id', orgaId);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return null;
    }

    const totalReviews = reviewsData?.length || 0;
    const averageRating = totalReviews > 0
      ? reviewsData.reduce((sum, review) => sum + review.global_rating, 0) / totalReviews
      : 0;

    // Count completed projects (unique projects from reviews)
    const completedProjects = new Set(reviewsData?.map(r => r.project_id) || []).size;

    // Count active applications
    const { data: applicationsData, error: applicationsError } = await supabase
      .from('project_applications')
      .select('id')
      .eq('orga_id', orgaId)
      .in('status', ['pending', 'accepted']);

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      return null;
    }

    const activeApplications = applicationsData?.length || 0;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      activeApplications,
      completedProjects,
    };
  } catch (error) {
    console.error('Exception in getOrgaStats:', error);
    return null;
  }
}

/**
 * Check if a profile is a "Top Provider" (rating > 4.5 with at least 5 reviews)
 */
export async function isTopProvider(
  supabase: SupabaseClient,
  orgaId: string
): Promise<boolean> {
  try {
    const stats = await getOrgaStats(supabase, orgaId);

    if (!stats) return false;

    return stats.averageRating >= 4.5 && stats.totalReviews >= 5;
  } catch (error) {
    console.error('Exception in isTopProvider:', error);
    return false;
  }
}
