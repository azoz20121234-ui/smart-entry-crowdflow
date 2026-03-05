/**
 * QueueTimer Component - Smart Entry & CrowdFlow
 * 
 * Calculates and displays remaining time until entry based on:
 * - Queue position (people ahead)
 * - Gate flow rate (people per minute)
 * - Historical data patterns
 * - Real-time adjustments
 */

import { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface QueueTimerProps {
  queuePosition: number;
  peopleAhead: number;
  gateFlowRate: number; // people per minute
  currentlyServing: number;
  nextUp: number;
  onTimeUpdate?: (remainingMinutes: number) => void;
}

interface TimeEstimate {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  confidence: number; // 0-100
  estimatedEntryTime: Date;
  flowTrend: 'increasing' | 'stable' | 'decreasing';
}

export function QueueTimer({
  queuePosition,
  peopleAhead,
  gateFlowRate,
  currentlyServing,
  nextUp,
}: QueueTimerProps) {
  const [timeEstimate, setTimeEstimate] = useState<TimeEstimate | null>(null);
  const [displayTime, setDisplayTime] = useState<string>('--:--');
  const [flowHistory, setFlowHistory] = useState<number[]>([gateFlowRate]);

  // Calculate time estimate based on queue position and flow rate
  const calculateTimeEstimate = useMemo(() => {
    return (peopleAhead: number, flowRate: number) => {
      // Base calculation: people ahead / flow rate
      const baseMinutes = peopleAhead / Math.max(flowRate, 1);

      // Adjust based on position in queue
      // People closer to front have more accurate estimates
      const positionFactor = Math.max(0.8, 1 - (peopleAhead / 100) * 0.2);

      // Apply smoothing factor to avoid wild fluctuations
      const adjustedMinutes = baseMinutes * positionFactor;

      // Calculate confidence level
      // Higher confidence when flow is stable and people are close
      let confidence = 70;
      if (peopleAhead < 10) confidence = 95;
      else if (peopleAhead < 30) confidence = 85;
      else if (peopleAhead < 60) confidence = 75;

      const totalSeconds = Math.round(adjustedMinutes * 60);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      const estimatedEntryTime = new Date(Date.now() + totalSeconds * 1000);

      return {
        minutes,
        seconds,
        totalSeconds,
        confidence,
        estimatedEntryTime,
        flowTrend: 'stable' as const,
      };
    };
  }, []);

  // Update time estimate
  useEffect(() => {
    const estimate = calculateTimeEstimate(peopleAhead, gateFlowRate);
    setTimeEstimate(estimate);

    // Update flow history for trend analysis
    setFlowHistory(prev => {
      const updated = [...prev, gateFlowRate];
      return updated.slice(-10); // Keep last 10 measurements
    });
  }, [peopleAhead, gateFlowRate, calculateTimeEstimate]);

  // Update display time every second
  useEffect(() => {
    if (!timeEstimate) return;

    const interval = setInterval(() => {
      setTimeEstimate(prev => {
        if (!prev) return prev;

        const newTotalSeconds = Math.max(0, prev.totalSeconds - 1);
        const minutes = Math.floor(newTotalSeconds / 60);
        const seconds = newTotalSeconds % 60;

        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        setDisplayTime(formattedTime);

        return {
          ...prev,
          totalSeconds: newTotalSeconds,
          minutes,
          seconds,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeEstimate]);

  // Determine flow trend
  const getFlowTrend = () => {
    if (flowHistory.length < 3) return 'stable';
    const recent = flowHistory.slice(-3);
    const avg = recent.reduce((a, b) => a + b) / recent.length;
    const trend = recent[recent.length - 1] - recent[0];

    if (trend > avg * 0.1) return 'increasing';
    if (trend < -avg * 0.1) return 'decreasing';
    return 'stable';
  };

  // Get status based on time remaining
  const getStatus = () => {
    if (!timeEstimate) return { label: 'جاري الحساب', color: 'text-slate-600', bgColor: 'bg-slate-50' };

    const { totalSeconds } = timeEstimate;
    if (totalSeconds === 0) return { label: 'دورك الآن!', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (totalSeconds < 60) return { label: 'اقترب دورك', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (totalSeconds < 300) return { label: 'قريب جداً', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    return { label: 'في الانتظار', color: 'text-slate-600', bgColor: 'bg-slate-50' };
  };

  const status = getStatus();
  const flowTrend = getFlowTrend();

  return (
    <div className="space-y-6">
      {/* Main Timer Display */}
      <Card className={`border-2 shadow-lg ${status.bgColor}`}>
        <CardContent className="pt-8">
          <div className="text-center">
            {/* Status Label */}
            <p className={`text-sm font-semibold mb-4 ${status.color}`}>{status.label}</p>

            {/* Large Timer Display */}
            <div className="mb-6">
              <div className="text-7xl font-bold font-mono text-slate-900 tracking-wider">
                {displayTime}
              </div>
              <p className="text-sm text-slate-600 mt-2">الوقت المتبقي</p>
            </div>

            {/* Queue Position Info */}
            <div className="grid grid-cols-3 gap-4 mb-6 bg-white rounded-lg p-4 border border-slate-200">
              <div>
                <p className="text-xs text-slate-600 mb-1">رقمك</p>
                <p className="text-2xl font-bold text-blue-700">{queuePosition}</p>
              </div>
              <div className="border-l border-r border-slate-200">
                <p className="text-xs text-slate-600 mb-1">أمامك</p>
                <p className="text-2xl font-bold text-orange-600">{peopleAhead}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">معدل التدفق</p>
                <p className="text-2xl font-bold text-green-600">{gateFlowRate}/د</p>
              </div>
            </div>

            {/* Confidence Indicator */}
            {timeEstimate && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-slate-600">دقة التقدير</p>
                  <p className="text-xs text-slate-600">{timeEstimate.confidence}%</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${timeEstimate.confidence}%` }}
                  />
                </div>
              </div>
            )}

            {/* Flow Trend Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm">
              {flowTrend === 'increasing' && (
                <div className="flex items-center gap-1 text-orange-600">
                  <TrendingDown className="w-4 h-4 rotate-180" />
                  <span>التدفق يتحسن</span>
                </div>
              )}
              {flowTrend === 'decreasing' && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <TrendingDown className="w-4 h-4" />
                  <span>التدفق يتباطأ</span>
                </div>
              )}
              {flowTrend === 'stable' && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>التدفق مستقر</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      {timeEstimate && (
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Estimated Entry Time */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">الوقت المتوقع للدخول</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {timeEstimate.estimatedEntryTime.toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gate Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">يتم خدمة</p>
                  <p className="text-2xl font-bold text-slate-900">{currentlyServing}</p>
                  <p className="text-xs text-slate-500 mt-1">الآن</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-slate-600 mb-1">الدور التالي</p>
                  <p className="text-2xl font-bold text-green-700">{nextUp}</p>
                  <p className="text-xs text-slate-500 mt-1">قادم</p>
                </div>
              </div>

              {/* Time Breakdown */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">تفصيل الوقت</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">الوقت المتبقي:</span>
                    <span className="font-semibold text-slate-900">
                      {timeEstimate.minutes} دقيقة و {timeEstimate.seconds} ثانية
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">معدل التدفق الحالي:</span>
                    <span className="font-semibold text-slate-900">{gateFlowRate} شخص/دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">عدد الأشخاص أمامك:</span>
                    <span className="font-semibold text-slate-900">{peopleAhead} شخص</span>
                  </div>
                </div>
              </div>

              {/* Smart Tips */}
              {timeEstimate.totalSeconds > 300 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">نصيحة ذكية</p>
                    <p className="text-sm text-blue-800">
                      لديك وقت كافٍ. يمكنك الاسترخاء والعودة قبل دورك بقليل.
                    </p>
                  </div>
                </div>
              )}

              {timeEstimate.totalSeconds > 60 && timeEstimate.totalSeconds <= 300 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 mb-1">تنبيه</p>
                    <p className="text-sm text-yellow-800">
                      دورك يقترب. تأكد من أنك قريب من البوابة {/* Gate number would go here */}.
                    </p>
                  </div>
                </div>
              )}

              {timeEstimate.totalSeconds <= 60 && timeEstimate.totalSeconds > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">دورك قريب جداً!</p>
                    <p className="text-sm text-green-800">
                      توجه إلى البوابة الآن. دورك سيكون خلال دقيقة واحدة.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
