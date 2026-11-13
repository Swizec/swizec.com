import { ImageResponse } from 'takumi-js/response';
import { OgCard } from '../components/og-card';
import { ogImageOptions } from '../components/og-image';

export default async function OGImage() {
    return new ImageResponse(
        <OgCard
            title="Software engineering lessons from production"
            description="Shipping software, leading teams, and using AI in production. Lessons from two decades of doing the work, without the fluff."
            seed="home"
        />,
        ogImageOptions
    );
}
