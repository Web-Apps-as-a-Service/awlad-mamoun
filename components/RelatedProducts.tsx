"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { Bike } from "lucide-react";
import { getFirstImage } from "@/lib/utils";
import { ProductWithCategory } from "@/types";

interface RelatedProductsProps {
  productId: string;
  categoryId?: string | null;
  brand?: string | null;
  limit?: number;
}

export default function RelatedProducts({
  productId,
  categoryId,
  brand,
  limit = 4,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.append("related", "true");
        params.append("product_id", productId);
        params.append("limit", limit.toString());
        if (categoryId) params.append("category_id", categoryId);
        if (brand) params.append("brand", brand);

        const response = await fetch(`/api/products?${params.toString()}`);
        if (response.ok) {
          const data: ProductWithCategory[] = await response.json();
          setProducts(data);
        } else {
          setError("حدث خطأ في تحميل المنتجات المشابهة");
        }
      } catch (error) {
        console.error("Failed to fetch related products:", error);
        setError("حدث خطأ في تحميل المنتجات المشابهة");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, categoryId, brand, limit]);

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-right">
            منتجات مشابهة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="bg-card rounded-lg overflow-hidden border border-border shadow-sm">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-full bg-gray-200" />
                  <Skeleton className="h-8 w-1/2 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-right">
          منتجات مشابهة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {products.map((product, index) => {
            const image = getFirstImage(product);

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group"
              >
                <div
                  className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover-lift transition animate-fade-in-up flex flex-col h-full"
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
                    <h3 className="text-sm md:text-base font-bold text-foreground mb-2 leading-snug line-clamp-2">
                      {product.title}
                    </h3>

                    {product.price_before_discount && (
                      <p className="text-xs line-through opacity-50 font-semibold text-muted-foreground mb-1">
                        {product.price_before_discount.toFixed(0)} ج.م
                      </p>
                    )}

                    {product.price && (
                      <p className="text-base md:text-lg font-bold text-primary mb-2">
                        {product.price.toFixed(0)} ج.م
                      </p>
                    )}

                    {product.is_available !== undefined && (
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-[10px] font-semibold ${
                          product.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.is_available ? "متوفر" : "غير متوفر"}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
