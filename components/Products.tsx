"use client";

import ProductsPage from "./ProductsPage";

export default function Products() {
  return (
    <ProductsPage
      title="اختيارات من"
      titleHighlight="المعرض"
      description="نماذج من العجل وقطع الغيار والإكسسوارات المتاحة لدى أولاد مأمون"
      limit={4}
      gridCols={{ mobile: 2, desktop: 4 }}
      showSearch={false}
      showViewAllButton={true}
      viewAllText="عرض كل المنتجات"
      viewAllHref="/products"
      sectionClassName="py-20 px-4 bg-background"
      containerClassName="max-w-6xl mx-auto"
    />
  );
}
