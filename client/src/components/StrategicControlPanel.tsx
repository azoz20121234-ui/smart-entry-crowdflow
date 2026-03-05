/**
 * Strategic Control Panel - Smart Entry & CrowdFlow
 * 
 * Advanced simulation and strategy planning dashboard
 * Integrates all 6 layers for comprehensive decision-making
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Zap, TrendingUp, DollarSign, Users, AlertTriangle, Target, Lightbulb } from 'lucide-react';

interface SimulationScenario {
  name: string;
  description: string;
  matchType: 'derby' | 'cup' | 'league' | 'friendly';
  weather: 'clear' | 'rain' | 'hot' | 'cold';
  pricingStrategy: 'peak-demand' | 'balanced' | 'volume-maximization' | 'premium-experience';
  predictedDensity: number;
  expectedRevenue: number;
  expectedAttendance: number;
  estimatedWaitTime: number;
  safetyScore: number;
  fanSatisfaction: number;
}

interface SimulationResult {
  scenario: SimulationScenario;
  metrics: {
    crowdDensity: number;
    averageWaitTime: number;
    totalRevenue: number;
    ticketsSold: number;
    safetyIncidents: number;
    fanSatisfaction: number;
    operationalCost: number;
    netProfit: number;
  };
  recommendations: string[];
  riskFactors: string[];
  successFactors: string[];
}

export function StrategicControlPanel() {
  const [selectedScenario, setSelectedScenario] = useState<string>('derby-peak');
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);

  const scenarios: Record<string, SimulationScenario> = {
    'derby-peak': {
      name: 'ديربي - ذروة الطلب',
      description: 'مباراة ديربي مع استراتيجية تسعير ذروة الطلب',
      matchType: 'derby',
      weather: 'clear',
      pricingStrategy: 'peak-demand',
      predictedDensity: 92,
      expectedRevenue: 450000,
      expectedAttendance: 2200,
      estimatedWaitTime: 12,
      safetyScore: 75,
      fanSatisfaction: 70,
    },
    'league-balanced': {
      name: 'دوري - متوازن',
      description: 'مباراة دوري عادية مع استراتيجية متوازنة',
      matchType: 'league',
      weather: 'clear',
      pricingStrategy: 'balanced',
      predictedDensity: 65,
      expectedRevenue: 380000,
      expectedAttendance: 2500,
      estimatedWaitTime: 8,
      safetyScore: 85,
      fanSatisfaction: 80,
    },
    'cup-volume': {
      name: 'كأس - تعظيم الحجم',
      description: 'مباراة كأس مع استراتيجية تعظيم الحجم',
      matchType: 'cup',
      weather: 'rain',
      pricingStrategy: 'volume-maximization',
      predictedDensity: 78,
      expectedRevenue: 420000,
      expectedAttendance: 2800,
      estimatedWaitTime: 10,
      safetyScore: 80,
      fanSatisfaction: 85,
    },
    'friendly-premium': {
      name: 'ودي - تجربة مميزة',
      description: 'مباراة ودية مع استراتيجية التجربة المميزة',
      matchType: 'friendly',
      weather: 'clear',
      pricingStrategy: 'premium-experience',
      predictedDensity: 42,
      expectedRevenue: 380000,
      expectedAttendance: 1800,
      estimatedWaitTime: 5,
      safetyScore: 95,
      fanSatisfaction: 90,
    },
  };

  const runSimulation = (scenarioKey: string) => {
    const scenario = scenarios[scenarioKey];
    const metrics = {
      crowdDensity: scenario.predictedDensity,
      averageWaitTime: scenario.estimatedWaitTime,
      totalRevenue: scenario.expectedRevenue,
      ticketsSold: scenario.expectedAttendance,
      safetyIncidents: Math.max(0, Math.round((100 - scenario.safetyScore) / 10)),
      fanSatisfaction: scenario.fanSatisfaction,
      operationalCost: 150000,
      netProfit: scenario.expectedRevenue - 150000,
    };

    const recommendations = generateRecommendations(scenario, metrics);
    const riskFactors = identifyRiskFactors(scenario);
    const successFactors = identifySuccessFactors(scenario);

    setSimulationResults({
      scenario,
      metrics,
      recommendations,
      riskFactors,
      successFactors,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <CardTitle>لوحة التحكم الاستراتيجية</CardTitle>
              <CardDescription>محاكاة متقدمة لجميع السيناريوهات وتحليل النتائج</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Scenario Selector */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            اختر السيناريو
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedScenario(key);
                  runSimulation(key);
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedScenario === key
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-blue-400'
                }`}
              >
                <h4 className="font-semibold text-slate-900 mb-1">{scenario.name}</h4>
                <p className="text-xs text-slate-600 mb-2">{scenario.description}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-blue-600 font-semibold">الكثافة: {scenario.predictedDensity}%</span>
                  <span className="text-green-600 font-semibold">الإيرادات: {(scenario.expectedRevenue / 1000).toFixed(0)}K</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {simulationResults && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">الكثافة المتوقعة</p>
                    <p className="text-3xl font-bold text-slate-900">{simulationResults.metrics.crowdDensity}%</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">متوسط الانتظار</p>
                    <p className="text-3xl font-bold text-slate-900">{simulationResults.metrics.averageWaitTime} دقائق</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">الإيرادات المتوقعة</p>
                    <p className="text-3xl font-bold text-green-600">{(simulationResults.metrics.totalRevenue / 1000).toFixed(0)}K</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">الربح الصافي</p>
                    <p className="text-3xl font-bold text-blue-600">{(simulationResults.metrics.netProfit / 1000).toFixed(0)}K</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Metrics Comparison */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>مقارنة المقاييس</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={[simulationResults.metrics]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="crowdDensity" stroke="#6b7280" />
                    <PolarRadiusAxis stroke="#6b7280" />
                    <Radar
                      name="الأداء"
                      dataKey="fanSatisfaction"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Financial Projection */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>الإسقاط المالي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm font-semibold text-slate-900">الإيرادات الإجمالية</span>
                    <span className="text-lg font-bold text-green-700">{(simulationResults.metrics.totalRevenue / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-sm font-semibold text-slate-900">تكاليف التشغيل</span>
                    <span className="text-lg font-bold text-red-700">{(simulationResults.metrics.operationalCost / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-semibold text-slate-900">الربح الصافي</span>
                    <span className="text-lg font-bold text-blue-700">{(simulationResults.metrics.netProfit / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {simulationResults.recommendations.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  التوصيات الاستراتيجية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {simulationResults.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-slate-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk & Success Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Factors */}
            {simulationResults.riskFactors.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    عوامل المخاطرة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {simulationResults.riskFactors.map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <span className="text-red-600 font-bold mt-0.5">⚠</span>
                        <p className="text-sm text-slate-800">{factor}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success Factors */}
            {simulationResults.successFactors.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    عوامل النجاح
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {simulationResults.successFactors.map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <p className="text-sm text-slate-800">{factor}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="flex-1 bg-blue-700 hover:bg-blue-800 h-12">
          تطبيق السيناريو المختار
        </Button>
        <Button variant="outline" className="flex-1 h-12">
          تصدير التقرير
        </Button>
        <Button variant="outline" className="flex-1 h-12">
          مقارنة السيناريوهات
        </Button>
      </div>
    </div>
  );
}

/**
 * Helper functions
 */
function generateRecommendations(scenario: SimulationScenario, metrics: any): string[] {
  const recommendations: string[] = [];

  if (metrics.crowdDensity >= 85) {
    recommendations.push('🔴 فتح جميع البوابات والممرات الإضافية');
    recommendations.push('🔴 زيادة عدد الموظفين بـ 50% على الأقل');
    recommendations.push('🔴 تفعيل خطة الطوارئ والسلامة');
  }

  if (metrics.averageWaitTime > 10) {
    recommendations.push('⚠️ تحسين عملية التحقق من التذاكر');
    recommendations.push('⚠️ توزيع الحشود على بوابات متعددة');
  }

  if (metrics.fanSatisfaction < 75) {
    recommendations.push('→ تحسين تجربة الدخول والمرافق');
    recommendations.push('→ زيادة عدد الموظفين المساعدين');
  }

  if (metrics.netProfit > 300000) {
    recommendations.push('✓ استراتيجية ناجحة جداً - يوصى بتكرارها');
  }

  return recommendations;
}

function identifyRiskFactors(scenario: SimulationScenario): string[] {
  const risks: string[] = [];

  if (scenario.predictedDensity >= 85) {
    risks.push('كثافة حشود عالية جداً قد تؤثر على السلامة');
  }

  if (scenario.weather === 'rain') {
    risks.push('الطقس الممطر قد يزيد الازدحام والحوادث');
  }

  if (scenario.matchType === 'derby') {
    risks.push('مباراة ديربي قد تشهد سلوكيات عدوانية');
  }

  if (scenario.estimatedWaitTime > 12) {
    risks.push('أوقات انتظار طويلة قد تؤثر على الرضا');
  }

  return risks;
}

function identifySuccessFactors(scenario: SimulationScenario): string[] {
  const factors: string[] = [];

  if (scenario.safetyScore >= 85) {
    factors.push('مستويات سلامة عالية جداً');
  }

  if (scenario.fanSatisfaction >= 85) {
    factors.push('رضا الجماهير مرتفع جداً');
  }

  if (scenario.expectedRevenue >= 400000) {
    factors.push('إيرادات قوية جداً');
  }

  if (scenario.estimatedWaitTime <= 8) {
    factors.push('أوقات انتظار قصيرة جداً');
  }

  return factors;
}
