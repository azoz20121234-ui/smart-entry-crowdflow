/**
 * Crowd Prediction Panel Component - Smart Entry & CrowdFlow
 * 
 * Displays crowd predictions and safety metrics
 * Shows alerts and recommendations
 */

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Shield, Clock, Users, Zap } from 'lucide-react';

interface PredictionData {
  time: string;
  predictedDensity: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SafetyData {
  gateId: number;
  density: number;
  riskLevel: 'safe' | 'caution' | 'danger' | 'critical';
}

interface CrowdPredictionPanelProps {
  predictions: PredictionData[];
  currentDensity: number;
  safetyMetrics: SafetyData[];
  alerts: string[];
  recommendations: string[];
  peakTimeEstimate: Date;
  clearTimeEstimate: Date;
}

export function CrowdPredictionPanel({
  predictions,
  currentDensity,
  safetyMetrics,
  alerts,
  recommendations,
  peakTimeEstimate,
  clearTimeEstimate,
}: CrowdPredictionPanelProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' };
      case 'high':
        return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-600' };
      case 'medium':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' };
      case 'danger':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' };
      case 'caution':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' };
      default:
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' };
    }
  };

  const currentRiskColor = getRiskColor(
    currentDensity >= 85 ? 'critical' : currentDensity >= 70 ? 'high' : currentDensity >= 50 ? 'medium' : 'low'
  );

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <Alert key={idx} className="border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 mr-3">{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Current Status */}
      <Card className={`border-2 shadow-lg ${currentRiskColor.bg} ${currentRiskColor.border}`}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Density */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">الكثافة الحالية</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={currentRiskColor.icon.replace('text-', 'stroke-')}
                      strokeWidth="8"
                      strokeDasharray={`${(currentDensity / 100) * 282.7} 282.7`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-2xl font-bold text-slate-900">{currentDensity}%</p>
                  </div>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${currentRiskColor.text}`}>
                    {currentDensity >= 85
                      ? 'حرج'
                      : currentDensity >= 70
                        ? 'مرتفع'
                        : currentDensity >= 50
                          ? 'متوسط'
                          : 'منخفض'}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">مستوى المخاطرة</p>
                </div>
              </div>
            </div>

            {/* Time Estimates */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">التوقعات الزمنية</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">وقت الذروة المتوقع</p>
                  <p className="text-lg font-bold text-slate-900">
                    {peakTimeEstimate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">وقت التصفية المتوقع</p>
                  <p className="text-lg font-bold text-slate-900">
                    {clearTimeEstimate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Score */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">درجة السلامة</h3>
              <div className="bg-white rounded-lg p-6 border border-slate-200 text-center">
                <Shield className={`w-12 h-12 mx-auto mb-3 ${currentRiskColor.icon}`} />
                <p className="text-3xl font-bold text-slate-900">
                  {Math.max(0, 100 - currentDensity)}
                </p>
                <p className="text-sm text-slate-600 mt-2">من 100</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            التنبؤ بالكثافة (الـ 30 دقيقة القادمة)
          </CardTitle>
          <CardDescription>توقعات الكثافة البشرية مع مستويات الثقة</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={predictions}>
              <defs>
                <linearGradient id="densityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value) => [value, 'الكثافة %']}
              />
              <Area
                type="monotone"
                dataKey="predictedDensity"
                stroke="#1e3a8a"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#densityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Safety Metrics by Gate */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            مؤشرات السلامة حسب البوابة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {safetyMetrics.map(metric => {
              const colors = getRiskColor(metric.riskLevel);
              return (
                <div key={metric.gateId} className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}>
                  <h4 className="font-bold text-slate-900 mb-3">البوابة {metric.gateId}</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">الكثافة</p>
                      <p className={`text-2xl font-bold ${colors.text}`}>{metric.density}%</p>
                    </div>
                    <div className="w-full bg-slate-300 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          metric.riskLevel === 'critical'
                            ? 'bg-red-600'
                            : metric.riskLevel === 'danger'
                              ? 'bg-orange-600'
                              : metric.riskLevel === 'caution'
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                        }`}
                        style={{ width: `${metric.density}%` }}
                      />
                    </div>
                    <p className={`text-xs font-semibold ${colors.text}`}>
                      {metric.riskLevel === 'critical'
                        ? 'حرج'
                        : metric.riskLevel === 'danger'
                          ? 'خطر'
                          : metric.riskLevel === 'caution'
                            ? 'تحذير'
                            : 'آمن'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="shadow-md bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              التوصيات الذكية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-700 flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-0.5">→</span>
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confidence Indicator */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-sm">مستوى الثقة في التنبؤات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {predictions.slice(-3).map((pred, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-slate-600">{pred.time}</p>
                  <p className="text-sm font-semibold text-slate-900">{pred.confidence}%</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-full"
                    style={{ width: `${pred.confidence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
