import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';
import { randomUUID } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

test('user can mail a dispute', async ({ page }) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  const admin = createClient(url, service);

  const email = `user${Date.now()}@example.com`;
  const password = 'password';
  const { data: created } = await admin.auth.admin.createUser({ email, password });
  const userId = created.user!.id;

  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.goto('/reports');

  const pdf = await PDFDocument.create();
  pdf.addPage().drawText('sample');
  const bytes = await pdf.save();
  const tmp = path.join(os.tmpdir(), 'sample.pdf');
  fs.writeFileSync(tmp, bytes);

  await page.locator('input[type="file"]').setInputFiles(tmp);
  await page.getByText(/Unknown - uploaded/).first().waitFor();
  const { data: reports } = await admin
    .from('credit_reports')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  const reportId = reports![0].id;

  await admin
    .from('credit_reports')
    .update({ status: 'parsed', parsed_at: new Date().toISOString(), summary: { tradelines: 2 } })
    .eq('id', reportId);
  await admin.from('tradelines').insert([
    { id: randomUUID(), report_id: reportId, creditor: 'Mock Bank', acct_mask: '1234', type: 'credit card', balance: 500, credit_limit: 1000, status: 'open', opened_date: '2020-01-01', last_reported: '2024-01-01' },
    { id: randomUUID(), report_id: reportId, creditor: 'Mock Auto', acct_mask: '9876', type: 'auto', balance: 2000, credit_limit: null, status: 'open', opened_date: '2019-06-01', last_reported: '2024-01-01' },
  ]);

  await page.reload();
  await page.getByText(/Unknown - parsed/).first().click();
  await expect(page.locator('pre')).toContainText('"tradelines": 2');

  await page.getByRole('button', { name: 'Find dispute candidates' }).click();
  const { data: candidate } = await admin
    .from('dispute_candidates')
    .select('*')
    .eq('report_id', reportId)
    .limit(1)
    .single();

  const disputeId = randomUUID();
  await admin.from('disputes').insert({
    id: disputeId,
    user_id: userId,
    bureau: 'equifax',
    items: [{ tradelineId: candidate.tradeline_id, reason: candidate.rationale }],
    status: 'draft',
  });

  await page.goto(`/disputes/${disputeId}`);
  await page.getByRole('button', { name: 'Generate Letter' }).click();
  await page.getByRole('button', { name: 'Mark as mailed' }).click();

  const { data: updated } = await admin
    .from('disputes')
    .select('due_at')
    .eq('id', disputeId)
    .single();
  expect(updated.due_at).toBeTruthy();
});
