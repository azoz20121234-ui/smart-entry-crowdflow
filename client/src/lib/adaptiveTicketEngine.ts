/**
 * Adaptive Ticket+ Engine - Smart Entry & CrowdFlow
 * 
 * Dynamic ticket pricing and routing based on:
 * - Predicted crowd density
 * - Weather conditions
 * - Match type and importance
 * - Time of purchase
 * - Gate availability
 * - Seat location
 */

export interface TicketPricingFactors {
  basePricePerSeat: number;
  predictedCrowdDensity: number;
  weather: 'clear' | 'rain' | 'hot' | 'cold';
  matchType: 'friendly' | 'league' | 'cup' | 'derby';
  daysUntilMatch: number;
  gateAvailability: Record<number, number>; // Gate ID -> Available capacity
  seatSection: 'premium' | 'standard' | 'economy';
  timeOfDay: number;
}

export interface AdaptiveTicket {
  ticketId: string;
  basePrice: number;
  dynamicPrice: number;
  priceAdjustments: {
    crowdDensityFactor: number;
    weatherFactor: number;
    matchTypeFactor: number;
    timingFactor: number;
    demandFactor: number;
    totalDiscount: number;
  };
  recommendedGate: number;
  recommendedEntryTime: string;
  estimatedWaitTime: number;
  alternativeGates: Array<{
    gateId: number;
    estimatedWaitTime: number;
    distance: number;
  }>;
  value: number; // Price to value ratio
  recommendation: string;
}

export interface DynamicPricingStrategy {
  strategyName: string;
  description: string;
  targetDensity: number;
  priceMultiplier: number;
  expectedRevenue: number;
  expectedAttendance: number;
}

/**
 * Adaptive Ticket+ Engine
 * Calculates dynamic pricing and optimal routing for tickets
 */
export class AdaptiveTicketEngine {
  private basePrices: Record<string, number> = {
    premium: 150,
    standard: 100,
    economy: 50,
  };

  private pricingStrategies: Map<string, DynamicPricingStrategy> = new Map();

  constructor() {
    this.initializePricingStrategies();
  }

  /**
   * Initialize pricing strategies
   */
  private initializePricingStrategies(): void {
    this.pricingStrategies.set('peak-demand', {
      strategyName: 'ذروة الطلب',
      description: 'أسعار مرتفعة لتقليل الطلب وتوزيع الحشود',
      targetDensity: 70,
      priceMultiplier: 1.4,
      expectedRevenue: 450000,
      expectedAttendance: 2200,
    });

    this.pricingStrategies.set('balanced', {
      strategyName: 'متوازن',
      description: 'أسعار معتدلة لتحقيق التوازن بين الإيرادات والحشود',
      targetDensity: 60,
      priceMultiplier: 1.0,
      expectedRevenue: 380000,
      expectedAttendance: 2500,
    });

    this.pricingStrategies.set('volume-maximization', {
      strategyName: 'تعظيم الحجم',
      description: 'أسعار منخفضة لزيادة الحضور والإيرادات الإجمالية',
      targetDensity: 50,
      priceMultiplier: 0.75,
      expectedRevenue: 420000,
      expectedAttendance: 2800,
    });

    this.pricingStrategies.set('premium-experience', {
      strategyName: 'التجربة المميزة',
      description: 'أسعار عالية مع خدمات إضافية وتجربة محسنة',
      targetDensity: 40,
      priceMultiplier: 1.6,
      expectedRevenue: 380000,
      expectedAttendance: 1800,
    });
  }

