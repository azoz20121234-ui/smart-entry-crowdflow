/**
 * Scenario Simulation Component
 * Smart Entry & CrowdFlow - CrowdOS Stadium Brain
 * 
 * وحدة تفاعلية لمحاكاة القرارات واختبار تأثيرها على توزيع الحشود
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ArrowRight, Zap } from 'lucide-react';

interface GateState {
  name: string;
  congestion: number;
  capacity: number;
  flow: number;
}

interface SimulationStep {
  title: string;
  description: string;
  gates: GateState[];
  isActive: boolean;
}

export function ScenarioSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const initialState: GateState[] = [
    { name: 'البوابة 1', congestion: 45, capacity: 1200, flow: 900 },
    { name: 'البوابة 2', congestion: 92, capacity: 1200, flow: 2100 },
    { name: 'البوابة 3', congestion: 35, capacity: 900, flow: 600 },
    { name: 'البوابة 4', congestion: 55, capacity: 1000, flow: 750 },
  ];

  const simulationSteps: SimulationStep[] = [
    {
      title: 'الحالة الحالية',
      description: 'البوابة 2 تعاني من ازدحام شديد (92%)',
      gates: initialState,
      isActive: true,
    },
    {
      title: 'الإجراء المقترح',
      description: 'إعادة توجيه 25% من الحشود من البوابة 2 إلى البوابة 4',
      gates: [
        { name: 'البوابة 1', congestion: 45, capacity: 1200, flow: 900 },
        { name: 'البوابة 2', congestion: 69, capacity: 1200, flow: 1575 },
        { name: 'البوابة 3', congestion: 35, capacity: 900, flow: 600 },
        { name: 'البوابة 4', congestion: 80, capacity: 1000, flow: 1175 },
      ],
      isActive: true,
    },
    {
      title: 'النتيجة النهائية',
      description: 'تحسن ملحوظ في توزيع الحشود وتقليل الازدحام',
      gates: [
        { name: 'البوابة 1', congestion: 45, capacity: 1200, flow: 900 },
        { name: 'البوابة 2', congestion: 60, capacity: 1200, flow: 1500 },
        { name: 'البوابة 3', congestion: 35, capacity: 900, flow: 600 },
        { name: 'البوابة 4', congestion: 55, capacity: 1000, flow: 825 },
      ],
      isActive: true,
    },
  ];

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setSimulationComplete(false);

    // Animate through steps
    for (let i = 0; i < simulationSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(i + 1);
    }

    setIsRunning(false);
    setSimulationComplete(true);
  };

  const getRiskColor = (congestion: number) => {
    if (congestion >= 80) return '#ef4444'; // Red
    if (congestion >= 60) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const getRiskLabel = (congestion: number) => {
    if (congestion >= 80) return 'حرج';
    if (congestion >= 60) return 'تحذير';
    return 'عادي';
  };

  const currentSimulation = simulationSteps[Math.min(currentStep, simulationSteps.length - 1)];

  return (
    <Card className="shadow-lg border-purple-900/20 bg-slate-900/50 overflow-hidden">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
              محاكاة القرار
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              What-If Simulation - اختبر تأثير القرارات على توزيع الحشود
            </CardDescription>
          </div>
          <Button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isRunning ? 'جاري التشغيل...' : 'تشغيل المحاكاة'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Simulation Progress */}
        {isRunning && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-300">تقدم المحاكاة</p>
              <p className="text-sm text-slate-400">
                {currentStep} من {simulationSteps.length}
              </p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / simulationSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Current Step Display */}
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-start gap-3 mb-3">
              {currentStep === 0 && <AlertCircle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />}
              {currentStep === 1 && <Zap className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />}
              {currentStep >= 2 && <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />}
              <div>
                <p className="text-sm font-semibold text-slate-200">{currentSimulation.title}</p>
                <p className="text-sm text-slate-400 mt-1">{currentSimulation.description}</p>
              </div>
            </div>
          </div>

          {/* Gates Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentSimulation.gates.map((gate, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border-2 transition-all duration-500"
                style={{
                  borderColor: getRiskColor(gate.congestion),
                  backgroundColor: `${getRiskColor(gate.congestion)}08`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-300">{gate.name}</p>
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: getRiskColor(gate.congestion) }}
                  ></div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">الازدحام</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-slate-700 rounded-full h-2 mr-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${gate.congestion}%`,
                            backgroundColor: getRiskColor(gate.congestion),
                          }}
                        ></div>
                      </div>
                      <p className="text-sm font-bold" style={{ color: getRiskColor(gate.congestion) }}>
                        {gate.congestion}%
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500">التدفق الحالي</p>
                    <p className="text-lg font-bold text-slate-200 mt-1">
                      {gate.flow}
                      <span className="text-xs text-slate-500 mr-1">شخص/ساعة</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500">السعة</p>
                    <p className="text-sm font-semibold text-slate-300 mt-1">
                      {gate.capacity.toLocaleString()} شخص
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50">
                    <p className="text-xs font-semibold" style={{ color: getRiskColor(gate.congestion) }}>
                      الحالة: {getRiskLabel(gate.congestion)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Results */}
        {simulationComplete && (
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-300">اكتملت المحاكاة بنجاح</p>
                <p className="text-sm text-green-200 mt-1">
                  تم تقليل الازدحام في البوابة 2 من 92% إلى 60% بنجاح. النظام يوصي بتطبيق هذا الإجراء.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">متوسط الازدحام</p>
            <p className="text-2xl font-bold text-purple-400">
              {Math.round(currentSimulation.gates.reduce((a, b) => a + b.congestion, 0) / currentSimulation.gates.length)}%
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">إجمالي التدفق</p>
            <p className="text-2xl font-bold text-blue-400">
              {currentSimulation.gates.reduce((a, b) => a + b.flow, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">الكفاءة المتوقعة</p>
            <p className="text-2xl font-bold text-green-400">
              {Math.round(100 - (currentSimulation.gates.reduce((a, b) => a + b.congestion, 0) / currentSimulation.gates.length))}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
