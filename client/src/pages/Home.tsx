import { useLocation } from 'wouter';
import { Compass, Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const roleCards = [
  {
    path: '/fan',
    title: 'Fan',
    subtitle: 'واجهة المشجع',
    description: 'التوجيه الفوري والتنبيهات المبسطة أثناء المباراة.',
    icon: Compass,
    tone: 'from-indigo-600 to-indigo-500',
    ring: 'ring-indigo-100',
  },
  {
    path: '/operator',
    title: 'Operator',
    subtitle: 'لوحة المنظم',
    description: 'تشغيل البوابات واتخاذ إجراءات مباشرة في الوقت الحقيقي.',
    icon: ShieldCheck,
    tone: 'from-emerald-600 to-emerald-500',
    ring: 'ring-emerald-100',
  },
  {
    path: '/executive',
    title: 'Management',
    subtitle: 'اللوحة التنفيذية',
    description: 'حالة عامة سريعة: مطمئن، انتباه، أو تدخل مطلوب.',
    icon: Crown,
    tone: 'from-amber-600 to-amber-500',
    ring: 'ring-amber-100',
  },
] as const;

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-blue-700" />
            Smart Entry & CrowdFlow
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            اختر دورك وابدأ مباشرة
          </h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">بوابة دخول سريعة بدون تعقيد.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roleCards.map(role => {
            const Icon = role.icon;
            return (
              <button
                key={role.path}
                type="button"
                onClick={() => setLocation(role.path)}
                className={`group rounded-2xl bg-white p-1 text-right shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-md ${role.ring}`}
              >
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${role.tone}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-slate-900">{role.title}</CardTitle>
                    <CardDescription className="text-sm font-semibold text-slate-700">{role.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-5 text-sm text-slate-600">{role.description}</p>
                    <Button className="h-10 w-full bg-slate-900 text-white hover:bg-slate-800">الدخول الآن</Button>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
