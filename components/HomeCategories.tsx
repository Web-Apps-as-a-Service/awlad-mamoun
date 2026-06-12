"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { Category } from "@/types";

export default function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data: Category[] = await response.json();
          setCategories(data.slice(0, 4)); // Show max 4 categories
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Hide section if categories count <= 1
  if (!isLoading && categories.length <= 1) {
    return null;
  }

  if (isLoading) {
    return (
      <section id="categories" className="py-20 px-4 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-1/2 mx-auto mb-4 bg-gray-200" />
            <Skeleton className="h-4 w-3/4 mx-auto bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="bg-card p-6 rounded-lg border border-border shadow-sm">
                <Skeleton className="h-12 w-12 mb-4 bg-gray-200 rounded" />
                <Skeleton className="h-6 w-3/4 mb-3 bg-gray-200" />
                <Skeleton className="h-4 w-full mb-4 bg-gray-200" />
                <Skeleton className="h-1 w-12 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-20 px-4 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            أقسام <span className="text-primary">أولاد مأمون</span>
          </h2>
          {/* <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            تصفح العجل وقطع الغيار والإكسسوارات بطريقة واضحة وسريعة.
          </p> */}
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-6">
              لا توجد أقسام متاحة حالياً
            </p>
            <Link
              href="/products"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              عرض جميع المنتجات
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {categories.slice(0, 3).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="group"
                >
                  <div
                    className="bg-card p-6 rounded-lg border border-border shadow-sm hover-lift animate-fade-in-up transition-all duration-300 cursor-pointer h-full"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {/* <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      استكشف منتجات قسم {category.name}
                    </p> */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-1 bg-primary rounded-full"></div>
                      <span className="text-primary font-medium text-sm">
                        عرض المنتجات ←
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
