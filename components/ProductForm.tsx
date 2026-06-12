"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Upload, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { uploadProductImage } from "@/lib/storage";
import { toast } from "sonner";
import { Category, Product } from "@/types";

const formSchema = z.object({
  title: z.string().min(2, "الاسم مطلوب"),
  description: z.string().optional(),
  price: z.string().refine((val) => !val || !isNaN(Number(val)) && Number(val) >= 0, {
    message: "يرجى إدخال رقم صحيح أو ترك الحقل فارغاً",
  }).optional(),
  price_before_discount: z.string().refine((val) => !val || !isNaN(Number(val)) && Number(val) >= 0, {
    message: "يرجى إدخال رقم صحيح أو ترك الحقل فارغاً",
  }).optional(),
  category_id: z.string().optional(),
  specs: z
    .array(z.object({ value: z.string() }))
    .min(1, "أضف ميزة واحدة على الأقل"),
  brand: z.string().optional(),
  product_type: z.string().optional(),
  product_size: z.string().optional(),
  is_available: z.boolean(),
  is_featured: z.boolean(),
});

type ProductFormData = z.infer<typeof formSchema>;

// Helper to normalize image_urls from database (could be array or JSON string)
const normalizeImageUrls = (images: any): string[] => {
  if (Array.isArray(images)) {
    return images;
  }
  if (typeof images === "string" && images.startsWith("[")) {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

export default function ProductForm({
  onSubmit,
  isLoading,
  initialData,
  isEditMode,
}: {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  initialData?: Product | null;
  isEditMode: boolean;
}) {

  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    normalizeImageUrls(initialData?.image_urls || [])
  );
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    if (!isClient) return;
    
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data: Category[] = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isClient]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          price: initialData.price?.toString() || "",
          price_before_discount: initialData.price_before_discount?.toString() || "",
          specs: initialData.specs && initialData.specs.length > 0 
            ? initialData.specs.map((s: string) => ({ value: s }))
            : [{ value: "" }],
          category_id: initialData.category_id || "none",
          brand: initialData.brand || "",
          product_type: initialData.product_type || "",
          product_size: initialData.product_size || "",
          is_available: initialData.is_available ?? true,
          is_featured: initialData.is_featured ?? false,
        }
      : {
          title: "",
          description: "",
          price: "",
          price_before_discount: "",
          category_id: "none",
          specs: [{ value: "" }],
          brand: "",
          product_type: "",
          product_size: "",
          is_available: true,
          is_featured: false,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specs",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const onFormSubmit = async (values: ProductFormData) => {
    try {
      setIsUploading(true);

      // Validate that we have at least one image
      const totalImages = existingImageUrls.length + selectedFiles.length;
      if (totalImages === 0) {
        if (toast.error) {
          toast.error("يجب إضافة صورة واحدة على الأقل");
        }
        setIsUploading(false);
        return;
      }

      let finalImageUrls: string[] = [...existingImageUrls];

      // Upload only new selected files
      for (const file of selectedFiles) {
        const uploadedUrl = await uploadProductImage(file);
        if (uploadedUrl) {
          finalImageUrls.push(uploadedUrl);
        }
      }

      const formattedData = {
        ...values,
        image_urls: finalImageUrls,
        specs: values.specs.map((s) => s.value).filter((s) => s.trim() !== ""),
        category_id: values.category_id === "none" ? null : values.category_id,
        // Convert empty price strings to null, valid numbers to number
        price: values.price && values.price.trim() !== "" ? Number(values.price) : null,
        price_before_discount: values.price_before_discount && values.price_before_discount.trim() !== "" ? Number(values.price_before_discount) : null,
        // Handle optional fields
        brand: values.brand && values.brand.trim() !== "" ? values.brand : null,
        product_type: values.product_type && values.product_type.trim() !== "" ? values.product_type : null,
        product_size: values.product_size && values.product_size.trim() !== "" ? values.product_size : null,
        is_available: values.is_available,
        is_featured: values.is_featured,
      };

      await onSubmit(formattedData);

      // Reset form after successful submission
      setExistingImageUrls([]);
      setNewImagePreviews([]);
      setSelectedFiles([]);
    } catch (err) {
      console.error("Form submission error:", err);
      if (toast.error) {
        toast.error("حدث خطأ ما");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className="flex flex-col h-full max-w-2xl mx-auto"
      >
        {/* SCROLLABLE AREA: max-h-[60vh] ensures it fits nicely in dialogs */}
        <div className="flex-1 overflow-y-auto pr-2 pl-4 py-2 space-y-6 max-h-[65vh] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Section */}
            <div className="md:col-span-5">
              <FormLabel className="text-sm font-semibold text-foreground mb-2 block text-right">
                صور المنتج
              </FormLabel>

              {/* Upload Area */}
              <div className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-border bg-secondary hover:bg-card transition-all overflow-hidden group mb-4">
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">اختر صور</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Images Grid - Existing Images */}
              {existingImageUrls.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-right">
                    الصور الموجودة
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {existingImageUrls.map((preview, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                      >
                        <img
                          src={preview}
                          alt={`Existing ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute top-1 right-1 p-1.5 bg-white shadow-md rounded-full text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Grid - New Images */}
              {newImagePreviews.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-right">
                    صور جديدة
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {newImagePreviews.map((preview, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                      >
                        <img
                          src={preview}
                          alt={`New ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, false)}
                          className="absolute top-1 right-1 p-1.5 bg-white shadow-md rounded-full text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="md:col-span-7 space-y-4 text-right">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">
                      اسم المنتج
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11 text-base"
                        placeholder="مثال: عجلة مقاس 26"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">
                      الفئة (اختياري)
                    </FormLabel>
                    {isClient ? (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 text-base">
                            <SelectValue placeholder="اختر فئة..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">لا توجد فئة</SelectItem>
                          {isLoadingCategories ? (
                            <SelectItem value="loading" disabled>
                              جاري التحميل...
                            </SelectItem>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <div className="h-11 text-base border border-input rounded-md bg-background px-3 py-2">
                          اختر فئة...
                        </div>
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="price_before_discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">
                     (اختياري) السعر  قبل الخصم (ج.م)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="h-11 text-base"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">
                      السعر (ج.م)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="h-11 text-base"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">
                      الماركة (اختياري)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11 text-base"
                        placeholder="مثال: Trinx"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">
                      النوع (اختياري)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11 text-base"
                        placeholder="مثال: جبلي"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">
                      المقاس (اختياري)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11 text-base"
                        placeholder="مثال: 26"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold text-foreground">
                        الحالة
                      </FormLabel>
                      <div className="text-xs">
                        {field.value ? (
                          <span className="text-green-600 font-medium">متوفر</span>
                        ) : (
                          <span className="text-red-600 font-medium">غير متوفر</span>
                        )}
                      </div>
                    </div>
                    <FormControl>
                      <div dir="ltr">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold text-foreground">
                        منتج مميز
                      </FormLabel>
                      <div className="text-xs">
                        {field.value ? (
                          <span className="text-yellow-600 font-medium">نعم ⭐</span>
                        ) : (
                          <span className="text-muted-foreground font-medium">لا</span>
                        )}
                      </div>
                    </div>
                    <FormControl>
                      <div dir="ltr">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-sm font-semibold text-gray-700">
                  الوصف
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    className="text-base min-h-[100px] resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Specs Section - This grows as you add items */}
          <div className="space-y-3 p-4 bg-secondary rounded-xl border border-border text-right">
            <div className="flex items-center justify-between">
              <FormLabel className="text-sm font-bold text-foreground">
                المواصفات
              </FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: "" })}
                className="h-9 px-4 text-sm font-medium text-accent border-accent/20 hover:bg-accent/10"
              >
                <Plus className="w-4 h-4 ml-1.5" /> إضافة ميزة
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 items-start animate-in fade-in slide-in-from-top-1"
                >
                  <FormField
                    control={form.control}
                    name={`specs.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 text-sm bg-card border-border"
                            placeholder={`أدخل ميزة المنتج...`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="h-10 w-10 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STICKY FOOTER: Stays visible at the bottom of the dialog */}
        <div className="pt-6 mt-4 border-t border-border">
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-bold rounded-xl shadow-lg shadow-accent/20"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isEditMode ? (
              "حفظ التغييرات"
            ) : (
              "إضافة المنتج"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
