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
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Smartphone, ArrowRight } from 'lucide-react';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QueueTimer } from '@/components/QueueTimer';
import { FlowAnalytics } from '@/components/FlowAnalytics';

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

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTicket(prev => {
        // Update queue position
        const newPeopleAhead = Math.max(0, prev.peopleAhead - 1);
        let newStatus = prev.status;

        if (newPeopleAhead <= 2) {
          newStatus = 'ready';
        } else if (newPeopleAhead <= 5) {
          newStatus = 'approaching';
        }

        // Randomly reassign gate based on crowd flow (adaptive routing)
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

      // Update gate info
      setGateInfo(prev => ({
        ...prev,
        currentlyServing: prev.currentlyServing + (Math.random() > 0.5 ? 1 : 0),
        averageWaitTime: Math.max(1, prev.averageWaitTime + (Math.random() - 0.5) * 0.5),
        currentLoad: Math.max(1500, Math.min(2500, prev.currentLoad + (Math.random() - 0.5) * 50)),
      }));

      // Update flow data
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
    }, 2000);

    return () => clearInterval(interval);
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
