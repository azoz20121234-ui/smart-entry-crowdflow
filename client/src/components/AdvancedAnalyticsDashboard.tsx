/**
 * Advanced Analytics Dashboard Component
 * Smart Entry & CrowdFlow
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import { TrendingUp, Users, DollarSign, Zap, AlertTriangle, Target } from 'lucide-react';
import { analyticsEngine } from '@/lib/analyticsEngine';

export function AdvancedAnalyticsDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [crowdBehavior, setCrowdBehavior] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [efficiency, setEfficiency] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    // Load analytics data
    setKpis(analyticsEngine.getKPISummary());
    setCrowdBehavior(analyticsEngine.getCrowdBehavior());
    setRevenue(analyticsEngine.getRevenueAnalytics());
    setEfficiency(analyticsEngine.getOperationalEfficiency());
    setInsights(analyticsEngine.getPredictiveInsights());
    setAnomalies(analyticsEngine.getAnomalies());
    setTrends(analyticsEngine.getPerformanceTrends(7));
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const getAnomalySeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">إجمالي الزوار</p>
                <p className="text-3xl font-bold text-blue-700">{kpis?.totalVisitors?.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-green-700">${kpis?.totalRevenue?.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">درجة الكفاءة</p>
                <p className="text-3xl font-bold text-purple-700">{kpis?.efficiencyScore}%</p>
              </div>
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">هامش الربح</p>
                <p className="text-3xl font-bold text-orange-700">{kpis?.profitMargin}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies Alert */}
      {anomalies.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 mr-3">
            <strong>تنبيهات النظام:</strong> تم اكتشاف {anomalies.length} حالات شاذة تحتاج إلى انتباه
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="crowd">السلوك</TabsTrigger>
          <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
          <TabsTrigger value="efficiency">الكفاءة</TabsTrigger>
          <TabsTrigger value="insights">الرؤى</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>الاتجاهات الأسبوعية</CardTitle>
              <CardDescription>الإيرادات والزوار والكفاءة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="الإيرادات ($)" />
                  <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} name="الزوار" />
                  <Line type="monotone" dataKey="efficiency" stroke="#f59e0b" strokeWidth={2} name="الكفاءة %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Anomalies */}
          {anomalies.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>الحالات الشاذة المكتشفة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {anomalies.map((anomaly, idx) => (
                  <div key={idx} className={`p-4 border-2 rounded-lg ${getAnomalySeverityColor(anomaly.severity)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{anomaly.type}</h4>
                      <span className="px-2 py-1 bg-white/50 rounded text-xs font-semibold">
                        {anomaly.location}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{anomaly.recommendation}</p>
                    <p className="text-xs opacity-70">{new Date(anomaly.timestamp).toLocaleTimeString('ar-SA')}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Crowd Behavior Tab */}
        <TabsContent value="crowd" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>كثافة الحشود حسب الساعة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={crowdBehavior?.peakHours || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="density" fill="#3b82f6" stroke="#1e40af" name="الكثافة %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>توزيع الدخول</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Object.entries(crowdBehavior?.entryPatterns || {}).map(([name, value]) => ({
                        name,
                        value: Number(value),
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>إحصائيات السلوك</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">متوسط وقت الإقامة</span>
                  <span className="font-bold text-slate-900">{crowdBehavior?.averageDwellTime} دقيقة</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">الزوار المتكررون</span>
                  <span className="font-bold text-slate-900">{crowdBehavior?.repeatVisitors}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">الزوار الجدد</span>
                  <span className="font-bold text-slate-900">{crowdBehavior?.firstTimeVisitors}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">كفاءة التدفق</span>
                  <span className="font-bold text-slate-900">{crowdBehavior?.crowdFlowEfficiency}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>الإيرادات حسب البوابة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(revenue?.revenueByGate || {}).map(([name, value]) => ({
                  name,
                  revenue: value,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="revenue" fill="#10b981" name="الإيرادات ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-md">
              <CardContent className="pt-4">
                <p className="text-sm text-slate-600 mb-2">تأثير التسعير الديناميكي</p>
                <p className="text-3xl font-bold text-green-700">+{revenue?.dynamicPricingImpact}%</p>
                <p className="text-xs text-slate-500 mt-2">زيادة الإيرادات</p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-4">
                <p className="text-sm text-slate-600 mb-2">الخصومات المطبقة</p>
                <p className="text-3xl font-bold text-blue-700">${revenue?.discountsApplied?.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-2">إجمالي الخصومات</p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-4">
                <p className="text-sm text-slate-600 mb-2">مرونة الطلب</p>
                <p className="text-3xl font-bold text-purple-700">{revenue?.priceElasticity}</p>
                <p className="text-xs text-slate-500 mt-2">حساسية الطلب للسعر</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>استخدام البوابات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(efficiency?.gateUtilization || {}).map(([name, value]) => ({
                  name,
                  utilization: value,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="utilization" fill="#f59e0b" name="الاستخدام %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>معدل الإنتاجية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(efficiency?.throughputPerGate || {}).map(([gate, throughput]) => (
                    <div key={gate} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-700">{gate}</span>
                      <span className="font-bold text-slate-900">{Number(throughput)} شخص/دقيقة</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>مؤشرات الكفاءة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">متوسط وقت الانتظار</span>
                  <span className="font-bold text-slate-900">{efficiency?.averageWaitTime} دقائق</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">أقصى وقت انتظار</span>
                  <span className="font-bold text-slate-900">{efficiency?.maxWaitTime} دقائق</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">تكلفة لكل زائر</span>
                  <span className="font-bold text-slate-900">${efficiency?.costPerVisitor}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>التنبؤات والتوصيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  التنبؤات
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• ساعة الذروة المتوقعة: <strong>{insights?.predictedPeakTime}</strong></li>
                  <li>• إجمالي الزوار المتوقع: <strong>{insights?.predictedTotalVisitors?.toLocaleString()}</strong></li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">الفرص المتاحة</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  {insights?.opportunities?.map((opportunity: any, idx: number) => (
                    <li key={idx}>✓ {String(opportunity)}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">عوامل الخطر</h4>
                <ul className="space-y-2 text-sm text-red-800">
                  {insights?.riskFactors?.map((risk: any, idx: number) => (
                    <li key={idx}>⚠ {String(risk?.factor)} ({String(risk?.severity)})</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
