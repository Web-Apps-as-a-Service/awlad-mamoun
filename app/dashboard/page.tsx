"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ProductForm from "@/components/ProductForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Trash2, Plus, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { getFirstImage } from "@/lib/utils";
import { Product, Category } from "@/types";

export default function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);


  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      toast.error("فشل تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch {
      toast.error("فشل تحميل الأقسام");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setProducts((p) => p.filter((x) => x.id !== id));
      toast.success("تم الحذف بنجاح");
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || p.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background text-foreground text-right">
      <Header />

      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
            <p className="text-sm text-muted-foreground">عرض وتعديل المنتجات</p>
          </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="بحث بالاسم أو الماركة..."
                className="pr-10 h-10 border border-border rounded-lg px-3 w-full sm:w-64 bg-card"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 h-10">
                <SelectValue placeholder="تصفية حسب القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المنتجات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/categories")}
              className="w-full sm:w-auto"
            >
              <Package className="w-4 h-4 mr-1" /> الأقسام
            </Button>
            <Button onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" /> إضافة
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          {/* Mobile View - Cards */}
          <div className="md:hidden">
            {loading ? (
              <div className="p-8 text-center">
                <p>جاري التحميل...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">لا توجد منتجات مطابقة</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((product) => {
                  const image = getFirstImage(product);
                  return (
                    <div key={product.id} className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-20 h-20 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="text-muted-foreground" size={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm mb-1 truncate">{product.title}</h3>
                          {product.brand && (
                            <p className="text-xs text-muted-foreground">الماركة: {product.brand}</p>
                          )}
                          {product.product_type && (
                            <p className="text-xs text-muted-foreground">النوع: {product.product_type}</p>
                          )}
                          {product.product_size && (
                            <p className="text-xs text-muted-foreground">المقاس: {product.product_size}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          {product.price_before_discount && (
                            <span className="text-xs text-muted-foreground line-through">
                              {product.price_before_discount} ج.م
                            </span>
                          )}
                          <span className="font-semibold text-primary">
                            {product.price ? `${product.price} ج.م` : "-"}
                          </span>
                        </div>

                        {product.is_available !== undefined && (
                          <span
                            className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${
                              product.is_available
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.is_available ? "متوفر" : "غير متوفر"}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4 ml-1" /> تعديل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-500 hover:text-red-600"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="w-4 h-4 ml-1" /> حذف
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop/Tablet View - Table */}
          <div className="hidden md:block">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b">
                  <th className="p-4">المنتج</th>
                  <th className="p-4">الماركة</th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      لا توجد منتجات مطابقة
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const image = getFirstImage(product);

                    return (
                      <tr key={product.id} className="border-b">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-secondary overflow-hidden">
                            {image ? (
                              <img
                                src={image}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-full h-full p-2 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">{product.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {product.description}
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="text-sm">{product.brand || "-"}</span>
                        </td>

                        <td className="p-4">
                          <span className="text-sm">{product.product_type || "-"}</span>
                        </td>

                        <td className="p-4">
                          {product.is_available !== undefined ? (
                            <span
                              className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${
                                product.is_available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.is_available ? "متوفر" : "غير متوفر"}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {product.price_before_discount ? (
                              <span className="text-sm text-muted-foreground line-through">
                                {product.price_before_discount}
                              </span>
                            ) : (
                              ""
                            )}

                            <span className="font-semibold">
                              {product.price ? `${product.price} ج.م` : "-"}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsEditOpen(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteTarget(product)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add product form*/}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>إضافة منتج</DialogTitle>
            </DialogHeader>
            <ProductForm
              isEditMode={false}
              onSubmit={async (data: any) => {
                try {
                  const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (!res.ok) {
                    const errorData = await res.json();
                    toast.error(errorData.error || "فشل إضافة المنتج");
                    return;
                  }
                  toast.success("تم إضافة المنتج بنجاح");
                  setIsAddOpen(false);
                  fetchProducts();
                } catch (error) {
                  console.error("Add product error:", error);
                  toast.error("حدث خطأ ما");
                }
              }}
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>

        {/* Edit */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>تعديل المنتج</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <ProductForm
                isEditMode
                initialData={editingProduct}
                isLoading={loading}
                onSubmit={async (data: any) => {
                  try {
                    const res = await fetch(`/api/products?id=${editingProduct.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(data),
                    });
                    if (!res.ok) {
                      const errorData = await res.json();
                      toast.error(errorData.error || "فشل تعديل المنتج");
                      return;
                    }
                    toast.success("تم تعديل المنتج بنجاح");
                    setIsEditOpen(false);
                    setEditingProduct(null);
                    fetchProducts();
                  } catch (error) {
                    console.error("Edit product error:", error);
                    toast.error("حدث خطأ ما");
                  }
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
         <DialogContent className="w-[95vw] max-w-md pt-10">
           <DialogHeader>
             <DialogTitle className="text-right">
               تأكيد الحذف
             </DialogTitle>
           </DialogHeader>
       
          <p className="text-sm text-muted-foreground text-right leading-relaxed">
            هل أنت متأكد إنك عايز تحذف المنتج؟
          </p>
          
          {/* <p className="text-sm font-bold text-right mt-2 text-gray-900">
            {deleteTarget?.title}
          </p> */}
       
           <div className="flex gap-2 mt-6">
             <Button
               variant="outline"
               className="flex-1"
               onClick={() => setDeleteTarget(null)}
             >
               إلغاء
             </Button>
       
             <Button
               variant="destructive"
               className="flex-1"
               onClick={() => {
                 handleDelete(deleteTarget!.id);
                 setDeleteTarget(null);
               }}
             >
               حذف
             </Button>
           </div>
         </DialogContent>
       </Dialog>

      </main>
    </div>
  );
}
