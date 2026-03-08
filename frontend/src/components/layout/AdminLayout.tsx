import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/lib/utils/hooks';
import { clearCredentials } from '@/features/auth/store/authSlice';
import { useRef } from 'react';
import { usePageScrollReveal } from '@/lib/utils/usePageScrollReveal';
import { getRoleDisplayName, isItUserRole } from '@/features/auth/roleDisplay';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: 'DB' },
  { label: 'Products', path: '/admin/products', icon: 'PR' },
  { label: 'Categories', path: '/admin/categories', icon: 'CT' },
  { label: 'Orders', path: '/admin/orders', icon: 'OR' },
  { label: 'Customers', path: '/admin/customers', icon: 'CU' },
  { label: 'Inventory', path: '/admin/inventory', icon: 'IN' },
  { label: 'Reviews', path: '/admin/reviews', icon: 'RV' },
  { label: 'Pages', path: '/admin/pages', icon: 'PG' },
  { label: 'Posts', path: '/admin/posts', icon: 'PO' },
  { label: 'Banners', path: '/admin/banners', icon: 'BN' },
  { label: 'FAQs', path: '/admin/faqs', icon: 'FQ' },
  { label: 'Media', path: '/admin/media', icon: 'MD' },
  { label: 'Module Licenses', path: '/admin/modules', icon: 'LM' },
  { label: 'Settings', path: '/admin/settings', icon: 'ST' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isItUser = isItUserRole(user?.role);
  const pageContentRef = useRef<HTMLElement>(null);

  usePageScrollReveal(pageContentRef, `${location.pathname}${location.search}`);

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen grid-cols-[220px_1fr]">
        <aside className="sticky top-0 flex h-screen flex-col border-r bg-slate-900 text-white">
          <div className="border-b border-slate-700 px-4 py-4">
            <Link to="/admin" className="text-lg font-bold text-brand-400">Dhanvanthiri</Link>
            <p className="mt-0.5 text-xs text-slate-400">{isItUser ? 'IT User Portal' : 'Admin Portal'}</p>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="inline-flex w-5 justify-center text-[10px] font-semibold">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-700 px-4 py-3">
            <p className="truncate text-sm text-slate-300">{user?.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">Role: {getRoleDisplayName(user?.role)}</p>
            <div className="mt-2 flex gap-2">
              <Link to="/" className="text-xs text-slate-400 hover:text-white">View Store</Link>
              <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-white">Logout</button>
            </div>
          </div>
        </aside>

        <main ref={pageContentRef} className="overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
