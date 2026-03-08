export interface LegalHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

export interface LegalPageContent {
  html: string;
  headings: LegalHeading[];
}

const LEGAL_PAGE_SLUGS = new Set([
  'terms-and-conditions',
  'privacy-policy',
  'shipping-policy',
  'refund-policy',
]);

const ALLOWED_TAGS = new Set([
  'a',
  'blockquote',
  'br',
  'div',
  'em',
  'h2',
  'h3',
  'h4',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
]);

const REMOVE_WITHOUT_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'button', 'input']);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'title']),
  img: new Set(['src', 'alt', 'title']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'section';
}

function isSafeHref(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith('/') ||
    normalized.startsWith('#') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('mailto:') ||
    normalized.startsWith('tel:')
  );
}

function sanitizeElement(element: Element, headings: LegalHeading[], usedIds: Map<string, number>) {
  const tag = element.tagName.toLowerCase();

  Array.from(element.children).forEach((child) => sanitizeElement(child, headings, usedIds));

  if (!ALLOWED_TAGS.has(tag)) {
    if (REMOVE_WITHOUT_CONTENT.has(tag)) {
      element.remove();
      return;
    }

    const parent = element.parentNode;
    if (!parent) return;

    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
    return;
  }

  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    const allowed = ALLOWED_ATTRIBUTES[tag];
    const keep = allowed?.has(name) ?? false;

    if (!keep) {
      element.removeAttribute(attribute.name);
    }
  });

  if (tag === 'a') {
    const href = element.getAttribute('href');
    if (!href || !isSafeHref(href)) {
      element.removeAttribute('href');
    }
  }

  if (tag === 'img') {
    const src = element.getAttribute('src');
    if (!src || !(src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://'))) {
      element.remove();
      return;
    }
  }

  if (tag === 'h2' || tag === 'h3') {
    const text = element.textContent?.trim() ?? '';
    const baseId = slugifyHeading(text);
    const count = (usedIds.get(baseId) ?? 0) + 1;
    usedIds.set(baseId, count);
    const id = count === 1 ? baseId : `${baseId}-${count}`;
    element.setAttribute('id', id);
    headings.push({
      id,
      level: tag === 'h2' ? 2 : 3,
      text,
    });
  }
}

export function isLegalPageSlug(slug?: string | null): boolean {
  return !!slug && LEGAL_PAGE_SLUGS.has(slug);
}

export function buildLegalPageContent(rawHtml: string): LegalPageContent {
  const parser = new DOMParser();
  const document = parser.parseFromString(rawHtml || '', 'text/html');
  const headings: LegalHeading[] = [];
  const usedIds = new Map<string, number>();

  Array.from(document.body.children).forEach((element) => sanitizeElement(element, headings, usedIds));

  return {
    html: document.body.innerHTML,
    headings,
  };
}
