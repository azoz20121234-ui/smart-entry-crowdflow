import { useLocation } from 'wouter';
import { ArrowLeft, Compass, Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const roleCards = [
  {
    path: '/fan',
    title: 'المشجع',
    subtitle: 'واجهة المشجع',
    description: 'التوجيه الفوري والتنبيهات المبسطة أثناء المباراة.',
    icon: Compass,
    tone: 'from-indigo-600 to-indigo-500',
    ring: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  {
    path: '/operator',
    title: 'المنظم',
    subtitle: 'لوحة المنظم',
    description: 'تشغيل البوابات واتخاذ إجراءات مباشرة في الوقت الحقيقي.',
    icon: ShieldCheck,
    tone: 'from-emerald-600 to-emerald-500',
    ring: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    path: '/executive',
    title: 'الإدارة',
    subtitle: 'اللوحة التنفيذية',
    description: 'حالة عامة سريعة: مطمئن، انتباه، أو تدخل مطلوب.',
    icon: Crown,
    tone: 'from-amber-600 to-amber-500',
    ring: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
] as const;

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-blue-50/40">
      <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-20 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14 md:py-16">
        <header className="mb-8 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur md:mb-10 md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-blue-700" />
            منصة إدارة الحشود الذكية
          </div>
          <h1 className="text-right text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            بوابة دخول واحدة
            <span className="block text-blue-800">ومسارات واضحة حسب الدور</span>
          </h1>
          <p className="mt-3 max-w-2xl text-right text-sm font-medium text-slate-600 md:text-base">
            اختر دورك الآن: مشجع، مشغّل، أو إدارة تنفيذية. بدون تشتيت، وبدون صفحات زائدة.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {roleCards.map((role, index) => {
            const Icon = role.icon;
            return (
              <button
                key={role.path}
                type="button"
                onClick={() => setLocation(role.path)}
                className={`group relative overflow-hidden rounded-3xl border bg-white/90 p-5 text-right shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${role.ring}`}
                aria-label={`الدخول إلى ${role.subtitle}`}
              >
                <div className="absolute -left-6 -top-8 h-24 w-24 rounded-full bg-slate-100/60 blur-2xl transition-transform group-hover:scale-110" />

                <div className="relative mb-5 flex items-start justify-between gap-3">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${role.tone}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${role.badge}`}>0{index + 1}</span>
                </div>

                <h2 className="relative text-2xl font-black text-slate-900">{role.title}</h2>
                <p className="relative mt-1 text-sm font-bold text-slate-700">{role.subtitle}</p>
                <p className="relative mt-3 text-sm leading-6 text-slate-600">{role.description}</p>

                <div className="relative mt-5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">دخول فوري</span>
                  <Button className="h-10 bg-slate-900 px-4 text-white hover:bg-slate-800">
                    ابدأ
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
