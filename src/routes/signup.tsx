import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, User, Phone, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import interior from "@/assets/interior-1.jpg";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب — رسّام آرت" },
      { name: "description", content: "أنشئ حسابك في رسّام آرت لمتابعة مشاريعك الهندسية." },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'ADMIN') throw redirect({ to: '/admin' });
          throw redirect({ to: '/dashboard' });
        } catch (err) {
          if (err instanceof Error && err.name === 'RedirectError') throw err;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  },
  component: SignupPage,
});

function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("الرجاء تعبئة جميع الحقول");
      return;
    }
    if (!/^05\d{8}$/.test(form.phone)) {
      toast.error("رقم الهاتف يجب أن يبدأ بـ 05 ومكون من 10 أرقام");
      return;
    }
    if (form.password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await fetchApi('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-change'));
      
      toast.success("تم إنشاء الحساب بنجاح");
      navigate({ to: '/' });
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Right side: Image / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img src={interior} alt="تصميم داخلي" className="absolute inset-0 size-full object-cover mix-blend-overlay opacity-80 scale-105 animate-pulse-slow" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent z-10" />
        
        <div className="relative z-20 p-16 text-center text-white max-w-lg animate-in fade-in zoom-in duration-700 delay-150">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold mb-8">
            <Sparkles className="size-4 text-gold" /> انضم لعملائنا
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-6 leading-tight drop-shadow-xl">
            ابدأ رحلة بناء <span className="text-gold">مشروعك</span> بثقة
          </h2>
          <p className="text-lg opacity-90 leading-relaxed drop-shadow-md">
            أنشئ حسابك للوصول إلى استشارات مجانية وعروض أسعار سريعة وتجربة هندسية متكاملة.
          </p>
        </div>
      </div>

      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative z-10 order-2 lg:order-1 overflow-y-auto">
        <div className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 lg:p-10 animate-in fade-in zoom-in-95 duration-500 my-auto">
          
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-gold to-yellow-600 text-primary-foreground mb-6 shadow-lg shadow-gold/30 hover:scale-105 transition-transform">
              <Sparkles className="size-7" />
            </Link>
            <h1 className="font-display text-3xl font-black mb-2">إنشاء حساب جديد</h1>
            <p className="text-sm text-muted-foreground">أدخل بياناتك للانضمام إلى منصة رسّام آرت.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field icon={User} label="الاسم الكامل" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="محمد أحمد" />
            <Field icon={Mail} label="البريد الإلكتروني" type="email" dir="ltr" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" />
            <Field icon={Phone} label="رقم الجوال" dir="ltr" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="05XXXXXXXX" />
            
            <div className="grid grid-cols-2 gap-4">
              <Field icon={Lock} label="كلمة المرور" type="password" dir="ltr" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••••••" />
              <Field icon={Lock} label="تأكيد كلمة المرور" type="password" dir="ltr" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} placeholder="••••••••" />
            </div>

            <label className="flex items-start gap-3 text-xs text-muted-foreground pt-2">
              <input type="checkbox" className="mt-1 size-4 rounded accent-gold" required /> 
              <span>أوافق على <a href="#" className="text-gold hover:underline">شروط الاستخدام</a> و <a href="#" className="text-gold hover:underline">سياسة الخصوصية</a> الخاصة بمؤسسة رسّام آرت.</span>
            </label>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-lg shadow-lg shadow-gold/20 hover:shadow-gold/40 mt-6 relative overflow-hidden group">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 className="size-5 animate-spin" /> جاري الإنشاء...</> : 'إنشاء الحساب'}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                لديك حساب بالفعل؟ <Link to="/login" className="text-gold font-bold hover:underline">تسجيل الدخول</Link>
              </p>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
}

function Field({
  icon: Icon, label, value, onChange, placeholder, type = "text", dir,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; dir?: "ltr" | "rtl";
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-foreground">{label}</label>
      <div className="relative group">
        <Icon className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-gold transition-colors" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          dir={dir}
          maxLength={100}
          placeholder={placeholder}
          className={`w-full px-5 py-3 pr-12 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:outline-none focus:border-gold transition-all ${dir === "ltr" ? "text-right tracking-wider" : ""}`}
        />
      </div>
    </div>
  );
}
