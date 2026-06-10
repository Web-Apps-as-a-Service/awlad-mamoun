import { Bike, Cog, Lightbulb, Wrench } from "lucide-react";

export default function Services() {
  const collections = [
    {
      title: "عجل",
      description: "اختيارات مناسبة للمشاوير اليومية، الشباب، والأطفال مع مقاسات متنوعة وخدمة ترشيح داخل المحل.",
      icon: Bike,
    },
    {
      title: "قطع غيار",
      description: "كاوتش، فرامل، جنزير، بدالات، وكراسي عجل بجودة عملية تناسب الاستخدام اليومي.",
      icon: Cog,
    },
    {
      title: "إكسسوارات",
      description: "خوذات، كشافات، أقفال، شنط، وجرس عجل لتجربة ركوب أأمن وأسهل.",
      icon: Lightbulb,
    },
    {
      title: "تجهيز وصيانة",
      description: "مساعدة في اختيار القطعة المناسبة وتجهيز العجلة للاستخدام بثقة.",
      icon: Wrench,
    },
  ];

  return (
    <section id="services" className="py-16 px-4 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            كل احتياجات العجل في مكان واحد
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            منتجات واضحة، أسعار مناسبة، وخبرة تساعدك تختار الصح.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {collections.map((collection, index) => {
            const Icon = collection.icon;
            return (
              <div
                key={collection.title}
                className="bg-card p-6 rounded-lg border border-border shadow-sm hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-md bg-secondary border border-border flex items-center justify-center mb-5">
                  <Icon className="text-primary" size={26} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{collection.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{collection.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
