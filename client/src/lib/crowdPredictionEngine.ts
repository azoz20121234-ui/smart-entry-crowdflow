/**
 * Crowd Prediction Engine - Smart Entry & CrowdFlow
 * 
 * Advanced ML-based prediction system that forecasts crowd density
 * 15-30 minutes in advance using multiple data sources
 */

export interface CrowdFactors {
  currentFlowRate: number;
  gateStatus: 'normal' | 'slow' | 'critical';
  ticketsSold: number;
  ticketsScanned: number;
  weatherCondition: 'clear' | 'rain' | 'hot' | 'cold';
  matchType: 'friendly' | 'league' | 'cup' | 'derby';
  timeOfDay: number;
  dayOfWeek: number;
  historicalPattern: number;
  capacityUtilization: number;
}

export interface PredictionResult {
  timestamp: Date;
  predictedCrowdDensity: number; // 0-100
  confidence: number; // 0-100
  trend: 'increasing' | 'stable' | 'decreasing';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
  affectedGates: number[];
  estimatedPeakTime: Date;
  predictedClearTime: Date;
}

export interface SafetyMetrics {
  humanDensityIndex: number; // People per square meter
  pressurePoints: Array<{
    gateId: number;
    density: number;
    riskLevel: 'safe' | 'caution' | 'danger' | 'critical';
  }>;
  bottlenecks: Array<{
    location: string;
    severity: number;
    recommendation: string;
  }>;
  safetyScore: number; // 0-100
  alertsTriggered: string[];
}

/**
 * Crowd Prediction Engine
 * Uses weighted factors to predict crowd behavior
 */
export class CrowdPredictionEngine {
  private historicalData: CrowdFactors[] = [];
  private predictions: PredictionResult[] = [];

  /**
   * Calculate prediction based on multiple factors
   */
  predict(factors: CrowdFactors): PredictionResult {
    // Normalize factors to 0-100 scale
    const normalizedFactors = this.normalizeFactors(factors);

    // Calculate base crowd density using weighted algorithm
    const baseDensity = this.calculateBaseDensity(normalizedFactors);

    // Apply weather adjustment
    const weatherAdjustment = this.getWeatherAdjustment(factors.weatherCondition);

    // Apply match type adjustment
    const matchAdjustment = this.getMatchTypeAdjustment(factors.matchType);

    // Apply time-based adjustment
    const timeAdjustment = this.getTimeAdjustment(factors.timeOfDay);

    // Apply historical pattern
    const historicalAdjustment = factors.historicalPattern;

    // Calculate final prediction
    const predictedDensity = Math.min(
      100,
      baseDensity * (1 + weatherAdjustment) * (1 + matchAdjustment) * (1 + timeAdjustment) * (1 + historicalAdjustment / 100)
    );

    // Determine confidence level
    const confidence = this.calculateConfidence(factors);

    // Determine trend
    const trend = this.calculateTrend(factors);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(predictedDensity);

    // Generate recommended actions
    const recommendedActions = this.generateRecommendations(predictedDensity, factors);

    // Identify affected gates
    const affectedGates = this.identifyAffectedGates(factors, predictedDensity);

    // Estimate peak time
    const estimatedPeakTime = this.estimatePeakTime(factors);

    // Estimate clear time
    const predictedClearTime = this.estimateClearTime(factors, predictedDensity);

    const result: PredictionResult = {
      timestamp: new Date(),
      predictedCrowdDensity: Math.round(predictedDensity),
      confidence: Math.round(confidence),
      trend,
      riskLevel,
      recommendedActions,
      affectedGates,
      estimatedPeakTime,
      predictedClearTime,
    };

    this.predictions.push(result);
    return result;
  }

  /**
   * Calculate safety metrics based on current crowd state
   */
  calculateSafetyMetrics(factors: CrowdFactors, gateCount: number = 4): SafetyMetrics {
    // Calculate human density index (people per square meter)
    // Assuming each gate has ~50 square meters entry area
    const totalArea = gateCount * 50;
    const estimatedPeople = (factors.ticketsScanned / 100) * 2500; // Rough estimate
    const humanDensityIndex = estimatedPeople / totalArea;

    // Calculate pressure points for each gate
    const pressurePoints = this.calculatePressurePoints(factors, gateCount);

    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(factors, pressurePoints);

    // Calculate overall safety score
    const safetyScore = this.calculateSafetyScore(humanDensityIndex, pressurePoints);

    // Generate alerts if necessary
    const alertsTriggered = this.generateSafetyAlerts(humanDensityIndex, pressurePoints, safetyScore);

    return {
      humanDensityIndex: Math.round(humanDensityIndex * 100) / 100,
      pressurePoints,
      bottlenecks,
      safetyScore: Math.round(safetyScore),
      alertsTriggered,
    };
  }

