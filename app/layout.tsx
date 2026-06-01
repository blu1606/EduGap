import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'EduGap',
  description: 'Hệ thống khảo sát và củng cố kiến thức AI Thực Chiến',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
