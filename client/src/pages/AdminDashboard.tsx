/**
 * Admin Dashboard - Smart Entry & CrowdFlow
 * 
 * Design Philosophy: Modern Dynamic Design
 * - Live data visualization with smooth animations
 * - Color-coded status system (green=normal, yellow=warning, red=critical)
 * - Clear hierarchy with large numbers for key metrics
 * - Real-time gate status monitoring
 */

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp, Users, Zap, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchOperatorState } from '@/lib/operatorApi';
import { createDefaultGates, type GateStatus } from '@shared/operator';
import { FanArrivalSimulator } from '@/components/FanArrivalSimulator';
import { ScenarioSimulation } from '@/components/ScenarioSimulation';
import { GateCapacityMonitor } from '@/components/GateCapacityMonitor';

// Mock data for crowd flow
const generateCrowdData = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${12 + i}:00`,
    totalCrowd: Math.floor(800 + Math.random() * 400 + i * 50),
    gate1: Math.floor(200 + Math.random() * 150 + i * 20),
    gate2: Math.floor(250 + Math.random() * 150 + i * 25),
    gate3: Math.floor(180 + Math.random() * 150 + i * 15),
    gate4: Math.floor(220 + Math.random() * 150 + i * 22),
  }));
};

const STEP_INTERVAL_MS = 3000;

type AdminGateStatus = {
  id: number;
  name: string;
  capacity: number;
  current: number;
  status: 'normal' | 'warning' | 'critical';
  flow: number;
};

const mapOperatorGateToAdminGate = (gate: GateStatus): AdminGateStatus => ({
  id: gate.id,
  name: gate.name,
  capacity: gate.capacity,
  current: Math.min(gate.capacity, Math.max(400, Math.round(gate.currentQueue * 25))),
  status: gate.status,
  flow: Math.round(gate.flowRate * 50),
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return '#10b981';
    case 'warning':
      return '#f59e0b';
    case 'critical':
      return '#ef4444';
    default:
      return '#6b7280';
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

export default function AdminDashboard() {
  const [crowdData, setCrowdData] = useState(generateCrowdData());
  const [gateStatuses, setGateStatuses] = useState<AdminGateStatus[]>(() =>
    createDefaultGates().map(mapOperatorGateToAdminGate)
  );
  const [totalCrowd, setTotalCrowd] = useState(7650);
  const [avgWaitTime, setAvgWaitTime] = useState(8);
  const [dataSource, setDataSource] = useState<'server' | 'local'>('local');

  useEffect(() => {
    let isActive = true;
    const syncAdminState = async () => {
      try {
        const state = await fetchOperatorState();
        if (!isActive) return;
        setDataSource('server');
        const nextGates = state.gates.map(mapOperatorGateToAdminGate);
        setGateStatuses(nextGates);
        setTotalCrowd(nextGates.reduce((sum, gate) => sum + gate.current, 0));
        const avgWait =
          state.gates.reduce((sum, gate) => sum + gate.averageWaitTime, 0) /
          Math.max(1, state.gates.length);
        setAvgWaitTime(Number(avgWait.toFixed(1)));
      } catch {
        if (!isActive) return;
        setDataSource('local');
      }
    };

    syncAdminState();
    const interval = setInterval(syncAdminState, STEP_INTERVAL_MS);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  // Simulate charts locally even when data source is API
  useEffect(() => {
    const interval = setInterval(() => {
      setCrowdData(prev => {
        const newData = [...prev.slice(1)];
        const lastEntry = prev[prev.length - 1];
        newData.push({
          time: `${new Date().getHours()}:00`,
          totalCrowd: Math.max(800, Math.min(1200, lastEntry.totalCrowd + (Math.random() - 0.5) * 100)),
          gate1: Math.max(100, Math.min(400, lastEntry.gate1 + (Math.random() - 0.5) * 50)),
          gate2: Math.max(100, Math.min(400, lastEntry.gate2 + (Math.random() - 0.5) * 50)),
          gate3: Math.max(100, Math.min(400, lastEntry.gate3 + (Math.random() - 0.5) * 50)),
          gate4: Math.max(100, Math.min(400, lastEntry.gate4 + (Math.random() - 0.5) * 50)),
        });
        return newData;
      });
      
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const criticalGates = gateStatuses.filter(g => g.status === 'critical');
  const capacityData = gateStatuses.map(g => ({
    name: g.name,
    capacity: g.capacity,
    current: g.current,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">لوحة التحكم</h1>
              <p className="text-slate-600 mt-2">إدارة الحشود والبوابات في الوقت الفعلي</p>
              <p
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  dataSource === 'server'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {dataSource === 'server' ? 'بيانات مباشرة' : 'وضع محلي احتياطي'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">تصدير التقرير</Button>
              <Button className="bg-blue-700 hover:bg-blue-800">تحديث البيانات</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Critical Alerts */}
        {criticalGates.length > 0 && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 mr-3">
              <strong>تنبيه حرج:</strong> البوابة {criticalGates[0].name} تتجاوز السعة المقررة. يرجى توجيه الجماهير إلى البوابات الأخرى.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-700 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600">إجمالي الحشود</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-blue-700">{totalCrowd.toLocaleString()}</div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
              <p className="text-xs text-slate-500 mt-2">من السعة الكلية: 10,000</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600">متوسط وقت الانتظار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-green-600">{avgWaitTime.toFixed(1)}</div>
                <Clock className="w-12 h-12 text-green-200" />
              </div>
              <p className="text-xs text-slate-500 mt-2">دقيقة</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600">البوابات بتحذير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-yellow-600">
                  {gateStatuses.filter(g => g.status === 'warning').length}
                </div>
                <AlertCircle className="w-12 h-12 text-yellow-200" />
              </div>
              <p className="text-xs text-slate-500 mt-2">تحتاج مراقبة</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-600 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600">البوابات الحرجة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-red-600">{criticalGates.length}</div>
                <Activity className="w-12 h-12 text-red-200" />
              </div>
              <p className="text-xs text-slate-500 mt-2">تحتاج تدخل فوري</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart */}
          <Card className="lg:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle>تطور الحشود على مدار اليوم</CardTitle>
              <CardDescription>البيانات الحية لكل بوابة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={crowdData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="totalCrowd" stroke="#1e3a8a" strokeWidth={3} name="إجمالي الحشود" dot={false} />
                  <Line type="monotone" dataKey="gate1" stroke="#10b981" strokeWidth={2} name="البوابة 1" dot={false} />
                  <Line type="monotone" dataKey="gate2" stroke="#06b6d4" strokeWidth={2} name="البوابة 2" dot={false} />
                  <Line type="monotone" dataKey="gate3" stroke="#f59e0b" strokeWidth={2} name="البوابة 3" dot={false} />
                  <Line type="monotone" dataKey="gate4" stroke="#ef4444" strokeWidth={2} name="البوابة 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gate Distribution */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>توزيع الحشود على البوابات</CardTitle>
              <CardDescription>النسبة المئوية الحالية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gateStatuses}
                    dataKey="current"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {gateStatuses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gates Status Grid */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6" />
                حالة البوابات
              </CardTitle>
            <CardDescription>معلومات تفصيلية عن كل بوابة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gateStatuses.map((gate) => (
                <div
                  key={gate.id}
                  className="p-6 rounded-lg border-2 transition-all hover:shadow-lg"
                  style={{ borderColor: getStatusColor(gate.status), backgroundColor: `${getStatusColor(gate.status)}08` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{gate.name}</h3>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getStatusColor(gate.status) }}
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">الحشود الحالية</p>
                      <p className="text-2xl font-bold text-slate-900">{gate.current.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-1">من {gate.capacity.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-1">معدل التدفق</p>
                      <p className="text-lg font-semibold text-slate-900">{gate.flow} شخص/ساعة</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-600">
                        الحالة: <span style={{ color: getStatusColor(gate.status) }}>{getStatusLabel(gate.status)}</span>
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${(gate.current / gate.capacity) * 100}%`,
                            backgroundColor: getStatusColor(gate.status),
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {((gate.current / gate.capacity) * 100).toFixed(0)}% من السعة
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fan Arrival Simulator */}
        <div className="mt-8">
          <FanArrivalSimulator />
        </div>

        {/* Scenario Simulation */}
        <div className="mt-8">
          <ScenarioSimulation />
        </div>

        {/* Gate Capacity Monitor */}
        <div className="mt-8">
          <GateCapacityMonitor />
        </div>

        {/* Virtual Queue Info */}
        <Card className="mt-8 shadow-md bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <TrendingUp className="w-6 h-6" />
              الطوابير الافتراضية
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700">
            <p className="mb-4">
              نظام الطوابير الافتراضية يسمح للمشجعين بالانضمام إلى طابور رقمي دون الوقوف فعلياً. يحصل كل مشجع على رقم دور ويُسمح له بالاقتراب من البوابة عند اقتراب دوره الفعلي.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-slate-600">في الطابور الآن</p>
                <p className="text-2xl font-bold text-blue-700">2,847</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-xs text-slate-600">تم خدمتهم اليوم</p>
                <p className="text-2xl font-bold text-green-700">5,234</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <p className="text-xs text-slate-600">متوسط الانتظار</p>
                <p className="text-2xl font-bold text-yellow-700">6 دقائق</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-slate-600">كفاءة النظام</p>
                <p className="text-2xl font-bold text-purple-700">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
