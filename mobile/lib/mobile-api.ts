import { supabase } from './supabase';

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
  }
};
