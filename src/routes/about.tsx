import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Building2, Target, Users } from "lucide-react";
import interior from "@/assets/interior-1.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن — رسّام آرت" },
      { name: "description", content: "تعرّف على مجموعة رسّام آرت للاستشارات الهندسية، رؤيتنا ورسالتنا وفروعنا في المملكة." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-gold font-semibold text-sm mb-3">من نحن</div>
          <h1 className="font-display text-4xl md:text-5xl font-black max-w-3xl">قصة هندسية تمتد عبر مدن المملكة</h1>
          <p className="mt-5 max-w-2xl opacity-85 leading-relaxed">
            مجموعة رسّام آرت للاستشارات الهندسية تضع بين يديك خبرة سنوات من الاحترافية والدقة. متواجدون في المملكة من العاصمة الرياض إلى جازان وعسير، مروراً بجدة والدمام وتبوك وحائل وحفر الباطن والباحة.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <img src={interior} alt="تصميم داخلي فاخر" width={1280} height={896} loading="lazy" className="rounded-2xl shadow-elegant" />
        <div>
          <h2 className="font-display text-3xl font-black mb-4">لا نقدّم مجرد مخططات — بل نصنع مساحات للمستقبل</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            بدءاً من التصاميم المبتكرة والرفع المساحي الدقيق، وصولاً إلى إنهاء وإصدار كافة رخص البناء والقرارات المساحية عبر منصات (أحكام وبلدي)، والإشراف الهندسي المتكامل. معنا، مشروعك في أيدٍ أمينة ومعتمدة.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { i: Target, t: "رؤيتنا", d: "أن نكون البيت الهندسي الأول في المملكة." },
              { i: Award, t: "رسالتنا", d: "تقديم خدمات هندسية بمعايير عالمية ودقة سعودية." },
              { i: Users, t: "فريقنا", d: "نخبة من المهندسين والمصممين المعتمدين." },
              { i: Building2, t: "مشاريعنا", d: "مئات الفلل والمباني التجارية والسكنية." },
            ].map((f) => {
              const Icon = f.i;
              return (
                <div key={f.t} className="p-5 rounded-xl bg-card border border-border">
                  <Icon className="size-6 text-gold mb-2" />
                  <div className="font-bold">{f.t}</div>
                  <p className="text-xs text-muted-foreground mt-1">{f.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="font-display text-3xl font-black mb-3">حضورنا الجغرافي</h2>
          <p className="text-muted-foreground mb-10">نخدم عملاءنا عبر شبكة من الفروع تغطي أهم مدن المملكة.</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {["الرياض", "جدة", "الدمام", "حائل", "أبها", "جازان", "تبوك", "حفر الباطن", "الباحة", "عسير"].map((c) => (
              <span key={c} className="px-5 py-2 rounded-full bg-card border border-border font-semibold text-foreground">{c}</span>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/contact" className="btn-primary">تواصل مع أقرب فرع</Link>
          </div>
        </div>
      </section>
    </>
  );
}
