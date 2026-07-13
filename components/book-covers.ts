// Vite-hashed cover assets, shared by the sidebar and article promos.
import scalingFast from '../pages/img/ScalingFast3DCover.png';
import seniorMindset from '../pages/img/SeniorMindset-cover-3d.png';
import serverlessHandbook from '../pages/img/serverless-handbook-bookshelf.jpg';
import type { Book } from '../lib/books';

export const BOOK_COVERS: Record<Book['cover'], string> = {
    'scaling-fast': scalingFast,
    'senior-mindset': seniorMindset,
    'serverless-handbook': serverlessHandbook,
};
