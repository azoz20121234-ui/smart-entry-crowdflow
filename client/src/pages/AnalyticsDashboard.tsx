/**
 * Analytics Dashboard Page
 * Smart Entry & CrowdFlow
 */

import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { AdvancedAnalyticsDashboard } from '@/components/AdvancedAnalyticsDashboard';
import { ArrowRight, BarChart3 } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
                onClick={() => setLocation('/')}
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">لوحة التحليلات المتقدمة</h1>
                  <p className="text-blue-100 mt-1">تقارير مفصلة عن سلوك الجماهير والإيرادات والكفاءة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Description */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-l-blue-600">
          <h2 className="text-xl font-bold text-slate-900 mb-3">نظرة شاملة على الأداء</h2>
          <p className="text-slate-700 mb-4">
            لوحة تحليلات متقدمة توفر رؤى عميقة عن سلوك الجماهير والإيرادات والكفاءة التشغيلية. تتضمن تقارير مفصلة، رسوم بيانية حية، وتنبؤات ذكية لدعم اتخاذ القرارات.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-slate-900">تحليل السلوك</h4>
                <p className="text-sm text-slate-600">فهم عميق لأنماط الجماهير والتدفق</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-slate-900">تحليل الإيرادات</h4>
                <p className="text-sm text-slate-600">تتبع الأسعار والإيرادات والحوافز</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-slate-900">مؤشرات الكفاءة</h4>
                <p className="text-sm text-slate-600">قياس الأداء التشغيلي والتحسينات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <AdvancedAnalyticsDashboard />

        {/* Insights Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">الميزات الرئيسية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                تحليلات شاملة
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ كثافة الحشود حسب الساعة</li>
                <li>✓ توزيع الدخول والخروج</li>
                <li>✓ متوسط وقت الإقامة</li>
                <li>✓ معدل الزوار المتكررين</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                تحليل الإيرادات
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ الإيرادات حسب البوابة</li>
                <li>✓ تأثير التسعير الديناميكي</li>
                <li>✓ الخصومات والحوافز</li>
                <li>✓ مرونة الطلب</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
                مؤشرات الكفاءة
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ استخدام البوابات</li>
                <li>✓ معدل الإنتاجية</li>
                <li>✓ أوقات الانتظار</li>
                <li>✓ تكلفة التشغيل</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-600 rounded-full"></span>
                التنبؤات والرؤى
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ التنبؤ بساعات الذروة</li>
                <li>✓ توصيات توزيع البوابات</li>
                <li>✓ اكتشاف الحالات الشاذة</li>
                <li>✓ فرص التحسين</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Insights */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">رؤى البيانات الرئيسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">أفضل الممارسات</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• استخدم التسعير الديناميكي لزيادة الإيرادات بنسبة 18%</li>
                <li>• وزع الجماهير بالتساوي على البوابات لتقليل الانتظار</li>
                <li>• ركز على تحسين كفاءة البوابة 4 (92% استخدام)</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">الفرص المتاحة</h4>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• زيادة الأسعار في ساعات الذروة (17:00)</li>
                <li>• توفير حوافز للدخول في أوقات هادئة</li>
                <li>• تحسين كفاءة الممر 2 (65% فقط)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
