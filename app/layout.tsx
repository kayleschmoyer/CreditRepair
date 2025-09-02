import '../styles/globals.css';
import type { ReactNode } from 'react';
import { ToastProvider } from '../components/ToastProvider';
import { ConfirmProvider } from '../components/ConfirmProvider';
import { initMonitoring } from '../lib/monitoring';

export const metadata = { title: 'CreditCraft' };

export default function RootLayout({ children }: { children: ReactNode }) {
  initMonitoring();
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
