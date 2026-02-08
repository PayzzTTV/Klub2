// ============================================================================
// PROJECTS UTILITIES - KLUB Platform
// ============================================================================
// Fonctions utilitaires pour la gestion des projets via Supabase
// ============================================================================

import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface Project {
  id: string;
  bde_id: string;
  title: string;
  type: 'Gala' | 'Soirée' | 'Festival' | 'Conférence' | 'Autre';
  budget: number;
  capacity: number;
  location: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  feedback_given: boolean;
  created_at: string;
  updated_at: string;
  bde_profile?: {
    name: string;
    organization_name: string;
    avatar_url?: string;
  };
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  orga_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposed_price: number;
  message: string;
  created_at: string;
  orga_profile?: {
    name: string;
    organization_name: string;
    avatar_url?: string;
    global_score?: number;
  };
}

export interface CreateProjectData {
  title: string;
  type: 'Gala' | 'Soirée' | 'Festival' | 'Conférence' | 'Autre';
  budget: number;
  capacity: number;
  location: string;
  description: string;
  start_date: string;
  end_date: string;
}

// ============================================================================
// AUTO UPDATE PROJECT STATUS BASED ON DATES
// ============================================================================

/**
 * Update project status automatically based on dates:
 * - published → in_progress (when start_date is reached)
 * - in_progress → completed (when end_date is passed)
 */
export async function updateProjectStatusByDate(
  supabase: SupabaseClient,
  projectId: string
): Promise<void> {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, status, start_date, end_date')
      .eq('id', projectId)
      .single();

    if (error || !project) return;

    const now = new Date();
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);

    let newStatus: string | null = null;

    // published → in_progress (start date reached)
    if (project.status === 'published' && now >= startDate) {
      newStatus = 'in_progress';
    }

    // in_progress → completed (end date passed)
    if (project.status === 'in_progress' && now > endDate) {
      newStatus = 'completed';
    }

    if (newStatus) {
      await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      console.log(`✅ Project ${projectId} status updated: ${project.status} → ${newStatus}`);
    }
  } catch (error) {
    console.error('Error updating project status:', error);
  }
}

/**
 * Batch update all projects that need status change
 */
export async function updateAllProjectStatuses(
  supabase: SupabaseClient
): Promise<void> {
  try {
    const now = new Date().toISOString();

    // Update published → in_progress (start_date reached)
    await supabase
      .from('projects')
      .update({ status: 'in_progress' })
      .eq('status', 'published')
      .lte('start_date', now);

    // Update in_progress → completed (end_date passed)
    await supabase
      .from('projects')
      .update({ status: 'completed' })
      .eq('status', 'in_progress')
      .lt('end_date', now);

    console.log('✅ All project statuses updated');
  } catch (error) {
    console.error('Error batch updating project statuses:', error);
  }
}

// ============================================================================
// GET PUBLISHED PROJECTS (for ORGA to browse)
// ============================================================================

export async function getPublishedProjects(
  supabase: SupabaseClient,
  filters?: {
    type?: string;
    search?: string;
  }
): Promise<Project[]> {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        bde_profile:profiles!bde_id (
          name,
          organization_name,
          avatar_url
        )
      `)
      .eq('status', 'published')
      .order('start_date', { ascending: true });

    // Apply type filter
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    // Apply search filter
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching published projects:', error);
      return [];
    }

    return data as Project[];
  } catch (error) {
    console.error('Error in getPublishedProjects:', error);
    return [];
  }
}

// ============================================================================
// GET PROJECT BY ID
// ============================================================================

export async function getProjectById(
  supabase: SupabaseClient,
  projectId: string
): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        bde_profile:profiles!bde_id (
          name,
          organization_name,
          avatar_url
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    return data as Project;
  } catch (error) {
    console.error('Error in getProjectById:', error);
    return null;
  }
}

// ============================================================================
// GET BDE PROJECTS (for BDE dashboard)
// ============================================================================

export async function getBDEProjects(
  supabase: SupabaseClient,
  bdeId: string
): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('bde_id', bdeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching BDE projects:', error);
      return [];
    }

    return data as Project[];
  } catch (error) {
    console.error('Error in getBDEProjects:', error);
    return [];
  }
}

// ============================================================================
// CREATE PROJECT (BDE only)
// ============================================================================

export async function createProject(
  supabase: SupabaseClient,
  bdeId: string,
  projectData: CreateProjectData
): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        bde_id: bdeId,
        ...projectData,
        status: 'published', // Directly publish
        feedback_given: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Project data sent:', projectData);
      return null;
    }

    return data as Project;
  } catch (error) {
    console.error('Error in createProject:', error);
    return null;
  }
}

// ============================================================================
// UPDATE PROJECT (BDE only)
// ============================================================================

export async function updateProject(
  supabase: SupabaseClient,
  projectId: string,
  updates: Partial<CreateProjectData>
): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return null;
    }

    return data as Project;
  } catch (error) {
    console.error('Error in updateProject:', error);
    return null;
  }
}

// ============================================================================
// DELETE PROJECT (BDE only)
// ============================================================================

export async function deleteProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProject:', error);
    return false;
  }
}

// ============================================================================
// GET PROJECT APPLICATIONS (for BDE to see who applied)
// ============================================================================

export async function getProjectApplications(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectApplication[]> {
  try {
    const { data, error } = await supabase
      .from('project_applications')
      .select(`
        *,
        orga_profile:profiles!orga_id (
          name,
          organization_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project applications:', error);
      return [];
    }

    return data as ProjectApplication[];
  } catch (error) {
    console.error('Error in getProjectApplications:', error);
    return [];
  }
}

