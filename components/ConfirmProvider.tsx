'use client';
import { createContext, ReactNode, useContext, useState } from 'react';
import Modal from './Modal';
import styles from './Confirm.module.css';

interface ConfirmState {
  message: string;
  resolve: (v: boolean) => void;
}

const ConfirmContext = createContext<((message: string) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  function confirm(message: string) {
    return new Promise<boolean>((resolve) => {
      setState({ message, resolve });
    });
  }

  function handleClose(result: boolean) {
    state?.resolve(result);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <Modal open onClose={() => handleClose(false)}>
          <div className={styles.content}>
            <p>{state.message}</p>
            <div className={styles.actions}>
              <button type="button" onClick={() => handleClose(false)}>Cancel</button>
              <button type="button" onClick={() => handleClose(true)}>Confirm</button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
