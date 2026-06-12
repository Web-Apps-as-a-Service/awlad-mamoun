import { createClient } from "@supabase/supabase-js";
import { supabaseBrowser } from "./supabase";
import { ProductInsert, CategoryInsert } from "@/types";
import { v4 as uuidv4 } from "uuid";
import {APP_ID} from "./app-config";


/**
 * Creates a server-only Supabase client with service role
 * ONLY call this in API routes or server components
 */
function getServerClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/* -------------------- Client-safe upload -------------------- */
export async function uploadProductImage(file: File): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  // const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabaseBrowser.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabaseBrowser.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/* -------------------- Server-only CRUD -------------------- */
export async function getProducts() {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*").eq("app_id", APP_ID)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLimitedProducts(limit: number = 15) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("app_id", APP_ID)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("app_id", APP_ID)
    .single();
  if (error) return null;
  return data;
}

export async function addProduct(product: ProductInsert) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...product,
      app_id: APP_ID,
      })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<ProductInsert>
) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .eq("app_id", APP_ID)
    .select()
    .single();
  if (error) return null;
  return data;
}
export async function deleteProduct(id: string) {
  const supabase = getServerClient();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image_urls")
    .eq("id", id)
    .eq("app_id", APP_ID)
    .single();

  if (fetchError) return false;
  if (!product) return false;

  if (product.image_urls?.length > 0) {
    const filePaths: string[] = [];

    for (const url of product.image_urls) {
      try {
        const urlObj = new URL(url);

        const pathSegments = urlObj.pathname.split("/");

        const productImagesIndex = pathSegments.indexOf("product-images");

        if (productImagesIndex !== -1) {
          const relativePath = pathSegments
            .slice(productImagesIndex + 1)
            .join("/");
          filePaths.push(relativePath);

          console.log(`Extracted path from URL ${url}: ${relativePath}`);
        } else {
          console.warn(`Could not find "product-images" in URL: ${url}`);
        }
      } catch (error) {
        console.error(`Error parsing URL ${url}:`, error);
      }
    }

    if (filePaths.length > 0) {
      try {
        const { data: deleteData, error: deleteError } = await supabase.storage
          .from("product-images")
          .remove(filePaths);

        if (deleteError) {
          console.error("Error deleting images:", deleteError);
        } else {
          console.log("Successfully deleted images:", deleteData);
        }
      } catch (storageError) {
        console.error("Storage deletion error:", storageError);
      }
    }
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  return !error;
}

/* -------------------- Category CRUD -------------------- */
export async function getCategories() {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("app_id", APP_ID)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCategoryById(id: string) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .eq("app_id", APP_ID)
    .single();
  if (error) return null;
  return data;
}

export async function addCategory(category: CategoryInsert) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      ...category,
      app_id: APP_ID,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  updates: Partial<CategoryInsert>
) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .eq("app_id", APP_ID)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteCategory(id: string) {
  const supabase = getServerClient();
  const { error } = await supabase.from("categories").delete().eq("id", id).eq("app_id", APP_ID);
  return !error;
}

export async function getProductsByCategory(categoryId: string) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq("category_id", categoryId)
    .eq("app_id", APP_ID)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getFeaturedProducts(limit: number = 4) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq("is_featured", true)
    .eq("app_id", APP_ID)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getRelatedProducts(productId: string, categoryId?: string | null, brand?: string | null, limit: number = 4) {
  const supabase = getServerClient();
  let query = supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .neq("id", productId)
    .eq("app_id", APP_ID);

  // If category is available, prioritize products from same category
  if (categoryId) {
    query = query.eq("category_id", categoryId);
    // If brand is also available, prioritize same brand
    if (brand) {
      query = query.eq("brand", brand);
    }
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  
  // If we got no results from category/brand filter, try without brand
  if ((!data || data.length === 0) && categoryId && brand) {
    const fallbackQuery = supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .neq("id", productId)
      .eq("app_id", APP_ID)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false })
      .limit(limit);
    const { data: fallbackData, error: fallbackError } = await fallbackQuery;
    if (fallbackError) throw fallbackError;
    return fallbackData;
  }

  // If still no results, get latest products from any category
  if (!data || data.length === 0) {
    const latestQuery = supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .neq("id", productId)
      .eq("app_id", APP_ID)
      .order("created_at", { ascending: false })
      .limit(limit);
    const { data: latestData, error: latestError } = await latestQuery;
    if (latestError) throw latestError;
    return latestData;
  }

  return data;
}

/* -------------------- Filtered and Paginated Products -------------------- */
export async function getFilteredAndPaginatedProducts(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  brand?: string;
  productType?: string;
  productSize?: string;
  isAvailable?: boolean;
}) {
  const supabase = getServerClient();
  const {
    page = 1,
    pageSize = 20,
    search,
    categoryId,
    brand,
    productType,
    productSize,
    isAvailable,
  } = params;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(
      `
      *,
      categories (
        id,
        name
      )
    `,
      { count: "exact" }
    )
    .eq("app_id", APP_ID);

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,brand.ilike.%${search}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (brand) {
    query = query.eq("brand", brand);
  }

  if (productType) {
    query = query.eq("product_type", productType);
  }

  if (productSize) {
    query = query.eq("product_size", productSize);
  }

  if (isAvailable !== undefined) {
    query = query.eq("is_available", isAvailable);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    products: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/* -------------------- Filter Values -------------------- */
export async function getProductFilterValues() {
  const supabase = getServerClient();

  // Get unique brands
  const { data: brandsData, error: brandsError } = await supabase
    .from("products")
    .select("brand")
    .not("brand", "is", null)
    .eq("app_id", APP_ID);

  if (brandsError) throw brandsError;

  const brands = [
    ...new Set(
      brandsData
        .map((p) => p.brand)
        .filter((b): b is string => b !== null && b !== undefined)
    ),
  ].sort();

  // Get unique product types
  const { data: typesData, error: typesError } = await supabase
    .from("products")
    .select("product_type")
    .not("product_type", "is", null)
    .eq("app_id", APP_ID);

  if (typesError) throw typesError;

  const productTypes = [
    ...new Set(
      typesData
        .map((p) => p.product_type)
        .filter((t): t is string => t !== null && t !== undefined)
    ),
  ].sort();

  // Get unique product sizes
  const { data: sizesData, error: sizesError } = await supabase
    .from("products")
    .select("product_size")
    .not("product_size", "is", null)
    .eq("app_id", APP_ID);

  if (sizesError) throw sizesError;

  const productSizes = [
    ...new Set(
      sizesData
        .map((p) => p.product_size)
        .filter((s): s is string => s !== null && s !== undefined)
    ),
  ].sort();

  return {
    brands,
    productTypes,
    productSizes,
  };
}
