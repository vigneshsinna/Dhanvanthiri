<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Http\Controllers\AuthController;
use App\Modules\Auth\Http\Controllers\ProfileController;
use App\Modules\Auth\Http\Controllers\OAuthController;
use App\Modules\Catalog\Http\Controllers\CategoryController;
use App\Modules\Catalog\Http\Controllers\ProductController;
use App\Modules\Catalog\Http\Controllers\ReviewController;
use App\Modules\Catalog\Http\Controllers\AdminProductController;
use App\Modules\Catalog\Http\Controllers\AdminCategoryController;
use App\Modules\Catalog\Http\Controllers\AdminReviewController;
use App\Modules\CartCheckout\Http\Controllers\CartController;
use App\Modules\CartCheckout\Http\Controllers\AddressController;
use App\Modules\CartCheckout\Http\Controllers\CheckoutController;
use App\Modules\CartCheckout\Http\Controllers\GuestCheckoutController;
use App\Modules\Payment\Http\Controllers\PaymentController;
use App\Modules\Payment\Http\Controllers\GuestPaymentController;
use App\Modules\Payment\Http\Controllers\WebhookController;
use App\Modules\Payment\Http\Controllers\AdminRefundController;
use App\Modules\Payment\Http\Controllers\AdminPaymentController;
use App\Modules\OrderManagement\Http\Controllers\OrderController;
use App\Modules\OrderManagement\Http\Controllers\GuestOrderController;
use App\Modules\OrderManagement\Http\Controllers\ReturnRequestController;
use App\Modules\OrderManagement\Http\Controllers\AdminOrderController;
use App\Modules\OrderManagement\Http\Controllers\AdminShipmentController;
use App\Modules\OrderManagement\Http\Controllers\AdminReturnController;
use App\Modules\Catalog\Http\Controllers\WishlistController;
use App\Modules\Catalog\Http\Controllers\RecommendationController;
use App\Modules\CMS\Http\Controllers\PageController;
use App\Modules\CMS\Http\Controllers\PostController;
use App\Modules\CMS\Http\Controllers\BannerController;
use App\Modules\CMS\Http\Controllers\FaqController;
use App\Modules\CMS\Http\Controllers\MenuController;
use App\Modules\CMS\Http\Controllers\SeoController;
use App\Modules\CMS\Http\Controllers\AdminPageController;
use App\Modules\CMS\Http\Controllers\AdminPostController;
use App\Modules\CMS\Http\Controllers\AdminPostCategoryController;
use App\Modules\CMS\Http\Controllers\AdminBannerController;
use App\Modules\CMS\Http\Controllers\AdminFaqController;
use App\Modules\CMS\Http\Controllers\AdminMenuController;
use App\Modules\CMS\Http\Controllers\AdminMediaController;
use App\Modules\CMS\Http\Controllers\AdminSeoController;
use App\Modules\Admin\Http\Controllers\DashboardController;
use App\Modules\Admin\Http\Controllers\AnalyticsController;
use App\Modules\Admin\Http\Controllers\InventoryController;
use App\Modules\Admin\Http\Controllers\AdminCustomerController;
use App\Modules\Admin\Http\Controllers\SettingsController;
use App\Modules\Admin\Http\Controllers\AdminNotificationController;
use App\Modules\Admin\Http\Controllers\ActivityLogController;
use App\Modules\Admin\Http\Controllers\AdminUserController;
use App\Modules\Admin\Http\Controllers\ExportController;
use App\Modules\Admin\Http\Controllers\ModuleLicenseController;