  /**
   * Calculate dynamic ticket price
   */
  calculateDynamicPrice(factors: TicketPricingFactors): AdaptiveTicket {
    const basePrice = this.basePrices[factors.seatSection] || 100;

    // Calculate individual adjustment factors
    const crowdDensityFactor = this.calculateCrowdDensityFactor(factors.predictedCrowdDensity);
    const weatherFactor = this.calculateWeatherFactor(factors.weather);
    const matchTypeFactor = this.calculateMatchTypeFactor(factors.matchType);
    const timingFactor = this.calculateTimingFactor(factors.daysUntilMatch, factors.timeOfDay);
    const demandFactor = this.calculateDemandFactor(factors.gateAvailability);

    // Calculate total adjustment
    const totalAdjustment = crowdDensityFactor + weatherFactor + matchTypeFactor + timingFactor + demandFactor;
    const totalDiscount = Math.max(-0.5, Math.min(0.5, totalAdjustment)); // Cap between -50% and +50%

    // Calculate dynamic price
    const dynamicPrice = Math.round(basePrice * (1 + totalDiscount));

    // Determine recommended gate
    const recommendedGate = this.findOptimalGate(factors.gateAvailability);

    // Get recommended entry time
    const recommendedEntryTime = this.getRecommendedEntryTime(factors.predictedCrowdDensity);

    // Calculate estimated wait time
    const estimatedWaitTime = this.calculateWaitTime(
      factors.predictedCrowdDensity,
      factors.gateAvailability[recommendedGate] || 0
    );

    // Get alternative gates
    const alternativeGates = this.getAlternativeGates(
      factors.gateAvailability,
      recommendedGate,
      factors.predictedCrowdDensity
    );

    // Calculate value score
    const value = this.calculateValueScore(dynamicPrice, estimatedWaitTime, factors.seatSection);

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      dynamicPrice,
      basePrice,
      estimatedWaitTime,
      factors.predictedCrowdDensity,
      value
    );

