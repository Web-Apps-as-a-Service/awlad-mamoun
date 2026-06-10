"use client";

import { MapPin, Phone } from "lucide-react";
import { useState } from "react";

function WhatsAppIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.04 3.2c-7.04 0-12.76 5.68-12.76 12.68 0 2.24.6 4.44 1.72 6.36L3.2 28.8l6.72-1.76a12.87 12.87 0 0 0 6.12 1.56c7.04 0 12.76-5.68 12.76-12.68S23.08 3.2 16.04 3.2Zm0 23.24c-1.92 0-3.8-.52-5.44-1.48l-.4-.24-3.96 1.04 1.04-3.84-.28-.4a10.43 10.43 0 0 1-1.6-5.6c0-5.8 4.76-10.52 10.6-10.52s10.6 4.72 10.6 10.52-4.72 10.52-10.56 10.52Zm5.8-7.88c-.32-.16-1.88-.92-2.16-1.04-.28-.08-.48-.16-.68.16-.2.32-.8 1.04-.96 1.24-.2.2-.36.24-.68.08-.32-.16-1.36-.48-2.56-1.56-.96-.84-1.6-1.88-1.76-2.2-.2-.32-.04-.48.12-.64.12-.12.32-.36.48-.52.16-.2.2-.32.32-.52.12-.2.04-.4-.04-.56-.08-.16-.68-1.64-.96-2.24-.24-.6-.48-.52-.68-.52h-.56c-.2 0-.52.08-.8.4-.28.32-1.04 1.04-1.04 2.52s1.08 2.92 1.24 3.12c.16.2 2.12 3.24 5.16 4.56.72.32 1.28.48 1.72.64.72.24 1.4.2 1.92.12.6-.08 1.88-.76 2.12-1.48.28-.72.28-1.36.2-1.48-.08-.16-.28-.24-.6-.4Z" />
    </svg>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // TODO: Implement your own backend API endpoint here
      // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })

      console.log("Form submitted:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setSubmitStatus("success");
      alert("شكراً لتواصلك معنا. سنتواصل معك قريباً!");
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      alert("حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            تواصل معنا
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            اسألنا عن العجل، قطع الغيار، الإكسسوارات، أو أقرب فرع لك.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
          {[
            {
              icon: Phone,
              label: "الهاتف",
              value: "01277491077",
              link: "tel:01277491077",
              detail: "اتصل بنا",
            },
            {
              icon: WhatsAppIcon,
              iconClassName: "text-[#25D366]",
              label: "واتساب",
              value: "01277491077",
              link: "https://wa.me/201277491077",
              detail: "راسلنا على واتساب",
            },
            // {
            //   icon: Mail,
            //   label: "البريد الإلكتروني",
            //   value: "info@sakrsports.example",
            //   detail: "سنتواصل معك في أقرب وقت ممكن",
            // },
            {
              icon: MapPin,
              label: "العنوان",
              value: "قها طريق مصر اسكندريه الزراعي بجوار بنك مصر",
              link: "https://maps.app.goo.gl/1jjTaMKFNaqxSEwY9",
            },
          ].map((contact, index) => {
            const Icon = contact.icon;
            return (
               <div
               
                key={index}
                className="bg-secondary p-6 rounded-lg border border-border text-center hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <a href={contact.link} target={contact.link ? "_blank" : undefined}>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-card border border-border rounded-md flex items-center justify-center">
                    <Icon className={contact.iconClassName || "text-primary"} size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {contact.label}
                </h3>
                <p className="text-primary font-semibold mb-2 leading-relaxed">
                   {contact.value}
                </p>
                <p className="text-muted-foreground text-sm">{contact.detail}</p>
              </a>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
          <div className="animate-slide-in-right">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              معلومات إضافية
            </h3>
            <div className="space-y-6 bg-secondary p-6 rounded-lg border border-border">
              <div>
                <p className="font-semibold text-foreground mb-2">اسم العلامة التجارية</p>
                <p className="text-foreground">أولاد مأمون</p>
              </div>
              {/* <div>
                <p className="font-semibold text-foreground mb-2">
                  البريد الإلكتروني
                </p>
                <p className="text-foreground">info@sakrsports.example</p>
              </div> */}
              <div>
                <p className="font-semibold text-foreground mb-2">العنوان</p>
                <p className="text-foreground">قها طريق مصر اسكندريه الزراعي بجوار بنك مصر</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-2">ساعات العمل</p>
                <p className="text-foreground">
            يوميا ماعدا الأحد من الساعة 12 ظهراً حتى 12 منتصف الليل
                
                </p>
            
              </div>
            </div>
          </div>

          {/* <div className="animate-slide-in-left">
            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-secondary p-8 rounded-xl"
            >
              <div>
                <label className="block text-foreground font-semibold mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="أدخل اسمك"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="أدخل رقم هاتفك"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-2">
                  الموضوع
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="موضوع رسالتك"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-2">
                  الرسالة
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="أدخل رسالتك هنا"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "جاري الإرسال..." : "أرسل الرسالة"}
              </button>
            </form>
          </div> */}
        </div>
      </div>
    </section>
  );
}
