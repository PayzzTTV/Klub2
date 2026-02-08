import { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export type PendingFeedbackProject = {
  id: string;
  title: string;
  type: string;
  end_date: string;
  completed_at?: string;
};

/**
 * Hook to detect completed projects that need feedback
 * Returns projects that are completed but feedback_given is false
 */
export function usePendingFeedback(supabase: SupabaseClient, userId: string | null) {
  const [pendingProjects, setPendingProjects] = useState<PendingFeedbackProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function loadPendingFeedback() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, type, end_date, updated_at')
          .eq('bde_id', userId)
          .eq('status', 'completed')
          .eq('feedback_given', false)
          .order('end_date', { ascending: true });

        if (error) {
          console.error('Error loading pending feedback:', error);
          setPendingProjects([]);
        } else {
          setPendingProjects(data || []);
        }
      } catch (err) {
        console.error('Error in usePendingFeedback:', err);
        setPendingProjects([]);
      } finally {
        setLoading(false);
      }
    }

    loadPendingFeedback();
  }, [supabase, userId]);

  return { pendingProjects, loading };
}
