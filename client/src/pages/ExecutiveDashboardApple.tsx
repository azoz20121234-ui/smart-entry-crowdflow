/**
 * Executive Dashboard - Apple Design
 * CrowdOS Stadium Brain
 * 
 * لوحة القرار الهادئة والفاخرة للمديرين التنفيذيين
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, BarChart3 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const revenueData = [
  { time: '14:00', revenue: 45000 },
  { time: '15:00', revenue: 52000 },
  { time: '16:00', revenue: 48000 },
  { time: '17:00', revenue: 61000 },
  { time: '18:00', revenue: 75000 },
  { time: '19:00', revenue: 82000 },
  { time: '20:00', revenue: 78000 },
];

const fanFlowData = [
  { time: '14:00', flow: 2400 },
  { time: '15:00', flow: 3200 },
  { time: '16:00', flow: 2800 },
  { time: '17:00', flow: 4100 },
  { time: '18:00', flow: 5200 },
  { time: '19:00', flow: 4800 },
  { time: '20:00', flow: 3200 },
];

const riskData = [
  { name: 'آمن', value: 60, color: '#34c759' },
  { name: 'تحذير', value: 25, color: '#ff9500' },
  { name: 'حرج', value: 15, color: '#ff3b30' },
];

export default function ExecutiveDashboardApple() {
  const [location, setLocation] = useLocation();
  const [totalRevenue, setTotalRevenue] = useState(441000);
  const [revenueGrowth, setRevenueGrowth] = useState(12.5);
  const [totalFans, setTotalFans] = useState(28400);
  const [fanGrowth, setFanGrowth] = useState(8.2);
  const [operationalRisk, setOperationalRisk] = useState(15);
  const [systemHealth, setSystemHealth] = useState(94);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalRevenue(prev => prev + Math.random() * 5000 - 2500);
      setRevenueGrowth(prev => prev + (Math.random() - 0.5));
      setTotalFans(prev => prev + Math.floor(Math.random() * 100 - 50));
      setFanGrowth(prev => prev + (Math.random() - 0.5));
      setOperationalRisk(prev => Math.max(5, Math.min(95, prev + (Math.random() - 0.5) * 2)));
      setSystemHealth(prev => Math.max(80, Math.min(100, prev + (Math.random() - 0.5))));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>

          <div>
            <h1 className="text-5xl font-bold mb-2">لوحة القرار</h1>
            <p className="text-gray-400 text-lg">Executive Dashboard - مؤشرات الأداء الرئيسية</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Top KPIs - 4 Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Revenue */}
          <Card className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 backdrop-blur-xl overflow-hidden">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">الإيرادات الكلية</p>
                  <h3 className="text-3xl font-bold">
                    {(totalRevenue / 1000).toFixed(0)}K
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-semibold">
                  +{revenueGrowth.toFixed(1)}%
                </span>
                <span className="text-gray-500 text-sm">من أمس</span>
              </div>
            </CardContent>
          </Card>

          {/* Fan Flow */}
          <Card className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 backdrop-blur-xl overflow-hidden">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">تدفق الجماهير</p>
                  <h3 className="text-3xl font-bold">
                    {totalFans.toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-semibold">
                  +{fanGrowth.toFixed(1)}%
                </span>
                <span className="text-gray-500 text-sm">من أمس</span>
              </div>
            </CardContent>
          </Card>

          {/* Operational Risk */}
          <Card className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 backdrop-blur-xl overflow-hidden">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">المخاطر التشغيلية</p>
                  <h3 className="text-3xl font-bold">{operationalRisk.toFixed(0)}%</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {operationalRisk > 50 ? (
                  <TrendingUp className="w-4 h-4 text-red-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-400" />
                )}
                <span className={operationalRisk > 50 ? 'text-red-400 text-sm font-semibold' : 'text-green-400 text-sm font-semibold'}>
                  {operationalRisk > 50 ? 'مرتفع' : 'منخفض'}
                </span>
                <span className="text-gray-500 text-sm">المستوى الحالي</span>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 backdrop-blur-xl overflow-hidden">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">صحة النظام</p>
                  <h3 className="text-3xl font-bold">{systemHealth.toFixed(0)}%</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${systemHealth}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Revenue Trend */}
          <Card className="rounded-2xl bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">اتجاه الإيرادات</CardTitle>
              <CardDescription className="text-gray-400">Revenue Trend - آخر 6 ساعات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#424245" />
                  <XAxis dataKey="time" stroke="#8e8e93" />
                  <YAxis stroke="#8e8e93" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #424245', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0071e3" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Fan Flow Trend */}
          <Card className="rounded-2xl bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">تدفق الجماهير</CardTitle>
              <CardDescription className="text-gray-400">Fan Flow - آخر 6 ساعات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fanFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#424245" />
                  <XAxis dataKey="time" stroke="#8e8e93" />
                  <YAxis stroke="#8e8e93" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #424245', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Line type="monotone" dataKey="flow" stroke="#00d4ff" strokeWidth={3} dot={{ fill: '#00d4ff', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution & Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Distribution */}
          <Card className="rounded-2xl bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">توزيع المخاطر</CardTitle>
              <CardDescription className="text-gray-400">Risk Distribution - حالة النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #424245', borderRadius: '8px' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                {riskData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-400">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="rounded-2xl bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">مؤشرات الأداء</CardTitle>
              <CardDescription className="text-gray-400">Performance Metrics - ملخص العمليات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metric 1 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400">كفاءة البوابات</p>
                  <span className="text-lg font-bold text-green-400">87%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400">رضا الجماهير</p>
                  <span className="text-lg font-bold text-blue-400">92%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400">توفر النظام</p>
                  <span className="text-lg font-bold text-cyan-400">99.8%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '99.8%' }}></div>
                </div>
              </div>

              {/* Metric 4 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400">معدل الخطأ</p>
                  <span className="text-lg font-bold text-orange-400">0.2%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '0.2%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
