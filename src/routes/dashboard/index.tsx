import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Sparkles, Clock, CheckCircle, FileStack, ArrowLeft, Activity, MapPin } from "lucide-react";
import { SERVICES_DATA } from "../../lib/services-data";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "لوحتي — رسّام آرت" },
    ],
  }),
  component: DashboardWelcomePage,
});

function DashboardWelcomePage() {
  const [user, setUser] = useState<{id: number, name: string, role: string} | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { 
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        fetchStats(parsed.id);
      } catch { }
    }
  }, []);

  const fetchStats = async (userId: number) => {
    try {
      const res = await api.get(`/requests?userId=${userId}`);
      setRequests(res.data);
    } catch {
      // fail silently for stats
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const acceptedCount = requests.filter(r => r.status === 'ACCEPTED').length;
  const totalCount = requests.length;

  const recentRequests = requests.slice(0, 3); // Get top 3 recent requests

  const getServiceName = (id: number) => SERVICES_DATA.find(s => s.id === id)?.name || 'خدمة غير معروفة';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-primary border border-primary/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-gold/30 transition-colors duration-700"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-gold text-xs font-bold mb-4 border border-white/10">
              <Sparkles className="size-3.5" /> مساحة العميل
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-black mb-3 text-primary-foreground">
              أهلاً بك، {(user?.name || 'مستخدم').split(' ')[0]}
            </h1>
            <p className="text-primary-foreground/80 text-sm md:text-base max-w-xl leading-relaxed">
              يسعدنا تواجدك في منصة رسّام آرت للاستشارات الهندسية. من هنا يمكنك استعراض الخدمات المتاحة في منطقتك ومتابعة حالة طلباتك بكل سهولة وشفافية.
            </p>
          </div>
          <Link to="/dashboard/services" className="bg-gold text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gold/90 transition-all shadow-lg hover:-translate-y-1 hover:shadow-gold/30 whitespace-nowrap">
            طلب خدمة جديدة
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          icon={FileStack} 
          title="إجمالي طلباتي" 
          value={loading ? "..." : totalCount.toString()} 
          description="جميع الطلبات التي قدمتها"
          color="text-primary"
          bg="bg-primary/10"
        />
        <DashboardCard 
          icon={Clock} 
          title="قيد المراجعة" 
          value={loading ? "..." : pendingCount.toString()} 
          description="طلبات بانتظار رد الإدارة"
          color="text-yellow-600"
          bg="bg-yellow-500/10"
        />
        <DashboardCard 
          icon={CheckCircle} 
          title="الطلبات المقبولة" 
          value={loading ? "..." : acceptedCount.toString()} 
          description="الطلبات التي تم قبولها والبدء بها"
          color="text-green-600"
          bg="bg-green-500/10"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Activity className="size-5 text-gold" /> أحدث الطلبات
          </h2>
          {requests.length > 0 && (
            <Link to="/dashboard/requests" className="text-sm font-bold text-primary hover:text-gold transition-colors flex items-center gap-1">
              عرض الكل <ArrowLeft className="size-3" />
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="py-12 flex justify-center"><div className="size-6 border-3 border-gold border-t-transparent rounded-full animate-spin"></div></div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {recentRequests.map(req => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 shadow-sm text-muted-foreground">
                    <FileStack className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{getServiceName(req.serviceId)}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="size-3" /> {req.region?.name || 'منطقة محذوفة'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    req.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' :
                    req.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {req.status === 'PENDING' ? 'قيد المراجعة' : req.status === 'ACCEPTED' ? 'مقبول' : 'مرفوض'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">#{req.id}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/20 rounded-xl border border-dashed border-border">
            <div className="size-16 rounded-full bg-card grid place-items-center mb-4 shadow-sm border border-border">
              <FileStack className="size-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-bold text-foreground mb-1">لا يوجد طلبات حالياً</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              لم تقم بتقديم أي طلبات للخدمات الهندسية حتى الآن. استكشف الخدمات المتاحة لمنطقتك وابدأ الآن.
            </p>
            <Link to="/dashboard/services" className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
              استكشاف الخدمات
            </Link>
          </div>
        )}
      </div>
      
    </div>
  );
}

function DashboardCard({ icon: Icon, title, value, description, color, bg }: { icon: any, title: string, value: string, description: string, color: string, bg: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`size-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
          <Icon className="size-6" />
        </div>
        <div className="font-display text-3xl font-black text-foreground">{value}</div>
      </div>
      <h3 className="font-bold text-sm text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
