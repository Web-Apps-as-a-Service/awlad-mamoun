"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@/types";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch");
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (e) {
        console.error("Failed to fetch categories", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) => {
    const q = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground text-right">
      <Header />

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-5">
             <span className="text-primary">أولاد مأمون</span>
             <br />
              الأقسام 
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              استكشف أقسام العجل وقطع الغيار والإكسسوارات المتنوعة
            </p>
          </div>

          {/* <div className="mb-12">
            <input
              type="text"
              placeholder="ابحث عن قسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xl mx-auto block px-5 py-3 rounded-md border border-border focus:border-primary focus:outline-none text-base text-right bg-card"
            />
          </div> */}

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-border shadow-sm">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && categories.length === 0 && (
            <p className="text-center text-muted-foreground">
              لا توجد أقسام متاحة حالياً
            </p>
          )}

          {!isLoading && filteredCategories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredCategories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group"
                >
                  <div
                    className="bg-card p-6 rounded-lg border border-border shadow-sm hover-lift animate-fade-in-up transition-all duration-300 cursor-pointer h-full"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 rounded-md bg-secondary border border-border flex items-center justify-center mb-5 group-hover:border-primary transition-colors">
                      <span className="text-2xl">{category.icon || "🚲"}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
