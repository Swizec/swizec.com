import { allPages } from 'content-collections';

export const metadata = { title: 'Home' };

export default function Home() {
  const recentPosts = allPages
    .filter((p) => p.published)
    .sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''))
    .slice(0, 10);

  return (
    <main>
      <h1>Swizec Teller</h1>
      <p>A geek with a hat</p>
      <ul>
        {recentPosts.map((p) => (
          <li key={p._meta.path}>
            <a href={`/blog/${p._meta.path.replace(/\/index$/, '')}`}>{p.title}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
