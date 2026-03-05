/**
 * FlowAnalytics Component - Smart Entry & CrowdFlow
 * 
 * Visualizes gate flow rates and provides time predictions
 * Shows historical data and trends
 */

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface FlowDataPoint {
  time: string;
  flowRate: number;
  estimatedWaitTime: number;
  actualWaitTime?: number;
}

interface FlowAnalyticsProps {
  data: FlowDataPoint[];
  currentFlowRate: number;
  averageFlowRate: number;
  peakFlowRate: number;
}

export function FlowAnalytics({
  data,
  currentFlowRate,
  averageFlowRate,
  peakFlowRate,
}: FlowAnalyticsProps) {
  // Calculate trend
  const flowTrend = data.length >= 2 
    ? data[data.length - 1].flowRate - data[data.length - 2].flowRate
    : 0;

  const isTrendingUp = flowTrend > 0;

  // Calculate efficiency
  const efficiency = Math.round((currentFlowRate / peakFlowRate) * 100);

  return (
    <div className="space-y-6">
      {/* Flow Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              معدل التدفق الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{currentFlowRate}</div>
            <p className="text-xs text-slate-500 mt-1">شخص/دقيقة</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              {isTrendingUp ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-orange-600" />
              )}
              متوسط التدفق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{averageFlowRate}</div>
            <p className="text-xs text-slate-500 mt-1">شخص/دقيقة</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">كفاءة البوابة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{efficiency}%</div>
            <p className="text-xs text-slate-500 mt-1">من الطاقة القصوى</p>
          </CardContent>
        </Card>
      </div>

      {/* Flow Rate Trend Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>اتجاه معدل التدفق</CardTitle>
          <CardDescription>معدل الأشخاص الذين يدخلون كل دقيقة</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
                formatter={(value) => [value, 'شخص/دقيقة']}
              />
              <Area
                type="monotone"
                dataKey="flowRate"
                stroke="#1e3a8a"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorFlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Wait Time Prediction Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>توقع وقت الانتظار</CardTitle>
          <CardDescription>الوقت المتوقع للدخول بناءً على معدل التدفق</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" label={{ value: 'دقائق', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" label={{ value: 'شخص/دقيقة', angle: 90, position: 'insideRight' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="estimatedWaitTime"
                stroke="#f59e0b"
                strokeWidth={2}
                name="وقت الانتظار المتوقع"
                dot={false}
              />
              <Bar
                yAxisId="right"
                dataKey="flowRate"
                fill="#10b981"
                opacity={0.3}
                name="معدل التدفق"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Flow Statistics */}
      <Card className="shadow-md bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle>إحصائيات التدفق</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-slate-600 mb-2">معدل الذروة</p>
              <p className="text-2xl font-bold text-blue-700">{peakFlowRate}</p>
              <p className="text-xs text-slate-500 mt-1">شخص/دقيقة</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-xs text-slate-600 mb-2">الاتجاه الحالي</p>
              <p className="text-2xl font-bold text-green-700">
                {isTrendingUp ? '+' : ''}{flowTrend.toFixed(1)}
              </p>
              <p className="text-xs text-slate-500 mt-1">شخص/دقيقة</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <p className="text-xs text-slate-600 mb-2">الفرق عن المتوسط</p>
              <p className="text-2xl font-bold text-orange-700">
                {((currentFlowRate - averageFlowRate) / averageFlowRate * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">من المتوسط</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-slate-600 mb-2">الاستقرار</p>
              <p className="text-2xl font-bold text-purple-700">
                {(100 - Math.abs(flowTrend) * 5).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">مستقر</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>رؤى ذكية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {efficiency > 80 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-800">
                ✓ البوابة تعمل بكفاءة عالية جداً. التدفق سلس وسريع.
              </div>
            )}
            {efficiency >= 50 && efficiency <= 80 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
                ℹ البوابة تعمل بكفاءة معقولة. الأداء طبيعي.
              </div>
            )}
            {efficiency < 50 && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                ⚠ البوابة تعمل بكفاءة منخفضة. قد يكون هناك تأخير.
              </div>
            )}

            {isTrendingUp && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-800">
                ✓ معدل التدفق يتحسن. وقت الانتظار سيقل قريباً.
              </div>
            )}
            {!isTrendingUp && flowTrend < -2 && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-sm text-orange-800">
                ⚠ معدل التدفق يتباطأ. قد يزداد وقت الانتظار.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
