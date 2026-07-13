import { cache } from '@timber-js/app/cache';

// Replaces gatsby-typeform-source + TypeformResponse.js: fetches responses
// for the newsletter feedback form straight from the Typeform API and joins
// answers to question titles via the form definition.

const FORM_ID = 'jLgVKKLf';
const API = 'https://api.typeform.com';

interface Answer {
    field: { title: string };
    type: string;
    number?: number;
    text?: string;
    choice?: { label: string };
}

async function typeformGet(path: string, token: string) {
    const response = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error(`Typeform API ${path} failed: ${response.status}`);
    }
    return response.json();
}

const getResponses = cache(
    async (): Promise<Answer[][] | null> => {
        const token = process.env.TYPEFORM_TOKEN;
        if (!token) return null;

        try {
            const [form, responses] = await Promise.all([
                typeformGet(`/forms/${FORM_ID}`, token),
                typeformGet(`/forms/${FORM_ID}/responses?page_size=1000&completed=true`, token),
            ]);

            const titleByFieldId = new Map<string, string>(
                (form.fields ?? []).map((field: { id: string; title: string }) => [
                    field.id,
                    field.title,
                ])
            );

            type ApiAnswer = Omit<Answer, 'field'> & { field: { id: string } };
            return (responses.items ?? []).map((item: { answers: ApiAnswer[] | null }) =>
                (item.answers ?? []).map((answer) => ({
                    ...answer,
                    field: { title: titleByFieldId.get(answer.field.id) ?? '' },
                }))
            );
        } catch (error) {
            console.error('Typeform responses fetch failed', error);
            return null;
        }
    },
    { ttl: 86400, staleWhileRevalidate: true, tags: ['testimonials'] }
);

function getAnswer(question: string, answers: Answer[]) {
    return answers.find((answer) => answer.field.title === question);
}

// Same questions and layout as the old src/components/TypeformResponse.js.
// Note: the question strings use typographic apostrophes (’), same as Typeform.
const QUESTIONS = [
    'What hesitation did you have about subscribing?',
    'What did you learn from Swizec’s Newsletter?',
    'What do you like most about the Swizec’s Newsletter?',
    'What are some other benefits you got from Swizec’s Newsletter?',
    'Would you recommend Swizec’s Newsletter to a friend? Why?',
];

function Response({ answers }: { answers: Answer[] }) {
    const rating = getAnswer('Are you enjoying the Swizec’s Newsletter?', answers);
    const jobLevel = getAnswer('What’s your job level?', answers);
    const stars = rating?.number ? '⭐️'.repeat(rating.number) : '';

    return (
        <>
            <h3>
                {stars}
                {jobLevel?.choice ? ` from a ${jobLevel.choice.label}` : null}
            </h3>
            {QUESTIONS.map((question) => {
                const answer = getAnswer(question, answers);
                if (!answer?.text) return null;
                return (
                    <div key={question}>
                        <strong>{question}</strong>
                        <p>{answer.text}</p>
                    </div>
                );
            })}
        </>
    );
}

export async function TypeformResponses() {
    const responses = await getResponses();

    if (!responses) {
        return <p>Testimonials are temporarily unavailable — check back soon.</p>;
    }

    return (
        <>
            {responses.map((answers, i) => (
                <Response answers={answers} key={i} />
            ))}
        </>
    );
}
