export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_access: {
        Row: {
          action: string | null
          actor: string | null
          created_at: string | null
          details: Json | null
          id: string
          resource: string | null
          user_id: string
        }
        Insert: {
          action?: string | null
          actor?: string | null
          created_at?: string | null
          details?: Json | null
          id: string
          resource?: string | null
          user_id: string
        }
        Update: {
          action?: string | null
          actor?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          resource?: string | null
          user_id?: string
        }
        Relationships: []
      }
      consents: {
        Row: {
          consented_at: string | null
          user_id: string
        }
        Insert: {
          consented_at?: string | null
          user_id: string
        }
        Update: {
          consented_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_reports: {
        Row: {
          bureau: string | null
          created_at: string | null
          id: string
          parsed_at: string | null
          period_end: string | null
          period_start: string | null
          src_path: string
          status: string
          summary: Json | null
          user_id: string
        }
        Insert: {
          bureau?: string | null
          created_at?: string | null
          id: string
          parsed_at?: string | null
          period_end?: string | null
          period_start?: string | null
          src_path: string
          status?: string
          summary?: Json | null
          user_id: string
        }
        Update: {
          bureau?: string | null
          created_at?: string | null
          id?: string
          parsed_at?: string | null
          period_end?: string | null
          period_start?: string | null
          src_path?: string
          status?: string
          summary?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      dispute_candidates: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          kind: string | null
          rationale: string | null
          report_id: string
          tradeline_id: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id: string
          kind?: string | null
          rationale?: string | null
          report_id: string
          tradeline_id?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          kind?: string | null
          rationale?: string | null
          report_id?: string
          tradeline_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          bureau: string
          created_at: string | null
          due_at: string | null
          id: string
          items: Json
          letter_pdf_path: string | null
          mailed_at: string | null
          notes: string | null
          outcome: string | null
          status: string
          user_id: string
        }
        Insert: {
          bureau: string
          created_at?: string | null
          due_at?: string | null
          id: string
          items: Json
          letter_pdf_path?: string | null
          mailed_at?: string | null
          notes?: string | null
          outcome?: string | null
          status?: string
          user_id: string
        }
        Update: {
          bureau?: string
          created_at?: string | null
          due_at?: string | null
          id?: string
          items?: Json
          letter_pdf_path?: string | null
          mailed_at?: string | null
          notes?: string | null
          outcome?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      last_cron_run: {
        Row: {
          name: string
          ran_at: string | null
        }
        Insert: {
          name: string
          ran_at?: string | null
        }
        Update: {
          name?: string
          ran_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          dispute_id: string | null
          id: string
          link: string | null
          message: string | null
          notify_date: string | null
          read: boolean | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dispute_id?: string | null
          id: string
          link?: string | null
          message?: string | null
          notify_date?: string | null
          read?: boolean | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dispute_id?: string | null
          id?: string
          link?: string | null
          message?: string | null
          notify_date?: string | null
          read?: boolean | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          postal_code: string | null
          state: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          postal_code?: string | null
          state?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          postal_code?: string | null
          state?: string | null
        }
        Relationships: []
      }
      tradelines: {
        Row: {
          acct_mask: string | null
          balance: number | null
          credit_limit: number | null
          creditor: string | null
          id: string
          last_reported: string | null
          late_30: number | null
          late_60: number | null
          late_90: number | null
          opened_date: string | null
          report_id: string
          status: string | null
          type: string | null
        }
        Insert: {
          acct_mask?: string | null
          balance?: number | null
          credit_limit?: number | null
          creditor?: string | null
          id: string
          last_reported?: string | null
          late_30?: number | null
          late_60?: number | null
          late_90?: number | null
          opened_date?: string | null
          report_id: string
          status?: string | null
          type?: string | null
        }
        Update: {
          acct_mask?: string | null
          balance?: number | null
          credit_limit?: number | null
          creditor?: string | null
          id?: string
          last_reported?: string | null
          late_30?: number | null
          late_60?: number | null
          late_90?: number | null
          opened_date?: string | null
          report_id?: string
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tradelines_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "credit_reports"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      disputes_due_48h: {
        Row: {
          bureau: string | null
          created_at: string | null
          due_at: string | null
          id: string | null
          items: Json | null
          letter_pdf_path: string | null
          mailed_at: string | null
          notes: string | null
          outcome: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          bureau?: string | null
          created_at?: string | null
          due_at?: string | null
          id?: string | null
          items?: Json | null
          letter_pdf_path?: string | null
          mailed_at?: string | null
          notes?: string | null
          outcome?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          bureau?: string | null
          created_at?: string | null
          due_at?: string | null
          id?: string | null
          items?: Json | null
          letter_pdf_path?: string | null
          mailed_at?: string | null
          notes?: string | null
          outcome?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

