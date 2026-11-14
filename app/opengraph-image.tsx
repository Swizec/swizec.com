import { ImageResponse } from 'takumi-js/response';
import { OgCard } from '../components/og-card';
import { ogImageOptions } from '../components/og-image';

export default async function OGImage() {
    return new ImageResponse(
        <OgCard
            title="Software engineering lessons from production"
            description="Make better engineering decisions when the code, team, and business get messy."
            seed="home"
        />,
        ogImageOptions
    );
}
