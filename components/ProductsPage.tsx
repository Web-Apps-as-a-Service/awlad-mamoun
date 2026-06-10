"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import Link from "next/link";
import { Bike } from "lucide-react";
import { getFirstImage } from "@/lib/utils";
import { ProductWithCategory } from "@/types";

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

export default function ProductsPage({
  title = "منتجاتنا",
  titleHighlight = "المميزة",
  description = "اكتشف مجموعتنا من العجل وقطع الغيار والإكسسوارات",
  showSearch = false,
  showViewAllButton = true,
  viewAllText = "عرض كل المنتجات",
  viewAllHref = "/products",
  limit = 8,
  categoryId,
  gridCols = { mobile: 1, desktop: 4 },
  sectionClassName = "py-20 px-4 bg-background",
  containerClassName = "max-w-6xl mx-auto",
  showHeader = true,
  initialLoading = true,
}: ProductsPageProps) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const gridClassName =
    gridCols.desktop === 4
      ? "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
      : gridCols.desktop === 3
        ? "grid grid-cols-1 md:grid-cols-3 gap-5"
        : "grid grid-cols-1 md:grid-cols-2 gap-5";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (categoryId) {
          params.append('category_id', categoryId);
        }
        
        if (limit) {
          params.append('limit', limit.toString());
        }
        
        const response = await fetch(`/api/products?${params.toString()}`);
        if (response.ok) {
          const data: ProductWithCategory[] = await response.json();
          setProducts(data);
        } else {
          setError("حدث خطأ في تحميل المنتجات");
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("حدث خطأ في تحميل المنتجات");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, limit]);

  const filteredProducts = products.filter((product) => {
    if (!showSearch || !searchQuery) return true;
    
    const q = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.specs.some((s: any) => s.toLowerCase().includes(q))
    );
  });

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
          <div className="mb-12">
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xl mx-auto block px-5 py-3 rounded-md border border-border focus:border-primary focus:outline-none text-base text-right bg-card"
            />
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-6">
              {searchQuery ? "لا توجد منتجات مطابقة للبحث" : "لا توجد منتجات متاحة حالياً"}
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
              {filteredProducts.map((product, index) => {
                const image = getFirstImage(product);

                return (
                  <div
                    key={product.id}
                    className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover-lift transition animate-fade-in-up flex flex-col"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
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
                      <h3 className="text-base md:text-lg font-bold text-foreground mb-2 leading-snug">
                        {product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2 flex-1">
                        {product.description}
                      </p>

                      {product.price_before_discount && (
                        <p className="text-sm line-through opacity-50 font-semibold text-muted-foreground">
                          {product.price_before_discount.toFixed(2)} ج.م
                        </p>
                      )}

                      {product.price && (
                        <p className="text-lg md:text-xl font-bold text-primary mb-4">
                          {product.price.toFixed(2)} ج.م
                        </p>
                      )}

                      <Button
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:bg-primary/90 transition-colors"
                      >
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

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
