/**
 * Crowd DNA Panel Component - Smart Entry & CrowdFlow
 * 
 * Displays crowd behavior patterns and insights
 * Shows historical analysis and behavioral profiles
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, Brain, Zap, BarChart3, Activity } from 'lucide-react';

interface BehaviorProfile {
  matchType: string;
  avgCrowdDensity: number;
  peakHourStart: number;
  peakHourEnd: number;
  bottleneckGates: number[];
  recommendedCapacity: number;
  riskFactors: string[];
  successFactors: string[];
  historicalAccuracy: number;
}

interface CrowdDNAPanelProps {
  profiles: Map<string, BehaviorProfile>;
  insights: string[];
  totalMatches: number;
  anomalies: Array<{
    date: Date;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export function CrowdDNAPanel({ profiles, insights, totalMatches, anomalies }: CrowdDNAPanelProps) {
  const profileArray = Array.from(profiles.values());

  const comparisonData = profileArray.map(p => ({
    matchType: p.matchType,
    'الكثافة %': p.avgCrowdDensity,
    'السعة الموصى بها': Math.round(p.recommendedCapacity / 100),
    'دقة التنبؤ': Math.round(p.historicalAccuracy),
  }));

  const matchTypeLabels: Record<string, string> = {
    derby: 'ديربي',
    cup: 'كأس',
    league: 'دوري',
    friendly: 'ودي',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <CardTitle>بصمة الحشود (Crowd DNA)</CardTitle>
              <CardDescription>تحليل سلوك الجماهير عبر {totalMatches} مباراة تاريخية</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Insights */}
      {insights.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              الرؤى الرئيسية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-slate-800">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Behavior Profiles Comparison */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            مقارنة ملفات السلوك
          </CardTitle>
          <CardDescription>متوسط الكثافة والسعة الموصى بها لكل نوع مباراة</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="matchType" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="الكثافة %" fill="#1e3a8a" />
              <Bar dataKey="السعة الموصى بها" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profileArray.map(profile => (
          <Card key={profile.matchType} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{matchTypeLabels[profile.matchType] || profile.matchType}</CardTitle>
              <CardDescription>ملف السلوك التفصيلي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-slate-600 mb-1">متوسط الكثافة</p>
                  <p className="text-2xl font-bold text-blue-700">{profile.avgCrowdDensity}%</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-slate-600 mb-1">دقة التنبؤ</p>
                  <p className="text-2xl font-bold text-green-700">{Math.round(profile.historicalAccuracy)}%</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-slate-600 mb-1">ساعات الذروة</p>
                  <p className="text-lg font-bold text-orange-700">
                    {profile.peakHourStart}:00 - {profile.peakHourEnd}:00
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-slate-600 mb-1">السعة الموصى بها</p>
                  <p className="text-lg font-bold text-purple-700">{Math.round(profile.recommendedCapacity)} شخص</p>
                </div>
              </div>

              {/* Bottleneck Gates */}
              {profile.bottleneckGates.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">البوابات المزدحمة</p>
                  <div className="flex gap-2">
                    {profile.bottleneckGates.map(gate => (
                      <span key={gate} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        البوابة {gate}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {profile.riskFactors.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">عوامل المخاطرة</p>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {profile.riskFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Factors */}
              {profile.successFactors.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">عوامل النجاح</p>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {profile.successFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              الحالات الشاذة المسجلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies.map((anomaly, idx) => (
                <Alert
                  key={idx}
                  className={`border-2 ${
                    anomaly.severity === 'high'
                      ? 'border-red-200 bg-red-50'
                      : anomaly.severity === 'medium'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <AlertCircle
                    className={`h-4 w-4 ${
                      anomaly.severity === 'high'
                        ? 'text-red-600'
                        : anomaly.severity === 'medium'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                    }`}
                  />
                  <div className="mr-3">
                    <AlertDescription
                      className={
                        anomaly.severity === 'high'
                          ? 'text-red-800'
                          : anomaly.severity === 'medium'
                            ? 'text-yellow-800'
                            : 'text-blue-800'
                      }
                    >
                      {anomaly.description}
                    </AlertDescription>
                    <p className="text-xs mt-1 opacity-75">
                      {anomaly.date.toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pattern Analysis */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600" />
            تحليل الأنماط
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <h4 className="font-semibold text-slate-900 mb-2">أنماط أيام الأسبوع</h4>
              <p className="text-sm text-slate-700">
                نهاية الأسبوع تشهد ازدحاماً أعلى بـ 10-15% مقارنة بأيام الأسبوع. أيام الأربعاء والخميس تسجل أقل كثافة.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-slate-900 mb-2">تأثير الطقس</h4>
              <p className="text-sm text-slate-700">
                المطر يزيد الكثافة بـ 15% في المتوسط. الحرارة العالية تقلل الكثافة بـ 10%. البرد يقلل الكثافة بـ 5%.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-slate-900 mb-2">أنماط أنواع المباريات</h4>
              <p className="text-sm text-slate-700">
                مباريات الديربي: 92% كثافة | مباريات الكأس: 78% | مباريات الدوري: 65% | مباريات ودية: 42%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
