export default function Certifications() {
  const achievements = [
    "اختيارات عجل مناسبة للاستخدام اليومي",
    "قطع غيار وإكسسوارات يتم ترشيحها حسب احتياج العميل",
    "متابعة وخدمة بعد البيع من فريق يعرف السوق المحلي",
  ];

  const standards = [
    "جودة عملية تناسب طرق واستخدامات المنطقة",
    "أسعار واضحة ومنتجات بدون مبالغة",
    "تجهيز العجلة وفحص الأساسيات قبل الاستلام",
  ];

  return (
    <section id="certifications" className="py-16 px-4 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            خليك في المضمون
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            ثقة أولاد مأمون مبنية على منتج مناسب، نصيحة واضحة، وخدمة قريبة من العميل.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="animate-slide-in-right">
            <h3 className="text-xl font-bold text-foreground mb-5">ما نقدمه</h3>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement}
                  className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border shadow-sm animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground flex-shrink-0 font-bold">
                    ✓
                  </div>
                  <p className="text-foreground">{achievement}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-slide-in-left">
            <h3 className="text-xl font-bold text-foreground mb-5">معاييرنا</h3>
            <div className="space-y-4">
              {standards.map((standard, index) => (
                <div
                  key={standard}
                  className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border shadow-sm animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground flex-shrink-0 font-bold">
                    ✓
                  </div>
                  <p className="text-foreground">{standard}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 bg-card border border-border p-8 rounded-lg text-center animate-scale-in">
          {/* <h3 className="text-2xl font-bold mb-3 text-foreground">وعد أولاد مأمون</h3> */}
          <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            نساعدك تختار العجلة أو قطعة الغيار المناسبة لاستخدامك، ونوفر تجربة شراء بسيطة وواضحة من معرض متخصص في العجل ومستلزماته.
          </p>
        </div>
      </div>
    </section>
  );
}