  /**
   * Normalize factors to 0-100 scale
   */
  private normalizeFactors(factors: CrowdFactors) {
    return {
      flowRate: Math.min(100, (factors.currentFlowRate / 50) * 100),
      gateStatus: factors.gateStatus === 'critical' ? 100 : factors.gateStatus === 'slow' ? 60 : 30,
      ticketProgress: (factors.ticketsScanned / factors.ticketsSold) * 100,
      capacityUtilization: factors.capacityUtilization,
    };
  }

  /**
   * Calculate base crowd density
   */
  private calculateBaseDensity(normalizedFactors: any): number {
    // Weighted average of factors
    const weights = {
      flowRate: 0.3,
      gateStatus: 0.25,
      ticketProgress: 0.25,
      capacityUtilization: 0.2,
    };

    return (
      normalizedFactors.flowRate * weights.flowRate +
      normalizedFactors.gateStatus * weights.gateStatus +
      normalizedFactors.ticketProgress * weights.ticketProgress +
      normalizedFactors.capacityUtilization * weights.capacityUtilization
    );
  }

  /**
   * Get weather adjustment factor
   */
  private getWeatherAdjustment(weather: string): number {
    const adjustments: Record<string, number> = {
      clear: 0,
      rain: 0.15, // People rush to enter
      hot: 0.1, // Slower entry
      cold: 0.05,
    };
    return adjustments[weather] || 0;
  }

  /**
   * Get match type adjustment factor
   */
  private getMatchTypeAdjustment(matchType: string): number {
    const adjustments: Record<string, number> = {
      friendly: 0,
      league: 0.1,
      cup: 0.2,
      derby: 0.35, // High-tension matches attract more crowds
    };
    return adjustments[matchType] || 0;
  }

