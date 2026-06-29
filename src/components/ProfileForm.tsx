import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { User, Mail, Phone, Lock, Save, Loader2 } from "lucide-react";

export function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setFormData(prev => ({
        ...prev,
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || ''
      }));
    } catch {
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await api.patch('/auth/profile', payload);
      toast.success('تم تحديث البيانات بنجاح');
      
      // Update local storage name if changed
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.name = res.data.name;
        localStorage.setItem('user', JSON.stringify(user));
        // Dispatch event to update sidebar
        window.dispatchEvent(new Event('auth-change'));
      }
      
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="size-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden max-w-3xl">
      <div className="p-6 sm:p-8 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-gold/20 flex items-center justify-center text-gold font-bold text-3xl border border-gold/30 shrink-0">
            {formData.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">المعلومات الشخصية</h2>
            <p className="text-sm text-muted-foreground mt-1">قم بتحديث بيانات حسابك وتغيير كلمة المرور</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              الاسم الكامل
            </label>
            <input 
              type="text" 
              className="input-field w-full"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              البريد الإلكتروني
            </label>
            <input 
              type="email" 
              className="input-field w-full bg-secondary/30"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              رقم الهاتف
            </label>
            <input 
              type="tel" 
              className="input-field w-full bg-secondary/30"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              dir="ltr"
            />
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-border">
          <h3 className="text-lg font-bold font-display mb-4">تغيير كلمة المرور</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Lock className="size-4 text-muted-foreground" />
                كلمة المرور الجديدة
              </label>
              <input 
                type="password" 
                className="input-field w-full"
                placeholder="اتركه فارغاً إذا لم ترد تغييره"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                minLength={6}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Lock className="size-4 text-muted-foreground" />
                تأكيد كلمة المرور
              </label>
              <input 
                type="password" 
                className="input-field w-full"
                placeholder="تأكيد كلمة المرور الجديدة"
                value={formData.confirmPassword}
                onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                minLength={6}
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="size-4" /> حفظ التعديلات
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
