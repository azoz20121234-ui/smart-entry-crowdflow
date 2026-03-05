import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Accessibility,
  AlertCircle,
  ArrowRight,
  Award,
  Baby,
  BadgeCheck,
  Bell,
  Camera,
  CheckCircle2,
  Compass,
  CreditCard,
  DoorOpen,
  Fingerprint,
  Gift,
  GraduationCap,
  LockKeyhole,
  MapPinned,
  MapPin,
  ShieldCheck,
  Smartphone,
  Timer,
  Ticket,
  UtensilsCrossed,
  Users,
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
const QR_ROTATION_MS = 20000;
const DEFAULT_TICKET_ID = 'TKT-2024-156789';

interface FanTicket {
  ticketId: string;
  fanName: string;
  section: string;
  assignedGate: number;
  status: 'waiting' | 'approaching' | 'ready' | 'entered';
  peopleAhead: number;
}

type FanMood = 'excellent' | 'busy' | 'attention';
type FanProfile = 'family' | 'fast' | 'senior';
type TicketLifecycle = 'pre_gate' | 'at_gate_verification' | 'entered_locked';
type ArTarget = 'seat' | 'restroom' | 'food';
type TicketPersona = 'standard' | 'vip' | 'family';
type SeatOrderItem = 'drink' | 'snack' | 'meal';
interface TicketActivationState {
  deviceVerified: boolean;
  behaviorVerified: boolean;
  biometricRequired: boolean;
  biometricVerified: boolean;
  activated: boolean;
  activatedAt: string | null;
  lifecycle: TicketLifecycle;
  deviceId: string;
  boundDeviceId: string | null;
  dynamicQrToken: string;
  qrExpiresAt: number;
}

