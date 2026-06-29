import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Compass, FileCheck2, HardHat, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import heroVilla from "@/assets/hero-villa.jpg";
import designImg from "@/assets/design-sector.jpg";
import permitsImg from "@/assets/permits-sector.jpg";
import supervisionImg from "@/assets/supervision-sector.jpg";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "رسّام آرت — الاستشارات الهندسية في المملكة" },
      { name: "description", content: "تصميم معماري وداخلي، رخص بناء فورية عبر بلدي، وإشراف هندسي معتمد. خبرة سنوات في الرياض، جدة، الدمام وجميع مناطق المملكة." },
    ],
  }),
  component: HomePage,
});

const sectors = [
  { to: "/services", title: "التصميم الهندسي والمعماري", desc: "تصميم معماري حديث، داخلي وواجهات ثلاثية الأبعاد، تصميم إنشائي وفق الكود السعودي.", img: designImg, icon: Compass },
  { to: "/services", title: "الرخص والتراخيص الرسمية", desc: "رخص بناء فورية، هدم، ترميم، تصحيح أوضاع، وتحويل واجهات عبر منصة بلدي.", img: permitsImg, icon: FileCheck2 },
  { to: "/services", title: "الإشراف الهندسي وشهادات السلامة", desc: "إشراف كامل أو جزئي على البناء، تقارير ميدانية، وإصدار شهادات اتمام وسلامة.", img: supervisionImg, icon: HardHat },
];

const stats = [
  { v: "+10", l: "سنوات خبرة" },
  { v: "+9", l: "فروع بالمملكة" },
  { v: "+500", l: "مشروع منجز" },
  { v: "100%", l: "اعتماد رسمي" },
];

function HomePage() {
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    api.get('/regions').then(res => {
      setRegions(res.data.slice(0, 8));
    }).catch(console.error);
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img src={heroVilla} alt="فيلا فاخرة" width={1920} height={1280} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-40 text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-semibold border border-white/15 mb-6">
            <Sparkles className="size-3.5 text-gold" /> مكاتب هندسية معتمدة في المملكة
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black leading-tight max-w-3xl">
            نصنع <span className="text-gold">مساحات</span> للمستقبل
            <br /> بدقة هندسية واحترافية
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg opacity-90 leading-relaxed">
            مجموعة رسّام آرت للاستشارات الهندسية — تصاميم مبتكرة، رفع مساحي دقيق، وإصدار جميع رخص البناء والقرارات المساحية عبر منصات أحكام وبلدي، مع إشراف هندسي متكامل.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/services" className="btn-primary">استعرض خدماتنا <ArrowLeft className="size-4" /></Link>
            <Link to="/contact" className="btn-outline border-white/30 text-white hover:bg-white/10">تواصل معنا</Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {stats.map((s) => (
              <div key={s.l} className="border-r-2 border-gold pr-4">
                <div className="font-display text-3xl md:text-4xl font-black text-gold">{s.v}</div>
                <div className="text-xs md:text-sm opacity-80 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-gold font-semibold text-sm mb-2">قطاعات أعمالنا</div>
          <h2 className="font-display text-3xl md:text-4xl font-black text-foreground">حلول هندسية متكاملة تحت سقف واحد</h2>
          <p className="mt-4 text-muted-foreground">من فكرة التصميم وحتى تسليم المفتاح، نواكب مشروعك بخبرة معتمدة في كافة المراحل.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sectors.map((s) => {
            const Icon = s.icon;
            return (
              <article key={s.title} className="group bg-card rounded-2xl overflow-hidden border border-border shadow-elegant hover:-translate-y-1 transition">
                <div className="relative h-52 overflow-hidden">
                  <img src={s.img} alt={s.title} width={1280} height={896} loading="lazy" className="size-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-4 right-4 size-11 rounded-lg gradient-gold grid place-items-center shadow-gold">
                    <Icon className="size-5 text-primary" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  <Link to={s.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:gap-2 transition-all">
                    التفاصيل <ArrowLeft className="size-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* QUICK REGIONS OVERVIEW */}
      <section className="bg-background py-20 relative overflow-hidden border-t border-border/50">
        <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full size-[500px] -top-60 -right-20 opacity-50 pointer-events-none"></div>
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <div className="text-gold font-semibold text-sm mb-2">تغطيتنا الجغرافية</div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-foreground">اختر منطقتك واكتشف الخدمات المتاحة</h2>
            </div>
            <Link to="/services" className="btn-outline border-gold text-gold hover:bg-gold hover:text-white shrink-0 hidden md:inline-flex">
              استكشف جميع المناطق <ArrowLeft className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {regions.map((region) => (
              <Link to="/services" key={region.id} className="bg-card border border-border rounded-xl p-5 hover:border-gold/30 hover:shadow-lg hover:-translate-y-1 transition-all group block">
                <div className="flex justify-between items-start mb-3">
                  <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-gold transition-colors">
                    <MapPin className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-1 rounded-md">متاح</span>
                </div>
                <h3 className="font-bold text-foreground mb-1 line-clamp-1">{region.name}</h3>
                {region.description && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{region.description}</p>}
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/services" className="btn-outline border-gold text-gold hover:bg-gold hover:text-white w-full justify-center">
              استكشف جميع المناطق <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-gold font-semibold text-sm mb-2">لماذا رسّام آرت؟</div>
            <h2 className="font-display text-3xl md:text-4xl font-black mb-6">ثقة العملاء واعتماد المنصات الرسمية</h2>
            <div className="space-y-5">
              {[
                { t: "اعتماد رسمي على منصة بلدي وأحكام", d: "نرفع ملفاتك بحساب المكتب المعتمد ونتابع الإصدار حتى تسليمك الرخصة رقمياً." },
                { t: "كود سعودي ودقة في التنفيذ", d: "تصميم إنشائي وكهروميكانيكي وفق آخر إصدارات الكود السعودي للمباني السكنية." },
                { t: "إشراف هندسي في المراحل الحرجة", d: "زيارات ميدانية موثقة بالتقارير والصور من الحفر حتى التسليم النهائي." },
              ].map((f) => (
                <div key={f.t} className="flex gap-4">
                  <div className="size-10 rounded-lg gradient-gold grid place-items-center shrink-0 shadow-gold">
                    <ShieldCheck className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{f.t}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-elegant">
            <img src={designImg} alt="مخططات هندسية" width={1280} height={896} loading="lazy" className="w-full object-cover" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 md:p-16 text-primary-foreground shadow-elegant">
          <div className="absolute -left-20 -top-20 size-72 rounded-full gradient-gold opacity-20 blur-3xl" />
          <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-6">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-black">مشروعك في أيدٍ أمينة ومعتمدة</h2>
              <p className="mt-3 opacity-85">احصل على استشارة مجانية وابدأ رحلة بناء حلمك مع خبراء رسّام آرت.</p>
              <div className="mt-4 flex items-center gap-2 text-sm opacity-80">
                <MapPin className="size-4 text-gold" /> فروعنا تغطي: الرياض · جدة · الدمام · حائل · أبها · جازان · تبوك
              </div>
            </div>
            <Link to="/contact" className="btn-primary text-base whitespace-nowrap">احجز استشارتك <ArrowLeft className="size-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
