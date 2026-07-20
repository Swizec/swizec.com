import { ImageResponse } from 'takumi-js/response';
import { OgCard } from '../../components/og-card';
import { ogImageOptions } from '../../components/og-image';

// Slack only unfurls og:image URLs that end in an image extension — serve
// the home card directly at the .png URL.
export async function GET(): Promise<Response> {
    return new ImageResponse(
        OgCard({
            title: 'Swizec Teller - a geek with a hat',
            description:
                'Software engineering lessons from production. Raw and honest from the heart, fueled by 20+ years of building real code.',
            seed: 'home',
        }),
        ogImageOptions
    );
}
