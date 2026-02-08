import { SupabaseClient } from '@supabase/supabase-js';
import { InventoryItem, InventoryCategory } from '@/types';

/**
 * Get rental items with optional filters
 */
export async function getRentalItems(
  supabase: SupabaseClient,
  filters?: {
    category?: InventoryCategory;
    search?: string;
    ownerId?: string;
    availableOnly?: boolean;
  }
): Promise<InventoryItem[]> {
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

    return data as InventoryItem[];
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
): Promise<InventoryItem | null> {
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

    return data as InventoryItem;
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
): Promise<InventoryItem | null> {
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

    return data as InventoryItem;
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
): Promise<InventoryItem | null> {
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

    return data as InventoryItem;
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
