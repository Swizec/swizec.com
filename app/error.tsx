'use client';

// General error boundary (timber error-handling paradigm). deny() calls
// without a matching status file land here with `status` set — the HTTP
// status code stays correct either way. Render errors get a retry button.
export default function ErrorPage({
    error,
    reset,
    status,
}: {
    error: Error;
    reset: () => void;
    status?: number;
}) {
    if (status === 404) {
        return (
            <main>
                <h1>404 Not Found</h1>
                <p>Ooops! Looks like that page doesn't exist.</p>
                <p>
                    Clicked a link? Please{' '}
                    <a href="https://twitter.com/swizec">hit me up on twitter</a> and I'll try to
                    fix it.
                </p>
            </main>
        );
    }

    if (status) {
        return (
            <main>
                <h1>Well this is embarrassing 😅</h1>
                <p>Something went wrong handling your request (error {status}).</p>
                <p>
                    Try again in a minute — or email{' '}
                    <a href="mailto:hi@swizec.com">hi@swizec.com</a> if it keeps happening.
                </p>
            </main>
        );
    }

    return (
        <main>
            <h1>Well this is embarrassing 😅</h1>
            <p>Something broke while rendering this page: {error.message}</p>
            <p>
                <button onClick={reset}>Try again</button>
            </p>
            <p>
                If it keeps happening, email <a href="mailto:hi@swizec.com">hi@swizec.com</a> and
                I'll fix it.
            </p>
        </main>
    );
}
