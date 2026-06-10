"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsPage from "@/components/ProductsPage";

export default function ProductsPageApp() {
  return (
    <div className="min-h-screen bg-background text-foreground text-right">
      <Header />
      
      <main>
        <ProductsPage
          title="جميع"
          titleHighlight="المنتجات"
          description="اكتشف مجموعتنا الكاملة من العجل وقطع الغيار والإكسسوارات"
          limit={15}
          gridCols={{ mobile: 2, desktop: 4 }}
          showSearch={true}
          showViewAllButton={false}
          sectionClassName="py-20 px-4 bg-background"
          containerClassName="max-w-6xl mx-auto"
        />
      </main>
      
      <Footer />
    </div>
  );
}
