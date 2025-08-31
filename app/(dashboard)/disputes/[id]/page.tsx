import { createServerClient } from '../../../../lib/supabase/server';
import { createMailingProvider, Address } from '../../../../lib/mailing';
import { getSignedUrl } from '../../../../lib/supabase/storage';
import { logAccess } from '../../../../lib/supabase/access-log';

const bureauAddresses: Record<string, Address> = {
  equifax: {
    name: 'Equifax Information Services LLC',
    address_line1: 'P.O. Box 740256',
    city: 'Atlanta',
    state: 'GA',
    postal_code: '30374',
  },
  experian: {
    name: 'Experian',
    address_line1: 'P.O. Box 9701',
    city: 'Allen',
    state: 'TX',
    postal_code: '75013',
  },
  transunion: {
    name: 'TransUnion LLC',
    address_line1: 'P.O. Box 2000',
    city: 'Chester',
    state: 'PA',
    postal_code: '19016',
  },
};

export default async function DisputeDetail({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: dispute } = await supabase.from('disputes').select('*').eq('id', params.id).single();
  let letterUrl: string | null = null;
  if (dispute) {
    await logAccess(supabase, dispute.user_id, 'disputes', { id: params.id });
    if (dispute.letter_pdf_path) {
      letterUrl = await getSignedUrl('letters', dispute.user_id, dispute.letter_pdf_path);
    }
  }

  async function genLetter() {
    'use server';
    const { data } = await supabase.functions.invoke('gen-dispute-letter', { body: { disputeId: params.id } });
    if (process.env.LOB_API_KEY && data?.path) {
      const provider = createMailingProvider();
      const { data: disputeRecord } = await supabase.from('disputes').select('*').eq('id', params.id).single();
      if (disputeRecord) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', disputeRecord.user_id).single();
        if (profile) {
          await logAccess(supabase, profile.id, 'profiles', { reason: 'generate_letter' });
        }
        const { data: url } = supabase.storage.from('letters').getPublicUrl(data.path);
        const to = bureauAddresses[disputeRecord.bureau as keyof typeof bureauAddresses];
        const from: Address = {
          name: profile?.display_name || '',
          address_line1: profile?.address_line1 || '',
          address_line2: profile?.address_line2 || undefined,
          city: profile?.city || '',
          state: profile?.state || '',
          postal_code: profile?.postal_code || '',
        };
        await provider.createLetter(to, from, url.publicUrl);
        const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from('disputes')
          .update({ status: 'sent', mailed_at: new Date().toISOString(), due_at: due })
          .eq('id', params.id);
      }
    }
  }

  async function markMailed() {
    'use server';
    const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('disputes').update({ status: 'sent', mailed_at: new Date().toISOString(), due_at: due }).eq('id', params.id);
  }

  return (
    <div>
      <h1>Dispute {params.id}</h1>
      <pre>{JSON.stringify(dispute, null, 2)}</pre>
      <form action={genLetter}><button type="submit">Generate Letter</button></form>
      <form action={markMailed}><button type="submit">Mark as mailed</button></form>
      {letterUrl && <a href={letterUrl}>Download Letter</a>}
    </div>
  );
}
