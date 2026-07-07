import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Search, Filter, CheckCircle, XCircle, Clock, MapPin, User, FileText, Check, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { SERVICES_DATA } from "../../lib/services-data";
import { getUser, hasPermission } from "../../lib/permissions-helper";

export const Route = createFileRoute("/admin/requests")({
  component: AdminRequestsPage,
});

function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'ALL' ? '/requests' : `/requests?status=${filterStatus}`;
      const res = await api.get(url);
      setRequests(res.data);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string, reason?: string) => {
    try {
      await api.patch(`/requests/${id}/status`, { status, rejectReason: reason });
      toast.success(status === 'ACCEPTED' ? 'تم قبول الطلب بنجاح' : 'تم رفض الطلب');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      fetchRequests();
    } catch {
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock className="size-3"/> قيد المراجعة</span>;
      case 'PENDING_REJECTION': return <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle className="size-3"/> بانتظار مراجعة الرفض</span>;
      case 'ACCEPTED': return <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="size-3"/> مقبول</span>;
      case 'REJECTED': return <span className="bg-red-500/10 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="size-3"/> مرفوض</span>;
      default: return null;
    }
  };

  const getServiceName = (id: number) => SERVICES_DATA.find(s => s.id === id)?.name || 'خدمة غير معروفة';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">طلبات الخدمات</h1>
          <p className="text-muted-foreground text-sm mt-1">مراجعة وإدارة طلبات الخدمات المقدمة من العملاء</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full md:max-w-md">
          <input 
            type="text" 
            placeholder="ابحث عن اسم العميل أو رقم الهاتف..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 pr-4 w-full bg-secondary/50 border-transparent focus:border-gold focus:bg-card"
          />
          <Search className="size-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {['ALL', 'PENDING', 'PENDING_REJECTION', 'ACCEPTED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                filterStatus === status 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              }`}
            >
              {status === 'ALL' ? 'الكل' : status === 'PENDING' ? 'قيد المراجعة' : status === 'PENDING_REJECTION' ? 'بانتظار مراجعة الرفض' : status === 'ACCEPTED' ? 'المقبولة' : 'المرفوضة'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="size-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.filter(req => 
            req.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            req.user.phone.includes(searchQuery)
          ).map(req => (
            <div 
              key={req.id} 
              onClick={() => setSelectedRequest(req)}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-gold/30 transition-all cursor-pointer flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(req.status)}
                <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-1 rounded-md">#{req.id}</span>
              </div>
              
              <h3 className="font-bold text-lg mb-4 text-foreground line-clamp-2 group-hover:text-gold transition-colors">
                {getServiceName(req.serviceId)}
              </h3>
              
              <div className="space-y-2 mt-auto pt-4 border-t border-border bg-secondary/10 -mx-5 -mb-5 p-5 rounded-b-xl">
                <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                  <User className="size-4 text-gold" />
                  <span className="truncate">{req.user.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  <span className="truncate">{req.region?.name || 'منطقة محذوفة'}</span>
                </div>
              </div>
            </div>
          ))}
          {requests.filter(req => 
            req.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            req.user.phone.includes(searchQuery)
          ).length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed border-border rounded-2xl bg-card/50">
              <div className="size-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                <Search className="size-8 text-muted-foreground/50" />
              </div>
              <p className="text-foreground font-bold text-lg">لا يوجد طلبات مطابقة</p>
              <p className="text-muted-foreground text-sm mt-1">لم يتم العثور على أي طلبات تطابق الفلتر أو كلمة البحث</p>
            </div>
          )}
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && !showRejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}>
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex justify-between items-start sticky top-0 bg-card z-10">
              <div>
                <h2 className="text-xl font-bold font-display">{getServiceName(selectedRequest.serviceId)}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-muted-foreground">طلب رقم #{selectedRequest.id}</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="p-2 bg-secondary rounded-full hover:bg-black/5"><X className="size-5" /></button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* User Info */}
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="size-4" /> بيانات العميل
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">الاسم</p>
                    <p className="font-semibold text-sm">{selectedRequest.user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">رقم الهاتف</p>
                    <p className="font-semibold text-sm" dir="ltr">{selectedRequest.user.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</p>
                    <p className="font-semibold text-sm">{selectedRequest.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Request Info */}
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="size-4" /> تفاصيل الطلب
                </h3>
                <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">المنطقة المختارة</p>
                    <p className="font-semibold text-sm">{selectedRequest.region?.name || 'غير معروف'}</p>
                  </div>
                  {selectedRequest.message && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">رسالة العميل</p>
                      <p className="text-sm bg-background p-3 rounded-lg border border-border leading-relaxed whitespace-pre-wrap">
                        {selectedRequest.message}
                      </p>
                    </div>
                  )}
                  {selectedRequest.status === 'REJECTED' && selectedRequest.rejectReason && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                      <p className="text-xs text-red-600 mb-1 font-bold">سبب الرفض المسجل:</p>
                      <p className="text-sm text-red-700">{selectedRequest.rejectReason}</p>
                    </div>
                  )}
                  {selectedRequest.status === 'PENDING_REJECTION' && (
                    <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                      <p className="text-xs text-orange-600 mb-1 font-bold">سبب طلب الرفض المقترح:</p>
                      <p className="text-sm text-orange-700">{selectedRequest.rejectionRequestReason || 'لم يتم تحديد سبب'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedRequest.status === 'PENDING' && (
              <div className="p-6 border-t border-border bg-secondary/10 flex gap-3 sticky bottom-0">
                {hasPermission('requests.accept') && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'ACCEPTED')}
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-gold/20"
                  >
                    <Check className="size-5" /> قبول الطلب
                  </button>
                )}
                
                {getUser()?.role === 'EMPLOYEE' ? (
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    <AlertCircle className="size-5" /> طلب رفض
                  </button>
                ) : hasPermission('requests.reject') && (
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    <X className="size-5" /> رفض الطلب
                  </button>
                )}
              </div>
            )}
            
            {selectedRequest.status === 'PENDING_REJECTION' && hasPermission('requests.review_rejection') && (
              <div className="p-6 border-t border-border bg-secondary/10 flex gap-3 sticky bottom-0">
                <button 
                  onClick={async () => {
                    await api.patch(`/requests/${selectedRequest.id}/review-rejection`, { approved: true });
                    toast.success('تمت الموافقة على الرفض');
                    setSelectedRequest(null);
                    fetchRequests();
                  }}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  <X className="size-5" /> موافقة على الرفض
                </button>
                <button 
                  onClick={async () => {
                    await api.patch(`/requests/${selectedRequest.id}/review-rejection`, { approved: false });
                    toast.success('تم إعادة الطلب للمراجعة');
                    setSelectedRequest(null);
                    fetchRequests();
                  }}
                  className="flex-1 bg-secondary border border-border text-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
                >
                  <Clock className="size-5" /> إعادة للمراجعة
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border bg-red-500/5">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                {getUser()?.role === 'EMPLOYEE' ? <AlertCircle className="size-6" /> : <XCircle className="size-6" />} 
                {getUser()?.role === 'EMPLOYEE' ? 'تأكيد طلب الرفض' : 'تأكيد الرفض'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">هل أنت متأكد من {getUser()?.role === 'EMPLOYEE' ? 'طلب رفض' : 'رفض'} <span className="font-bold text-foreground">"{getServiceName(selectedRequest.serviceId)}"</span> للعميل <span className="font-bold text-foreground">{selectedRequest.user.name}</span>؟</p>
              <div>
                <label className="block text-sm font-semibold mb-2">سبب الرفض (اختياري - سيظهر للعميل)</label>
                <textarea 
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="اكتب سبب الرفض هنا لتوضيحه للعميل..."
                />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button 
                onClick={async () => {
                  if (getUser()?.role === 'EMPLOYEE') {
                    await api.patch(`/requests/${selectedRequest.id}/request-rejection`, { reason: rejectReason });
                    toast.success('تم تقديم طلب الرفض بنجاح');
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectReason('');
                    fetchRequests();
                  } else {
                    handleUpdateStatus(selectedRequest.id, 'REJECTED', rejectReason);
                  }
                }}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                {getUser()?.role === 'EMPLOYEE' ? 'تأكيد طلب الرفض' : 'تأكيد الرفض'}
              </button>
              <button 
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="px-6 py-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
