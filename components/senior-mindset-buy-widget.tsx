'use client';

import { useEffect, type ReactNode } from 'react';
import { trackEvent } from '../lib/track';

const SENIOR_MINDSET_PRODUCT_ID = 'c2b0c3ce-6d23-4d01-b4f2-bb01f600e72f';

// lemon.js turns .lemonsqueezy-button links into an embedded checkout overlay;
// banner.js shows the purchase-power-parity discount banner.
const checkoutScripts = ['https://app.lemonsqueezy.com/js/lemon.js', 'https://cdn.paritydeals.com/banner.js'];

function loadCheckoutScripts() {
    for (const src of checkoutScripts) {
        if (document.querySelector(`script[src="${src}"]`)) continue;
        const script = document.createElement('script');
        script.defer = true;
        script.src = src;
        document.body.append(script);
    }
}

export function trackClick(productId: string) {
    trackEvent('Purchase Button Clicked', { productId });
}

// Checkout link that opens the Lemon Squeezy overlay. Used for both the buy
// button and image links wrapping arbitrary content.
export function LemonSqueezyLink({
    productId = SENIOR_MINDSET_PRODUCT_ID,
    className,
    children,
}: {
    productId?: string;
    className?: string;
    children: ReactNode;
}) {
    useEffect(loadCheckoutScripts, []);

    return (
        <a
            href={`https://swizec.lemonsqueezy.com/checkout/buy/${productId}?embed=1&media=0`}
            className={`lemonsqueezy-button${className ? ` ${className}` : ''}`}
            onClick={() => trackClick(productId)}
        >
            {children}
        </a>
    );
}

function Package({ title, price, items }: { title: string; price: number; items: ReactNode[] }) {
    return (
        <div className="buy-widget-package">
            <h4>{title}</h4>
            <h5>${price}</h5>
            <ul>
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function TheButton() {
    return (
        <p className="buy-widget-cta">
            <LemonSqueezyLink className="purchase-button">Get Senior Mindset Book</LemonSqueezyLink>
        </p>
    );
}

export function SeniorMindsetBuyWidget({ showPricing }: { showPricing?: boolean }) {
    if (!showPricing) {
        return <TheButton />;
    }

    return (
        <aside className="buy-widget">
            <div className="buy-widget-grid">
                <Package
                    title="Just The Book"
                    price={49}
                    items={[
                        'DRM-free pdf/epub',
                        '14 week email series',
                        '39 curated book recommendations',
                        '30 day money-back guarantee',
                    ]}
                />
                <Package
                    title="Book + Audio"
                    price={79}
                    items={[
                        'DRM-free pdf/epub',
                        '14 week email series',
                        '39 curated book recommendations',
                        '3h 32min audiobook',
                        '12h+ interviews private podcast',
                        '30 day money-back guarantee',
                    ]}
                />
                <Package
                    title="Book + Audio + Coaching"
                    price={449}
                    items={[
                        'DRM-free pdf/epub',
                        '14 week email series',
                        '39 curated book recommendations',
                        '3h 32min audiobook',
                        '12h+ interviews private podcast',
                        '1-on-1 ask anything coaching session',
                    ]}
                />
            </div>
            <TheButton />
        </aside>
    );
}
