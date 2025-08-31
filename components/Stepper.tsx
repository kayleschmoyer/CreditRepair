"use client";

import { KeyboardEvent } from 'react';
import styles from './Stepper.module.css';

interface Props {
  steps: string[];
  active: number;
  onStepChange: (index: number) => void;
}

export default function Stepper({ steps, active, onStepChange }: Props) {
  function handleKey(index: number, e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowRight') {
      onStepChange(Math.min(steps.length - 1, index + 1));
    } else if (e.key === 'ArrowLeft') {
      onStepChange(Math.max(0, index - 1));
    }
  }

  return (
    <ol className={styles.root} role="tablist">
      {steps.map((s, i) => (
        <li key={s} className={styles.step}>
          <button
            type="button"
            role="tab"
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className={i === active ? `${styles.btn} ${styles.active}` : styles.btn}
            onClick={() => onStepChange(i)}
            onKeyDown={(e) => handleKey(i, e)}
          >
            {s}
          </button>
        </li>
      ))}
    </ol>
  );
}
