// =============================================
// KLUB - TypeScript Types & Interfaces
// =============================================

export type UserRole = 'BDE' | 'ORGA';

export type ProjectType =
  | 'Gala'
  | 'Soirée'
  | 'Festival'
  | 'Conférence'
  | 'Concert'
  | 'Compétition'
  | 'Autre';

export type ProjectStatus =
  | 'draft'
  | 'published'
  | 'pending_quotes'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type InventoryCategory = 'Son' | 'Image' | 'Lumière' | 'Logistique';

export type RentalStatus =
  | 'pending'
  | 'approved'
  | 'ongoing'
  | 'completed'
  | 'cancelled'
  | 'rejected';

// =============================================
// Database Tables Types
// =============================================

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  organization_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  bde_id: string;
  title: string;
  type: ProjectType;
  budget?: number;
  capacity?: number;
  location: string;
  description: string;
  requirements?: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  feedback_given: boolean;
  selected_orga_id?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  owner_id: string;
  category: InventoryCategory;
  title: string;
  description: string;
  daily_price: number;
  quantity: number;
  available: boolean;
  images: string[];
  specifications: Record<string, any>;
  location?: string;
  condition: string;
  min_rental_days: number;
  max_rental_days?: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface Rental {
  id: string;
  item_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: RentalStatus;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewee_id: string;
  global_rating: number;
  punctuality_rating: number;
  quality_rating: number;
  communication_rating: number;
  value_rating: number;
  comment?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  orga_id: string;
  message: string;
  proposed_price?: number;
  status: string;
  created_at: string;
}

// =============================================
// Computed Types & Views
// =============================================

export interface OrgaScore {
  average_rating: number;
  total_reviews: number;
  punctuality_avg: number;
  quality_avg: number;
  communication_avg: number;
  value_avg: number;
  weighted_score: number;
}

export interface TopOrga extends Profile {
  average_rating: number;
  total_reviews: number;
  weighted_score: number;
}

// =============================================
// Form Types
// =============================================

export interface CreateProjectForm {
  title: string;
  type: ProjectType;
  budget?: number;
  capacity?: number;
  location: string;
  description: string;
  requirements?: string;
  start_date: Date;
  end_date: Date;
}

export interface CreateInventoryForm {
  category: InventoryCategory;
  title: string;
  description: string;
  daily_price: number;
  quantity: number;
  location?: string;
  condition: string;
  min_rental_days: number;
  max_rental_days?: number;
  specifications: Record<string, any>;
}

export interface CreateReviewForm {
  project_id: string;
  reviewee_id: string;
  global_rating: number;
  punctuality_rating: number;
  quality_rating: number;
  communication_rating: number;
  value_rating: number;
  comment?: string;
}

// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
