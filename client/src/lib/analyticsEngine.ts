/**
 * Advanced Analytics Engine
 * Smart Entry & CrowdFlow
 * 
 * Comprehensive analytics for crowd behavior, revenue, and operational efficiency
 */

export interface CrowdBehaviorMetrics {
  peakHours: Array<{ hour: number; density: number }>;
  averageDwellTime: number; // minutes
  entryPatterns: Record<string, number>; // gate -> percentage
  exitPatterns: Record<string, number>;
  repeatVisitors: number; // percentage
  firstTimeVisitors: number; // percentage
  crowdFlowEfficiency: number; // 0-100
  bottleneckFrequency: Record<string, number>; // location -> count
}

export interface RevenueAnalytics {
  totalRevenue: number;
  averageTicketPrice: number;
  revenueByGate: Record<string, number>;
  revenueByTimeSlot: Record<string, number>;
  dynamicPricingImpact: number; // percentage increase
  discountsApplied: number;
  revenueTrend: Array<{ date: string; revenue: number }>;
  priceElasticity: number; // demand sensitivity to price changes
}

export interface OperationalEfficiency {
  gateUtilization: Record<string, number>; // gate -> percentage
  corridorEfficiency: Record<string, number>; // corridor -> percentage
  averageWaitTime: number; // minutes
  maxWaitTime: number;
  throughputPerGate: Record<string, number>; // people per minute
  operationalCost: number;
  costPerVisitor: number;
  efficiencyScore: number; // 0-100
}

export interface VisitorSegmentation {
  byArrivalTime: Record<string, number>; // time slot -> count
  byGate: Record<string, number>;
  byCorridor: Record<string, number>;
  byDuration: Record<string, number>; // duration range -> count
  byFrequency: Record<string, number>; // first-time, regular, frequent
  demographics: {
    peakAge: string;
    genderRatio: { male: number; female: number };
    groupSize: number; // average
  };
}

export interface PredictiveInsights {
  predictedPeakTime: string;
  predictedTotalVisitors: number;
  recommendedGateAllocation: Record<string, number>;
  recommendedPricing: Record<string, number>;
  riskFactors: Array<{ factor: string; severity: 'low' | 'medium' | 'high' }>;
  opportunities: string[];
}

class AnalyticsEngine {
  private crowdData!: CrowdBehaviorMetrics;
  private revenueData!: RevenueAnalytics;
  private efficiencyData!: OperationalEfficiency;
  private segmentationData!: VisitorSegmentation;
  private historicalData: Map<string, any> = new Map();

  constructor() {
    this.initializeAnalytics();
  }

  private initializeAnalytics() {
    // Initialize crowd behavior metrics
    this.crowdData = {
      peakHours: [
        { hour: 14, density: 45 },
        { hour: 15, density: 65 },
        { hour: 16, density: 78 },
        { hour: 17, density: 92 },
        { hour: 18, density: 88 },
        { hour: 19, density: 72 },
        { hour: 20, density: 55 },
      ],
      averageDwellTime: 145,
      entryPatterns: {
        'gate-1': 28,
        'gate-2': 22,
        'gate-3': 25,
        'gate-4': 25,
      },
      exitPatterns: {
        'gate-1': 26,
        'gate-2': 24,
        'gate-3': 27,
        'gate-4': 23,
      },
      repeatVisitors: 35,
      firstTimeVisitors: 65,
      crowdFlowEfficiency: 78,
      bottleneckFrequency: {
        'corridor-2-segment-3': 12,
        'corridor-4-segment-2': 8,
        'amenity-area-3': 5,
      },
    };

    // Initialize revenue analytics
    this.revenueData = {
      totalRevenue: 125000,
      averageTicketPrice: 45,
      revenueByGate: {
        'gate-1': 35000,
        'gate-2': 28000,
        'gate-3': 32000,
        'gate-4': 30000,
      },
      revenueByTimeSlot: {
        'morning': 15000,
        'afternoon': 45000,
        'evening': 65000,
      },
      dynamicPricingImpact: 18,
      discountsApplied: 8500,
      revenueTrend: [
        { date: '2026-03-01', revenue: 98000 },
        { date: '2026-03-02', revenue: 112000 },
        { date: '2026-03-03', revenue: 125000 },
        { date: '2026-03-04', revenue: 118000 },
        { date: '2026-03-05', revenue: 132000 },
      ],
      priceElasticity: -0.85,
    };

    // Initialize operational efficiency
    this.efficiencyData = {
      gateUtilization: {
        'gate-1': 65,
        'gate-2': 78,
        'gate-3': 45,
        'gate-4': 92,
      },
      corridorEfficiency: {
        'corridor-1': 78,
        'corridor-2': 65,
        'corridor-3': 88,
        'corridor-4': 52,
      },
      averageWaitTime: 8.5,
      maxWaitTime: 22,
      throughputPerGate: {
        'gate-1': 45,
        'gate-2': 38,
        'gate-3': 52,
        'gate-4': 32,
      },
      operationalCost: 8500,
      costPerVisitor: 3.4,
      efficiencyScore: 76,
    };

    // Initialize visitor segmentation
    this.segmentationData = {
      byArrivalTime: {
        'morning': 1200,
        'afternoon': 1800,
        'evening': 2100,
      },
      byGate: {
        'gate-1': 1050,
        'gate-2': 880,
        'gate-3': 1000,
        'gate-4': 1170,
      },
      byCorridor: {
        'corridor-1': 1500,
        'corridor-2': 1200,
        'corridor-3': 1000,
        'corridor-4': 1400,
      },
      byDuration: {
        'under-1h': 800,
        '1-2h': 1500,
        '2-3h': 1800,
        'over-3h': 1000,
      },
      byFrequency: {
        'first-time': 2600,
        'regular': 1400,
        'frequent': 1100,
      },
      demographics: {
        peakAge: '25-35',
        genderRatio: { male: 55, female: 45 },
        groupSize: 3.2,
      },
    };
  }

