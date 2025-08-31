import { createServerClient } from '../../lib/supabase/server';
import FormWithToast from '../../components/FormWithToast';
import { redirect } from 'next/navigation';

export default async function ConsentPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/sign-in');
  }
  const { data } = await supabase.from('consents').select('*').eq('user_id', user.id).maybeSingle();
  if (data) {
    redirect('/');
  }
  async function recordConsent(): Promise<void> {
    'use server';
    await supabase.from('consents').insert({ user_id: user!.id }).onConflict('user_id');
    redirect('/');
  }
  return (
    <div style={{ padding: 20 }}>
      <h1>Consent Required</h1>
      <p>Please consent to our terms to continue using the service.</p>
      <FormWithToast action={recordConsent}>
        <button type="submit">I Consent</button>
      </FormWithToast>
    </div>
  );
}
