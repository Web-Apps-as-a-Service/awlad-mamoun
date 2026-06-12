"use client";

import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "الرئيسية", href: "/", id: "hero" },
    { label: "المنتجات", href: "/products", id: null },
    // { label: "من نحن", href: "/#about" },
    // { label: "المجموعات", href: "/#services" },
    // { label: "اتصل بنا", href: "/#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id?: string | null) => {
    if (pathname === "/" && id) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setIsOpen(false);
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 border-b border-border shadow-sm animate-fade-in-down">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.jpg"
                alt="Awlad Mamoun Logo"
                className="h-11 w-auto rounded-md"
              />
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div
            className={`${
              isOpen ? "flex" : "hidden"
            } md:flex flex-col md:flex-row gap-6 absolute md:relative top-full md:top-auto right-0 md:right-auto left-0 md:left-auto bg-background md:bg-transparent p-4 md:p-0 md:items-center shadow-md md:shadow-none border-b md:border-b-0 border-border`}
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href, item.id)}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          
          </div>

          <div className="hidden md:flex gap-4">
            <a
              href="/#products"
              className="bg-primary text-primary-foreground px-5 py-2 rounded-md hover:bg-primary/90 transition-colors font-semibold"
            >
              تسوق الآن
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

