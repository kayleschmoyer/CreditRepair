import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase/server';

export async function GET() {
  const supabase = createServerClient();
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

  return NextResponse.json({ ok: db && storage, db, storage });
}
