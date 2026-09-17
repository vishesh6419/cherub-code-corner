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
    PostgrestVersion: "14.5"
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
          conversation_data?: Json
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
          created_at: string | null
          duration_minutes: number | null
          id: string
          institution_subscription_id: string | null
          mode: string | null
          provider_id: string
          provider_notes: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          student_id: string
          student_notes: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          institution_subscription_id?: string | null
          mode?: string | null
          provider_id: string
          provider_notes?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          student_id: string
          student_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          institution_subscription_id?: string | null
          mode?: string | null
          provider_id?: string
          provider_notes?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          student_id?: string
          student_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
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
          priority?: Database["public"]["Enums"]["support_request_priority"]
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
      institutions: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          state: string | null
          subscription_id: string
          subscription_tier: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          state?: string | null
          subscription_id?: string
          subscription_tier?: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          state?: string | null
          subscription_id?: string
          subscription_tier?: string
        }
        Relationships: []
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
          institution_id: string | null
          institution_subscription_id: string | null
          language_preference: string | null
          onboarding_completed: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
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
          institution_id?: string | null
          institution_subscription_id?: string | null
          language_preference?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
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
          institution_id?: string | null
          institution_subscription_id?: string | null
          language_preference?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
          year_of_study?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          bio: string | null
          certification_url: string | null
          clinic_name: string | null
          created_at: string | null
          email: string
          experience_years: number | null
          id: string
          institution_id: string | null
          is_available: boolean
          is_verified: boolean
          languages: string[] | null
          name: string
          phone: string | null
          profession: Database["public"]["Enums"]["provider_profession"]
          qualification: string | null
          session_modes: string[] | null
          specialization: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          certification_url?: string | null
          clinic_name?: string | null
          created_at?: string | null
          email: string
          experience_years?: number | null
          id?: string
          institution_id?: string | null
          is_available?: boolean
          is_verified?: boolean
          languages?: string[] | null
          name: string
          phone?: string | null
          profession?: Database["public"]["Enums"]["provider_profession"]
          qualification?: string | null
          session_modes?: string[] | null
          specialization?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          certification_url?: string | null
          clinic_name?: string | null
          created_at?: string | null
          email?: string
          experience_years?: number | null
          id?: string
          institution_id?: string | null
          is_available?: boolean
          is_verified?: boolean
          languages?: string[] | null
          name?: string
          phone?: string | null
          profession?: Database["public"]["Enums"]["provider_profession"]
          qualification?: string | null
          session_modes?: string[] | null
          specialization?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
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
          content_type?: Database["public"]["Enums"]["resource_type"]
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      appointment_status: "pending" | "confirmed" | "cancelled" | "completed"
      provider_profession:
        | "psychologist"
        | "counselor"
        | "therapist"
        | "psychiatrist"
        | "clinical_doctor"
      resource_type: "video" | "audio" | "article" | "guide" | "exercise"
      support_request_priority: "low" | "medium" | "high" | "urgent"
      user_role:
        | "student"
        | "provider"
        | "counselor"
        | "admin"
        | "peer_volunteer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
      appointment_status: ["pending", "confirmed", "cancelled", "completed"],
      provider_profession: [
        "psychologist",
        "counselor",
        "therapist",
        "psychiatrist",
        "clinical_doctor",
      ],
      resource_type: ["video", "audio", "article", "guide", "exercise"],
      support_request_priority: ["low", "medium", "high", "urgent"],
      user_role: [
        "student",
        "provider",
        "counselor",
        "admin",
        "peer_volunteer",
      ],
    },
  },
} as const
