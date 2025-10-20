export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number | null
          tier: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value?: number | null
          tier?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number | null
          tier?: string | null
        }
        Relationships: []
      }
      breathing_presets: {
        Row: {
          created_at: string
          description: string
          exhale_seconds: number
          hold_seconds: number
          id: string
          inhale_seconds: number
          name: string
          purpose: string
          recommended_rounds: number
        }
        Insert: {
          created_at?: string
          description: string
          exhale_seconds: number
          hold_seconds: number
          id?: string
          inhale_seconds: number
          name: string
          purpose: string
          recommended_rounds?: number
        }
        Update: {
          created_at?: string
          description?: string
          exhale_seconds?: number
          hold_seconds?: number
          id?: string
          inhale_seconds?: number
          name?: string
          purpose?: string
          recommended_rounds?: number
        }
        Relationships: []
      }
      breathing_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          exhale_seconds: number
          hold_seconds: number
          id: string
          inhale_seconds: number
          pattern_name: string
          rounds_completed: number
          started_at: string
          total_duration_seconds: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          exhale_seconds: number
          hold_seconds: number
          id?: string
          inhale_seconds: number
          pattern_name: string
          rounds_completed?: number
          started_at?: string
          total_duration_seconds?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          exhale_seconds?: number
          hold_seconds?: number
          id?: string
          inhale_seconds?: number
          pattern_name?: string
          rounds_completed?: number
          started_at?: string
          total_duration_seconds?: number
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed_at: string | null
          course_session_id: string
          created_at: string
          id: string
          last_position_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_session_id: string
          created_at?: string
          id?: string
          last_position_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_session_id?: string
          created_at?: string
          id?: string
          last_position_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_session_id_fkey"
            columns: ["course_session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sessions: {
        Row: {
          audio_url: string
          course_id: string
          created_at: string
          daypart_window: string | null
          description: string | null
          duration_minutes: number
          id: string
          order_index: number
          title: string
          unlock_day: number | null
        }
        Insert: {
          audio_url: string
          course_id: string
          created_at?: string
          daypart_window?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          order_index: number
          title: string
          unlock_day?: number | null
        }
        Update: {
          audio_url?: string
          course_id?: string
          created_at?: string
          daypart_window?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          order_index?: number
          title?: string
          unlock_day?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tags: {
        Row: {
          course_id: string
          tag_id: string
        }
        Insert: {
          course_id: string
          tag_id: string
        }
        Update: {
          course_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_tags_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          intro_video_url: string | null
          is_published: boolean
          scheduling_mode: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          intro_video_url?: string | null
          is_published?: boolean
          scheduling_mode?: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          intro_video_url?: string | null
          is_published?: boolean
          scheduling_mode?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          completed_at: string | null
          created_at: string
          current_value: number
          deadline: string | null
          description: string | null
          goal_type: string
          id: string
          is_active: boolean
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string | null
          description?: string | null
          goal_type: string
          id?: string
          is_active?: boolean
          target_value: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meditation_sessions: {
        Row: {
          abandoned_at: string | null
          completed_at: string | null
          created_at: string
          duration_minutes: number
          id: string
          interval_minutes: number | null
          paused_at: string | null
          resumed_at: string | null
          session_type: string
          started_at: string
          status: string
          total_minutes_meditated: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abandoned_at?: string | null
          completed_at?: string | null
          created_at?: string
          duration_minutes: number
          id?: string
          interval_minutes?: number | null
          paused_at?: string | null
          resumed_at?: string | null
          session_type?: string
          started_at?: string
          status?: string
          total_minutes_meditated?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abandoned_at?: string | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          interval_minutes?: number | null
          paused_at?: string | null
          resumed_at?: string | null
          session_type?: string
          started_at?: string
          status?: string
          total_minutes_meditated?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meditation_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meditation_tags: {
        Row: {
          meditation_id: string
          tag_id: string
        }
        Insert: {
          meditation_id: string
          tag_id: string
        }
        Update: {
          meditation_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meditation_tags_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "standalone_meditations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meditation_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_plans: {
        Row: {
          created_at: string
          frequency: string
          grace_days: number
          id: string
          is_active: boolean
          target_minutes_per_week: number | null
          target_sessions_per_week: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: string
          grace_days?: number
          id?: string
          is_active?: boolean
          target_minutes_per_week?: number | null
          target_sessions_per_week?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          grace_days?: number
          id?: string
          is_active?: boolean
          target_minutes_per_week?: number | null
          target_sessions_per_week?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sound_library: {
        Row: {
          created_at: string
          file_url: string
          id: string
          name: string
          sound_type: string
          theme_pack: string | null
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          name: string
          sound_type: string
          theme_pack?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          name?: string
          sound_type?: string
          theme_pack?: string | null
        }
        Relationships: []
      }
      standalone_meditations: {
        Row: {
          audio_url: string
          category_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_published: boolean
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_published?: boolean
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_published?: boolean
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "standalone_meditations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standalone_meditations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          created_at: string
          current_streak: number
          grace_used: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          grace_used?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          grace_used?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          is_approved: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_award_badges: {
        Args: { _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_streak: {
        Args: { _activity_date: string; _streak_type: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "end_user" | "teacher" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["end_user", "teacher", "super_admin"],
    },
  },
} as const
