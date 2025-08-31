import styles from './EmptyState.module.css';

export default function EmptyState({ message }: { message: string }) {
  return <div className={styles.root}>{message}</div>;
}
