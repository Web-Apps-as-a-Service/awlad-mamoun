"use client";

import { Bike, ShieldCheck, ShoppingBag, Wrench } from "lucide-react";

export default function Hero() {
  const handleScrollToProducts = () => {
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    { icon: Bike, label: "عجل لكل الاستخدامات" },
    { icon: Wrench, label: "قطع غيار موثوقة" },
    { icon: ShoppingBag, label: "إكسسوارات عملية" },
  ];

  return (
    <section id="hero" className="bg-background px-4 py-14 md:py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
        <div className="space-y-7 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-semibold text-primary">
            <ShieldCheck size={18} />
            خليك في المضمون مع أولاد مأمون
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              عجل وقطع غيار وإكسسوارات
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-primary">
              من أولاد مأمون
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              كل ما يخص العجل وقطع الغيار والإكسسوارات في مكان واحد.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleScrollToProducts}
              className="bg-primary text-primary-foreground px-7 py-3 rounded-md hover:bg-primary/90 transition-colors font-semibold text-center"
            >
              عرض المنتجات
            </button>
          </div>
        </div>

        <div className="animate-scale-in">
          <div className="rounded-lg border border-border bg-secondary p-5 shadow-sm">
            <div className="aspect-[4/3] rounded-md bg-background border border-border flex items-center justify-center">
              <div className="text-center space-y-4">
                <img
                  src="/logo.jpg"
                  alt="أولاد مأمون"
                  className="mx-auto h-28 w-auto object-contain"
                />
                <div>
                  <p className="text-xl font-bold text-foreground">أولاد مأمون</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    عجل، قطع غيار، وإكسسوارات
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.label} className="rounded-md bg-card border border-border p-4 text-center">
                    <Icon className="mx-auto mb-2 text-primary" size={24} />
                    <p className="text-sm font-semibold text-foreground">{feature.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
