"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bike, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import RelatedProducts from "@/components/RelatedProducts";
import RecentlyViewed from "@/components/RecentlyViewed";
import ShareButton from "@/components/ShareButton";
import { addRecentlyViewed } from "@/lib/recentlyViewed";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) throw new Error("Invalid product id");

        const res = await fetch(`/api/products/${id}`);
        if (res.status === 404) {
          setError("المنتج غير موجود");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }

        const data: Product = await res.json();
        setProduct(data);

        // Add to recently viewed
        addRecentlyViewed({
          id: data.id,
          title: data.title,
          price: data.price,
          image_urls: data.image_urls,
        });
      } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء تحميل المنتج");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground text-right">
        <Header />
        <section className="py-20 px-4 bg-background">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-[500px] rounded-xl" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background text-foreground text-right">
        <Header />
        <section className="py-20 px-4 text-center">
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/products")}>
            العودة للمنتجات
          </Button>
        </section>
        <Footer />
      </div>
    );
  }

  const images = product.image_urls || [];
  const hasImages = images.length > 0;

  //whats app link for details.
  const openWhatsApp = () => {
    const phone = "201277491077";
  
    const message = `السلام عليكم، عايز تفاصيل عن ${product.title} 👋

    ${window.location.href}
    `;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };


  return (
    <div className="min-h-screen bg-background text-foreground text-right">
      <Header />

      <section className="py-14 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back */}
          <button
            onClick={() => router.push("/products")}
            className="mb-8 text-primary font-semibold"
          >
            ← العودة للمنتجات
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            {/* Images */}
            <div className="flex flex-col gap-4">
              <div className="relative h-[360px] md:h-[500px] rounded-lg bg-secondary border border-border overflow-hidden">
                {hasImages ? (
                  <img
                    src={images[activeImage]}
                    alt={product.title}
                    className="w-full h-full object-contain p-3"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Bike className="text-primary" size={72} />
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImage((i) =>
                          i === 0 ? images.length - 1 : i - 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/90 p-2 rounded-full border border-border"
                    >
                      <ChevronRight />
                    </button>

                    <button
                      onClick={() =>
                        setActiveImage((i) =>
                          i === images.length - 1 ? 0 : i + 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/90 p-2 rounded-full border border-border"
                    >
                      <ChevronLeft />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-foreground/80 text-background px-3 py-1 rounded-md text-sm">
                      {activeImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((img: any, i: any) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        i === activeImage
                          ? "border-primary"
                          : "border-border"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${i}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-right bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-5">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.title}</h1>
                <ShareButton title={product.title} url={typeof window !== "undefined" ? window.location.href : `/products/${product.id}`} />
              </div>

             {product.price_before_discount  && (
              <p className="text-lg font-bold line-through decoration-2 text-muted-foreground opacity-60 mb-2">
                {product.price_before_discount.toFixed(2)} ج.م
              </p>
              )}

              {product.price  && (
              <p className="text-3xl font-bold text-primary mb-8">
                {product.price.toFixed(2)} ج.م
              </p>
              )}

              {/* New Product Fields */}
              {product.brand && (
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground">الماركة: </span>
                  <span className="font-semibold">{product.brand}</span>
                </div>
              )}

              {product.product_type && (
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground">النوع: </span>
                  <span className="font-semibold">{product.product_type}</span>
                </div>
              )}

              {product.product_size && (
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground">المقاس: </span>
                  <span className="font-semibold">{product.product_size}</span>
                </div>
              )}

              {product.is_available !== undefined && (
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">الحالة: </span>
                  <span className={`font-semibold ${product.is_available ? "text-green-600" : "text-red-600"}`}>
                    {product.is_available ? "متوفر" : "غير متوفر"}
                  </span>
                </div>
              )}

              {product.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">الوصف</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.specs.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-semibold mb-3">المواصفات</h2>
                  <ul className="space-y-2">
                    {product.specs.map((s: any, i: any) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

             <button
               onClick={openWhatsApp}
               className="block w-full bg-primary text-primary-foreground py-4 rounded-md text-lg text-center hover:bg-primary/90 transition-colors"
             >
               استفسر الآن
             </button>
             
            </div>
          </div>
        </div>
      </section>

      <RelatedProducts
        productId={product.id}
        categoryId={product.category_id}
        brand={product.brand || undefined}
        limit={4}
      />

      <RecentlyViewed currentProductId={product.id} />

      <Footer />
    </div>
  );
}
