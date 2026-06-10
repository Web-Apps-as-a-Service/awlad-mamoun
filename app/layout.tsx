import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "أولاد مأمون - عجل وقطع غيار الدراجات",
  description:
    "أولاد مأمون - متخصصون في بيع العجل وقطع الغيار والإكسسوارات. خليك في المضمون مع أولاد مأمون. أفضل جودة وأسعار منافسة.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
