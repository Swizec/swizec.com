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
import { PlausibleAnalytics } from '../components/plausible';
// ?no-inline: these are under Vite's 4KB inline limit, but icons must stay
// real files — Google won't index a data-URI favicon and iOS fetches the
// apple-touch icon by URL.
import favicon32 from './assets/favicons/favicon-32.png?no-inline';
import appleTouchIcon from './assets/favicons/apple-touch-icon.png?no-inline';

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
        {/* React hoists these into <head>. /favicon.ico is served by the
            app/favicon.ico convention for old-school blind fetches. */}
        <link rel="icon" href={favicon32} type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href={appleTouchIcon} sizes="180x180" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#CCCFFA" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0e0f1a" />
        <PlausibleAnalytics />
        <SiteHeader />
        {/* Content-well + sidebar grid. Each page renders its own <main>/<article>
            plus (optionally) a sidebar <aside> as the two grid children. */}
        <div className="page-grid">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
