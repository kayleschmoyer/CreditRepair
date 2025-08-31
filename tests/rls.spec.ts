import { createClient } from '@supabase/supabase-js';
import { test, expect } from 'vitest';

const url = process.env.SUPABASE_URL as string;
const anon = process.env.SUPABASE_ANON_KEY as string;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// These tests require a running Supabase instance with the database schema applied.

async function setupUsers() {
  const admin = createClient(url, service);
  const { data: u1 } = await admin.auth.admin.createUser({ email: 'user1@example.com', password: 'password' });
  const { data: u2 } = await admin.auth.admin.createUser({ email: 'user2@example.com', password: 'password' });
  await admin.from('profiles').insert([
    { id: u1.user!.id, email: 'user1@example.com' },
    { id: u2.user!.id, email: 'user2@example.com' },
  ]);
  return { u1: u1.user!, u2: u2.user! };
}

test('users cannot read other profiles', async () => {
  const { u1, u2 } = await setupUsers();
  const c1 = createClient(url, anon);
  await c1.auth.signInWithPassword({ email: 'user1@example.com', password: 'password' });
  const { data } = await c1.from('profiles').select('*').eq('id', u2.id);
  expect(data).toHaveLength(0);
});

test('users cannot insert reports for others', async () => {
  const { u1, u2 } = await setupUsers();
  const c1 = createClient(url, anon);
  await c1.auth.signInWithPassword({ email: 'user1@example.com', password: 'password' });
  const { error } = await c1
    .from('credit_reports')
    .insert({ id: crypto.randomUUID(), user_id: u2.id, bureau: 'equifax', src_path: `users/${u2.id}/report.pdf` });
  expect(error).toBeTruthy();
});
