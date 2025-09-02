import { createServerClient } from '../../../lib/supabase/server';
import SimulatorClient from './SimulatorClient';

interface Tradeline {
  id: string;
  creditor: string;
  acct_mask: string;
  balance: number;
  credit_limit: number;
  type: string;
}

export default async function SimulatePage() {
  const supabase = createServerClient();
  
  // Get user's tradelines from latest credit report
  const { data: reports } = await supabase
    .from('credit_reports')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1);

  let tradelines: Tradeline[] = [];
  if (reports && reports.length > 0) {
    const { data } = await supabase
      .from('tradelines')
      .select('*')
      .eq('report_id', reports[0].id)
      .eq('type', 'credit card')
      .limit(6);
    tradelines = data || [];
  }

  // Mock data if no tradelines found
  if (tradelines.length === 0) {
    tradelines = [
      { id: '1', creditor: 'Chase Sapphire', acct_mask: '****4532', balance: 2500, credit_limit: 10000, type: 'credit card' },
      { id: '2', creditor: 'American Express', acct_mask: '****8901', balance: 1200, credit_limit: 5000, type: 'credit card' },
      { id: '3', creditor: 'Capital One', acct_mask: '****2345', balance: 800, credit_limit: 3000, type: 'credit card' },
      { id: '4', creditor: 'Discover Card', acct_mask: '****6789', balance: 0, credit_limit: 2500, type: 'credit card' },
    ];
  }

  const currentScore = 720;

  return (
    <SimulatorClient 
      tradelines={tradelines}
      currentScore={currentScore}
    />
  );
}
