import { supabase } from '@/integrations/supabase/client';

export interface DashboardSummary {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  token_balance: number;
  active_goals: number;
  unread_notifications: number;
  enrolled_courses: number;
}

export interface ProgressStats {
  weekly: {
    sessions: number;
    minutes: number;
  };
  monthly: {
    sessions: number;
    minutes: number;
  };
  breathing_sessions: number;
  courses_completed: number;
  badges_earned: number;
  longest_streak: number;
}

export interface CourseWithProgress {
  course_id: string;
  course_title: string;
  course_description: string;
  teacher_name: string;
  total_sessions: number;
  completed_sessions: number;
  progress_percentage: number;
}

export interface PaginatedCourse {
  id: string;
  title: string;
  description: string;
  teacher_name: string;
  category_name: string;
  token_cost: number;
  session_count: number;
  created_at: string;
}

export const mobileApi = {
  async getDashboardSummary(userId: string): Promise<DashboardSummary | null> {
    const { data, error } = await supabase.rpc('get_user_dashboard_summary', {
      _user_id: userId
    });

    if (error) {
      console.error('Error fetching dashboard summary:', error);
      return null;
    }

    return data as DashboardSummary;
  },

  async getProgressStats(userId: string): Promise<ProgressStats | null> {
    const { data, error } = await supabase.rpc('get_user_progress_stats', {
      _user_id: userId
    });

    if (error) {
      console.error('Error fetching progress stats:', error);
      return null;
    }

    return data as ProgressStats;
  },

  async getUserCoursesWithProgress(userId: string): Promise<CourseWithProgress[]> {
    const { data, error } = await supabase.rpc('get_user_courses_with_progress', {
      _user_id: userId
    });

    if (error) {
      console.error('Error fetching user courses:', error);
      return [];
    }

    return data as CourseWithProgress[];
  },

  async getCoursesPaginated(
    categoryId?: string,
    pageSize: number = 20,
    offset: number = 0
  ): Promise<PaginatedCourse[]> {
    const { data, error } = await supabase.rpc('get_courses_paginated', {
      _category_id: categoryId || null,
      _page_size: pageSize,
      _offset_value: offset
    });

    if (error) {
      console.error('Error fetching paginated courses:', error);
      return [];
    }

    return data as PaginatedCourse[];
  },

  async syncMeditationSession(params: {
    userId: string;
    sessionType: string;
    durationMinutes: number;
    status: string;
    startedAt: string;
    completedAt?: string;
    totalMinutes?: number;
  }): Promise<string | null> {
    const { data, error } = await supabase.rpc('sync_meditation_session', {
      _user_id: params.userId,
      _session_type: params.sessionType,
      _duration_minutes: params.durationMinutes,
      _status: params.status,
      _started_at: params.startedAt,
      _completed_at: params.completedAt || null,
      _total_minutes: params.totalMinutes || 0
    });

    if (error) {
      console.error('Error syncing meditation session:', error);
      return null;
    }

    return data as string;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data;
  },

  async getBreathingPresets() {
    const { data, error } = await supabase
      .from('breathing_presets')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching breathing presets:', error);
      return [];
    }

    return data;
  },

  async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (
          name,
          description,
          icon,
          category,
          tier
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data;
  },

  async getUserNotifications(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data;
  },

  async markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  },

  async getUserStreaks(userId: string) {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user streaks:', error);
      return [];
    }

    return data;
  },

  async getUserGoals(userId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user goals:', error);
      return [];
    }

    return data;
  },

  async getUserTokenBalance(userId: string) {
    const { data, error } = await supabase
      .from('user_tokens')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }

    return data?.balance || 0;
  },

  async hasUserPurchased(userId: string, entityType: 'course' | 'meditation', entityId: string) {
    const { data, error } = await supabase
      .from('user_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .maybeSingle();

    if (error) {
      console.error('Error checking purchase status:', error);
      return false;
    }

    return !!data;
  },

  async purchaseContent(userId: string, entityType: 'course' | 'meditation', entityId: string, tokenCost: number) {
    const { data, error } = await supabase.rpc('purchase_content', {
      _user_id: userId,
      _entity_type: entityType,
      _entity_id: entityId,
      _token_cost: tokenCost
    });

    if (error) {
      console.error('Error purchasing content:', error);
      return { success: false, error: error.message };
    }

    return data;
  },

  async enrollInCourse(userId: string, courseId: string) {
    const { error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId
      });

    if (error) {
      console.error('Error enrolling in course:', error);
      return false;
    }

    return true;
  },

  async updateCourseProgress(
    userId: string,
    sessionId: string,
    lastPositionSeconds: number,
    completed: boolean = false
  ) {
    const updateData: any = {
      last_position_seconds: lastPositionSeconds
    };

    if (completed) {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('course_progress')
      .upsert({
        user_id: userId,
        course_session_id: sessionId,
        ...updateData
      });

    if (error) {
      console.error('Error updating course progress:', error);
      return false;
    }

    return true;
  },

  async getCourseDetails(courseId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        teachers (
          id,
          bio,
          profiles (
            full_name,
            avatar_url
          )
        ),
        categories (
          name,
          icon
        ),
        course_sessions (
          id,
          title,
          description,
          audio_url,
          duration_minutes,
          order_index
        )
      `)
      .eq('id', courseId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching course details:', error);
      return null;
    }

    return data;
  },

  async getMeditationDetails(meditationId: string) {
    const { data, error } = await supabase
      .from('standalone_meditations')
      .select(`
        *,
        teachers (
          id,
          bio,
          profiles (
            full_name,
            avatar_url
          )
        ),
        categories (
          name,
          icon
        )
      `)
      .eq('id', meditationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching meditation details:', error);
      return null;
    }

    return data;
  }
};
