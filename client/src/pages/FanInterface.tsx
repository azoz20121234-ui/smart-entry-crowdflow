/**
 * Fan Interface - Smart Entry & CrowdFlow
 * 
 * Design Philosophy: Modern Dynamic Design
 * - Large, clear display of ticket and queue information
 * - Real-time queue position updates
 * - Adaptive gate assignment based on crowd flow
 * - Smooth animations for status changes
 * - Advanced QueueTimer with precise time estimation
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle2, Clock, AlertCircle, Smartphone, ArrowRight, Wallet, Gift } from 'lucide-react';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QueueTimer } from '@/components/QueueTimer';
import { FlowAnalytics } from '@/components/FlowAnalytics';
import { FanChatRoom } from '@/components/FanChatRoom';
import { FlashPollCard } from '@/components/FlashPollCard';
import { fetchOperatorState } from '@/lib/operatorApi';
import {
  claimDelayedExitReward,
  claimEarlyArrivalReward,
  fetchLoyaltyWallet,
  spendLoyaltyTokens,
} from '@/lib/loyaltyApi';
import type { LoyaltyWalletResponse } from '@shared/loyalty';

const STEP_INTERVAL_MS = 2000;

interface FanTicket {
  ticketId: string;
  fanName: string;
  section: string;
  assignedGate: number;
  queueNumber: number;
  estimatedWaitTime: number;
  status: 'waiting' | 'approaching' | 'ready' | 'entered';
  peopleAhead: number;
}

export default function FanInterface() {
  const [, setLocation] = useLocation();
  const [ticket, setTicket] = useState<FanTicket>({
    ticketId: 'TKT-2024-156789',
    fanName: 'محمد أحمد',
    section: 'A - الدرجة الأولى',
    assignedGate: 2,
    queueNumber: 145,
    estimatedWaitTime: 6,
    status: 'waiting',
    peopleAhead: 12,
  });

  const [gateInfo, setGateInfo] = useState({
    currentlyServing: 133,
    nextUp: 146,
    averageWaitTime: 5,
    capacity: 2500,
    currentLoad: 2100,
  });

  const [notifications, setNotifications] = useState<string[]>([]);
  const [wallet, setWallet] = useState<LoyaltyWalletResponse | null>(null);
  const [loyaltyAction, setLoyaltyAction] = useState<'checkin' | 'checkout' | 'spend' | null>(null);

  const [flowData, setFlowData] = useState([
    { time: '12:00', flowRate: 35, estimatedWaitTime: 12 },
    { time: '12:05', flowRate: 38, estimatedWaitTime: 11 },
    { time: '12:10', flowRate: 42, estimatedWaitTime: 9 },
    { time: '12:15', flowRate: 45, estimatedWaitTime: 8 },
    { time: '12:20', flowRate: 43, estimatedWaitTime: 8 },
    { time: '12:25', flowRate: 48, estimatedWaitTime: 7 },
    { time: '12:30', flowRate: 50, estimatedWaitTime: 6 },
  ]);

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [dataSource, setDataSource] = useState<'server' | 'local'>('local');
  const fanId = ticket.ticketId;

  useEffect(() => {
    let isActive = true;
    const loadWallet = async () => {
      const walletState = await fetchLoyaltyWallet(fanId);
      if (!isActive) return;
      setWallet(walletState);
    };
    loadWallet();
    return () => {
      isActive = false;
    };
  }, [fanId]);

  const getTicketStatus = (peopleAhead: number): FanTicket['status'] => {
    if (peopleAhead <= 0) return 'entered';
    if (peopleAhead <= 2) return 'ready';
    if (peopleAhead <= 5) return 'approaching';
    return 'waiting';
  };

  useEffect(() => {
    const applyLocalSimulation = () => {
      setTicket(prev => {
        const newPeopleAhead = Math.max(0, prev.peopleAhead - 1);
        const newStatus = getTicketStatus(newPeopleAhead);

        const shouldReassign = Math.random() > 0.95;
        let newGate = prev.assignedGate;
        if (shouldReassign) {
          const gates = [1, 2, 3, 4];
          newGate = gates[Math.floor(Math.random() * gates.length)];
          if (newGate !== prev.assignedGate) {
            setNotifications(prev => [...prev, `تم تحديث البوابة المخصصة إلى البوابة ${newGate}`]);
          }
        }

        return {
          ...prev,
          peopleAhead: newPeopleAhead,
          status: newStatus,
          assignedGate: newGate,
          estimatedWaitTime: Math.max(1, prev.estimatedWaitTime - 0.1),
        };
      });

      setGateInfo(prev => ({
        ...prev,
        currentlyServing: prev.currentlyServing + (Math.random() > 0.5 ? 1 : 0),
        averageWaitTime: Math.max(1, prev.averageWaitTime + (Math.random() - 0.5) * 0.5),
        currentLoad: Math.max(1500, Math.min(2500, prev.currentLoad + (Math.random() - 0.5) * 50)),
      }));

      setFlowData(prev => {
        const newFlowRate = Math.max(30, Math.min(55, prev[prev.length - 1].flowRate + (Math.random() - 0.5) * 4));
        const newWaitTime = Math.max(5, Math.min(15, 350 / newFlowRate));
        const lastTime = prev[prev.length - 1].time;
        const [hours, minutes] = lastTime.split(':').map(Number);
        const newMinutes = (minutes + 5) % 60;
        const newHours = minutes + 5 >= 60 ? hours + 1 : hours;
        const newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;

        return [...prev.slice(1), {
          time: newTime,
          flowRate: newFlowRate,
          estimatedWaitTime: newWaitTime,
        }];
      });
    };

    let isActive = true;

    const syncFromApi = async () => {
      try {
        const operatorState = await fetchOperatorState();
        if (!isActive || operatorState.gates.length === 0) return;
        setDataSource('server');

        const bestGate = [...operatorState.gates].sort((a, b) => a.currentQueue - b.currentQueue)[0];
        setTicket(prev => {
          const peopleAhead = Math.max(0, Math.round(bestGate.currentQueue));
          const assignedGate = bestGate.id;
          if (assignedGate !== prev.assignedGate) {
            setNotifications(items => [...items, `تم تحديث البوابة المخصصة إلى البوابة ${assignedGate}`]);
          }
          return {
            ...prev,
            assignedGate,
            peopleAhead,
            queueNumber: 100 + peopleAhead,
            estimatedWaitTime: Math.max(1, bestGate.averageWaitTime),
            status: getTicketStatus(peopleAhead),
          };
        });

        setGateInfo(prev => ({
          ...prev,
          currentlyServing: Math.max(prev.currentlyServing, 100 + Math.round(bestGate.currentQueue * 0.6)),
          nextUp: 100 + Math.round(bestGate.currentQueue * 0.6) + 1,
          averageWaitTime: bestGate.averageWaitTime,
          capacity: bestGate.capacity,
          currentLoad: Math.min(bestGate.capacity, Math.round(bestGate.currentQueue * 24)),
        }));

        setFlowData(prev => {
          const lastTime = prev[prev.length - 1].time;
          const [hours, minutes] = lastTime.split(':').map(Number);
          const newMinutes = (minutes + 5) % 60;
          const newHours = minutes + 5 >= 60 ? hours + 1 : hours;
          const newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;

          return [
            ...prev.slice(1),
            {
              time: newTime,
              flowRate: Math.max(20, bestGate.flowRate),
              estimatedWaitTime: Math.max(1, bestGate.averageWaitTime),
            },
          ];
        });
      } catch {
        if (!isActive) return;
        setDataSource('local');
        applyLocalSimulation();
      }
    };

    syncFromApi();
    const interval = setInterval(syncFromApi, STEP_INTERVAL_MS);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-blue-50 border-blue-200';
      case 'approaching':
        return 'bg-yellow-50 border-yellow-200';
      case 'ready':
        return 'bg-green-50 border-green-200';
      case 'entered':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'في الانتظار';
      case 'approaching':
        return 'اقترب دورك';
      case 'ready':
        return 'دورك الآن!';
      case 'entered':
        return 'تم الدخول';
      default:
        return 'غير معروف';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-8 h-8 text-blue-600" />;
      case 'approaching':
        return <AlertCircle className="w-8 h-8 text-yellow-600" />;
      case 'ready':
        return <CheckCircle2 className="w-8 h-8 text-green-600" />;
      case 'entered':
        return <CheckCircle2 className="w-8 h-8 text-gray-600" />;
      default:
        return <Clock className="w-8 h-8 text-gray-600" />;
    }
  };

  const refreshWallet = async () => {
    const walletState = await fetchLoyaltyWallet(fanId);
    setWallet(walletState);
  };

  const handleEarlyArrivalReward = async () => {
    setLoyaltyAction('checkin');
    const result = await claimEarlyArrivalReward(fanId, 72);
    setNotifications(prev => [result.message, ...prev].slice(0, 6));
    await refreshWallet();
    setLoyaltyAction(null);
  };

  const handleDelayedExitReward = async () => {
    setLoyaltyAction('checkout');
    const result = await claimDelayedExitReward(fanId, 24);
    setNotifications(prev => [result.message, ...prev].slice(0, 6));
    await refreshWallet();
    setLoyaltyAction(null);
  };

  const handleSpendTokens = async () => {
    setLoyaltyAction('spend');
    const result = await spendLoyaltyTokens(fanId, 20, 'خصم فوري في المتجر داخل الملعب');
    setNotifications(prev => [result.message, ...prev].slice(0, 6));
    await refreshWallet();
    setLoyaltyAction(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Back Button and Notifications */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-900 hover:bg-slate-100"
                onClick={() => setLocation('/')}
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
              <Smartphone className="w-8 h-8 text-blue-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">تذكرتك</h1>
                <p className="text-sm text-slate-600">Smart Entry & CrowdFlow</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  dataSource === 'server'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {dataSource === 'server' ? 'بيانات API' : 'وضع محلي (Fallback)'}
              </span>
              <NotificationCenter fanId={ticket.ticketId} />
              <div className="text-right">
                <p className="text-sm text-slate-600">مرحباً بك</p>
                <p className="text-lg font-semibold text-slate-900">{ticket.fanName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.slice(-2).map((notif, idx) => (
              <Alert key={idx} className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 mr-3">{notif}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* QueueTimer Component - Advanced Time Estimation */}
        <div className="mb-8">
          <QueueTimer
            queuePosition={ticket.queueNumber}
            peopleAhead={ticket.peopleAhead}
            gateFlowRate={Math.round(flowData[flowData.length - 1].flowRate)}
            currentlyServing={gateInfo.currentlyServing}
            nextUp={gateInfo.nextUp}
          />
        </div>

        {/* Ticket Details Card */}
        <Card className={`mb-8 border-2 shadow-lg ${getStatusColor(ticket.status)}`}>
          <CardContent className="pt-8">
            {/* Status Section */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {getStatusIcon(ticket.status)}
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{getStatusText(ticket.status)}</h2>
              <p className="text-slate-600">رقم التذكرة: {ticket.ticketId}</p>
            </div>

            {/* Ticket Details */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-600 mb-1">المقعد</p>
                <p className="text-lg font-semibold text-slate-900">{ticket.section}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-600 mb-1">البوابة المخصصة</p>
                <p className="text-lg font-semibold text-blue-700">البوابة {ticket.assignedGate}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-slate-900">تقدمك في الطابور</p>
                <p className="text-sm text-slate-600">{((1 - ticket.peopleAhead / 50) * 100).toFixed(0)}%</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${(1 - ticket.peopleAhead / 50) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Section */}
        <Card className="shadow-md mb-8">
          <CardHeader>
            <CardTitle>معلومات مهمة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">التذكرة المتغيرة ذاتياً</h4>
                <p className="text-sm text-slate-600 mt-1">
                  قد يتم تحديث البوابة المخصصة لك تلقائياً بناءً على حالة الحشود الفعلية لتقليل وقت الانتظار.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">الطابور الافتراضي الذكي</h4>
                <p className="text-sm text-slate-600 mt-1">
                  نظام متقدم يحسب وقت الانتظار بدقة بناءً على معدل التدفق الفعلي والبيانات التاريخية.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">التحديثات الحية</h4>
                <p className="text-sm text-slate-600 mt-1">
                  يتم تحديث معلومات الطابور والبوابات في الوقت الفعلي. احتفظ بهاتفك معك وراقب التطبيق.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In-Game Loyalty Wallet */}
        <Card className="shadow-md mb-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-700" />
              محفظة الولاء اللحظي (In-Game Tokens)
            </CardTitle>
            <CardDescription>
              اكسب عملات رقمية عند الحضور المبكر والخروج الذكي، ثم استخدمها داخل الملعب.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-xl bg-white/80 p-4 border border-amber-200">
              <p className="text-sm text-slate-600 mb-1">الرصيد الحالي</p>
              <p className="text-4xl font-bold text-amber-700">{wallet?.balance ?? 0}</p>
              <p className="text-xs text-slate-600 mt-1">عملة ولاء رقمية</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 mb-6">
              <Button
                onClick={handleEarlyArrivalReward}
                disabled={loyaltyAction !== null}
                className="bg-blue-700 hover:bg-blue-800 h-11 text-sm"
              >
                <Gift className="w-4 h-4 mr-2" />
                حضور مبكر +40
              </Button>
              <Button
                onClick={handleDelayedExitReward}
                disabled={loyaltyAction !== null}
                className="bg-emerald-700 hover:bg-emerald-800 h-11 text-sm"
              >
                <Gift className="w-4 h-4 mr-2" />
                خروج ذكي +30
              </Button>
              <Button
                onClick={handleSpendTokens}
                disabled={loyaltyAction !== null}
                variant="outline"
                className="h-11 text-sm border-amber-300"
              >
                استخدام 20 في المتجر
              </Button>
            </div>

            <div className="rounded-xl bg-white/70 p-4 border border-amber-200">
              <p className="text-sm font-semibold text-slate-900 mb-3">آخر الحركات</p>
              <div className="space-y-2">
                {(wallet?.entries ?? []).slice(0, 4).map(entry => (
                  <div key={entry.id} className="flex items-start justify-between rounded-lg bg-white p-2 border border-slate-200">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{entry.description}</p>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${entry.tokens >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {entry.tokens >= 0 ? `+${entry.tokens}` : entry.tokens}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(entry.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {(wallet?.entries?.length ?? 0) === 0 && (
                  <p className="text-sm text-slate-500">لا توجد حركات بعد. ابدأ بالمكافآت الآن.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flash Polls */}
        <FlashPollCard fanId={fanId} />

        {/* Fan-to-Fan Live Chat */}
        <FanChatRoom
          fanId={fanId}
          fanName={ticket.fanName}
          room={`gate-${ticket.assignedGate}`}
        />

        {/* Analytics Toggle and Display */}
        <div className="mb-8">
          <Button
            onClick={() => setShowAnalytics(!showAnalytics)}
            variant={showAnalytics ? 'default' : 'outline'}
            className="w-full h-12 text-base"
          >
            {showAnalytics ? 'إخفاء تحليلات التدفق' : 'عرض تحليلات التدفق'}
          </Button>
        </div>

        {/* Flow Analytics */}
        {showAnalytics && (
          <div className="mb-8">
            <FlowAnalytics
              data={flowData}
              currentFlowRate={Math.round(flowData[flowData.length - 1].flowRate)}
              averageFlowRate={Math.round(flowData.reduce((sum, d) => sum + d.flowRate, 0) / flowData.length)}
              peakFlowRate={Math.round(Math.max(...flowData.map(d => d.flowRate)))}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button 
            className="flex-1 bg-blue-700 hover:bg-blue-800 h-12 text-base"
            onClick={() => setLocation('/fan-navigation')}
          >
            التوجيه المكاني
          </Button>
          <Button className="flex-1 bg-green-700 hover:bg-green-800 h-12 text-base">
            تحديث البيانات
          </Button>
          <Button variant="outline" className="flex-1 h-12 text-base">
            الدعم
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>تم إصدار التذكرة في: {new Date().toLocaleString('ar-SA')}</p>
          <p className="mt-2">شكراً لاستخدامك Smart Entry & CrowdFlow</p>
        </div>
      </div>
    </div>
  );
}