  // Get crowd behavior metrics
  getCrowdBehavior(): CrowdBehaviorMetrics {
    return this.crowdData;
  }

  // Get revenue analytics
  getRevenueAnalytics(): RevenueAnalytics {
    return this.revenueData;
  }

  // Get operational efficiency
  getOperationalEfficiency(): OperationalEfficiency {
    return this.efficiencyData;
  }

  // Get visitor segmentation
  getVisitorSegmentation(): VisitorSegmentation {
    return this.segmentationData;
  }

  // Get predictive insights
  getPredictiveInsights(): PredictiveInsights {
    const peakHour = this.crowdData.peakHours.reduce((prev, current) =>
      prev.density > current.density ? prev : current
    );

    return {
      predictedPeakTime: `${peakHour.hour}:00`,
      predictedTotalVisitors: 5100,
      recommendedGateAllocation: {
        'gate-1': 25,
        'gate-2': 20,
        'gate-3': 30,
        'gate-4': 25,
      },
      recommendedPricing: {
        'morning': 35,
        'afternoon': 45,
        'evening': 55,
      },
      riskFactors: [
        { factor: 'الازدحام الشديد في الممر 4', severity: 'high' },
        { factor: 'انخفاض الكفاءة في البوابة 4', severity: 'medium' },
        { factor: 'وقت انتظار متزايد', severity: 'medium' },
      ],
      opportunities: [
        'زيادة الأسعار في ساعات الذروة لتحسين الإيرادات',
        'توزيع أفضل للجماهير على البوابات الأقل استخداماً',
        'تحسين كفاءة الممر 4 بإضافة مسارات بديلة',
      ],
    };
  }

  // Get comparative analysis
  getComparativeAnalysis(period1: string, period2: string) {
    return {
      period1,
      period2,
      revenueChange: 12.5, // percentage
      visitorChange: 8.3,
      efficiencyChange: 5.2,
      waitTimeChange: -3.1, // negative is good
      satisfactionChange: 7.8,
    };
  }

  // Get performance trends
  getPerformanceTrends(days: number = 30) {
    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      trends.push({
        date: date.toISOString().split('T')[0],
        revenue: 100000 + Math.random() * 50000,
        visitors: 4000 + Math.random() * 2000,
        efficiency: 70 + Math.random() * 20,
        satisfaction: 75 + Math.random() * 20,
      });
    }
    return trends;
  }

  // Get KPI summary
  getKPISummary() {
    return {
      totalVisitors: 5100,
      totalRevenue: 125000,
      averageTicketPrice: 45,
      operationalCost: 8500,
      netProfit: 116500,
      profitMargin: 93.2,
      efficiencyScore: 76,
      satisfactionScore: 82,
      repeatVisitorRate: 35,
      averageWaitTime: 8.5,
      peakHour: '17:00',
      bottleneckCount: 3,
    };
  }

  // Get report summary
  getReportSummary() {
    return {
      generatedAt: new Date().toISOString(),
      period: 'Today',
      kpis: this.getKPISummary(),
      crowdBehavior: this.getCrowdBehavior(),
      revenue: this.getRevenueAnalytics(),
      efficiency: this.getOperationalEfficiency(),
      insights: this.getPredictiveInsights(),
    };
  }

  // Update analytics with new data
  updateAnalytics(newData: Partial<{
    crowdData: CrowdBehaviorMetrics;
    revenueData: RevenueAnalytics;
    efficiencyData: OperationalEfficiency;
  }>) {
    if (newData.crowdData) this.crowdData = newData.crowdData;
    if (newData.revenueData) this.revenueData = newData.revenueData;
    if (newData.efficiencyData) this.efficiencyData = newData.efficiencyData;
  }

  // Get anomaly detection
  getAnomalies() {
    return [
      {
        type: 'crowd_surge',
        location: 'corridor-2',
        severity: 'high',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        recommendation: 'فتح بوابات إضافية أو إعادة توجيه الجماهير',
      },
      {
        type: 'low_gate_utilization',
        location: 'gate-3',
        severity: 'medium',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        recommendation: 'نقل الجماهير من البوابات المزدحمة',
      },
      {
        type: 'revenue_anomaly',
        location: 'pricing',
        severity: 'low',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        recommendation: 'مراجعة استراتيجية التسعير الحالية',
      },
    ];
  }
}

export const analyticsEngine = new AnalyticsEngine();
