import { redirect } from 'next/navigation';
import { createServerClient } from '../../../../lib/supabase/server';

export default async function AdminHealthPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user.email ?? '';
  const admins = process.env.ADMIN_EMAILS?.split(',').map((s) => s.trim()) ?? [];
  if (!session || !admins.includes(email)) {
    redirect('/sign-in');
  }

  let db = false;
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    db = !error;
  } catch {
    db = false;
  }

  let storage = false;
  try {
    const { error } = await supabase.storage.getBucket('reports');
    storage = !error;
  } catch {
    storage = false;
  }

  const { data: crons } = await supabase.from('last_cron_run').select('*');

  return (
    <div>
      <h1>System Health</h1>
      <ul>
        <li>DB: {db ? 'ok' : 'error'}</li>
        <li>Storage: {storage ? 'ok' : 'error'}</li>
      </ul>
      <h2>Cron</h2>
      <ul>
        {(crons || []).map((c) => (
          <li key={c.name}>
            {c.name}: {c.ran_at ?? 'never'}
          </li>
        ))}
      </ul>
    </div>
  );
}
