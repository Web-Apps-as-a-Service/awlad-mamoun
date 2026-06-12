import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  getLimitedProducts,
  getProductsByCategory,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/storage";

/**
 * GET /api/products
 * Fetch all products, products by category, or limited products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const limit = searchParams.get("limit");

    let products;

    if (categoryId) {
      products = await getProductsByCategory(categoryId);
    } else if (limit) {
      const limitNum = parseInt(limit);
      products = await getLimitedProducts(limitNum);
    } else {
      products = await getProducts();
    }

    return NextResponse.json(products, { status: 200 });
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
