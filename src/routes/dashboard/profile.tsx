import { createFileRoute } from "@tanstack/react-router";
import { ProfileForm } from "../../components/ProfileForm";

export const Route = createFileRoute("/dashboard/profile")({
  component: DashboardProfile,
});

function DashboardProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">حسابي</h1>
        <p className="text-muted-foreground mt-2">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
      </div>
      
      <ProfileForm />
    </div>
  );
}
