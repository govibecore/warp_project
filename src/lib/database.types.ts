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
      assessments: {
        Row: {
          ability_theta: Json | null
          class_level: number
          completed_at: string | null
          created_at: string
          difficulty: string
          global_score: number | null
          id: string
          percentiles: Json | null
          responses: Json
          scaled_scores: Json | null
          started_at: string
          status: string
          student_id: string
          total_time_ms: number | null
        }
        Insert: {
          ability_theta?: Json | null
          class_level: number
          completed_at?: string | null
          created_at?: string
          difficulty: string
          global_score?: number | null
          id?: string
          percentiles?: Json | null
          responses?: Json
          scaled_scores?: Json | null
          started_at?: string
          status?: string
          student_id: string
          total_time_ms?: number | null
        }
        Update: {
          ability_theta?: Json | null
          class_level?: number
          completed_at?: string | null
          created_at?: string
          difficulty?: string
          global_score?: number | null
          id?: string
          percentiles?: Json | null
          responses?: Json
          scaled_scores?: Json | null
          started_at?: string
          status?: string
          student_id?: string
          total_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          student_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          student_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          student_id?: string | null
        }
        Relationships: []
      }
      norms: {
        Row: {
          class_level: number
          competency: string
          difficulty: string | null
          is_provisional: boolean | null
          mean: number
          region: string
          sample_size: number | null
          source: string | null
          std_dev: number
          updated_at: string | null
          version: string
        }
        Insert: {
          class_level: number
          competency: string
          difficulty?: string | null
          is_provisional?: boolean | null
          mean: number
          region: string
          sample_size?: number | null
          source?: string | null
          std_dev: number
          updated_at?: string | null
          version: string
        }
        Update: {
          class_level?: number
          competency?: string
          difficulty?: string | null
          is_provisional?: boolean | null
          mean?: number
          region?: string
          sample_size?: number | null
          source?: string | null
          std_dev?: number
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          ai_provenance: Json | null
          assessment_id: string
          generated_at: string | null
          id: string
          parent_variant: Json | null
          pdf_generated_at: string | null
          pdf_path: string | null
          resource_keys: string[] | null
          share_expires_at: string | null
          share_token: string | null
          student_id: string
          student_variant: Json | null
          trajectory_context_assessment_ids: string[] | null
        }
        Insert: {
          ai_provenance?: Json | null
          assessment_id: string
          generated_at?: string | null
          id?: string
          parent_variant?: Json | null
          pdf_generated_at?: string | null
          pdf_path?: string | null
          resource_keys?: string[] | null
          share_expires_at?: string | null
          share_token?: string | null
          student_id: string
          student_variant?: Json | null
          trajectory_context_assessment_ids?: string[] | null
        }
        Update: {
          ai_provenance?: Json | null
          assessment_id?: string
          generated_at?: string | null
          id?: string
          parent_variant?: Json | null
          pdf_generated_at?: string | null
          pdf_path?: string | null
          resource_keys?: string[] | null
          share_expires_at?: string | null
          share_token?: string | null
          student_id?: string
          student_variant?: Json | null
          trajectory_context_assessment_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string | null
          competency: string | null
          difficulty: string | null
          key: string
          language: string | null
          title: string
          url: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          category?: string | null
          competency?: string | null
          difficulty?: string | null
          key: string
          language?: string | null
          title: string
          url: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          category?: string | null
          competency?: string | null
          difficulty?: string | null
          key?: string
          language?: string | null
          title?: string
          url?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          class_level: number | null
          competency: string
          context_image: string | null
          created_at: string | null
          developmental_band: string
          difficulty: string | null
          hint: string | null
          id: string
          international_benchmark: string | null
          irt_a: number | null
          irt_b: number | null
          irt_c: number | null
          is_active: boolean | null
          learning_objective: string | null
          options: Json
          prompt: string
          scenario_code: string
          question_type: string
          metadata: Json | null
          usage_count: number | null
        }
        Insert: {
          class_level?: number | null
          competency: string
          context_image?: string | null
          created_at?: string | null
          developmental_band: string
          difficulty?: string | null
          hint?: string | null
          id?: string
          international_benchmark?: string | null
          irt_a?: number | null
          irt_b?: number | null
          irt_c?: number | null
          is_active?: boolean | null
          learning_objective?: string | null
          options: Json
          prompt: string
          scenario_code: string
          question_type?: string
          metadata?: Json | null
          usage_count?: number | null
        }
        Update: {
          class_level?: number | null
          competency?: string
          context_image?: string | null
          created_at?: string | null
          developmental_band?: string
          difficulty?: string | null
          hint?: string | null
          id?: string
          international_benchmark?: string | null
          irt_a?: number | null
          irt_b?: number | null
          irt_c?: number | null
          is_active?: boolean | null
          learning_objective?: string | null
          options?: Json
          prompt?: string
          scenario_code?: string
          question_type?: string
          metadata?: Json | null
          usage_count?: number | null
        }
        Relationships: []
      }
      students: {
        Row: {
          city: string | null
          competency_embedding: string | null
          consent_expires_at: string | null
          consent_method: string | null
          consent_status: string
          consent_token_ref: string | null
          consent_verified_at: string | null
          created_at: string
          current_class: number
          date_of_birth: string | null
          difficulty_pref: string | null
          full_name: string
          gender: string | null
          id: string
          parent_name: string | null
          parent_phone: string | null
          preferred_language: string | null
          school_name: string | null
          state: string | null
        }
        Insert: {
          city?: string | null
          competency_embedding?: string | null
          consent_expires_at?: string | null
          consent_method?: string | null
          consent_status?: string
          consent_token_ref?: string | null
          consent_verified_at?: string | null
          created_at?: string
          current_class: number
          date_of_birth?: string | null
          difficulty_pref?: string | null
          full_name: string
          gender?: string | null
          id: string
          parent_name?: string | null
          parent_phone?: string | null
          preferred_language?: string | null
          school_name?: string | null
          state?: string | null
        }
        Update: {
          city?: string | null
          competency_embedding?: string | null
          consent_expires_at?: string | null
          consent_method?: string | null
          consent_status?: string
          consent_token_ref?: string | null
          consent_verified_at?: string | null
          created_at?: string
          current_class?: number
          date_of_birth?: string | null
          difficulty_pref?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          parent_name?: string | null
          parent_phone?: string | null
          preferred_language?: string | null
          school_name?: string | null
          state?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      scenarios_safe: {
        Row: {
          competency: string | null
          context_image: string | null
          created_at: string | null
          developmental_band: string | null
          difficulty: string | null
          hint: string | null
          id: string | null
          is_active: boolean | null
          learning_objective: string | null
          options: Json | null
          prompt: string | null
          scenario_code: string | null
          question_type: string | null
          metadata: Json | null
          usage_count: number | null
        }
        Insert: {
          competency?: string | null
          context_image?: string | null
          created_at?: string | null
          developmental_band?: string | null
          difficulty?: string | null
          hint?: string | null
          id?: string | null
          is_active?: boolean | null
          learning_objective?: string | null
          options?: Json | null
          prompt?: string | null
          scenario_code?: string | null
          question_type?: string | null
          metadata?: Json | null
          usage_count?: number | null
        }
        Update: {
          competency?: string | null
          context_image?: string | null
          created_at?: string | null
          developmental_band?: string | null
          difficulty?: string | null
          hint?: string | null
          id?: string | null
          is_active?: boolean | null
          learning_objective?: string | null
          options?: Json | null
          prompt?: string | null
          scenario_code?: string | null
          question_type?: string | null
          metadata?: Json | null
          usage_count?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_admin_stats: { Args: never; Returns: Json }
      get_admin_students: {
        Args: { page_num: number; page_size: number; search_term: string }
        Returns: Json
      }
      get_shared_report: {
        Args: { p_token: string }
        Returns: {
          ai_provenance: Json | null
          assessment_id: string
          generated_at: string | null
          id: string
          parent_variant: Json | null
          pdf_generated_at: string | null
          pdf_path: string | null
          resource_keys: string[] | null
          share_expires_at: string | null
          share_token: string | null
          student_id: string
          student_variant: Json | null
          trajectory_context_assessment_ids: string[] | null
        }[]
        SetofOptions: {
          from: "*"
          to: "reports"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      next_scenario: {
        Args: { p_assessment: string }
        Returns: Database["public"]["CompositeTypes"]["scenario_safe"][]
        SetofOptions: {
          from: "*"
          to: "scenario_safe"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      score_competency: {
        Args: { p_competency: string; p_region?: string; p_theta: number }
        Returns: {
          percentile: number
          scaled_score: number
        }[]
      }
      record_assessment_response: {
        Args: {
          p_assessment: string
          p_scenario_id: string
          p_selected_text: string
          p_correct: boolean
          p_option?: Json | null
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      scenario_safe: {
        id: string | null
        scenario_code: string | null
        question_type: string | null
        metadata: Json | null
        competency: string | null
        developmental_band: string | null
        difficulty: string | null
        prompt: string | null
        context_image: string | null
        options: Json | null
        learning_objective: string | null
        hint: string | null
        is_active: boolean | null
        usage_count: number | null
        created_at: string | null
      }
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
    Enums: {},
  },
} as const

