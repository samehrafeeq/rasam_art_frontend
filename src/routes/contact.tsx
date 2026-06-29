import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Mail, Send, User, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — رسّام آرت" },
      { name: "description", content: "تواصل مع مجموعة رسّام آرت للاستشارات الهندسية عبر رسائل الموقع." },
    ],
  }),
  component: ContactPage,
});

const branches = [
  { city: "جدة", addr: "طريق الملك عبد العزيز، الشاطئ", url: "https://goo.gl/maps/TPT7ATDM3eeacj736" },
  { city: "الرياض — الغدير", addr: "طريق الملك عبد العزيز، حي الغدير", url: "https://maps.app.goo.gl/mzPCNkwzKSgtVBkD7" },
  { city: "الرياض — حطين", addr: "شارع الأمير فيصل بن فهد، حطين", url: "https://goo.gl/maps/226edfYivwMu6pAb7" },
  { city: "حائل", addr: "طريق الملك فيصل", url: "https://maps.app.goo.gl/RhU1CAQ6pkL88idW6" },
  { city: "أبها", addr: "طريق الملك فيصل، حي البلد", url: "https://maps.app.goo.gl/a5UeapUZnT1w72K99" },
];

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error("الرجاء تعبئة جميع الحقول");
      return;
    }
    
    try {
      setIsLoading(true);
      await api.post('/contact', form);
      toast.success("تم إرسال رسالتك بنجاح، شكراً لتواصلك معنا");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      toast.error("حدث خطأ أثناء إرسال الرسالة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/10 rounded-full blur-[100px] size-96 -top-20 -right-20 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-gold font-semibold text-sm mb-3">تواصل معنا</div>
          <h1 className="font-display text-4xl md:text-5xl font-black">يسعدنا خدمتك في أي وقت</h1>
          <p className="mt-4 max-w-2xl opacity-85 leading-relaxed">أرسل لنا استفسارك أو يمكنك طلب خدماتنا فوراً بكل سهولة عبر منصتنا الرقمية المتكاملة.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12">
        <div>
          <div className="bg-card border border-border rounded-2xl p-8 mb-10 shadow-elegant">
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <User className="size-6 text-gold" /> اطلب الخدمة مباشرة
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              يمكنك طلب الخدمات بشكل مباشر وتتبع حالة طلباتك ومخططاتك في أي وقت عبر إنشاء حساب وتسجيل الدخول لمنصتنا.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/signup" className="btn-primary w-full sm:w-auto">
                إنشاء حساب جديد <ArrowLeft className="size-4" />
              </Link>
              <Link to="/login" className="btn-outline border-border w-full sm:w-auto text-foreground hover:bg-secondary">
                تسجيل الدخول <Lock className="size-4 mr-2" />
              </Link>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><MapPin className="size-5 text-gold" /> فروعنا</h2>
          <div className="space-y-3">
            {branches.map((b) => (
              <a key={b.addr} href={b.url} target="_blank" rel="noreferrer" className="block p-5 rounded-xl bg-card border border-border hover:border-gold hover:shadow-md transition">
                <div className="font-bold text-foreground text-lg">{b.city}</div>
                <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
                  <MapPin className="size-4 opacity-50" /> {b.addr}
                </div>
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-card border border-border rounded-3xl p-8 lg:p-10 shadow-elegant sticky top-24">
            <h2 className="font-display text-2xl font-bold mb-2">أرسل لنا رسالة</h2>
            <p className="text-sm text-muted-foreground mb-8">سنقوم بالرد على استفسارك في أقرب وقت ممكن.</p>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">الاسم الكامل</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} className="w-full px-5 py-3.5 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:outline-none focus:border-gold transition-colors" placeholder="اكتب اسمك هنا" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">البريد الإلكتروني</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" dir="ltr" className="w-full px-5 py-3.5 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:outline-none focus:border-gold transition-colors text-right" placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">رقم الجوال</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} dir="ltr" className="w-full px-5 py-3.5 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:outline-none focus:border-gold transition-colors text-right" placeholder="05XXXXXXXX" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">الرسالة</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} rows={4} className="w-full px-5 py-3.5 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:outline-none focus:border-gold transition-colors resize-none" placeholder="كيف يمكننا مساعدتك؟" />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-base shadow-lg shadow-gold/20 mt-4">
                {isLoading ? <><Loader2 className="size-5 animate-spin" /> جاري الإرسال...</> : <><Send className="size-5" /> إرسال الرسالة</>}
              </button>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-2 pt-3">
                <Mail className="size-4" /> info@rassam-art.sa
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
