import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from './useAuthState';

interface DashboardStats {
  aiConversations: number;
  appointments: number;
  resourcesViewed: number;
  forumPosts: number;
  assessmentsTaken: number;
  loading: boolean;
}

export function useDashboardStats(): DashboardStats {
  const { user } = useAuthState();
  const [stats, setStats] = useState<DashboardStats>({
    aiConversations: 0,
    appointments: 0,
    resourcesViewed: 0,
    forumPosts: 0,
    assessmentsTaken: 0,
    loading: true
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch AI conversations count
      const { count: aiCount } = await supabase
        .from('ai_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch appointments count
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id);

      // Fetch forum posts count
      const { count: forumCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch assessments count
      const { count: assessmentCount } = await supabase
        .from('mental_health_assessments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // For resources viewed, we'll use a simple calculation
      // In a real app, you'd track this in a separate table
      const resourcesViewed = Math.max(0, (aiCount || 0) + (assessmentCount || 0) * 2);

      setStats({
        aiConversations: aiCount || 0,
        appointments: appointmentCount || 0,
        resourcesViewed,
        forumPosts: forumCount || 0,
        assessmentsTaken: assessmentCount || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return stats;
}