import { SupabaseClient } from '@supabase/supabase-js';
import { InventoryItem, InventoryCategory } from '@/types';

export type InventoryItemWithOwner = InventoryItem & {
  owner?: {
    id: string;
    name: string;
    organization_name?: string;
    avatar_url?: string;
    role: string;
    location?: string;
    phone?: string;
  };
};

/**
 * Get rental items with optional filters
 */
export async function getRentalItems(
  supabase: SupabaseClient,
  filters?: {
    category?: InventoryCategory | 'all';
    search?: string;
    ownerId?: string;
    availableOnly?: boolean;
  }
): Promise<InventoryItemWithOwner[]> {
  try {
    let query = supabase
      .from('inventory')
      .select(`
        *,
        owner:profiles!owner_id (
          id,
          name,
          organization_name,
          avatar_url,
          role
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.search && filters.search.trim()) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.ownerId) {
      query = query.eq('owner_id', filters.ownerId);
    }

    if (filters?.availableOnly) {
      query = query.eq('available', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rental items:', error);
      return [];
    }

    return data as InventoryItemWithOwner[];
  } catch (error) {
    console.error('Exception in getRentalItems:', error);
    return [];
  }
}

/**
 * Get a single rental item by ID
 */
export async function getRentalItemById(
  supabase: SupabaseClient,
  itemId: string
): Promise<InventoryItemWithOwner | null> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        owner:profiles!owner_id (
          id,
          name,
          organization_name,
          avatar_url,
          role,
          location,
          phone
        )
      `)
      .eq('id', itemId)
      .single();

    if (error) {
      console.error('Error fetching rental item:', error);
      return null;
    }

    return data as InventoryItemWithOwner;
  } catch (error) {
    console.error('Exception in getRentalItemById:', error);
    return null;
  }
}

/**
 * Create a new rental item
 */
export async function createRentalItem(
  supabase: SupabaseClient,
  itemData: {
    owner_id: string;
    category: InventoryCategory;
    title: string;
    description: string;
    daily_price: number;
    quantity: number;
    images?: string[];
    specifications?: Record<string, any>;
    location: string;
  }
): Promise<InventoryItemWithOwner | null> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        owner_id: itemData.owner_id,
        category: itemData.category,
        title: itemData.title,
        description: itemData.description,
        daily_price: itemData.daily_price,
        quantity: itemData.quantity,
        images: itemData.images || [],
        specifications: itemData.specifications || {},
        location: itemData.location,
        available: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating rental item:', error);
      return null;
    }

    return data as InventoryItemWithOwner;
  } catch (error) {
    console.error('Exception in createRentalItem:', error);
    return null;
  }
}

/**
 * Update a rental item
 */
export async function updateRentalItem(
  supabase: SupabaseClient,
  itemId: string,
  updates: Partial<InventoryItem>
): Promise<InventoryItemWithOwner | null> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating rental item:', error);
      return null;
    }

    return data as InventoryItemWithOwner;
  } catch (error) {
    console.error('Exception in updateRentalItem:', error);
    return null;
  }
}

/**
 * Delete a rental item
 */
export async function deleteRentalItem(
  supabase: SupabaseClient,
  itemId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting rental item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in deleteRentalItem:', error);
    return false;
  }
}

/**
 * Upload images for a rental item
 */
export async function uploadInventoryImages(
  supabase: SupabaseClient,
  itemId: string,
  files: File[]
): Promise<string[]> {
  try {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${itemId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `inventory/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('inventory')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('inventory')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  } catch (error) {
    console.error('Exception in uploadInventoryImages:', error);
    return [];
  }
}

/**
 * Toggle item availability
 */
export async function toggleItemAvailability(
  supabase: SupabaseClient,
  itemId: string,
  available: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('inventory')
      .update({ available })
      .eq('id', itemId);

    if (error) {
      console.error('Error toggling availability:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in toggleItemAvailability:', error);
    return false;
  }
}

/**
 * Get rental requests for a specific owner (incoming requests)
 */
export async function getOwnerRentalRequests(
  supabase: SupabaseClient,
  ownerId: string,
  status?: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
) {
  try {
    let query = supabase
      .from('rentals')
      .select(`
        *,
        item:inventory!item_id (
          id,
          title,
          category,
          daily_price,
          images
        ),
        renter:profiles!renter_id (
          id,
          name,
          organization_name,
          avatar_url,
          phone,
          email
        )
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching owner rental requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getOwnerRentalRequests:', error);
    return [];
  }
}

/**
 * Get rental requests made by a user (outgoing requests)
 */
export async function getRenterRentalRequests(
  supabase: SupabaseClient,
  renterId: string,
  status?: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
) {
  try {
    let query = supabase
      .from('rentals')
      .select(`
        *,
        item:inventory!item_id (
          id,
          title,
          category,
          daily_price,
          images
        ),
        owner:profiles!owner_id (
          id,
          name,
          organization_name,
          avatar_url,
          phone,
          email
        )
      `)
      .eq('renter_id', renterId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching renter rental requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getRenterRentalRequests:', error);
    return [];
  }
}

/**
 * Update rental status (approve, reject, complete, cancel)
 */
export async function updateRentalStatus(
  supabase: SupabaseClient,
  rentalId: string,
  status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
): Promise<boolean> {
  try {
    console.log('Updating rental status:', { rentalId, status });

    const { data, error } = await supabase
      .from('rentals')
      .update({ status })
      .eq('id', rentalId)
      .select();

    if (error) {
      console.error('Error updating rental status:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        rentalId,
        status
      });
      return false;
    }

    console.log('Rental status updated successfully:', data);
    return true;
  } catch (error) {
    console.error('Exception in updateRentalStatus:', error);
    return false;
  }
}

/**
 * Get rentals for a specific item (to check availability)
 */
export async function getItemRentals(
  supabase: SupabaseClient,
  itemId: string,
  includeCompleted: boolean = false
) {
  try {
    let query = supabase
      .from('rentals')
      .select('*')
      .eq('item_id', itemId)
      .order('start_date', { ascending: true });

    if (!includeCompleted) {
      query = query.in('status', ['pending', 'approved', 'ongoing']);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching item rentals:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getItemRentals:', error);
    return [];
  }
}
