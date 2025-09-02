'use client';
import { useEffect, useState } from 'react';
import styles from './CreditScoreGauge.module.css';

interface Props {
  currentScore: number;
  simulatedScore: number;
  isAnimating?: boolean;
}

export default function CreditScoreGauge({ currentScore, simulatedScore, isAnimating }: Props) {
  const [displayScore, setDisplayScore] = useState(currentScore);
  const [animatedScore, setAnimatedScore] = useState(currentScore);

  useEffect(() => {
    if (isAnimating) {
      const duration = 1500;
      const steps = 60;
      const increment = (simulatedScore - currentScore) / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const newScore = Math.round(currentScore + (increment * step));
        setAnimatedScore(newScore);
        
        if (step >= steps) {
          clearInterval(timer);
          setDisplayScore(simulatedScore);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayScore(simulatedScore);
      setAnimatedScore(simulatedScore);
    }
  }, [currentScore, simulatedScore, isAnimating]);

  const scorePercentage = (animatedScore - 300) / (850 - 300);
  const rotation = scorePercentage * 180 - 90;
  const delta = simulatedScore - currentScore;

  const getScoreColor = (score: number) => {
    if (score >= 740) return 'var(--accent-mint)';
    if (score >= 670) return 'var(--accent-blue)';
    if (score >= 580) return 'var(--accent-orange)';
    return '#ff453a';
  };

  return (
    <div className={styles.container}>
      <div className={styles.gauge}>
        <svg className={styles.gaugeSvg} viewBox="0 0 200 120">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff453a" />
              <stop offset="25%" stopColor="var(--accent-orange)" />
              <stop offset="50%" stopColor="var(--accent-blue)" />
              <stop offset="100%" stopColor="var(--accent-mint)" />
            </linearGradient>
          </defs>
          
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${scorePercentage * 251.3} 251.3`}
            className={styles.progressArc}
          />
          
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke={getScoreColor(animatedScore)}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 100)`}
            className={styles.needle}
          />
          
          <circle
            cx="100"
            cy="100"
            r="6"
            fill={getScoreColor(animatedScore)}
            className={styles.needleCenter}
          />
        </svg>
        
        <div className={styles.scoreDisplay}>
          <div className={styles.score} style={{ color: getScoreColor(animatedScore) }}>
            {animatedScore}
          </div>
          <div className={styles.scoreLabel}>Credit Score</div>
        </div>
      </div>
      
      {delta !== 0 && (
        <div className={styles.delta}>
          <span className={`${styles.deltaValue} ${delta > 0 ? styles.positive : styles.negative}`}>
            {delta > 0 ? '+' : ''}{delta} points
          </span>
        </div>
      )}
    </div>
  );
}