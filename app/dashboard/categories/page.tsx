"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CategoryForm from "@/components/CategoryForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit2, Trash2, Plus, Tag, Search } from "lucide-react";
import { toast } from "sonner";
import { Category } from "@/types";

export default function CategoriesDashboard() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error();
      setCategories(await res.json());
    } catch {
      toast.error("فشل تحميل الأقسام");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/categories?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCategories((c) => c.filter((x) => x.id !== id));
      toast.success("تم الحذف بنجاح");
    } else {
      const errorData = await res.json();
      toast.error(errorData.error || "فشل الحذف");
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground text-right">
      <Header />

      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">إدارة الأقسام</h1>
            <p className="text-sm text-muted-foreground">عرض وتعديل الأقسام</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="بحث..."
                className="pr-10 h-10 border border-border rounded-lg px-3 w-full sm:w-auto bg-card"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> إضافة قسم
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            ← العودة للمنتجات
          </Button>
        </div>

        <Card>
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="p-4">الفئة</th>
                <th className="p-4">الوصف</th>
                <th className="p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    لا توجد أقسام متاحة
                  </td>
                </tr>
              ) : (
                filtered.map((category) => (
                  <tr key={category.id} className="border-b">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-secondary overflow-hidden flex items-center justify-center">
                        <Tag className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-bold">{category.name}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingCategory(category);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteTarget(category)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* Add category form */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>إضافة قسم</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={async (data) => {
                try {
                  const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (!res.ok) {
                    const errorData = await res.json();
                    toast.error(errorData.error || "فشل إضافة القسم");
                    return;
                  }
                  toast.success("تم إضافة القسم بنجاح");
                  setIsAddOpen(false);
                  fetchCategories();
                } catch (error) {
                  console.error("Add category error:", error);
                  toast.error("حدث خطأ ما");
                }
              }}
              isLoading={false}
              isEditMode={false}
            />
          </DialogContent>
        </Dialog>

        {/* Edit category form */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>تعديل القسم</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <CategoryForm
                initialData={editingCategory}
                onSubmit={async (data) => {
                  try {
                    const res = await fetch(`/api/categories?id=${editingCategory.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(data),
                    });
                    if (!res.ok) {
                      const errorData = await res.json();
                      toast.error(errorData.error || "فشل تعديل القسم");
                      return;
                    }
                    toast.success("تم تعديل القسم بنجاح");
                    setIsEditOpen(false);
                    setEditingCategory(null);
                    fetchCategories();
                  } catch (error) {
                    console.error("Edit category error:", error);
                    toast.error("حدث خطأ ما");
                  }
                }}
                isLoading={false}
                isEditMode={true}
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
              هل أنت متأكد أنك تريد حذف القسم؟
            </p>

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
