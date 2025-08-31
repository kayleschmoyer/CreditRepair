'use client';
import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

interface Props { message: string; duration?: number; }

export default function Toast({ message, duration = 3000 }: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(id);
  }, [duration]);
  if (!visible) return null;
  return <div className={styles.toast}>{message}</div>;
}
