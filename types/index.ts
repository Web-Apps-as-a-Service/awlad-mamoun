export interface Product {
  id: string;
  title: string;
  description: string;
  price_before_discount: number | null;
  price: number | null;
  image_urls: string[];
  specs: string[];
  created_at: string;
  updated_at: string;
  category_id?: string | null;
  brand?: string | null;
  product_type?: string | null;
  product_size?: string | null;
  is_available?: boolean | null;
}

export interface ProductInsert {
  title: string;
  description?: string;
  price: number | null;
  price_before_discount: number | null;
  image_urls: string[];
  specs: string[];
  category_id?: string | null;
  brand?: string | null;
  product_type?: string | null;
  product_size?: string | null;
  is_available?: boolean | null;
}

export interface Category {
  title: string;
  id: string;
  name: string;
  icon: string;
  // title: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryInsert {
  name: string;
  icon: string;
}

export interface ProductWithCategory extends Product {
  category?: Category | null;
}
