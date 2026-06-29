import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { MessageCircle, RefreshCw, LogOut, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/whatsapp")({
  head: () => ({
    meta: [
      { title: "إعدادات الواتساب — رسّام آرت" },
    ],
  }),
  component: AdminWhatsappPage,
});

type WhatsappStatus = {
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
  qr?: string | null;
  phoneNumber?: string | null;
};

function AdminWhatsappPage() {
  const [status, setStatus] = useState<WhatsappStatus>({ status: 'DISCONNECTED' });
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
    // Poll status every 5 seconds if not connected
    const interval = setInterval(() => {
      if (status.status !== 'CONNECTED') {
        checkStatus(false);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [status.status]);

  const checkStatus = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await fetchApi('/whatsapp/status');
      setStatus(data);
    } catch (err: any) {
      if (err.message.includes('مصرح') || err.message.includes('Unauthorized')) {
        navigate({ to: '/login' });
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const requestQr = async () => {
    setQrLoading(true);
    try {
      const data = await fetchApi('/whatsapp/qr');
      setStatus(data);
      if (data.status === 'CONNECTED') {
        toast.success("تم الاتصال بنجاح!");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء طلب الرمز");
    } finally {
      setQrLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("هل أنت متأكد من إلغاء ربط الواتساب؟ ستحتاج لمسح الرمز مرة أخرى.")) return;
    
    try {
      await fetchApi('/whatsapp/logout', { method: 'POST' });
      setStatus({ status: 'DISCONNECTED', qr: null });
      toast.success("تم تسجيل الخروج بنجاح");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تسجيل الخروج");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="size-6 text-green-500" />
            ربط واتساب
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            قم بربط رقم واتساب الخاص بالمنصة لإرسال إشعارات وتحديثات الطلبات للعملاء.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-10">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="size-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            
            {status.status === 'CONNECTED' ? (
              <>
                <div className="size-24 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="size-12 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">واتساب متصل ويعمل بنجاح</h2>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    رقم الواتساب الخاص بك متصل الآن بالنظام. يمكن للمنصة الآن إرسال الرسائل والإشعارات للعملاء تلقائياً.
                  </p>
                  {status.phoneNumber && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                      <MessageCircle className="size-5 text-green-600" />
                      <span className="font-bold text-green-800" dir="ltr">+{status.phoneNumber}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 w-full max-w-xs">
                  <button 
                    onClick={handleLogout}
                    className="w-full h-12 flex items-center justify-center gap-2 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors font-semibold"
                  >
                    <LogOut className="size-5" />
                    إلغاء الربط (تسجيل الخروج)
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="size-24 bg-secondary rounded-full flex items-center justify-center mb-2">
                  <MessageCircle className="size-10 text-muted-foreground" />
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-foreground">واتساب غير متصل</h2>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    اضغط على الزر أدناه لتوليد رمز الاستجابة السريعة (QR Code)، ثم قم بمسحه باستخدام تطبيق واتساب في هاتفك للربط.
                  </p>
                </div>

                {status.qr ? (
                  <div className="bg-white p-4 rounded-xl border border-border shadow-sm inline-block">
                    <img src={status.qr} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                    <p className="text-xs text-black/60 mt-3 font-semibold">
                      افتح واتساب &gt; الأجهزة المرتبطة &gt; ربط جهاز
                    </p>
                  </div>
                ) : (
                  <div className="pt-6 w-full max-w-xs">
                    <button 
                      onClick={requestQr}
                      disabled={qrLoading || status.status === 'CONNECTING'}
                      className="w-full h-12 flex items-center justify-center gap-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold disabled:opacity-70"
                    >
                      {qrLoading || status.status === 'CONNECTING' ? (
                        <>
                          <RefreshCw className="size-5 animate-spin" />
                          جاري تجهيز الكود...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="size-5" />
                          توليد رمز QR
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {status.status === 'CONNECTING' && !status.qr && (
                  <div className="flex items-center gap-2 text-yellow-600 bg-yellow-500/10 px-4 py-2 rounded-lg text-sm mt-4">
                    <AlertCircle className="size-4" />
                    <span>جاري الاتصال بخوادم واتساب... يرجى الانتظار</span>
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
