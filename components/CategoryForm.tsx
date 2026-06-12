"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Category } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, "اسم القسم مطلوب"),
});

type CategoryFormData = z.infer<typeof formSchema>;

export default function CategoryForm({
  onSubmit,
  isLoading,
  initialData,
  isEditMode,
}: {
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isLoading: boolean;
  initialData?: Category | null;
  isEditMode: boolean;
}) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
        }
      : {
          name: "",
        },
  });

  const onFormSubmit = async (values: CategoryFormData) => {
    try {
      await onSubmit(values);
      if (!isEditMode) {
        form.reset();
      }
    } catch (err) {
      console.error("Form submission error:", err);
      if (toast.error) {
        toast.error("حدث خطأ ما");
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className="flex flex-col h-full max-w-2xl mx-auto"
      >
        <div className="flex-1 overflow-y-auto pr-2 pl-4 py-2 space-y-6 max-h-[65vh] custom-scrollbar">
          <div className="space-y-4 text-right">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground">
                    اسم القسم
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-11 text-base"
                      placeholder="مثال: قطع غيار"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="pt-6 mt-4 border-t border-border">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-bold rounded-xl shadow-lg shadow-accent/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isEditMode ? (
              "حفظ التغييرات"
            ) : (
              "إضافة الفئة"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
