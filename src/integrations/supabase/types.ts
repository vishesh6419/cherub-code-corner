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
      ai_conversations: {
        Row: {
          conversation_data: Json
          created_at: string | null
          emergency_flags: string[] | null
          id: string
          requires_human_intervention: boolean | null
          risk_assessment:
            | Database["public"]["Enums"]["support_request_priority"]
            | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_data: Json
          created_at?: string | null
          emergency_flags?: string[] | null
          id?: string
          requires_human_intervention?: boolean | null
          risk_assessment?:
            | Database["public"]["Enums"]["support_request_priority"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_data?: Json
          created_at?: string | null
          emergency_flags?: string[] | null
          id?: string
          requires_human_intervention?: boolean | null
          risk_assessment?:
            | Database["public"]["Enums"]["support_request_priority"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          counselor_id: string
          counselor_notes: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          mode: string | null
          notes: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          student_id: string
          student_notes: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          counselor_id: string
          counselor_notes?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          mode?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          student_id: string
          student_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          counselor_id?: string
          counselor_notes?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          mode?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          student_id?: string
          student_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_counselor_id_fkey"
            columns: ["counselor_id"]
            isOneToOne: false
            referencedRelation: "counselors"
            referencedColumns: ["id"]
          },
        ]
      }
      counselors: {
        Row: {
          availability_schedule: Json | null
          created_at: string | null
          experience_years: number | null
          id: string
          is_available: boolean | null
          max_appointments_per_day: number | null
          qualification: string | null
          specialization: string[] | null
          user_id: string
        }
        Insert: {
          availability_schedule?: Json | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          max_appointments_per_day?: number | null
          qualification?: string | null
          specialization?: string[] | null
          user_id: string
        }
        Update: {
          availability_schedule?: Json | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          max_appointments_per_day?: number | null
          qualification?: string | null
          specialization?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      crisis_support_requests: {
        Row: {
          assigned_to: string | null
          contact_preference: string | null
          created_at: string | null
          description: string
          id: string
          location: string | null
          priority: Database["public"]["Enums"]["support_request_priority"]
          resolution_time: string | null
          response_time: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          contact_preference?: string | null
          created_at?: string | null
          description: string
          id?: string
          location?: string | null
          priority: Database["public"]["Enums"]["support_request_priority"]
          resolution_time?: string | null
          response_time?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          contact_preference?: string | null
          created_at?: string | null
          description?: string
          id?: string
          location?: string | null
          priority?: Database["public"]["Enums"]["support_request_priority"]
          resolution_time?: string | null
          response_time?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_moderated: boolean | null
          likes_count: number | null
          moderator_notes: string | null
          replies_count: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          moderator_notes?: string | null
          replies_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          moderator_notes?: string | null
          replies_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_moderated: boolean | null
          likes_count: number | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_health_assessments: {
        Row: {
          assessment_type: string
          id: string
          notes: string | null
          responses: Json
          risk_level:
            | Database["public"]["Enums"]["support_request_priority"]
            | null
          severity_level: string | null
          taken_at: string | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          assessment_type: string
          id?: string
          notes?: string | null
          responses: Json
          risk_level?:
            | Database["public"]["Enums"]["support_request_priority"]
            | null
          severity_level?: string | null
          taken_at?: string | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          assessment_type?: string
          id?: string
          notes?: string | null
          responses?: Json
          risk_level?:
            | Database["public"]["Enums"]["support_request_priority"]
            | null
          severity_level?: string | null
          taken_at?: string | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          college_name: string | null
          created_at: string | null
          department: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          id: string
          language_preference: string | null
          onboarding_completed: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          user_id: string
          year_of_study: number | null
        }
        Insert: {
          college_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id?: string
          language_preference?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id: string
          year_of_study?: number | null
        }
        Update: {
          college_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id?: string
          language_preference?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id?: string
          year_of_study?: number | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string | null
          content_text: string | null
          content_type: Database["public"]["Enums"]["resource_type"]
          content_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          language: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          category?: string | null
          content_text?: string | null
          content_type: Database["public"]["Enums"]["resource_type"]
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          category?: string | null
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["resource_type"]
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status: "pending" | "confirmed" | "cancelled" | "completed"
      resource_type: "video" | "audio" | "article" | "guide" | "exercise"
      support_request_priority: "low" | "medium" | "high" | "urgent"
      user_role: "student" | "counselor" | "admin" | "peer_volunteer"
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
      appointment_status: ["pending", "confirmed", "cancelled", "completed"],
      resource_type: ["video", "audio", "article", "guide", "exercise"],
      support_request_priority: ["low", "medium", "high", "urgent"],
      user_role: ["student", "counselor", "admin", "peer_volunteer"],
    },
  },
} as const
