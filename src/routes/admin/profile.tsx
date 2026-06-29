import { createFileRoute } from "@tanstack/react-router";
import { ProfileForm } from "../../components/ProfileForm";

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfile,
});

function AdminProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">إعدادات الحساب</h1>
        <p className="text-muted-foreground mt-2">إدارة حساب مدير النظام وتحديث كلمة المرور</p>
      </div>
      
      <ProfileForm />
    </div>
  );
}
