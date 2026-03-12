/**
 * Fan Arrival Simulator Component
 * Smart Entry & CrowdFlow - CrowdOS Stadium Brain
 * 
 * يعرض توقع وصول الجماهير قبل المباراة على شكل مخطط زمني احترافي
 */

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ArrivalData {
  timePoint: string;
  label: string;
  count: number;
  cumulative: number;
  isPeak: boolean;
}

const ARRIVAL_DATA: ArrivalData[] = [
  { timePoint: 'T-90', label: '90 دقيقة قبل', count: 4000, cumulative: 4000, isPeak: false },
  { timePoint: 'T-60', label: '60 دقيقة قبل', count: 12000, cumulative: 16000, isPeak: false },
  { timePoint: 'T-45', label: '45 دقيقة قبل', count: 18000, cumulative: 34000, isPeak: true },
  { timePoint: 'T-30', label: '30 دقيقة قبل', count: 10000, cumulative: 44000, isPeak: false },
  { timePoint: 'T-15', label: '15 دقيقة قبل', count: 6000, cumulative: 50000, isPeak: false },
  { timePoint: 'Kickoff', label: 'بداية المباراة', count: 2000, cumulative: 52000, isPeak: false },
];

export function FanArrivalSimulator() {
  const [animatedData, setAnimatedData] = useState<ArrivalData[]>([]);
  const [peakWindow, setPeakWindow] = useState<string>('T-45 (45 دقيقة قبل الكيك أوف)');

  useEffect(() => {
    // Animate data loading
    ARRIVAL_DATA.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => [...prev, item]);
      }, index * 150);
    });
  }, []);

  const getBarColor = (isPeak: boolean) => {
    return isPeak ? '#ef4444' : '#3b82f6';
  };

  const peakData = ARRIVAL_DATA.find(d => d.isPeak);
  const totalExpected = ARRIVAL_DATA[ARRIVAL_DATA.length - 1].cumulative;

  return (
    <Card className="shadow-lg border-blue-900/20 bg-slate-900/50">
      <CardHeader className="border-b border-blue-900/30">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              محاكي وصول الجماهير
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Fan Arrival Simulator - توقع وصول الجماهير قبل المباراة
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">إجمالي المتوقع</p>
            <p className="text-2xl font-bold text-green-400">{totalExpected.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Peak Arrival Window Alert */}
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">Peak Arrival Window</p>
            <p className="text-sm text-red-200 mt-1">
              {peakWindow} - متوقع وصول <strong>{peakData?.count.toLocaleString()}</strong> مشجع
            </p>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={animatedData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="timePoint" 
                stroke="#94a3b8"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
                formatter={(value) => value.toLocaleString()}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={800}>
                {animatedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(entry.isPeak)}
                    opacity={entry.isPeak ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ARRIVAL_DATA.map((item, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-lg border transition-all ${
                item.isPeak 
                  ? 'bg-red-900/30 border-red-700/50 ring-1 ring-red-500/50' 
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              <p className={`text-xs font-semibold ${item.isPeak ? 'text-red-300' : 'text-slate-400'}`}>
                {item.timePoint}
              </p>
              <p className="text-sm text-slate-300 mt-1">{item.label}</p>
              <p className={`text-lg font-bold mt-2 ${item.isPeak ? 'text-red-400' : 'text-blue-400'}`}>
                {item.count.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                الإجمالي: {item.cumulative.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
          <div className="bg-blue-900/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">أعلى وصول</p>
            <p className="text-2xl font-bold text-blue-400">
              {Math.max(...ARRIVAL_DATA.map(d => d.count)).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">في الفترة T-45</p>
          </div>

          <div className="bg-green-900/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">متوسط الوصول</p>
            <p className="text-2xl font-bold text-green-400">
              {Math.round(totalExpected / ARRIVAL_DATA.length).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">لكل فترة زمنية</p>
          </div>

          <div className="bg-purple-900/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">وقت الذروة</p>
            <p className="text-2xl font-bold text-purple-400">45 دقيقة</p>
            <p className="text-xs text-slate-500 mt-1">قبل بداية المباراة</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <p className="text-sm font-semibold text-slate-300 mb-3">التوصيات التشغيلية:</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>تفعيل جميع البوابات الأربع في الفترة T-45 لاستيعاب الذروة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>زيادة عدد الموظفين في ساعة الذروة (T-60 إلى T-30)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>تجهيز مناطق الانتظار الإضافية قبل T-60</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
