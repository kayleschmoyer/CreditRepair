'use client';
import { useState } from 'react';
import CreditScoreGauge from '../../../components/CreditScoreGauge';
import TradelineCard from '../../../components/TradelineCard';
import styles from './simulate.module.css';

interface Tradeline {
  id: string;
  creditor: string;
  acct_mask: string;
  balance: number;
  credit_limit: number;
  type: string;
}

interface Props {
  tradelines: Tradeline[];
  currentScore: number;
}

export default function SimulatorClient({ tradelines: initialTradelines, currentScore }: Props) {
  const [tradelines, setTradelines] = useState(initialTradelines);
  const [simulatedScore, setSimulatedScore] = useState(currentScore);
  const [isAnimating, setIsAnimating] = useState(false);

  const calculateSimulatedScore = (updatedTradelines: Tradeline[]) => {
    const totalUtilization = updatedTradelines.reduce((sum, t) => {
      return sum + (t.balance / t.credit_limit);
    }, 0) / updatedTradelines.length;

    let scoreDelta = 0;
    if (totalUtilization <= 0.1) scoreDelta = 40;
    else if (totalUtilization <= 0.3) scoreDelta = 20;
    else if (totalUtilization <= 0.5) scoreDelta = 0;
    else if (totalUtilization <= 0.7) scoreDelta = -20;
    else scoreDelta = -50;

    return Math.max(300, Math.min(850, currentScore + scoreDelta));
  };

  const handleBalanceChange = (id: string, newBalance: number) => {
    const updatedTradelines = tradelines.map(t => 
      t.id === id ? { ...t, balance: newBalance } : t
    );
    setTradelines(updatedTradelines);
    
    const newScore = calculateSimulatedScore(updatedTradelines);
    setSimulatedScore(newScore);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1500);
  };

  const handleGlobalAction = (action: string) => {
    let updatedTradelines = [...tradelines];
    
    switch (action) {
      case 'payAll':
        updatedTradelines = tradelines.map(t => ({ ...t, balance: 0 }));
        break;
      case 'payHalf':
        updatedTradelines = tradelines.map(t => ({ ...t, balance: t.balance / 2 }));
        break;
      case 'tenPercent':
        updatedTradelines = tradelines.map(t => ({ ...t, balance: t.credit_limit * 0.1 }));
        break;
      case 'thirtyPercent':
        updatedTradelines = tradelines.map(t => ({ ...t, balance: t.credit_limit * 0.3 }));
        break;
    }
    
    setTradelines(updatedTradelines);
    const newScore = calculateSimulatedScore(updatedTradelines);
    setSimulatedScore(newScore);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Credit Score Simulator</h1>
          <p className={styles.heroSubtitle}>See how balance changes impact your credit score</p>
        </div>

        <div className={styles.gaugeSection}>
          <CreditScoreGauge 
            currentScore={currentScore}
            simulatedScore={simulatedScore}
            isAnimating={isAnimating}
          />
        </div>

        <div className={styles.globalActions}>
          <h2 className={styles.sectionTitle}>Quick Scenarios</h2>
          <div className={styles.actionGrid}>
            <button onClick={() => handleGlobalAction('payAll')} className={styles.actionButton}>
              💳 Pay All Balances
            </button>
            <button onClick={() => handleGlobalAction('payHalf')} className={styles.actionButton}>
              📉 Pay 50% on All Cards
            </button>
            <button onClick={() => handleGlobalAction('tenPercent')} className={styles.actionButton}>
              🎯 Set All to 10% Utilization
            </button>
            <button onClick={() => handleGlobalAction('thirtyPercent')} className={styles.actionButton}>
              ⚖️ Set All to 30% Utilization
            </button>
          </div>
        </div>

        <div className={styles.tradelinesSection}>
          <h2 className={styles.sectionTitle}>Your Credit Cards</h2>
          <div className={styles.tradelinesGrid}>
            {tradelines.map(tradeline => (
              <TradelineCard
                key={tradeline.id}
                tradeline={tradeline}
                onBalanceChange={handleBalanceChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}