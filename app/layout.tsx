import type { ReactNode } from 'react';
import './styles.css';

export const metadata = {
  metadataBase: new URL('https://swizec.com'),
  title: {
    default: 'Swizec Teller',
    template: '%s | Swizec Teller',
  },
  description: 'A geek with a hat',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
