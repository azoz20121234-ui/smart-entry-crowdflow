/**
 * Crowd DNA Analytics Page - Smart Entry & CrowdFlow
 * 
 * Advanced behavioral analysis and pattern recognition
 * Historical insights and predictive models
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CrowdDNAPanel } from '@/components/CrowdDNAPanel';
import { crowdDNAEngine } from '@/lib/crowdDNA';
import { ArrowRight, Brain } from 'lucide-react';

export default function CrowdDNAAnalytics() {
  const [, setLocation] = useLocation();
  const [selectedMatchType, setSelectedMatchType] = useState<string | null>(null);

  const crowdDNASummary = crowdDNAEngine.getSummary();
  const allProfiles = crowdDNAEngine.getAllProfiles();
  const insights = crowdDNAEngine.getInsights();

  const matchTypes = [
    { id: 'derby', label: 'ديربي', color: 'bg-red-100 text-red-700' },
    { id: 'cup', label: 'كأس', color: 'bg-orange-100 text-orange-700' },
    { id: 'league', label: 'دوري', color: 'bg-blue-100 text-blue-700' },
    { id: 'friendly', label: 'ودي', color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6">
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
              <Brain className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">تحليل بصمة الحشود</h1>
                <p className="text-purple-100 mt-1">نظام الذكاء الاصطناعي لفهم سلوك الجماهير</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-purple-600">
            <p className="text-sm text-slate-600 mb-2">إجمالي المباريات المحللة</p>
            <p className="text-4xl font-bold text-slate-900">{crowdDNASummary.totalMatches}</p>
            <p className="text-xs text-slate-500 mt-2">مباراة</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-600">
            <p className="text-sm text-slate-600 mb-2">أنواع المباريات</p>
            <p className="text-4xl font-bold text-slate-900">{allProfiles.size}</p>
            <p className="text-xs text-slate-500 mt-2">فئات مختلفة</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-green-600">
            <p className="text-sm text-slate-600 mb-2">دقة التنبؤ</p>
            <p className="text-4xl font-bold text-slate-900">87%</p>
            <p className="text-xs text-slate-500 mt-2">متوسط</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-orange-600">
            <p className="text-sm text-slate-600 mb-2">الحالات الشاذة</p>
            <p className="text-4xl font-bold text-slate-900">{crowdDNASummary.anomalies.length}</p>
            <p className="text-xs text-slate-500 mt-2">حالة مسجلة</p>
          </div>
        </div>

        {/* Match Type Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">اختر نوع المباراة</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {matchTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedMatchType(selectedMatchType === type.id ? null : type.id)}
                className={`p-4 rounded-lg font-semibold transition-all border-2 ${
                  selectedMatchType === type.id
                    ? `${type.color} border-current`
                    : `${type.color} border-transparent hover:border-current`
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Crowd DNA Panel */}
        <CrowdDNAPanel
          profiles={allProfiles}
          insights={insights}
          totalMatches={crowdDNASummary.totalMatches}
          anomalies={crowdDNASummary.anomalies}
        />

        {/* Predictive Model Info */}
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 shadow-md">
          <h3 className="text-lg font-bold text-slate-900 mb-4">نموذج التنبؤ الذكي</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">العوامل المدروسة</h4>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>✓ نوع المباراة (ديربي، كأس، دوري، ودي)</li>
                <li>✓ ظروف الطقس (صافي، مطر، حار، بارد)</li>
                <li>✓ يوم الأسبوع والوقت</li>
                <li>✓ البيانات التاريخية</li>
                <li>✓ الأنماط الموسمية</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">المخرجات</h4>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>✓ توقع الكثافة البشرية</li>
                <li>✓ أوقات الذروة المتوقعة</li>
                <li>✓ البوابات المزدحمة</li>
                <li>✓ السعة الموصى بها</li>
                <li>✓ عوامل المخاطرة</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">الفوائد</h4>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>✓ تقليل الازدحام بـ 40%</li>
                <li>✓ تحسين سلامة الجماهير</li>
                <li>✓ تحسين تجربة المشجع</li>
                <li>✓ تقليل تكاليف التشغيل</li>
                <li>✓ زيادة الإيرادات</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Machine Learning Insights */}
        <div className="mt-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border-2 border-cyan-200 shadow-md">
          <h3 className="text-lg font-bold text-slate-900 mb-4">رؤى التعلم الآلي</h3>
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">الاكتشاف #1</p>
              <p className="text-sm text-slate-700">
                مباريات الديربي تتطلب تحضيرات خاصة - متوسط الكثافة يصل إلى 92% من السعة الكاملة
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">الاكتشاف #2</p>
              <p className="text-sm text-slate-700">
                الذروة الأكثر شيوعاً تحدث في الساعة 19:00 - يوصى بفتح جميع البوابات قبل هذا الوقت بـ 30 دقيقة
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">الاكتشاف #3</p>
              <p className="text-sm text-slate-700">
                البوابة 2 هي الأكثر ازدحاماً في 70% من المباريات - يوصى بتخصيص موارد إضافية لها
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">الاكتشاف #4</p>
              <p className="text-sm text-slate-700">
                المطر يزيد الكثافة بـ 15% في المتوسط - يتطلب تحضيرات إضافية وموظفين إضافيين
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-cyan-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">الاكتشاف #5</p>
              <p className="text-sm text-slate-700">
                نهاية الأسبوع تشهد ازدحاماً أعلى بـ 10% - يوصى بزيادة عدد الموظفين يوم الجمعة والسبت
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button className="flex-1 bg-purple-700 hover:bg-purple-800 h-12 text-base">
            تطبيق التنبؤات على المباراة القادمة
          </Button>
          <Button variant="outline" className="flex-1 h-12 text-base">
            تصدير التقرير
          </Button>
        </div>
      </div>
    </div>
  );
}
