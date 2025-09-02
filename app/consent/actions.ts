'use server';

import { createServerClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';

interface FormState {
  error?: { code: string; message: string } | null;
}

export async function recordConsent(): Promise<FormState> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const { error } = await supabase.from('consents').upsert({ user_id: user.id });
  
  if (error) {
    return {
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to record consent'
      }
    };
  }
  
  redirect('/');
}