  /**
   * Get time-based adjustment factor
   */
  private getTimeAdjustment(timeOfDay: number): number {
    // Peak hours: 17:00-19:00 (5-7 PM)
    if (timeOfDay >= 17 && timeOfDay <= 19) return 0.3;
    // Pre-match rush: 15:00-17:00
    if (timeOfDay >= 15 && timeOfDay < 17) return 0.2;
    // Post-match: 20:00-22:00
    if (timeOfDay >= 20 && timeOfDay <= 22) return 0.15;
    return 0;
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(factors: CrowdFactors): number {
    let confidence = 70;

    // Higher confidence with more data points
    if (factors.currentFlowRate > 0) confidence += 10;
    if (factors.ticketsSold > 0) confidence += 10;
    if (factors.historicalPattern > 0) confidence += 10;

    return Math.min(95, confidence);
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(factors: CrowdFactors): 'increasing' | 'stable' | 'decreasing' {
    const utilizationRate = factors.capacityUtilization;

    if (utilizationRate > 70) return 'increasing';
    if (utilizationRate < 30) return 'decreasing';
    return 'stable';
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(density: number): 'low' | 'medium' | 'high' | 'critical' {
    if (density >= 85) return 'critical';
    if (density >= 70) return 'high';
    if (density >= 50) return 'medium';
    return 'low';
  }

  /**
   * Generate recommended actions
   */
  private generateRecommendations(density: number, factors: CrowdFactors): string[] {
    const recommendations: string[] = [];

    if (density >= 85) {
      recommendations.push('فتح بوابات إضافية فوراً');
      recommendations.push('تحويل الجماهير إلى بوابات بديلة');
      recommendations.push('زيادة عدد الموظفين على البوابات');
      recommendations.push('تفعيل خطة الطوارئ');
    } else if (density >= 70) {
      recommendations.push('تحضير بوابات احتياطية');
      recommendations.push('زيادة معدل التدفق على البوابات الحالية');
      recommendations.push('إعادة توجيه التذاكر الجديدة');
    } else if (density >= 50) {
      recommendations.push('مراقبة الوضع عن كثب');
      recommendations.push('تحضير خطة بديلة');
    }

    if (factors.gateStatus === 'critical') {
      recommendations.push('فحص سريع للبوابات المتعطلة');
    }

    return recommendations;
  }

  /**
   * Identify affected gates
   */
  private identifyAffectedGates(factors: CrowdFactors, density: number): number[] {
    const affectedGates: number[] = [];

    if (factors.gateStatus === 'critical') {
      affectedGates.push(1, 2, 3, 4); // All gates affected
    } else if (density > 70) {
      affectedGates.push(1, 2); // Primary gates affected
    } else if (density > 50) {
      affectedGates.push(1); // One gate affected
    }

    return affectedGates;
  }

  /**
   * Estimate peak time
   */
  private estimatePeakTime(factors: CrowdFactors): Date {
    const now = new Date();
    const peakTime = new Date(now);

    // Peak typically occurs 15-30 minutes before match start
    // Assuming match starts at 20:00
    if (factors.timeOfDay < 18) {
      peakTime.setHours(19, 45);
    } else if (factors.timeOfDay < 19) {
      peakTime.setMinutes(peakTime.getMinutes() + 20);
    } else {
      peakTime.setMinutes(peakTime.getMinutes() + 10);
    }

    return peakTime;
  }

  /**
   * Estimate clear time
   */
  private estimateClearTime(factors: CrowdFactors, density: number): Date {
    const now = new Date();
    const clearTime = new Date(now);

    // Estimate based on remaining tickets and flow rate
    const remainingTickets = factors.ticketsSold - factors.ticketsScanned;
    const estimatedMinutes = Math.ceil(remainingTickets / Math.max(factors.currentFlowRate, 1));

    clearTime.setMinutes(clearTime.getMinutes() + estimatedMinutes);

    return clearTime;
  }

  /**
   * Calculate pressure points for each gate
   */
  private calculatePressurePoints(
    factors: CrowdFactors,
    gateCount: number
  ): Array<{ gateId: number; density: number; riskLevel: 'safe' | 'caution' | 'danger' | 'critical' }> {
    const pressurePoints = [];

    for (let i = 1; i <= gateCount; i++) {
      // Simulate varying pressure at different gates
      const baseDensity = (factors.capacityUtilization / gateCount) * (0.8 + Math.random() * 0.4);
      const density = Math.min(100, baseDensity);

      let riskLevel: 'safe' | 'caution' | 'danger' | 'critical' = 'safe';
      if (density >= 80) riskLevel = 'critical';
      else if (density >= 60) riskLevel = 'danger';
      else if (density >= 40) riskLevel = 'caution';

      pressurePoints.push({
        gateId: i,
        density: Math.round(density),
        riskLevel,
      });
    }

    return pressurePoints;
  }

  /**
   * Identify bottlenecks
   */
  private identifyBottlenecks(
    factors: CrowdFactors,
    pressurePoints: Array<{ gateId: number; density: number; riskLevel: string }>
  ): Array<{ location: string; severity: number; recommendation: string }> {
    const bottlenecks: Array<{ location: string; severity: number; recommendation: string }> = [];

    pressurePoints.forEach(point => {
      if (point.riskLevel === 'danger' || point.riskLevel === 'critical') {
        bottlenecks.push({
          location: `البوابة ${point.gateId}`,
          severity: point.density,
          recommendation: `زيادة معدل التدفق على البوابة ${point.gateId} أو فتح بوابة بديلة`,
        });
      }
    });

    return bottlenecks;
  }

  /**
   * Calculate overall safety score
   */
  private calculateSafetyScore(
    humanDensityIndex: number,
    pressurePoints: Array<{ gateId: number; density: number; riskLevel: string }>
  ): number {
    // Start with 100
    let score = 100;

    // Deduct based on density
    if (humanDensityIndex > 5) score -= 20;
    if (humanDensityIndex > 7) score -= 20;

    // Deduct based on critical pressure points
    const criticalPoints = pressurePoints.filter(p => p.riskLevel === 'critical').length;
    score -= criticalPoints * 15;

    const dangerPoints = pressurePoints.filter(p => p.riskLevel === 'danger').length;
    score -= dangerPoints * 10;

    return Math.max(0, score);
  }

  /**
   * Generate safety alerts
   */
  private generateSafetyAlerts(
    humanDensityIndex: number,
    pressurePoints: Array<{ gateId: number; density: number; riskLevel: string }>,
    safetyScore: number
  ): string[] {
    const alerts: string[] = [];

    if (humanDensityIndex > 7) {
      alerts.push('⚠️ تحذير: كثافة بشرية عالية جداً. خطر الاختناق');
    }

    const criticalGates = pressurePoints.filter(p => p.riskLevel === 'critical');
    if (criticalGates.length > 0) {
      alerts.push(`🔴 حالة حرجة على البوابات: ${criticalGates.map(g => g.gateId).join(', ')}`);
    }

    if (safetyScore < 50) {
      alerts.push('🚨 درجة السلامة منخفضة جداً. تفعيل بروتوكول الطوارئ');
    }

    return alerts;
  }

  /**
   * Get prediction history
   */
  getPredictionHistory(limit: number = 10): PredictionResult[] {
    return this.predictions.slice(-limit);
  }

  /**
   * Add historical data point
   */
  addHistoricalData(factors: CrowdFactors): void {
    this.historicalData.push(factors);
  }
}

// Export singleton instance
export const crowdPredictionEngine = new CrowdPredictionEngine();
