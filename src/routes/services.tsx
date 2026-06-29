import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { MapPin, Search, ArrowLeft, Clock, FileText, CheckCircle, ShieldCheck, HardHat, Compass } from "lucide-react";
import { SERVICES_DATA, BaseService } from "../lib/services-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "الخدمات والمناطق — رسّام آرت" },
      { name: "description", content: "استعرض الخدمات الهندسية المتاحة في منطقتك واطلبها بسهولة." },
    ],
  }),
  component: PublicServicesPage,
});

function PublicServicesPage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await api.get('/regions');
      setRegions(res.data);
    } catch {
      // Fallback or handle error
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = (service: BaseService) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      // Logged in -> redirect to dashboard services to make the actual request
      navigate({ to: '/dashboard/services' });
    } else {
      // Not logged in -> redirect to signup
      navigate({ to: '/signup' });
    }
  };

  const filteredRegions = regions.filter(r => r.name.includes(searchQuery));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        
        <div className="relative z-20 mx-auto max-w-7xl px-6 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/30 text-gold font-bold text-sm mb-6">
            <ShieldCheck className="size-4" /> خدمات هندسية معتمدة
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black max-w-4xl leading-tight mb-6 text-white drop-shadow-lg">
            اكتشف خدماتنا الهندسية المتاحة في <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-500">منطقتك</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-white/80 font-medium leading-relaxed">
            نغطي مختلف مناطق المملكة لتوفير التصاميم، التراخيص، والإشراف الهندسي بأعلى معايير الكود السعودي.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 -mt-8 relative z-30">
        {!selectedRegion ? (
          <div className="bg-card rounded-3xl shadow-xl border border-border p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-black font-display flex items-center gap-3">
                  <MapPin className="size-8 text-gold" /> اختر المنطقة
                </h2>
                <p className="text-muted-foreground mt-2">يرجى تحديد منطقتك لعرض الخدمات المتاحة وتفاصيلها.</p>
              </div>
              
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <Search className="size-5 text-muted-foreground" />
                </div>
                <input 
                  type="text" 
                  className="input-field pr-12 w-full bg-secondary/50 border-transparent focus:border-gold py-4 rounded-2xl shadow-inner text-base" 
                  placeholder="ابحث عن منطقتك هنا..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="size-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRegions.map(region => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region)}
                    className="bg-secondary/20 border border-border/50 p-6 rounded-2xl text-right hover:bg-card hover:border-gold/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 group-hover:bg-gold/20 transition-colors"></div>
                    <div className="relative z-10">
                      <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg mb-5 group-hover:scale-110 group-hover:shadow-gold/30 transition-all">
                        <MapPin className="size-7 text-gold" />
                      </div>
                      <h3 className="font-bold text-2xl mb-2 font-display">{region.name}</h3>
                      {region.description && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{region.description}</p>}
                      
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">الخدمات متوفرة</span>
                        <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:text-gold transition-colors">
                          تصفح الخدمات
                          <ArrowLeft className="size-4" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredRegions.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/10">
                    <MapPin className="size-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="font-bold text-xl font-display">لم يتم العثور على مناطق</h3>
                    <p className="text-muted-foreground mt-2">يرجى التأكد من كلمة البحث أو المحاولة لاحقاً.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-3xl shadow-xl border border-border p-8 md:p-12 animate-in slide-in-from-right-8 duration-500">
            <button 
              onClick={() => setSelectedRegion(null)}
              className="text-muted-foreground hover:text-foreground text-sm font-bold flex items-center gap-2 mb-8 transition-colors bg-secondary/50 hover:bg-secondary px-4 py-2 rounded-full w-fit"
            >
              <ArrowLeft className="size-4 rotate-180" /> عودة لقائمة المناطق
            </button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-8 border-b border-border">
              <div>
                <h1 className="text-4xl font-black font-display text-foreground mb-3 flex items-center gap-4">
                  <MapPin className="size-10 text-gold" /> {selectedRegion.name}
                </h1>
                <p className="text-muted-foreground text-lg">{selectedRegion.description || 'استعرض الخدمات الهندسية المتاحة واطلب الخدمة التي تناسب مشروعك.'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {SERVICES_DATA.map(service => {
                const isDisabled = selectedRegion.disabledServiceIds?.includes(service.id);
                if (isDisabled) return null;

                return (
                  <div key={service.id} className="bg-secondary/10 border border-border rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all flex flex-col group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <h3 className="font-bold text-2xl font-display text-primary leading-snug">{service.name}</h3>
                      <div className="bg-white text-primary border border-border shadow-sm px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0">
                        <Clock className="size-4 text-gold" /> {service.duration}
                      </div>
                    </div>
                    
                    <div className="space-y-6 mb-8 mt-auto relative z-10">
                      <div className="bg-card p-5 rounded-2xl border border-border/50">
                        <span className="text-sm font-bold text-gold uppercase flex items-center gap-2 mb-2">
                          <FileText className="size-4" /> المتطلبات الأساسية
                        </span>
                        <p className="text-sm font-medium text-foreground leading-relaxed">{service.requirements}</p>
                      </div>
                      <div className="bg-card p-5 rounded-2xl border border-border/50">
                        <span className="text-sm font-bold text-gold uppercase flex items-center gap-2 mb-2">
                          <CheckCircle className="size-4" /> المخرجات المتوقعة
                        </span>
                        <p className="text-sm font-medium text-foreground leading-relaxed">{service.outputs}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRequestClick(service)}
                      className="w-full btn-primary py-4 text-lg font-bold shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:-translate-y-1 transition-all relative z-10 overflow-hidden group/btn"
                    >
                      <span className="relative z-10">اطلب الخدمة الآن</span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
