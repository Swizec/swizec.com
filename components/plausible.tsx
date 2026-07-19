// Plausible Analytics — same setup the Gatsby site shipped: pageview script
// from plausible.io scoped to swizec.com, plus the official queue stub so
// custom events fired before the script loads are buffered, not dropped.
// React hoists the <link> and the async <script> into <head>; the inline
// stub runs where it renders, before any content below it can be clicked.
const queueStub =
    'window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}';

export function PlausibleAnalytics() {
    return (
        <>
            <link rel="preconnect" href="https://plausible.io" />
            <script async defer data-domain="swizec.com" src="https://plausible.io/js/plausible.js" />
            <script dangerouslySetInnerHTML={{ __html: queueStub }} />
        </>
    );
}
