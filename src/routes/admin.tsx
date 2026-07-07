import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shield, Users, Settings, LogOut, Menu, X, LayoutDashboard, MessageCircle, Map, FileStack, User, Mail } from "lucide-react";
import { toast } from "sonner";
import { hasPermission, getUser as getStoredUser } from "../lib/permissions-helper";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const allSidebarLinks = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, permission: null },
  { to: "/admin/requests", label: "طلبات الخدمات", icon: FileStack, permission: 'requests.view' },
  { to: "/admin/messages", label: "الرسائل", icon: Mail, permission: 'messages.view' },
  { to: "/admin/regions", label: "إدارة المناطق", icon: Map, permission: 'regions.view' },
  { to: "/admin/users", label: "الأعضاء المسجلين", icon: Users, permission: 'users.view' },
  { to: "/admin/whatsapp", label: "ربط واتساب", icon: MessageCircle, permission: 'whatsapp.manage' },
  { to: "/admin/roles", label: "إدارة الصلاحيات", icon: Shield, permission: '__ADMIN_ONLY__' },
  { to: "/admin/profile", label: "حسابي", icon: User, permission: null },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate({ to: '/login' });
      return;
    }
    try {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
      if (!['ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE'].includes(parsed.role)) {
        toast.error('غير مصرح لك بالدخول إلى هذه الصفحة');
        navigate({ to: '/' });
      } else {
        setLoading(false);
      }
    } catch {
      navigate({ to: '/login' });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    navigate({ to: '/' });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="size-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary/30 relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 right-0 z-50 w-64 h-screen bg-card border-l border-border transform transition-transform duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 border-b border-border flex items-center justify-between md:hidden">
          <span className="font-display font-bold text-lg">لوحة الإدارة</span>
          <button onClick={() => setSidebarOpen(false)} className="p-2 -m-2 bg-secondary rounded-md">
            <X className="size-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col items-center justify-center mb-10 mt-2 text-center">
            <div className="relative flex items-center justify-center size-16 mb-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold to-yellow-200 rounded-xl rotate-45 opacity-20"></div>
              <div className="absolute inset-0 border border-gold/40 rounded-xl -rotate-12"></div>
              <svg className="size-8 text-gold relative z-10 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gold to-yellow-600 drop-shadow-sm">
              رسّام آرت
            </h2>
            <div className="text-[11px] font-bold tracking-widest text-muted-foreground mt-1.5 uppercase bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
              لوحة الإدارة
            </div>
          </div>

          <nav className="space-y-1.5">
            {allSidebarLinks
              .filter((link) => {
                if (link.permission === null) return true;
                if (link.permission === '__ADMIN_ONLY__') {
                  const storedUser = getStoredUser();
                  return storedUser?.role === 'ADMIN';
                }
                return hasPermission(link.permission);
              })
              .map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  activeOptions={{ exact: link.to === "/admin" }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors font-medium"
                  activeProps={{ className: "bg-primary text-primary-foreground font-bold shadow-sm" }}
                  inactiveProps={{ className: "text-muted-foreground hover:bg-secondary hover:text-foreground" }}
                >
                  <Icon className="size-4.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors font-semibold">
            <LogOut className="size-4.5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden min-h-screen">
        <div className="md:hidden p-4 border-b border-border bg-card flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 border border-border rounded-md bg-secondary shadow-sm">
            <Menu className="size-5" />
          </button>
          <span className="font-display font-bold">لوحة الإدارة</span>
        </div>
        <div className="p-6 md:p-10 w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
