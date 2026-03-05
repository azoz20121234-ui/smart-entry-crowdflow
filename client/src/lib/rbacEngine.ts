/**
 * RBAC Engine - Role-Based Access Control
 * Smart Entry & CrowdFlow
 * 
 * Manages user roles, permissions, and access control
 */

export type UserRole = 'admin' | 'executive' | 'operator' | 'supervisor' | 'fan' | 'guest';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'view' | 'create' | 'edit' | 'delete' | 'manage';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  level: number; // Higher number = more permissions
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Define all available permissions
const PERMISSIONS: Record<string, Permission> = {
  // View permissions
  'view:dashboard': {
    id: 'view:dashboard',
    name: 'عرض لوحة التحكم',
    description: 'عرض لوحة التحكم الرئيسية',
    category: 'view',
  },
  'view:operator-dashboard': {
    id: 'view:operator-dashboard',
    name: 'عرض لوحة تحكم المنظمين',
    description: 'عرض لوحة تحكم إدارة الطوابير',
    category: 'view',
  },
  'view:executive-panel': {
    id: 'view:executive-panel',
    name: 'عرض لوحة التحكم التنفيذية',
    description: 'عرض لوحة التحكم التنفيذية والتنبؤات',
    category: 'view',
  },
  'view:strategic-dashboard': {
    id: 'view:strategic-dashboard',
    name: 'عرض لوحة التحكم الاستراتيجية',
    description: 'عرض لوحة التحكم الاستراتيجية والمحاكاة',
    category: 'view',
  },
  'view:crowd-dna': {
    id: 'view:crowd-dna',
    name: 'عرض تحليل بصمة الحشود',
    description: 'عرض تحليل سلوك الجماهير',
    category: 'view',
  },
  'view:users': {
    id: 'view:users',
    name: 'عرض قائمة المستخدمين',
    description: 'عرض جميع المستخدمين والأدوار',
    category: 'view',
  },
  'view:reports': {
    id: 'view:reports',
    name: 'عرض التقارير',
    description: 'عرض التقارير والإحصائيات',
    category: 'view',
  },
  'view:fan-interface': {
    id: 'view:fan-interface',
    name: 'عرض واجهة المشجع',
    description: 'عرض تطبيق المشجع',
    category: 'view',
  },

  // Create permissions
  'create:user': {
    id: 'create:user',
    name: 'إنشاء مستخدم جديد',
    description: 'إنشاء حساب مستخدم جديد',
    category: 'create',
  },
  'create:role': {
    id: 'create:role',
    name: 'إنشاء دور جديد',
    description: 'إنشاء دور مخصص جديد',
    category: 'create',
  },

  // Edit permissions
  'edit:user': {
    id: 'edit:user',
    name: 'تعديل بيانات المستخدم',
    description: 'تعديل معلومات المستخدم والدور',
    category: 'edit',
  },
  'edit:role': {
    id: 'edit:role',
    name: 'تعديل الدور',
    description: 'تعديل صلاحيات الدور',
    category: 'edit',
  },
  'edit:gate-settings': {
    id: 'edit:gate-settings',
    name: 'تعديل إعدادات البوابات',
    description: 'تعديل إعدادات البوابات والطوابير',
    category: 'edit',
  },

  // Delete permissions
  'delete:user': {
    id: 'delete:user',
    name: 'حذف مستخدم',
    description: 'حذف حساب مستخدم',
    category: 'delete',
  },
  'delete:role': {
    id: 'delete:role',
    name: 'حذف دور',
    description: 'حذف دور مخصص',
    category: 'delete',
  },

  // Manage permissions
  'manage:system': {
    id: 'manage:system',
    name: 'إدارة النظام',
    description: 'إدارة إعدادات النظام الكاملة',
    category: 'manage',
  },
  'manage:notifications': {
    id: 'manage:notifications',
    name: 'إدارة الإشعارات',
    description: 'إدارة الإشعارات والتنبيهات',
    category: 'manage',
  },
  'manage:gates': {
    id: 'manage:gates',
    name: 'إدارة البوابات',
    description: 'إدارة البوابات والتوزيع',
    category: 'manage',
  },
};

// Define default roles
const DEFAULT_ROLES: Record<UserRole, Role> = {
  admin: {
    id: 'admin',
    name: 'مسؤول النظام',
    description: 'لديه الوصول الكامل إلى جميع الميزات',
    permissions: Object.keys(PERMISSIONS),
    level: 100,
  },
  executive: {
    id: 'executive',
    name: 'المدير التنفيذي',
    description: 'الوصول إلى لوحات التحكم والتقارير الاستراتيجية',
    permissions: [
      'view:dashboard',
      'view:executive-panel',
      'view:strategic-dashboard',
      'view:crowd-dna',
      'view:reports',
      'manage:gates',
      'manage:notifications',
    ],
    level: 80,
  },
  operator: {
    id: 'operator',
    name: 'مشغل النظام',
    description: 'إدارة الطوابير والبوابات اليومية',
    permissions: [
      'view:dashboard',
      'view:operator-dashboard',
      'view:reports',
      'edit:gate-settings',
      'manage:gates',
    ],
    level: 50,
  },
  supervisor: {
    id: 'supervisor',
    name: 'المشرف',
    description: 'الإشراف على المشغلين والعمليات',
    permissions: [
      'view:dashboard',
      'view:operator-dashboard',
      'view:executive-panel',
      'view:reports',
      'view:users',
      'edit:gate-settings',
      'manage:gates',
      'manage:notifications',
    ],
    level: 60,
  },
  fan: {
    id: 'fan',
    name: 'مشجع',
    description: 'الوصول إلى تطبيق المشجع فقط',
    permissions: [
      'view:fan-interface',
    ],
    level: 10,
  },
  guest: {
    id: 'guest',
    name: 'ضيف',
    description: 'وصول محدود جداً',
    permissions: [
      'view:dashboard',
    ],
    level: 1,
  },
};

