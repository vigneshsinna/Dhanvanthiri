import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePostsQuery } from '@/features/cms/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Helmet } from 'react-helmet-async';
import { fallbackBlogPosts } from '@/lib/fallbackData';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image_url?: string | null;
  category?: { name: string; slug: string };
  author?: { name: string };
  reading_time?: number;
  published_at: string;
}

export function BlogListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePostsQuery({ page, per_page: 9 });
  const apiPosts: Post[] = data?.data?.data ?? data?.data ?? [];
  const posts: Post[] = apiPosts.length > 0 ? apiPosts : (fallbackBlogPosts as Post[]);
  const pagination = data?.data?.meta ?? data?.meta ?? null;

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Blog - Dhanvanthiri Foods</title>
        <meta name="description" content="Read about traditional South Indian recipes, health tips, and food culture." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blog</h1>
          <p className="mt-1 text-slate-600">Recipes, tips, and stories from our kitchen</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
              <Link to={`/blog/${post.slug}`}>
                <div className="aspect-video overflow-hidden bg-slate-100">
                  {post.featured_image_url ? (
                    <img src={post.featured_image_url} alt={post.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-4xl">📝</div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                {post.category && (
                  <span className="text-xs font-medium uppercase text-brand-600">{post.category.name}</span>
                )}
                <Link to={`/blog/${post.slug}`}>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-brand-700">
                    {post.title}
                  </h2>
                </Link>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(post.published_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {post.reading_time && <span>{post.reading_time} min read</span>}
                </div>
              </div>
            </article>
          ))}
        </div>

        {pagination && pagination.last_page > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            >Previous</button>
            <span className="px-3 py-1.5 text-sm text-slate-600">
              Page {page} of {pagination.last_page}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.last_page}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            >Next</button>
          </div>
        )}
      </div>
    </>
  );
}
