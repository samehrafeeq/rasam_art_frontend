import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";

const nav = [
  { to: "/", label: "الرئيسية" },
  { to: "/services", label: "خدماتنا" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try { setUser(JSON.parse(userStr)); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    };
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    navigate({ to: '/' });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-background/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-18 flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="size-11 rounded-lg gradient-gold grid place-items-center shadow-gold font-display text-primary text-xl font-black">ر</div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-foreground">رسّام آرت</div>
            <div className="text-[11px] text-muted-foreground">للاستشارات الهندسية</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-4 py-2 rounded-md text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted transition"
              activeProps={{ className: "px-4 py-2 rounded-md text-sm font-semibold text-foreground bg-muted" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link 
                to={user.role === 'ADMIN' ? "/admin" : "/dashboard"} 
                className="btn-outline text-sm flex items-center gap-2"
              >
                <User className="size-4" />
                {user.role === 'ADMIN' ? 'لوحة الإدارة' : 'لوحتي'}
              </Link>
              <button onClick={handleLogout} className="btn-primary text-sm bg-red-600 hover:bg-red-700 text-white border-transparent">
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline text-sm">تسجيل الدخول</Link>
              <Link to="/signup" className="btn-primary text-sm">إنشاء حساب</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-md hover:bg-muted" aria-label="القائمة">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-6 py-4 flex flex-col gap-2">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-muted">
                {n.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-border mt-2">
              {user ? (
                <>
                  <Link to={user.role === 'ADMIN' ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="btn-outline text-sm flex items-center justify-center gap-2">
                    <User className="size-4" />
                    {user.role === 'ADMIN' ? 'لوحة الإدارة' : 'لوحتي'}
                  </Link>
                  <button onClick={() => { handleLogout(); setOpen(false); }} className="btn-primary text-sm bg-red-600 hover:bg-red-700 text-white border-transparent">
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline flex-1 text-sm">دخول</Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary flex-1 text-sm">حساب جديد</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