function createDeviceId(): string {
  const segment = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DEV-${segment}`;
}

function createDynamicQrToken(ticketId: string, deviceId: string): string {
  const dynamicSegment = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${ticketId}-${deviceId.slice(-4)}-${dynamicSegment}`;
}

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
    ticketId: DEFAULT_TICKET_ID,
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
  const [fanProfile, setFanProfile] = useState<FanProfile>('family');
  const [firstVisitMode, setFirstVisitMode] = useState(true);
  const [postEventExitMode, setPostEventExitMode] = useState(false);
  const [exitPhase, setExitPhase] = useState<'hold' | 'release'>('hold');
  const [demoMode, setDemoMode] = useState(false);
  const [behaviorRewards, setBehaviorRewards] = useState({
    points: 0,
    discounts: 0,
    priorityPasses: 0,
  });
  const [inclusionNeeds, setInclusionNeeds] = useState({
    elderly: false,
    accessibility: false,
    children: false,
  });
  const [ticketActivation, setTicketActivation] = useState<TicketActivationState>(() => {
    const deviceId = createDeviceId();
    return {
      deviceVerified: false,
      behaviorVerified: false,
      biometricRequired: false,
      biometricVerified: false,
      activated: false,
      activatedAt: null,
      lifecycle: 'pre_gate',
      deviceId,
      boundDeviceId: deviceId,
      dynamicQrToken: createDynamicQrToken(DEFAULT_TICKET_ID, deviceId),
      qrExpiresAt: Date.now() + QR_ROTATION_MS,
    };
  });
  const [arMode, setArMode] = useState(false);
  const [arTarget, setArTarget] = useState<ArTarget>('seat');
  const [ticketPersona, setTicketPersona] = useState<TicketPersona>('standard');
  const [seatOrderItem, setSeatOrderItem] = useState<SeatOrderItem>('drink');
  const [seatOrderQuantity, setSeatOrderQuantity] = useState(1);
  const [seatOrderLoading, setSeatOrderLoading] = useState(false);
  const [cashWallet, setCashWallet] = useState({
    balanceSar: 180,
    spentSar: 0,
    orders: 0,
  });

  const fanId = ticket.ticketId;
  const mood = useMemo(() => getFanMood(ticket.status), [ticket.status]);
  const profileLabel: Record<FanProfile, string> = {
    family: 'عائلة',
    fast: 'مستعجل',
    senior: 'كبار سن',
  };
  const profileReason: Record<FanProfile, string> = {
    family: 'تم اختيار مسار أعرض وأكثر هدوءًا مناسب للعائلات.',
    fast: 'تم اختيار أقصر مسار زمني للوصول الأسرع.',
    senior: 'تم اختيار مسار أقل ازدحامًا وأكثر أمانًا للحركة.',
  };
  const preArrivalInsight = useMemo(() => {
    if (ticket.peopleAhead >= 18) {
      return 'تنبيه مبكر: المنطقة القريبة من البوابة الحالية مرشحة لارتفاع الضغط خلال 10 دقائق.';
    }
    if (ticket.peopleAhead >= 10) {
      return 'تنبيه مبكر: الحركة متوسطة الآن، يفضّل التحرك خلال الدقائق القليلة القادمة.';
    }
    return 'الوضع متوازن الآن، يمكنك التحرك وفق التوجيه الحالي بدون تأخير.';
  }, [ticket.peopleAhead]);
  const queueAssistMessage = useMemo(() => {
    if (ticket.status === 'waiting') {
      return `دورك التقريبي خلال ${Math.max(3, Math.round(ticket.peopleAhead / 3))} دقائق.`;
    }
    if (ticket.status === 'approaching') {
      return 'دورك خلال 3 دقائق تقريبًا. استعد للتحرك الآن.';
    }
    if (ticket.status === 'ready') {
      return 'دورك الآن. ابدأ الحركة مباشرة.';
    }
    return 'تم الدخول بنجاح. استمتع بالفعالية.';
  }, [ticket.peopleAhead, ticket.status]);
  const staggeredExitText =
    exitPhase === 'hold'
      ? 'قطاعك: انتظر 3 دقائق للحصول على خروج سلس وتجنب الازدحام عند المواقف.'
      : 'قطاعك: الضوء الأخضر الآن. تحرك للمخرج الغربي عبر المسار الأزرق.';
  const journeySteps = [
    {
      key: 'entry',
      label: 'الدخول',
      done: ticket.status === 'entered' || ticket.status === 'ready' || ticket.status === 'approaching',
    },
    {
      key: 'move',
      label: 'التنقل',
      done: true,
    },
    {
      key: 'exit',
      label: 'الخروج',
      done: postEventExitMode && exitPhase === 'release',
    },
  ];
  const activeInclusionCount = Object.values(inclusionNeeds).filter(Boolean).length;
  const canActivateTicket =
    ticketActivation.deviceVerified &&
    ticketActivation.behaviorVerified &&
    (!ticketActivation.biometricRequired || ticketActivation.biometricVerified) &&
    ticketActivation.lifecycle === 'at_gate_verification';
  const isTicketLive = ticketActivation.activated && ticketActivation.lifecycle === 'entered_locked';
  const qrSecondsLeft = Math.max(0, Math.ceil((ticketActivation.qrExpiresAt - Date.now()) / 1000));
  const lifecycleLabel: Record<TicketLifecycle, string> = {
    pre_gate: 'قبل البوابة: التذكرة غير فعّالة',
    at_gate_verification: 'عند البوابة: جاري التحقق والتفعيل الفوري',
    entered_locked: 'بعد الدخول: التذكرة مغلقة وغير قابلة للنقل',
  };
  const arTargetLabel: Record<ArTarget, string> = {
    seat: 'المقعد',
    restroom: 'أقرب دورة مياه',
    food: 'أقرب منفذ طعام',
  };
  const arGuidance: Record<ArTarget, string> = {
    seat: `اتبع الأسهم الظاهرة للوصول إلى ${ticket.section} خلال 90 ثانية.`,
    restroom: 'اتبع المسار البنفسجي: دورة المياه الأقرب تبعد 45 مترًا.',
    food: 'اتبع المسار البرتقالي: منفذ الطعام الأقرب بدون طابور طويل.',
  };
  const seatOrderCatalog: Record<SeatOrderItem, { label: string; priceSar: number; etaMin: number }> = {
    drink: { label: 'مشروب بارد', priceSar: 18, etaMin: 6 },
    snack: { label: 'سناك سريع', priceSar: 24, etaMin: 8 },
    meal: { label: 'وجبة كاملة', priceSar: 38, etaMin: 12 },
  };
  const selectedSeatOrder = seatOrderCatalog[seatOrderItem];
  const seatOrderTotal = selectedSeatOrder.priceSar * seatOrderQuantity;
  const personaLabel: Record<TicketPersona, string> = {
    standard: 'تذكرة عادية',
    vip: 'تذكرة VIP',
    family: 'تذكرة عائلية',
  };
  const personalizedJourney = useMemo(() => {
    if (ticketPersona === 'vip') {
      return {
        gateAlert: `افتح البوابة VIP-${ticket.assignedGate} الآن لتفادي أي انتظار.`,
        nearbyOffer: 'عرض حصري قريب: ترقية مشروب مجانية عند الطلب من المقعد.',
      };
    }
    if (ticketPersona === 'family') {
      return {
        gateAlert: `استخدم البوابة ${ticket.assignedGate} العائلية (مسار أوسع وعربة أطفال).`,
        nearbyOffer: 'عرض قريب للعائلات: وجبة أطفال بخصم 20% في المنفذ الشرقي.',
      };
    }
    return {
      gateAlert: `البوابة ${ticket.assignedGate} هي الأسرع حاليًا حسب الضغط اللحظي.`,
      nearbyOffer: 'عرض قريب: خصم 10% على الطلب المسبق من المقعد.',
    };
  }, [ticket.assignedGate, ticketPersona]);

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
      if (demoMode) {
        setDataSource('local');
        setTicket(previous => {
          const peopleAhead = Math.max(0, previous.peopleAhead - 1);
          return {
            ...previous,
            peopleAhead,
            status: getTicketStatus(peopleAhead),
          };
        });
        return;
      }
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
  }, [demoMode]);

  useEffect(() => {
    if (ticketActivation.lifecycle === 'entered_locked') return;
    const interval = setInterval(() => {
      setTicketActivation(previous => ({
        ...previous,
        dynamicQrToken: createDynamicQrToken(fanId, previous.deviceId),
        qrExpiresAt: Date.now() + QR_ROTATION_MS,
      }));
    }, QR_ROTATION_MS);
    return () => clearInterval(interval);
  }, [fanId, ticketActivation.lifecycle]);

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

  const handleBehaviorReward = () => {
    setBehaviorRewards(previous => ({
      points: previous.points + 15,
      discounts: previous.discounts + 1,
      priorityPasses: previous.priorityPasses + (ticket.status === 'waiting' ? 0 : 1),
    }));
    setNotifications(items => ['تم احتساب مكافأة الالتزام بالتوجيه (+15 نقطة).', ...items].slice(0, 4));
    setTicketActivation(previous => ({ ...previous, behaviorVerified: true }));
  };

  const handleStartGateVerification = () => {
    if (ticketActivation.lifecycle !== 'pre_gate') return;
    setTicketActivation(previous => ({
      ...previous,
      lifecycle: 'at_gate_verification',
      dynamicQrToken: createDynamicQrToken(fanId, previous.deviceId),
      qrExpiresAt: Date.now() + QR_ROTATION_MS,
    }));
    setNotifications(items => ['تم الوصول للبوابة: بدأ التحقق الفوري للتذكرة.', ...items].slice(0, 4));
  };

  const handleActivateTicket = () => {
    if (!canActivateTicket) return;
    setTicketActivation(previous => ({
      ...previous,
      activated: true,
      activatedAt: new Date().toISOString(),
      lifecycle: 'entered_locked',
    }));
    setNotifications(items => ['تم التفعيل الفوري والدخول. التذكرة الآن مغلقة وغير قابلة للنقل.', ...items].slice(0, 4));
  };

  const handleSeatOrder = async () => {
    if (!isTicketLive) {
      setNotifications(items => ['الطلب من المقعد متاح بعد تفعيل التذكرة والدخول فقط.', ...items].slice(0, 4));
      return;
    }
    if (cashWallet.balanceSar < seatOrderTotal) {
      setNotifications(items => ['رصيد المحفظة غير كافٍ لإتمام الطلب الحالي.', ...items].slice(0, 4));
      return;
    }
    setSeatOrderLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setCashWallet(previous => ({
      balanceSar: previous.balanceSar - seatOrderTotal,
      spentSar: previous.spentSar + seatOrderTotal,
      orders: previous.orders + 1,
    }));
    setNotifications(items => [
      `تم تأكيد الطلب: ${selectedSeatOrder.label} × ${seatOrderQuantity}. التسليم خلال ${selectedSeatOrder.etaMin} دقائق.`,
      ...items,
    ].slice(0, 4));
    setSeatOrderLoading(false);
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
              <Button
                variant={demoMode ? 'default' : 'outline'}
                size="sm"
                className={demoMode ? 'bg-slate-900 hover:bg-slate-800' : ''}
                onClick={() => setDemoMode(value => !value)}
              >
                {demoMode ? 'Demo Mode On' : 'Demo Mode'}
              </Button>
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

        <Card className="mb-6 border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-slate-800" />
              التذكرة المرتبطة بالشخص
            </CardTitle>
            <CardDescription>
              التذكرة لا تُفعَّل إلا عند البوابة، وتفقد قيمتها خارج النظام بالكامل.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                <div
                  className={`rounded-md border p-2 ${
                    ticketActivation.lifecycle === 'pre_gate'
                      ? 'border-slate-900 bg-slate-100 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  قبل البوابة
                </div>
                <div
                  className={`rounded-md border p-2 ${
                    ticketActivation.lifecycle === 'at_gate_verification'
                      ? 'border-blue-700 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  عند البوابة
                </div>
                <div
                  className={`rounded-md border p-2 ${
                    ticketActivation.lifecycle === 'entered_locked'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  بعد الدخول
                </div>
              </div>
              {ticketActivation.lifecycle === 'pre_gate' && (
                <Button className="w-full bg-blue-700 hover:bg-blue-800" onClick={handleStartGateVerification}>
                  الوصول للبوابة وبدء التحقق
                </Button>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-sm font-semibold text-slate-900">QR ديناميكي مرتبط بجهاز واحد</p>
              <p className="mt-1 text-xs text-slate-600">لا صور ثابتة ولا PDF. الرمز يتغير تلقائيًا ويرتبط بهذا الجهاز فقط.</p>
              <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800">
                {ticketActivation.dynamicQrToken}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                الجهاز: <span className="font-semibold text-slate-800">{ticketActivation.deviceId}</span>
              </p>
              <p className="text-xs text-slate-600">
                صلاحية الرمز: <span className="font-semibold text-slate-800">{qrSecondsLeft} ثانية</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                variant={ticketActivation.deviceVerified ? 'default' : 'outline'}
                className={ticketActivation.deviceVerified ? 'bg-slate-900 hover:bg-slate-800' : ''}
                disabled={ticketActivation.lifecycle !== 'at_gate_verification'}
                onClick={() => {
                  const verified = ticketActivation.boundDeviceId === ticketActivation.deviceId;
                  setTicketActivation(previous => ({ ...previous, deviceVerified: verified }));
                  setNotifications(items => [
                    verified ? 'تم تحقق الجهاز: التذكرة مرتبطة بهذا الجهاز فقط.' : 'فشل تحقق الجهاز: الجهاز غير مطابق.',
                    ...items,
                  ].slice(0, 4));
                }}
              >
                <Smartphone className="ml-2 h-4 w-4" />
                تحقق الجهاز
              </Button>
              <Button
                variant={ticketActivation.behaviorVerified ? 'default' : 'outline'}
                className={ticketActivation.behaviorVerified ? 'bg-slate-900 hover:bg-slate-800' : ''}
                disabled={ticketActivation.lifecycle !== 'at_gate_verification'}
                onClick={() => {
                  setTicketActivation(previous => ({ ...previous, behaviorVerified: true }));
                  setNotifications(items => ['تم التحقق السلوكي: نمط الاستخدام مطابق لصاحب التذكرة.', ...items].slice(0, 4));
                }}
              >
                <ShieldCheck className="ml-2 h-4 w-4" />
                تحقق سلوكي
              </Button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">بيومتري خفيف (اختياري)</p>
                <Button
                  size="sm"
                  variant={ticketActivation.biometricRequired ? 'default' : 'outline'}
                  className={ticketActivation.biometricRequired ? 'bg-indigo-700 hover:bg-indigo-800' : ''}
                  disabled={ticketActivation.lifecycle !== 'at_gate_verification'}
                  onClick={() =>
                    setTicketActivation(previous => ({
                      ...previous,
                      biometricRequired: !previous.biometricRequired,
                      biometricVerified: previous.biometricRequired ? false : previous.biometricVerified,
                    }))
                  }
                >
                  {ticketActivation.biometricRequired ? 'مطلوب عند الاشتباه' : 'غير مطلوب'}
                </Button>
              </div>
              <p className="mb-2 text-xs text-slate-600">
                التحقق البيومتري يتم لحظيًا عند الاشتباه فقط، بدون تخزين أي بيانات حساسة.
              </p>
              {ticketActivation.biometricRequired && (
                <Button
                  variant={ticketActivation.biometricVerified ? 'default' : 'outline'}
                  className={ticketActivation.biometricVerified ? 'bg-indigo-700 hover:bg-indigo-800' : ''}
                  disabled={ticketActivation.lifecycle !== 'at_gate_verification'}
                  onClick={() => setTicketActivation(previous => ({ ...previous, biometricVerified: true }))}
                >
                  <Fingerprint className="ml-2 h-4 w-4" />
                  تحقق بيومتري خفيف
                </Button>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-700">الحالة: {lifecycleLabel[ticketActivation.lifecycle]}</p>
              <p className="mt-1 text-xs text-slate-600">
                {isTicketLive
                  ? `وقت الدخول: ${new Date(ticketActivation.activatedAt ?? '').toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} - التذكرة مغلقة وغير قابلة للنقل.`
                  : 'قبل البوابة تبقى التذكرة غير فعّالة ولا يمكن استخدامها خارج النظام.'}
              </p>
            </div>

            <Button
              className="w-full bg-slate-900 hover:bg-slate-800"
              disabled={!canActivateTicket || isTicketLive || ticketActivation.lifecycle !== 'at_gate_verification'}
              onClick={handleActivateTicket}
            >
              {isTicketLive ? 'تم التفعيل والدخول' : 'تحقق → تفعيل فوري → دخول'}
            </Button>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-bold text-emerald-800">النتيجة</p>
              <p className="mt-1 text-xs font-semibold text-slate-700">❌ لا بيع صور</p>
              <p className="text-xs font-semibold text-slate-700">❌ لا نقل حسابات</p>
              <p className="text-xs font-semibold text-slate-700">❌ لا سوق سوداء</p>
              <p className="mt-1 text-xs font-semibold text-emerald-800">✅ دخول أسرع</p>
              <p className="text-xs font-semibold text-emerald-800">✅ أمان أعلى</p>
            </div>
          </CardContent>
        </Card>

        <Alert className="mb-4 border-violet-200 bg-violet-50">
          <Bell className="h-4 w-4 text-violet-700" />
          <AlertDescription className="mr-2 text-violet-900">
            {preArrivalInsight}
          </AlertDescription>
        </Alert>

        <Alert className="mb-6 border-emerald-200 bg-emerald-50">
          <Timer className="h-4 w-4 text-emerald-700" />
          <AlertDescription className="mr-2 text-emerald-900">
            {queueAssistMessage}
          </AlertDescription>
        </Alert>

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
              <Users className="h-5 w-5 text-slate-700" />
              نوع التوجيه
            </CardTitle>
            <CardDescription>اختر أسلوب حركة مناسب لك، والنظام يعدّل المسار تلقائيًا.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {(['family', 'fast', 'senior'] as const).map(profile => (
                <Button
                  key={profile}
                  variant={fanProfile === profile ? 'default' : 'outline'}
                  className={fanProfile === profile ? 'bg-slate-900 hover:bg-slate-800' : ''}
                  onClick={() => setFanProfile(profile)}
                >
                  {profileLabel[profile]}
                </Button>
              ))}
            </div>
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              {profileReason[fanProfile]}
            </p>
          </CardContent>
        </Card>

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
              <p className="mt-2 text-xs font-medium text-indigo-700">{profileReason[fanProfile]}</p>
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
              <Button
                className="flex-1 bg-slate-900 hover:bg-slate-800"
                disabled={!isTicketLive}
                onClick={() => setNotifications([])}
              >
                تأكيد واستمرار
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
                تحديث الحالة
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-cyan-700" />
              الملاحة بالواقع المعزز (AR)
            </CardTitle>
            <CardDescription>استخدم الكاميرا لإيجاد المقعد أو أقرب دورة مياه أو منافذ الطعام عبر إرشادات على الشاشة.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(['seat', 'restroom', 'food'] as const).map(target => (
                <Button
                  key={target}
                  variant={arTarget === target ? 'default' : 'outline'}
                  className={arTarget === target ? 'bg-cyan-700 hover:bg-cyan-800' : ''}
                  onClick={() => setArTarget(target)}
                >
                  {arTargetLabel[target]}
                </Button>
              ))}
            </div>

            <div className="rounded-lg border border-cyan-200 bg-white p-3">
              <p className="text-sm font-semibold text-cyan-900">{arGuidance[arTarget]}</p>
              <p className="mt-2 text-xs text-slate-600">
                وضع الكاميرا: {arMode ? 'مفعل' : 'متوقف'} | طبقة الإرشاد: أسهم حيّة + مسافة + وقت وصول
              </p>
            </div>

            <Button
              className={arMode ? 'w-full bg-slate-900 hover:bg-slate-800' : 'w-full bg-cyan-700 hover:bg-cyan-800'}
              disabled={!isTicketLive}
              onClick={() => setArMode(value => !value)}
            >
              <MapPinned className="ml-2 h-4 w-4" />
              {arMode ? 'إيقاف AR' : 'تشغيل AR بالكاميرا'}
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm border border-lime-200 bg-gradient-to-br from-lime-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-lime-700" />
              رحلة المشجع المخصصة
            </CardTitle>
            <CardDescription>تنبيهات وقرارات مخصصة حسب نوع التذكرة وموقعك الحالي.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(['standard', 'vip', 'family'] as const).map(persona => (
                <Button
                  key={persona}
                  variant={ticketPersona === persona ? 'default' : 'outline'}
                  className={ticketPersona === persona ? 'bg-lime-700 hover:bg-lime-800' : ''}
                  onClick={() => setTicketPersona(persona)}
                >
                  {personaLabel[persona]}
                </Button>
              ))}
            </div>
            <div className="rounded-lg border border-lime-200 bg-white p-3">
              <p className="text-sm font-semibold text-lime-800">{personalizedJourney.gateAlert}</p>
              <p className="mt-2 text-xs font-medium text-slate-700">{personalizedJourney.nearbyOffer}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-rose-700" />
              المحفظة الرقمية والطلب من المقعد
            </CardTitle>
            <CardDescription>طلب الطعام والمشروبات من المقعد مع دفع غير نقدي لتقليل الطوابير في الممرات.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-rose-200 bg-white p-3">
                <p className="text-xs text-slate-600">الرصيد</p>
                <p className="text-xl font-bold text-rose-700">{cashWallet.balanceSar} ر.س</p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-white p-3">
                <p className="text-xs text-slate-600">المصروف</p>
                <p className="text-xl font-bold text-rose-700">{cashWallet.spentSar} ر.س</p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-white p-3">
                <p className="text-xs text-slate-600">الطلبات</p>
                <p className="text-xl font-bold text-rose-700">{cashWallet.orders}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(['drink', 'snack', 'meal'] as const).map(item => (
                <Button
                  key={item}
                  variant={seatOrderItem === item ? 'default' : 'outline'}
                  className={seatOrderItem === item ? 'bg-rose-700 hover:bg-rose-800' : ''}
                  onClick={() => setSeatOrderItem(item)}
                >
                  {seatOrderCatalog[item].label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setSeatOrderQuantity(value => Math.max(1, value - 1))}>
                -
              </Button>
              <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">
                الكمية: {seatOrderQuantity}
              </span>
              <Button variant="outline" onClick={() => setSeatOrderQuantity(value => Math.min(4, value + 1))}>
                +
              </Button>
              <span className="mr-auto text-xs font-semibold text-slate-700">
                الإجمالي: {seatOrderTotal} ر.س
              </span>
            </div>

            <div className="rounded-lg border border-rose-200 bg-white p-3 text-xs font-medium text-slate-700">
              الدفع غير النقدي يقلل التكدس ويرفع معدل الإنفاق داخل الملعب. التقدير المستهدف: حتى 20%.
            </div>

            <Button
              className="w-full bg-rose-700 hover:bg-rose-800"
              disabled={!isTicketLive || seatOrderLoading}
              onClick={handleSeatOrder}
            >
              <CreditCard className="ml-2 h-4 w-4" />
              {seatOrderLoading ? 'جارٍ تأكيد الطلب...' : `ادفع الآن واطلب (${seatOrderTotal} ر.س)`}
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm border border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-sky-700" />
              وضع الزائر لأول مرة
            </CardTitle>
            <CardDescription>إرشاد مبسّط خطوة بخطوة للزائر الجديد.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                variant={firstVisitMode ? 'default' : 'outline'}
                className={firstVisitMode ? 'bg-sky-700 hover:bg-sky-800' : ''}
                onClick={() => setFirstVisitMode(value => !value)}
              >
                {firstVisitMode ? 'وضع الزائر الأول مفعل' : 'تفعيل وضع الزائر الأول'}
              </Button>
              {firstVisitMode && (
                <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                  إرشاد مبسط
                </span>
              )}
            </div>
            {firstVisitMode && (
              <div className="rounded-lg border border-sky-200 bg-white p-3 text-sm text-slate-700">
                <p className="font-semibold">خطوات سريعة:</p>
                <p className="mt-1">1) اتبع الممر الأزرق نحو البوابة {ticket.assignedGate}</p>
                <p>2) عند ظهور تنبيه التحرك، غادر مقعدك مباشرة</p>
                <p>3) استخدم أقرب علامة {`"أنت هنا"`} لتأكيد الاتجاه</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle>مسار اليوم الكامل</CardTitle>
            <CardDescription>الدخول، التنقل، والخروج كرحلة واحدة ترافق المشجع.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {journeySteps.map(step => (
                <div
                  key={step.key}
                  className={`rounded-lg border p-3 text-center ${
                    step.done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <p className={`text-sm font-semibold ${step.done ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs mt-1">{step.done ? '✓ تم' : 'قيد التنفيذ'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-emerald-700" />
              إدارة الخروج بعد الحدث
            </CardTitle>
            <CardDescription>خروج متسلسل لتقليل الاختناق بعد نهاية الفعالية.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={postEventExitMode ? 'default' : 'outline'}
                className={postEventExitMode ? 'bg-emerald-700 hover:bg-emerald-800' : ''}
                onClick={() => setPostEventExitMode(value => !value)}
              >
                {postEventExitMode ? 'وضع الخروج الذكي مفعل' : 'تفعيل الخروج الذكي'}
              </Button>
              {postEventExitMode && (
                <>
                  <Button variant="outline" onClick={() => setExitPhase('hold')}>
                    انتظر الآن
                  </Button>
                  <Button className="bg-slate-900 hover:bg-slate-800" onClick={() => setExitPhase('release')}>
                    إطلاق الخروج
                  </Button>
                </>
              )}
            </div>
            {postEventExitMode && (
              <div className="rounded-lg border border-emerald-200 bg-white p-3">
                <p className="text-sm font-semibold text-emerald-800">{staggeredExitText}</p>
                <p className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  المسار المقترح: الممر الأزرق ثم المخرج الغربي.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-700" />
              مكافآت سلوكية
            </CardTitle>
            <CardDescription>كلما اتبعت التوجيه وتجنبت الزحام تحصل على مكافآت إضافية.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-amber-200 bg-white p-3">
                <p className="text-xs text-slate-600">نقاط</p>
                <p className="text-2xl font-bold text-amber-700">{behaviorRewards.points}</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-white p-3">
                <p className="text-xs text-slate-600">خصومات</p>
                <p className="text-2xl font-bold text-amber-700">{behaviorRewards.discounts}</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-white p-3">
                <p className="text-xs text-slate-600">أولوية</p>
                <p className="text-2xl font-bold text-amber-700">{behaviorRewards.priorityPasses}</p>
              </div>
            </div>
            <Button className="w-full bg-amber-700 hover:bg-amber-800" onClick={handleBehaviorReward}>
              <BadgeCheck className="ml-2 h-4 w-4" />
              تم اتباع التوجيه
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-violet-700" />
              مؤشرات شمولية
            </CardTitle>
            <CardDescription>دعم كبار السن وذوي الإعاقة والأطفال ضمن التوجيه الحالي.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Button
                variant={inclusionNeeds.elderly ? 'default' : 'outline'}
                className={inclusionNeeds.elderly ? 'bg-violet-700 hover:bg-violet-800' : ''}
                onClick={() => setInclusionNeeds(state => ({ ...state, elderly: !state.elderly }))}
              >
                كبار السن
              </Button>
              <Button
                variant={inclusionNeeds.accessibility ? 'default' : 'outline'}
                className={inclusionNeeds.accessibility ? 'bg-violet-700 hover:bg-violet-800' : ''}
                onClick={() => setInclusionNeeds(state => ({ ...state, accessibility: !state.accessibility }))}
              >
                ذوي الإعاقة
              </Button>
              <Button
                variant={inclusionNeeds.children ? 'default' : 'outline'}
                className={inclusionNeeds.children ? 'bg-violet-700 hover:bg-violet-800' : ''}
                onClick={() => setInclusionNeeds(state => ({ ...state, children: !state.children }))}
              >
                <Baby className="ml-1 h-4 w-4" />
                الأطفال
              </Button>
            </div>
            <p className="mt-3 rounded-lg border border-violet-200 bg-white p-3 text-xs font-semibold text-violet-800">
              {activeInclusionCount > 0
                ? `تم تفعيل ${activeInclusionCount} مؤشر شمولية، وسيتم تفضيل المسارات الأكثر أمانًا وانسيابية.`
                : 'يمكنك تفعيل مؤشرات الشمولية لتكييف التوجيه مع احتياجات الزائر.'}
            </p>
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
                  <Button disabled={loyaltyAction !== null || !isTicketLive} onClick={handleEarlyArrivalReward} className="bg-blue-700 hover:bg-blue-800">
                    <Gift className="ml-2 h-4 w-4" />
                    حضور مبكر
                  </Button>
                  <Button disabled={loyaltyAction !== null || !isTicketLive} onClick={handleDelayedExitReward} className="bg-emerald-700 hover:bg-emerald-800">
                    <Gift className="ml-2 h-4 w-4" />
                    خروج ذكي
                  </Button>
                  <Button disabled={loyaltyAction !== null || !isTicketLive} onClick={handleSpendTokens} variant="outline">
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
