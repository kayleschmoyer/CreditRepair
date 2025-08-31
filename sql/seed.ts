import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(url, key);

async function main() {
  const user = '00000000-0000-0000-0000-000000000001';
  await supabase.auth.admin.createUser({
    user, email: 'demo@example.com', email_confirm: true
  });
  await supabase.from('profiles').upsert({ id: user, email: 'demo@example.com', display_name: 'Demo User' });
}

main();
