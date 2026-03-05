/**
 * System Admin Dashboard - User & Role Management
 * Smart Entry & CrowdFlow
 */

import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/components/AdminPanel';
import { ArrowRight, Shield } from 'lucide-react';
import { rbacEngine } from '@/lib/rbacEngine';

export default function SystemAdmin() {
  const [, setLocation] = useLocation();
  const currentUser = rbacEngine.getCurrentUser();

  // Check if user has admin permission
  if (!currentUser || !rbacEngine.hasPermission('manage:system')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">الوصول مرفوض</h1>
          <p className="text-slate-600 mb-6">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة</p>
          <Button onClick={() => setLocation('/')}>العودة إلى الرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-red-700"
                onClick={() => setLocation('/')}
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">لوحة إدارة النظام</h1>
                  <p className="text-red-100 mt-1">إدارة المستخدمين والأدوار والصلاحيات</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-100">المسؤول</p>
              <p className="text-lg font-semibold">{currentUser.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AdminPanel />
      </div>
    </div>
  );
}
