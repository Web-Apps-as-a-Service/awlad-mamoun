"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bike } from "lucide-react";
import { getFirstImage } from "@/lib/utils";
import { getRecentlyViewed, RecentlyViewedProduct } from "@/lib/recentlyViewed";
import { X } from "lucide-react";

interface RecentlyViewedProps {
  currentProductId: string;
}

export default function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  // Filter out current product
  const filteredProducts = recentlyViewed.filter((item) => item.id !== currentProductId);

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-right">
          شاهدتها مؤخراً
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
          {filteredProducts.map((product, index) => {
            const image = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null;

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
                    <h3 className="text-xs font-bold text-foreground mb-1 leading-snug line-clamp-2">
                      {product.title}
                    </h3>

                    {product.price && (
                      <p className="text-sm font-bold text-primary">
                        {product.price.toFixed(0)} ج.م
                      </p>
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
