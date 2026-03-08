import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useFeaturedProductsQuery, useCategoriesQuery } from '@/features/catalog/api';
import { useBannersQuery } from '@/features/cms/api';
import { useAddCartItemMutation } from '@/features/cart/api';
import { fallbackProducts, fallbackCategories, resolveFallbackImage } from '@/lib/fallbackData';
import './HomePage.css';

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
}

const SITE_URL = "https://dhanvanthirifoods.in";
const BRAND = "Dhanvanthiri Foods";

// Per-product metadata for rich cards
const productMeta: Record<string, { category?: string; desc?: string; chips?: string[]; pairing?: string; badge?: string }> = {
  'karuveppilai-thokku': { category: 'THOKKU', desc: 'Aromatic curry leaf thokku with deep roasted traditional taste.', chips: ['Herby', 'Best with rice'], pairing: 'Hot rice & ghee', badge: 'Customer Favourite' },
  'chinavangayam-thokku': { category: 'THOKKU', desc: 'Sweet-spicy small onion thokku with rich homestyle flavour.', chips: ['Savory', 'Best with dosa'], pairing: 'Idli / dosa', badge: 'Homemade' },
  'pavakai-thokku': { category: 'THOKKU', desc: 'Bold bitter gourd thokku balanced with spice and tang.', chips: ['Bold', 'Traditional'], pairing: 'Hot rice', badge: 'Traditional' },
  'vallarai-thokku': { category: 'THOKKU', desc: 'Nutritious vallarai thokku with earthy and comforting flavour.', chips: ['Herbal', 'Wellness-inspired'], pairing: 'Curd rice', badge: '' },
  'valaipoo-thokku': { category: 'THOKKU', desc: 'Banana flower thokku made with authentic Tamil home-style seasoning.', chips: ['Earthy', 'Homestyle'], pairing: 'Hot rice & ghee', badge: '' },
  'kovakkai-thokku': { category: 'THOKKU', desc: 'Tasty ivy gourd thokku with a mildly spiced, rustic finish.', chips: ['Mild Spice', 'Best with rice'], pairing: 'Hot rice', badge: '' },
  'poondu-thokku': { category: 'THOKKU', desc: 'Garlic-forward thokku with punchy flavour and rich spice notes.', chips: ['Bold', 'Garlicky'], pairing: 'Curd rice / dosa', badge: 'Customer Favourite' },
  'mallithalai-thokku': { category: 'THOKKU', desc: 'Fresh coriander thokku with vibrant aroma and a tangy touch.', chips: ['Fresh', 'Herby'], pairing: 'Hot rice', badge: '' },
  'pirandai-thokku': { category: 'THOKKU', desc: 'Traditional pirandai thokku with distinctive flavour and homestyle depth.', chips: ['Traditional', 'Unique Taste'], pairing: 'Hot rice & ghee', badge: '' },
  'thakkali-thokku': { category: 'THOKKU', desc: 'Classic tomato thokku with tangy, spicy everyday comfort flavour.', chips: ['Tangy', 'Daily Favourite'], pairing: 'Idli / dosa', badge: 'Everyday Essential' },
  'maangai-urukai': { category: 'URUKAI', desc: 'Classic mango pickle with bold spice and irresistible tanginess.', chips: ['Tangy', 'Authentic'], pairing: 'Curd rice / dosa', badge: 'Best Seller' },
  'narthangai-urukai': { category: 'URUKAI', desc: 'Traditional citron pickle with sharp citrus flavour and spicy depth.', chips: ['Citrusy', 'Authentic'], pairing: 'Hot rice', badge: 'Traditional' },
  'lemon-urukai': { category: 'URUKAI', desc: 'Zesty lemon pickle matured for rich taste and homestyle punch.', chips: ['Zingy', 'Best with curd rice'], pairing: 'Curd rice', badge: '' },
  'ellu-podi': { category: 'PODI', desc: 'Roasted sesame podi with nutty aroma and rich traditional taste.', chips: ['Nutty', 'Best with idli'], pairing: 'Idli / dosa', badge: '' },
  'karuveppilai-podi': { category: 'PODI', desc: 'Curry leaf podi with earthy flavour and comforting aroma.', chips: ['Herby', 'Best with rice'], pairing: 'Hot rice & ghee', badge: 'Customer Favourite' },
  'kollu-podi': { category: 'PODI', desc: 'Horse gram podi with robust flavour and everyday wellness value.', chips: ['Protein-rich', 'Rustic'], pairing: 'Hot rice', badge: '' },
  'murungai-podi': { category: 'PODI', desc: 'Moringa podi packed with flavour and traditional goodness.', chips: ['Leafy', 'Nutritious'], pairing: 'Hot rice & ghee', badge: 'New' },
  'nilakadalai-podi': { category: 'PODI', desc: 'Peanut podi with rich nutty flavour and mild spice.', chips: ['Nutty', 'Kids Friendly'], pairing: 'Idli / dosa', badge: 'Customer Favourite' },
  'paruppu-podi': { category: 'PODI', desc: 'Classic lentil podi with simple, comforting South Indian flavour.', chips: ['Classic', 'Best Seller'], pairing: 'Hot rice & ghee', badge: 'Everyday Essential' },
  'pirandai-podi': { category: 'PODI', desc: 'Traditional pirandai podi with distinctive taste and homestyle character.', chips: ['Traditional', 'Unique'], pairing: 'Hot rice', badge: '' },
  'vallarai-podi': { category: 'PODI', desc: 'Brain-boosting brahmi leaf podi with earthy, herbal taste.', chips: ['Herbal', 'Wellness'], pairing: 'Hot rice & ghee', badge: '' },
  'poondu-podi': { category: 'PODI', desc: 'Flavorful garlic spice mix with punchy aroma.', chips: ['Bold', 'Garlicky'], pairing: 'Idli / dosa', badge: '' },
};

