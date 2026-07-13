// Shared OpenGraph card layout, Y2K-styled to match the site.
// The photo is inlined as a data URI at build time so the serverless
// function needs no asset fetching.
import photo from '../app/assets/og-photo.jpg?inline';

export function OgCard({ title, description }: { title: string; description?: string }) {
    return (
        <div
            style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: '#CCCFFA',
                padding: 40,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#FFFFFF',
                    border: '3px solid #2F292E',
                    boxShadow: '10px 10px 0 #2F292E',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        flexGrow: 1,
                        flexShrink: 1,
                        padding: '48px 40px 36px 48px',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div
                            style={{
                                fontSize: title.length > 70 ? 44 : 54,
                                fontWeight: 700,
                                lineHeight: 1.15,
                                color: '#2d241b',
                                display: 'block',
                                lineClamp: 3,
                            }}
                        >
                            {title}
                        </div>
                        {description ? (
                            <div
                                style={{
                                    fontSize: 26,
                                    lineHeight: 1.4,
                                    color: '#675d52',
                                    marginTop: 24,
                                    display: 'block',
                                    lineClamp: 3,
                                }}
                            >
                                {description}
                            </div>
                        ) : null}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                backgroundColor: '#FFE08A',
                                border: '2px solid #2F292E',
                                padding: '6px 18px',
                                fontSize: 26,
                                fontWeight: 700,
                                color: '#2d241b',
                            }}
                        >
                            swizec.com
                        </div>
                        <div style={{ display: 'flex', fontSize: 24, color: '#675d52' }}>
                            Software Engineering Lessons from Production
                        </div>
                    </div>
                </div>
                <img
                    src={photo}
                    width={380}
                    height={544}
                    style={{
                        width: 380,
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: '68% 20%',
                        borderLeft: '3px solid #2F292E',
                        flexShrink: 0,
                    }}
                />
            </div>
        </div>
    );
}
