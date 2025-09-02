import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { renderLetter } from '../lib/pdf';
import { randomUUID } from 'crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(url, key);

async function main() {
  const userId = '00000000-0000-0000-0000-000000000001';
  await supabase.auth.admin.createUser({
    id: userId,
    email: 'demo@example.com',
    email_confirm: true,
  } as unknown as Parameters<typeof supabase.auth.admin.createUser>[0]);
  await supabase.from('profiles').upsert({ id: userId, email: 'demo@example.com', display_name: 'Demo User' });

  const reportId = randomUUID();

  // create and upload sample credit report pdf
  const reportDoc = await PDFDocument.create();
  const page = reportDoc.addPage([600, 750]);
  const font = await reportDoc.embedFont(StandardFonts.Helvetica);
  page.drawText('Sample Credit Report', { x: 50, y: 700, size: 24, font });
  const reportBytes = await reportDoc.save();
  await supabase.storage.from('reports').upload(`${userId}/report.pdf`, reportBytes, { contentType: 'application/pdf' });

  await supabase.from('credit_reports').insert({
    id: reportId,
    user_id: userId,
    bureau: 'equifax',
    src_path: `${userId}/report.pdf`,
    status: 'uploaded',
  });

  const tradelineIds = Array.from({ length: 6 }, () => randomUUID());
  await supabase.from('tradelines').insert(
    tradelineIds.map((id, i) => ({
      id,
      report_id: reportId,
      creditor: `Creditor ${i + 1}`,
      acct_mask: `****${1111 + i}`,
      type: 'credit card',
      balance: 100 * (i + 1),
      credit_limit: 1000,
      status: 'open',
      opened_date: '2023-01-01',
      last_reported: '2023-06-01',
    }))
  );

  const candidateIds = [randomUUID(), randomUUID()];
  await supabase.from('dispute_candidates').insert([
    {
      id: candidateIds[0],
      user_id: userId,
      report_id: reportId,
      tradeline_id: tradelineIds[0],
      kind: 'balance',
      rationale: 'Incorrect balance',
      confidence: 0.9,
    },
    {
      id: candidateIds[1],
      user_id: userId,
      report_id: reportId,
      tradeline_id: tradelineIds[1],
      kind: 'ownership',
      rationale: 'Not mine',
      confidence: 0.85,
    },
  ]);

  const disputeId = randomUUID();
  const disputeItems = [
    { tradelineId: tradelineIds[0], reason: 'Incorrect balance' },
    { tradelineId: tradelineIds[1], reason: 'Not mine' },
  ];

  const letterBuffer = await renderLetter('equifax', {
    consumer: {
      name: 'Demo User',
      address1: '123 Main St',
      address2: 'Town, ST 12345',
    },
    items: [
      { account: '****1111', reason: 'Incorrect balance' },
      { account: '****1112', reason: 'Not mine' },
    ],
    exhibits: [],
    detailUrl: 'https://example.com/disputes/1',
  });

  await supabase.storage.from('letters').upload(`${userId}/dispute.pdf`, letterBuffer, {
    contentType: 'application/pdf',
  });

  await supabase.from('disputes').insert({
    id: disputeId,
    user_id: userId,
    bureau: 'equifax',
    items: disputeItems,
    letter_pdf_path: `${userId}/dispute.pdf`,
    status: 'draft',
  });
}

main()
  .then(() => {
    console.log("✅ Seeding finished successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });

