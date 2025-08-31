import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '../../lib/supabase/server';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect('/sign-in');
  }
  const { data: consent } = await supabase.from('consents').select('user_id').eq('user_id', session.user.id).maybeSingle();
  if (!consent) {
    redirect('/consent');
  }
  return (
    <div style={{ padding: 20 }}>
      <nav><a href="/">Dashboard</a> | <a href="/reports">Reports</a> | <a href="/disputes">Disputes</a> | <a href="/simulate">Simulate</a> | <a href="/settings">Settings</a></nav>
      <hr />
      {children}
    </div>
  );
}
