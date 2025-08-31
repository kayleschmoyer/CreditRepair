export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          created_at: string;
        };
      };
      credit_reports: {
        Row: {
          id: string;
          user_id: string;
          bureau: string | null;
          src_path: string;
          period_start: string | null;
          period_end: string | null;
          status: string;
          parsed_at: string | null;
          summary: Json | null;
          created_at: string;
        };
      };
      tradelines: {
        Row: {
          id: string;
          report_id: string;
          creditor: string | null;
          acct_mask: string | null;
          type: string | null;
          balance: number | null;
          credit_limit: number | null;
          status: string | null;
          opened_date: string | null;
          last_reported: string | null;
          late_30: number | null;
          late_60: number | null;
          late_90: number | null;
        };
      };
      dispute_candidates: {
        Row: {
          id: string;
          user_id: string;
          report_id: string;
          tradeline_id: string | null;
          kind: string | null;
          rationale: string | null;
          confidence: number | null;
          created_at: string;
        };
      };
      disputes: {
        Row: {
          id: string;
          user_id: string;
          bureau: string;
          items: Json;
          letter_pdf_path: string | null;
          status: string;
          mailed_at: string | null;
          due_at: string | null;
          outcome: string | null;
          notes: string | null;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string | null;
          message: string | null;
          link: string | null;
          read: boolean | null;
          created_at: string;
        };
      };
      audit_access: {
        Row: {
          id: string;
          user_id: string;
          actor: string | null;
          resource: string | null;
          action: string | null;
          details: Json | null;
          created_at: string;
        };
      };
    };
  };
}
