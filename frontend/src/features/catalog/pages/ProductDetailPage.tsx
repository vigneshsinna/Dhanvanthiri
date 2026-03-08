import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductQuery, useReviewsQuery, useSubmitReviewMutation, useRecommendationsQuery } from '@/features/catalog/api';
import { useAddCartItemMutation } from '@/features/cart/api';
import { useAppSelector } from '@/lib/utils/hooks';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Helmet } from 'react-helmet-async';
import { fallbackProducts, resolveFallbackImage } from '@/lib/fallbackData';
import { getProductDetailBySlug, productCatalogData } from '@/features/catalog/data/productCatalogData';
import { addToRecentlyViewed, getRecentlyViewed, type RecentlyViewedProduct } from '@/features/catalog/recentlyViewed';

interface Variant {
  id: number;
  name: string;
  sku: string;
  price_override: number | null;
  stock_quantity: number;
  weight?: number | null;
}

interface ProductImage {
  id: number;
  url?: string;
  path?: string;
  alt_text?: string;
  sort_order: number;
}

interface Review {
  id: number;
  rating: number;
  title?: string;
  body: string;
  status: string;
  user?: { name: string };
  created_at: string;
}

interface Recommendation {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
}

const SITE_URL = 'https://dhanvanthirifoods.in';

