const RECENTLY_VIEWED_KEY = "recentlyViewed";
const MAX_RECENTLY_VIEWED = 6;

export interface RecentlyViewedProduct {
  id: string;
  title: string;
  price: number | null;
  image_urls: string[];
  viewedAt: number;
}

export const getRecentlyViewed = (): RecentlyViewedProduct[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!stored) return [];
    
    const items: RecentlyViewedProduct[] = JSON.parse(stored);
    return items.sort((a, b) => b.viewedAt - a.viewedAt);
  } catch (error) {
    console.error("Failed to get recently viewed:", error);
    return [];
  }
};

export const addRecentlyViewed = (product: {
  id: string;
  title: string;
  price: number | null;
  image_urls: string[];
}): void => {
  if (typeof window === "undefined") return;

  try {
    const items = getRecentlyViewed();
    const newItem: RecentlyViewedProduct = {
      ...product,
      viewedAt: Date.now(),
    };

    // Remove if already exists (to update viewedAt)
    const filtered = items.filter((item) => item.id !== product.id);

    // Add new item at the beginning
    filtered.unshift(newItem);

    // Keep only the most recent MAX_RECENTLY_VIEWED items
    const trimmed = filtered.slice(0, MAX_RECENTLY_VIEWED);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to add recently viewed:", error);
  }
};

export const removeRecentlyViewed = (productId: string): void => {
  if (typeof window === "undefined") return;

  try {
    const items = getRecentlyViewed();
    const filtered = items.filter((item) => item.id !== productId);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to remove recently viewed:", error);
  }
};
