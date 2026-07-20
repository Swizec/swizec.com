// Client-side Plausible custom events. The queue stub rendered by
// <PlausibleAnalytics> buffers events fired before the script loads, so
// early clicks aren't dropped.
type PlausibleWindow = Window & {
    plausible?: (event: string, opts?: { props: Record<string, string> }) => void;
};

export function trackEvent(event: string, props?: Record<string, string>) {
    (window as PlausibleWindow).plausible?.(event, props ? { props } : undefined);
}
