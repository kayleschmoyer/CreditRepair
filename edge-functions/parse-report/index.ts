import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";
import type { AppError } from "../../lib/utils/errors.ts";
import { withEdgeLogging } from "../../lib/logs.ts";

const schema = z.object({
  reportId: z.string().uuid(),
  userId: z.string().uuid(),
  storagePath: z.string().min(1),
});

serve(
  withEdgeLogging("parse-report", async (req) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const error: AppError = {
        code: "INVALID_INPUT",
        message: "Invalid JSON",
      };
      return {
        response: new Response(JSON.stringify({ ok: false, error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const error: AppError = {
        code: "INVALID_INPUT",
        message: parsed.error.message,
      };
      return {
        response: new Response(JSON.stringify({ ok: false, error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }
    // mock parser
    const { reportId, userId } = parsed.data;
    try {
      const tradelines = [
        {
          id: crypto.randomUUID(),
          report_id: reportId,
          creditor: "Mock Bank",
          acct_mask: "1234",
          type: "credit_card",
          balance: 50000,
          credit_limit: 100000,
          status: "open",
          opened_date: "2020-01-01",
          last_reported: "2024-01-01",
          late_30: 0,
          late_60: 0,
          late_90: 0,
        },
        {
          id: crypto.randomUUID(),
          report_id: reportId,
          creditor: "Mock Auto",
          acct_mask: "9876",
          type: "auto",
          balance: 2000000,
          credit_limit: null,
          status: "open",
          opened_date: "2019-06-01",
          last_reported: "2024-01-01",
          late_30: 1,
          late_60: 0,
          late_90: 0,
        },
      ];
      await supabase
        .from("credit_reports")
        .update({
          status: "parsed",
          parsed_at: new Date().toISOString(),
          summary: { tradelines: tradelines.length },
        })
        .eq("id", reportId)
        .eq("user_id", userId);
      for (const t of tradelines) {
        await supabase.from("tradelines").insert(t);
      }
      return {
        response: new Response(JSON.stringify({ ok: true, tradelines }), {
          headers: { "Content-Type": "application/json" },
        }),
        userId,
      };
    } catch (e) {
      const error: AppError = {
        code: "PARSE_FAILED",
        message: e instanceof Error ? e.message : "Failed to parse report",
      };
      return {
        response: new Response(JSON.stringify({ ok: false, error }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
        userId,
      };
    }
  }),
);
