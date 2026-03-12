/**
 * CrowdOS Platform Hub
 * Smart Stadium Operating System
 * 
 * الصفحة الرئيسية الموحدة للمنصة
 */

import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Zap, TrendingUp, Shield, ArrowRight } from 'lucide-react';

export default function CrowdOSHub() {
  const [location, setLocation] = useLocation();

  const platforms = [
    {
      id: 'fan',
      title: 'Fan Experience',
      subtitle: 'تجربة المشجع',
      description: 'تذكرة رقمية ذكية وملاحة حية داخل الملعب',
      icon: Users,
      color: 'from-blue-600 to-blue-800',
      route: '/fan-apple',
      stats: '45K+ Fans',
    },
    {
      id: 'operator',
      title: 'Stadium Command',
      subtitle: 'غرفة العمليات',
      description: 'مراقبة حية للحشود والبوابات مع توصيات ذكية',
      icon: Zap,
      color: 'from-cyan-600 to-blue-800',
      route: '/stadium-command',
      stats: 'Real-time',
    },
    {
      id: 'executive',
      title: 'Executive Intelligence',
      subtitle: 'لوحة القرار',
      description: 'مؤشرات أداء رئيسية وتحليلات استراتيجية',
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-800',
      route: '/executive-intelligence',
      stats: '92% Efficiency',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative container py-20">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">Smart Stadium Operating System</span>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              CrowdOS
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              نظام تشغيل ملاعب ذكي يدمج تجربة المشجع مع إدارة العمليات والذكاء التنفيذي
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300">
                ابدأ الآن
              </Button>
              <Button variant="outline" className="border-gray-700 hover:bg-gray-900/50 rounded-full px-8 py-6 text-lg font-semibold">
                اعرف المزيد
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Platforms Section */}
      <div className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">ثلاث منصات متكاملة</h2>
          <p className="text-gray-400 text-lg">كل منصة مصممة لتحقيق أهداف محددة بكفاءة عالية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <Card
                key={platform.id}
                className="rounded-3xl bg-gray-900/40 border-gray-800 backdrop-blur-xl hover:border-gray-700 transition-all duration-300 group cursor-pointer overflow-hidden"
                onClick={() => setLocation(platform.route)}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                      {platform.stats}
                    </span>
                  </div>
                  <CardTitle className="text-2xl mb-1">{platform.title}</CardTitle>
                  <CardDescription className="text-cyan-400 text-sm font-medium mb-2">
                    {platform.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative">
                  <p className="text-gray-400 text-sm mb-6">{platform.description}</p>

                  <div className="flex items-center gap-2 text-cyan-400 group-hover:gap-3 transition-all duration-300">
                    <span className="font-semibold text-sm">الدخول</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-16 border-t border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">المميزات الرئيسية</h2>
          <p className="text-gray-400 text-lg">تقنيات متقدمة لإدارة الملاعب الحديثة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'تنبؤ ذكي', desc: 'توقع الحشود قبل 30 دقيقة' },
            { title: 'توجيه فوري', desc: 'إعادة توجيه الجماهير تلقائياً' },
            { title: 'تحليلات حية', desc: 'بيانات فعلية كل 5 ثواني' },
            { title: 'أمان عالي', desc: 'نظام حماية متعدد الطبقات' },
          ].map((feature, idx) => (
            <Card key={idx} className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <span className="text-blue-400 font-bold text-sm">{idx + 1}</span>
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="container py-16 border-t border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'الملاعب', value: '50+' },
            { label: 'المشجعون', value: '5M+' },
            { label: 'الدقة', value: '98.5%' },
            { label: 'الكفاءة', value: '92%' },
          ].map((stat, idx) => (
            <Card key={idx} className="rounded-2xl bg-gray-900/40 border-gray-800 backdrop-blur-xl text-center">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-cyan-400 mb-2">{stat.value}</div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 py-8">
        <div className="container text-center text-gray-500 text-sm">
          <p>CrowdOS © 2026 - Smart Stadium Operating System</p>
        </div>
      </div>
    </div>
  );
}
