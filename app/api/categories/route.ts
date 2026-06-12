import { NextRequest, NextResponse } from "next/server";
import {
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/storage";

/**
 * GET /api/categories
 * Fetch all categories or single category by ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Fetch single category by ID
      const category = await getCategoryById(id);
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json(category, { status: 200 });
    } else {
      // Fetch all categories
      const categories = await getCategories();
      return NextResponse.json(categories, { status: 200 });
    }
  } catch (error) {
    console.error("GET /api/categories error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to fetch categories: ${errorMessage}` }, { status: 500 });
  }
}

/**
 * POST /api/categories
 * Create new category
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // -------- Validation --------
    if (!data.name || typeof data.name !== "string") {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // -------- Normalize payload --------
    const categoryData = {
      name: data.name,
    };

    const category = await addCategory(categoryData);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json(
      {
        error: `Failed to create category: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories?id=UUID
 * Update existing category
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();

    const updated = await updateCategory(id, {
      name: data.name,
    });

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/categories error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update category: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories?id=UUID
 * Delete category
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteCategory(id);

    if (!success) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/categories error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete category: ${errorMessage}` },
      { status: 500 }
    );
  }
}
