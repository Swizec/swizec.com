import { ImageResponse } from 'takumi-js/response';
import { OgCard } from '../components/og-card';
import { ogImageOptions } from '../components/og-image';

export default async function OGImage() {
    return new ImageResponse(
        <OgCard
            title="Software Engineering Lessons from Production"
            description="How do you rewrite an app while people are still using it?"
            seed="home"
        />,
        ogImageOptions
    );
}