export function ProductDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, error } = useProductQuery(slug || '');
  const addToCart = useAddCartItemMutation();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  // Use API product or fall back to static data
  const apiProduct = data?.data?.data ?? data?.data;
  const fallbackProduct = !apiProduct ? fallbackProducts.find((p) => p.slug === slug) : null;
  const product = apiProduct || fallbackProduct;

  // Get rich details from catalog data
  const detail = slug ? getProductDetailBySlug(slug) : undefined;

  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Reviews
  const { data: reviewsData } = useReviewsQuery(product?.id ?? 0);
  const reviews: Review[] = Array.isArray(reviewsData?.data) ? reviewsData.data : [];
  const submitReview = useSubmitReviewMutation(product?.id ?? 0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Related products (same category, excluding current)
  const relatedProducts = useMemo(() => {
    if (!detail) return [];
    return productCatalogData
      .filter((p) => p.category === detail.category && p.slug !== detail.slug)
      .slice(0, 4);
  }, [detail]);

  // API recommendations (preferred) with fallback to static related products
  const { data: recommendationsData } = useRecommendationsQuery({
    product_id: product?.id,
    category_id: product?.category_id ?? product?.category?.id,
    limit: 4,
  });

  const apiRecommendations: Recommendation[] = useMemo(() => {
    if (Array.isArray(recommendationsData?.data?.data)) {
      return recommendationsData.data.data as Recommendation[];
    }
    if (Array.isArray(recommendationsData?.data)) {
      return recommendationsData.data as Recommendation[];
    }
    return [];
  }, [recommendationsData]);

  const recentlyViewed: RecentlyViewedProduct[] = useMemo(() => {
    return getRecentlyViewed()
      .filter((item) => item.slug !== product?.slug)
      .slice(0, 4);
  }, [product?.id, product?.slug]);

  // Track recently viewed products
  useEffect(() => {
    if (product && product.id) {
      addToRecentlyViewed({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.primary_image_url || null,
      });
    }
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <PageLoader />;
  if (error && !product) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Product Not Found</h1>
        <p className="mt-2 text-slate-600">The product you're looking for doesn't exist.</p>
        <Link to="/products" className="mt-4 inline-block text-brand-700 hover:underline">Browse products</Link>
      </div>
    );
  }

  if (!product) return <PageLoader />;

  const variants: Variant[] = product.variants ?? [];
  const images: ProductImage[] = product.images ?? [];
  const tags: { name: string }[] = product.tags ?? [];

  let imageUrl = product.primary_image_url;
  if (!imageUrl && images.length === 0) {
    imageUrl = resolveFallbackImage(product.name, product.slug, product.id || 1);
  }
  const activeVariant = variants.find((v: Variant) => v.id === selectedVariant) ?? variants[0];
  const price = activeVariant?.price_override ?? product.price;
  const inStock = activeVariant ? activeVariant.stock_quantity > 0 : true;

  const productTitle = detail?.title || product.name;
  const seoTitle = detail?.seo_title || `${productTitle} - Dhanvanthiri Foods`;
  const seoDesc = detail?.seo_description || product.meta_description || '';

  const handleAddToCart = () => {
    addToCart.mutate({
      product_id: product.id,
      variant_id: activeVariant?.id,
      quantity,
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReview.mutateAsync(reviewForm);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', body: '' });
    } catch { /* handled by UI */ }
  };

  // JSON-LD for product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productTitle,
    description: detail?.short_description || product.short_description || '',
    url: `${SITE_URL}/products/${slug}`,
    image: imageUrl,
    brand: { '@type': 'Brand', name: 'Dhanvanthiri Foods' },
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'INR',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Dhanvanthiri Foods' },
    },
    ...(product.avg_rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.avg_rating,
        reviewCount: product.review_count || 0,
      },
    }),
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        {seoDesc && <meta name="description" content={seoDesc} />}
        <link rel="canonical" href={`${SITE_URL}/products/${slug}`} />
        <meta property="og:title" content={seoTitle} />
        {seoDesc && <meta property="og:description" content={seoDesc} />}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`${SITE_URL}/products/${slug}`} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500 animate-on-scroll top-down">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-brand-700">Products</Link>
        {detail?.category && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/products?category=${detail.category.toLowerCase()}`} className="hover:text-brand-700">
              {detail.category}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-slate-900">{productTitle}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 stagger-children">
        {/* ─── Image Gallery ─── */}
        <div className="space-y-3 animate-on-scroll slide-left">
          <div className="aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]?.url || images[selectedImage]?.path || imageUrl}
                alt={images[selectedImage]?.alt_text || productTitle}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'text-6xl', 'text-slate-300');
                  e.currentTarget.insertAdjacentHTML('afterend', '<span>🫙</span>');
                }}
              />
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={productTitle}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'text-6xl', 'text-slate-300');
                  e.currentTarget.insertAdjacentHTML('afterend', '<span>🫙</span>');
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl text-slate-300">🫙</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img: ProductImage, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${i === selectedImage ? 'border-brand-500' : 'border-transparent'}`}
                >
                  <img src={img.url || img.path} alt={img.alt_text || ''} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Product Info ─── */}
        <div className="space-y-5 animate-on-scroll slide-right">
          {/* Badge + Category */}
          <div className="flex flex-wrap items-center gap-2">
            {detail?.badge && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
                {detail.badge}
              </span>
            )}
            {detail?.category && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {detail.category}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            {productTitle}
          </h1>
          {detail?.tamil_title && (
            <div className="text-xl font-medium text-brand-700/80 -mt-2">
              {detail.tamil_title}
            </div>
          )}

          {/* Short description */}
          {detail?.short_description && (
            <p className="text-base leading-relaxed text-slate-600">{detail.short_description}</p>
          )}

          {/* Rating */}
          {product.avg_rating != null && product.avg_rating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-lg text-yellow-500">
                {'★'.repeat(Math.round(product.avg_rating))}{'☆'.repeat(5 - Math.round(product.avg_rating))}
              </span>
              <span className="text-sm text-slate-500">({product.review_count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900">₹{price}</span>
            {product.compare_at_price && product.compare_at_price > price && (
              <>
                <span className="text-lg text-slate-400 line-through">₹{product.compare_at_price}</span>
                <Badge variant="danger">
                  {Math.round(((product.compare_at_price - price) / product.compare_at_price) * 100)}% OFF
                </Badge>
              </>
            )}
            {detail?.weight && (
              <span className="text-sm text-slate-400">/ {detail.weight}</span>
            )}
          </div>

          {/* Chips */}
          {detail && detail.chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {detail.chips.map((chip, i) => (
                <span key={i} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-100">
                  {chip}
                </span>
              ))}
            </div>
          )}

          {/* Tags from API */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag: { name: string }) => (
                <Badge key={tag.name} variant="success">{tag.name}</Badge>
              ))}
            </div>
          )}

          {/* Taste Profile */}
          {detail?.taste_profile && (
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm animate-on-scroll scale-in">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Taste Profile</h3>
              <p className="text-sm font-medium text-slate-700">{detail.taste_profile}</p>
            </div>
          )}

          {/* Pair With */}
          {detail && detail.pair_with.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm animate-on-scroll scale-in">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Best Paired With</h3>
              <div className="flex flex-wrap gap-2">
                {detail.pair_with.map((item, i) => (
                  <span key={i} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Variant Selector */}
          {variants.length > 1 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">Size / Variant</h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v: Variant) => {
                  const variantName = v.name || detail?.weight || (v.weight ? `${v.weight * 1000}g` : '200g');
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      className={`rounded-lg border px-4 py-2 text-sm transition-colors ${(selectedVariant ?? variants[0]?.id) === v.id
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                        } ${v.stock_quantity <= 0 ? 'opacity-50' : ''}`}
                      disabled={v.stock_quantity <= 0}
                    >
                      {variantName}
                      {v.price_override && <span className="ml-1 text-xs text-slate-400">₹{v.price_override}</span>}
                      {v.stock_quantity <= 0 && <span className="ml-1 text-xs text-red-500">(Out of stock)</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-slate-300">
              <button
                className="px-3 py-2 text-slate-600 hover:bg-slate-50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >−</button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                className="px-3 py-2 text-slate-600 hover:bg-slate-50"
                onClick={() => setQuantity(quantity + 1)}
              >+</button>
            </div>
            <Button className="flex-1" disabled={!inStock} loading={addToCart.isPending} onClick={handleAddToCart}>
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>

          {/* Stock status */}
          {activeVariant && (
            <p className={`text-sm ${activeVariant.stock_quantity <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
              {activeVariant.stock_quantity <= 0
                ? 'Out of stock'
                : activeVariant.stock_quantity <= 5
                  ? `Only ${activeVariant.stock_quantity} left!`
                  : 'In stock'}
            </p>
          )}

          {/* Storage info */}
          {detail?.storage && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50/60 border border-amber-100 px-4 py-3 animate-on-scroll scale-in">
              <span className="text-base mt-0.5">📋</span>
              <p className="text-xs leading-relaxed text-amber-800">{detail.storage}</p>
            </div>
          )}

          {/* SKU */}
          {activeVariant?.sku && (
            <p className="text-xs text-slate-400">SKU: {activeVariant.sku}</p>
          )}
        </div>
      </div>

      {/* ─── About & Why You'll Love It ─── */}
      {detail && (
        <div className="mt-12 grid gap-8 lg:grid-cols-2 stagger-children">
          {/* About This Product */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-on-scroll scale-in">
            <h2 className="mb-4 text-xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              About This Product
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">{detail.about}</p>

            {/* Description from API */}
            {product.description && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="prose prose-sm text-slate-600" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}
          </div>

          {/* Why You'll Love It */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-on-scroll scale-in">
            <h2 className="mb-4 text-xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Why You'll Love It
            </h2>
            <ul className="space-y-3">
              {detail.why_love.map((reason, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-sm text-slate-700">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ─── If no detail data, fall back to API description ─── */}
      {!detail && product.description && (
        <div className="mt-12 border-t pt-8 animate-on-scroll top-down">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Description</h2>
          <div className="prose prose-sm text-slate-600" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      )}

      {/* ─── Reviews Section ─── */}
      <div className="mt-12 border-t pt-8 animate-on-scroll top-down">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>Customer Reviews</h2>
          {isAuthenticated && (
            <Button variant="outline" size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
              Write a Review
            </Button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="mt-4 rounded-xl border bg-white p-4 space-y-3 animate-on-scroll scale-in">
            <div>
              <label className="mb-1 block text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                  >★</button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Title (optional)</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Review</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
                value={reviewForm.body}
                onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                required
              />
            </div>
            <Button type="submit" size="sm" loading={submitReview.isPending}>Submit Review</Button>
          </form>
        )}

        {/* Reviews List */}
        <div className="mt-4 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.filter((r: Review) => r.status === 'approved').map((review: Review) => (
              <div key={review.id} className="rounded-xl border bg-white p-4 animate-on-scroll scale-in">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-yellow-500">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                    {review.title && <span className="ml-2 font-medium">{review.title}</span>}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{review.body}</p>
                <p className="mt-1 text-xs text-slate-400">By {review.user?.name ?? 'Customer'}</p>
              </div>
            ))
          )}
        </div>
      </div>

            {/* Recommendations section */}
      {(apiRecommendations.length > 0 || relatedProducts.length > 0) && (
        <div className="mt-12 border-t pt-8 animate-on-scroll top-down">
          <h2 className="mb-6 text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
            You May Also Like
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {(apiRecommendations.length > 0 ? apiRecommendations : relatedProducts.map((item) => ({
              id: 0,
              name: item.title,
              slug: item.slug,
              price: item.price,
              image: null,
            }))).map((related) => {
              const relFallback = fallbackProducts.find((fp) => fp.slug === related.slug);
              const relImage = related.image || relFallback?.primary_image_url || resolveFallbackImage(related.name, related.slug, 1);

              return (
                <Link
                  key={related.slug}
                  to={`/products/${related.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md animate-on-scroll scale-in"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-50">
                    <img
                      src={relImage}
                      alt={related.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                        e.currentTarget.insertAdjacentHTML('afterend', '<div class="text-4xl">?</div>');
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">
                      {related.name}
                    </h3>
                    <p className="mt-2 text-base font-bold text-slate-900">Rs {related.price}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recently viewed section */}
      {recentlyViewed.length > 0 && (
        <div className="mt-12 border-t pt-8 animate-on-scroll top-down">
          <h2 className="mb-6 text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Recently Viewed
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {recentlyViewed.map((item) => (
              <Link
                key={item.slug}
                to={`/products/${item.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md animate-on-scroll scale-in"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-50">
                  <img
                    src={item.image || resolveFallbackImage(item.name, item.slug, item.id || 1)}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                      e.currentTarget.insertAdjacentHTML('afterend', '<div class="text-4xl">?</div>');
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-base font-bold text-slate-900">Rs {item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

