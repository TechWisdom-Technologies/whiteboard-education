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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          amenities: Json | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          near_university_ids: Json | null
          price_per_month: number
          property_type: string
          room_types: Json | null
          travel_distance: string | null
          type: string
          unit_types: Json | null
          updated_at: string
        }
        Insert: {
          amenities?: Json | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          near_university_ids?: Json | null
          price_per_month?: number
          property_type?: string
          room_types?: Json | null
          travel_distance?: string | null
          type?: string
          unit_types?: Json | null
          updated_at?: string
        }
        Update: {
          amenities?: Json | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          near_university_ids?: Json | null
          price_per_month?: number
          property_type?: string
          room_types?: Json | null
          travel_distance?: string | null
          type?: string
          unit_types?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          date: string | null
          excerpt: string | null
          id: string
          image: string | null
          read_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          date?: string | null
          excerpt?: string | null
          id?: string
          image?: string | null
          read_time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          date?: string | null
          excerpt?: string | null
          id?: string
          image?: string | null
          read_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          about_text: string | null
          banner_image: string | null
          capital: string | null
          code: string
          cost_of_living: Json | null
          created_at: string
          currency: string | null
          flag_icon: string | null
          id: string
          language: string | null
          name: string
          population: string | null
          post_study_work_rights: string | null
          reasons_to_study: Json | null
          updated_at: string
        }
        Insert: {
          about_text?: string | null
          banner_image?: string | null
          capital?: string | null
          code: string
          cost_of_living?: Json | null
          created_at?: string
          currency?: string | null
          flag_icon?: string | null
          id?: string
          language?: string | null
          name: string
          population?: string | null
          post_study_work_rights?: string | null
          reasons_to_study?: Json | null
          updated_at?: string
        }
        Update: {
          about_text?: string | null
          banner_image?: string | null
          capital?: string | null
          code?: string
          cost_of_living?: Json | null
          created_at?: string
          currency?: string | null
          flag_icon?: string | null
          id?: string
          language?: string | null
          name?: string
          population?: string | null
          post_study_work_rights?: string | null
          reasons_to_study?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          career_outcomes: Json | null
          created_at: string
          curriculum: Json | null
          degree_level: string
          duration: string | null
          entry_requirements: Json | null
          id: string
          intake_months: Json | null
          overview: string | null
          title: string
          tuition_fee: number
          university_id: string | null
          updated_at: string
        }
        Insert: {
          career_outcomes?: Json | null
          created_at?: string
          curriculum?: Json | null
          degree_level?: string
          duration?: string | null
          entry_requirements?: Json | null
          id?: string
          intake_months?: Json | null
          overview?: string | null
          title: string
          tuition_fee?: number
          university_id?: string | null
          updated_at?: string
        }
        Update: {
          career_outcomes?: Json | null
          created_at?: string
          curriculum?: Json | null
          degree_level?: string
          duration?: string | null
          entry_requirements?: Json | null
          id?: string
          intake_months?: Json | null
          overview?: string | null
          title?: string
          tuition_fee?: number
          university_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          id: string
          spots_left: number | null
          time: string | null
          title: string
          type: string
          university_ids: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          spots_left?: number | null
          time?: string | null
          title: string
          type?: string
          university_ids?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          spots_left?: number | null
          time?: string | null
          title?: string
          type?: string
          university_ids?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      intake_reminders: {
        Row: {
          active: boolean
          created_at: string
          deadline_date: string | null
          email: string
          full_name: string | null
          id: string
          intake_label: string | null
          last_sent_at: string | null
          university_name: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          deadline_date?: string | null
          email: string
          full_name?: string | null
          id?: string
          intake_label?: string | null
          last_sent_at?: string | null
          university_name?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          deadline_date?: string | null
          email?: string
          full_name?: string | null
          id?: string
          intake_label?: string | null
          last_sent_at?: string | null
          university_name?: string | null
        }
        Relationships: []
      }
      language_centers: {
        Row: {
          city: string
          created_at: string
          curriculum: Json | null
          duration: string | null
          id: string
          institute: string | null
          intake_months: Json | null
          level: string
          name: string
          overview: string | null
          tuition_fee: number
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          curriculum?: Json | null
          duration?: string | null
          id?: string
          institute?: string | null
          intake_months?: Json | null
          level?: string
          name: string
          overview?: string | null
          tuition_fee?: number
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          curriculum?: Json | null
          duration?: string | null
          id?: string
          institute?: string | null
          intake_months?: Json | null
          level?: string
          name?: string
          overview?: string | null
          tuition_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          interested_course: string | null
          interested_university: string | null
          nationality: string | null
          phone: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          interested_course?: string | null
          interested_university?: string | null
          nationality?: string | null
          phone?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interested_course?: string | null
          interested_university?: string | null
          nationality?: string | null
          phone?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_notification_reads: {
        Row: {
          admin_user_id: string
          created_at: string
          id: string
          is_read: boolean
          notification_key: string
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          notification_key: string
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          notification_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          event_type: string
          href: string
          id: string
          message: string
          metadata: Json
          source_id: string
          source_table: string
          title: string
        }
        Insert: {
          created_at?: string
          event_type: string
          href: string
          id?: string
          message: string
          metadata?: Json
          source_id: string
          source_table: string
          title: string
        }
        Update: {
          created_at?: string
          event_type?: string
          href?: string
          id?: string
          message?: string
          metadata?: Json
          source_id?: string
          source_table?: string
          title?: string
        }
        Relationships: []
      }
      partner_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          partner_id: string
          read: boolean
          student_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string
          partner_id: string
          read?: boolean
          student_id?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          partner_id?: string
          read?: boolean
          student_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_registrations: {
        Row: {
          admin_notes: string | null
          agency_name: string
          annual_students: number | null
          certificate_urls: Json | null
          contact_person: string
          country: string
          created_at: string
          default_commission_percentage: number | null
          email: string
          id: string
          nid_document_url: string | null
          phone: string | null
          status: string
          trade_license_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          agency_name: string
          annual_students?: number | null
          certificate_urls?: Json | null
          contact_person: string
          country?: string
          created_at?: string
          default_commission_percentage?: number | null
          email: string
          id?: string
          nid_document_url?: string | null
          phone?: string | null
          status?: string
          trade_license_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          agency_name?: string
          annual_students?: number | null
          certificate_urls?: Json | null
          contact_person?: string
          country?: string
          created_at?: string
          default_commission_percentage?: number | null
          email?: string
          id?: string
          nid_document_url?: string | null
          phone?: string | null
          status?: string
          trade_license_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          coverage_amount: string
          created_at: string
          criteria: string | null
          id: string
          name: string
          university_id: string | null
          updated_at: string
        }
        Insert: {
          coverage_amount?: string
          created_at?: string
          criteria?: string | null
          id?: string
          name: string
          university_id?: string | null
          updated_at?: string
        }
        Update: {
          coverage_amount?: string
          created_at?: string
          criteria?: string | null
          id?: string
          name?: string
          university_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_transcript_url: string | null
          admin_notes: string | null
          commission_notes: string | null
          commission_percentage: number | null
          contract_amount_usd: number | null
          created_at: string
          date_of_birth: string | null
          degree_level: string | null
          email: string
          full_name: string
          gender: string | null
          gpa: number | null
          id: string
          ielts_certificate_url: string | null
          ielts_score: number | null
          intake_month: string | null
          nationality: string | null
          other_documents: Json | null
          partner_id: string
          payment_verification_url: string | null
          payment_verified_at: string | null
          payment_verified_by: string | null
          passport_number: string | null
          passport_photo_url: string | null
          passport_url: string | null
          personal_statement_url: string | null
          phone: string | null
          previous_degree: string | null
          previous_institution: string | null
          recommendation_letter_url: string | null
          status: string
          target_course: string | null
          target_university: string | null
          updated_at: string
        }
        Insert: {
          academic_transcript_url?: string | null
          admin_notes?: string | null
          commission_notes?: string | null
          commission_percentage?: number | null
          contract_amount_usd?: number | null
          created_at?: string
          date_of_birth?: string | null
          degree_level?: string | null
          email?: string
          full_name: string
          gender?: string | null
          gpa?: number | null
          id?: string
          ielts_certificate_url?: string | null
          ielts_score?: number | null
          intake_month?: string | null
          nationality?: string | null
          other_documents?: Json | null
          partner_id: string
          payment_verification_url?: string | null
          payment_verified_at?: string | null
          payment_verified_by?: string | null
          passport_number?: string | null
          passport_photo_url?: string | null
          passport_url?: string | null
          personal_statement_url?: string | null
          phone?: string | null
          previous_degree?: string | null
          previous_institution?: string | null
          recommendation_letter_url?: string | null
          status?: string
          target_course?: string | null
          target_university?: string | null
          updated_at?: string
        }
        Update: {
          academic_transcript_url?: string | null
          admin_notes?: string | null
          commission_notes?: string | null
          commission_percentage?: number | null
          contract_amount_usd?: number | null
          created_at?: string
          date_of_birth?: string | null
          degree_level?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          gpa?: number | null
          id?: string
          ielts_certificate_url?: string | null
          ielts_score?: number | null
          intake_month?: string | null
          nationality?: string | null
          other_documents?: Json | null
          partner_id?: string
          payment_verification_url?: string | null
          payment_verified_at?: string | null
          payment_verified_by?: string | null
          passport_number?: string | null
          passport_photo_url?: string | null
          passport_url?: string | null
          personal_statement_url?: string | null
          phone?: string | null
          previous_degree?: string | null
          previous_institution?: string | null
          recommendation_letter_url?: string | null
          status?: string
          target_course?: string | null
          target_university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          about_text: string | null
          campus_size: string | null
          city: string
          country_id: string | null
          created_at: string
          description: string | null
          established: number | null
          faqs: Json | null
          global_score: number | null
          hero_image: string | null
          id: string
          international_ratio: number | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          ranking: number | null
          registration_steps: Json | null
          study_reasons: Json | null
          total_students: number | null
          updated_at: string
        }
        Insert: {
          about_text?: string | null
          campus_size?: string | null
          city?: string
          country_id?: string | null
          created_at?: string
          description?: string | null
          established?: number | null
          faqs?: Json | null
          global_score?: number | null
          hero_image?: string | null
          id?: string
          international_ratio?: number | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          ranking?: number | null
          registration_steps?: Json | null
          study_reasons?: Json | null
          total_students?: number | null
          updated_at?: string
        }
        Update: {
          about_text?: string | null
          campus_size?: string | null
          city?: string
          country_id?: string | null
          created_at?: string
          description?: string | null
          established?: number | null
          faqs?: Json | null
          global_score?: number | null
          hero_image?: string | null
          id?: string
          international_ratio?: number | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          ranking?: number | null
          registration_steps?: Json | null
          study_reasons?: Json | null
          total_students?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "universities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
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
      app_role: "admin" | "partner" | "user"
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
      app_role: ["admin", "partner", "user"],
    },
  },
} as const
