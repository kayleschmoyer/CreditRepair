import styles from './Skeleton.module.css';

interface Props { lines?: number; }

export default function Skeleton({ lines = 3 }: Props) {
  return (
    <div className={styles.root}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={styles.line} />
      ))}
    </div>
  );
}
