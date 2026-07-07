import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Shield, Save, Loader2, Check } from "lucide-react";
import { getUser, getRoleLabel } from "../../lib/permissions-helper";

export const Route = createFileRoute("/admin/roles")({
  beforeLoad: () => {
    const user = getUser();
    if (!user || user.role !== 'ADMIN') {
      throw redirect({ to: '/admin' });
    }
  },
  component: AdminRolesPage,
});

type PermissionItem = { permission: string; granted: boolean };
type RolePermissions = Record<string, PermissionItem[]>;
type Catalogue = {
  permissions: string[];
  labels: Record<string, string>;
  categories: { label: string; permissions: string[] }[];
  roleLabels: Record<string, string>;
};

function AdminRolesPage() {
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({});
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  // Store changes locally before saving
  const [pendingChanges, setPendingChanges] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, rolesRes] = await Promise.all([
        api.get('/permissions/catalogue'),
        api.get('/permissions/roles')
      ]);
      setCatalogue(catRes.data);
      setRolePermissions(rolesRes.data);
      
      // Initialize pending changes
      const initialPending: Record<string, Record<string, boolean>> = {};
      Object.keys(rolesRes.data).forEach(role => {
        initialPending[role] = {};
        rolesRes.data[role].forEach((p: PermissionItem) => {
          initialPending[role][p.permission] = p.granted;
        });
      });
      setPendingChanges(initialPending);

    } catch {
      toast.error('حدث خطأ أثناء تحميل الصلاحيات');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (role: string, permission: string, value: boolean) => {
    setPendingChanges(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: value
      }
    }));
  };

  const handleSaveRole = async (role: string) => {
    try {
      setSavingRole(role);
      const updates = Object.entries(pendingChanges[role]).map(([permission, granted]) => ({
        permission,
        granted
      }));

      const res = await api.patch(`/permissions/roles/${role}`, { updates });
      setRolePermissions(res.data);
      toast.success(`تم حفظ صلاحيات ${getRoleLabel(role)} بنجاح`);
    } catch {
      toast.error('حدث خطأ أثناء حفظ الصلاحيات');
    } finally {
      setSavingRole(null);
    }
  };

  const hasUnsavedChanges = (role: string) => {
    if (!rolePermissions[role] || !pendingChanges[role]) return false;
    return rolePermissions[role].some(
      p => pendingChanges[role][p.permission] !== p.granted
    );
  };

  if (loading || !catalogue) {
    return <div className="flex justify-center py-12"><div className="size-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const roles = Object.keys(rolePermissions);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Shield className="size-6 text-gold" />
            إدارة الصلاحيات
          </h1>
          <p className="text-muted-foreground text-sm mt-1">تخصيص الصلاحيات لكل دور في النظام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map(role => (
          <div key={role} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border bg-secondary/30 flex justify-between items-center">
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">{getRoleLabel(role)}</h2>
                <p className="text-xs text-muted-foreground">صلاحيات هذا الدور تطبق على كافة المستخدمين المعينين له</p>
              </div>
              <button
                onClick={() => handleSaveRole(role)}
                disabled={savingRole === role || !hasUnsavedChanges(role)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  hasUnsavedChanges(role) 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90' 
                    : 'bg-secondary text-muted-foreground opacity-50 cursor-not-allowed'
                }`}
              >
                {savingRole === role ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                حفظ
              </button>
            </div>
            
            <div className="p-5 space-y-6 flex-1 bg-secondary/10">
              {catalogue.categories.map(category => (
                <div key={category.label} className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="bg-secondary/50 px-4 py-2.5 font-bold text-sm text-foreground border-b border-border flex items-center gap-2">
                    {category.label}
                  </div>
                  <div className="divide-y divide-border">
                    {category.permissions.map(perm => {
                      const isGranted = pendingChanges[role]?.[perm] ?? false;
                      return (
                        <div key={perm} className="flex items-center justify-between p-3 hover:bg-secondary/20 transition-colors">
                          <span className="text-sm font-medium">{catalogue.labels[perm] || perm}</span>
                          
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isGranted}
                            onClick={() => handleToggle(role, perm, !isGranted)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isGranted ? 'bg-green-500' : 'bg-secondary'
                            }`}
                          >
                            <span
                              className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                                isGranted ? '-translate-x-5' : 'translate-x-0'
                              }`}
                            >
                              {isGranted && <Check className="size-3 text-green-500" />}
                            </span>
                          </button>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
