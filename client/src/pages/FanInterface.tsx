/**
 * Fan Interface - Smart Entry & CrowdFlow
 * 
 * Design Philosophy: Modern Dynamic Design
 * - Large, clear display of ticket and queue information
 * - Real-time queue position updates
 * - Adaptive gate assignment based on crowd flow
 * - Smooth animations for status changes
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-blue-700" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">تذكرتك</h1>
                <p className="text-sm text-slate-600">Smart Entry & CrowdFlow</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">مرحباً بك</p>
              <p className="text-lg font-semibold text-slate-900">{ticket.fanName}</p>
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

        {/* Main Ticket Card */}
        <Card className={`mb-8 border-2 shadow-lg transition-all ${getStatusColor(ticket.status)}`}>
          <CardContent className="pt-8">
            {/* Status Section */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {getStatusIcon(ticket.status)}
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{getStatusText(ticket.status)}</h2>
              <p className="text-slate-600">رقم التذكرة: {ticket.ticketId}</p>
            </div>

            {/* Queue Position - Large Display */}
            <div className="bg-white rounded-lg p-8 mb-8 border-2 border-slate-200">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">رقم دورك</p>
                  <p className="text-6xl font-bold text-blue-700">{ticket.queueNumber}</p>
                </div>
                <div className="text-center border-l-2 border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">عدد الأشخاص أمامك</p>
                  <p className="text-6xl font-bold text-orange-600">{ticket.peopleAhead}</p>
                </div>
              </div>
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
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-600 mb-1">وقت الانتظار المتوقع</p>
                <p className="text-lg font-semibold text-slate-900">{ticket.estimatedWaitTime.toFixed(0)} دقائق</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-600 mb-1">حالة النظام</p>
                <p className="text-lg font-semibold text-green-600">متاح</p>
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

            {/* Gate Info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                معلومات البوابة {ticket.assignedGate}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">يتم خدمة</p>
                  <p className="text-2xl font-bold text-blue-700">{gateInfo.currentlyServing}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">الدور التالي</p>
                  <p className="text-2xl font-bold text-green-700">{gateInfo.nextUp}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">متوسط الانتظار</p>
                  <p className="text-2xl font-bold text-orange-600">{gateInfo.averageWaitTime.toFixed(0)} دقائق</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Section */}
        <Card className="shadow-md">
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
                <h4 className="font-semibold text-slate-900">الطابور الافتراضي</h4>
                <p className="text-sm text-slate-600 mt-1">
                  لا تحتاج للوقوف في طابور مزدحم. ابق في مكانك وتابع دورك عبر هذا التطبيق. سيتم إخبارك عندما يقترب دورك.
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

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button className="flex-1 bg-blue-700 hover:bg-blue-800 h-12 text-base">
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
