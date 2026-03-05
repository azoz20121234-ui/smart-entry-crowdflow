import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles } from 'lucide-react';

export interface AIDecisionRecommendation {
  id: string;
  title: string;
  reasoning: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  expectedImpact: string;
}

interface AIDecisionPanelProps {
  title?: string;
  description?: string;
  recommendations: AIDecisionRecommendation[];
  onApplyRecommendation?: (recommendationId: string) => void;
}

function getPriorityMeta(priority: AIDecisionRecommendation['priority']) {
  if (priority === 'high') {
    return { label: 'أولوية عالية', className: 'bg-red-100 text-red-700 border-red-200' };
  }
  if (priority === 'medium') {
    return { label: 'أولوية متوسطة', className: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
  return { label: 'أولوية منخفضة', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
}

export function AIDecisionPanel({
  title = 'مساعد القرار الذكي',
  description = 'توصيات تشغيلية مبنية على تحليل البيانات اللحظية والأنماط التاريخية.',
  recommendations,
  onApplyRecommendation,
}: AIDecisionPanelProps) {
  return (
    <Card className="shadow-md border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-700" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="text-sm text-slate-600">لا توجد توصيات حالية. النظام يعمل ضمن الحدود الطبيعية.</p>
        ) : (
          <div className="space-y-3">
            {recommendations.map(recommendation => {
              const priority = getPriorityMeta(recommendation.priority);
              return (
                <div key={recommendation.id} className="rounded-xl border border-violet-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={priority.className}>{priority.label}</Badge>
                    <Badge variant="outline" className="border-blue-200 text-blue-700">
                      ثقة {Math.round(recommendation.confidence)}%
                    </Badge>
                  </div>
                  <p className="font-semibold text-slate-900">{recommendation.title}</p>
                  <p className="text-sm text-slate-700 mt-1">{recommendation.reasoning}</p>
                  <p className="text-xs text-slate-500 mt-2">الأثر المتوقع: {recommendation.expectedImpact}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-violet-700 hover:bg-violet-800"
                      onClick={() => onApplyRecommendation?.(recommendation.id)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {recommendation.action}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

