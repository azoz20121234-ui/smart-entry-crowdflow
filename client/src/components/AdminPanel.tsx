/**
 * Admin Panel Component - User & Role Management
 * Smart Entry & CrowdFlow
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Shield, Lock, Trash2, Edit2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { rbacEngine, User, Role, UserRole } from '@/lib/rbacEngine';

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Load users and roles
    setUsers(rbacEngine.getAllUsers());
    setRoles(rbacEngine.getAllRoles());
    setStats(rbacEngine.getUserStats());
  }, []);

  const handleDeleteUser = (userId: string) => {
    if (confirm('هل تريد حذف هذا المستخدم؟')) {
      rbacEngine.deleteUser(userId);
      setUsers(rbacEngine.getAllUsers());
      setSelectedUser(null);
    }
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    rbacEngine.updateUser(userId, { role: newRole });
    setUsers(rbacEngine.getAllUsers());
  };

  const handleToggleUserActive = (userId: string) => {
    const user = rbacEngine.getUser(userId);
    if (user) {
      rbacEngine.updateUser(userId, { isActive: !user.isActive });
      setUsers(rbacEngine.getAllUsers());
    }
  };

  const roleOptions: UserRole[] = ['admin', 'executive', 'operator', 'supervisor', 'fan', 'guest'];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-md">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-600 mb-2">إجمالي المستخدمين</p>
              <p className="text-3xl font-bold text-blue-700">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-600 mb-2">المستخدمون النشطون</p>
              <p className="text-3xl font-bold text-green-700">{stats.activeUsers}</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-600 mb-2">عدد الأدوار</p>
              <p className="text-3xl font-bold text-purple-700">{roles.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-600 mb-2">عدد الصلاحيات</p>
              <p className="text-3xl font-bold text-orange-700">
                {rbacEngine.getAllPermissions().length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            المستخدمون
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            الأدوار
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            الصلاحيات
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>إدارة المستخدمين</CardTitle>
                <CardDescription>عرض وإدارة جميع المستخدمين والأدوار</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                مستخدم جديد
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.length > 0 ? (
                  users.map(user => (
                    <div
                      key={user.id}
                      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-slate-900">{user.name}</h4>
                            {user.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                نشط
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                <AlertCircle className="w-3 h-3" />
                                معطل
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{user.email}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                              {rbacEngine.getRole(user.role)?.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {user.permissions.length} صلاحية
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value as UserRole)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          >
                            {roleOptions.map(role => (
                              <option key={role} value={role}>
                                {rbacEngine.getRole(role)?.name}
                              </option>
                            ))}
                          </select>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserActive(user.id)}
                          >
                            {user.isActive ? 'تعطيل' : 'تفعيل'}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-8">لا توجد مستخدمون</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>إدارة الأدوار</CardTitle>
              <CardDescription>عرض وإدارة أدوار المستخدمين والصلاحيات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roles.map(role => (
                  <div
                    key={role.id}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRole(role)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{role.name}</h4>
                        <p className="text-sm text-slate-600 mb-3">{role.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-700">
                            المستوى: {role.level}
                          </span>
                          <span className="text-xs text-slate-500">
                            {role.permissions.length} صلاحية
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Permissions preview */}
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-700 mb-2">الصلاحيات:</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 5).map(permId => (
                          <span
                            key={permId}
                            className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs"
                          >
                            {permId.split(':')[1]}
                          </span>
                        ))}
                        {role.permissions.length > 5 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            +{role.permissions.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>الصلاحيات المتاحة</CardTitle>
              <CardDescription>قائمة بجميع الصلاحيات في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rbacEngine.getAllPermissions().map(permission => (
                  <div
                    key={permission.id}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{permission.name}</h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            {permission.category}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{permission.description}</p>
                      </div>
                      <code className="px-3 py-2 bg-slate-100 rounded text-xs font-mono text-slate-700">
                        {permission.id}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected User Details */}
      {selectedUser && (
        <Card className="shadow-md border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              تفاصيل المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">الاسم</p>
                <p className="font-semibold text-slate-900">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">البريد الإلكتروني</p>
                <p className="font-semibold text-slate-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">الدور</p>
                <p className="font-semibold text-slate-900">
                  {rbacEngine.getRole(selectedUser.role)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">الحالة</p>
                <p className="font-semibold text-slate-900">
                  {selectedUser.isActive ? 'نشط' : 'معطل'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-600 mb-2">الصلاحيات</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.permissions.map(permId => (
                    <span
                      key={permId}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold"
                    >
                      {permId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
