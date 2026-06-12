import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  getLimitedProducts,
  getProductsByCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  getFilteredAndPaginatedProducts,
  getProductFilterValues,
  getFeaturedProducts,
  getRelatedProducts,
} from "@/lib/storage";

/**
 * GET /api/products
 * Fetch products with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const pageSize = searchParams.get("page_size");
    const search = searchParams.get("search");
    const brand = searchParams.get("brand");
    const productType = searchParams.get("product_type");
    const productSize = searchParams.get("product_size");
    const isAvailable = searchParams.get("is_available");
    const filterValues = searchParams.get("filter_values");
    const featured = searchParams.get("featured");
    const related = searchParams.get("related");
    const relatedProductId = searchParams.get("product_id");
    const relatedCategoryId = searchParams.get("category_id");
    const relatedBrand = searchParams.get("brand");

    // Return filter values if requested
    if (filterValues === "true") {
      const values = await getProductFilterValues();
      return NextResponse.json(values, { status: 200 });
    }

    // Return featured products if requested
    if (featured === "true") {
      const products = await getFeaturedProducts(limit ? parseInt(limit) : 4);
      return NextResponse.json(products, { status: 200 });
    }

    // Return related products if requested
    if (related === "true" && relatedProductId) {
      const products = await getRelatedProducts(
        relatedProductId,
        relatedCategoryId || undefined,
        relatedBrand || undefined,
        limit ? parseInt(limit) : 4
      );
      return NextResponse.json(products, { status: 200 });
    }

    // Legacy support for category_id and limit (for backward compatibility)
    if (categoryId && !page && !search && !brand && !productType && !productSize) {
      const products = await getProductsByCategory(categoryId);
      return NextResponse.json(products, { status: 200 });
    }

    if (limit && !page && !search && !brand && !productType && !productSize) {
      const limitNum = parseInt(limit);
      const products = await getLimitedProducts(limitNum);
      return NextResponse.json(products, { status: 200 });
    }

    // New paginated and filtered endpoint
    const result = await getFilteredAndPaginatedProducts({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      search: search || undefined,
      categoryId: categoryId || undefined,
      brand: brand || undefined,
      productType: productType || undefined,
      productSize: productSize || undefined,
      isAvailable: isAvailable ? isAvailable === "true" : undefined,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/products error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to fetch products: ${errorMessage}` }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Create new product
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // -------- Validation --------
    if (!data.title || typeof data.title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // if (data.price === undefined || isNaN(Number(data.price))) {
    //   return NextResponse.json(
    //     { error: "Valid price is required" },
    //     { status: 400 }
    //   );
    // }

    if (!Array.isArray(data.image_urls) || data.image_urls.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // -------- Normalize payload --------
    const productData = {
      title: data.title,
      description: data.description ?? "",
      price: data.price !== null && data.price !== undefined ? Number(data.price) : null,
      price_before_discount: data.price_before_discount !== null && data.price_before_discount !== undefined ? Number(data.price_before_discount) : null,
      image_urls: data.image_urls,
      specs: Array.isArray(data.specs) ? data.specs : [],
      category_id: data.category_id || null,
      brand: data.brand || null,
      product_type: data.product_type || null,
      product_size: data.product_size || null,
      is_available: data.is_available !== undefined ? data.is_available : true,
      is_featured: data.is_featured !== undefined ? data.is_featured : false,
    };

    const product = await addProduct(productData);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json(
      {
        error: `Failed to create product: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products?id=UUID
 * Update existing product
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Optional validation (only if fields exist)
    if (
      data.image_urls &&
      (!Array.isArray(data.image_urls) || data.image_urls.length === 0)
    ) {
      return NextResponse.json(
        { error: "image_urls must be a non-empty array" },
        { status: 400 }
      );
    }

    const updated = await updateProduct(id, {
      title: data.title,
      description: data.description,
      price: data.price !== null && data.price !== undefined ? Number(data.price) : null,
      price_before_discount: data.price_before_discount !== null && data.price_before_discount !== undefined ? Number(data.price_before_discount) : null,
      image_urls: data.image_urls,
      specs: Array.isArray(data.specs) ? data.specs : undefined,
      category_id: data.category_id !== undefined ? data.category_id : undefined,
      brand: data.brand !== undefined ? data.brand : undefined,
      product_type: data.product_type !== undefined ? data.product_type : undefined,
      product_size: data.product_size !== undefined ? data.product_size : undefined,
      is_available: data.is_available !== undefined ? data.is_available : undefined,
      is_featured: data.is_featured !== undefined ? data.is_featured : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/products error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update product: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products?id=UUID
 * Delete product
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteProduct(id);

    if (!success) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete product: ${errorMessage}` },
      { status: 500 }
    );
  }
}
