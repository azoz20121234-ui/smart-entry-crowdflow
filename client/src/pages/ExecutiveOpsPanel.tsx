/**
 * Executive Operations Panel - Smart Entry & CrowdFlow
 * 
 * Advanced control panel for executives and senior management
 * Real-time KPIs, predictions, and strategic insights
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrowdPredictionPanel } from '@/components/CrowdPredictionPanel';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Users, Zap, BarChart3, Activity, ArrowRight } from 'lucide-react';
import { fetchExecutiveState } from '@/lib/executiveApi';
import type { ExecutiveKPI, ExecutivePrediction, ExecutiveSafetyMetric } from '@shared/operator';

const STEP_INTERVAL_MS = 5000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function ExecutiveOpsPanel() {
  const [, setLocation] = useLocation();
  const [eventMode, setEventMode] = useState<'match' | 'concert' | 'high-demand'>('match');
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([
    { label: 'إجمالي الحاضرين', value: 2100, unit: 'شخص', change: 5, trend: 'up' },
    { label: 'معدل الدخول', value: 180, unit: 'شخص/دقيقة', change: -3, trend: 'down' },
    { label: 'متوسط وقت الانتظار', value: 8, unit: 'دقائق', change: 2, trend: 'up' },
    { label: 'كفاءة التشغيل', value: 82, unit: '%', change: 8, trend: 'up' },
  ]);

  const [predictions, setPredictions] = useState<ExecutivePrediction[]>([
    { time: '18:00', predictedDensity: 45, confidence: 85, riskLevel: 'low' as const },
    { time: '18:15', predictedDensity: 58, confidence: 88, riskLevel: 'medium' as const },
    { time: '18:30', predictedDensity: 72, confidence: 90, riskLevel: 'high' as const },
    { time: '18:45', predictedDensity: 85, confidence: 92, riskLevel: 'critical' as const },
    { time: '19:00', predictedDensity: 78, confidence: 89, riskLevel: 'high' as const },
    { time: '19:15', predictedDensity: 65, confidence: 85, riskLevel: 'medium' as const },
  ]);

  const [safetyMetrics, setSafetyMetrics] = useState<ExecutiveSafetyMetric[]>([
    { gateId: 1, density: 45, riskLevel: 'safe' as const },
    { gateId: 2, density: 72, riskLevel: 'danger' as const },
    { gateId: 3, density: 38, riskLevel: 'safe' as const },
    { gateId: 4, density: 85, riskLevel: 'critical' as const },
  ]);

  const [financialData, setFinancialData] = useState([
    { metric: 'تكلفة الازدحام', value: 15000, currency: 'ريال' },
    { metric: 'تكلفة التشغيل', value: 8000, currency: 'ريال' },
    { metric: 'العائد المتوقع', value: 45000, currency: 'ريال' },
    { metric: 'الربح الصافي', value: 22000, currency: 'ريال' },
  ]);

  const [revenueData, setRevenueData] = useState([
    { time: '16:00', revenue: 5000, cost: 2000 },
    { time: '17:00', revenue: 12000, cost: 3500 },
    { time: '18:00', revenue: 18000, cost: 5000 },
    { time: '19:00', revenue: 22000, cost: 6500 },
    { time: '20:00', revenue: 25000, cost: 7000 },
    { time: '21:00', revenue: 20000, cost: 6000 },
  ]);

  const [alerts, setAlerts] = useState([
    '🔴 البوابة 4 تعاني من ازدحام حرج - يوصى بفتح بوابة إضافية',
    '⚠️ التنبؤ يشير إلى ذروة متوقعة في الساعة 18:45',
    '✓ البوابة 3 تعمل بكفاءة عالية جداً',
  ]);
  const [dataSource, setDataSource] = useState<'server' | 'local'>('local');

  const [recommendations, setRecommendations] = useState([
    'تحويل 150 شخص من البوابة 4 إلى البوابة 1 و3',
    'زيادة عدد الموظفين على البوابة 2 بمقدار 3 أشخاص',
    'تفعيل بروتوكول الطوارئ للبوابة 4 في الساعة 18:30',
    'إعادة توجيه التذاكر الجديدة نحو البوابات 1 و3',
  ]);

  useEffect(() => {
    const applyFallbackSimulation = () => {
      setKpis(prev =>
        prev.map(kpi => ({
          ...kpi,
          value: Math.max(0, kpi.value + (Math.random() - 0.5) * 20),
          change: (Math.random() - 0.5) * 10,
          trend: Math.random() > 0.5 ? 'up' : 'down',
        }))
      );

      setPredictions(prev =>
        prev.map(pred => ({
          ...pred,
          predictedDensity: Math.max(20, Math.min(100, pred.predictedDensity + (Math.random() - 0.5) * 10)),
          confidence: Math.max(70, Math.min(95, pred.confidence + (Math.random() - 0.5) * 5)),
        }))
      );

      setSafetyMetrics(prev =>
        prev.map(metric => ({
          ...metric,
          density: Math.max(20, Math.min(100, metric.density + (Math.random() - 0.5) * 8)),
        }))
      );
    };

    let isActive = true;

    const syncExecutiveState = async () => {
      try {
        const state = await fetchExecutiveState();
        if (!isActive) return;
        setDataSource('server');
        setKpis(state.kpis);
        setPredictions(state.predictions);
        setSafetyMetrics(state.safetyMetrics);
        setAlerts(state.alerts);
      } catch {
        if (!isActive) return;
        setDataSource('local');
        applyFallbackSimulation();
      }
    };

    syncExecutiveState();
    const interval = setInterval(syncExecutiveState, STEP_INTERVAL_MS);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  const peakTimeEstimate = new Date(Date.now() + 45 * 60000);
  const clearTimeEstimate = new Date(Date.now() + 120 * 60000);
  const avgWait = Number(kpis.find(kpi => kpi.label.includes('الانتظار'))?.value ?? 8);
  const operatingEfficiency = Number(kpis.find(kpi => kpi.label.includes('كفاءة'))?.value ?? 80);
  const interventionCount = alerts.filter(alert => alert.includes('🔴') || alert.includes('⚠️')).length;
  const experienceScore = Math.round(
    clamp(100 - avgWait * 4 - interventionCount * 8 + operatingEfficiency * 0.25, 35, 98),
  );
  const experienceState =
    experienceScore >= 80 ? 'ممتاز' : experienceScore >= 65 ? 'متوازن' : 'يحتاج تدخل';
  const baselineWait = eventMode === 'high-demand' ? 16 : eventMode === 'concert' ? 12 : 14;
  const baselineInterventions = eventMode === 'high-demand' ? 6 : eventMode === 'concert' ? 4 : 5;
  const waitImprovement = Math.max(0, Math.round((1 - avgWait / baselineWait) * 100));
  const interventionImprovement = Math.max(
    0,
    Math.round((1 - interventionCount / Math.max(1, baselineInterventions)) * 100),
  );
  const learningInsights = [
    'في الأحداث ذات ضغط مرتفع، التوجيه المبكر قبل 20 دقيقة يقلل الذروة بشكل ملحوظ.',
    'توحيد الرسائل بين التطبيق والشاشات يحسّن الالتزام بالمسارات البديلة.',
    'فتح مسار بديل مؤقت عند ارتفاع المؤشر الأحمر يمنع انتقال الاختناق للممرات المجاورة.',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
                onClick={() => setLocation('/')}
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold">لوحة التحكم التنفيذية</h1>
                <p className="text-blue-100 mt-2">نظام إدارة الحشود الذكي - Smart Entry & CrowdFlow</p>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <label className="text-xs text-blue-100">نوع الحدث</label>
                <select
                  className="mr-2 rounded-md border border-blue-300 bg-blue-800 px-2 py-1 text-xs text-white"
                  value={eventMode}
                  onChange={event => setEventMode(event.target.value as 'match' | 'concert' | 'high-demand')}
                >
                  <option value="match">مباراة</option>
                  <option value="concert">حفلة</option>
                  <option value="high-demand">حدث عالي الطلب</option>
                </select>
              </div>
              <p
                className={`mb-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  dataSource === 'server'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {dataSource === 'server' ? 'بيانات API' : 'وضع محلي (Fallback)'}
              </p>
              <p className="text-sm text-blue-100">آخر تحديث</p>
              <p className="text-lg font-semibold">{new Date().toLocaleTimeString('ar-SA')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {alerts.map((alert, idx) => (
              <Alert key={idx} className={`border-2 ${alert.includes('🔴') ? 'border-red-200 bg-red-50' : alert.includes('⚠️') ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                <AlertTriangle className={`h-5 w-5 ${alert.includes('🔴') ? 'text-red-600' : alert.includes('⚠️') ? 'text-yellow-600' : 'text-green-600'}`} />
                <AlertDescription className={`mr-3 ${alert.includes('🔴') ? 'text-red-800' : alert.includes('⚠️') ? 'text-yellow-800' : 'text-green-800'}`}>
                  {alert}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 shadow-md">
            <CardHeader>
              <CardTitle>مؤشر جودة التجربة (Experience Score)</CardTitle>
              <CardDescription>مؤشر موحّد لقراءة التجربة العامة بدون تفاصيل تشغيلية.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div>
                <p className="text-5xl font-extrabold text-emerald-700">{experienceScore}</p>
                <p className="text-sm font-semibold text-slate-700 mt-2">
                  الحالة: {experienceState}
                </p>
              </div>
              <div className="text-sm text-slate-700 space-y-1">
                <p>متوسط الانتظار الحالي: {Math.round(avgWait)} دقائق</p>
                <p>التدخلات النشطة: {interventionCount}</p>
                <p>كفاءة التشغيل: {Math.round(operatingEfficiency)}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">قرار الإدارة الآن</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-slate-800">
                {experienceScore >= 80
                  ? 'لا حاجة لتدخل إضافي حالياً. استمر على الخطة الحالية.'
                  : experienceScore >= 65
                    ? 'يوصى بمتابعة دقيقة للممرات ذات الخطر المتوسط.'
                    : 'يوصى بتدخل فوري وتفعيل خطة تقليل الضغط.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle>مقارنة الأثر قبل/بعد التشغيل الذكي</CardTitle>
            <CardDescription>قياس واضح للقيمة التشغيلية خلال نفس نوع الحدث.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-600">تحسن زمن الانتظار</p>
                <p className="text-3xl font-bold text-emerald-700">+{waitImprovement}%</p>
                <p className="text-xs text-slate-500 mt-1">
                  قبل: {baselineWait} دقيقة - الآن: {Math.round(avgWait)} دقائق
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-600">خفض التدخلات الحرجة</p>
                <p className="text-3xl font-bold text-blue-700">+{interventionImprovement}%</p>
                <p className="text-xs text-slate-500 mt-1">
                  قبل: {baselineInterventions} - الآن: {interventionCount}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-600">جاهزية الحدث</p>
                <p className="text-3xl font-bold text-indigo-700">{experienceState}</p>
                <p className="text-xs text-slate-500 mt-1">مؤشر موحّد لاتخاذ قرار الإدارة.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, idx) => (
            <Card key={idx} className="shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 mb-2">{kpi.label}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{Math.round(kpi.value)}</p>
                    <p className="text-xs text-slate-500 mt-1">{kpi.unit}</p>
                  </div>
                  <div className={`flex items-center gap-1 ${kpi.trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                    {kpi.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span className="text-sm font-semibold">{Math.abs(Math.round(kpi.change))}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for Different Views */}
        <Tabs defaultValue="predictions" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
            <TabsTrigger value="financial">التحليل المالي</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
            <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
          </TabsList>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="mt-6">
            <CrowdPredictionPanel
              predictions={predictions}
              currentDensity={Math.round(predictions[0].predictedDensity)}
              safetyMetrics={safetyMetrics}
              alerts={alerts}
              recommendations={recommendations}
              peakTimeEstimate={peakTimeEstimate}
              clearTimeEstimate={clearTimeEstimate}
            />
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="mt-6">
            <div className="space-y-6">
              {/* Revenue vs Cost */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    العائد مقابل التكلفة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="العائد" />
                      <Area type="monotone" dataKey="cost" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="التكلفة" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Financial Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {financialData.map((item, idx) => (
                  <Card key={idx} className="shadow-md">
                    <CardContent className="pt-6">
                      <p className="text-sm text-slate-600 mb-3">{item.metric}</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {item.value.toLocaleString('ar-SA')}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">{item.currency}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Profit Margin */}
              <Card className="shadow-md bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle>هامش الربح</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-5xl font-bold text-green-700">48.9%</p>
                      <p className="text-sm text-slate-600 mt-2">أعلى من المتوسط الصناعي (35%)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-2">الربح الصافي</p>
                      <p className="text-3xl font-bold text-green-700">22,000</p>
                      <p className="text-xs text-slate-500">ريال</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6">
            <div className="space-y-6">
              {/* Gate Efficiency */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    كفاءة البوابات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { gate: 'البوابة 1', efficiency: 84 },
                      { gate: 'البوابة 2', efficiency: 76 },
                      { gate: 'البوابة 3', efficiency: 96 },
                      { gate: 'البوابة 4', efficiency: 64 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="gate" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="efficiency" fill="#1e3a8a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>صحة النظام</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-slate-600 mb-2">التوفر</p>
                      <p className="text-3xl font-bold text-green-700">99.8%</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-slate-600 mb-2">زمن الاستجابة</p>
                      <p className="text-3xl font-bold text-blue-700">125ms</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-slate-600 mb-2">معدل الخطأ</p>
                      <p className="text-3xl font-bold text-purple-700">0.2%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  التوصيات الاستراتيجية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white font-bold">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 font-semibold">{rec}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          الأولوية: {idx === 0 ? 'عالية جداً' : idx === 1 ? 'عالية' : 'متوسطة'}
                        </p>
                      </div>
                      <Button size="sm" className="flex-shrink-0">
                        تنفيذ
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* What-If Simulation */}
        <Card className="shadow-md mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              محاكاة "ماذا لو"
            </CardTitle>
            <CardDescription>توقع تأثير القرارات المختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">إذا فتحنا بوابة 5</p>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-600">الكثافة المتوقعة:</span> <span className="font-bold text-green-600">↓ 35%</span></p>
                  <p><span className="text-slate-600">وقت الانتظار:</span> <span className="font-bold text-green-600">↓ 4 دقائق</span></p>
                  <p><span className="text-slate-600">التكلفة الإضافية:</span> <span className="font-bold text-orange-600">+2,000 ريال</span></p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">إذا أضفنا 10 موظفين</p>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-600">الكثافة المتوقعة:</span> <span className="font-bold text-green-600">↓ 22%</span></p>
                  <p><span className="text-slate-600">وقت الانتظار:</span> <span className="font-bold text-green-600">↓ 2.5 دقيقة</span></p>
                  <p><span className="text-slate-600">التكلفة الإضافية:</span> <span className="font-bold text-orange-600">+5,000 ريال</span></p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">إذا أعدنا توجيه التذاكر</p>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-600">الكثافة المتوقعة:</span> <span className="font-bold text-green-600">↓ 28%</span></p>
                  <p><span className="text-slate-600">وقت الانتظار:</span> <span className="font-bold text-green-600">↓ 3 دقائق</span></p>
                  <p><span className="text-slate-600">التكلفة الإضافية:</span> <span className="font-bold text-green-600">0 ريال</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle>التعلّم من الأحداث السابقة</CardTitle>
            <CardDescription>
              توصيات تراكمية مبنية على نتائج التشغيل في فعاليات مشابهة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {learningInsights.map((insight, index) => (
                <div key={index} className="rounded-lg border border-amber-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-800">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
