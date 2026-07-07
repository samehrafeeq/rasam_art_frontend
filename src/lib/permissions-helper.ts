export const PERMISSIONS = {
  REQUESTS_VIEW: 'requests.view',
  REQUESTS_ACCEPT: 'requests.accept',
  REQUESTS_REJECT: 'requests.reject',
  REQUESTS_REVIEW_REJECTION: 'requests.review_rejection',

  REGIONS_VIEW: 'regions.view',
  REGIONS_CREATE: 'regions.create',
  REGIONS_EDIT: 'regions.edit',
  REGIONS_DELETE: 'regions.delete',

  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_ASSIGN_ROLE: 'users.assign_role',

  WHATSAPP_MANAGE: 'whatsapp.manage',
  MESSAGES_VIEW: 'messages.view',
  SETTINGS_MANAGE: 'settings.manage',
  DASHBOARD_VIEW: 'dashboard.view',
};

export const ADMIN_PANEL_ROLES = ['ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE'];

export function getUser(): {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  regionId?: number;
  permissions?: string[];
} | null {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function hasPermission(permission: string): boolean {
  const user = getUser();
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return user.permissions?.includes(permission) ?? false;
}

export function canAccessAdminPanel(): boolean {
  const user = getUser();
  if (!user) return false;
  return ['ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE'].includes(user.role);
}

export function isBranchScoped(): boolean {
  const user = getUser();
  if (!user) return false;
  return ['EMPLOYEE', 'BRANCH_MANAGER'].includes(user.role);
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'ADMIN': return 'مالك النظام';
    case 'BRANCH_MANAGER': return 'مدير فرع';
    case 'EMPLOYEE': return 'موظف';
    case 'USER': return 'عميل';
    default: return role;
  }
}
