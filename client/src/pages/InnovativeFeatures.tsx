/**
 * Innovative Features Dashboard
 * Smart Entry & CrowdFlow
 * 
 * Showcases competitive features for corridor, path, and ticket management
 */

import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CorridorPathMonitoring } from '@/components/CorridorPathMonitoring';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function InnovativeFeatures() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-purple-700"
                onClick={() => setLocation('/')}
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">الميزات التنافسية الابتكارية</h1>
                  <p className="text-purple-100 mt-1">إدارة الممرات والمسارات والتذاكر الديناميكية</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-600">
            <h3 className="text-lg font-bold text-slate-900 mb-2">إدارة الممرات الذكية</h3>
            <p className="text-slate-600 text-sm">
              مراقبة فعلية للكثافة والتدفق في كل ممر مع توصيات ذكية لإعادة التوجيه
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-green-600">
            <h3 className="text-lg font-bold text-slate-900 mb-2">مسارات ذكية مع وعي الازدحام</h3>
            <p className="text-slate-600 text-sm">
              خوارزميات تحديد المسارات الأمثل مع مراعاة الازدحام الفعلي والاختناقات
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-purple-600">
            <h3 className="text-lg font-bold text-slate-900 mb-2">تذاكر ديناميكية متقدمة</h3>
            <p className="text-slate-600 text-sm">
              تسعير ذكي مع 4 استراتيجيات وحوافز لتوجيه الجماهير إلى البوابات الأقل ازدحاماً
            </p>
          </div>
        </div>

        {/* Main Monitoring Component */}
        <CorridorPathMonitoring />

        {/* Innovation Highlights */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8 border border-purple-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">نقاط الابتكار الرئيسية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                نظام الممرات الذكي
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ مراقبة فعلية لكثافة كل ممر</li>
                <li>✓ تحليل الاختناقات التلقائي</li>
                <li>✓ توصيات لإعادة التوجيه الفوري</li>
                <li>✓ حساب كفاءة الممرات</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                خوارزميات المسارات الذكية
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ حساب المسارات الأمثل مع الازدحام</li>
                <li>✓ توصيات توقف المرافق القريبة</li>
                <li>✓ مسارات بديلة متعددة</li>
                <li>✓ تقديرات الوقت الدقيقة</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                التسعير الديناميكي المتقدم
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ 4 استراتيجيات تسعير ذكية</li>
                <li>✓ حوافز لتوزيع أفضل للحشود</li>
                <li>✓ توصيات تغيير البوابة</li>
                <li>✓ تحليل الإيرادات والأرباح</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                التنبيهات المعلومات الجزيئية
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ تنبيهات موقع محددة</li>
                <li>✓ توصيات مرافق قريبة</li>
                <li>✓ تنبيهات الازدحام الفوري</li>
                <li>✓ اقتراحات المسارات البديلة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
