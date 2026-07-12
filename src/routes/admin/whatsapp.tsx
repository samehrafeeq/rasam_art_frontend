import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import {
  MessageCircle, RefreshCw, LogOut, CheckCircle2, AlertCircle,
  Plus, Trash2, X, Loader2, Building2, Wifi, WifiOff,
} from "lucide-react";

export const Route = createFileRoute("/admin/whatsapp")({
  head: () => ({
    meta: [{ title: "إعدادات الواتساب — رسّام آرت" }],
  }),
  component: AdminWhatsappPage,
});

type InstanceStatus = {
  id: number;
  name: string;
  status: "DISCONNECTED" | "CONNECTING" | "CONNECTED";
  qr?: string | null;
  phoneNumber?: string | null;
  regions: { id: number; name: string }[];
};

function AdminWhatsappPage() {
  const [instances, setInstances] = useState<InstanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [qrModal, setQrModalState] = useState<InstanceStatus | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  // Ref so the setInterval closure always reads the latest qrModal id
  const qrModalIdRef = useRef<number | null>(null);

  const setQrModal = (inst: InstanceStatus | null) => {
    qrModalIdRef.current = inst?.id ?? null;
    setQrModalState(inst);
  };

  useEffect(() => {
    loadInstances();
    const interval = setInterval(() => loadInstances(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const loadInstances = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await fetchApi("/whatsapp/instances");
      setInstances(data);
      // Update qr modal using the ref (avoids stale closure)
      if (qrModalIdRef.current !== null) {
        const updated = data.find((i: InstanceStatus) => i.id === qrModalIdRef.current);
        if (updated) setQrModalState(updated);
      }
    } catch (err: any) {
      // Silent fail on background polls
      if (showSpinner) toast.error(err.message || "حدث خطأ أثناء جلب البيانات");
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const data = await fetchApi("/whatsapp/instances", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim() }),
      });
      setInstances((prev) => [...prev, data]);
      setShowCreateModal(false);
      setNewName("");
      // Open QR modal for the newly created instance
      setQrModal(data);
      toast.success("تم إضافة رقم الواتساب");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الإضافة");
    } finally {
      setCreating(false);
    }
  };

  const openQrModal = async (instance: InstanceStatus) => {
    setQrModal(instance);
    if (instance.status !== "CONNECTED") {
      setQrLoading(true);
      try {
        const data = await fetchApi(`/whatsapp/instances/${instance.id}/qr`);
        setQrModal(data);
        setInstances((prev) => prev.map((i) => (i.id === data.id ? data : i)));
      } catch (err: any) {
        toast.error(err.message || "حدث خطأ");
      } finally {
        setQrLoading(false);
      }
    }
  };

  const handleLogout = async (instance: InstanceStatus) => {
    if (!confirm(`هل أنت متأكد من قطع اتصال "${instance.name}"؟ ستحتاج لمسح QR مرة أخرى.`)) return;
    try {
      await fetchApi(`/whatsapp/instances/${instance.id}/logout`, { method: "POST" });
      toast.success("تم قطع الاتصال");
      await loadInstances(false);
      if (qrModal?.id === instance.id) setQrModal(null);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    }
  };

  const handleDelete = async (instance: InstanceStatus) => {
    if (!confirm(`هل أنت متأكد من حذف "${instance.name}" بشكل نهائي؟`)) return;
    try {
      await fetchApi(`/whatsapp/instances/${instance.id}`, { method: "DELETE" });
      setInstances((prev) => prev.filter((i) => i.id !== instance.id));
      if (qrModal?.id === instance.id) setQrModal(null);
      toast.success("تم الحذف بنجاح");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    }
  };

  const statusColor = (s: InstanceStatus["status"]) => {
    if (s === "CONNECTED") return "text-green-500 bg-green-500/10 border-green-500/20";
    if (s === "CONNECTING") return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-muted-foreground bg-secondary border-border";
  };

  const statusLabel = (s: InstanceStatus["status"]) => {
    if (s === "CONNECTED") return "متصل";
    if (s === "CONNECTING") return "جاري الاتصال...";
    return "غير متصل";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="size-6 text-green-500" />
            أرقام الواتساب
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            أضف أرقام واتساب وخصص رقماً لكل فرع لإرسال الإشعارات منه.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="size-4" />
          إضافة رقم جديد
        </button>
      </div>

      {/* Instances Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="size-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : instances.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="size-20 bg-secondary rounded-full flex items-center justify-center">
            <MessageCircle className="size-10 text-muted-foreground opacity-40" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">لا توجد أرقام واتساب بعد</p>
            <p className="text-sm text-muted-foreground mt-1">أضف رقماً جديداً لبدء إرسال الإشعارات للعملاء.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary mt-2 flex items-center gap-2"
          >
            <Plus className="size-4" />
            إضافة أول رقم
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instances.map((instance) => (
            <div
              key={instance.id}
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 flex items-start justify-between gap-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`size-12 rounded-xl flex items-center justify-center border ${
                    instance.status === "CONNECTED"
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-secondary border-border"
                  }`}>
                    {instance.status === "CONNECTED"
                      ? <Wifi className="size-6 text-green-500" />
                      : <WifiOff className="size-6 text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{instance.name}</div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 ${statusColor(instance.status)}`}>
                      {instance.status === "CONNECTING" && <RefreshCw className="size-2.5 animate-spin" />}
                      {instance.status === "CONNECTED" && <CheckCircle2 className="size-2.5" />}
                      {statusLabel(instance.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(instance)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  title="حذف نهائي"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {/* Phone Number */}
              {instance.phoneNumber && (
                <div className="px-5 pt-3 pb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="size-3.5 text-green-500" />
                    <span className="font-bold text-green-600" dir="ltr">+{instance.phoneNumber}</span>
                  </div>
                </div>
              )}

              {/* Linked Regions */}
              <div className="px-5 pt-3 pb-5">
                {instance.regions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                      <Building2 className="size-3" /> الفروع:
                    </span>
                    {instance.regions.map((r) => (
                      <span key={r.id} className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full font-semibold">
                        {r.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="size-3" />
                    لم يُخصص لأي فرع بعد
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 flex gap-2">
                {instance.status === "CONNECTED" ? (
                  <button
                    onClick={() => handleLogout(instance)}
                    className="flex-1 h-9 text-sm font-semibold text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="size-3.5" />
                    قطع الاتصال
                  </button>
                ) : (
                  <button
                    onClick={() => openQrModal(instance)}
                    className="flex-1 h-9 text-sm font-bold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="size-3.5" />
                    ربط الرقم (QR)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-card w-full max-w-sm rounded-2xl shadow-elegant border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/50">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <Plus className="size-5 text-green-500" />
                إضافة رقم واتساب جديد
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-black/5 rounded-md transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">اسم الرقم (وصفي)</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: رقم فرع الرياض"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background focus:outline-none focus:border-green-500 transition-colors"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                بعد الإنشاء سيظهر رمز QR لمسحه بتطبيق واتساب.
              </p>
              <button
                type="submit"
                disabled={creating}
                className="w-full h-10 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {creating ? <><Loader2 className="size-4 animate-spin" /> جاري الإنشاء...</> : "إنشاء وعرض QR"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQrModal(null)} />
          <div className="relative bg-card w-full max-w-sm rounded-2xl shadow-elegant border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/50">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <MessageCircle className="size-5 text-green-500" />
                {qrModal.name}
              </h2>
              <button onClick={() => setQrModal(null)} className="p-1.5 hover:bg-black/5 rounded-md transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center text-center gap-4">
              {qrModal.status === "CONNECTED" ? (
                <>
                  <div className="size-20 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="size-10 text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">متصل بنجاح!</p>
                    {qrModal.phoneNumber && (
                      <p className="text-green-600 font-bold mt-1" dir="ltr">+{qrModal.phoneNumber}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setQrModal(null)}
                    className="w-full h-10 bg-secondary hover:bg-border rounded-md font-semibold transition-colors"
                  >
                    إغلاق
                  </button>
                </>
              ) : qrLoading ? (
                <div className="py-10">
                  <div className="size-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-muted-foreground text-sm mt-4">جاري تجهيز رمز QR...</p>
                </div>
              ) : qrModal.qr ? (
                <>
                  <div className="bg-white p-3 rounded-xl border border-border shadow-sm">
                    <img src={qrModal.qr} alt="WhatsApp QR Code" className="w-56 h-56 object-contain" />
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600 bg-yellow-500/10 px-4 py-2 rounded-lg text-sm">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>افتح واتساب ← الأجهزة المرتبطة ← ربط جهاز</span>
                  </div>
                  <p className="text-xs text-muted-foreground">يتم تحديث الحالة تلقائياً</p>
                </>
              ) : (
                <>
                  <WifiOff className="size-10 text-muted-foreground" />
                  <p className="text-muted-foreground">الرقم غير متصل</p>
                  <button
                    onClick={() => openQrModal(qrModal)}
                    className="w-full h-10 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors"
                  >
                    توليد رمز QR
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
