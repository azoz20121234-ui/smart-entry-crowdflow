import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Compass,
  Gift,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

const STEP_INTERVAL_MS = 3000;

interface FanTicket {
  ticketId: string;
  fanName: string;
  section: string;
  assignedGate: number;
  status: 'waiting' | 'approaching' | 'ready' | 'entered';
  peopleAhead: number;
}

type FanMood = 'excellent' | 'busy' | 'attention';

function getTicketStatus(peopleAhead: number): FanTicket['status'] {
  if (peopleAhead <= 0) return 'entered';
  if (peopleAhead <= 4) return 'ready';
  if (peopleAhead <= 12) return 'approaching';
  return 'waiting';
}

function getFanMood(status: FanTicket['status']): FanMood {
  if (status === 'ready' || status === 'approaching') return 'attention';
  if (status === 'waiting') return 'busy';
  return 'excellent';
}

export default function FanInterface() {
  const [, setLocation] = useLocation();
  const [ticket, setTicket] = useState<FanTicket>({
    ticketId: 'TKT-2024-156789',
    fanName: 'محمد أحمد',
    section: 'A - الدرجة الأولى',
    assignedGate: 2,
    status: 'waiting',
    peopleAhead: 12,
  });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [wallet, setWallet] = useState<LoyaltyWalletResponse | null>(null);
  const [loyaltyAction, setLoyaltyAction] = useState<'checkin' | 'checkout' | 'spend' | null>(null);
  const [showExtras, setShowExtras] = useState(false);
  const [dataSource, setDataSource] = useState<'server' | 'local'>('local');

  const fanId = ticket.ticketId;
  const mood = useMemo(() => getFanMood(ticket.status), [ticket.status]);

  const moodView = {
    excellent: {
      title: 'ممتاز',
      text: 'حركتك سلسة الآن. اتجه بهدوء للمسار الأخضر.',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      icon: <CheckCircle2 className="h-8 w-8 text-emerald-600" />,
      direction: 'اتجه الآن إلى المسار الأخضر المؤدي للبوابة.',
    },
    busy: {
      title: 'ازدحام',
      text: 'انتظر في مقعدك الآن. سنرسل لك تنبيه عند أفضل وقت للحركة.',
      className: 'border-amber-200 bg-amber-50 text-amber-800',
      icon: <AlertCircle className="h-8 w-8 text-amber-600" />,
      direction: 'انتظر الآن وتجنب التحرك للممر الأحمر.',
    },
    attention: {
      title: 'انتبه',
      text: 'دورك يقترب. تحرك الآن نحو البوابة المخصصة لك.',
      className: 'border-blue-200 bg-blue-50 text-blue-800',
      icon: <Bell className="h-8 w-8 text-blue-600" />,
      direction: `اتجه الآن إلى البوابة ${ticket.assignedGate} عبر الممر الأزرق.`,
    },
  } as const;

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

  useEffect(() => {
    let isActive = true;

    const syncFromApi = async () => {
      try {
        const operatorState = await fetchOperatorState();
        if (!isActive || operatorState.gates.length === 0) return;

        const bestGate = [...operatorState.gates].sort((a, b) => a.currentQueue - b.currentQueue)[0];
        setDataSource('server');
        setTicket(previous => {
          const peopleAhead = Math.max(0, Math.round(bestGate.currentQueue));
          const assignedGate = bestGate.id;
          if (assignedGate !== previous.assignedGate) {
            setNotifications(items => [
              `تم تحديث التوجيه: استخدم البوابة ${assignedGate}`,
              ...items,
            ].slice(0, 4));
          }
          return {
            ...previous,
            assignedGate,
            status: getTicketStatus(peopleAhead),
            peopleAhead,
          };
        });
      } catch {
        if (!isActive) return;
        setDataSource('local');
        setTicket(previous => {
          const peopleAhead = Math.max(0, previous.peopleAhead - 1);
          return {
            ...previous,
            peopleAhead,
            status: getTicketStatus(peopleAhead),
          };
        });
      }
    };

    syncFromApi();
    const interval = setInterval(syncFromApi, STEP_INTERVAL_MS);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  const refreshWallet = async () => {
    const walletState = await fetchLoyaltyWallet(fanId);
    setWallet(walletState);
  };

  const handleEarlyArrivalReward = async () => {
    setLoyaltyAction('checkin');
    const result = await claimEarlyArrivalReward(fanId, 72);
    setNotifications(items => [result.message, ...items].slice(0, 4));
    await refreshWallet();
    setLoyaltyAction(null);
  };

  const handleDelayedExitReward = async () => {
    setLoyaltyAction('checkout');
    const result = await claimDelayedExitReward(fanId, 24);
    setNotifications(items => [result.message, ...items].slice(0, 4));
    await refreshWallet();
    setLoyaltyAction(null);
  };

  const handleSpendTokens = async () => {
    setLoyaltyAction('spend');
    const result = await spendLoyaltyTokens(fanId, 20, 'خصم داخل الملعب');
    setNotifications(items => [result.message, ...items].slice(0, 4));
    await refreshWallet();
    setLoyaltyAction(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Smartphone className="h-7 w-7 text-blue-700" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">واجهة المشجع</h1>
                <p className="text-xs text-slate-600">{ticket.fanName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                  dataSource === 'server' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {dataSource === 'server' ? 'مباشر' : 'محلي'}
              </span>
              <NotificationCenter fanId={ticket.ticketId} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Card className={`mb-6 border-2 ${moodView[mood].className}`}>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-3">
              {moodView[mood].icon}
              <div>
                <p className="text-sm font-semibold">الحالة الحالية</p>
                <h2 className="text-2xl font-extrabold">{moodView[mood].title}</h2>
              </div>
            </div>
            <p className="text-sm font-semibold">{moodView[mood].text}</p>
          </CardContent>
        </Card>

        {notifications.length > 0 && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-700" />
            <AlertDescription className="mr-2 text-blue-800">
              {notifications[0]}
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-700" />
              التوجيه المكاني الآن
            </CardTitle>
            <CardDescription>توجيه واحد واضح حسب الحالة الحالية.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-sm font-bold text-indigo-900">{moodView[mood].direction}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                ممر أخضر: حركة مريحة
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-800">
                ممر أزرق: اتجاه للبوابة
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                ممر أحمر: تجنب مؤقت
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={() => setNotifications([])}>
                تأكيد واستمرار
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
                تحديث الحالة
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button
          variant={showExtras ? 'default' : 'outline'}
          className="mb-4 w-full"
          onClick={() => setShowExtras(value => !value)}
        >
          {showExtras ? 'إخفاء الميزات الإضافية' : 'عرض الميزات الإضافية'}
        </Button>

        {showExtras && (
          <>
            <Card className="mb-6 border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-amber-700" />
                  محفظة الولاء
                </CardTitle>
                <CardDescription>حوافز الحضور المبكر والخروج الذكي.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-3xl font-extrabold text-amber-700">{wallet?.balance ?? 0}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button disabled={loyaltyAction !== null} onClick={handleEarlyArrivalReward} className="bg-blue-700 hover:bg-blue-800">
                    <Gift className="ml-2 h-4 w-4" />
                    حضور مبكر
                  </Button>
                  <Button disabled={loyaltyAction !== null} onClick={handleDelayedExitReward} className="bg-emerald-700 hover:bg-emerald-800">
                    <Gift className="ml-2 h-4 w-4" />
                    خروج ذكي
                  </Button>
                  <Button disabled={loyaltyAction !== null} onClick={handleSpendTokens} variant="outline">
                    استخدام 20
                  </Button>
                </div>
              </CardContent>
            </Card>

            <FlashPollCard fanId={fanId} />
            <FanChatRoom fanId={fanId} fanName={ticket.fanName} room={`gate-${ticket.assignedGate}`} />
          </>
        )}
      </div>
    </div>
  );
}
