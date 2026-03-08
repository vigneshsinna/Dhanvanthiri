import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProductsQuery, useCategoriesQuery } from '@/features/catalog/api';
import { useAddCartItemMutation } from '@/features/cart/api';
import { fallbackProducts, resolveFallbackImage } from '@/lib/fallbackData';
import {
  productCatalogData,
  categoryDescriptions,
  productsPageContent,
  type ProductDetail,
} from '@/features/catalog/data/productCatalogData';
import './CatalogPage.css';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  primary_image_url?: string;
  short_description?: string;
  avg_rating?: number;
  review_count?: number;
  variants?: { id: number; name?: string; stock_quantity: number }[];
  tags?: { name: string }[];
}

type CategoryFilter = 'all' | 'Thokku' | 'Urukai' | 'Podi';
type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'best_sellers';

const SITE_URL = 'https://dhanvanthirifoods.in';
const PAGE = productsPageContent;

const trustIcons: Record<string, string> = {
  'Small Batch Handmade': '🫙',
  'Preservative-Free': '🌿',
  'Pan-India Delivery': '📦',
  'Authentic Tamil Recipes': '🍛',
};

export function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // API data (used when backend is available)
  const { data } = useProductsQuery({});
  const { data: _catData } = useCategoriesQuery();
  const addToCart = useAddCartItemMutation();

  const apiProducts: Product[] = data?.data?.data ?? data?.data ?? [];

  // Merge API with fallback
  const mergedProducts = useMemo(() => {
    const products: Product[] = apiProducts.length > 0 ? apiProducts : (fallbackProducts as unknown as Product[]);
    return products;
  }, [apiProducts]);

  // Filter by category
  const filteredProducts = useMemo(() => {
    let products = mergedProducts;

    if (activeCategory !== 'all') {
      products = products.filter((p) => {
        const detail = productCatalogData.find((d) => d.slug === p.slug);
        if (detail) return detail.category === activeCategory;
        return p.tags?.some((t) => t.name.toLowerCase() === activeCategory.toLowerCase());
      });
    }

    // Sort
    const sorted = [...products];
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'best_sellers':
        sorted.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [mergedProducts, activeCategory, sortBy]);

  const handleAddToCart = (product: Product) => {
    const variant = product.variants?.[0];
    addToCart.mutate({ product_id: product.id, variant_id: variant?.id, quantity: 1 });
  };

  const getDetail = (slug: string): ProductDetail | undefined =>
    productCatalogData.find((d) => d.slug === slug);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mergedProducts.length, Thokku: 0, Urukai: 0, Podi: 0 };
    mergedProducts.forEach((p) => {
      const detail = productCatalogData.find((d) => d.slug === p.slug);
      if (detail) {
        counts[detail.category] = (counts[detail.category] || 0) + 1;
      } else if (p.tags) {
        p.tags.forEach((t) => {
          if (counts[t.name] !== undefined) counts[t.name]++;
        });
      }
    });
    return counts;
  }, [mergedProducts]);

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: PAGE.seo_title,
    description: PAGE.seo_description,
    url: `${SITE_URL}/products`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: filteredProducts.length,
      itemListElement: filteredProducts.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          url: `${SITE_URL}/products/${p.slug}`,
          offers: {
            '@type': 'Offer',
            price: p.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
          },
        },
      })),
    },
  }), [filteredProducts]);

  return (
    <>
      <Helmet>
        <title>{PAGE.seo_title}</title>
        <meta name="description" content={PAGE.seo_description} />
        <link rel="canonical" href={`${SITE_URL}/products`} />
        <meta property="og:title" content={PAGE.seo_title} />
        <meta property="og:description" content={PAGE.seo_description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/products`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* ─── HERO ─── */}
      <header className="catalog-hero hero-gradient-bg">
        <div className="catalog-hero-orb catalog-hero-orb--one float-up" aria-hidden="true" />
        <div className="catalog-hero-orb catalog-hero-orb--two float-diag" aria-hidden="true" />
        <div className="catalog-hero-overlay" />
        <div className="catalog-container catalog-hero-inner">
          <span className="catalog-eyebrow animate-on-scroll top-down">{PAGE.hero_eyebrow}</span>
          <h1 className="catalog-hero-title animate-on-scroll top-down" data-animate-delay="90ms">{PAGE.hero_title}</h1>
          <p className="catalog-hero-subtitle animate-on-scroll top-down" data-animate-delay="150ms">{PAGE.hero_subtitle}</p>
          <div className="catalog-trust-row animate-on-scroll top-down" data-animate-delay="220ms">
            {PAGE.trust_points.map((point) => (
              <span key={point} className="catalog-trust-point">
                <span className="catalog-trust-icon">{trustIcons[point] || '✓'}</span>
                {point}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ─── INTRO ─── */}
      <section className="catalog-section">
        <div className="catalog-container">
          <p className="catalog-intro-text animate-on-scroll top-down">{PAGE.intro}</p>
        </div>
      </section>

      {/* ─── FILTERS BAR ─── */}
      <section className="catalog-section catalog-filters-section">
        <div className="catalog-container">
          <div className="catalog-filters-bar animate-on-scroll top-down">
            <div className="catalog-category-tabs">
              {(['all', 'Thokku', 'Urukai', 'Podi'] as CategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  className={`catalog-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'all' ? 'All Products' : cat}
                  <span className="catalog-tab-count">{categoryCounts[cat] || 0}</span>
                </button>
              ))}
            </div>
            <div className="catalog-sort">
              <label htmlFor="sort-select" className="catalog-sort-label">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="catalog-sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="best_sellers">Best Sellers</option>
              </select>
            </div>
          </div>

          {/* Category description */}
          {activeCategory !== 'all' && categoryDescriptions[activeCategory] && (
            <p className="catalog-category-desc">{categoryDescriptions[activeCategory]}</p>
          )}
        </div>
      </section>

      {/* ─── PRODUCT GRID ─── */}
      <section className="catalog-section">
        <div className="catalog-container">
          {filteredProducts.length === 0 ? (
            <div className="catalog-empty">
              <div className="catalog-empty-icon">🔍</div>
              <p className="catalog-empty-text">{PAGE.empty_state}</p>
              <button
                className="catalog-empty-btn"
                onClick={() => { setActiveCategory('all'); setSortBy('newest'); }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="catalog-grid stagger-children">
              {filteredProducts.map((product) => {
                const detail = getDetail(product.slug);
                const inStock = product.variants?.some((v) => v.stock_quantity > 0) ?? true;
                let imageUrl = product.primary_image_url;
                if (!imageUrl) {
                  imageUrl = resolveFallbackImage(product.name, product.slug, product.id || 1);
                }
                const badge = detail?.badge || '';
                const category = detail?.category || product.tags?.[0]?.name || '';
                const desc = detail?.short_description || product.short_description || '';
                const chips = detail?.chips?.slice(0, 3) || [];
                const pairWith = detail?.pair_with?.slice(0, 2).join(', ') || '';
                const weight = detail?.weight || product.variants?.[0]?.name || '200g';
                const tamilTitle = detail?.tamil_title || '';

                return (
                  <article key={product.id} className="catalog-card group animate-on-scroll scale-in">
                    <Link to={`/products/${product.slug}`} className="block">
                      <div className="catalog-card-img">
                        <img
                          src={imageUrl || ''}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('catalog-card-img-fallback');
                            e.currentTarget.insertAdjacentHTML('afterend', '<div class="catalog-card-img-emoji">🫙</div>');
                          }}
                        />
                        {badge && <div className="catalog-card-badge">{badge}</div>}
                      </div>
                    </Link>
                    <div className="catalog-card-body">
                      {category && <div className="catalog-card-category">{category.toUpperCase()}</div>}
                      <Link to={`/products/${product.slug}`} className="block">
                        <h3 className="catalog-card-title group-hover:text-brand-700 transition-colors">
                          {detail?.title || product.name}
                        </h3>
                        {tamilTitle && <div className="text-sm font-medium text-brand-700/80 mb-2">{tamilTitle}</div>}
                      </Link>
                      {desc && <p className="catalog-card-desc mt-1">{desc}</p>}
                      {chips.length > 0 && (
                        <div className="catalog-card-chips">
                          {chips.map((chip, i) => (
                            <span key={i} className="catalog-chip">{chip}</span>
                          ))}
                        </div>
                      )}
                      {pairWith && (
                        <div className="catalog-card-pairing">Best with: {pairWith}</div>
                      )}
                      <div className="catalog-card-price-row">
                        <div className="catalog-card-price-left">
                          <span className="catalog-price">₹{product.price}</span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="catalog-price-old">₹{product.compare_at_price}</span>
                          )}
                        </div>
                        <span className="catalog-weight">{weight}</span>
                      </div>
                      <div className="catalog-card-cta">
                        {inStock ? (
                          <button
                            className="catalog-btn-cart"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product);
                            }}
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <button className="catalog-btn-cart catalog-btn-sold-out" disabled>
                            Sold Out
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="catalog-section catalog-why-section">
        <div className="catalog-container">
          <div className="catalog-section-head">
            <h2>Why Choose Dhanvanthiri Foods</h2>
          </div>
          <div className="catalog-why-grid stagger-children">
            {[
              { title: 'Authentic Tamil Flavours', desc: 'Inspired by time-honoured recipes that feel like home.', icon: '🍛' },
              { title: 'Small Batch Handmade', desc: 'Prepared in small batches for freshness, consistency, and care.', icon: '🫙' },
              { title: 'Everyday Meal Companions', desc: 'Made to pair effortlessly with rice, idli, dosa, chapati, and tiffin.', icon: '🍚' },
              { title: 'Pan-India Delivery', desc: 'Packed hygienically and delivered across India.', icon: '📦' },
            ].map((item, i) => (
              <div key={i} className="catalog-why-card animate-on-scroll scale-in">
                <div className="catalog-why-icon">{item.icon}</div>
                <h3 className="catalog-why-title">{item.title}</h3>
                <p className="catalog-why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="catalog-section">
        <div className="catalog-container catalog-faq-container">
          <div className="catalog-section-head">
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="catalog-faq-list">
            {PAGE.faqs.map((faq, i) => (
              <div
                key={i}
                className={`catalog-faq-item animate-on-scroll top-down ${openFaq === i ? 'open' : ''}`}
              >
                <button
                  className="catalog-faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.question}</span>
                  <svg
                    className={`catalog-faq-chevron ${openFaq === i ? 'rotated' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="catalog-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEO CONTENT ─── */}
      <section className="catalog-section catalog-seo-section">
        <div className="catalog-container">
          <p className="catalog-seo-text">
            Looking for <strong>traditional Tamil foods online</strong>? Our collection includes flavourful{' '}
            <strong>Tamil pickles</strong>, <strong>homestyle thokku</strong>, and <strong>authentic podi varieties</strong>{' '}
            made for modern kitchens without losing the essence of traditional taste. From{' '}
            <strong>Maanga Oorugai</strong> and <strong>Lime Pickle</strong> to <strong>Karuveppilai Thokku</strong>,{' '}
            <strong>Pirandai Thokku</strong>, <strong>Paruppu Podi</strong>, and <strong>Kollu Podi</strong>, our range is
            crafted for everyday enjoyment and convenient online ordering across India.
          </p>
        </div>
      </section>
    </>
  );
}
