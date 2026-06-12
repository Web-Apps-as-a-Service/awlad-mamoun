"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import Link from "next/link";
import { Bike, Filter, X } from "lucide-react";
import { getFirstImage } from "@/lib/utils";
import { ProductWithCategory, Category } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface FilterValues {
  brands: string[];
  productTypes: string[];
  productSizes: string[];
}

interface ProductsPageProps {
  // Display configuration
  title?: string;
  titleHighlight?: string;
  description?: string;
  showSearch?: boolean;
  showViewAllButton?: boolean;
  viewAllText?: string;
  viewAllHref?: string;

  // Product fetching configuration
  limit?: number;
  categoryId?: string; // For category pages
  featured?: boolean; // Fetch only featured products

  // Layout configuration
  gridCols?: {
    mobile: number;
    desktop: number;
  };

  // Styling configuration
  sectionClassName?: string;
  containerClassName?: string;
  showHeader?: boolean;

  // Loading state
  initialLoading?: boolean;
}

function ProductsPageContent({
  title = "منتجاتنا",
  titleHighlight = "المميزة",
  description = "اكتشف مجموعتنا من العجل وقطع الغيار والإكسسوارات",
  showSearch = false,
  showViewAllButton = true,
  viewAllText = "عرض كل المنتجات",
  viewAllHref = "/products",
  limit = 12,
  categoryId,
  featured = false,
  gridCols = { mobile: 1, desktop: 4 },
  sectionClassName = "py-20 px-4 bg-background",
  containerClassName = "max-w-6xl mx-auto",
  showHeader = true,
  initialLoading = true,
}: ProductsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // Get current filter values from URL
  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const selectedBrand = searchParams.get("brand") || "all";
  const selectedProductType = searchParams.get("product_type") || "all";
  const selectedProductSize = searchParams.get("product_size") || "all";
  const availableOnly = searchParams.get("available") === "true";

  const [filterValues, setFilterValues] = useState<FilterValues>({
    brands: [],
    productTypes: [],
    productSizes: [],
  });
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const gridClassName =
    gridCols.desktop === 4
      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
      : gridCols.desktop === 3
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5"
        : "grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5";

  // Sync search input with URL params
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Update URL when filters change
  const updateURL = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Handle search button click and Enter key
  const handleSearch = () => {
    updateURL({ search: searchInput || null, page: "1" });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch filter values
        const filterRes = await fetch("/api/products?filter_values=true");
        if (filterRes.ok) {
          setFilterValues(await filterRes.json());
        }

        // Fetch categories
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          setCategories(await catRes.json());
        }

        // Fetch products with filters and pagination
        if (featured && !showSearch) {
          // Fetch featured products for homepage
          const response = await fetch(`/api/products?featured=true&limit=${limit}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              setProducts(data);
              setTotalPages(1);
              setTotal(data.length);
            } else {
              // Fallback to latest products if no featured products
              const productParams = new URLSearchParams();
              productParams.append("limit", limit.toString());
              const fallbackResponse = await fetch(`/api/products?${productParams.toString()}`);
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                setProducts(fallbackData.products || fallbackData || []);
                setTotalPages(1);
                setTotal(fallbackData.products?.length || fallbackData?.length || 0);
              }
            }
          } else {
            setError("حدث خطأ في تحميل المنتجات");
          }
        } else {
          // Regular paginated and filtered fetch
          const productParams = new URLSearchParams();
          productParams.append("page", currentPage.toString());
          productParams.append("page_size", limit.toString());

          if (searchQuery) productParams.append("search", searchQuery);
          if (selectedCategory && selectedCategory !== "all") productParams.append("category_id", selectedCategory);
          if (selectedBrand && selectedBrand !== "all") productParams.append("brand", selectedBrand);
          if (selectedProductType && selectedProductType !== "all") productParams.append("product_type", selectedProductType);
          if (selectedProductSize && selectedProductSize !== "all") productParams.append("product_size", selectedProductSize);
          if (availableOnly) productParams.append("is_available", "true");

          const response = await fetch(`/api/products?${productParams.toString()}`);
          if (response.ok) {
            const data = await response.json();
            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
          } else {
            setError("حدث خطأ في تحميل المنتجات");
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("حدث خطأ في تحميل المنتجات");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    currentPage,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedProductType,
    selectedProductSize,
    availableOnly,
    limit,
    featured,
    showSearch,
  ]);

  if (isLoading) {
    return (
      <section className={sectionClassName}>
        <div className={containerClassName}>
          {showHeader && (
            <div className="text-center mb-16">
              <Skeleton className="h-12 w-1/2 mx-auto mb-4 bg-gray-200" />
              <Skeleton className="h-4 w-3/4 mx-auto bg-gray-200" />
            </div>
          )}
          
          {showSearch && (
            <div className="mb-12">
              <Skeleton className="h-12 w-full max-w-xl mx-auto bg-gray-200 rounded-lg" />
            </div>
          )}
          
          <div className={gridClassName}>
            {Array.from({ length: limit || 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-lg overflow-hidden border border-border shadow-sm"
              >
                <Skeleton className="aspect-[4/3] w-full bg-gray-200" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-full bg-gray-200" />
                  <Skeleton className="h-4 w-5/6 bg-gray-200" />
                  <Skeleton className="h-8 w-1/2 bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={sectionClassName}>
        <div className={containerClassName}>
          <div className="text-center py-20">
            <p className="text-red-600 text-lg mb-6">{error}</p>
            <Link
              href={viewAllHref}
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              {viewAllText}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClassName}>
      <div className={containerClassName}>
        {showHeader && (
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {title} <span className="text-primary">{titleHighlight}</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>
        )}

        {showSearch && (
          <div className="mb-12 space-y-6">
            {/* Search Input */}
            <div>
              <div className="flex gap-2 max-w-xl mx-auto">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الماركة..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="flex-1 px-5 py-3 rounded-md border border-border focus:border-primary focus:outline-none text-base text-right bg-card"
                />
                <Button onClick={handleSearch}>
                  بحث
                </Button>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full max-w-sm mx-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    تصفية المنتجات
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader className="text-right mb-6">
                    <div className="flex items-center justify-between">
                      <SheetTitle>تصفية المنتجات</SheetTitle>
                      <Button variant="ghost" size="icon" onClick={() => setIsMobileFilterOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </SheetHeader>

                  <div className="space-y-6 pb-6">
                    {/* Category Filter */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">القسم</label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) => updateURL({ category: value, page: null })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="القسم" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل الأقسام</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Brand Filter */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">الماركة</label>
                      <Select
                        value={selectedBrand}
                        onValueChange={(value) => updateURL({ brand: value, page: null })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="الماركة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل الماركات</SelectItem>
                          {filterValues.brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Product Type Filter */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">النوع</label>
                      <Select
                        value={selectedProductType}
                        onValueChange={(value) => updateURL({ product_type: value, page: null })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل الأنواع</SelectItem>
                          {filterValues.productTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Product Size Filter */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">المقاس</label>
                      <Select
                        value={selectedProductSize}
                        onValueChange={(value) => updateURL({ product_size: value, page: null })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="المقاس" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل المقاسات</SelectItem>
                          {filterValues.productSizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Availability Filter */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">الحالة</label>
                      <Select
                        value={availableOnly ? "true" : "all"}
                        onValueChange={(value) => updateURL({ available: value === "true" ? "true" : null, page: null })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="true">متوفر فقط</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          updateURL({ category: null, brand: null, product_type: null, product_size: null, available: null, page: null });
                          setIsMobileFilterOpen(false);
                        }}
                      >
                        مسح الكل
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setIsMobileFilterOpen(false)}
                      >
                        تطبيق
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Filters */}
            <div className="max-w-6xl mx-auto hidden lg:block">
              <div className="grid grid-cols-5 gap-4">
                {/* Category Filter */}
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => updateURL({ category: value, page: null })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأقسام</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Brand Filter */}
                <Select
                  value={selectedBrand}
                  onValueChange={(value) => updateURL({ brand: value, page: null })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="الماركة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الماركات</SelectItem>
                    {filterValues.brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Product Type Filter */}
                <Select
                  value={selectedProductType}
                  onValueChange={(value) => updateURL({ product_type: value, page: null })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    {filterValues.productTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Product Size Filter */}
                <Select
                  value={selectedProductSize}
                  onValueChange={(value) => updateURL({ product_size: value, page: null })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="المقاس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل المقاسات</SelectItem>
                    {filterValues.productSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Availability Filter */}
                <Select
                  value={availableOnly ? "true" : "all"}
                  onValueChange={(value) => updateURL({ available: value === "true" ? "true" : null, page: null })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="true">متوفر فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display (Desktop) */}
            <div className="hidden lg:block max-w-6xl mx-auto">
              {(selectedCategory !== "all" || selectedBrand !== "all" || selectedProductType !== "all" || selectedProductSize !== "all" || availableOnly) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategory !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateURL({ category: null, page: null })}
                      className="h-8"
                    >
                      القسم ×
                    </Button>
                  )}
                  {selectedBrand !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateURL({ brand: null, page: null })}
                      className="h-8"
                    >
                      الماركة ×
                    </Button>
                  )}
                  {selectedProductType !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateURL({ product_type: null, page: null })}
                      className="h-8"
                    >
                      النوع ×
                    </Button>
                  )}
                  {selectedProductSize !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateURL({ product_size: null, page: null })}
                      className="h-8"
                    >
                      المقاس ×
                    </Button>
                  )}
                  {availableOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateURL({ available: null, page: null })}
                      className="h-8"
                    >
                      متوفر فقط ×
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateURL({ category: null, brand: null, product_type: null, product_size: null, available: null, page: null })}
                    className="h-8 text-muted-foreground"
                  >
                    مسح الكل
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-6">
              لا توجد منتجات مطابقة
            </p>
            {showViewAllButton && (
              <Link
                href={viewAllHref}
                className="inline-block bg-primary text-primary-foreground px-7 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
              >
                {viewAllText}
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={gridClassName}>
              {products.map((product, index) => {
                const image = getFirstImage(product);

                return (
                  <div
                    key={product.id}
                    className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover-lift transition animate-fade-in-up flex flex-col"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Mobile Card */}
                    <div className="lg:hidden flex flex-col h-full">
                      <div className="aspect-square bg-secondary border-b border-border">
                        {image ? (
                          <img
                            src={image}
                            alt={product.title}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Bike className="text-primary" size={32} />
                          </div>
                        )}
                      </div>

                      <div className="p-3 text-right flex flex-col flex-1">
                        <h3 className="text-sm font-bold text-foreground mb-1 leading-snug line-clamp-2">
                          {product.title}
                        </h3>

                        {product.product_size && (
                          <p className="text-xs text-muted-foreground mb-2">
                            مقاس {product.product_size}
                          </p>
                        )}

                        {product.price_before_discount && (
                          <p className="text-xs line-through opacity-60 text-muted-foreground mb-1">
                            {product.price_before_discount.toFixed(0)} ج.م
                          </p>
                        )}

                        {product.price && (
                          <p className="text-base font-bold text-primary mb-2">
                            {product.price.toFixed(0)} ج.م
                          </p>
                        )}

                        {product.is_available !== undefined && (
                          <div className="mb-2">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                product.is_available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.is_available ? "متوفر" : "غير متوفر"}
                            </span>
                          </div>
                        )}

                        <Button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="w-full bg-primary text-primary-foreground py-2 text-sm rounded-md hover:bg-primary/90 transition-colors"
                        >
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>

                    {/* Desktop Card */}
                    <div className="hidden lg:flex flex-col h-full">
                      <div className="aspect-[4/3] bg-secondary border-b border-border">
                        {image ? (
                          <img
                            src={image}
                            alt={product.title}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Bike className="text-primary" size={48} />
                          </div>
                        )}
                      </div>

                      <div className="p-4 text-right flex flex-col flex-1">
                        <h3 className="text-base md:text-lg font-bold text-foreground mb-1 leading-snug">
                          {product.title}
                        </h3>

                        {/* Product Metadata: Size • Type */}
                        {(product.product_size || product.product_type) && (
                          <div className="text-xs text-muted-foreground mb-2">
                            {product.product_size && <span>{product.product_size}</span>}
                            {product.product_size && product.product_type && <span> • </span>}
                            {product.product_type && <span>{product.product_type}</span>}
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                          {product.description}
                        </p>

                        {product.price_before_discount && (
                          <p className="text-sm line-through opacity-50 font-semibold text-muted-foreground mb-1">
                            {product.price_before_discount.toFixed(2)} ج.م
                          </p>
                        )}

                        {product.price && (
                          <p className="text-lg md:text-xl font-bold text-primary mb-3">
                            {product.price.toFixed(2)} ج.م
                          </p>
                        )}

                        {product.is_available !== undefined && (
                          <div className="mb-3">
                            <span
                              className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${
                                product.is_available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.is_available ? "متوفر" : "غير متوفر"}
                            </span>
                          </div>
                        )}

                        <Button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:bg-primary/90 transition-colors"
                        >
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-2">
                <div className="text-sm text-muted-foreground">
                  صفحة {currentPage} من {totalPages} ({total} منتج)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateURL({ page: currentPage > 1 ? (currentPage - 1).toString() : null })}
                    disabled={currentPage === 1}
                  >
                    السابق
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className="min-w-[2.5rem]"
                              onClick={() => updateURL({ page: page.toString() })}
                            >
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateURL({ page: currentPage < totalPages ? (currentPage + 1).toString() : null })}
                    disabled={currentPage === totalPages}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}

            {showViewAllButton && !categoryId && (
              <div className="text-center mt-12">
                <Link
                  href={viewAllHref}
                  className="inline-block bg-primary text-primary-foreground px-7 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
                >
                  {viewAllText}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default function ProductsPage(props: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsPageSkeleton {...props} />}>
      <ProductsPageContent {...props} />
    </Suspense>
  );
}

function ProductsPageSkeleton(props: ProductsPageProps) {
  const { showHeader, showSearch, limit = 8, gridCols = { mobile: 1, desktop: 4 } } = props;

  const gridClassName =
    gridCols.desktop === 4
      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
      : gridCols.desktop === 3
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5"
        : "grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5";

  return (
    <section className={props.sectionClassName || "py-20 px-4 bg-background"}>
      <div className={props.containerClassName || "max-w-6xl mx-auto"}>
        {showHeader && (
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-1/2 mx-auto mb-4 bg-gray-200" />
            <Skeleton className="h-4 w-3/4 mx-auto bg-gray-200" />
          </div>
        )}

        {showSearch && (
          <div className="mb-12">
            <Skeleton className="h-12 w-full max-w-xl mx-auto bg-gray-200 rounded-lg" />
          </div>
        )}

        <div className={gridClassName}>
          {Array.from({ length: limit || 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-card rounded-lg overflow-hidden border border-border shadow-sm"
            >
              <Skeleton className="aspect-[4/3] w-full bg-gray-200" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4 bg-gray-200" />
                <Skeleton className="h-4 w-full bg-gray-200" />
                <Skeleton className="h-4 w-5/6 bg-gray-200" />
                <Skeleton className="h-8 w-1/2 bg-gray-200" />
                <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
