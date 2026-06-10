export default function About() {
  return (
    <section id="about" className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="animate-slide-in-right space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              عن <span className="text-primary">أولاد مأمون</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              أولاد مأمون محل متخصص في العجل وقطع الغيار والإكسسوارات. نركز على المنتجات العملية المناسبة للاستخدام اليومي، ونساعد كل عميل يختار العجلة أو القطعة المناسبة له بوضوح وثقة.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              شعارنا "خليك في المضمون" يعني خدمة قريبة، سعر واضح، ومنتج تعتمد عليه.
            </p>
          </div>

          <div className="animate-slide-in-left">
            <div className="bg-secondary rounded-lg p-6 border border-border shadow-sm">
              <div className="space-y-8">
                {[
                  { number: "25+", label: "سنة خبرة في السوق المحلي" },
                  { number: "3000+", label: "عميل وثق في أولاد مأمون" },
                  { number: "200+", label: "منتج بين عجل وقطع غيار وإكسسوارات" },
                ].map((stat, index) => (
                  <div key={index} className="border-b border-border pb-6 last:border-b-0 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="text-3xl font-bold text-primary">{stat.number}</div>
                    <div className="text-foreground mt-2">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
