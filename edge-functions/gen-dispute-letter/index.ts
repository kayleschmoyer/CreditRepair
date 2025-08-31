import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";
import type { AppError } from "../../lib/utils/errors.ts";
import { withEdgeLogging } from "../../lib/logs.ts";

const schema = z.object({ disputeId: z.string().uuid() });

serve(
  withEdgeLogging("gen-dispute-letter", async (req) => {
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
    if (!parsed.success)
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
    const { disputeId } = parsed.data;
    let userId: string | null = null;
    try {
      const dispute = await supabase
        .from("disputes")
        .select("*")
        .eq("id", disputeId)
        .single();
      if (!dispute.data) {
        const error: AppError = {
          code: "DISPUTE_NOT_FOUND",
          message: "Dispute not found",
        };
        return {
          response: new Response(JSON.stringify({ ok: false, error }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }),
        };
      }
      userId = dispute.data.user_id;
      const user = await supabase
        .from("profiles")
        .select("*")
        .eq("id", dispute.data.user_id)
        .single();
      const template = await (
        await fetch(
          new URL(
            `../../templates/${dispute.data.bureau}.txt`,
            import.meta.url,
          ),
        )
      ).text();
      let content = template
        .replace("{{CONSUMER_NAME}}", user.data!.display_name || "")
        .replace(
          "{{ADDRESS}}",
          `${user.data!.address_line1 || ""} ${user.data!.address_line2 || ""}`,
        )
        .replace(
          "{{CITY_STATE_ZIP}}",
          `${user.data!.city || ""}, ${user.data!.state || ""} ${user.data!.postal_code || ""}`,
        )
        .replace("{{REPORT_PERIOD}}", "");
      // simple items join
      content = content.replace(
        "{{ITEMS_TABLE}}",
        JSON.stringify(dispute.data.items),
      );
      const pdfBytes = new TextEncoder().encode(content);
      const path = `users/${user.data!.id}/disputes/${disputeId}.pdf`;
      await supabase.storage
        .from("letters")
        .upload(path, pdfBytes, { contentType: "application/pdf" });
      await supabase
        .from("disputes")
        .update({ letter_pdf_path: path })
        .eq("id", disputeId);
      return {
        response: new Response(JSON.stringify({ ok: true, path }), {
          headers: { "Content-Type": "application/json" },
        }),
        userId,
      };
    } catch (e) {
      const error: AppError = {
        code: "GEN_LETTER_FAILED",
        message: e instanceof Error ? e.message : "Failed to generate letter",
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
