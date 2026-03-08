import { describe, it, expect } from 'vitest';
import { queryKeys } from './keys';

describe('queryKeys', () => {
  describe('auth', () => {
    it('has me key', () => {
      expect(queryKeys.auth.me).toEqual(['auth', 'me']);
    });
  });

  describe('catalog', () => {
    it('generates products key with params', () => {
      const key = queryKeys.catalog.products({ page: 1 });
      expect(key).toEqual(['catalog', 'products', { page: 1 }]);
    });

    it('generates product key with slug', () => {
      expect(queryKeys.catalog.product('poondu-thokku')).toEqual(
        ['catalog', 'product', 'poondu-thokku']
      );
    });

    it('has categories key', () => {
      expect(queryKeys.catalog.categories).toEqual(['catalog', 'categories']);
    });

    it('has featured key', () => {
      expect(queryKeys.catalog.featured).toEqual(['catalog', 'featured']);
    });

    it('generates reviews key with product id', () => {
      expect(queryKeys.catalog.reviews(5)).toEqual(['catalog', 'reviews', 5]);
    });
  });

  describe('cart', () => {
    it('has current cart key', () => {
      expect(queryKeys.cart.current).toEqual(['cart', 'current']);
    });

    it('generates shipping rates key', () => {
      expect(queryKeys.cart.shippingRates(3)).toEqual(['cart', 'shippingRates', 3]);
    });
  });

  describe('checkout', () => {
    it('has summary key', () => {
      expect(queryKeys.checkout.summary).toEqual(['checkout', 'summary']);
    });

    it('has addresses key', () => {
      expect(queryKeys.checkout.addresses).toEqual(['checkout', 'addresses']);
    });
  });

  describe('orders', () => {
    it('generates list key', () => {
      expect(queryKeys.orders.list({ page: 1 })).toEqual(['orders', 'list', { page: 1 }]);
    });

    it('generates detail key', () => {
      expect(queryKeys.orders.detail('ORD-123')).toEqual(['orders', 'detail', 'ORD-123']);
    });
  });

  describe('cms', () => {
    it('generates posts key', () => {
      expect(queryKeys.cms.posts({ page: 1 })).toEqual(['cms', 'posts', { page: 1 }]);
    });

    it('generates post key', () => {
      expect(queryKeys.cms.post('test')).toEqual(['cms', 'post', 'test']);
    });

    it('has faqs key', () => {
      expect(queryKeys.cms.faqs).toEqual(['cms', 'faqs']);
    });

    it('generates banners key', () => {
      expect(queryKeys.cms.banners('home_hero')).toEqual(['cms', 'banners', 'home_hero']);
    });
  });

  describe('admin', () => {
    it('generates dashboard key with period', () => {
      expect(queryKeys.admin.dashboard('month')).toEqual(['admin', 'dashboard', 'month']);
    });

    it('generates analytics key', () => {
      expect(queryKeys.admin.analytics('revenue', { period: 'week' })).toEqual(
        ['admin', 'analytics', 'revenue', { period: 'week' }]
      );
    });
  });
});
