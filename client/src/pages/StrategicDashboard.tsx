/**
 * Strategic Dashboard - Smart Entry & CrowdFlow
 * 
 * Advanced control center integrating all 6 layers
 * Executive-level decision making and scenario planning
 */

import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { StrategicControlPanel } from '@/components/StrategicControlPanel';
import { ArrowRight, Zap } from 'lucide-react';

export default function StrategicDashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-800"
              onClick={() => setLocation('/')}
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">لوحة التحكم الاستراتيجية</h1>
                <p className="text-blue-100 mt-1">محاكاة متقدمة وتخطيط السيناريوهات</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border-2 border-indigo-200 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 mb-3">نظام المحاكاة المتقدم</h2>
          <p className="text-slate-700 mb-4">
            لوحة التحكم الاستراتيجية تجمع جميع الطبقات الستة من النظام (التنبؤ الاستباقي، الذكاء المكاني، التذكرة التكيفية، التوصيات الذكية، بصمة الحشود، والتحليلات المتقدمة) في واجهة واحدة قوية لاتخاذ القرارات الاستراتيجية.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">🎯 المحاكاة</p>
              <p className="text-xs text-slate-600">اختبر سيناريوهات مختلفة قبل التطبيق الفعلي</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">📊 التحليل</p>
              <p className="text-xs text-slate-600">احصل على رؤى عميقة حول كل سيناريو</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">⚡ التطبيق</p>
              <p className="text-xs text-slate-600">طبق أفضل استراتيجية بضغطة زر واحدة</p>
            </div>
          </div>
        </div>

        {/* Strategic Control Panel Component */}
        <StrategicControlPanel />

        {/* Integration Summary */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 shadow-md">
          <h3 className="text-lg font-bold text-slate-900 mb-4">تكامل الطبقات الستة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">1️⃣ التنبؤ الاستباقي</p>
              <p className="text-xs text-slate-600">يتنبأ بالازدحام 15-30 دقيقة مقدماً</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">2️⃣ الذكاء المكاني</p>
              <p className="text-xs text-slate-600">يوجه المشجعين إلى المرافق الأقل ازدحاماً</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">3️⃣ التذكرة التكيفية</p>
              <p className="text-xs text-slate-600">أسعار ديناميكية بناءً على الطلب والازدحام</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">4️⃣ التوصيات الذكية</p>
              <p className="text-xs text-slate-600">توصيات مخصصة لكل مشجع</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">5️⃣ بصمة الحشود</p>
              <p className="text-xs text-slate-600">تحليل سلوك الجماهير عبر الزمن</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">6️⃣ لوحة التحكم</p>
              <p className="text-xs text-slate-600">محاكاة متقدمة واتخاذ قرارات استراتيجية</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 shadow-md">
          <h3 className="text-lg font-bold text-slate-900 mb-4">المقاييس الرئيسية المتابعة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">📊 الكثافة البشرية</p>
              <p className="text-xs text-slate-600">تتبع مستويات الازدحام في الوقت الفعلي</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">⏱️ أوقات الانتظار</p>
              <p className="text-xs text-slate-600">قياس وتقليل أوقات الانتظار</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">💰 الإيرادات</p>
              <p className="text-xs text-slate-600">تحسين العائد المالي</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">😊 الرضا</p>
              <p className="text-xs text-slate-600">تحسين تجربة المشجع</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">🛡️ السلامة</p>
              <p className="text-xs text-slate-600">ضمان سلامة الجماهير</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">⚙️ الكفاءة</p>
              <p className="text-xs text-slate-600">تحسين كفاءة التشغيل</p>
            </div>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="mt-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border-2 border-cyan-200 shadow-md">
          <h3 className="text-lg font-bold text-slate-900 mb-4">الميزات المتقدمة</h3>
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">🎮 محاكاة "ماذا لو"</p>
              <p className="text-xs text-slate-600">
                اختبر تأثير التغييرات المختلفة على جميع جوانب العملية قبل التطبيق الفعلي
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">📈 التنبؤات المتقدمة</p>
              <p className="text-xs text-slate-600">
                استخدم نماذج التعلم الآلي للتنبؤ بالسلوك المستقبلي بدقة عالية
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">🔄 التحسين المستمر</p>
              <p className="text-xs text-slate-600">
                تحسين الاستراتيجيات بناءً على البيانات الفعلية والنتائج السابقة
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">🎯 التخطيط الاستراتيجي</p>
              <p className="text-xs text-slate-600">
                خطط لكل مباراة بناءً على خصائصها الفريدة وظروفها المتوقعة
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button className="flex-1 bg-indigo-700 hover:bg-indigo-800 h-12 text-base">
            تطبيق أفضل استراتيجية
          </Button>
          <Button variant="outline" className="flex-1 h-12 text-base">
            تصدير التقرير الشامل
          </Button>
          <Button variant="outline" className="flex-1 h-12 text-base">
            العودة إلى لوحة التحكم
          </Button>
        </div>
      </div>
    </div>
  );
}
