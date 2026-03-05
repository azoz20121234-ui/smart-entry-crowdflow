/**
 * Corridor & Path Monitoring Component
 * Smart Entry & CrowdFlow
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, Navigation, Zap, TrendingUp, Users, Clock } from 'lucide-react';
import { corridorManagement, Corridor } from '@/lib/corridorManagement';
import { smartPathfinding } from '@/lib/smartPathfinding';
import { advancedTicketing } from '@/lib/advancedTicketing';

export function CorridorPathMonitoring() {
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [pathStats, setPathStats] = useState<any>(null);
  const [ticketStats, setTicketStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    // Load initial data
    setCorridors(corridorManagement.getAllCorridors());
    setPathStats(smartPathfinding.getNetworkStats());
    setTicketStats(advancedTicketing.getPricingStats());
    setRecommendations(corridorManagement.getCorridorRecommendations());

    // Simulate real-time updates
    const interval = setInterval(() => {
      corridorManagement.simulateRealTimeUpdates();
      smartPathfinding.simulateRealTimeUpdates();
      setCorridors(corridorManagement.getAllCorridors());
      setPathStats(smartPathfinding.getNetworkStats());
      setRecommendations(corridorManagement.getCorridorRecommendations());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return 'عادي';
      case 'warning':
        return 'تحذير';
      case 'critical':
        return 'حرج';
      default:
        return 'غير معروف';
    }
  };

  // Prepare chart data
  const corridorDensityData = corridors.map(c => ({
    name: c.name,
    density: c.currentDensity,
    capacity: c.maxCapacity,
  }));

  const networkHealthData = [
    { name: 'صحة الشبكة', value: pathStats?.networkHealth || 0 },
    { name: 'الازدحام', value: pathStats?.averageCongestion || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {recommendations.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 mr-3">
            <strong>تنبيهات حرجة:</strong> {recommendations.length} ممر يحتاج إلى انتباه فوري
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="pt-4">
            <p className="text-sm text-slate-600 mb-2">صحة الشبكة</p>
            <p className="text-3xl font-bold text-green-700">{pathStats?.networkHealth || 0}%</p>
            <p className="text-xs text-slate-500 mt-2">كفاءة الممرات</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-4">
            <p className="text-sm text-slate-600 mb-2">الممرات الحرجة</p>
            <p className="text-3xl font-bold text-red-700">
              {corridors.filter(c => c.status === 'critical').length}
            </p>
            <p className="text-xs text-slate-500 mt-2">تحتاج تدخل فوري</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-4">
            <p className="text-sm text-slate-600 mb-2">متوسط الازدحام</p>
            <p className="text-3xl font-bold text-blue-700">{pathStats?.averageCongestion || 0}%</p>
            <p className="text-xs text-slate-500 mt-2">عبر جميع الممرات</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-4">
            <p className="text-sm text-slate-600 mb-2">نقاط الاختناق</p>
            <p className="text-3xl font-bold text-orange-700">{pathStats?.bottlenecks || 0}</p>
            <p className="text-xs text-slate-500 mt-2">نقاط حرجة</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="corridors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="corridors" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            الممرات
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            المسارات
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            التذاكر
          </TabsTrigger>
        </TabsList>

        {/* Corridors Tab */}
        <TabsContent value="corridors" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>مراقبة الممرات</CardTitle>
              <CardDescription>حالة الازدحام والكثافة في كل ممر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={corridorDensityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="density" fill="#3b82f6" name="الكثافة الحالية %" />
                </BarChart>
              </ResponsiveContainer>

              {/* Corridor Details */}
              <div className="space-y-3">
                {corridors.map(corridor => (
                  <div key={corridor.id} className={`p-4 border-2 rounded-lg ${getStatusColor(corridor.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{corridor.name}</h4>
                      <span className="px-3 py-1 rounded-full bg-white/50 text-xs font-semibold">
                        {getStatusLabel(corridor.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="opacity-70">الكثافة</p>
                        <p className="font-bold">{corridor.currentDensity}%</p>
                      </div>
                      <div>
                        <p className="opacity-70">السعة</p>
                        <p className="font-bold">{corridor.maxCapacity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="opacity-70">العرض</p>
                        <p className="font-bold">{corridor.width}م</p>
                      </div>
                      <div>
                        <p className="opacity-70">الطول</p>
                        <p className="font-bold">{corridor.length}م</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paths Tab */}
        <TabsContent value="paths" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>تحليل المسارات</CardTitle>
              <CardDescription>كفاءة المسارات والازدحام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Network Health Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { time: '12:00', health: 85, congestion: 15 },
                  { time: '12:30', health: 78, congestion: 22 },
                  { time: '13:00', health: 72, congestion: 28 },
                  { time: '13:30', health: 68, congestion: 32 },
                  { time: '14:00', health: 65, congestion: 35 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} name="صحة الشبكة" />
                  <Line type="monotone" dataKey="congestion" stroke="#ef4444" strokeWidth={2} name="الازدحام" />
                </LineChart>
              </ResponsiveContainer>

              {/* Path Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">توصيات المسارات</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>✓ المسار من المدخل 2 إلى البوابة 3 هو الأمثل حالياً</li>
                  <li>✓ تجنب المسار من المدخل 1 إلى البوابة 4 (ازدحام 92%)</li>
                  <li>✓ استخدم الممر الشرقي الثانوي لتوزيع أفضل للحشود</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>إحصائيات التذاكر الديناميكية</CardTitle>
              <CardDescription>الأسعار والإيرادات والحوافز</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">إجمالي التذاكر</p>
                  <p className="text-2xl font-bold text-blue-700">{ticketStats?.totalTicketsSold || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-700">${ticketStats?.totalRevenue || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">متوسط السعر</p>
                  <p className="text-2xl font-bold text-purple-700">${ticketStats?.averagePrice || 0}</p>
                </div>
              </div>

              {/* Pricing Strategies */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-3">استراتيجيات التسعير</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
                    <span>استراتيجية الذروة</span>
                    <span className="font-semibold text-red-600">1.4x</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
                    <span>استراتيجية عادية</span>
                    <span className="font-semibold text-blue-600">1.0x</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
                    <span>استراتيجية الفترة الهادئة</span>
                    <span className="font-semibold text-green-600">0.7x + 15% حافز</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
