/**
 * Operator Dashboard - Smart Entry & CrowdFlow
 * 
 * Advanced control panel for operators to manage virtual queues
 * Real-time analytics, gate management, and intelligent recommendations
 */

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Users, Zap, Clock, Settings, Bell, BarChart3, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VirtualQueueAnalytics } from '@/components/VirtualQueueAnalytics';

interface GateStatus {
  id: number;
  name: string;
  currentQueue: number;
  averageWaitTime: number;
  flowRate: number;
  capacity: number;
  efficiency: number;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  actionRequired: boolean;
}

export default function OperatorDashboard() {
  const [gates, setGates] = useState<GateStatus[]>([
    {
      id: 1,
      name: 'البوابة 1',
      currentQueue: 45,
      averageWaitTime: 8,
      flowRate: 42,
      capacity: 2500,
      efficiency: 84,
      trend: 'stable',
      status: 'normal',
    },
    {
      id: 2,
      name: 'البوابة 2',
      currentQueue: 78,
      averageWaitTime: 12,
      flowRate: 38,
      capacity: 2500,
      efficiency: 76,
      trend: 'up',
      status: 'warning',
    },
    {
      id: 3,
      name: 'البوابة 3',
      currentQueue: 32,
      averageWaitTime: 6,
      flowRate: 48,
      capacity: 2500,
      efficiency: 96,
      trend: 'stable',
      status: 'normal',
    },
    {
      id: 4,
      name: 'البوابة 4',
      currentQueue: 95,
      averageWaitTime: 18,
      flowRate: 32,
      capacity: 2500,
      efficiency: 64,
      trend: 'down',
      status: 'critical',
    },
  ]);

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'critical',
      message: 'البوابة 4 تتجاوز السعة المقررة. معدل التدفق منخفض جداً.',
      timestamp: new Date(Date.now() - 5 * 60000),
      actionRequired: true,
    },
    {
      id: '2',
      type: 'warning',
      message: 'البوابة 2 تقترب من الحد الأقصى. يوصى بتحويل بعض الجماهير.',
      timestamp: new Date(Date.now() - 10 * 60000),
      actionRequired: true,
    },
    {
      id: '3',
      type: 'info',
      message: 'البوابة 3 تعمل بكفاءة عالية جداً.',
      timestamp: new Date(Date.now() - 15 * 60000),
      actionRequired: false,
    },
  ]);

  const [selectedGate, setSelectedGate] = useState<GateStatus | null>(gates[0]);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGates(prev =>
        prev.map(gate => {
          const newQueue = Math.max(0, Math.min(200, gate.currentQueue + (Math.random() - 0.5) * 10));
          const newFlowRate = Math.max(20, Math.min(55, gate.flowRate + (Math.random() - 0.5) * 3));
          const newWaitTime = Math.round(newQueue / Math.max(newFlowRate, 1));
          const newEfficiency = Math.round((newFlowRate / 50) * 100);

          let newTrend: 'up' | 'down' | 'stable' = 'stable';
          if (newQueue > gate.currentQueue + 5) newTrend = 'up';
          else if (newQueue < gate.currentQueue - 5) newTrend = 'down';

          let newStatus: 'normal' | 'warning' | 'critical' = 'normal';
          if (newQueue > 80) newStatus = 'critical';
          else if (newQueue > 50) newStatus = 'warning';

          return {
            ...gate,
            currentQueue: newQueue,
            averageWaitTime: newWaitTime,
            flowRate: newFlowRate,
            efficiency: newEfficiency,
            trend: newTrend,
            status: newStatus,
          };
        })
      );

      // Update alerts
      setAlerts(prev => {
        const criticalGates = gates.filter(g => g.status === 'critical');
        const newAlerts: SystemAlert[] = [];

        if (criticalGates.length > 0) {
          newAlerts.push({
            id: 'critical-' + Date.now(),
            type: 'critical',
            message: `${criticalGates.length} بوابة تتجاوز السعة المقررة`,
            timestamp: new Date(),
            actionRequired: true,
          });
        }

        return [...prev.slice(-4), ...newAlerts];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' };
      case 'warning':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' };
      case 'critical':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-600' };
    }
  };

  const totalQueued = gates.reduce((sum, g) => sum + g.currentQueue, 0);
  const averageEfficiency = Math.round(gates.reduce((sum, g) => sum + g.efficiency, 0) / gates.length);
  const criticalGates = gates.filter(g => g.status === 'critical');

  // Generate historical data for selected gate
  const generateHistoricalData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      time: `${12 + i}:00`,
      queue: Math.max(20, Math.min(150, selectedGate!.currentQueue + (Math.random() - 0.5) * 40)),
      waitTime: Math.round((selectedGate!.currentQueue + (Math.random() - 0.5) * 40) / Math.max(selectedGate!.flowRate, 1)),
      flowRate: Math.max(30, Math.min(55, selectedGate!.flowRate + (Math.random() - 0.5) * 10)),
      efficiency: Math.round((Math.max(30, Math.min(55, selectedGate!.flowRate + (Math.random() - 0.5) * 10)) / 50) * 100),
    }));
  };

  const generatePredictedData = () => {
    return Array.from({ length: 6 }, (_, i) => ({
      time: `${18 + i}:00`,
      queue: Math.max(20, Math.min(150, selectedGate!.currentQueue + (Math.random() - 0.5) * 30)),
      waitTime: Math.round((selectedGate!.currentQueue + (Math.random() - 0.5) * 30) / Math.max(selectedGate!.flowRate, 1)),
      flowRate: Math.max(30, Math.min(55, selectedGate!.flowRate + (Math.random() - 0.5) * 8)),
      efficiency: Math.round((Math.max(30, Math.min(55, selectedGate!.flowRate + (Math.random() - 0.5) * 8)) / 50) * 100),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">لوحة تحكم المنظمين</h1>
              <p className="text-slate-600 mt-2">إدارة الطوابير الافتراضية والبوابات</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg">
                <Bell className="w-5 h-5 mr-2" />
                الإشعارات
              </Button>
              <Button variant="outline" size="lg">
                <Settings className="w-5 h-5 mr-2" />
                الإعدادات
              </Button>
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <p className="text-sm text-slate-600 mb-2">إجمالي الطوابير</p>
                <p className="text-3xl font-bold text-blue-700">{Math.round(totalQueued)}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <p className="text-sm text-slate-600 mb-2">متوسط الكفاءة</p>
                <p className="text-3xl font-bold text-green-700">{averageEfficiency}%</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <p className="text-sm text-slate-600 mb-2">البوابات الحرجة</p>
                <p className="text-3xl font-bold text-red-700">{criticalGates.length}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <p className="text-sm text-slate-600 mb-2">معدل التدفق الكلي</p>
                <p className="text-3xl font-bold text-orange-700">
                  {Math.round(gates.reduce((sum, g) => sum + g.flowRate, 0))}
                </p>
                <p className="text-xs text-slate-500">شخص/دقيقة</p>
              </CardContent>
            </Card>
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
              <strong>تنبيهات حرجة:</strong> {criticalGates.length} بوابة تحتاج إلى تدخل فوري. يرجى مراجعة التفاصيل أدناه.
            </AlertDescription>
          </Alert>
        )}

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card className="mb-8 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                التنبيهات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 3).map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-2 flex justify-between items-start ${
                      alert.type === 'critical'
                        ? 'bg-red-50 border-red-200'
                        : alert.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        alert.type === 'critical'
                          ? 'text-red-900'
                          : alert.type === 'warning'
                            ? 'text-yellow-900'
                            : 'text-blue-900'
                      }`}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {alert.timestamp.toLocaleTimeString('ar-SA')}
                      </p>
                    </div>
                    {alert.actionRequired && (
                      <Button size="sm" className="mr-4">
                        اتخاذ إجراء
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gates Overview */}
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              نظرة عامة على البوابات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gates.map(gate => {
                const colors = getStatusColor(gate.status);
                return (
                  <div
                    key={gate.id}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${colors.bg} ${colors.border} ${
                      selectedGate?.id === gate.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedGate(gate)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-900">{gate.name}</h3>
                      <div className={`w-3 h-3 rounded-full ${colors.icon}`} />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">الطابور الحالي</p>
                        <p className="text-2xl font-bold text-slate-900">{Math.round(gate.currentQueue)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-600 mb-1">متوسط الانتظار</p>
                        <p className="text-lg font-semibold text-slate-900">{gate.averageWaitTime} دقائق</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-600 mb-1">معدل التدفق</p>
                        <p className="text-lg font-semibold text-slate-900">{Math.round(gate.flowRate)} شخص/د</p>
                      </div>

                      <div className="pt-3 border-t border-slate-300">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs font-semibold text-slate-600">الكفاءة</p>
                          <p className={`text-sm font-bold ${colors.text}`}>{gate.efficiency}%</p>
                        </div>
                        <div className="w-full bg-slate-300 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              gate.status === 'critical'
                                ? 'bg-red-600'
                                : gate.status === 'warning'
                                  ? 'bg-yellow-600'
                                  : 'bg-green-600'
                            }`}
                            style={{ width: `${gate.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analytics */}
        {selectedGate && (
          <Card className="shadow-md mb-8">
            <CardHeader>
              <CardTitle>تحليلات مفصلة - {selectedGate.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <VirtualQueueAnalytics
                gateMetrics={{
                  gateId: selectedGate.id,
                  gateName: selectedGate.name,
                  currentQueue: selectedGate.currentQueue,
                  averageWaitTime: selectedGate.averageWaitTime,
                  flowRate: selectedGate.flowRate,
                  capacity: selectedGate.capacity,
                  efficiency: selectedGate.efficiency,
                  trend: selectedGate.trend,
                  lastUpdated: new Date(),
                  estimatedClearTime: Math.round(selectedGate.currentQueue / Math.max(selectedGate.flowRate, 1)),
                }}
                historicalData={generateHistoricalData()}
                predictedData={generatePredictedData()}
              />
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {showRecommendations && (
          <Card className="shadow-md bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  التوصيات الذكية
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRecommendations(false)}
                >
                  إغلاق
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalGates.length > 0 && (
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 mb-2">🔴 إجراء عاجل مطلوب</p>
                    <p className="text-sm text-slate-700">
                      يوصى بتحويل {Math.round((criticalGates[0].currentQueue - 50) / 2)} شخص من {criticalGates[0].name} إلى البوابات الأخرى.
                    </p>
                  </div>
                )}

                {gates.some(g => g.efficiency < 70) && (
                  <div className="p-4 bg-white rounded-lg border border-yellow-200">
                    <p className="font-semibold text-yellow-900 mb-2">⚠️ تحسين الأداء</p>
                    <p className="text-sm text-slate-700">
                      بعض البوابات تعمل بكفاءة منخفضة. يوصى بفحص معدات الفحص أو زيادة عدد الموظفين.
                    </p>
                  </div>
                )}

                {gates.some(g => g.efficiency >= 90) && (
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <p className="font-semibold text-green-900 mb-2">✓ أداء ممتاز</p>
                    <p className="text-sm text-slate-700">
                      بعض البوابات تعمل بكفاءة عالية جداً. يمكن توجيه المزيد من الجماهير إليها.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
