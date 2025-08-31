import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";
import type { AppError } from "../../lib/utils/errors.ts";
import { withEdgeLogging } from "../../lib/logs.ts";

const schema = z.object({ reportId: z.string().uuid() });

serve(
  withEdgeLogging("ai-suggest-disputes", async (req) => {
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
      return {
        response: new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: "INVALID_INPUT",
              message: parsed.error.message,
            } as AppError,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      };
    }
    const { reportId } = parsed.data;
    let userId: string | null = null;
    try {
      const report = await supabase
        .from("credit_reports")
        .select("user_id")
        .eq("id", reportId)
        .single();
      if (!report.data) {
        const error: AppError = {
          code: "REPORT_NOT_FOUND",
          message: "Report not found",
        };
        return {
          response: new Response(JSON.stringify({ ok: false, error }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }),
        };
      }
      userId = report.data.user_id;
      const { data: existing } = await supabase
        .from("dispute_candidates")
        .select("*")
        .eq("report_id", reportId);
      if (existing && existing.length > 0) {
        return {
          response: new Response(
            JSON.stringify({ ok: true, suggestions: existing }),
            { headers: { "Content-Type": "application/json" } },
          ),
          userId,
        };
      }
      const suggestions = [
        {
          id: crypto.randomUUID(),
          user_id: report.data.user_id,
          report_id: reportId,
          tradeline_id: null,
          kind: "late_payment_error",
          rationale: "Reported 30 days late but paid on time",
          confidence: 0.8,
        },
        {
          id: crypto.randomUUID(),
          user_id: report.data.user_id,
          report_id: reportId,
          tradeline_id: null,
          kind: "not_mine",
          rationale: "Account not recognized",
          confidence: 0.6,
        },
      ];
      for (const s of suggestions) {
        await supabase.from("dispute_candidates").insert(s);
      }
      return {
        response: new Response(JSON.stringify({ ok: true, suggestions }), {
          headers: { "Content-Type": "application/json" },
        }),
        userId,
      };
    } catch (e) {
      const error: AppError = {
        code: "SUGGEST_FAILED",
        message:
          e instanceof Error ? e.message : "Failed to generate suggestions",
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
