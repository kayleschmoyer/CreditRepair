'use client';
import { useFormState } from 'react-dom/experimental';
import Toast from './Toast';
import { AppError, toToast } from '../lib/utils/errors';
import { ReactNode } from 'react';

interface FormState {
  error?: AppError | null;
}

interface Props {
  action: (formData: FormData) => Promise<FormState>;
  children: ReactNode;
}

export default function FormWithToast({ action, children }: Props) {
  const [state, formAction] = useFormState(action, { error: null });
  return (
    <>
      {state.error && <Toast message={toToast(state.error)} />}
      <form action={formAction}>{children}</form>
    </>
  );
}
