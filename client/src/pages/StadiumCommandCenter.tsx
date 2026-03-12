/**
 * Stadium Command Center
 * CrowdOS - Smart Stadium Operating System
 * 
 * غرفة العمليات الرئيسية للملاعب الذكية
 * Inspired by: Apple Design + FIFA Stadium Operations + NASA Control Rooms
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, TrendingUp, Users, Zap, MapPin } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const arrivalPredictionData = [
  { time: 'T-90', fans: 4000, label: 'T-90' },
  { time: 'T-60', fans: 12000, label: 'T-60' },
  { time: 'T-45', fans: 18000, label: 'T-45 (Peak)' },
  { time: 'T-30', fans: 10000, label: 'T-30' },
  { time: 'T-15', fans: 6000, label: 'T-15' },
  { time: 'Kickoff', fans: 2000, label: 'Kickoff' },
];

const crowdFlowData = [
  { time: '14:00', flow: 2400 },
  { time: '15:00', flow: 3200 },
  { time: '16:00', flow: 2800 },
  { time: '17:00', flow: 4100 },
  { time: '18:00', flow: 5200 },
  { time: '19:00', flow: 4800 },
  { time: '20:00', flow: 3200 },
];

export default function StadiumCommandCenter() {
  const [location, setLocation] = useLocation();
  const [attendance, setAttendance] = useState(45000);
  const [crowdDensity, setCrowdDensity] = useState(68);
  const [gateRisk, setGateRisk] = useState(62);
  const [activeAlerts, setActiveAlerts] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setAttendance(prev => Math.max(40000, Math.min(55000, prev + Math.random() * 1000 - 500)));
      setCrowdDensity(prev => Math.max(30, Math.min(95, prev + Math.random() * 10 - 5)));
      setGateRisk(prev => Math.max(20, Math.min(90, prev + Math.random() * 8 - 4)));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (value: number) => {
    if (value > 75) return 'text-red-500';
    if (value > 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBgColor = (value: number) => {
    if (value > 75) return 'bg-red-500/10 border-red-500/30';
    if (value > 50) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-green-500/10 border-green-500/30';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-black sticky top-0 z-50">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
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
              <h1 className="text-3xl font-bold">CrowdOS</h1>
              <p className="text-gray-400 text-sm">Stadium Command Center</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Critical Alerts */}
        {activeAlerts > 0 && (
          <Alert className="mb-8 border-red-900/50 bg-red-950/20 backdrop-blur-xl">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertDescription className="text-red-200 ml-4 text-sm">
              {activeAlerts} تنبيهات نشطة تحتاج إلى اهتمام فوري
            </AlertDescription>
          </Alert>
        )}

        {/* Top Section - Event Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Attendance */}
          <Card className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">إجمالي الحضور</p>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold mb-2">{(attendance / 1000).toFixed(0)}K</div>
              <p className="text-gray-500 text-xs">من السعة الكلية 60,000</p>
            </CardContent>
          </Card>

          {/* Crowd Density */}
          <Card className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">كثافة الجماهير</p>
                <Zap className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="text-3xl font-bold mb-2">{crowdDensity.toFixed(0)}%</div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${crowdDensity}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Gate Risk */}
          <Card className={`rounded-2xl border backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-300 ${getRiskBgColor(gateRisk)}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">مخاطر البوابات</p>
                <AlertCircle className={`w-5 h-5 ${getRiskColor(gateRisk)}`} />
              </div>
              <div className={`text-3xl font-bold mb-2 ${getRiskColor(gateRisk)}`}>{gateRisk.toFixed(0)}%</div>
              <p className="text-gray-500 text-xs">
                {gateRisk > 75 ? 'حرج' : gateRisk > 50 ? 'تحذير' : 'آمن'}
              </p>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">التنبيهات النشطة</p>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold mb-2">{activeAlerts}</div>
              <p className="text-gray-500 text-xs">تحتاج إلى إجراء فوري</p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section - Stadium Heatmap & Crowd Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stadium Heatmap */}
          <Card className="lg:col-span-2 rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">خريطة الازدحام الحية</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Stadium Heatmap - توزيع الجماهير</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center border border-gray-700 relative overflow-hidden">
                {/* Animated Heatmap Background */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
                <div className="relative z-10 text-center">
                  <p className="text-gray-400 text-sm">خريطة الازدحام الحية</p>
                  <p className="text-gray-500 text-xs mt-2">Real-time Crowd Distribution</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">التوصيات الذكية</h3>
            <Card className="rounded-2xl bg-gradient-to-br from-blue-950/40 to-blue-900/20 border-blue-800/50 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">فتح البوابة 4</p>
                    <p className="text-gray-400 text-xs">تقليل الضغط 40%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-gradient-to-br from-yellow-950/40 to-yellow-900/20 border-yellow-800/50 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">إعادة توجيه الجماهير</p>
                    <p className="text-gray-400 text-xs">25% للبوابات الأخرى</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-gradient-to-br from-green-950/40 to-green-900/20 border-green-800/50 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">تأخير نافذة الدخول</p>
                    <p className="text-gray-400 text-xs">15 دقيقة إضافية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Arrival Prediction & Crowd Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Arrival Prediction */}
          <Card className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">توقع وصول الجماهير</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Fan Arrival Prediction - قبل المباراة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={arrivalPredictionData}>
                  <defs>
                    <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#424245" />
                  <XAxis dataKey="label" stroke="#8e8e93" fontSize={12} />
                  <YAxis stroke="#8e8e93" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #424245', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Area type="monotone" dataKey="fans" stroke="#0071e3" fillOpacity={1} fill="url(#colorArrivals)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-xs font-semibold">Peak Arrival Window: T-45 (18,000 fans)</p>
              </div>
            </CardContent>
          </Card>

          {/* Crowd Flow Stability */}
          <Card className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">تدفق الجماهير</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Crowd Flow - آخر 6 ساعات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={crowdFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#424245" />
                  <XAxis dataKey="time" stroke="#8e8e93" fontSize={12} />
                  <YAxis stroke="#8e8e93" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #424245', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Line type="monotone" dataKey="flow" stroke="#00d4ff" strokeWidth={3} dot={{ fill: '#00d4ff', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-xs font-semibold">Status: Stable ✓</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
