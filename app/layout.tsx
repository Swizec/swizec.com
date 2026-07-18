import type { ReactNode } from 'react';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-y2k/theme.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/900.css';
import '@fontsource/jetbrains-mono/400.css';
import './styles.css';
import { SiteHeader } from '../components/site-header';
import { SiteFooter } from '../components/site-footer';

export const metadata = {
  metadataBase: new URL('https://swizec.com'),
  title: {
    default: 'Swizec Teller - a geek with a hat',
    template: '%s | Swizec Teller',
  },
  description:
    'Swizec shares software engineering lessons from production in his books, articles, talks, and workshops',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-astryx-theme="y2k">
      <body>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <SiteHeader />
        {/* Content-well + sidebar grid. Each page renders its own <main>/<article>
            plus (optionally) a sidebar <aside> as the two grid children. */}
        <div className="page-grid">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
