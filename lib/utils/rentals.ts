import { SupabaseClient } from '@supabase/supabase-js';
import { Rental, RentalStatus } from '@/types';

/**
 * Create a new rental request
 */
export async function createRentalRequest(
  supabase: SupabaseClient,
  requestData: {
    item_id: string;
    renter_id: string;
    owner_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    message?: string;
  }
): Promise<Rental | null> {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .insert({
        item_id: requestData.item_id,
        renter_id: requestData.renter_id,
        owner_id: requestData.owner_id,
        start_date: requestData.start_date,
        end_date: requestData.end_date,
        total_price: requestData.total_price,
        status: 'pending',
      })
      .select(`
        *,
        item:inventory (
          id,
          title,
          category,
          images,
          daily_price
        ),
        renter:profiles!renter_id (
          id,
          name,
          organization_name,
          avatar_url,
          role
        ),
        owner:profiles!owner_id (
          id,
          name,
          organization_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (error) {
      console.error('Error creating rental request:', error);
      return null;
    }

    return data as Rental;
  } catch (error) {
    console.error('Exception in createRentalRequest:', error);
    return null;
  }
}

/**
 * Update rental status (approve, reject, complete, cancel)
 */
export async function updateRentalStatus(
  supabase: SupabaseClient,
  rentalId: string,
  newStatus: RentalStatus
): Promise<Rental | null> {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .update({ status: newStatus })
      .eq('id', rentalId)
      .select(`
        *,
        item:inventory (
          id,
          title,
          category,
          images
        ),
        renter:profiles!renter_id (
          id,
          name,
          organization_name,
          avatar_url
        ),
        owner:profiles!owner_id (
          id,
          name,
          organization_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating rental status:', error);
      return null;
    }

    return data as Rental;
  } catch (error) {
    console.error('Exception in updateRentalStatus:', error);
    return null;
  }
}

/**
 * Get rental history for a user (as renter or owner)
 */
export async function getRentalHistory(
  supabase: SupabaseClient,
  userId: string,
  role: 'renter' | 'owner' | 'both' = 'both'
): Promise<Rental[]> {
  try {
    let query = supabase
      .from('rentals')
      .select(`
        *,
        item:inventory (
          id,
          title,
          category,
          images,
          daily_price
        ),
        renter:profiles!renter_id (
          id,
          name,
          organization_name,
          avatar_url,
          role
        ),
        owner:profiles!owner_id (
          id,
          name,
          organization_name,
          avatar_url,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (role === 'renter') {
      query = query.eq('renter_id', userId);
    } else if (role === 'owner') {
      query = query.eq('owner_id', userId);
    } else {
      // Both: user is either renter or owner
      query = query.or(`renter_id.eq.${userId},owner_id.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rental history:', error);
      return [];
    }

    return data as Rental[];
  } catch (error) {
    console.error('Exception in getRentalHistory:', error);
    return [];
  }
}

/**
 * Get pending rental requests for an owner (items they own)
 */
export async function getPendingRentals(
  supabase: SupabaseClient,
  ownerId: string
): Promise<Rental[]> {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        item:inventory (
          id,
          title,
          category,
          images,
          daily_price
        ),
        renter:profiles!renter_id (
          id,
          name,
          organization_name,
          avatar_url,
          role,
          phone
        )
      `)
      .eq('owner_id', ownerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending rentals:', error);
      return [];
    }

    return data as Rental[];
  } catch (error) {
    console.error('Exception in getPendingRentals:', error);
    return [];
  }
}

/**
 * Get ongoing rentals (approved or ongoing status)
 */
export async function getOngoingRentals(
  supabase: SupabaseClient,
  userId: string,
  role: 'renter' | 'owner' = 'renter'
): Promise<Rental[]> {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        item:inventory (
          id,
          title,
          category,
          images,
          daily_price
        ),
        renter:profiles!renter_id (
          id,
          name,
          organization_name,
          avatar_url
        ),
        owner:profiles!owner_id (
          id,
          name,
          organization_name,
          avatar_url
        )
      `)
      .eq(role === 'renter' ? 'renter_id' : 'owner_id', userId)
      .in('status', ['approved', 'ongoing'])
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching ongoing rentals:', error);
      return [];
    }

    return data as Rental[];
  } catch (error) {
    console.error('Exception in getOngoingRentals:', error);
    return [];
  }
}

/**
 * Get a single rental by ID
 */
export async function getRentalById(
  supabase: SupabaseClient,
  rentalId: string
): Promise<Rental | null> {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        item:inventory (
          id,
          title,
          category,
          images,
          daily_price,
          description,
          specifications
        ),
        renter:profiles!renter_id (
          id,
          name,
          organization_name,
          avatar_url,
          role,
          phone,
          location
        ),
        owner:profiles!owner_id (
          id,
          name,
          organization_name,
          avatar_url,
          role,
          phone,
          location
        )
      `)
      .eq('id', rentalId)
      .single();

    if (error) {
      console.error('Error fetching rental:', error);
      return null;
    }

    return data as Rental;
  } catch (error) {
    console.error('Exception in getRentalById:', error);
    return null;
  }
}

/**
 * Check if an item is available for a given date range
 */
export async function checkItemAvailability(
  supabase: SupabaseClient,
  itemId: string,
  startDate: string,
  endDate: string
): Promise<boolean> {
  try {
    // Check for overlapping rentals
    const { data, error } = await supabase
      .from('rentals')
      .select('id')
      .eq('item_id', itemId)
      .in('status', ['approved', 'ongoing'])
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (error) {
      console.error('Error checking availability:', error);
      return false;
    }

    // Item is available if no overlapping rentals found
    return !data || data.length === 0;
  } catch (error) {
    console.error('Exception in checkItemAvailability:', error);
    return false;
  }
}

/**
 * Cancel a rental request (by renter before approval, or by owner/renter before start date)
 */
export async function cancelRental(
  supabase: SupabaseClient,
  rentalId: string,
  userId: string
): Promise<boolean> {
  try {
    // First check if user is renter or owner
    const { data: rental, error: fetchError } = await supabase
      .from('rentals')
      .select('renter_id, owner_id, status, start_date')
      .eq('id', rentalId)
      .single();

    if (fetchError || !rental) {
      console.error('Error fetching rental for cancellation:', fetchError);
      return false;
    }

    // Check permissions
    const isRenter = rental.renter_id === userId;
    const isOwner = rental.owner_id === userId;

    if (!isRenter && !isOwner) {
      console.error('User not authorized to cancel this rental');
      return false;
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from('rentals')
      .update({ status: 'cancelled' })
      .eq('id', rentalId);

    if (updateError) {
      console.error('Error cancelling rental:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in cancelRental:', error);
    return false;
  }
}
