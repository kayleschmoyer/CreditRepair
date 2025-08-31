import { createServerClient } from '../../../lib/supabase/server';
import { profileSchema } from '../../../lib/validation';
import { revalidatePath } from 'next/cache';
import { logAccess } from '../../../lib/supabase/access-log';

export default async function SettingsPage() {
  const supabase = createServerClient();
  const { data: profile } = await supabase.from('profiles').select('*').single();
  if (profile) {
    await logAccess(supabase, profile.id, 'profiles');
  }

  async function updateProfile(formData: FormData) {
    'use server';
    const values = Object.fromEntries(formData.entries());
    const parsed = profileSchema.safeParse(values);
    if (parsed.success) {
      await supabase.from('profiles').update(parsed.data).eq('id', profile?.id);
      revalidatePath('/settings');
    }
  }

  async function deleteMyData() {
    'use server';
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('audit_access').insert({ id: crypto.randomUUID(), user_id: user.id, actor: user.id, resource: 'all', action: 'delete' });
      await supabase.storage.from('reports').remove([`users/${user.id}`]);
      await supabase.storage.from('letters').remove([`users/${user.id}`]);
      await supabase.from('notifications').delete().eq('user_id', user.id);
      await supabase.from('dispute_candidates').delete().eq('user_id', user.id);
      await supabase.from('disputes').delete().eq('user_id', user.id);
      await supabase.from('credit_reports').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);
    }
  }

  return (
    <div>
      <h1>Profile</h1>
      <form action={updateProfile}>
        <label>Name <input name="display_name" defaultValue={profile?.display_name || ''} /></label><br />
        <label>Address <input name="address_line1" defaultValue={profile?.address_line1 || ''} /></label><br />
        <label>City <input name="city" defaultValue={profile?.city || ''} /></label><br />
        <label>State <input name="state" defaultValue={profile?.state || ''} /></label><br />
        <label>Postal <input name="postal_code" defaultValue={profile?.postal_code || ''} /></label><br />
        <button type="submit">Save</button>
      </form>
      <form action={deleteMyData}>
        <button type="submit" style={{ marginTop: 20, color: 'red' }}>Delete My Data</button>
      </form>
    </div>
  );
}