    return {
      ticketId: this.generateTicketId(),
      basePrice,
      dynamicPrice,
      priceAdjustments: {
        crowdDensityFactor,
        weatherFactor,
        matchTypeFactor,
        timingFactor,
        demandFactor,
        totalDiscount,
      },
      recommendedGate,
      recommendedEntryTime,
      estimatedWaitTime,
      alternativeGates,
      value,
      recommendation,
    };
  }

  /**
   * Calculate crowd density adjustment factor
   */
  private calculateCrowdDensityFactor(density: number): number {
    if (density >= 85) return 0.35; // High demand - increase price
    if (density >= 70) return 0.2;
    if (density >= 50) return 0;
    if (density >= 30) return -0.15; // Low demand - decrease price
    return -0.3;
  }

  /**
   * Calculate weather adjustment factor
   */
  private calculateWeatherFactor(weather: string): number {
    switch (weather) {
      case 'rain':
        return 0.1; // Rain increases demand
      case 'hot':
        return -0.1; // Heat decreases demand
      case 'cold':
        return -0.05;
      default:
        return 0;
    }
  }

  /**
   * Calculate match type adjustment factor
   */
  private calculateMatchTypeFactor(matchType: string): number {
    switch (matchType) {
      case 'derby':
        return 0.3; // High demand
      case 'cup':
        return 0.15;
      case 'league':
        return 0;
      case 'friendly':
        return -0.2; // Low demand
      default:
        return 0;
    }
  }

  /**
   * Calculate timing adjustment factor
   */
  private calculateTimingFactor(daysUntilMatch: number, timeOfDay: number): number {
    let timingFactor = 0;

    // Days until match
    if (daysUntilMatch <= 1) timingFactor += 0.2; // Last minute - high demand
    if (daysUntilMatch <= 3) timingFactor += 0.1;
    if (daysUntilMatch >= 30) timingFactor -= 0.15; // Early booking discount

    // Time of day
    if (timeOfDay >= 17 && timeOfDay <= 19) timingFactor += 0.1; // Evening peak

    return timingFactor;
  }

  /**
   * Calculate demand adjustment factor
   */
  private calculateDemandFactor(gateAvailability: Record<number, number>): number {
    const totalCapacity = Object.values(gateAvailability).reduce((a, b) => a + b, 0);
    const utilizationRate = (2500 - totalCapacity) / 2500;

    if (utilizationRate >= 0.9) return 0.25; // Almost full
    if (utilizationRate >= 0.75) return 0.15;
    if (utilizationRate >= 0.5) return 0;
    if (utilizationRate >= 0.25) return -0.1;
    return -0.2; // Plenty of capacity
  }

  /**
   * Find optimal gate based on availability and crowd density
   */
  private findOptimalGate(gateAvailability: Record<number, number>): number {
    let optimalGate = 1;
    let maxAvailability = 0;

    Object.entries(gateAvailability).forEach(([gateId, availability]) => {
      if (availability > maxAvailability) {
        maxAvailability = availability;
        optimalGate = parseInt(gateId);
      }
    });

    return optimalGate;
  }

  /**
   * Get recommended entry time
   */
  private getRecommendedEntryTime(density: number): string {
    if (density >= 80) return '17:00'; // Very early
    if (density >= 60) return '17:30';
    if (density >= 40) return '18:00';
    return '18:30'; // Can enter later
  }

  /**
   * Calculate estimated wait time
   */
  private calculateWaitTime(density: number, gateCapacity: number): number {
    const baseWaitTime = (density / 100) * 15; // Max 15 minutes at 100% density
    const capacityFactor = Math.max(0.5, gateCapacity / 500); // Normalize to gate capacity
    return Math.round(baseWaitTime / capacityFactor);
  }

  /**
   * Get alternative gates
   */
  private getAlternativeGates(
    gateAvailability: Record<number, number>,
    recommendedGate: number,
    density: number
  ): Array<{ gateId: number; estimatedWaitTime: number; distance: number }> {
    return Object.entries(gateAvailability)
      .filter(([gateId]) => parseInt(gateId) !== recommendedGate)
      .map(([gateId, capacity]) => ({
        gateId: parseInt(gateId),
        estimatedWaitTime: this.calculateWaitTime(density, capacity),
        distance: Math.abs(parseInt(gateId) - recommendedGate) * 50, // Rough distance estimate
      }))
      .sort((a, b) => a.estimatedWaitTime - b.estimatedWaitTime)
      .slice(0, 2);
  }

  /**
   * Calculate value score (0-100)
   */
  private calculateValueScore(price: number, waitTime: number, section: string): number {
    const priceScore = Math.max(0, 100 - (price / 200) * 100); // Normalize to 100
    const timeScore = Math.max(0, 100 - (waitTime / 15) * 100); // Normalize to 100
    const sectionBonus = section === 'premium' ? 20 : section === 'standard' ? 10 : 0;

    return Math.round((priceScore * 0.4 + timeScore * 0.4 + sectionBonus) / 1.2);
  }

  /**
   * Generate recommendation text
   */
  private generateRecommendation(
    dynamicPrice: number,
    basePrice: number,
    waitTime: number,
    density: number,
    value: number
  ): string {
    const priceChange = dynamicPrice - basePrice;
    const pricePercent = Math.round((priceChange / basePrice) * 100);

    if (value >= 80) {
      return `✓ قيمة ممتازة! السعر ${pricePercent > 0 ? '+' : ''}${pricePercent}% مع انتظار ${waitTime} دقائق فقط`;
    } else if (value >= 60) {
      return `→ قيمة جيدة. السعر ${pricePercent > 0 ? '+' : ''}${pricePercent}% مع انتظار متوقع ${waitTime} دقائق`;
    } else if (value >= 40) {
      return `⚠ قيمة متوسطة. قد تجد خيارات أفضل في بوابات أخرى`;
    } else {
      return `✗ قيمة منخفضة. يوصى باختيار بوابة أخرى أو وقت دخول مختلف`;
    }
  }

  /**
   * Generate unique ticket ID
   */
  private generateTicketId(): string {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all pricing strategies
   */
  getPricingStrategies(): Map<string, DynamicPricingStrategy> {
    return this.pricingStrategies;
  }

  /**
   * Get strategy by name
   */
  getStrategy(strategyName: string): DynamicPricingStrategy | undefined {
    return this.pricingStrategies.get(strategyName);
  }

  /**
   * Calculate optimal strategy for current conditions
   */
  getOptimalStrategy(
    predictedDensity: number,
    targetRevenue: number,
    targetAttendance: number
  ): DynamicPricingStrategy | undefined {
    let optimalStrategy: DynamicPricingStrategy | undefined;
    let bestScore = -Infinity;

    this.pricingStrategies.forEach(strategy => {
      // Calculate score based on how well it matches targets
      const densityDiff = Math.abs(strategy.targetDensity - predictedDensity);
      const revenueDiff = Math.abs(strategy.expectedRevenue - targetRevenue);
      const attendanceDiff = Math.abs(strategy.expectedAttendance - targetAttendance);

      const score = -(densityDiff + revenueDiff / 10000 + attendanceDiff / 100);

      if (score > bestScore) {
        bestScore = score;
        optimalStrategy = strategy;
      }
    });

    return optimalStrategy;
  }
}

// Export singleton instance
export const adaptiveTicketEngine = new AdaptiveTicketEngine();
