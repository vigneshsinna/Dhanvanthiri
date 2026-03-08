const STORAGE_KEY = 'dhanvanthiri_recently_viewed';
const MAX_ITEMS = 20;

export interface RecentlyViewedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  viewedAt: number;
}

export function getRecentlyViewed(): RecentlyViewedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentlyViewedProduct[];
  } catch {
    return [];
  }
}

export function addToRecentlyViewed(product: Omit<RecentlyViewedProduct, 'viewedAt'>): void {
  const items = getRecentlyViewed().filter((p) => p.id !== product.id);
  items.unshift({ ...product, viewedAt: Date.now() });
  if (items.length > MAX_ITEMS) items.length = MAX_ITEMS;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

export function clearRecentlyViewed(): void {
  localStorage.removeItem(STORAGE_KEY);
}
