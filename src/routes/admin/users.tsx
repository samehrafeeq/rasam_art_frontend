import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Users, Phone, Mail, Calendar, Search, X, Edit, Trash2, ChevronRight, ChevronLeft, MapPin, Plus } from "lucide-react";
import { hasPermission, getRoleLabel, getUser, isBranchScoped } from "../../lib/permissions-helper";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "إدارة الأعضاء — رسّام آرت" },
    ],
  }),
  component: AdminUsersPage,
});

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  regionId?: number | null;
  region?: { id: number; name: string } | null;
  createdAt: string;
};

type PaginationMeta = {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
};

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // For creating a new user
  const [newUser, setNewUser] = useState({
    name: '', email: '', phone: '', password: '', role: 'USER', regionId: ''
  });

  const [regions, setRegions] = useState<{id: number, name: string}[]>([]);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadUsers();
    loadRegions();
  }, [currentPage]);

  const loadRegions = async () => {
    try {
      const data = await fetchApi('/regions');
      const user = getUser();
      if (isBranchScoped() && user?.regionId) {
        setRegions(data.filter((r: any) => r.id === user.regionId));
      } else {
        setRegions(data);
      }
    } catch {}
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Will trigger loadUsers via the other useEffect
      } else {
        loadUsers();
      }
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/users?page=${currentPage}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      setUsers(data.data);
      setMeta(data.meta);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء جلب الأعضاء");
      if (err.message.includes('مصرح') || err.message.includes('Unauthorized')) {
        navigate({ to: '/login' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await handleCreate();
      return;
    }
    
    if (!selectedUser) return;
    
    setIsUpdating(true);
    try {
      const updatedUser = await fetchApi(`/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: selectedUser.name,
          phone: selectedUser.phone,
          role: selectedUser.role,
          regionId: selectedUser.regionId ? Number(selectedUser.regionId) : null,
        })
      });
      
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      toast.success("تم تحديث بيانات العضو بنجاح");
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء التحديث");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreate = async () => {
    setIsUpdating(true);
    try {
      const createdUser = await fetchApi(`/users`, {
        method: 'POST',
        body: JSON.stringify({
          ...newUser,
          regionId: newUser.regionId ? Number(newUser.regionId) : null,
        })
      });
      
      setUsers([createdUser, ...users]);
      toast.success("تم إضافة العضو بنجاح");
      setModalMode('view');
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الإضافة");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العضو بشكل نهائي؟")) return;
    
    try {
      await fetchApi(`/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== id));
      toast.success("تم حذف العضو بنجاح");
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">الأعضاء المسجلين</h1>
          <p className="text-sm text-muted-foreground mt-1">عرض وإدارة جميع المستخدمين في منصة رسّام آرت</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="بحث بالاسم، الإيميل أو الجوال..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 h-10 pl-4 pr-10 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-gold transition-shadow"
          />
        </div>
        {hasPermission('users.create') && (
          <button 
            onClick={() => {
              setNewUser({ name: '', email: '', phone: '', password: '', role: 'USER', regionId: '' });
              setSelectedUser(null);
              setModalMode('create');
            }}
            className="btn-primary w-full sm:w-auto mt-4 sm:mt-0 whitespace-nowrap"
          >
            <Plus className="size-4 mr-2 inline-block" />
            إضافة عضو جديد
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="size-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Mobile Cards (Visible only on mobile) */}
            <div className="md:hidden divide-y divide-border">
              {users.map((user) => (
                <div key={user.id} className="p-4 space-y-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-foreground text-lg">{user.name}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">ID: {user.id}</div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedUser?.role === 'ADMIN' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-secondary text-muted-foreground border border-border'
                    }`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 bg-secondary/30 p-3 rounded-lg border border-border/50">
                    {user.region && (
                      <div className="flex items-center gap-3 text-sm text-foreground/90 mb-2">
                        <MapPin className="size-4 text-gold" />
                        <span>فرع: {user.region.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-foreground/90">
                      <Phone className="size-4 text-muted-foreground" />
                      <span dir="ltr">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/90">
                      <Mail className="size-4 text-muted-foreground" />
                      <span dir="ltr">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button 
                      onClick={() => { setSelectedUser(user); setModalMode('view'); }}
                      className="flex-1 h-9 text-xs font-semibold btn-outline border-border hover:bg-secondary rounded-md flex items-center justify-center gap-2"
                    >
                      <Users className="size-3.5" />
                      تفاصيل
                    </button>
                    {hasPermission('users.edit') && (
                      <button 
                        onClick={() => { setSelectedUser(user); setModalMode('edit'); }}
                        className="flex-1 h-9 text-xs font-semibold bg-secondary hover:bg-border transition-colors rounded-md flex items-center justify-center gap-2"
                      >
                        <Edit className="size-3.5" />
                        تعديل
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-right min-w-[900px] whitespace-nowrap">
                <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">الاسم</th>
                    <th className="px-6 py-4 font-semibold">التواصل</th>
                    <th className="px-6 py-4 font-semibold">الدور</th>
                    <th className="px-6 py-4 font-semibold">تاريخ الانضمام</th>
                    <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">ID: {user.id}</div>
                      </td>
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-foreground/90">
                          <Phone className="size-3.5 text-muted-foreground" />
                          <span dir="ltr" className="text-right">{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground/90">
                          <Mail className="size-3.5 text-muted-foreground" />
                          <span dir="ltr" className="text-right">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold w-fit ${
                            user.role === 'ADMIN' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-secondary text-muted-foreground border border-border'
                          }`}>
                            {getRoleLabel(user.role)}
                          </span>
                          {user.region && (
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="size-3 text-gold/70" />
                              {user.region.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="size-4" />
                          {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setSelectedUser(user); setModalMode('view'); }}
                            className="text-xs btn-outline px-3 py-1.5 inline-flex items-center gap-1.5 border-border hover:bg-secondary"
                          >
                            <Users className="size-3" />
                            عرض
                          </button>
                          {hasPermission('users.edit') && (
                            <button 
                              onClick={() => { setSelectedUser(user); setModalMode('edit'); }}
                              className="text-xs btn-outline px-3 py-1.5 inline-flex items-center gap-1.5"
                            >
                              <Edit className="size-3" />
                              تعديل
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {users.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                <Users className="size-10 mb-3 opacity-20" />
                <p>لا يوجد أعضاء مطابقين للبحث.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {meta && meta.lastPage > 1 && (
              <div className="p-4 border-t border-border bg-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  عرض الصفحة <span className="font-bold text-foreground mx-1">{meta.page}</span> 
                  من <span className="font-bold text-foreground mx-1">{meta.lastPage}</span>
                  (إجمالي الأعضاء: {meta.total})
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(meta.lastPage, p + 1))}
                    disabled={meta.page === meta.lastPage}
                    className="p-2 border border-border rounded-md hover:bg-secondary disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center gap-1"
                    title="الصفحة التالية"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={meta.page === 1}
                    className="p-2 border border-border rounded-md hover:bg-secondary disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center gap-1"
                    title="الصفحة السابقة"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details & Edit Modal */}
      {(selectedUser || modalMode === 'create') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedUser(null); setModalMode('view'); }} />
          <div className="relative bg-card w-full max-w-md rounded-2xl shadow-elegant border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/50">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                {modalMode === 'create' ? <Plus className="size-5 text-gold" /> : (modalMode === 'edit' ? <Edit className="size-5 text-gold" /> : <Users className="size-5 text-gold" />)}
                {modalMode === 'create' ? 'إضافة عضو جديد' : (modalMode === 'edit' ? 'تعديل بيانات العضو' : 'تفاصيل العضو')}
              </h2>
              <button onClick={() => { setSelectedUser(null); setModalMode('view'); }} className="p-1.5 hover:bg-black/5 rounded-md transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            {modalMode === 'edit' || modalMode === 'create' ? (
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">الاسم كامل</label>
                  <input 
                    type="text" 
                    value={modalMode === 'create' ? newUser.name : selectedUser?.name}
                    onChange={(e) => modalMode === 'create' ? setNewUser({...newUser, name: e.target.value}) : setSelectedUser({...selectedUser!, name: e.target.value})}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background focus:outline-none focus:border-gold transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    value={modalMode === 'create' ? newUser.email : selectedUser?.email}
                    disabled={modalMode === 'edit'}
                    onChange={(e) => modalMode === 'create' ? setNewUser({...newUser, email: e.target.value}) : undefined}
                    className={`w-full h-10 px-3 rounded-md border border-border ${modalMode === 'edit' ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed' : 'bg-background focus:border-gold'} focus:outline-none transition-colors`}
                    dir="ltr"
                    required={modalMode === 'create'}
                  />
                </div>

                {modalMode === 'create' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">كلمة المرور</label>
                    <input 
                      type="password" 
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background focus:outline-none focus:border-gold transition-colors text-right"
                      dir="ltr"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-1.5">رقم الهاتف</label>
                  <input 
                    type="text" 
                    value={modalMode === 'create' ? newUser.phone : selectedUser?.phone}
                    onChange={(e) => modalMode === 'create' ? setNewUser({...newUser, phone: e.target.value}) : setSelectedUser({...selectedUser!, phone: e.target.value})}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background focus:outline-none focus:border-gold transition-colors text-right"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">الصلاحية (الدور)</label>
                  <select 
                    value={modalMode === 'create' ? newUser.role : selectedUser?.role}
                    onChange={(e) => modalMode === 'create' ? setNewUser({...newUser, role: e.target.value}) : setSelectedUser({...selectedUser!, role: e.target.value})}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="USER">عميل</option>
                    <option value="EMPLOYEE">موظف</option>
                    <option value="BRANCH_MANAGER">مدير فرع</option>
                    <option value="ADMIN">مالك النظام</option>
                  </select>
                </div>

                {['EMPLOYEE', 'BRANCH_MANAGER'].includes(modalMode === 'create' ? newUser.role : (selectedUser?.role || '')) && (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">الفرع التابع له</label>
                    <select 
                      value={(modalMode === 'create' ? newUser.regionId : selectedUser?.regionId) || ''}
                      onChange={(e) => modalMode === 'create' ? setNewUser({...newUser, regionId: e.target.value}) : setSelectedUser({...selectedUser!, regionId: e.target.value ? Number(e.target.value) : undefined})}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background focus:outline-none focus:border-gold transition-colors"
                      required
                    >
                      <option value="" disabled>اختر الفرع...</option>
                      {regions.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="flex-1 h-10 bg-gold text-black font-bold rounded-md shadow-md hover:bg-gold/90 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'جاري الحفظ...' : (modalMode === 'create' ? 'إنشاء العضو' : 'حفظ التعديلات')}
                  </button>
                  {modalMode === 'edit' && hasPermission('users.delete') && selectedUser && (
                    <button 
                      type="button" 
                      onClick={() => handleDelete(selectedUser.id)}
                      className="h-10 px-4 border border-red-500/30 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center bg-red-500/5"
                      title="حذف العضو"
                    >
                      <Trash2 className="size-4.5" />
                    </button>
                  )}
                </div>
              </form>
            ) : selectedUser && (
              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="size-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-3xl font-black text-gold mb-4">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <h3 className="font-display font-bold text-xl">{selectedUser.name}</h3>
                  <div className="text-muted-foreground text-sm mt-1 flex items-center justify-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedUser.role === 'ADMIN' ? 'bg-gold/10 text-gold' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {getRoleLabel(selectedUser.role)}
                    </span>
                    <span>•</span>
                    <span dir="ltr">ID: {selectedUser.id}</span>
                  </div>
                  {selectedUser.region && (
                    <div className="mt-2 text-sm font-semibold text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20 flex items-center justify-center gap-1.5 mx-auto w-fit">
                      <MapPin className="size-3.5" />
                      {selectedUser.region.name}
                    </div>
                  )}
                </div>

                <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="size-4 text-muted-foreground" />
                    <span className="font-semibold w-16">الإيميل:</span>
                    <span dir="ltr" className="text-muted-foreground">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="font-semibold w-16">الجوال:</span>
                    <span dir="ltr" className="text-muted-foreground">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="font-semibold w-16">تاريخ الانضمام:</span>
                    <span className="text-muted-foreground">{new Date(selectedUser.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>

                {hasPermission('users.edit') && (
                  <button 
                    onClick={() => setModalMode('edit')}
                    className="w-full h-10 bg-secondary hover:bg-border text-foreground font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="size-4" />
                    الانتقال لتعديل البيانات
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