export function HomePage() {
  const { data: featuredData } = useFeaturedProductsQuery();
  const { data: catData } = useCategoriesQuery();
  const { data: bannerData } = useBannersQuery('home_hero');
  const addToCart = useAddCartItemMutation();

  const apiFeatured: Product[] = featuredData?.data?.data ?? featuredData?.data ?? [];
  const apiCategories = catData?.data ?? [];

  // Merge API featured with local fallback to ensure we always have enough items
  const mergedFeatured = [...apiFeatured];
  fallbackProducts.forEach(fp => {
    if (!mergedFeatured.some(ap => ap.slug === fp.slug || ap.name === fp.name)) {
      mergedFeatured.push(fp as unknown as Product);
    }
  });

  const featured: Product[] = mergedFeatured.slice(0, 8);
  const categories = apiCategories.length > 0 ? apiCategories : fallbackCategories;

  const handleAddToCart = (product: Product) => {
    const variant = product.variants?.[0];
    addToCart.mutate({ product_id: product.id, variant_id: variant?.id, quantity: 1 });
  };

  const meta = {
    title: "Traditional Tamil Foods | Pickles, Thokku & Podi (Pan-India Delivery)",
    description:
      "Shop authentic traditional Tamil pickles (oorugai), thokku and podi—handmade in small batches, preservative-free, and delivered pan-India. Taste the flavour of home.",
    canonical: `${SITE_URL}/`,
    ogImage: `${SITE_URL}/assets/og/home-hero.jpg`,
  };

  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FoodEstablishment",
      name: BRAND,
      url: SITE_URL,
      image: [meta.ogImage],
      servesCuisine: ["South Indian", "Tamil"],
      areaServed: "IN",
      sameAs: [],
    };
  }, [meta.ogImage]);

  const jsonLdWebsite = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BRAND,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/products?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={meta.canonical} />

        {/* Open Graph */}
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={meta.canonical} />
        <meta property="og:image" content={meta.ogImage} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.ogImage} />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLdWebsite)}</script>
      </Helmet>

      {/* HERO */}
      <header className="home-hero hero-gradient-bg">
        <div className="heroFloatOrb heroFloatOrb--one float-up" aria-hidden="true" />
        <div className="heroFloatOrb heroFloatOrb--two float-diag" aria-hidden="true" />
        <div className="heroOverlay" />
        <div className="home-container heroInner">
          <div className="heroCard animate-on-scroll fade-up">
            <div className="pill animate-on-scroll fade-up" data-animate-delay="0ms">100% Natural • Preservative-Free</div>
            <h1 className="heroTitle animate-on-scroll fade-up" data-animate-delay="80ms">
              Traditional Tamil Pickles, Thokku &amp; Podi — Handmade in Small Batches
            </h1>
            <p className="heroSub animate-on-scroll fade-up" data-animate-delay="160ms">
              Sun-cured, slow-cooked and packed with authentic South Indian flavour.
              Delivered pan-India.
            </p>

            <div className="heroCtas animate-on-scroll fade-up" data-animate-delay="240ms">
              <Link className="btnPrimary" to="/products?category=pickle">
                Shop Pickles
              </Link>
              <Link className="btnSecondary" to="/products?category=thokku">
                Shop Thokku
              </Link>
              <Link className="btnLink" to="/products?category=podi">
                Shop Podi →
              </Link>
            </div>

            <div className="trustRow animate-on-scroll fade-up" data-animate-delay="320ms">
              <span>🚚 Free shipping above ₹499</span>
              <span>🫙 Hygienic packing</span>
              <span>❤️ Family recipes</span>
            </div>
          </div>

          <div className="heroVisual animate-on-scroll fade-up" data-animate-delay="200ms" aria-hidden="true">
            <img
              src="/images/hero-pickles.png"
              alt="Traditional Tamil Pickles and Thokku"
              loading="eager"
            />
          </div>
        </div>
      </header>

      {/* BEST SELLERS */}
      <section className="home-section">
        <div className="home-container">
          <div className="sectionHead">
            <h2>Best Selling Traditional Tamil Foods</h2>
            <p>Our most-loved pickles, thokku and podi — straight from our kitchen to yours.</p>
          </div>

          <div className="home-grid stagger-children">
            {featured.map((p) => {
              const inStock = p.variants?.some((v) => v.stock_quantity > 0) ?? true;
              let imageUrl = p.primary_image_url;
              if (!imageUrl) {
                imageUrl = resolveFallbackImage(p.name, p.slug, p.id || 1);
              }
              const pm = productMeta[p.slug] || {};
              const category = pm.category || (p as any).tags?.[0]?.name || '';
              const desc = pm.desc || p.short_description || '';
              const chips = pm.chips || [];
              const pairing = pm.pairing || '';
              const badge = pm.badge || '';
              const weight = p.variants?.[0]?.name || '200g Jar';
              return (
                <div key={p.id} className="home-card group animate-on-scroll fade-up">
                  <Link to={`/products/${p.slug}`} className="block">
                    <div className="cardImg">
                      <img src={imageUrl || ''} alt={p.name} loading="lazy" />
                      {badge && <div className="cardBadge">{badge}</div>}
                    </div>
                  </Link>
                  <div className="cardBody">
                    {category && <div className="cardCategory">{category}</div>}
                    <Link to={`/products/${p.slug}`} className="block">
                      <div className="cardTitle group-hover:text-brand-700 transition-colors">{p.name}</div>
                    </Link>
                    {desc && <p className="cardDesc">{desc}</p>}
                    {chips.length > 0 && (
                      <div className="cardChips">
                        {chips.map((c: string, i: number) => <span key={i} className="chip">{c}</span>)}
                      </div>
                    )}
                    {pairing && <div className="cardPairing">Best with: {pairing}</div>}
                    <div className="cardPriceRow">
                      <div className="cardPriceLeft">
                        <span className="price">₹{p.price}</span>
                        {p.compare_at_price && p.compare_at_price > p.price && (
                          <span className="priceOld">₹{p.compare_at_price}</span>
                        )}
                      </div>
                      <span className="cardWeight">{weight}</span>
                    </div>
                    <div className="cardCta">
                      {inStock ? (
                        <button
                          className="btnAddCart"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(p);
                          }}
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <button className="btnAddCart btnSoldOut" disabled>
                          Sold Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="center mt-12">
            <Link className="btnSecondary border-brand-200 text-brand-800 hover:bg-brand-50" to="/products">
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="home-section softBg" id="why-choose-us">
        <div className="home-container">
          <div className="sectionHead text-center animate-on-scroll fade-up">
            <h2>Why Choose Dhanvanthiri Foods</h2>
            <p className="animate-on-scroll fade-up" data-animate-delay="80ms">Traditional Tamil flavours made with care, purity and authenticity.</p>
          </div>

          <div className="home-grid mt-12 stagger-children">
            {[
              {
                title: "Authentic Family Recipes",
                desc: "Inspired by time-honoured Tamil home cooking.",
                icon: "🍛"
              },
              {
                title: "No Preservatives",
                desc: "Made with ingredients you can trust.",
                icon: "🌿"
              },
              {
                title: "Small Batch Handmade",
                desc: "Prepared carefully for freshness and flavour.",
                icon: "🫙"
              },
              {
                title: "Pan-India Delivery",
                desc: "Traditional taste shipped across India.",
                icon: "📦"
              }
            ].map((feature, idx) => (
              <div key={idx} className="animate-on-scroll fade-up bg-white rounded-[18px] p-8 border border-slate-100 shadow-sm text-center" style={{ transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s cubic-bezier(0.22,1,0.36,1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(15,23,42,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div className="text-4xl mb-4" style={{ transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}>{feature.icon}</div>
                <h3 className="font-bold text-[17px] text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-[14px] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO TEXT / BRAND STORY */}
      <section className="home-section story-section">
        <div className="home-container twoCol">
          <div className="animate-on-scroll fade-up pr-0 lg:pr-8">
            <h2 className="text-3xl font-bold mb-6 text-slate-900 leading-tight">Authentic Tamil Pickles, Thokku &amp; Podi — Made the Traditional Way</h2>
            <p className="mb-4 text-slate-700 leading-relaxed text-lg animate-on-scroll fade-up" data-animate-delay="80ms">
              At {BRAND}, we bring you <strong>traditional Tamil foods</strong> crafted with time-honoured
              recipes. From tangy <strong>oorugai</strong> like mango, lime and citron pickles to rich,
              slow-cooked <strong>thokku</strong> and aromatic <strong>podi</strong>, every product is made
              in small batches for freshness and flavour.
            </p>
            <p className="mb-6 text-slate-700 leading-relaxed text-lg animate-on-scroll fade-up" data-animate-delay="160ms">
              We use ingredients loved in Tamil kitchens — curry leaves, sesame, garlic, horse gram,
              moringa and native herbs — and focus on authentic taste, purity, and hygiene.
              Whether you eat it with hot rice and ghee, idli, dosa or curd rice, our food is made to
              feel like home.
            </p>
            <Link className="arrow-link text-brand-700 font-bold underline-offset-4 decoration-2 animate-on-scroll fade-up" data-animate-delay="240ms" to="/pages/about">
              Read Our Story
            </Link>
          </div>

          <div className="animate-on-scroll scale-in ingredientPanel h-fit self-center" data-animate-delay="150ms">
            <div className="ingredientTitle text-2xl text-slate-900 border-b border-slate-100 pb-4 mb-5">Made with ingredients we trust</div>
            <ul className="ingredientList text-slate-700 space-y-4 font-medium text-[15px]">
              <li className="flex gap-3 items-center"><span className="text-xl">🌿</span> Curry Leaves, Coriander &amp; Herbs</li>
              <li className="flex gap-3 items-center"><span className="text-xl">🧄</span> Garlic &amp; Traditional Spices</li>
              <li className="flex gap-3 items-center"><span className="text-xl">🌰</span> Sesame &amp; Lentils</li>
              <li className="flex gap-3 items-center"><span className="text-xl">🥬</span> Moringa, Vallarai &amp; Horse Gram</li>
            </ul>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="dark-section">

        <div className="home-container relative z-10">
          <div className="sectionHead text-center animate-on-scroll fade-up">
            <h2 className="text-white">What Customers Say</h2>
            <p className="text-brand-100/80 animate-on-scroll fade-up" data-animate-delay="80ms">Real reviews from food lovers across India.</p>
          </div>

          <div className="reviewGrid stagger-children">
            {[
              { name: "Priya S.", city: "Chennai", text: "The mango pickle tastes exactly like my grandmother used to make." },
              { name: "Ravi K.", city: "Bengaluru", text: "Vallarai podi is amazing with hot rice and ghee." },
              { name: "Meena R.", city: "Mumbai", text: "Neat packaging and authentic flavour. Loved the thokku!" }
            ].map((r, i) => (
              <div key={i} className="reviewCard animate-on-scroll fade-up">
                <div className="ratingRow text-amber-400 text-sm tracking-widest mb-3">★★★★★</div>
                <p className="reviewText text-lg italic text-brand-50 mb-6">“{r.text}”</p>
                <div className="reviewMeta border-t border-brand-700/50 pt-4">
                  <span className="reviewName text-white">{r.name}</span>
                  <span className="muted text-brand-300 flex items-center gap-1.5 font-medium text-[13px] uppercase tracking-wide mt-1">
                    <svg className="w-3.5 h-3.5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Buyer • {r.city}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section">
        <div className="home-container ctaInner">
          <h2 className="font-serif animate-on-scroll fade-up">Ready to taste tradition?</h2>
          <p className="text-xl mt-3 mb-8 animate-on-scroll fade-up" data-animate-delay="100ms">Order your favourite pickles, thokku and podi — freshly made and shipped pan-India.</p>
          <div className="heroCtas justify-center gap-4 animate-on-scroll fade-up" data-animate-delay="180ms">
            <Link className="btnPrimary shadow-xl shadow-accent-900/20 text-lg px-10 py-4" to="/products">Browse Products</Link>
            <Link className="btnSecondary border-white/30 text-lg px-10 py-4 bg-transparent hover:bg-white/10" to="/pages/contact">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
