import { ReactNode } from 'react';
import styles from './Table.module.css';

export default function Table({ children }: { children: ReactNode }) {
  return <table className={styles.root}>{children}</table>;
}
