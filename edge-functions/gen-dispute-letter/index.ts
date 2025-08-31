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
      const profile = await supabase
        .from("profiles")
        .select("*")
        .eq("id", dispute.data.user_id)
        .single();
      if (!profile.data) {
        const error: AppError = {
          code: "DISPUTE_NOT_FOUND",
          message: "Profile not found",
        };
        return {
          response: new Response(JSON.stringify({ ok: false, error }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }),
        };
      }

      await supabase.from("audit_access").insert({
        id: crypto.randomUUID(),
        user_id: profile.data.id,
        actor: profile.data.id,
        resource: "profiles",
        action: "read",
        details: { reason: "generate_letter" },
      });

      const bureauAddresses: Record<string, {
        name: string;
        address_line1: string;
        city: string;
        state: string;
        postal_code: string;
      }> = {
        equifax: {
          name: "Equifax Information Services LLC",
          address_line1: "P.O. Box 740256",
          city: "Atlanta",
          state: "GA",
          postal_code: "30374",
        },
        experian: {
          name: "Experian",
          address_line1: "P.O. Box 9701",
          city: "Allen",
          state: "TX",
          postal_code: "75013",
        },
        transunion: {
          name: "TransUnion LLC",
          address_line1: "P.O. Box 2000",
          city: "Chester",
          state: "PA",
          postal_code: "19016",
        },
      };

      const bureau =
        bureauAddresses[dispute.data.bureau as keyof typeof bureauAddresses];

      const pdfLib = await import("https://esm.sh/pdf-lib@1.17.1");
      const pdfDoc = await pdfLib.PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const font = await pdfDoc.embedFont(pdfLib.StandardFonts.Helvetica);
      let y = 750;

      const draw = (text: string, x: number, dy = 15) => {
        page.drawText(text, { x, y, size: 12, font });
        y -= dy;
      };

      draw(bureau.name, 50);
      draw(bureau.address_line1, 50);
      draw(`${bureau.city}, ${bureau.state} ${bureau.postal_code}`, 50, 40);
      draw(profile.data.display_name || "", 50);
      draw(profile.data.address_line1 || "", 50);
      if (profile.data.address_line2) {
        draw(profile.data.address_line2, 50);
      }
      draw(
        `${profile.data.city || ""}, ${profile.data.state || ""} ${
          profile.data.postal_code || ""
        }`,
        50,
        30,
      );
      draw("To whom it may concern,", 50, 20);

      for (const item of (dispute.data.items as Array<any>)) {
        draw(`Account ${item.tradelineId}: ${item.reason}`, 50);
      }

      draw("Sincerely,", 50, 20);
      draw(profile.data.display_name || "", 50);

      const pdfBytes = await pdfDoc.save();
      const path = `users/${profile.data.id}/disputes/${disputeId}.pdf`;
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
