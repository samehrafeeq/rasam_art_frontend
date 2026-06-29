import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, Mail, Phone, KeyRound, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { fetchApi, api } from "@/lib/api";
import heroImg from "@/assets/hero-villa.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — رسّام آرت" },
      { name: "description", content: "سجل دخولك إلى حساب عميل رسّام آرت للاستشارات الهندسية." },
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
  component: LoginPage,
});

type ViewState = 'login' | 'forgot-password' | 'reset-password';

function LoginPage() {
  const [view, setView] = useState<ViewState>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Reset Password State
  const [phone, setPhone] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("الرجاء إدخال البريد وكلمة المرور");
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-change'));
      
      toast.success("تم تسجيل الدخول بنجاح");
      
      if (data.user.role === 'ADMIN') {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/' });
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("الرجاء إدخال رقم الهاتف");
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', { phone });
      toast.success("تم إرسال كود الاستعادة عبر الواتساب بنجاح");
      setView('reset-password');
      setCountdown(60); // 1 minute cooldown
    } catch (err: any) {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء طلب الكود");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim() || !newPassword.trim()) {
      toast.error("الرجاء إدخال الكود وكلمة المرور الجديدة");
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/auth/reset-password', { phone, code: resetCode, newPassword });
      toast.success("تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن");
      setView('login');
      setPassword('');
      setResetCode('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "الكود غير صحيح أو منتهي الصلاحية");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative z-10">
        <div className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 lg:p-10 animate-in fade-in zoom-in-95 duration-500">
          
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-gold to-yellow-600 text-primary-foreground mb-6 shadow-lg shadow-gold/30 hover:scale-105 transition-transform">
              <Sparkles className="size-7" />
            </Link>
            <h1 className="font-display text-3xl font-black mb-2">
              {view === 'login' ? 'أهلاً بك مجدداً' : view === 'forgot-password' ? 'استعادة كلمة المرور' : 'تعيين كلمة مرور جديدة'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {view === 'login' ? 'سجل دخولك لمتابعة مشاريعك الهندسية.' : view === 'forgot-password' ? 'أدخل رقم هاتفك وسنرسل لك كود التفعيل عبر الواتساب.' : 'أدخل الكود المرسل إليك وكلمة المرور الجديدة.'}
            </p>
          </div>

          {/* Login View */}
          {view === 'login' && (
            <form onSubmit={onLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">البريد الإلكتروني</label>
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-gold transition-colors" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" dir="ltr" className="w-full px-5 py-3.5 pr-12 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:outline-none focus:border-gold text-right transition-all" placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-foreground">كلمة المرور</label>
                  <button type="button" onClick={() => setView('forgot-password')} className="text-sm font-bold text-gold hover:text-gold/80 transition-colors">نسيت كلمة المرور؟</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-gold transition-colors" />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" dir="ltr" className="w-full px-5 py-3.5 pr-12 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:outline-none focus:border-gold text-right transition-all tracking-wider" placeholder="••••••••" />
                </div>
              </div>
              
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-lg shadow-lg shadow-gold/20 hover:shadow-gold/40 mt-6 relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 className="size-5 animate-spin" /> جاري الدخول...</> : 'تسجيل الدخول'}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  ليس لديك حساب؟ <Link to="/signup" className="text-gold font-bold hover:underline">أنشئ حساباً جديداً</Link>
                </p>
              </div>
            </form>
          )}

          {/* Forgot Password View */}
          {view === 'forgot-password' && (
            <form onSubmit={onForgotPasswordSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">رقم الجوال المسجل</label>
                <div className="relative group">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-gold transition-colors" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" dir="ltr" className="w-full px-5 py-3.5 pr-12 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:outline-none focus:border-gold text-right transition-all" placeholder="05XXXXXXXX" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">سيتم إرسال كود التفعيل عبر تطبيق واتساب (WhatsApp).</p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" disabled={isLoading || countdown > 0} className="btn-primary w-full py-3.5 shadow-lg shadow-gold/20">
                  {isLoading ? <><Loader2 className="size-5 animate-spin" /> جاري الإرسال...</> : 
                   countdown > 0 ? `انتظر ${countdown} ثانية...` : 'إرسال كود التفعيل'}
                </button>
                <button type="button" onClick={() => setView('login')} className="w-full py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                  <ArrowRight className="size-4" /> عودة لتسجيل الدخول
                </button>
              </div>
            </form>
          )}

          {/* Reset Password View */}
          {view === 'reset-password' && (
            <form onSubmit={onResetPasswordSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">كود التفعيل (من الواتساب)</label>
                <div className="relative group">
                  <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-gold transition-colors" />
                  <input value={resetCode} onChange={(e) => setResetCode(e.target.value)} type="text" dir="ltr" className="w-full px-5 py-3.5 pr-12 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:outline-none focus:border-gold text-center text-xl tracking-[0.5em] font-bold transition-all" placeholder="••••••" maxLength={6} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">كلمة المرور الجديدة</label>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-gold transition-colors" />
                  <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" dir="ltr" className="w-full px-5 py-3.5 pr-12 rounded-xl border-2 border-border/50 bg-background/50 focus:bg-background focus:outline-none focus:border-gold text-right transition-all tracking-wider" placeholder="••••••••" minLength={6} />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 shadow-lg shadow-gold/20">
                  {isLoading ? <><Loader2 className="size-5 animate-spin" /> جاري التحديث...</> : 'تعيين كلمة المرور الجديدة'}
                </button>
                <button type="button" onClick={() => setView('login')} className="w-full py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                  <ArrowRight className="size-4" /> إلغاء وعودة
                </button>
              </div>

              <div className="text-center pt-2">
                <button type="button" onClick={onForgotPasswordSubmit} disabled={isLoading || countdown > 0} className={`text-xs font-bold ${countdown > 0 ? 'text-muted-foreground/50' : 'text-gold hover:underline'}`}>
                  {countdown > 0 ? `إعادة الإرسال بعد ${countdown} ثانية` : 'لم يصلك الكود؟ أعد الإرسال'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Right side: Image / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img src={heroImg} alt="هندسة معمارية" className="absolute inset-0 size-full object-cover mix-blend-overlay opacity-80 scale-105 animate-pulse-slow" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent z-10" />
        
        <div className="relative z-20 p-16 text-center text-white max-w-lg animate-in fade-in zoom-in duration-700 delay-150">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold mb-8">
            <Sparkles className="size-4 text-gold" /> المنصة الهندسية المتكاملة
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-6 leading-tight drop-shadow-xl">
            مستقبل مشهدك <span className="text-gold">العمراني</span> يبدأ من هنا
          </h2>
          <p className="text-lg opacity-90 leading-relaxed drop-shadow-md">
            نقدم لك تجربة رقمية فريدة لمتابعة كافة تراخيصك وتصاميمك الهندسية واعتماداتك بأسهل الطرق وأعلى المعايير.
          </p>
        </div>
      </div>
    </div>
  );
}
