import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

export async function logAccess(
  client: SupabaseClient<Database>,
  userId: string,
  resource: string,
  details?: Record<string, any>
) {
  const {
    data: { user },
  } = await client.auth.getUser();
  await client.from('audit_access').insert({
    id: crypto.randomUUID(),
    user_id: userId,
    actor: user?.id ?? null,
    resource,
    action: 'read',
    details,
  });
}
