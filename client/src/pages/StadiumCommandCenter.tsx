/**
 * Stadium Command Center
 * CrowdOS - Smart Stadium Operating System
 * 
 * غرفة العمليات الرئيسية للملاعب الذكية
 * Inspired by: Apple Design + FIFA Stadium Operations + NASA Control Rooms
 * Enhanced with: Saudi National Identity + Predictive Intelligence + Operational Narrative
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, TrendingUp, Users, Zap, MapPin, Brain, Clock, Target, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const gateDistributionData = [
  { name: 'Gate 1', value: 28, color: '#10b981' },
  { name: 'Gate 2', value: 35, color: '#ef4444' },
  { name: 'Gate 3', value: 22, color: '#10b981' },
  { name: 'Gate 4', value: 15, color: '#f59e0b' },
];

// Predictive Intelligence Engine
const predictiveInsights = [
  {
    id: 1,
    type: 'warning',
    title: 'تحذير: ازدحام متوقع',
    description: 'يتوقع ازدحام البوابة 2 خلال 7 دقائق بنسبة 92%',
    action: 'فتح مسار إضافي',
    confidence: 92,
    icon: AlertCircle,
    color: 'from-red-600 to-red-800',
  },
  {
    id: 2,
    type: 'recommendation',
    title: 'توصية ذكية',
    description: 'نوصي بإعادة توجيه 20% من الجماهير للبوابة 4 (غير مزدحمة)',
    action: 'تنفيذ الآن',
    confidence: 88,
    icon: Brain,
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 3,
    type: 'info',
    title: 'معلومة تشغيلية',
    description: 'الممر الشمالي جاهز لاستقبال 5000 مشجع إضافي',
    action: 'تفعيل الآن',
    confidence: 95,
    icon: Zap,
    color: 'from-green-600 to-green-800',
  },
];

export default function StadiumCommandCenter() {
  const [location, setLocation] = useLocation();
  const [attendance, setAttendance] = useState(45000);
  const [crowdDensity, setCrowdDensity] = useState(68);
  const [gateRisk, setGateRisk] = useState(62);
  const [activeAlerts, setActiveAlerts] = useState(3);
  const [entranceRate, setEntranceRate] = useState(1250);
  const [slaCompliance, setSlaCompliance] = useState(87);

  useEffect(() => {
    const interval = setInterval(() => {
      setAttendance(prev => Math.max(40000, Math.min(55000, prev + Math.random() * 1000 - 500)));
      setCrowdDensity(prev => Math.max(30, Math.min(95, prev + Math.random() * 10 - 5)));
      setGateRisk(prev => Math.max(20, Math.min(90, prev + Math.random() * 8 - 4)));
      setEntranceRate(prev => Math.max(800, Math.min(1500, prev + Math.random() * 200 - 100)));
      setSlaCompliance(prev => Math.max(75, Math.min(98, prev + Math.random() * 5 - 2.5)));
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

  const getStatusText = (value: number) => {
    if (value > 75) return 'حرج';
    if (value > 50) return 'تحذير';
    return 'طبيعي';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Saudi National Identity */}
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🇸🇦</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">CrowdOS</h1>
              </div>
              <p className="text-gray-400 text-sm">Stadium Command Center | مركز قيادة الملعب</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 space-y-8">
        {/* Narrative Introduction */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-3 text-blue-300">📊 حالة الملعب الحالية</h2>
          <p className="text-gray-300 mb-4 leading-relaxed">
            الملعب يستقبل حالياً <span className="font-bold text-cyan-400">45,000 مشجع</span> من أصل 60,000 سعة. معدل الدخول مستقر عند <span className="font-bold text-cyan-400">1,250 مشجع/دقيقة</span>. 
            النظام يتنبأ بـ <span className="font-bold text-amber-400">ازدحام في البوابة 2</span> خلال 7 دقائق، مما قد يؤدي إلى تأخير الدخول بـ 5-10 دقائق إضافية. 
            التوصية الحالية: <span className="font-bold text-emerald-400">فتح مسار إضافي وإعادة توجيه 20% من الجماهير للبوابة 4</span> لتقليل وقت الانتظار وتحسين رضا الجماهير.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">✓ تقليل الازدحام</div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">✓ رفع رضا الجماهير</div>
            <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">✓ تحسين الأمن</div>
            <div className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold">✓ تقليل وقت الدخول</div>
          </div>
        </div>

        {/* Top KPIs - Performance Metrics */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-300">📈 مؤشرات الأداء الحية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Attendance */}
            <Card className="rounded-2xl bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">إجمالي الحضور</p>
                    <p className="text-3xl font-bold text-blue-400">{Math.round(attendance).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-2">من 60,000 سعة</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400/50" />
                </div>
              </CardContent>
            </Card>

            {/* Entrance Rate */}
            <Card className="rounded-2xl bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border-cyan-500/30 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">معدل الدخول</p>
                    <p className="text-3xl font-bold text-cyan-400">{Math.round(entranceRate)}</p>
                    <p className="text-xs text-gray-500 mt-2">مشجع/دقيقة</p>
                  </div>
                  <Activity className="w-8 h-8 text-cyan-400/50" />
                </div>
              </CardContent>
            </Card>

            {/* Overall Crowd Density */}
            <Card className="rounded-2xl bg-gradient-to-br from-amber-900/20 to-amber-800/10 border-amber-500/30 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">كثافة الجماهير</p>
                    <p className="text-3xl font-bold text-amber-400">{Math.round(crowdDensity)}%</p>
                    <p className="text-xs text-gray-500 mt-2">{getStatusText(crowdDensity)}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-amber-400/50" />
                </div>
              </CardContent>
            </Card>

            {/* SLA Compliance */}
            <Card className="rounded-2xl bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-500/30 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">SLA الدخول</p>
                    <p className="text-3xl font-bold text-emerald-400">{Math.round(slaCompliance)}%</p>
                    <p className="text-xs text-gray-500 mt-2">دخول في الوقت</p>
                  </div>
                  <Target className="w-8 h-8 text-emerald-400/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Critical Alerts */}
        {activeAlerts > 0 && (
          <Alert className="border-red-900/50 bg-red-950/20 backdrop-blur-xl rounded-2xl">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertDescription className="text-red-200 ml-4 text-sm">
              {activeAlerts} تنبيهات نشطة تحتاج إلى اهتمام فوري
            </AlertDescription>
          </Alert>
        )}

        {/* Predictive Intelligence & Recommendations */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-300 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            الذكاء التنبؤي والتوصيات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictiveInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <Card key={insight.id} className={`rounded-2xl bg-gradient-to-br ${insight.color} border-0 backdrop-blur-xl overflow-hidden group hover:shadow-lg transition-all duration-300`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <Icon className="w-6 h-6 text-white/80" />
                      <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full text-white">
                        {insight.confidence}% ثقة
                      </span>
                    </div>
                    <h3 className="font-bold text-white mb-2">{insight.title}</h3>
                    <p className="text-white/80 text-sm mb-4">{insight.description}</p>
                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all duration-300">
                      {insight.action}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Top Section - Event Status Cards */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-300">حالة الحدث</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Attendance Card */}
            <Card className={`rounded-2xl border backdrop-blur-xl ${getRiskBgColor(crowdDensity)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  إجمالي الحضور
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-2">{Math.round(attendance).toLocaleString()}</p>
                <p className="text-sm text-gray-400">من 60,000 سعة</p>
              </CardContent>
            </Card>

            {/* Crowd Density Card */}
            <Card className={`rounded-2xl border backdrop-blur-xl ${getRiskBgColor(crowdDensity)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  كثافة الجماهير
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold mb-2 ${getRiskColor(crowdDensity)}`}>{Math.round(crowdDensity)}%</p>
                <p className="text-sm text-gray-400">{getStatusText(crowdDensity)}</p>
              </CardContent>
            </Card>

            {/* Gate Risk Card */}
            <Card className={`rounded-2xl border backdrop-blur-xl ${getRiskBgColor(gateRisk)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  مخاطر البوابات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold mb-2 ${getRiskColor(gateRisk)}`}>{Math.round(gateRisk)}%</p>
                <p className="text-sm text-gray-400">{getStatusText(gateRisk)}</p>
              </CardContent>
            </Card>

            {/* Active Alerts Card */}
            <Card className={`rounded-2xl border backdrop-blur-xl ${activeAlerts > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  التنبيهات النشطة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold mb-2 ${activeAlerts > 0 ? 'text-red-400' : 'text-green-400'}`}>{activeAlerts}</p>
                <p className="text-sm text-gray-400">{activeAlerts > 0 ? 'تحتاج اهتمام' : 'الوضع طبيعي'}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Middle Section - Stadium Heatmap & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crowd Density Heatmap */}
          <Card className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                خريطة الازدحام الحرارية
              </CardTitle>
              <CardDescription>توزيع الجماهير داخل الملعب</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
                {/* Heatmap Visualization */}
                <div className="w-full h-full relative">
                  {/* Stadium Shape */}
                  <svg className="w-full h-full" viewBox="0 0 400 300">
                    {/* Stadium outline */}
                    <rect x="50" y="50" width="300" height="200" fill="none" stroke="#4b5563" strokeWidth="2" rx="20" />
                    
                    {/* Crowd density zones */}
                    <circle cx="100" cy="100" r="35" fill="#ef4444" opacity="0.6" />
                    <circle cx="300" cy="100" r="25" fill="#f59e0b" opacity="0.5" />
                    <circle cx="200" cy="150" r="40" fill="#10b981" opacity="0.4" />
                    <circle cx="100" cy="200" r="20" fill="#10b981" opacity="0.3" />
                    <circle cx="300" cy="200" r="30" fill="#f59e0b" opacity="0.4" />
                    
                    {/* Gate labels */}
                    <text x="80" y="280" fontSize="12" fill="#9ca3af">Gate 1</text>
                    <text x="180" y="280" fontSize="12" fill="#9ca3af">Gate 3</text>
                    <text x="280" y="280" fontSize="12" fill="#9ca3af">Gate 2</text>
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-400">حرج (75%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-400">تحذير (50-75%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">طبيعي (&lt;50%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gate Distribution */}
          <Card className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                توزيع البوابات
              </CardTitle>
              <CardDescription>نسبة التدفق لكل بوابة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={gateDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {gateDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {gateDistributionData.map((gate) => (
                  <div key={gate.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: gate.color }}></div>
                      <span className="text-gray-400">{gate.name}</span>
                    </div>
                    <span className="font-semibold">{gate.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Arrival Prediction Chart */}
        <Card className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              توقع وصول الجماهير
            </CardTitle>
            <CardDescription>نافذة الذروة: T-45 (18,000 مشجع متوقع)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={arrivalPredictionData}>
                <defs>
                  <linearGradient id="colorFans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Area
                  type="monotone"
                  dataKey="fans"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorFans)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crowd Flow Chart */}
        <Card className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              تدفق الجماهير
            </CardTitle>
            <CardDescription>معدل الدخول بالدقيقة - الحالة: مستقرة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={crowdFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="flow"
                  stroke="#10b981"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Operational Recommendations with Narrative */}
        <Card className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              التوصيات التشغيلية الذكية
            </CardTitle>
            <CardDescription>قرارات مدعومة بالبيانات والتنبؤات - مع شرح المعنى والأثر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recommendation 1 */}
              <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30 hover:border-red-500/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-red-300 text-lg">🚨 فتح مسار إضافي في البوابة 2</h4>
                    <span className="text-xs bg-red-500/20 px-2 py-1 rounded text-red-300 inline-block mt-2">أولوية عالية - تنفيذ فوري</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3 font-semibold">🔍 المشكلة:</p>
                <p className="text-sm text-gray-400 mb-4">البوابة 2 تعاني من ازدحام شديد (92% استخدام). معدل الدخول الحالي 850 مشجع/دقيقة، لكن السعة القصوى 1200 مشجع/دقيقة فقط. هذا يعني تأخير 5-10 دقائق إضافية.</p>
                <p className="text-sm text-gray-300 mb-3 font-semibold">✅ القرار:</p>
                <p className="text-sm text-gray-400 mb-4">فتح مسار إضافي (مسار 3) سيزيد السعة من 1200 إلى 1800 مشجع/دقيقة.</p>
                <p className="text-sm text-gray-300 mb-3 font-semibold">📊 الأثر المتوقع:</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-red-500/20 p-2 rounded">
                    <span className="text-red-300 font-semibold">وقت الانتظار</span>
                    <p className="text-gray-400">من 12 دقيقة → 5 دقائق</p>
                  </div>
                  <div className="bg-emerald-500/20 p-2 rounded">
                    <span className="text-emerald-300 font-semibold">رضا الجماهير</span>
                    <p className="text-gray-400">+35% في الرضا</p>
                  </div>
                  <div className="bg-blue-500/20 p-2 rounded">
                    <span className="text-blue-300 font-semibold">السلامة</span>
                    <p className="text-gray-400">تقليل الضغط البشري</p>
                  </div>
                  <div className="bg-purple-500/20 p-2 rounded">
                    <span className="text-purple-300 font-semibold">الإيرادات</span>
                    <p className="text-gray-400">+12% في الإيرادات</p>
                  </div>
                </div>
              </div>

              {/* Recommendation 2 */}
              <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-blue-300 text-lg">🔄 إعادة توجيه 20% من الجماهير للبوابة 4</h4>
                    <span className="text-xs bg-blue-500/20 px-2 py-1 rounded text-blue-300 inline-block mt-2">موصى به - تنفيذ خلال 3 دقائق</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3 font-semibold">🔍 المشكلة:</p>
                <p className="text-sm text-gray-400 mb-4">توزيع غير متوازن: البوابة 2 (92% استخدام) بينما البوابة 4 (45% استخدام). هذا يخلق اختناقات غير ضرورية.</p>
                <p className="text-sm text-gray-300 mb-3 font-semibold">✅ القرار:</p>
                <p className="text-sm text-gray-400 mb-4">إعادة توجيه 20% من الجماهير المتجهة للبوابة 2 إلى البوابة 4 (التي لديها سعة متاحة).</p>
                <p className="text-sm text-gray-300 mb-3 font-semibold">📊 الأثر المتوقع:</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-blue-500/20 p-2 rounded">
                    <span className="text-blue-300 font-semibold">توازن الحمل</span>
                    <p className="text-gray-400">جميع البوابات 60-70%</p>
                  </div>
                  <div className="bg-emerald-500/20 p-2 rounded">
                    <span className="text-emerald-300 font-semibold">كفاءة النظام</span>
                    <p className="text-gray-400">+18% في الكفاءة</p>
                  </div>
                  <div className="bg-purple-500/20 p-2 rounded">
                    <span className="text-purple-300 font-semibold">تجربة المشجع</span>
                    <p className="text-gray-400">دخول أسرع وأسهل</p>
                  </div>
                  <div className="bg-orange-500/20 p-2 rounded">
                    <span className="text-orange-300 font-semibold">التنبؤ</span>
                    <p className="text-gray-400">دقة 88%</p>
                  </div>
                </div>
              </div>

              {/* Recommendation 3 */}
              <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/30 hover:border-green-500/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-green-300 text-lg">⚡ تفعيل الممر الشمالي الإضافي</h4>
                    <span className="text-xs bg-green-500/20 px-2 py-1 rounded text-green-300 inline-block mt-2">اختياري - للحالات الطارئة</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3 font-semibold">🔍 المشكلة:</p>
                <p className="text-sm text-gray-400 mb-4">إذا استمر معدل الدخول بـ 1,250 مشجع/دقيقة، سيمتلئ الملعب خلال 12 دقيقة. الممر الشمالي متاح كحل إضافي.</p>
                <p className="text-sm text-gray-300 mb-3 font-semibold">✅ القرار:</p>
                <p className="text-sm text-gray-400 mb-4">تفعيل الممر الشمالي لاستقبال 5,000 مشجع إضافي، مما يزيد السعة الكلية بنسبة 8%.</p>
                <p className="text-sm text-gray-300 mb-3 font-semibold">📊 الأثر المتوقع:</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-green-500/20 p-2 rounded">
                    <span className="text-green-300 font-semibold">السعة الإضافية</span>
                    <p className="text-gray-400">+5,000 مشجع</p>
                  </div>
                  <div className="bg-emerald-500/20 p-2 rounded">
                    <span className="text-emerald-300 font-semibold">الأمان</span>
                    <p className="text-gray-400">تقليل الضغط</p>
                  </div>
                  <div className="bg-blue-500/20 p-2 rounded">
                    <span className="text-blue-300 font-semibold">وقت التنفيذ</span>
                    <p className="text-gray-400">2-3 دقائق</p>
                  </div>
                  <div className="bg-purple-500/20 p-2 rounded">
                    <span className="text-purple-300 font-semibold">الجاهزية</span>
                    <p className="text-gray-400">100% جاهز</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
