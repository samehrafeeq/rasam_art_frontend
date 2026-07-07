import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Users, FileText, Activity, Clock, MapPin, CheckCircle, XCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { SERVICES_DATA } from "../../lib/services-data";
import { hasPermission, getUser, isBranchScoped } from "../../lib/permissions-helper";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "نظرة عامة — إدارة رسّام آرت" },
    ],
  }),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    whatsappStatus: 'DISCONNECTED',
    whatsappPhone: null as string | null,
    pendingRejections: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const user = getUser();
      let usersUrl = '/users';
      let requestsUrl = '/requests';
      
      if (isBranchScoped() && user?.regionId) {
        requestsUrl = `/requests?regionId=${user.regionId}`;
      }

      const promises: Promise<any>[] = [];
      
      const pUsers = hasPermission('users.view') ? api.get(usersUrl) : Promise.resolve({ data: [] });
      const pRequests = hasPermission('requests.view') ? api.get(requestsUrl) : Promise.resolve({ data: [] });
      const pWhatsapp = hasPermission('whatsapp.manage') ? api.get('/whatsapp/status').catch(() => ({ data: { status: 'DISCONNECTED' } })) : Promise.resolve({ data: { status: 'DISCONNECTED' } });

      const [usersRes, requestsRes, whatsappRes] = await Promise.all([pUsers, pRequests, pWhatsapp]);

      const users = usersRes.data;
      const requests = requestsRes.data;

      setStats({
        totalUsers: Array.isArray(users) ? users.length : users?.data?.length || 0,
        totalRequests: requests.length,
        pendingRequests: requests.filter((r: any) => r.status === 'PENDING').length,
        acceptedRequests: requests.filter((r: any) => r.status === 'ACCEPTED').length,
        pendingRejections: requests.filter((r: any) => r.status === 'PENDING_REJECTION').length,
        whatsappStatus: whatsappRes.data.status,
        whatsappPhone: whatsappRes.data.phoneNumber
      });

      setRecentRequests(requests.slice(0, 5));
    } catch {
      // Ignore errors for stats
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock className="size-3"/> قيد المراجعة</span>;
      case 'PENDING_REJECTION': return <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle className="size-3"/> طلب رفض</span>;
      case 'ACCEPTED': return <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="size-3"/> مقبول</span>;
      case 'REJECTED': return <span className="bg-red-500/10 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="size-3"/> مرفوض</span>;
      default: return null;
    }
  };

  const getServiceName = (id: number) => SERVICES_DATA.find(s => s.id === id)?.name || 'خدمة غير معروفة';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">نظرة عامة على النظام</h1>
          <p className="text-sm text-muted-foreground mt-1">ملخص حي لأداء منصة رسّام آرت</p>
        </div>
        <Link to="/admin/requests" className="btn-primary">
          إدارة الطلبات <ArrowLeft className="size-4" />
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="size-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {hasPermission('users.view') && <StatCard icon={Users} label="إجمالي الأعضاء" value={stats.totalUsers} color="text-primary" bg="bg-primary/10" />}
          {hasPermission('requests.view') && (
            <>
              <StatCard icon={FileText} label="إجمالي الطلبات" value={stats.totalRequests} color="text-gold" bg="bg-gold/10" />
              <StatCard icon={Clock} label="طلبات قيد المراجعة" value={stats.pendingRequests} color="text-yellow-600" bg="bg-yellow-500/10" />
              <StatCard icon={CheckCircle} label="طلبات مقبولة" value={stats.acceptedRequests} color="text-green-600" bg="bg-green-500/10" />
            </>
          )}
          {hasPermission('requests.review_rejection') && (
             <StatCard icon={AlertCircle} label="طلبات رفض معلقة" value={stats.pendingRejections} color="text-orange-600" bg="bg-orange-500/10" />
          )}
          
          {hasPermission('whatsapp.manage') && (
            <Link to="/admin/whatsapp" className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className={`size-12 rounded-xl flex items-center justify-center ${stats.whatsappStatus === 'CONNECTED' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                  {stats.whatsappStatus === 'CONNECTED' ? <CheckCircle className="size-6" /> : <XCircle className="size-6" />}
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-muted-foreground mb-1">حالة الواتساب</div>
                <div className={`font-display text-lg font-black ${stats.whatsappStatus === 'CONNECTED' ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.whatsappStatus === 'CONNECTED' ? (stats.whatsappPhone ? `+${stats.whatsappPhone}` : 'متصل') : 'غير متصل'}
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Activity className="size-5 text-gold" /> أحدث الطلبات
          </h2>
          {recentRequests.length > 0 && (
            <Link to="/admin/requests" className="text-sm font-bold text-primary hover:text-gold transition-colors flex items-center gap-1">
              عرض الكل <ArrowLeft className="size-3" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="size-6 border-3 border-gold border-t-transparent rounded-full animate-spin"></div></div>
        ) : recentRequests.length > 0 ? (
          <div className="space-y-4">
            {recentRequests.map(req => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 shadow-sm text-muted-foreground">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{getServiceName(req.serviceId)}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-primary">{req.user.name}</span>
                      <span className="text-border">•</span>
                      <span className="flex items-center gap-1"><MapPin className="size-3" /> {req.region?.name || 'محذوفة'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(req.status)}
                  <span className="text-xs text-muted-foreground font-mono bg-card px-2 py-1 rounded-md border border-border">#{req.id}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-secondary/20 rounded-xl border border-dashed border-border">
            <div className="size-16 rounded-full bg-card grid place-items-center mb-4 shadow-sm border border-border">
              <FileText className="size-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-bold text-foreground mb-1">لا يوجد طلبات بعد</h3>
            <p className="text-sm text-muted-foreground">لم يتم تقديم أي طلبات في النظام حتى الآن.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any, label: string, value: string | number, color: string, bg: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`size-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
          <Icon className="size-6" />
        </div>
        <div className="font-display text-3xl font-black text-foreground">{value}</div>
      </div>
      <div className="text-sm font-bold text-muted-foreground">{label}</div>
    </div>
  );
}
