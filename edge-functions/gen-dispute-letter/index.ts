import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";

const schema = z.object({ disputeId: z.string() });

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error }), { status: 400 });
  const { disputeId } = parsed.data;
  const dispute = await supabase.from('disputes').select('*').eq('id', disputeId).single();
  const user = await supabase.from('profiles').select('*').eq('id', dispute.data!.user_id).single();
  const template = await (await fetch(new URL(`../../templates/${dispute.data!.bureau}.txt`, import.meta.url))).text();
  let content = template.replace('{{CONSUMER_NAME}}', user.data!.display_name || '')
    .replace('{{ADDRESS}}', `${user.data!.address_line1 || ''} ${user.data!.address_line2 || ''}`)
    .replace('{{CITY_STATE_ZIP}}', `${user.data!.city || ''}, ${user.data!.state || ''} ${user.data!.postal_code || ''}`)
    .replace('{{REPORT_PERIOD}}', '');
  // simple items join
  content = content.replace('{{ITEMS_TABLE}}', JSON.stringify(dispute.data!.items));
  const pdfBytes = new TextEncoder().encode(content);
  const path = `users/${user.data!.id}/disputes/${disputeId}.pdf`;
  await supabase.storage.from('letters').upload(path, pdfBytes, { contentType: 'application/pdf' });
  await supabase.from('disputes').update({ letter_pdf_path: path }).eq('id', disputeId);
  return new Response(JSON.stringify({ ok: true, path }), { headers: { 'Content-Type': 'application/json' } });
});
