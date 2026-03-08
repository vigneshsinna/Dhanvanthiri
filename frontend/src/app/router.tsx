import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PrivateRoute, AdminRoute } from '@/components/guards';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { ProfilePage } from '@/features/auth/pages/ProfilePage';
import { SecurityPage } from '@/features/auth/pages/SecurityPage';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { CatalogPage } from '@/features/catalog/pages/CatalogPage';
import { ProductDetailPage } from '@/features/catalog/pages/ProductDetailPage';
import { CartPage } from '@/features/cart/pages/CartPage';
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage';
import { OrderConfirmationPage } from '@/features/payment/pages/OrderConfirmationPage';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { AdminProductsPage } from '@/features/admin/pages/AdminProductsPage';
import { AdminOrdersPage } from '@/features/admin/pages/AdminOrdersPage';
import { AdminCustomersPage } from '@/features/admin/pages/AdminCustomersPage';
import { AdminInventoryPage } from '@/features/admin/pages/AdminInventoryPage';
import { AdminCategoriesPage } from '@/features/admin/pages/AdminCategoriesPage';
import { AdminReviewsPage } from '@/features/admin/pages/AdminReviewsPage';
import { AdminPagesPage } from '@/features/admin/pages/AdminPagesPage';
import { AdminPostsPage } from '@/features/admin/pages/AdminPostsPage';
import { AdminBannersPage } from '@/features/admin/pages/AdminBannersPage';
import { AdminFaqsPage } from '@/features/admin/pages/AdminFaqsPage';
import { AdminMediaPage } from '@/features/admin/pages/AdminMediaPage';
import { AdminSettingsPage } from '@/features/admin/pages/AdminSettingsPage';
import { AdminModulesPage } from '@/features/admin/pages/AdminModulesPage';
import { OrderListPage } from '@/features/orders/pages/OrderListPage';
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage';
import { OrderTrackingPage } from '@/features/orders/pages/OrderTrackingPage';
import { WishlistPage } from '@/features/wishlist/pages/WishlistPage';
import { BlogListPage } from '@/features/cms/pages/BlogListPage';
import { BlogPostPage } from '@/features/cms/pages/BlogPostPage';
import { DynamicPage } from '@/features/cms/pages/DynamicPage';
import { FaqPage } from '@/features/cms/pages/FaqPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <CatalogPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'profile/security',
        element: (
          <PrivateRoute>
            <SecurityPage />
          </PrivateRoute>
        ),
      },
      { path: 'checkout/confirmation', element: <OrderConfirmationPage /> },
      {
        path: 'account/orders',
        element: (
          <PrivateRoute>
            <OrderListPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'account/orders/:orderNumber',
        element: (
          <PrivateRoute>
            <OrderDetailPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <PrivateRoute>
            <WishlistPage />
          </PrivateRoute>
        ),
      },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/:slug', element: <BlogPostPage /> },
      { path: 'pages/about', element: <AboutPage /> },
      { path: 'pages/:slug', element: <DynamicPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'track-order', element: <OrderTrackingPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'inventory', element: <AdminInventoryPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'pages', element: <AdminPagesPage /> },
      { path: 'posts', element: <AdminPostsPage /> },
      { path: 'banners', element: <AdminBannersPage /> },
      { path: 'faqs', element: <AdminFaqsPage /> },
      { path: 'media', element: <AdminMediaPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'modules', element: <AdminModulesPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
