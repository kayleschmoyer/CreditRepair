'use client';
import { createContext, useContext, ReactNode, useState } from 'react';
import Toast from './Toast';
import styles from './Toast.module.css';

interface ToastItem { id: number; message: string; duration: number; }
type ToastFn = (message: string, duration?: number) => void;

const ToastContext = createContext<ToastFn | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push: ToastFn = (message, duration = 3000) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, duration }]);
    setTimeout(() => setToasts(t => t.filter(toast => toast.id !== id)), duration);
  };

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className={styles.container} aria-live="polite">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} duration={t.duration} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
