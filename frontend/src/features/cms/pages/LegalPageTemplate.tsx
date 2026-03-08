import { Link } from 'react-router-dom';
import { buildLegalPageContent } from '@/features/cms/utils/legalPageContent';

interface LegalPageRecord {
  title: string;
  excerpt?: string | null;
  effective_date?: string | null;
  published_at?: string | null;
  content?: string | null;
  body?: string | null;
}

function formatDisplayDate(value?: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function LegalPageTemplate({ page }: { page: LegalPageRecord }) {
  const displayDate = formatDisplayDate(page.effective_date ?? page.published_at);
  const summary = page.excerpt?.trim();
  const { html, headings } = buildLegalPageContent(page.content ?? page.body ?? '');

  return (
    <section className="legal-page-shell">
      <div className="legal-page-header">
        <div className="legal-kicker">Customer Policy</div>
        <h1 className="legal-page-title">{page.title}</h1>
        <div className="legal-meta-row" aria-label="Last updated">
          <span className="legal-meta-label">Last updated</span>
          <span className="legal-meta-value">{displayDate ?? 'Available in CMS'}</span>
        </div>
        {summary ? (
          <div className="legal-summary-card">
            <p>{summary}</p>
          </div>
        ) : null}
      </div>

      {headings.length > 0 ? (
        <nav className="legal-toc" aria-label="On this page">
          <div className="legal-toc-title">On this page</div>
          <div className="legal-toc-links">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={heading.level === 3 ? 'legal-toc-link legal-toc-link-sub' : 'legal-toc-link'}
              >
                {heading.text}
              </a>
            ))}
          </div>
        </nav>
      ) : null}

      <article className="legal-content-card">
        <div className="legal-richtext" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <aside className="legal-support-box" aria-label="Policy support">
        <p className="legal-support-title">Need help with this policy?</p>
        <p className="legal-support-copy">
          For policy questions, contact us at{' '}
          <a href="mailto:dhanvanthrifoods777@gmail.com">dhanvanthrifoods777@gmail.com</a>{' '}
          or call <a href="tel:+919445717977">9445717977</a>.
        </p>
        <Link to="/pages/contact" className="legal-support-link">
          Contact Us
        </Link>
      </aside>
    </section>
  );
}
