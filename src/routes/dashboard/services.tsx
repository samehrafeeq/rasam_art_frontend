import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { MapPin, ArrowLeft, Clock, FileText, CheckCircle, Search, X } from "lucide-react";
import { toast } from "sonner";
import { SERVICES_DATA, BaseService } from "../../lib/services-data";

export const Route = createFileRoute("/dashboard/services")({
  component: UserServicesPage,
});

function UserServicesPage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [requestingService, setRequestingService] = useState<BaseService | null>(null);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch {}
    }
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await api.get('/regions');
      setRegions(res.data);
    } catch {
      toast.error('حدث خطأ أثناء تحميل المناطق');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRegion || !requestingService) return;
    
    try {
      await api.post('/requests', {
        userId: user.id,
        regionId: selectedRegion.id,
        serviceId: requestingService.id,
        message: requestMessage
      });
      toast.success('تم إرسال طلبك بنجاح! يمكنك متابعته من صفحة طلباتي');
      setRequestingService(null);
      setRequestMessage('');
    } catch {
      toast.error('حدث خطأ أثناء إرسال الطلب');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {!selectedRegion ? (
        // Region Selection View
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-black font-display text-foreground mb-2">اختر المنطقة</h1>
            <p className="text-muted-foreground text-sm md:text-base">يرجى اختيار المنطقة التي يتواجد بها مشروعك لعرض الخدمات الهندسية المتاحة لها.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map(region => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region)}
                className="bg-card border border-border p-6 rounded-2xl text-right hover:border-gold/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className="size-12 rounded-xl bg-secondary flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <MapPin className="size-6" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{region.name}</h3>
                  {region.description && <p className="text-sm text-muted-foreground line-clamp-2">{region.description}</p>}
                  
                  <div className="mt-6 flex items-center gap-2 text-primary font-bold text-sm group-hover:text-gold transition-colors">
                    عرض الخدمات المتاحة
                    <ArrowLeft className="size-4" />
                  </div>
                </div>
              </button>
            ))}
            {regions.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-border rounded-2xl bg-card">
                <MapPin className="size-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-bold text-lg">لا توجد مناطق متاحة حالياً</h3>
                <p className="text-muted-foreground mt-1">يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Services View for Selected Region
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <button 
                onClick={() => setSelectedRegion(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold flex items-center gap-2 mb-4 transition-colors"
              >
                <ArrowLeft className="size-4 rotate-180" /> عودة لقائمة المناطق
              </button>
              <h1 className="text-3xl font-black font-display text-foreground mb-2 flex items-center gap-3">
                <MapPin className="size-8 text-gold" /> {selectedRegion.name}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">استعرض واطلب الخدمات الهندسية المتاحة في هذه المنطقة.</p>
            </div>
            
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="size-4 text-muted-foreground" />
              </div>
              <input type="text" className="input-field pr-10 w-full md:w-64 bg-card" placeholder="ابحث عن خدمة..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES_DATA.map(service => {
              const isDisabled = selectedRegion.disabledServiceIds?.includes(service.id);
              if (isDisabled) return null; // Don't show disabled services

              return (
                <div key={service.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-primary line-clamp-2 pl-4">{service.name}</h3>
                    <div className="bg-secondary/50 text-muted-foreground px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                      <Clock className="size-3.5" /> {service.duration}
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6 mt-auto">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1.5">
                        <FileText className="size-3.5" /> المتطلبات:
                      </span>
                      <p className="text-sm font-medium text-foreground leading-relaxed">{service.requirements}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1.5">
                        <CheckCircle className="size-3.5" /> المخرجات:
                      </span>
                      <p className="text-sm font-medium text-foreground leading-relaxed">{service.outputs}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setRequestingService(service)}
                    className="w-full btn-primary py-3 bg-secondary text-primary hover:bg-primary hover:text-primary-foreground border border-transparent hover:border-gold/30 transition-all shadow-none hover:shadow-lg hover:shadow-gold/20"
                  >
                    طلب هذه الخدمة
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {requestingService && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
              <h2 className="text-xl font-bold font-display">تأكيد طلب الخدمة</h2>
              <button onClick={() => setRequestingService(null)} className="p-2 hover:bg-black/5 rounded-full"><X className="size-5" /></button>
            </div>
            
            <form onSubmit={handleRequestSubmit} className="p-6 space-y-6">
              <div className="bg-secondary/30 p-4 rounded-xl border border-border space-y-3">
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-muted-foreground text-sm font-medium">الخدمة المطلوبة:</span>
                  <span className="font-bold text-sm text-left">{requestingService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm font-medium">المنطقة:</span>
                  <span className="font-bold text-sm text-left">{selectedRegion?.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">ملاحظات إضافية (اختياري)</label>
                <textarea 
                  value={requestMessage}
                  onChange={e => setRequestMessage(e.target.value)}
                  className="input-field min-h-[120px]" 
                  placeholder="اكتب هنا أي تفاصيل أو استفسارات إضافية تود إرفاقها مع الطلب..."
                />
                <p className="text-xs text-muted-foreground mt-2">سيتم مراجعة طلبك والتواصل معك في أقرب وقت لإتمام الإجراءات.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 shadow-gold">
                  تأكيد وإرسال الطلب
                </button>
                <button type="button" onClick={() => setRequestingService(null)} className="px-6 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-bold">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