// ============================================================================
// CREATE APPLICATION (ORGA applies to project)
// ============================================================================

export async function createApplication(
  supabase: SupabaseClient,
  orgaId: string,
  projectId: string,
  proposedPrice: number,
  message: string
): Promise<ProjectApplication | null> {
  try {
    // Check if already applied
    const { data: existingApp } = await supabase
      .from('project_applications')
      .select('id')
      .eq('project_id', projectId)
      .eq('orga_id', orgaId)
      .single();

    if (existingApp) {
      console.error('Already applied to this project');
      return null;
    }

    // Create application
    console.log('Creating application with:', { projectId, orgaId, proposedPrice, message });

    const { data, error } = await supabase
      .from('project_applications')
      .insert({
        project_id: projectId,
        orga_id: orgaId,
        proposed_price: proposedPrice,
        message,
        status: 'pending',
      })
      .select(`
        *,
        orga_profile:profiles!orga_id (
          name,
          organization_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating application:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    return data as ProjectApplication;
  } catch (error) {
    console.error('Error in createApplication:', error);
    return null;
  }
}

// ============================================================================
// UPDATE APPLICATION STATUS (BDE accepts/rejects)
// ============================================================================

export async function updateApplicationStatus(
  supabase: SupabaseClient,
  applicationId: string,
  status: 'accepted' | 'rejected'
): Promise<ProjectApplication | null> {
  try {
    const { data, error } = await supabase
      .from('project_applications')
      .update({ status })
      .eq('id', applicationId)
      .select(`
        *,
        orga_profile:profiles!orga_id (
          name,
          organization_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating application status:', error);
      return null;
    }

    return data as ProjectApplication;
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    return null;
  }
}

// ============================================================================
// GET ORGA APPLICATIONS (applications made by an ORGA)
// ============================================================================

export async function getOrgaApplications(
  supabase: SupabaseClient,
  orgaId: string
): Promise<ProjectApplication[]> {
  try {
    const { data, error } = await supabase
      .from('project_applications')
      .select(`
        *,
        project:projects (
          id,
          title,
          type,
          budget,
          location,
          start_date,
          bde_profile:profiles!bde_id (
            name,
            organization_name
          )
        )
      `)
      .eq('orga_id', orgaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ORGA applications:', error);
      return [];
    }

    return data as any; // Type complex avec relations
  } catch (error) {
    console.error('Error in getOrgaApplications:', error);
    return [];
  }
}

// ============================================================================
// MARK PROJECT AS COMPLETED (trigger feedback requirement)
// ============================================================================

export async function markProjectAsCompleted(
  supabase: SupabaseClient,
  projectId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('projects')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) {
      console.error('Error marking project as completed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markProjectAsCompleted:', error);
    return false;
  }
}

// ============================================================================
// CHECK IF BDE HAS PENDING FEEDBACK (for blocking dashboard)
// ============================================================================

export async function hasPendingFeedback(
  supabase: SupabaseClient,
  bdeId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('bde_id', bdeId)
      .eq('status', 'completed')
      .eq('feedback_given', false)
      .limit(1);

    if (error) {
      console.error('Error checking pending feedback:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in hasPendingFeedback:', error);
    return false;
  }
}
