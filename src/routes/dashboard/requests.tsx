import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Clock, CheckCircle, XCircle, MapPin, FileText, Info } from "lucide-react";
import { toast } from "sonner";
import { SERVICES_DATA } from "../../lib/services-data";

export const Route = createFileRoute("/dashboard/requests")({
  component: UserRequestsPage,
});

function UserRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        fetchMyRequests(user.id);
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMyRequests = async (userId: number) => {
    try {
      const res = await api.get(`/requests?userId=${userId}`);
      setRequests(res.data);
    } catch {
      toast.error('حدث خطأ أثناء تحميل طلباتك');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING': return { text: 'قيد المراجعة', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
      case 'ACCEPTED': return { text: 'تم القبول', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/10' };
      case 'REJECTED': return { text: 'مرفوض', icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10' };
      default: return { text: 'مجهول', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

  const getServiceName = (id: number) => SERVICES_DATA.find(s => s.id === id)?.name || 'خدمة غير معروفة';

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-foreground mb-2">طلباتي</h1>
        <p className="text-muted-foreground text-sm md:text-base">تابع حالة طلباتك للخدمات الهندسية وملاحظات الإدارة عليها.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map(req => {
          const status = getStatusDisplay(req.status);
          const StatusIcon = status.icon;

          return (
            <div key={req.id} className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${status.bg} ${status.color}`}>
                    <StatusIcon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{getServiceName(req.serviceId)}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="size-4" />
                      <span>{req.region?.name || 'منطقة محذوفة'}</span>
                      <span className="text-border mx-1">|</span>
                      <span>طلب رقم #{req.id}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 w-fit ${status.bg} ${status.color}`}>
                  <StatusIcon className="size-4" />
                  {status.text}
                </div>
              </div>

              {req.message && (
                <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <p className="text-xs font-bold text-muted-foreground mb-1">ملاحظاتك:</p>
                  <p className="text-sm text-foreground">{req.message}</p>
                </div>
              )}

              {req.status === 'REJECTED' && req.rejectReason && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                  <Info className="size-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-600 mb-1">سبب الرفض من الإدارة:</p>
                    <p className="text-sm text-red-700">{req.rejectReason}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {requests.length === 0 && (
          <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-card">
            <FileText className="size-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-bold text-lg text-foreground">لا يوجد طلبات حالياً</h3>
            <p className="text-muted-foreground mt-1">لم تقم بطلب أي خدمة هندسية حتى الآن.</p>
          </div>
        )}
      </div>
    </div>
  );
}
