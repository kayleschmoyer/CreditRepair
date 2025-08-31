import './globals.css';
import type { ReactNode } from 'react';
import { ToastProvider } from '../components/ToastProvider';
import { ConfirmProvider } from '../components/ConfirmProvider';

export const metadata = { title: 'CreditCraft' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
