import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/lib/utils/hooks';
import { clearCredentials } from '@/features/auth/store/authSlice';
import { useLogoutMutation, useMeQuery } from '@/features/auth/api';
import { useCartQuery } from '@/features/cart/api';
import { setCart } from '@/features/cart/store/cartSlice';
import { setCredentials } from '@/features/auth/store/authSlice';
import { useEffect, useRef, useState } from 'react';
import { usePageScrollReveal } from '@/lib/utils/usePageScrollReveal';
import { isItUserRole } from '@/features/auth/roleDisplay';

const BRAND_LOGO_SRC = '/images/dhanvanthiri-logo.png';

export function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, accessToken } = useAppSelector((s) => s.auth);
  const cart = useAppSelector((s) => s.cart);
  const logoutMut = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pageContentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Auto-fetch profile on mount if token exists
  const { data: meData } = useMeQuery(isAuthenticated);
  useEffect(() => {
    if (meData?.data && accessToken) {
      dispatch(setCredentials({ user: meData.data, accessToken }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meData]);

  // Keep cart in sync
  const { data: cartData } = useCartQuery();
  useEffect(() => {
    if (cartData?.data) {
      const c = cartData.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapItems = (items: any[]) => items.map((i: any) => ({
        id: i.id,
        quantity: i.quantity,
        unitPrice: i.unit_price ?? i.unitPrice ?? 0,
        lineTotal: i.line_total ?? i.lineTotal ?? 0,
        product: i.product,
        variant: i.variant ?? null,
        isInStock: i.is_in_stock ?? true,
      }));
      dispatch(setCart({
        items: mapItems(c.items ?? []),
        coupon: c.coupon ?? null,
        subtotal: c.subtotal ?? 0,
        discountAmount: c.discount_amount ?? 0,
        shippingCost: c.shipping_cost ?? null,
        taxAmount: c.tax_amount ?? null,
        grandTotal: c.grand_total ?? c.subtotal ?? 0,
        itemCount: c.items?.length ?? 0,
      }));
    }
  }, [cartData, dispatch]);

  // Close mobile menu and target scroll top on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  usePageScrollReveal(pageContentRef, `${location.pathname}${location.search}`);
  usePageScrollReveal(footerRef, `${location.pathname}${location.search}`);

  const handleLogout = async () => {
    try { await logoutMut.mutateAsync(); } catch { /* ignore */ }
    dispatch(clearCredentials());
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `relative px-3 py-2 text-sm font-medium transition-colors ${isActive(path)
      ? 'text-brand-700'
      : 'text-slate-600 hover:text-brand-700'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      {/* Top announcement bar */}
      <div className="bg-brand-800 px-4 py-2 text-center text-xs font-medium text-brand-100">
        🌿 Free shipping on orders above ₹499 &mdash; Freshly handmade with love
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-14 w-14 overflow-hidden sm:h-16 sm:w-16">
              <img src={BRAND_LOGO_SRC} alt="Dhanvanthiri Foods" className="h-full w-full origin-center scale-[1.85] object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Dhanvanthiri
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-brand-600">Foods</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/products" className={navLinkClass('/products')}>
              Products
            </Link>
            <Link to="/blog" className={navLinkClass('/blog')}>
              Blog
            </Link>
            <Link to="/faq" className={navLinkClass('/faq')}>
              FAQ
            </Link>
            <Link to="/pages/about" className={navLinkClass('/pages/about')}>
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Cart"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cart.itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white shadow-sm">
                  {cart.itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden items-center gap-1 md:flex">
                <Link to="/account/orders" className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  Orders
                </Link>
                <Link to="/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {user?.name ?? 'Profile'}
                </Link>
                {user && ['admin', 'super_admin'].includes(user.role) && (
                  <Link to="/admin" className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100">
                    {isItUserRole(user.role) ? 'IT Portal' : 'Admin'}
                  </Link>
                )}
                <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md md:inline-flex">
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white px-4 pb-4 pt-2 md:hidden">
            <nav className="flex flex-col gap-1">
              <Link to="/products" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Products</Link>
              <Link to="/blog" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Blog</Link>
              <Link to="/faq" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">FAQ</Link>
              <Link to="/pages/about" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">About</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/account/orders" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Orders</Link>
                  <Link to="/profile" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Profile</Link>
                  {user && ['admin', 'super_admin'].includes(user.role) && (
                    <Link to="/admin" className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50">
                      {isItUserRole(user.role) ? 'IT Portal' : 'Admin'}
                    </Link>
                  )}
                  <button onClick={handleLogout} className="rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">Logout</button>
                </>
              ) : (
                <Link to="/login" className="mt-1 rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700">
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main key={location.pathname} className="flex-1">
        <div ref={pageContentRef} className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer ref={footerRef} className="border-t border-slate-200/10 bg-[#102F26] text-brand-100 relative z-20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {/* Brand */}
            <div className="lg:col-span-1 animate-on-scroll fade-up">
              <div className="flex items-center gap-2.5">
                <div className="h-24 w-24 overflow-hidden">
                  <img src={BRAND_LOGO_SRC} alt="Dhanvanthiri Foods" className="h-full w-full origin-center scale-[1.9] object-contain" />
                </div>
                <span className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Dhanvanthiri</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-brand-300">
                Traditional South Indian pickles and thokku, handcrafted with authentic family recipes passed down through generations.
              </p>
            </div>

            {/* Shop */}
            <div className="animate-on-scroll fade-up">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-400">Shop</h4>
              <nav className="space-y-2.5 text-sm">
                <Link to="/products" className="block text-brand-200 transition-all duration-200 hover:text-white hover:translate-x-0.5">All Products</Link>
                <Link to="/cart" className="block text-brand-200 transition-all duration-200 hover:text-white hover:translate-x-0.5">Cart</Link>
                <Link to="/faq" className="block text-brand-200 transition-all duration-200 hover:text-white hover:translate-x-0.5">FAQ</Link>
              </nav>
            </div>

            {/* Company */}
            <div className="animate-on-scroll fade-up">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-400">Company</h4>
              <nav className="space-y-2.5 text-sm">
                <Link to="/pages/about" className="block text-brand-200 transition-all duration-200 hover:text-white hover:translate-x-0.5">About Us</Link>
                <Link to="/pages/contact" className="block text-brand-200 transition-all duration-200 hover:text-white hover:translate-x-0.5">Contact</Link>
                <Link to="/blog" className="block text-brand-200 transition-all duration-200 hover:text-white hover:translate-x-0.5">Blog</Link>
              </nav>
            </div>

            {/* Legal */}
            <div className="animate-on-scroll fade-up">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-400">Legal</h4>
              <nav className="space-y-2.5 text-sm">
                <Link to="/pages/shipping-policy" className="block text-brand-200 transition-all duration-200 hover:text-white hover:translate-x-0.5">Shipping Policy</Link>
                <Link to="/pages/refund-policy" className="block text-brand-200 transition-all duration-200 hover:text-white hover:translate-x-0.5">Refund Policy</Link>
                <Link to="/pages/privacy-policy" className="block text-brand-200 transition-all duration-200 hover:text-white hover:translate-x-0.5">Privacy Policy</Link>
                <Link to="/pages/terms-and-conditions" className="block text-brand-200 transition-all duration-200 hover:text-white hover:translate-x-0.5">Terms &amp; Conditions</Link>
              </nav>
            </div>
          </div>

          <div className="mt-12 border-t border-brand-800/60 pt-6 text-center text-xs text-brand-400/80 animate-on-scroll fade-up" data-animate-delay="400ms">
            &copy; {new Date().getFullYear()} Dhanvanthiri Foods. All rights reserved. Made with ❤️ in India.
          </div>
        </div>
      </footer>
    </div>
  );
}
