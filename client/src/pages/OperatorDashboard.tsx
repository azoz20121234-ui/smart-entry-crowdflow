/**
 * Operator Dashboard - Smart Entry & CrowdFlow
 * 
 * Advanced control panel for operators to manage virtual queues
 * Real-time analytics, gate management, and intelligent recommendations
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { AlertCircle, TrendingUp, Users, Zap, Clock, Settings, Bell, BarChart3, Activity, ArrowRight, Sparkles, Target, RefreshCcw, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VirtualQueueAnalytics } from '@/components/VirtualQueueAnalytics';
import { NotificationCenter } from '@/components/NotificationCenter';
import { fetchOperatorState } from '@/lib/operatorApi';
import { createDefaultGates, type GateStatus, type SystemAlert as ApiSystemAlert } from '@shared/operator';

interface SystemAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  actionRequired: boolean;
}

const LOCAL_ALERT_HISTORY_LIMIT = 8;
const STEP_INTERVAL_MS = 3000;
const WAIT_TIME_SLA_MINUTES = 8;
const PLAN_TARGET_QUEUE = 45;
const PLAN_SAFE_QUEUE = 55;

interface RebalanceAction {
  fromGateId: number;
  toGateId: number;
  people: number;
  urgency: 'high' | 'medium';
}

interface DecisionLogItem {
  id: string;
  timestamp: Date;
  action: string;
  impact: string;
}

interface ResourceAssignment {
  gateId: number;
  gateName: string;
  currentStaff: number;
  recommendedStaff: number;
  delta: number;
}

type RiskLevel = 'low' | 'medium' | 'high';

function queueStatusFromValue(queue: number): GateStatus['status'] {
  if (queue > 80) return 'critical';
  if (queue > 50) return 'warning';
  return 'normal';
}

function estimateWaitTime(queue: number, flowRate: number): number {
  return Math.max(1, Math.round(queue / Math.max(flowRate, 1)));
}

function computeRebalancePlan(gates: GateStatus[]): RebalanceAction[] {
  const overloaded = gates
    .filter(gate => gate.currentQueue > PLAN_SAFE_QUEUE || gate.status !== 'normal')
    .sort((a, b) => b.currentQueue - a.currentQueue);
  const available = gates
    .filter(gate => gate.currentQueue < PLAN_TARGET_QUEUE)
    .map(gate => ({ ...gate, room: Math.max(0, PLAN_SAFE_QUEUE - gate.currentQueue) }))
    .sort((a, b) => b.room - a.room);

  const plan: RebalanceAction[] = [];

  overloaded.forEach(fromGate => {
    let remaining = Math.max(0, fromGate.currentQueue - PLAN_TARGET_QUEUE);
    for (const target of available) {
      if (remaining <= 0) break;
      if (target.room <= 0) continue;
      const moved = Math.min(remaining, target.room);
      if (moved <= 0) continue;
      plan.push({
        fromGateId: fromGate.id,
        toGateId: target.id,
        people: moved,
        urgency: fromGate.status === 'critical' ? 'high' : 'medium',
      });
      remaining -= moved;
      target.room -= moved;
    }
  });

  return plan.slice(0, 6);
}

function computeGateRiskIndex(gate: GateStatus): number {
  const queueFactor = Math.min(100, (gate.currentQueue / 90) * 55);
  const waitFactor = Math.min(100, (gate.averageWaitTime / 15) * 30);
  const trendFactor = gate.trend === 'up' ? 15 : gate.trend === 'stable' ? 8 : 2;
  return Math.round(Math.min(100, queueFactor + waitFactor + trendFactor));
}

function riskLevelFromIndex(index: number): RiskLevel {
  if (index >= 75) return 'high';
  if (index >= 45) return 'medium';
  return 'low';
}

function createInitialLocalAlerts(): SystemAlert[] {
  return [
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
  ];
}

function mapApiAlerts(alerts: ApiSystemAlert[]): SystemAlert[] {
  return alerts.map(alert => ({
    ...alert,
    timestamp: new Date(alert.timestamp),
  }));
}

function simulateLocalGates(previous: GateStatus[]): GateStatus[] {
  return previous.map(gate => {
    const nextQueue = Math.round(Math.max(0, Math.min(200, gate.currentQueue + (Math.random() - 0.5) * 10)));
    const nextFlowRate = Math.round(Math.max(20, Math.min(55, gate.flowRate + (Math.random() - 0.5) * 3)));
    const averageWaitTime = Math.max(1, Math.round(nextQueue / Math.max(nextFlowRate, 1)));
    const efficiency = Math.round((nextFlowRate / 50) * 100);

    let trend: GateStatus['trend'] = 'stable';
    if (nextQueue > gate.currentQueue + 5) trend = 'up';
    else if (nextQueue < gate.currentQueue - 5) trend = 'down';

    let status: GateStatus['status'] = 'normal';
    if (nextQueue > 80) status = 'critical';
    else if (nextQueue > 50) status = 'warning';

    return {
      ...gate,
      currentQueue: nextQueue,
      averageWaitTime,
      flowRate: nextFlowRate,
      efficiency,
      trend,
      status,
    };
  });
}

function updateLocalAlerts(nextGates: GateStatus[], previousAlerts: SystemAlert[]): SystemAlert[] {
  const criticalGates = nextGates.filter(g => g.status === 'critical');
  if (criticalGates.length === 0) return previousAlerts;

  const criticalAlert: SystemAlert = {
    id: `critical-${Date.now()}`,
    type: 'critical',
    message: `${criticalGates.length} بوابة تتجاوز السعة المقررة`,
    timestamp: new Date(),
    actionRequired: true,
  };

  return [...previousAlerts.slice(-(LOCAL_ALERT_HISTORY_LIMIT - 1)), criticalAlert];
}

function prependAlert(previousAlerts: SystemAlert[], alert: SystemAlert): SystemAlert[] {
  return [alert, ...previousAlerts].slice(0, LOCAL_ALERT_HISTORY_LIMIT);
}

export default function OperatorDashboard() {
  const [, setLocation] = useLocation();
  const [gates, setGates] = useState<GateStatus[]>(() => createDefaultGates());
  const [alerts, setAlerts] = useState<SystemAlert[]>(() => createInitialLocalAlerts());
  const [selectedGate, setSelectedGate] = useState<GateStatus | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [emergencyLaneOpen, setEmergencyLaneOpen] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('يرجى استخدام البوابات 1 و3 لتقليل وقت الانتظار.');
  const [dataSource, setDataSource] = useState<'server' | 'local'>('local');
  const [decisionLog, setDecisionLog] = useState<DecisionLogItem[]>([
    {
      id: 'decision-seed-1',
      timestamp: new Date(Date.now() - 12 * 60_000),
      action: 'توجيه رقمي أولي',
      impact: 'انخفاض متوسط الانتظار 8%',
    },
  ]);
  const gatesRef = useRef<GateStatus[]>(gates);
  const alertsRef = useRef<SystemAlert[]>(alerts);

  useEffect(() => {
    gatesRef.current = gates;
  }, [gates]);

  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  useEffect(() => {
    let isActive = true;

    const updateSnapshot = async () => {
      if (demoMode) {
        setDataSource('local');
        const nextGates = simulateLocalGates(gatesRef.current);
        const nextAlerts = updateLocalAlerts(nextGates, alertsRef.current);
        setGates(nextGates);
        setAlerts(nextAlerts);
        return;
      }
      try {
        const state = await fetchOperatorState();
        if (!isActive) return;
        setDataSource('server');
        setGates(state.gates);
        setAlerts(mapApiAlerts(state.alerts));
      } catch {
        if (!isActive) return;
        setDataSource('local');
        const nextGates = simulateLocalGates(gatesRef.current);
        const nextAlerts = updateLocalAlerts(nextGates, alertsRef.current);
        setGates(nextGates);
        setAlerts(nextAlerts);
      }
    };

    updateSnapshot();
    const interval = setInterval(updateSnapshot, STEP_INTERVAL_MS);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [demoMode]);

  useEffect(() => {
    if (!selectedGate && gates.length > 0) {
      setSelectedGate(gates[0]);
      return;
    }
    if (!selectedGate) return;
    const updatedGate = gates.find(g => g.id === selectedGate.id);
    if (updatedGate && updatedGate !== selectedGate) {
      setSelectedGate(updatedGate);
    }
  }, [gates, selectedGate]);

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
  const slaCompliantGates = gates.filter(g => g.averageWaitTime <= WAIT_TIME_SLA_MINUTES).length;
  const slaComplianceRate = Math.round((slaCompliantGates / Math.max(1, gates.length)) * 100);
  const pressureIndex = Math.round(Math.min(100, totalQueued / Math.max(1, gates.length)));
  const forecastedCriticalIn15 = gates.filter(g => {
    const trendImpact = g.trend === 'up' ? 14 : g.trend === 'down' ? -10 : 4;
    const forecastQueue = Math.max(0, Math.min(220, Math.round(g.currentQueue + trendImpact)));
    return queueStatusFromValue(forecastQueue) === 'critical';
  }).length;
  const rebalancePlan = computeRebalancePlan(gates);
  const rebalancePeopleCount = rebalancePlan.reduce((sum, action) => sum + action.people, 0);
  const gateRiskRows = gates.map(gate => {
    const riskIndex = computeGateRiskIndex(gate);
    const riskLevel = riskLevelFromIndex(riskIndex);
    return { gateId: gate.id, gateName: gate.name, riskIndex, riskLevel };
  });
  const overallRiskIndex = Math.round(
    gateRiskRows.reduce((sum, row) => sum + row.riskIndex, 0) / Math.max(1, gateRiskRows.length),
  );
  const overallRiskLevel = riskLevelFromIndex(overallRiskIndex);
  const whatIfReduction = Math.min(45, Math.max(6, Math.round(rebalancePeopleCount / Math.max(1, totalQueued) * 100)));
  const whatIfWaitReduction = Math.max(1, Math.round((whatIfReduction / 100) * WAIT_TIME_SLA_MINUTES));
  const collapseWarning =
    overallRiskLevel === 'high' || forecastedCriticalIn15 >= 2 || pressureIndex >= 80;
  const resourceAssignments: ResourceAssignment[] = gates.map(gate => {
    const riskIndex = computeGateRiskIndex(gate);
    const currentStaff = 4 + (gate.id % 2);
    const recommendedStaff =
      riskIndex >= 75 ? currentStaff + 2 : riskIndex >= 45 ? currentStaff + 1 : Math.max(3, currentStaff - 1);
    return {
      gateId: gate.id,
      gateName: gate.name,
      currentStaff,
      recommendedStaff,
      delta: recommendedStaff - currentStaff,
    };
  });
  const totalStaffDelta = resourceAssignments.reduce((sum, row) => sum + row.delta, 0);
  const historicalLearning = [
    'في حدث مشابه، رفع الطاقم عند البوابات الحمراء بدقيقة مبكرة خفّض الذروة خلال 12 دقيقة.',
    'إعادة توجيه 15% من التدفق للبوابات الأقل ضغطًا منعت انتقال الاختناق للممرات الداخلية.',
    'الرسائل الموحدة (تطبيق + شاشات) رفعت التزام الجمهور بالمسارات البديلة بشكل واضح.',
  ];

  const appendDecision = (action: string, impact: string) => {
    setDecisionLog(prev => [
      {
        id: `decision-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date(),
        action,
        impact,
      },
      ...prev,
    ].slice(0, 20));
  };

  const handleApplyRebalancePlan = () => {
    if (rebalancePlan.length === 0) {
      const stableAlert: SystemAlert = {
        id: `rebalance-stable-${Date.now()}`,
        type: 'info',
        message: 'لا توجد حاجة لإعادة التوازن حالياً. جميع البوابات ضمن الحدود الآمنة.',
        timestamp: new Date(),
        actionRequired: false,
      };
      setAlerts(prev => prependAlert(prev, stableAlert));
      appendDecision('مراجعة خطة إعادة التوازن', 'لا حاجة لنقل الحشود حالياً.');
      return;
    }

    setDataSource('local');
    setGates(previous => {
      const nextMap = new Map<number, GateStatus>(
        previous.map(gate => [gate.id, { ...gate }]),
      );

      rebalancePlan.forEach(action => {
        const from = nextMap.get(action.fromGateId);
        const to = nextMap.get(action.toGateId);
        if (!from || !to) return;
        from.currentQueue = Math.max(0, from.currentQueue - action.people);
        to.currentQueue = Math.min(220, to.currentQueue + action.people);
      });

      return previous.map(gate => {
        const next = nextMap.get(gate.id)!;
        const status = queueStatusFromValue(next.currentQueue);
        const trend: GateStatus['trend'] =
          next.currentQueue > gate.currentQueue + 4
            ? 'up'
            : next.currentQueue < gate.currentQueue - 4
              ? 'down'
              : 'stable';
        return {
          ...next,
          averageWaitTime: estimateWaitTime(next.currentQueue, next.flowRate),
          efficiency: Math.round((next.flowRate / 50) * 100),
          status,
          trend,
        };
      });
    });

    const rebalanceAlert: SystemAlert = {
      id: `rebalance-${Date.now()}`,
      type: 'warning',
      message: `تم تطبيق خطة إعادة التوازن ونقل ${rebalancePeopleCount} مشجع بين البوابات.`,
      timestamp: new Date(),
      actionRequired: false,
    };
    setAlerts(prev => prependAlert(prev, rebalanceAlert));
    appendDecision(
      'تطبيق إعادة توازن',
      `توقع خفض الضغط ${whatIfReduction}% وتقليل الانتظار ${whatIfWaitReduction} دقائق.`,
    );
  };

  const handleSimulateRush = () => {
    setDataSource('local');
    setGates(previous =>
      previous.map(gate => {
        const nextQueue = Math.min(220, gate.currentQueue + 18);
        const nextFlow = Math.max(20, gate.flowRate - 3);
        return {
          ...gate,
          currentQueue: nextQueue,
          flowRate: nextFlow,
          averageWaitTime: estimateWaitTime(nextQueue, nextFlow),
          efficiency: Math.round((nextFlow / 50) * 100),
          status: queueStatusFromValue(nextQueue),
          trend: 'up',
        };
      }),
    );
    const rushAlert: SystemAlert = {
      id: `rush-${Date.now()}`,
      type: 'critical',
      message: 'تم رصد موجة وصول مفاجئة. يوصى بتفعيل إعادة التوازن فوراً.',
      timestamp: new Date(),
      actionRequired: true,
    };
    setAlerts(prev => prependAlert(prev, rushAlert));
    appendDecision('محاكاة ذروة مفاجئة', 'تم رفع مستوى الخطر وبدء الاستعداد التشغيلي.');
  };

  const handleToggleEmergencyLane = () => {
    setEmergencyLaneOpen(prev => {
      const next = !prev;
      const emergencyAlert: SystemAlert = {
        id: `emergency-lane-${Date.now()}`,
        type: next ? 'warning' : 'info',
        message: next
          ? 'تم فتح مسار الطوارئ في الممر الرئيسي لتخفيف الاختناق.'
          : 'تم إغلاق مسار الطوارئ والعودة للتشغيل المعتاد.',
        timestamp: new Date(),
        actionRequired: false,
      };
      setAlerts(items => prependAlert(items, emergencyAlert));
      appendDecision(
        next ? 'فتح مسار الطوارئ' : 'إغلاق مسار الطوارئ',
        next ? 'تحويل تدفق عاجل إلى الممر الرئيسي.' : 'عودة التشغيل إلى الوضع القياسي.',
      );
      return next;
    });
  };

  const handleToggleEmergencyMode = () => {
    setEmergencyMode(prev => {
      const next = !prev;
      const emergencyAlert: SystemAlert = {
        id: `emergency-mode-${Date.now()}`,
        type: next ? 'critical' : 'info',
        message: next
          ? 'تم تفعيل وضع الطوارئ: أولوية السلامة وتوحيد الرسائل على التطبيق والشاشات.'
          : 'تم إيقاف وضع الطوارئ والعودة للوضع التشغيلي الطبيعي.',
        timestamp: new Date(),
        actionRequired: next,
      };
      setAlerts(items => prependAlert(items, emergencyAlert));
      appendDecision(
        next ? 'تفعيل وضع الطوارئ' : 'إيقاف وضع الطوارئ',
        next ? 'إرسال توجيه موحّد عالي الأولوية.' : 'استئناف إدارة التدفق الاعتيادية.',
      );
      return next;
    });
  };

  const handleBroadcastGuidance = () => {
    const message = broadcastMessage.trim();
    if (!message) return;
    const messageAlert: SystemAlert = {
      id: `broadcast-${Date.now()}`,
      type: 'info',
      message: `تم بث رسالة موحدة للتطبيق والشاشات: "${message}"`,
      timestamp: new Date(),
      actionRequired: false,
    };
    setAlerts(prev => prependAlert(prev, messageAlert));
    appendDecision('بث توجيه موحد', 'الرسالة وصلت للمشجعين عبر التطبيق والشاشات الرقمية.');
  };

  const handleApplyResourceRedistribution = () => {
    const redistributionAlert: SystemAlert = {
      id: `resource-${Date.now()}`,
      type: totalStaffDelta > 0 ? 'warning' : 'info',
      message:
        totalStaffDelta > 0
          ? `تم رفع الموارد التشغيلية على البوابات الحرجة (+${totalStaffDelta} أفراد).`
          : 'تمت إعادة توزيع الموارد داخليًا بدون زيادة إجمالي الطاقم.',
      timestamp: new Date(),
      actionRequired: false,
    };
    setAlerts(prev => prependAlert(prev, redistributionAlert));
    appendDecision(
      'إعادة توزيع الموارد',
      totalStaffDelta > 0
        ? `تعزيز الطاقم على نقاط الخطر (+${totalStaffDelta}).`
        : 'إعادة تموضع الطاقم وفق مؤشر المخاطر.',
    );
  };

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
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-900 hover:bg-slate-100"
                onClick={() => setLocation('/')}
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">لوحة تحكم المنظمين</h1>
                <p className="text-slate-600 mt-2">إدارة الطوابير الافتراضية والبوابات</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Button
                variant={demoMode ? 'default' : 'outline'}
                size="sm"
                className={demoMode ? 'bg-slate-900 hover:bg-slate-800' : ''}
                onClick={() => setDemoMode(value => !value)}
              >
                {demoMode ? 'Demo Mode On' : 'Demo Mode'}
              </Button>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  dataSource === 'server'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {dataSource === 'server' ? 'بيانات API' : 'وضع محلي (Fallback)'}
              </span>
              <NotificationCenter fanId="operator-001" />
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
        {collapseWarning && (
          <Alert className="mb-8 border-2 border-rose-200 bg-rose-50">
            <AlertCircle className="h-5 w-5 text-rose-700" />
            <AlertDescription className="mr-3 text-rose-900">
              <strong>تنبيه قبل الانهيار:</strong> المؤشرات الحالية تشير لاحتمال تصاعد اختناق خلال الدقائق القادمة.
              يوصى بتفعيل إعادة التوازن وإعادة توزيع الموارد فورًا.
            </AlertDescription>
          </Alert>
        )}

        {/* Competitive Control Center */}
        <Card className="mb-8 shadow-md border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              مركز القيادة التنبؤي (ميزة تنافسية)
            </CardTitle>
            <CardDescription>
              قرارات تشغيل ذكية قبل حدوث الاختناق، مع قياس التزام الخدمة وجودة التوزيع.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
              <div className="rounded-lg border border-indigo-200 bg-white p-4">
                <p className="text-xs text-slate-600">مؤشر ضغط الممرات</p>
                <p className="text-3xl font-bold text-indigo-700">{pressureIndex}</p>
                <p className="text-xs text-slate-500">من 100</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-white p-4">
                <p className="text-xs text-slate-600">الالتزام بـ SLA</p>
                <p className="text-3xl font-bold text-emerald-700">{slaComplianceRate}%</p>
                <p className="text-xs text-slate-500">انتظار ≤ {WAIT_TIME_SLA_MINUTES} دقائق</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-white p-4">
                <p className="text-xs text-slate-600">خطر 15 دقيقة</p>
                <p className="text-3xl font-bold text-amber-700">{forecastedCriticalIn15}</p>
                <p className="text-xs text-slate-500">بوابة مرشحة للوضع الحرج</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-white p-4">
                <p className="text-xs text-slate-600">خطة إعادة التوزيع</p>
                <p className="text-3xl font-bold text-blue-700">{rebalancePeopleCount}</p>
                <p className="text-xs text-slate-500">مشجع قابل لإعادة التوجيه</p>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-purple-200 bg-white p-4">
              <p className="text-xs text-slate-600">محاكاة سريعة (What-If)</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                في حال تطبيق إعادة التوازن الآن: انخفاض ضغط متوقع {whatIfReduction}% وتقليل الانتظار حوالي {whatIfWaitReduction} دقائق.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-indigo-700 hover:bg-indigo-800"
                onClick={handleApplyRebalancePlan}
              >
                <Target className="w-4 h-4 mr-2" />
                تطبيق خطة إعادة التوازن
              </Button>
              <Button variant="outline" onClick={handleSimulateRush}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                محاكاة ذروة مفاجئة
              </Button>
              <Button
                variant={emergencyLaneOpen ? 'default' : 'outline'}
                className={emergencyLaneOpen ? 'bg-red-700 hover:bg-red-800' : ''}
                onClick={handleToggleEmergencyLane}
              >
                <Shield className="w-4 h-4 mr-2" />
                {emergencyLaneOpen ? 'مسار الطوارئ مفعل' : 'فتح مسار طوارئ'}
              </Button>
              <Button
                variant={emergencyMode ? 'default' : 'outline'}
                className={emergencyMode ? 'bg-rose-700 hover:bg-rose-800' : ''}
                onClick={handleToggleEmergencyMode}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {emergencyMode ? 'إيقاف وضع الطوارئ' : 'تفعيل وضع الطوارئ'}
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-2 rounded-lg border border-cyan-200 bg-white p-4 md:flex-row">
              <Input
                value={broadcastMessage}
                onChange={event => setBroadcastMessage(event.target.value)}
                placeholder="اكتب رسالة التوجيه الموحد للجمهور"
              />
              <Button className="bg-cyan-700 hover:bg-cyan-800" onClick={handleBroadcastGuidance}>
                إرسال للتطبيق + الشاشات
              </Button>
              <Button variant="outline" onClick={handleApplyResourceRedistribution}>
                إعادة توزيع الموارد
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rebalance Mission List */}
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle>قائمة المهام التشغيلية المقترحة</CardTitle>
            <CardDescription>
              أوامر توزيع لحظية لتقليل الازدحام قبل وصوله للحالة الحرجة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rebalancePlan.length === 0 ? (
              <p className="text-sm text-slate-600">لا توجد تحويلات لازمة حالياً. توزيع الحشود متوازن.</p>
            ) : (
              <div className="space-y-3">
                {rebalancePlan.map((item, index) => {
                  const fromGate = gates.find(g => g.id === item.fromGateId);
                  const toGate = gates.find(g => g.id === item.toGateId);
                  return (
                    <div
                      key={`${item.fromGateId}-${item.toGateId}-${index}`}
                      className={`rounded-lg border p-3 ${
                        item.urgency === 'high'
                          ? 'border-red-200 bg-red-50'
                          : 'border-amber-200 bg-amber-50'
                      }`}
                    >
                      <p className="font-semibold text-slate-900">
                        تحويل {item.people} مشجع من {fromGate?.name ?? `البوابة ${item.fromGateId}`} إلى {toGate?.name ?? `البوابة ${item.toGateId}`}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        الأولوية: {item.urgency === 'high' ? 'عاجلة' : 'متوسطة'} - التنفيذ الآن يقلل ضغط الممرات مباشرة.
                      </p>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        لماذا هذا القرار؟ لأن {fromGate?.name ?? `البوابة ${item.fromGateId}`} تتجاوز السعة الآمنة مقارنة بالبوابات البديلة.
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-md border border-emerald-200">
          <CardHeader>
            <CardTitle>إعادة توزيع الموارد</CardTitle>
            <CardDescription>
              ضبط الطاقم حسب مؤشر الخطر لكل بوابة قبل وصولها للحالة الحرجة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {resourceAssignments.map(item => (
                <div key={item.gateId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{item.gateName}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    الطاقم الحالي: {item.currentStaff} - المقترح: {item.recommendedStaff}
                  </p>
                  <p
                    className={`text-xs font-semibold mt-1 ${
                      item.delta > 0 ? 'text-amber-700' : item.delta < 0 ? 'text-blue-700' : 'text-emerald-700'
                    }`}
                  >
                    {item.delta > 0
                      ? `+${item.delta} تعزيز مطلوب`
                      : item.delta < 0
                        ? `${Math.abs(item.delta)} إعادة تموضع`
                        : 'لا تغيير'}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    لماذا؟ التوزيع يعتمد على مؤشر الخطر الحالي لكل بوابة.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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

        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle>مؤشر الخطر اللحظي (Risk Index)</CardTitle>
            <CardDescription>
              القراءة الموحدة للمخاطر حسب الكثافة، الانتظار، وسرعة تغير الحركة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">
                مستوى الخطر العام:
                <span
                  className={`mr-2 rounded-full px-2 py-0.5 text-xs ${
                    overallRiskLevel === 'high'
                      ? 'bg-red-100 text-red-700'
                      : overallRiskLevel === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {overallRiskLevel === 'high' ? 'مرتفع' : overallRiskLevel === 'medium' ? 'متوسط' : 'منخفض'} - {overallRiskIndex}/100
                </span>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {gateRiskRows.map(row => (
                <div key={row.gateId} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{row.gateName}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{row.riskIndex}</p>
                  <p
                    className={`text-xs font-semibold ${
                      row.riskLevel === 'high'
                        ? 'text-red-700'
                        : row.riskLevel === 'medium'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                    }`}
                  >
                    {row.riskLevel === 'high' ? '🔴 خطر مرتفع' : row.riskLevel === 'medium' ? '🟡 خطر متوسط' : '🟢 خطر منخفض'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                const riskIndex = computeGateRiskIndex(gate);
                const riskLevel = riskLevelFromIndex(riskIndex);
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
                    <p
                      className={`mb-3 inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                        riskLevel === 'high'
                          ? 'bg-red-100 text-red-700'
                          : riskLevel === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      Risk Index {riskIndex}
                    </p>

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

        <Card className="mt-8 shadow-md border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle>التعلّم من الأحداث السابقة</CardTitle>
            <CardDescription>
              توصيات مبنية على ما نجح فعليًا في فعاليات سابقة مشابهة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {historicalLearning.map((item, index) => (
                <div key={index} className="rounded-lg border border-amber-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 shadow-md">
          <CardHeader>
            <CardTitle>سجل القرارات التشغيلية</CardTitle>
            <CardDescription>
              ماذا نُفّذ، متى نُفّذ، وما الأثر المتوقع. يستخدم للمراجعة والتعلّم بعد الحدث.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {decisionLog.map(item => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{item.action}</p>
                    <p className="text-xs text-slate-500">
                      {item.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">{item.impact}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
