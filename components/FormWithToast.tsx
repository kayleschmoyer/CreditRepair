'use client';
import { useEffect } from 'react';
import { useFormState } from 'react-dom/experimental';
import { AppError, toToast } from '../lib/utils/errors';
import { ReactNode } from 'react';
import { useToast } from './ToastProvider';
import { useConfirm } from './ConfirmProvider';

interface FormState {
  error?: AppError | null;
}

interface Props {
  action: (formData: FormData) => Promise<FormState>;
  children: ReactNode;
  confirmMessage?: string;
}

export default function FormWithToast({ action, children, confirmMessage }: Props) {
  const [state, formAction] = useFormState(action, { error: null });
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (state.error) {
      toast(toToast(state.error));
    }
  }, [state.error, toast]);

  async function handleAction(formData: FormData) {
    if (confirmMessage) {
      const ok = await confirm(confirmMessage);
      if (!ok) return;
    }
    return formAction(formData);
  }

  return <form action={handleAction}>{children}</form>;
}
