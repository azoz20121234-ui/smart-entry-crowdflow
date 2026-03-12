/**
 * Executive Intelligence Dashboard
 * CrowdOS - Smart Stadium Operating System
 * 
 * لوحة القرار التنفيذية - هادئة وفاخرة
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, AlertTriangle, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const revenueData = [
  { time: '14:00', revenue: 45000 },
  { time: '15:00', revenue: 52000 },
  { time: '16:00', revenue: 48000 },
  { time: '17:00', revenue: 61000 },
  { time: '18:00', revenue: 73000 },
  { time: '19:00', revenue: 82000 },
  { time: '20:00', revenue: 78000 },
];

const fanFlowData = [
  { time: '14:00', flow: 1200 },
  { time: '15:00', flow: 2100 },
  { time: '16:00', flow: 1800 },
  { time: '17:00', flow: 3200 },
  { time: '18:00', flow: 4100 },
  { time: '19:00', flow: 3800 },
  { time: '20:00', flow: 2400 },
];

const riskDistribution = [
  { name: 'آمن', value: 65, color: '#10b981' },
  { name: 'تحذير', value: 25, color: '#f59e0b' },
  { name: 'حرج', value: 10, color: '#ef4444' },
];

export default function ExecutiveIntelligence() {
  const [location, setLocation] = useLocation();
  const [revenue, setRevenue] = useState(82000);
  const [fanScore, setFanScore] = useState(8.7);
  const [efficiency, setEfficiency] = useState(92);
  const [riskLevel, setRiskLevel] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue(prev => Math.max(70000, Math.min(90000, prev + Math.random() * 2000 - 1000)));
      setFanScore(prev => Math.max(8.0, Math.min(9.5, prev + Math.random() * 0.2 - 0.1)));
      setEfficiency(prev => Math.max(85, Math.min(95, prev + Math.random() * 4 - 2)));
      setRiskLevel(prev => Math.max(10, Math.min(30, prev + Math.random() * 4 - 2)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-black sticky top-0 z-50">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <div className="text-right">
              <h1 className="text-3xl font-bold">Executive Intelligence</h1>
              <p className="text-gray-400 text-sm">لوحة القرار التنفيذية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* KPI Cards - Large and Prominent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Revenue Impact */}
          <Card className="rounded-3xl bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border-emerald-800/50 backdrop-blur-xl hover:from-emerald-950/60 transition-all duration-300">
            <CardContent className="pt-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-emerald-200 text-sm font-medium mb-2">تأثير الإيرادات</p>
                  <div className="text-5xl font-bold text-emerald-400 mb-2">
                    ${(revenue / 1000).toFixed(0)}K
                  </div>
                  <p className="text-emerald-300/70 text-sm">+12% من الأمس</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-500/30" />
              </div>
              <div className="w-full bg-emerald-900/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(revenue / 90000) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Fan Experience Score */}
          <Card className="rounded-3xl bg-gradient-to-br from-blue-950/40 to-blue-900/20 border-blue-800/50 backdrop-blur-xl hover:from-blue-950/60 transition-all duration-300">
            <CardContent className="pt-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-2">درجة تجربة الجماهير</p>
                  <div className="text-5xl font-bold text-blue-400 mb-2">
                    {fanScore.toFixed(1)}/10
                  </div>
                  <p className="text-blue-300/70 text-sm">تقييم المشجعين</p>
                </div>
                <Users className="w-12 h-12 text-blue-500/30" />
              </div>
              <div className="w-full bg-blue-900/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(fanScore / 10) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Efficiency */}
          <Card className="rounded-3xl bg-gradient-to-br from-purple-950/40 to-purple-900/20 border-purple-800/50 backdrop-blur-xl hover:from-purple-950/60 transition-all duration-300">
            <CardContent className="pt-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-purple-200 text-sm font-medium mb-2">كفاءة التشغيل</p>
                  <div className="text-5xl font-bold text-purple-400 mb-2">
                    {efficiency.toFixed(0)}%
                  </div>
                  <p className="text-purple-300/70 text-sm">أداء النظام</p>
                </div>
                <Zap className="w-12 h-12 text-purple-500/30" />
              </div>
              <div className="w-full bg-purple-900/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${efficiency}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Security Risk Level */}
          <Card className="rounded-3xl bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-800/50 backdrop-blur-xl hover:from-red-950/60 transition-all duration-300">
            <CardContent className="pt-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-red-200 text-sm font-medium mb-2">مستوى المخاطر الأمنية</p>
                  <div className="text-5xl font-bold text-red-400 mb-2">
                    {riskLevel.toFixed(0)}%
                  </div>
                  <p className="text-red-300/70 text-sm">منخفض - آمن</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-500/30" />
              </div>
              <div className="w-full bg-red-900/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${riskLevel}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <Card className="rounded-3xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">اتجاه الإيرادات</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Revenue Trend - آخر 6 ساعات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#424245" />
                  <XAxis dataKey="time" stroke="#8e8e93" />
                  <YAxis stroke="#8e8e93" />
                  <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #424245', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Fan Flow */}
          <Card className="rounded-3xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">تدفق الجماهير</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Fan Flow - آخر 6 ساعات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fanFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#424245" />
                  <XAxis dataKey="time" stroke="#8e8e93" />
                  <YAxis stroke="#8e8e93" />
                  <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #424245', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="flow" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution */}
        <Card className="rounded-3xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl">توزيع المخاطر</CardTitle>
            <CardDescription className="text-gray-400 text-sm">Risk Distribution - حالة النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex justify-center items-center">
                <ResponsiveContainer width={250} height={250}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:col-span-2 flex flex-col justify-center space-y-4">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">{item.name}</p>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.value}%`, backgroundColor: item.color }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-400">{item.value}%</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
