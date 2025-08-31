'use client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '../../../lib/supabase/client';

export default function SignInPage() {
  const supabase = createClient();
  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} />
    </div>
  );
}
