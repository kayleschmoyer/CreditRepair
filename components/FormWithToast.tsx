'use client';
import { useEffect, useTransition } from 'react';
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
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();

  async function handleSubmit(formData: FormData) {
    if (confirmMessage) {
      const ok = await confirm(confirmMessage);
      if (!ok) return;
    }

    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result?.error) {
          toast(toToast(result.error));
        }
      } catch (error) {
        console.error('Form submission error:', error);
        toast('An unexpected error occurred');
      }
    });
  }

  return (
    <form action={handleSubmit}>
      {children}
    </form>
  );
}