Route::prefix('auth')->group(function () {
    // Auth public (cookie refresh remains public)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth-login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail']);
    Route::get('/{provider}/redirect', [OAuthController::class, 'redirect']);
    Route::get('/{provider}/callback', [OAuthController::class, 'callback']);

    Route::middleware('auth:api')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Catalog public
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/recommendations', [RecommendationController::class, 'index'])->middleware('module.enabled:recommendation_engine');
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);

// Cart public/guest
Route::middleware('cart.session')->group(function () {
    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{id}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{id}', [CartController::class, 'removeItem']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::post('/cart/coupon', [CartController::class, 'applyCoupon']);
    Route::delete('/cart/coupon', [CartController::class, 'removeCoupon']);
    Route::get('/cart/shipping-rates', [CartController::class, 'shippingRates']);
});

// CMS public
Route::get('/pages/{slug}', [PageController::class, 'show']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{slug}', [PostController::class, 'show']);
Route::get('/posts/category/{slug}', [PostController::class, 'byCategory']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/menus/{location}', [MenuController::class, 'show']);
Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);
Route::get('/robots.txt', [SeoController::class, 'robots']);

// Payment webhooks (public)
Route::post('/webhooks/razorpay', [WebhookController::class, 'razorpay'])->name('webhook.razorpay');

// Guest checkout (no auth, uses cart token)
Route::middleware('cart.session')->prefix('guest')->group(function () {
    Route::post('/checkout/validate', [GuestCheckoutController::class, 'validateCheckout']);
    Route::post('/checkout/summary', [GuestCheckoutController::class, 'summary']);
    Route::post('/payments/intent', [GuestPaymentController::class, 'createIntent'])->middleware('idempotency');
    Route::post('/payments/confirm', [GuestPaymentController::class, 'confirmPayment']);
});

// Guest order tracking (public, verifies by order number + email/phone)
Route::post('/orders/track', [GuestOrderController::class, 'track'])->middleware('throttle:10,1');

// Product recommendations route is registered above /products/{slug} to avoid shadowing

Route::middleware('auth:api')->group(function () {
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);
    Route::delete('/profile', [ProfileController::class, 'deleteAccount']);

    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    Route::post('/cart/merge', [CartController::class, 'mergeGuestCart']);
    Route::apiResource('addresses', AddressController::class);
    Route::put('/addresses/{id}/default', [AddressController::class, 'setDefault']);

    // Wishlist
    Route::middleware('module.enabled:wishlist')->group(function () {
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);
    });

    Route::post('/checkout/validate', [CheckoutController::class, 'validateCheckout']);
    Route::post('/checkout/summary', [CheckoutController::class, 'summary']);

    Route::post('/payments/intent', [PaymentController::class, 'createIntent'])->middleware('idempotency');
    Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);
    Route::get('/payments/{orderId}', [PaymentController::class, 'show']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::get('/orders/{id}/invoice', [OrderController::class, 'downloadInvoice']);
    Route::get('/orders/{id}/tracking', [OrderController::class, 'tracking']);
    Route::post('/orders/{id}/returns', [ReturnRequestController::class, 'store']);
    Route::get('/orders/{id}/returns', [ReturnRequestController::class, 'index']);
});

Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('categories', AdminCategoryController::class);
    Route::apiResource('products', AdminProductController::class);
    Route::post('/products/{id}/images', [AdminProductController::class, 'uploadImages']);
    Route::delete('/products/images/{id}', [AdminProductController::class, 'deleteImage']);
    Route::put('/products/{id}/variants', [AdminProductController::class, 'syncVariants']);
    Route::put('/reviews/{id}/status', [AdminReviewController::class, 'updateStatus']);
    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);

    Route::post('/orders/{id}/refund', [AdminRefundController::class, 'process'])->middleware('idempotency');
    Route::get('/payments', [AdminPaymentController::class, 'index']);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/shipment', [AdminShipmentController::class, 'store']);
    Route::put('/shipments/{id}', [AdminShipmentController::class, 'update']);
    Route::post('/shipments/{id}/events', [AdminShipmentController::class, 'addEvent']);
    Route::get('/returns', [AdminReturnController::class, 'index']);
    Route::put('/returns/{id}', [AdminReturnController::class, 'update']);

    Route::apiResource('pages', AdminPageController::class);
    Route::apiResource('posts', AdminPostController::class);
    Route::apiResource('post-categories', AdminPostCategoryController::class);
    Route::apiResource('banners', AdminBannerController::class);
    Route::apiResource('faqs', AdminFaqController::class);
    Route::apiResource('menus', AdminMenuController::class);
    Route::put('/menus/{id}/items', [AdminMenuController::class, 'syncItems']);
    Route::post('/media', [AdminMediaController::class, 'upload']);
    Route::get('/media', [AdminMediaController::class, 'index']);
    Route::delete('/media/{id}', [AdminMediaController::class, 'destroy']);
    Route::post('/seo/analysis', [AdminSeoController::class, 'analyze']);

    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('/analytics/revenue', [AnalyticsController::class, 'revenue']);
    Route::get('/analytics/orders', [AnalyticsController::class, 'orders']);
    Route::get('/analytics/customers', [AnalyticsController::class, 'customers']);
    Route::get('/analytics/products', [AnalyticsController::class, 'products']);
    Route::post('/analytics/export', [AnalyticsController::class, 'export']);
    Route::get('/exports/{id}', [ExportController::class, 'show']);

    Route::get('/customers', [AdminCustomerController::class, 'index']);
    Route::get('/customers/{id}', [AdminCustomerController::class, 'show']);
    Route::put('/customers/{id}', [AdminCustomerController::class, 'update']);
    Route::put('/customers/{id}/status', [AdminCustomerController::class, 'toggleStatus']);

    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::put('/inventory/{variantId}', [InventoryController::class, 'update']);
    Route::get('/inventory/alerts', [InventoryController::class, 'alerts']);
    Route::post('/inventory/bulk-update', [InventoryController::class, 'bulkUpdate']);

    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings', [SettingsController::class, 'update']);

    Route::get('/notifications', [AdminNotificationController::class, 'index']);
    Route::put('/notifications/read-all', [AdminNotificationController::class, 'markAllRead']);
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);

    Route::get('/modules', [ModuleLicenseController::class, 'index']);
    Route::get('/modules/{id}', [ModuleLicenseController::class, 'show']);
    Route::post('/modules/{id}/activation-request', [ModuleLicenseController::class, 'requestActivation']);

    Route::middleware('role:super_admin')->group(function () {
        Route::get('/admins', [AdminUserController::class, 'index']);
        Route::post('/admins', [AdminUserController::class, 'store']);
        Route::put('/admins/{id}', [AdminUserController::class, 'update']);
        Route::delete('/admins/{id}', [AdminUserController::class, 'destroy']);

        Route::post('/modules', [ModuleLicenseController::class, 'store']);
        Route::put('/modules/{id}', [ModuleLicenseController::class, 'update']);
        Route::put('/modules/{id}/toggle', [ModuleLicenseController::class, 'toggle']);
        Route::post('/modules/{id}/validate-license', [ModuleLicenseController::class, 'validateLicense']);
        Route::put('/modules/{id}/credentials', [ModuleLicenseController::class, 'updateCredentials']);
        Route::get('/modules/{id}/health', [ModuleLicenseController::class, 'health']);
    });
});

