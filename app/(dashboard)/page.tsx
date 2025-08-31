import { createServerClient } from '../../lib/supabase/server';

export default async function Dashboard() {
  const supabase = createServerClient();
  const { data: disputes } = await supabase.from('disputes').select('id').eq('status', 'sent');
  const { data: notifications } = await supabase.from('notifications').select('id').eq('read', false);
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Active Disputes: {disputes?.length || 0}</p>
      <p>Notifications: {notifications?.length || 0}</p>
    </div>
  );
}