class RBACEngine {
  private permissions: Record<string, Permission> = PERMISSIONS;
  private roles: Record<string, Role> = DEFAULT_ROLES;
  private users: Map<string, User> = new Map();
  private currentUser: User | null = null;

  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers() {
    // Create default users for testing
    const defaultUsers: User[] = [
      {
        id: 'user-admin-001',
        name: 'مسؤول النظام',
        email: 'admin@smartentry.com',
        role: 'admin',
        permissions: this.roles.admin.permissions,
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      },
      {
        id: 'user-exec-001',
        name: 'محمد علي - المدير التنفيذي',
        email: 'executive@smartentry.com',
        role: 'executive',
        permissions: this.roles.executive.permissions,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'user-op-001',
        name: 'أحمد محمود - مشغل النظام',
        email: 'operator@smartentry.com',
        role: 'operator',
        permissions: this.roles.operator.permissions,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'user-sup-001',
        name: 'فاطمة حسن - المشرفة',
        email: 'supervisor@smartentry.com',
        role: 'supervisor',
        permissions: this.roles.supervisor.permissions,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'user-fan-001',
        name: 'علي محمد - مشجع',
        email: 'fan@smartentry.com',
        role: 'fan',
        permissions: this.roles.fan.permissions,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    defaultUsers.forEach(user => this.users.set(user.id, user));
    this.currentUser = this.users.get('user-admin-001') || null;
  }

  // Set current user
  setCurrentUser(userId: string): boolean {
    const user = this.users.get(userId);
    if (user && user.isActive) {
      this.currentUser = user;
      user.lastLogin = new Date();
      return true;
    }
    return false;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  // Check if user has any of the permissions
  hasAnyPermission(permissions: string[]): boolean {
    if (!this.currentUser) return false;
    return permissions.some(p => this.currentUser!.permissions.includes(p));
  }

  // Check if user has all permissions
  hasAllPermissions(permissions: string[]): boolean {
    if (!this.currentUser) return false;
    return permissions.every(p => this.currentUser!.permissions.includes(p));
  }

  // Check if user has role
  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  // Check if user has any role
  hasAnyRole(roles: UserRole[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }

  // Get all permissions
  getAllPermissions(): Permission[] {
    return Object.values(this.permissions);
  }

  // Get permission by ID
  getPermission(id: string): Permission | undefined {
    return this.permissions[id];
  }

  // Get all roles
  getAllRoles(): Role[] {
    return Object.values(this.roles);
  }

  // Get role by ID
  getRole(id: string): Role | undefined {
    return this.roles[id];
  }

  // Get all users
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Get user by ID
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  // Create new user
  createUser(user: Omit<User, 'permissions'>): User {
    const role = this.roles[user.role];
    if (!role) throw new Error(`Role ${user.role} not found`);

    const newUser: User = {
      ...user,
      permissions: role.permissions,
      createdAt: new Date(),
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  // Update user
  updateUser(userId: string, updates: Partial<User>): User | null {
    const user = this.users.get(userId);
    if (!user) return null;

    if (updates.role) {
      const role = this.roles[updates.role];
      if (!role) throw new Error(`Role ${updates.role} not found`);
      updates.permissions = role.permissions;
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Delete user
  deleteUser(userId: string): boolean {
    return this.users.delete(userId);
  }

  // Create custom role
  createRole(role: Role): Role {
    this.roles[role.id] = role;
    return role;
  }

  // Update role
  updateRole(roleId: string, updates: Partial<Role>): Role | null {
    const role = this.roles[roleId];
    if (!role) return null;

    const updatedRole = { ...role, ...updates };
    this.roles[roleId] = updatedRole;

    // Update users with this role
    this.users.forEach(user => {
      if (user.role === roleId) {
        user.permissions = updatedRole.permissions;
      }
    });

    return updatedRole;
  }

  // Get user statistics
  getUserStats() {
    const users = Array.from(this.users.values());
    const roleStats: Record<UserRole, number> = {
      admin: 0,
      executive: 0,
      operator: 0,
      supervisor: 0,
      fan: 0,
      guest: 0,
    };

    users.forEach(user => {
      roleStats[user.role]++;
    });

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      roleStats,
    };
  }

  // Get permission statistics
  getPermissionStats() {
    const permissions = Object.values(this.permissions);
    const categories: Record<string, number> = {
      view: 0,
      create: 0,
      edit: 0,
      delete: 0,
      manage: 0,
    };

    permissions.forEach(p => {
      categories[p.category]++;
    });

    return {
      totalPermissions: permissions.length,
      categories,
    };
  }

  // Check if can access route
  canAccessRoute(route: string): boolean {
    if (!this.currentUser) return false;

    const routePermissions: Record<string, string> = {
      '/operator': 'view:operator-dashboard',
      '/executive': 'view:executive-panel',
      '/strategic': 'view:strategic-dashboard',
      '/crowd-dna': 'view:crowd-dna',
      '/admin': 'manage:system',
      '/fan': 'view:fan-interface',
    };

    const requiredPermission = routePermissions[route];
    return requiredPermission ? this.hasPermission(requiredPermission) : true;
  }
}

export const rbacEngine = new RBACEngine();
