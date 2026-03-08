import { useParams, Link } from 'react-router-dom';
import { usePageQuery } from '@/features/cms/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Helmet } from 'react-helmet-async';
import { getFallbackPageBySlug } from '@/lib/fallbackData';
import { LegalPageTemplate } from './LegalPageTemplate';
import { isLegalPageSlug } from '@/features/cms/utils/legalPageContent';

export function DynamicPage() {
  const { slug } = useParams();
  const { data, isLoading } = usePageQuery(slug || '');
  const apiPage = data?.data?.data;
  const apiPageHtml = apiPage?.content ?? apiPage?.body;
  const fallbackPage = getFallbackPageBySlug(slug);
  const legalPage = isLegalPageSlug(slug);

  const hasValidApiPage = apiPage && typeof apiPage === 'object' && apiPage.title && apiPageHtml;
  const page = hasValidApiPage ? apiPage : fallbackPage;

  if (isLoading) return <PageLoader />;

  if (!page) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">🚧</div>
        <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Coming Soon
        </h1>
        <p className="mt-3 text-slate-600">
          We're working on this page. Check back soon for updates!
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.meta_title || `${page.title} - Dhanvanthiri Foods`}</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
      </Helmet>

      {legalPage ? (
        <LegalPageTemplate page={page} />
      ) : (
        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-slate-900">{page.title}</h1>
          <div
            className="prose prose-slate mt-6 max-w-none prose-headings:font-semibold prose-a:text-brand-700 prose-p:my-5 prose-li:my-1.5 prose-h3:mt-9 prose-h3:mb-3"
            dangerouslySetInnerHTML={{ __html: page.content ?? page.body ?? '' }}
          />
        </article>
      )}
    </>
  );
}
