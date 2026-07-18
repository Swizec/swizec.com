import { ImageResponse } from '@vercel/og';
import { OgCard } from '../components/og-card';

export default async function OGImage() {
    return new ImageResponse(
        <OgCard
            title="Swizec Teller - a geek with a hat"
            description="Software engineering lessons from production. Raw and honest from the heart, fueled by 20+ years of building real code."
        />,
        { width: 1200, height: 630 }
    );
}
