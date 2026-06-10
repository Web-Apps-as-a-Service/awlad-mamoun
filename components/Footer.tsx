import { Facebook, Instagram, MapPin, Music2, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    {
      label: "Facebook",
      href: "https://www.facebook.com/share/18bM1MSkeM/?mibextid=wwXIfr",
      icon: Facebook,
    },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@maamoun.store?_r=1&_t=ZS-96xjhwDEuqz",
      icon: Music2,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/maamoun.store/",
      icon: Instagram,
    },
  ];

  return (
    <footer className="bg-secondary text-foreground py-10 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="animate-fade-in-up" style={{ animationDelay: "0s" }}>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.jpg"
                alt="أولاد مأمون"
                className="w-12 h-12 object-contain rounded-md bg-card border border-border"
              />
              <div>
                <span className="text-xl font-bold">أولاد مأمون</span>
                <p className="text-sm text-primary font-semibold mt-1">
                  خليك في المضمون
                </p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              متخصصون في بيع العجل وقطع الغيار والإكسسوارات. خليك في المضمون مع أولاد مأمون.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              تم تصميم وتطوير هذا الموقع بواسطة <b>Mahmoud Fayez</b> و <b>Mahmoud Elabady</b>
            </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h4 className="text-lg font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#hero" className="hover:text-primary transition-colors">الرئيسية</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">من نحن</a></li>
              <li><a href="#categories" className="hover:text-primary transition-colors">الأقسام</a></li>
              <li><a href="#products" className="hover:text-primary transition-colors">المنتجات</a></li>
            </ul>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h4 className="text-lg font-bold mb-4">اتصل بنا</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="text-primary" size={18} />
                <a href="tel:01277491077" className="hover:text-primary transition-colors">01277491077</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="text-primary mt-1" size={18} />
                <a
                  href="https://maps.app.goo.gl/1jjTaMKFNaqxSEwY9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  قها طريق مصر اسكندريه الزراعي بجوار بنك مصر
                </a>
              </li>
            </ul>
            <div className="mt-5">
              <h5 className="mb-3 font-bold text-foreground">صفحاتنا</h5>
              <div className="flex flex-col gap-2">
                {socialLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Icon className="text-primary" size={18} />
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="text-center text-muted-foreground text-sm">
            <p>© {currentYear} أولاد مأمون - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
