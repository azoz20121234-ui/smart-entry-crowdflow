/**
 * VirtualQueueAnalytics Component - Smart Entry & CrowdFlow
 * 
 * Displays detailed analytics for virtual queues at each gate
 * Shows real-time metrics, trends, and predictive insights
 */

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, TrendingDown, Users, Clock, Zap, Activity } from 'lucide-react';

interface QueueMetrics {
  gateId: number;
  gateName: string;
  currentQueue: number;
  averageWaitTime: number;
  flowRate: number;
  capacity: number;
  efficiency: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  estimatedClearTime: number; // minutes
}

interface QueueDataPoint {
  time: string;
  queue: number;
  waitTime: number;
  flowRate: number;
  efficiency: number;
}

interface VirtualQueueAnalyticsProps {
  gateMetrics: QueueMetrics;
  historicalData: QueueDataPoint[];
  predictedData: QueueDataPoint[];
}

export function VirtualQueueAnalytics({
  gateMetrics,
  historicalData,
  predictedData,
}: VirtualQueueAnalyticsProps) {
  // Determine status color based on efficiency
  const getStatusColor = (efficiency: number) => {
    if (efficiency >= 80) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'ممتاز' };
    if (efficiency >= 60) return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'جيد' };
    if (efficiency >= 40) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'تحذير' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'حرج' };
  };

  const status = getStatusColor(gateMetrics.efficiency);

  // Combine historical and predicted data for visualization
  const combinedData = [...historicalData, ...predictedData];

  return (
    <div className="space-y-6">
      {/* Gate Header Card */}
      <Card className={`border-2 shadow-lg ${status.bg} ${status.border}`}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gate Info */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{gateMetrics.gateName}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">حالة الكفاءة:</span>
                  <span className={`text-lg font-bold ${status.text}`}>{gateMetrics.efficiency}% - {status.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">الاتجاه:</span>
                  <span className="flex items-center gap-2">
                    {gateMetrics.trend === 'up' && <TrendingUp className="w-5 h-5 text-orange-600" />}
                    {gateMetrics.trend === 'down' && <TrendingDown className="w-5 h-5 text-green-600" />}
                    {gateMetrics.trend === 'stable' && <Activity className="w-5 h-5 text-blue-600" />}
                    <span className="text-slate-900 font-semibold">
                      {gateMetrics.trend === 'up' && 'يتزايد'}
                      {gateMetrics.trend === 'down' && 'يتناقص'}
                      {gateMetrics.trend === 'stable' && 'مستقر'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">الطابور الحالي</p>
                <p className="text-3xl font-bold text-slate-900">{gateMetrics.currentQueue}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">متوسط الانتظار</p>
                <p className="text-3xl font-bold text-slate-900">{gateMetrics.averageWaitTime}</p>
                <p className="text-xs text-slate-500">دقيقة</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">معدل التدفق</p>
                <p className="text-3xl font-bold text-slate-900">{gateMetrics.flowRate}</p>
                <p className="text-xs text-slate-500">شخص/دقيقة</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">الوقت المتوقع</p>
                <p className="text-3xl font-bold text-slate-900">{gateMetrics.estimatedClearTime}</p>
                <p className="text-xs text-slate-500">دقيقة</p>
              </div>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-slate-900">استخدام السعة</p>
              <p className="text-sm text-slate-600">
                {gateMetrics.currentQueue} / {gateMetrics.capacity}
              </p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-green-600 to-yellow-600 rounded-full transition-all duration-500"
                style={{ width: `${(gateMetrics.currentQueue / gateMetrics.capacity) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Trend Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>اتجاه الطابور</CardTitle>
          <CardDescription>البيانات التاريخية والتنبؤات</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedData}>
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
              <Line
                type="monotone"
                dataKey="queue"
                stroke="#1e3a8a"
                strokeWidth={3}
                name="حجم الطابور"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="waitTime"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="وقت الانتظار المتوقع"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Wait Time vs Queue Size */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>العلاقة بين حجم الطابور ووقت الانتظار</CardTitle>
          <CardDescription>تحليل الارتباط والكفاءة</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="queue" name="حجم الطابور" stroke="#6b7280" />
              <YAxis dataKey="waitTime" name="وقت الانتظار" stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter
                name="البيانات التاريخية"
                data={historicalData}
                fill="#1e3a8a"
                fillOpacity={0.6}
              />
              <Scatter
                name="التنبؤات"
                data={predictedData}
                fill="#10b981"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Efficiency Gauge */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm">كفاءة البوابة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#1e3a8a"
                    strokeWidth="8"
                    strokeDasharray={`${(gateMetrics.efficiency / 100) * 282.7} 282.7`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-bold text-slate-900">{gateMetrics.efficiency}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow Rate */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              معدل التدفق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 mb-2">الحالي</p>
                <p className="text-4xl font-bold text-blue-700">{gateMetrics.flowRate}</p>
                <p className="text-xs text-slate-500">شخص/دقيقة</p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600 mb-2">الأمثل</p>
                <p className="text-2xl font-bold text-green-600">50</p>
                <p className="text-xs text-slate-500">شخص/دقيقة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predictions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              التنبؤات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 mb-2">وقت التصفية المتوقع</p>
                <p className="text-4xl font-bold text-orange-600">{gateMetrics.estimatedClearTime}</p>
                <p className="text-xs text-slate-500">دقيقة</p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600 mb-2">الحد الأقصى المتوقع</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(gateMetrics.estimatedClearTime * 1.2)}
                </p>
                <p className="text-xs text-slate-500">دقيقة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Over Time */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>كفاءة البوابة عبر الزمن</CardTitle>
          <CardDescription>مؤشر الأداء المركب</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={historicalData}>
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
              <Bar dataKey="efficiency" fill="#1e3a8a" name="الكفاءة %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Health Status */}
      <Card className={`shadow-md border-2 ${status.bg} ${status.border}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${status.text}`} />
            حالة الصحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-600">استقرار التدفق</span>
              <span className="font-semibold text-slate-900">
                {gateMetrics.trend === 'stable' ? '✓ مستقر' : '⚠ متغير'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-600">استخدام السعة</span>
              <span className="font-semibold text-slate-900">
                {((gateMetrics.currentQueue / gateMetrics.capacity) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-600">الأداء مقابل الهدف</span>
              <span className={`font-semibold ${gateMetrics.efficiency >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                {gateMetrics.efficiency >= 80 ? '✓ ممتاز' : '⚠ يحتاج تحسين'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
