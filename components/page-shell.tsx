import type { ReactNode } from 'react';
import { BookSidebar } from './book-sidebar';

// Content-well + sidebar grid. Pages pick their sidebar; the default is the
// site-wide book rail. Pass sidebar={null} for a full-width solo layout.
export function PageShell({
    children,
    sidebar,
}: {
    children: ReactNode;
    sidebar?: ReactNode | null;
}) {
    const rail = sidebar === undefined ? <BookSidebar /> : sidebar;

    return (
        <div className={`page-grid${rail ? '' : ' page-grid-solo'}`}>
            <div className="page-content">{children}</div>
            {rail}
        </div>
    );
}
