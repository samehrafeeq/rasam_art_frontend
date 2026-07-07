import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Plus, Edit, Trash2, MapPin, Phone, Settings2, X, Check, Users } from "lucide-react";
import { toast } from "sonner";
import { SERVICES_DATA } from "../../lib/services-data";
import { hasPermission, getUser, isBranchScoped } from "../../lib/permissions-helper";

export const Route = createFileRoute("/admin/regions")({
  component: AdminRegionsPage,
});

type Region = {
  id: number;
  name: string;
  description: string;
  phoneNumbers: string;
  disabledServiceIds: number[];
};

function AdminRegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  
  const [formData, setFormData] = useState<{name: string, description: string, phoneNumbers: string[]}>({ name: '', description: '', phoneNumbers: [''] });
  const [managingServicesRegion, setManagingServicesRegion] = useState<any | null>(null);
  const [disabledServices, setDisabledServices] = useState<number[]>([]);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const data = await fetchApi('/regions');
      const user = getUser();
      if (isBranchScoped() && user?.regionId) {
        setRegions(data.filter((r: Region) => r.id === user.regionId));
      } else {
        setRegions(data);
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء تحميل المناطق');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        phoneNumbers: formData.phoneNumbers.filter(p => p.trim() !== '').join(', ')
      };
      
      if (editingRegion) {
        await fetchApi(`/regions/${editingRegion.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('تم تحديث المنطقة بنجاح');
      } else {
        await fetchApi('/regions', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('تم إضافة المنطقة بنجاح');
      }
      setIsModalOpen(false);
      loadRegions();
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المنطقة؟')) return;
    try {
      await fetchApi(`/regions/${id}`, { method: 'DELETE' });
      toast.success('تم حذف المنطقة');
      loadRegions();
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const openManageServices = (region: any) => {
    setManagingServicesRegion(region);
    setDisabledServices(region.disabledServiceIds || []);
  };

  const toggleService = (serviceId: number) => {
    setDisabledServices(prev => 
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const saveServices = async () => {
    try {
      await api.put(`/regions/${managingServicesRegion.id}`, { disabledServiceIds: disabledServices });
      toast.success('تم حفظ إعدادات الخدمات بنجاح');
      setManagingServicesRegion(null);
      fetchRegions();
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">إدارة المناطق</h1>
          <p className="text-muted-foreground text-sm mt-1">أضف مناطق عملك وتحكم بالخدمات المتاحة في كل منطقة</p>
        </div>
        {hasPermission('regions.create') && (
          <button 
            onClick={() => {
              setEditingRegion(null);
              setFormData({ name: '', description: '', phoneNumbers: [''] });
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="size-4 mr-2" />
            إضافة منطقة
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="size-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map(region => (
            <div key={region.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="size-5 text-gold" />
                  </div>
                  <h3 className="font-bold text-lg">{region.name}</h3>
                </div>
                <div className="flex gap-2">
                  {hasPermission('regions.edit') && (
                    <button onClick={() => { 
                      setEditingRegion(region); 
                      setFormData({ 
                        name: region.name, 
                        description: region.description || '', 
                        phoneNumbers: region.phoneNumbers ? region.phoneNumbers.split(',').map((p: string) => p.trim()) : [''] 
                      }); 
                      setIsModalOpen(true); 
                    }} className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-secondary rounded-md"><Edit className="size-4" /></button>
                  )}
                  {hasPermission('regions.delete') && (
                    <button onClick={() => handleDelete(region.id)} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors bg-secondary rounded-md"><Trash2 className="size-4" /></button>
                  )}
                </div>
              </div>

              {region.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{region.description}</p>}
              
              {region.phoneNumbers && (
                <div className="flex items-center gap-2 text-sm text-foreground mb-6 font-medium">
                  <Phone className="size-4 text-muted-foreground" />
                  <span dir="ltr">{region.phoneNumbers}</span>
                </div>
              )}

              <button 
                onClick={() => openManageServices(region)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-semibold"
              >
                <Settings2 className="size-4 text-gold" />
                تخصيص الخدمات
              </button>
            </div>
          ))}
          {regions.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl">
              <MapPin className="size-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">لا يوجد مناطق مضافة حالياً</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Region Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
              <h2 className="text-xl font-bold font-display">{editingRegion ? 'تعديل المنطقة' : 'إضافة منطقة جديدة'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X className="size-5" /></button>
            </div>
            <form onSubmit={handleSaveRegion} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">اسم المنطقة <span className="text-red-500">*</span></label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="مثال: الرياض" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">الوصف (اختياري)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field min-h-[100px]" placeholder="معلومات إضافية عن المنطقة..." />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold">أرقام الهواتف (اختياري)</label>
                </div>
                <div className="space-y-2">
                  {formData.phoneNumbers.map((phone, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input 
                          value={phone} 
                          onChange={e => {
                            const newPhones = [...formData.phoneNumbers];
                            newPhones[idx] = e.target.value;
                            setFormData({...formData, phoneNumbers: newPhones});
                          }} 
                          className="input-field pr-10" 
                          placeholder="مثال: 05XXXXXXXX" 
                          dir="ltr"
                        />
                        <Phone className="size-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                      {formData.phoneNumbers.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => {
                            const newPhones = formData.phoneNumbers.filter((_, i) => i !== idx);
                            setFormData({...formData, phoneNumbers: newPhones});
                          }}
                          className="p-3 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, phoneNumbers: [...formData.phoneNumbers, '']})}
                  className="text-sm font-bold text-primary hover:text-gold flex items-center gap-1 mt-3 transition-colors"
                >
                  <Plus className="size-4" /> إضافة رقم آخر
                </button>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="btn-primary flex-1">حفظ البيانات</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Services Modal */}
      {managingServicesRegion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30 shrink-0">
              <div>
                <h2 className="text-xl font-bold font-display">تخصيص خدمات ({managingServicesRegion.name})</h2>
                <p className="text-xs text-muted-foreground mt-1">الخدمات المفعلة ستظهر للعملاء عند اختيار هذه المنطقة</p>
              </div>
              <button onClick={() => setManagingServicesRegion(null)} className="p-2 hover:bg-black/5 rounded-full"><X className="size-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-secondary/10">
              <div className="space-y-3">
                {SERVICES_DATA.map(service => {
                  const isEnabled = !disabledServices.includes(service.id);
                  return (
                    <div 
                      key={service.id} 
                      onClick={() => toggleService(service.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        isEnabled ? 'bg-card border-gold/40 shadow-sm' : 'bg-secondary/50 border-border opacity-60 grayscale'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`size-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          isEnabled ? 'bg-gold text-primary-foreground' : 'bg-secondary border border-border'
                        }`}>
                          {isEnabled && <Check className="size-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{service.duration}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isEnabled ? 'bg-green-500/10 text-green-600' : 'bg-secondary text-muted-foreground'}`}>
                        {isEnabled ? 'مفعلة' : 'معطلة'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-border bg-card shrink-0 flex gap-3">
              <button onClick={saveServices} className="btn-primary flex-1">حفظ الإعدادات</button>
              <button onClick={() => setManagingServicesRegion(null)} className="px-6 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
