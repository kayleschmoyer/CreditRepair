import { createServerClient } from '../../../../lib/supabase/server';
import { createMailingProvider, Address } from '../../../../lib/mailing';
import { getSignedUrl } from '../../../../lib/supabase/storage';
import { logAccess } from '../../../../lib/supabase/access-log';
import FormWithToast from '../../../../components/FormWithToast';
import type { AppError } from '../../../../lib/utils/errors';
import Disclaimer from '../../../../components/Disclaimer';

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
      letterUrl = (await getSignedUrl('letters', dispute.user_id, dispute.letter_pdf_path)) ?? null;
    }
  }

  async function genLetter(): Promise<{ error?: AppError }> {
    'use server';
    try {
      if (dispute?.letter_pdf_path) {
        return {};
      }
      const { data, error } = await supabase.functions.invoke('gen-dispute-letter', {
        body: { disputeId: params.id },
      });
      if (error) {
        return { error: { code: 'GEN_LETTER_FAILED', message: error.message } };
      }
      if (process.env.LOB_API_KEY && data?.path) {
        const provider = createMailingProvider();
        const { data: disputeRecord } = await supabase.from('disputes').select('*').eq('id', params.id).single();
        if (disputeRecord) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', disputeRecord.user_id).single();
          if (profile) {
            await logAccess(supabase, profile.id, 'profiles', { reason: 'generate_letter' });
          }
          const signedUrl = await getSignedUrl('letters', disputeRecord.user_id, data.path, 300);
          const to = bureauAddresses[disputeRecord.bureau as keyof typeof bureauAddresses];
          const from: Address = {
            name: profile?.display_name || '',
            address_line1: profile?.address_line1 || '',
            address_line2: profile?.address_line2 || undefined,
            city: profile?.city || '',
            state: profile?.state || '',
            postal_code: profile?.postal_code || '',
          };
          if (!signedUrl) {
            throw new Error('Unable to generate letter URL');
          }
          await provider.createLetter(to, from, signedUrl);
          const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          await supabase
            .from('disputes')
            .update({ status: 'sent', mailed_at: new Date().toISOString(), due_at: due })
            .eq('id', params.id);
        }
      }
      return {};
    } catch (e) {
      return {
        error: {
          code: 'GEN_LETTER_FAILED',
          message: e instanceof Error ? e.message : 'Failed to generate letter',
        },
      };
    }
  }

  async function markMailed(): Promise<{ error?: AppError }> {
    'use server';
    try {
      const { data: existing } = await supabase
        .from('disputes')
        .select('status')
        .eq('id', params.id)
        .single();
      if (existing?.status === 'sent') {
        return {};
      }
      const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from('disputes')
        .update({ status: 'sent', mailed_at: new Date().toISOString(), due_at: due })
        .eq('id', params.id);
      return {};
    } catch (e) {
      return {
        error: {
          code: 'SERVER_ERROR',
          message: e instanceof Error ? e.message : 'Failed to update dispute',
        },
      };
    }
  }

  return (
    <div>
      <h1>Dispute {params.id}</h1>
      <pre>{JSON.stringify(dispute, null, 2)}</pre>
      <FormWithToast action={genLetter}>
        <button type="submit">Generate Letter</button>
      </FormWithToast>
      <FormWithToast action={markMailed} confirmMessage="Mark as mailed?">
        <button type="submit">Mark as mailed</button>
      </FormWithToast>
      {letterUrl && <a href={letterUrl}>Download Letter</a>}
      <Disclaimer />
    </div>
  );
}
