'use client';
import { useState } from 'react';
import styles from './TradelineCard.module.css';

interface Tradeline {
  id: string;
  creditor: string;
  acct_mask: string;
  balance: number;
  credit_limit: number;
  type: string;
}

interface Props {
  tradeline: Tradeline;
  onBalanceChange: (id: string, newBalance: number) => void;
}

export default function TradelineCard({ tradeline, onBalanceChange }: Props) {
  const [balance, setBalance] = useState(tradeline.balance);
  const utilization = Math.round((balance / tradeline.credit_limit) * 100);
  
  const handleBalanceChange = (newBalance: number) => {
    const clampedBalance = Math.max(0, Math.min(newBalance, tradeline.credit_limit));
    setBalance(clampedBalance);
    onBalanceChange(tradeline.id, clampedBalance);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseInt(e.target.value);
    const newBalance = Math.round((percentage / 100) * tradeline.credit_limit);
    handleBalanceChange(newBalance);
  };

  const getUtilizationColor = (util: number) => {
    if (util <= 10) return 'var(--accent-mint)';
    if (util <= 30) return 'var(--accent-blue)';
    if (util <= 70) return 'var(--accent-orange)';
    return '#ff453a';
  };

  const quickActions = [
    { label: 'Pay Off', action: () => handleBalanceChange(0) },
    { label: 'Pay Half', action: () => handleBalanceChange(balance / 2) },
    { label: '10% Util', action: () => handleBalanceChange(tradeline.credit_limit * 0.1) },
    { label: '30% Util', action: () => handleBalanceChange(tradeline.credit_limit * 0.3) },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.creditorInfo}>
          <h3 className={styles.creditor}>{tradeline.creditor}</h3>
          <p className={styles.account}>{tradeline.acct_mask}</p>
        </div>
        <div className={styles.cardIcon}>💳</div>
      </div>

      <div className={styles.balanceSection}>
        <div className={styles.balanceDisplay}>
          <span className={styles.balanceLabel}>Balance</span>
          <span className={styles.balanceValue}>
            ${balance.toLocaleString()}
          </span>
        </div>
        <div className={styles.limitDisplay}>
          <span className={styles.limitLabel}>Limit</span>
          <span className={styles.limitValue}>
            ${tradeline.credit_limit.toLocaleString()}
          </span>
        </div>
      </div>

      <div className={styles.utilizationSection}>
        <div className={styles.utilizationHeader}>
          <span className={styles.utilizationLabel}>Utilization</span>
          <span 
            className={styles.utilizationValue}
            style={{ color: getUtilizationColor(utilization) }}
          >
            {utilization}%
          </span>
        </div>
        
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="0"
            max="100"
            value={utilization}
            onChange={handleSliderChange}
            className={styles.slider}
            style={{
              background: `linear-gradient(to right, ${getUtilizationColor(utilization)} 0%, ${getUtilizationColor(utilization)} ${utilization}%, var(--border) ${utilization}%, var(--border) 100%)`
            }}
          />
        </div>
      </div>

      <div className={styles.balanceInput}>
        <input
          type="number"
          value={balance}
          onChange={(e) => handleBalanceChange(Number(e.target.value))}
          className={styles.input}
          min="0"
          max={tradeline.credit_limit}
        />
      </div>

      <div className={styles.quickActions}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={styles.quickAction}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}