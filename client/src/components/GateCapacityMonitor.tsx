/**
 * Gate Capacity Monitor Component
 * Smart Entry & CrowdFlow - CrowdOS Stadium Brain
 * 
 * وحدة مراقبة سعة البوابات مع عرض التدفق ومستوى الخطورة
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface Gate {
  id: number;
  name: string;
  capacity: number;
  flow: number;
  risk: 'green' | 'yellow' | 'red';
  utilization: number;
}

const GATES_DATA: Gate[] = [
  {
    id: 1,
    name: 'البوابة 1',
    capacity: 1200,
    flow: 900,
    risk: 'green',
    utilization: 75,
  },
  {
    id: 2,
    name: 'البوابة 2',
    capacity: 1200,
    flow: 2100,
    risk: 'red',
    utilization: 175,
  },
  {
    id: 3,
    name: 'البوابة 3',
    capacity: 900,
    flow: 600,
    risk: 'green',
    utilization: 67,
  },
  {
    id: 4,
    name: 'البوابة 4',
    capacity: 1000,
    flow: 750,
    risk: 'yellow',
    utilization: 75,
  },
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'green':
      return { bg: '#10b981', light: '#d1fae5', text: '#065f46' };
    case 'yellow':
      return { bg: '#f59e0b', light: '#fef3c7', text: '#92400e' };
    case 'red':
      return { bg: '#ef4444', light: '#fee2e2', text: '#991b1b' };
    default:
      return { bg: '#6b7280', light: '#f3f4f6', text: '#1f2937' };
  }
};

const getRiskLabel = (risk: string) => {
  switch (risk) {
    case 'green':
      return 'طبيعي';
    case 'yellow':
      return 'تحذير';
    case 'red':
      return 'حرج';
    default:
      return 'غير معروف';
  }
};

export function GateCapacityMonitor() {
  const totalCapacity = GATES_DATA.reduce((sum, g) => sum + g.capacity, 0);
  const totalFlow = GATES_DATA.reduce((sum, g) => sum + g.flow, 0);
  const criticalGates = GATES_DATA.filter(g => g.risk === 'red').length;
  const warningGates = GATES_DATA.filter(g => g.risk === 'yellow').length;

  return (
    <Card className="shadow-lg border-amber-900/20 bg-slate-900/50">
      <CardHeader className="border-b border-amber-900/30">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
              مراقبة سعة البوابات
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Gate Capacity Monitor - مراقبة فعلية لسعة كل بوابة والتدفق الحالي
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">إجمالي التدفق</p>
            <p className="text-2xl font-bold text-amber-400">{totalFlow.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Critical Alert */}
        {criticalGates > 0 && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-300">تنبيه حرج</p>
              <p className="text-sm text-red-200 mt-1">
                {criticalGates} بوابة تعاني من ازدحام شديد. يرجى توجيه الجماهير إلى البوابات الأخرى فوراً.
              </p>
            </div>
          </div>
        )}

        {/* Gates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {GATES_DATA.map((gate) => {
            const colors = getRiskColor(gate.risk);
            const utilizationPercent = (gate.flow / gate.capacity) * 100;

            return (
              <div
                key={gate.id}
                className="rounded-lg border-2 p-4 transition-all duration-300 hover:shadow-lg"
                style={{
                  borderColor: colors.bg,
                  backgroundColor: colors.light,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold" style={{ color: colors.text }}>
                    {gate.name}
                  </h3>
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: colors.bg }}
                  ></div>
                </div>

                {/* Capacity Info */}
                <div className="space-y-3 mb-4 pb-4 border-b" style={{ borderColor: colors.bg }}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold" style={{ color: colors.text }}>
                        السعة
                      </p>
                      <p className="text-xs font-bold" style={{ color: colors.bg }}>
                        {gate.capacity.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold" style={{ color: colors.text }}>
                        التدفق الحالي
                      </p>
                      <p className="text-xs font-bold" style={{ color: colors.bg }}>
                        {gate.flow.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold" style={{ color: colors.text }}>
                      الاستخدام
                    </p>
                    <p className="text-xs font-bold" style={{ color: colors.bg }}>
                      {utilizationPercent.toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-full bg-slate-300 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(utilizationPercent, 100)}%`,
                        backgroundColor: colors.bg,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Risk Status */}
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ backgroundColor: colors.bg }}
                >
                  <p className="text-xs font-semibold text-white">
                    الحالة: {getRiskLabel(gate.risk)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">إجمالي السعة</p>
            <p className="text-2xl font-bold text-blue-400">
              {totalCapacity.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">شخص</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">معدل الاستخدام</p>
            <p className="text-2xl font-bold text-purple-400">
              {((totalFlow / totalCapacity) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">من الإجمالي</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">البوابات المتأثرة</p>
            <p className="text-2xl font-bold text-red-400">
              {criticalGates + warningGates}
            </p>
            <p className="text-xs text-slate-500 mt-1">تحتاج مراقبة</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-start gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
            <p className="text-sm font-semibold text-slate-300">التوصيات التشغيلية:</p>
          </div>
          <ul className="space-y-2 text-sm text-slate-400">
            {criticalGates > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>إعادة توجيه فوري للجماهير من البوابات الحرجة إلى البوابات الأخرى</span>
              </li>
            )}
            {warningGates > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>زيادة الموظفين في البوابات التي بها تحذير</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>مراقبة مستمرة لمعدلات التدفق وتعديل التوجيه حسب الحاجة</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
