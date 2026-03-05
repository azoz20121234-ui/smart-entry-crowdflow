/**
 * Home Page - Smart Entry & CrowdFlow
 * 
 * Landing page showcasing the platform's innovative features
 * Design: Modern Dynamic with hero imagery and feature highlights
 */

import { ArrowRight, Menu, Zap, Users, TrendingUp, Clock, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { platformRoutes } from '@/lib/platformRoutes';
import { useLocation } from 'wouter';

const HERO_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663404606112/msTvYaYH3JmEVJtbca6DuT/hero-stadium-nrZFzy2yJvLEixy6dd36tY.webp';

export default function Home() {
  const [, setLocation] = useLocation();
  const featuredRoutes = platformRoutes.filter(route => route.featured && route.path !== '/');
  const homeMenuRoutes = featuredRoutes.slice(0, 5);

  const scrollToRoleAccess = () => {
    document.getElementById('role-access')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-cyan-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Smart Entry</h1>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {homeMenuRoutes.map(route => (
              <Button
                key={route.path}
                variant="ghost"
                className="text-slate-700"
                onClick={() => setLocation(route.path)}
              >
                {route.title}
              </Button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" onClick={() => setLocation('/analytics')}>
              لوحة التحليلات
            </Button>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => setLocation('/operator')}>
              ابدأ الآن
            </Button>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="فتح قائمة التنقل">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88%] max-w-sm">
                <SheetHeader>
                  <SheetTitle>التنقل داخل المنصة</SheetTitle>
                  <SheetDescription>
                    اختر الوجهة المناسبة لدورك للوصول إلى الأدوات بسرعة.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6 pt-2 space-y-2 overflow-y-auto">
                  {featuredRoutes.map(route => {
                    const Icon = route.icon;
                    return (
                      <button
                        key={route.path}
                        type="button"
                        className="w-full rounded-xl border border-slate-200 p-3 text-right hover:bg-slate-50 transition-colors"
                        onClick={() => setLocation(route.path)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 rounded-lg bg-blue-50 p-2">
                            <Icon className="w-4 h-4 text-blue-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{route.title}</p>
                            <p className="text-xs text-slate-600 mt-1">{route.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Stadium with crowd flow visualization"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative container mx-auto px-4 py-32 text-center text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            إدارة الحشود الذكية
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            منصة تشغيل ذكية تدمج التذاكر الرقمية مع إدارة الحشود الديناميكية لتحسين تجربة الجماهير وكفاءة التشغيل
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-slate-100 text-base h-12"
              onClick={scrollToRoleAccess}
            >
              اكتشف المزيد
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-base h-12"
              onClick={() => setLocation('/admin')}
            >
              جرب لوحة التحكم
            </Button>
          </div>
        </div>
      </section>

      {/* Role Access */}
      <section id="role-access" className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col gap-3 text-center">
            <p className="inline-flex self-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              توزيع الوصول حسب الدور
            </p>
            <h2 className="text-3xl font-bold text-slate-900">اختر بوابة عملك داخل المنصة</h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              تنظيم الواجهة حسب نوع المستخدم يقلل وقت الوصول إلى الأدوات التشغيلية والتحليلية ويُسرّع اتخاذ القرار.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRoutes.map(route => {
              const Icon = route.icon;
              return (
                <button
                  key={route.path}
                  type="button"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  onClick={() => setLocation(route.path)}
                >
                  <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3">
                    <Icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{route.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{route.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {route.category}
                    </span>
                    <span className="text-xs font-semibold text-blue-700 group-hover:text-blue-800">
                      انتقال سريع
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">الميزات الرئيسية</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              حلول مبتكرة لتحسين تدفق الجماهير وتقليل الازدحام
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Feature 1: Adaptive Tickets */}
            <Card className="border-l-4 border-l-blue-700 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-blue-700" />
                  </div>
                  <CardTitle>التذكرة المتغيرة ذاتياً</CardTitle>
                </div>
                <CardDescription>Adaptive Ticket Routing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  تحديث تلقائي لبوابة الدخول بناءً على حالة الازدحام الفعلية. يتم توجيه كل مشجع إلى البوابة الأمثل لتقليل وقت الانتظار.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-700 rounded-full" />
                    تحديث فوري للبوابة المخصصة
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-700 rounded-full" />
                    توزيع ذكي للحشود
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-700 rounded-full" />
                    تقليل الازدحام بنسبة تصل إلى 40%
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2: Virtual Queues */}
            <Card className="border-l-4 border-l-green-600 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>الطوابير الافتراضية</CardTitle>
                </div>
                <CardDescription>Virtual Gate Queueing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  نظام طوابير رقمي يسمح للمشجعين بالانضمام إلى طابور افتراضي دون الوقوف الفعلي. يحصل كل مشجع على رقم دور ويُسمح له بالاقتراب عند دوره.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full" />
                    تقليل الازدحام الفعلي أمام البوابات
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full" />
                    تتبع الدور عبر التطبيق
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full" />
                    تجربة أفضل للمشجعين
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                  <CardTitle className="text-lg">بيانات حية</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  لوحة تحكم تعرض بيانات الحشود والبوابات في الوقت الفعلي مع رسوم بيانية حية.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                  <CardTitle className="text-lg">تقليل الانتظار</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  تقليل وقت الانتظار بشكل ملموس من خلال التوزيع الذكي للجماهير.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6 text-red-600" />
                  <CardTitle className="text-lg">أمان محسّن</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  نظام آمن يمنع الازدحام الخطر ويحسّن السلامة العامة.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-slate-900 mb-16 text-center">كيفية العمل</h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-blue-50 rounded-lg p-8 border border-blue-200 h-full">
                <div className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">شراء التذكرة</h3>
                <p className="text-slate-600">
                  يشتري المشجع التذكرة عبر التطبيق ويحصل على رقم دور افتراضي.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-blue-700" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-green-50 rounded-lg p-8 border border-green-200 h-full">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">الطابور الافتراضي</h3>
                <p className="text-slate-600">
                  ينضم المشجع إلى طابور افتراضي ويتابع دوره عبر التطبيق.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                <ArrowRight className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="bg-orange-50 rounded-lg p-8 border border-orange-200 h-full">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">الدخول الذكي</h3>
                <p className="text-slate-600">
                  عند اقتراب الدور، يتم إخبار المشجع بالبوابة المخصصة والدخول بسلاسة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2">40%</p>
              <p className="text-lg opacity-90">تقليل الازدحام</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">6 دقائق</p>
              <p className="text-lg opacity-90">متوسط وقت الانتظار</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">94%</p>
              <p className="text-lg opacity-90">رضا المشجعين</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">100%</p>
              <p className="text-lg opacity-90">تحديث فوري</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">جاهز للبدء؟</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            جرب لوحة التحكم الآن واكتشف كيف يمكن لـ Smart Entry & CrowdFlow تحسين إدارة الحشود في ملعبك.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              className="bg-blue-700 hover:bg-blue-800 text-base h-12"
              onClick={() => setLocation('/admin')}
            >
              لوحة التحكم
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base h-12"
              onClick={() => setLocation('/fan')}
            >
              تطبيق المشجع
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">عن المنصة</h3>
              <p className="text-slate-400 text-sm">
                منصة ذكية لإدارة الحشود والدخول في الملاعب والفعاليات الرياضية.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">الميزات</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">التذكرة المتغيرة</a></li>
                <li><a href="#" className="hover:text-white">الطوابير الافتراضية</a></li>
                <li><a href="#" className="hover:text-white">البيانات الحية</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">الدعم</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white">التوثيق</a></li>
                <li><a href="#" className="hover:text-white">الاتصال بنا</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">قانوني</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-white">شروط الخدمة</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 Smart Entry & CrowdFlow. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
