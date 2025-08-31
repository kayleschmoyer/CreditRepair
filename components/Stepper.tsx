import styles from './Stepper.module.css';

interface Props {
  steps: string[];
  active: number;
}

export default function Stepper({ steps, active }: Props) {
  return (
    <ol className={styles.stepper}>
      {steps.map((s, i) => (
        <li key={s} className={i === active ? styles.active : ''}>{s}</li>
      ))}
    </ol>
  );
}
