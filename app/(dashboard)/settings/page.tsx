import { createServerClient } from '../../../lib/supabase/server';
import { profileSchema } from '../../../lib/validation';
import { revalidatePath } from 'next/cache';
import { logAccess } from '../../../lib/supabase/access-log';
import FormWithToast from '../../../components/FormWithToast';
import type { AppError } from '../../../lib/utils/errors';
import { createMailer } from '../../../lib/mail';

export default async function SettingsPage() {
  const supabase = createServerClient();
  const { data: profile } = await supabase.from('profiles').select('*').single();
  if (profile) {
    await logAccess(supabase, profile.id, 'profiles');
  }

  async function updateProfile(formData: FormData): Promise<{ error?: AppError }> {
    'use server';
    const values = Object.fromEntries(formData.entries());
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      return { error: { code: 'INVALID_INPUT', message: parsed.error.message } };
    }
    const { error } = await supabase.from('profiles').update(parsed.data).eq('id', profile?.id);
    if (error) {
      return { error: { code: 'SERVER_ERROR', message: error.message } };
    }
    revalidatePath('/settings');
    return {};
  }

  async function deleteMyData(): Promise<{ error?: AppError }> {
    'use server';
    const run = async (fn: () => Promise<unknown>) => {
      for (let i = 0; i < 3; i++) {
        try {
          await fn();
          return;
        } catch (e) {
          if (i === 2) throw e;
        }
      }
    };
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { error: { code: 'UNAUTHORIZED', message: 'Not signed in' } };
      }
      const mailer = createMailer();
      await run(() =>
        supabase
          .from('audit_access')
          .insert({ id: crypto.randomUUID(), user_id: user.id, actor: user.id, resource: 'all', action: 'delete' })
      );
      await run(() => supabase.storage.from('reports').remove([`users/${user.id}`]));
      await run(() => supabase.storage.from('letters').remove([`users/${user.id}`]));
      await run(() => supabase.from('notifications').delete().eq('user_id', user.id));
      await run(() => supabase.from('dispute_candidates').delete().eq('user_id', user.id));
      await run(() => supabase.from('disputes').delete().eq('user_id', user.id));
      await run(() => supabase.from('credit_reports').delete().eq('user_id', user.id));
      await run(() => supabase.from('audit_access').delete().eq('user_id', user.id));
      await run(() => supabase.from('consents').delete().eq('user_id', user.id));
      await run(() => supabase.from('profiles').delete().eq('id', user.id));
      if (user.email) {
        await mailer.send({
          to: user.email,
          subject: 'Your data has been deleted',
          html: 'All of your data has been removed from CreditCraft.',
        });
      }
      return {};
    } catch (e) {
      return {
        error: {
          code: 'SERVER_ERROR',
          message: e instanceof Error ? e.message : 'Failed to delete data',
        },
      };
    }
  }

  return (
    <div>
      <h1>Profile</h1>
      <FormWithToast action={updateProfile}>
        <label>Name <input name="display_name" defaultValue={profile?.display_name || ''} /></label><br />
        <label>Address <input name="address_line1" defaultValue={profile?.address_line1 || ''} /></label><br />
        <label>City <input name="city" defaultValue={profile?.city || ''} /></label><br />
        <label>State <input name="state" defaultValue={profile?.state || ''} /></label><br />
        <label>Postal <input name="postal_code" defaultValue={profile?.postal_code || ''} /></label><br />
        <button type="submit">Save</button>
      </FormWithToast>
      <p><a href="/api/export-my-data">Export My Data</a></p>
      <FormWithToast action={deleteMyData}>
        <button type="submit" style={{ marginTop: 20, color: 'red' }}>Delete My Data</button>
      </FormWithToast>
    </div>
  );
}
