import { useParams, Link } from 'react-router-dom';
import { usePostQuery } from '@/features/cms/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Helmet } from 'react-helmet-async';
import { fallbackBlogPosts } from '@/lib/fallbackData';

export function BlogPostPage() {
  const { slug } = useParams();
  const { data, isLoading, error } = usePostQuery(slug || '');
  let post = data?.data;

  if (isLoading) return <PageLoader />;

  if (error || !post) {
    post = (fallbackBlogPosts as any[]).find(p => p.slug === slug);
  }

  if (!post) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h1 className="text-xl font-semibold">Post Not Found</h1>
        <Link to="/blog" className="mt-4 inline-block text-brand-700 hover:underline">Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} - Dhanvanthiri Foods</title>
        {post.meta_description && <meta name="description" content={post.meta_description} />}
      </Helmet>

      <article className="mx-auto max-w-3xl">
        <Link to="/blog" className="text-sm text-brand-700 hover:underline">← Back to Blog</Link>

        {post.featured_image_url && (
          <div className="mt-4 aspect-video overflow-hidden rounded-xl">
            <img src={post.featured_image_url} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="mt-8">
          {post.category && (
            <span className="text-sm font-bold uppercase tracking-wider text-brand-600">{post.category.name}</span>
          )}
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-slate-500 font-medium">
            {post.author && <span className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold uppercase text-brand-700">
                {post.author.name.charAt(0)}
              </div>
              <span className="text-slate-700">{post.author.name}</span>
            </span>}
            <span className="hidden h-1.5 w-1.5 rounded-full bg-slate-300 sm:block"></span>
            <span>{new Date(post.published_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="hidden h-1.5 w-1.5 rounded-full bg-slate-300 sm:block"></span>
            {post.reading_time && <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.reading_time} min read
            </span>}
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag: { name: string }) => (
              <span key={tag.name} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-default">{tag.name}</span>
            ))}
          </div>
        )}

        <div
          className="prose prose-lg prose-slate mt-12 max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900 prose-h2:font-serif prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:leading-loose prose-p:text-slate-600 prose-p:my-6 prose-ul:my-6 prose-li:my-2 prose-li:text-slate-600 prose-a:text-brand-700 hover:prose-a:text-brand-800 prose-strong:text-slate-900 prose-strong:font-bold prose-em:text-brand-700 prose-em:italic prose-em:font-medium prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-brand-50 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:text-brand-900 prose-blockquote:text-xl prose-blockquote:font-serif prose-blockquote:my-8"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </article>
    </>
  );
}
