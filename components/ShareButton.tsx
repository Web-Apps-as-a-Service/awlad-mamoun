"use client";

import { Share2, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  url: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title,
      url: url,
    };

    // Try Web Share API first (mobile support)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("تمت المشاركة بنجاح");
        return;
      } catch (error) {
        // User cancelled or error occurred, fall back to clipboard
        console.log("Web Share API failed or cancelled, falling back to clipboard");
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("تم نسخ الرابط");
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("فشل نسخ الرابط");
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="icon"
      className="relative"
      aria-label="مشاركة المنتج"
    >
      {copied ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <Share2 className="h-5 w-5" />
      )}
    </Button>
  );
}
