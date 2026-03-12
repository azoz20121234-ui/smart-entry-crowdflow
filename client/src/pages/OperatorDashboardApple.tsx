/**
 * Operator Dashboard - Apple Design
 * CrowdOS Stadium Brain
 * 
 * غرفة العمليات الرئيسية للملاعب الذكية
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Users, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function OperatorDashboardApple() {
  const [location, setLocation] = useLocation();
  const [crowdLevel, setCrowdLevel] = useState(68);
  const [gateRisk, setGateRisk] = useState('warning');
  const [activeAlerts, setActiveAlerts] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCrowdLevel(prev => {
        const change = Math.random() * 10 - 5;
        return Math.max(20, Math.min(95, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getGateRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>

          <div>
            <h1 className="text-5xl font-bold mb-2">غرفة العمليات</h1>
            <p className="text-gray-400 text-lg">Operational Command Center</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Critical Alert */}
        {activeAlerts > 0 && (
          <Alert className="mb-8 border-red-900/50 bg-red-950/20">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200 ml-4">
              هناك {activeAlerts} تنبيهات نشطة تحتاج إلى اهتمام فوري
            </AlertDescription>
          </Alert>
        )}

        {/* Top Section - Stadium Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Crowd Level */}
          <Card className="rounded-2xl bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">مستوى الحشود</p>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-4xl font-bold mb-2">{crowdLevel.toFixed(0)}%</div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${crowdLevel}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Gate Risk */}
          <Card className="rounded-2xl bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">حالة البوابات</p>
                <AlertTriangle className={`w-5 h-5 ${getGateRiskColor(gateRisk)}`} />
              </div>
              <div className="text-2xl font-bold mb-2">
                {gateRisk === 'critical' ? 'حرج' : gateRisk === 'warning' ? 'تحذير' : 'آمن'}
              </div>
              <p className="text-gray-500 text-sm">2 من 4 بوابات تحت ضغط</p>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="rounded-2xl bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">التنبيهات النشطة</p>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-4xl font-bold mb-2">{activeAlerts}</div>
              <p className="text-gray-500 text-sm">تحتاج إلى إجراء فوري</p>
            </CardContent>
          </Card>

          {/* Arrival Prediction */}
          <Card className="rounded-2xl bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">التنبؤ بالوصول</p>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold mb-2">+12,000</div>
              <p className="text-gray-500 text-sm">في الـ 30 دقيقة القادمة</p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section - Stadium Heatmap */}
        <Card className="rounded-2xl bg-gray-900/50 border-gray-800 backdrop-blur-xl mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">خريطة الازدحام الحية</CardTitle>
            <CardDescription>Stadium Heatmap - توزيع الجماهير في الملعب</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-red-500/20 via-yellow-500/20 to-green-500/20 rounded-full blur-3xl"></div>
                <p className="text-gray-400">خريطة الازدحام الحية</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Section - Operational Recommendations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">التوصيات التشغيلية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recommendation 1 */}
            <Card className="rounded-2xl bg-gradient-to-br from-blue-950/50 to-blue-900/20 border-blue-800/50 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">فتح البوابة 4</h3>
                    <p className="text-gray-400 text-sm">تقليل الضغط على البوابة 2 بنسبة 40%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendation 2 */}
            <Card className="rounded-2xl bg-gradient-to-br from-yellow-950/50 to-yellow-900/20 border-yellow-800/50 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">إعادة توجيه الجماهير</h3>
                    <p className="text-gray-400 text-sm">توجيه 25% من الجماهير للبوابات الأخرى</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendation 3 */}
            <Card className="rounded-2xl bg-gradient-to-br from-green-950/50 to-green-900/20 border-green-800/50 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">تقليل الضغط</h3>
                    <p className="text-gray-400 text-sm">تقليل ضغط البوابة 2 من 92% إلى 60%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
