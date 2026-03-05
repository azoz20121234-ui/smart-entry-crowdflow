/**
 * Smart Recommendations Engine - Smart Entry & CrowdFlow
 * 
 * Personalized recommendations for fans based on:
 * - Preferred entry times
 * - Crowd density predictions
 * - Gate availability
 * - Facility locations
 * - Personal preferences
 * - Historical behavior
 */

export interface FanProfile {
  fanId: string;
  preferredEntryTime: number; // 0-23 hours
  toleranceForCrowds: 'low' | 'medium' | 'high';
  preferredGates: number[];
  mobilityNeeds: 'none' | 'wheelchair' | 'elderly' | 'family';
  averageWaitTimePreference: number; // minutes
  preferredFacilities: ('restroom' | 'food' | 'merchandise' | 'first-aid')[];
}

export interface Recommendation {
  type: 'entry-time' | 'gate' | 'facility' | 'strategy' | 'experience';
  title: string;
  description: string;
  expectedBenefit: string;
  confidence: number; // 0-100
  priority: 'high' | 'medium' | 'low';
  action: string;
  estimatedImpact: {
    waitTimeReduction: number; // minutes
    crowdAvoidance: number; // percentage
    costSavings: number; // currency
  };
}

export interface PersonalizedRecommendations {
  fanId: string;
  matchType: string;
  predictedDensity: number;
  recommendations: Recommendation[];
  summary: string;
  score: number; // Overall recommendation quality 0-100
}

/**
 * Smart Recommendations Engine
 * Generates personalized recommendations for fans
 */
export class SmartRecommendationsEngine {
  private fanProfiles: Map<string, FanProfile> = new Map();
  private recommendationHistory: Map<string, Recommendation[]> = new Map();

  constructor() {
    this.initializeSampleProfiles();
  }

  /**
   * Initialize sample fan profiles
   */
  private initializeSampleProfiles(): void {
    const sampleProfiles: FanProfile[] = [
      {
        fanId: 'fan-001',
        preferredEntryTime: 17,
        toleranceForCrowds: 'low',
        preferredGates: [1, 2],
        mobilityNeeds: 'none',
        averageWaitTimePreference: 5,
        preferredFacilities: ['restroom', 'food'],
      },
      {
        fanId: 'fan-002',
        preferredEntryTime: 18,
        toleranceForCrowds: 'high',
        preferredGates: [3, 4],
        mobilityNeeds: 'wheelchair',
        averageWaitTimePreference: 10,
        preferredFacilities: ['first-aid', 'restroom'],
      },
      {
        fanId: 'fan-003',
        preferredEntryTime: 18,
        toleranceForCrowds: 'medium',
        preferredGates: [2, 3],
        mobilityNeeds: 'family',
        averageWaitTimePreference: 8,
        preferredFacilities: ['food', 'merchandise'],
      },
    ];

    sampleProfiles.forEach(profile => {
      this.fanProfiles.set(profile.fanId, profile);
    });
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(
    fanId: string,
    matchType: string,
    predictedDensity: number,
    gateAvailability: Record<number, number>,
    weather: string,
    daysUntilMatch: number
  ): PersonalizedRecommendations {
    const profile = this.fanProfiles.get(fanId) || this.createDefaultProfile(fanId);
    const recommendations: Recommendation[] = [];

    // Generate entry time recommendation
    recommendations.push(
      this.generateEntryTimeRecommendation(profile, predictedDensity, matchType)
    );

    // Generate gate recommendation
    recommendations.push(
      this.generateGateRecommendation(profile, gateAvailability, predictedDensity)
    );

    // Generate facility recommendations
    recommendations.push(
      ...this.generateFacilityRecommendations(profile, predictedDensity)
    );

    // Generate strategy recommendation
    recommendations.push(
      this.generateStrategyRecommendation(profile, predictedDensity, weather, matchType)
    );

    // Generate experience recommendation
    recommendations.push(
      this.generateExperienceRecommendation(profile, predictedDensity, daysUntilMatch)
    );

    // Filter and sort recommendations
    const filteredRecommendations = recommendations
      .filter(r => r.confidence >= 60)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    // Calculate overall score
    const score = Math.round(
      filteredRecommendations.reduce((sum, r) => sum + r.confidence, 0) /
        Math.max(1, filteredRecommendations.length)
    );

    // Generate summary
    const summary = this.generateSummary(filteredRecommendations, profile, predictedDensity);

    return {
      fanId,
      matchType,
      predictedDensity,
      recommendations: filteredRecommendations,
      summary,
      score,
    };
  }

  /**
   * Generate entry time recommendation
   */
  private generateEntryTimeRecommendation(
    profile: FanProfile,
    density: number,
    matchType: string
  ): Recommendation {
    let recommendedTime = profile.preferredEntryTime;
    let confidence = 70;

    // Adjust based on crowd density
    if (density >= 80) {
      recommendedTime = Math.max(15, profile.preferredEntryTime - 1); // Go earlier
      confidence = 85;
    } else if (density >= 60) {
      recommendedTime = profile.preferredEntryTime;
      confidence = 75;
    } else {
      recommendedTime = Math.min(19, profile.preferredEntryTime + 1); // Can go later
      confidence = 65;
    }

    // Adjust for match type
    if (matchType === 'derby') {
      recommendedTime = Math.max(15, recommendedTime - 1);
      confidence += 10;
    }

    const timeString = `${String(recommendedTime).padStart(2, '0')}:00`;
    const waitReduction = density >= 80 ? 5 : density >= 60 ? 3 : 1;

    return {
      type: 'entry-time',
      title: `الدخول في الساعة ${timeString}`,
      description: `أفضل وقت للدخول بناءً على توقعات الحشود والتفضيلات الشخصية`,
      expectedBenefit: `تقليل وقت الانتظار بـ ${waitReduction} دقائق`,
      confidence: Math.min(100, confidence),
      priority: density >= 80 ? 'high' : 'medium',
      action: `ادخل الملعب في الساعة ${timeString}`,
      estimatedImpact: {
        waitTimeReduction: waitReduction,
        crowdAvoidance: density >= 80 ? 25 : 10,
        costSavings: 0,
      },
    };
  }

  /**
   * Generate gate recommendation
   */
  private generateGateRecommendation(
    profile: FanProfile,
    gateAvailability: Record<number, number>,
    density: number
  ): Recommendation {
    // Find best gate based on availability and preferences
    let bestGate = 1;
    let maxScore = -Infinity;

    Object.entries(gateAvailability).forEach(([gateId, capacity]) => {
      const gate = parseInt(gateId);
      const isPreferred = profile.preferredGates.includes(gate);
      const availabilityScore = capacity / 500;
      const preferenceBonus = isPreferred ? 0.3 : 0;

      const score = availabilityScore + preferenceBonus;

      if (score > maxScore) {
        maxScore = score;
        bestGate = gate;
      }
    });

    const confidence = Math.min(100, 60 + (maxScore * 40));
    const waitTime = Math.round((density / 100) * 10);

    return {
      type: 'gate',
      title: `استخدم البوابة ${bestGate}`,
      description: `البوابة الأمثل بناءً على التوفر والتفضيلات`,
      expectedBenefit: `انتظار متوقع ${waitTime} دقائق فقط`,
      confidence,
      priority: 'high',
      action: `توجه إلى البوابة ${bestGate} عند الدخول`,
      estimatedImpact: {
        waitTimeReduction: Math.max(1, 5 - waitTime),
        crowdAvoidance: 15,
        costSavings: 0,
      },
    };
  }

  /**
   * Generate facility recommendations
   */
  private generateFacilityRecommendations(
    profile: FanProfile,
    density: number
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    profile.preferredFacilities.forEach(facility => {
      const facilityNames: Record<string, string> = {
        restroom: 'دورات المياه',
        food: 'كشاك الطعام',
        merchandise: 'متجر البضائع',
        'first-aid': 'الإسعافات الأولية',
      };

      const facilityWaitTimes: Record<string, number> = {
        restroom: density >= 80 ? 15 : density >= 60 ? 10 : 5,
        food: density >= 80 ? 20 : density >= 60 ? 15 : 8,
        merchandise: density >= 80 ? 25 : density >= 60 ? 18 : 10,
        'first-aid': 5,
      };

      const waitTime = facilityWaitTimes[facility] || 10;
      const confidence = 65 + (density >= 80 ? 20 : 10);

      recommendations.push({
        type: 'facility',
        title: `${facilityNames[facility]} - الغرب`,
        description: `أقرب ${facilityNames[facility]} غير مزدحمة`,
        expectedBenefit: `انتظار متوقع ${waitTime} دقائق`,
        confidence: Math.min(100, confidence),
        priority: facility === 'first-aid' ? 'high' : 'medium',
        action: `توجه إلى ${facilityNames[facility]} في الجهة الغربية`,
        estimatedImpact: {
          waitTimeReduction: 0,
          crowdAvoidance: 20,
          costSavings: 0,
        },
      });
    });

    return recommendations;
  }

  /**
   * Generate strategy recommendation
   */
  private generateStrategyRecommendation(
    profile: FanProfile,
    density: number,
    weather: string,
    matchType: string
  ): Recommendation {
    let strategy = 'normal';
    let title = 'استراتيجية الدخول العادية';
    let description = 'اتبع الخطة المعتادة للدخول';

    if (density >= 85 && profile.toleranceForCrowds === 'low') {
      strategy = 'early-entry';
      title = 'استراتيجية الدخول المبكر';
      description = 'ادخل مبكراً جداً لتجنب الذروة';
    } else if (density >= 70 && matchType === 'derby') {
      strategy = 'alternative-gate';
      title = 'استراتيجية البوابة البديلة';
      description = 'استخدم بوابة بديلة أقل ازدحاماً';
    } else if (weather === 'rain') {
      strategy = 'covered-entry';
      title = 'استراتيجية الدخول المغطى';
      description = 'استخدم المدخل المغطى لتجنب المطر';
    }

    return {
      type: 'strategy',
      title,
      description,
      expectedBenefit: 'تحسين تجربة الدخول بشكل عام',
      confidence: 75,
      priority: density >= 85 ? 'high' : 'medium',
      action: `اتبع استراتيجية ${title}`,
      estimatedImpact: {
        waitTimeReduction: density >= 85 ? 8 : 3,
        crowdAvoidance: density >= 85 ? 30 : 10,
        costSavings: 0,
      },
    };
  }

  /**
   * Generate experience recommendation
   */
  private generateExperienceRecommendation(
    profile: FanProfile,
    density: number,
    daysUntilMatch: number
  ): Recommendation {
    let title = 'استمتع بتجربة كاملة';
    let description = 'لديك الوقت الكافي للاستمتاع بجميع المرافق';

    if (daysUntilMatch <= 1) {
      title = 'آخر فرصة للحجز';
      description = 'احجز تذكرتك الآن قبل انتهاء التذاكر';
    } else if (density >= 80) {
      title = 'تجربة مكثفة';
      description = 'استعد لحشود كبيرة جداً';
    } else if (density <= 40) {
      title = 'تجربة هادئة';
      description = 'استمتع بأجواء هادئة نسبياً';
    }

    return {
      type: 'experience',
      title,
      description,
      expectedBenefit: 'تحسين تجربة المشجع الكلية',
      confidence: 70,
      priority: 'medium',
      action: title,
      estimatedImpact: {
        waitTimeReduction: 0,
        crowdAvoidance: 0,
        costSavings: 0,
      },
    };
  }

  /**
   * Generate summary
   */
  private generateSummary(
    recommendations: Recommendation[],
    profile: FanProfile,
    density: number
  ): string {
    if (density >= 85) {
      return `⚠️ توقع حشوداً كبيرة جداً. يوصى بالدخول مبكراً جداً والالتزام بتوصيات البوابات البديلة.`;
    } else if (density >= 70) {
      return `→ حشود معتدلة إلى عالية. اتبع التوصيات المقترحة لضمان دخول سلس.`;
    } else if (density >= 50) {
      return `✓ حشود معقولة. يمكنك الدخول في وقتك المفضل مع الالتزام بالبوابة الموصى بها.`;
    } else {
      return `✓✓ حشود خفيفة. لديك مرونة كاملة في اختيار وقت ومكان الدخول.`;
    }
  }

  /**
   * Create default profile
   */
  private createDefaultProfile(fanId: string): FanProfile {
    return {
      fanId,
      preferredEntryTime: 18,
      toleranceForCrowds: 'medium',
      preferredGates: [1, 2, 3, 4],
      mobilityNeeds: 'none',
      averageWaitTimePreference: 10,
      preferredFacilities: ['restroom', 'food'],
    };
  }

  /**
   * Get fan profile
   */
  getFanProfile(fanId: string): FanProfile | undefined {
    return this.fanProfiles.get(fanId);
  }

  /**
   * Update fan profile
   */
  updateFanProfile(profile: FanProfile): void {
    this.fanProfiles.set(profile.fanId, profile);
  }

  /**
   * Get recommendation history
   */
  getRecommendationHistory(fanId: string): Recommendation[] {
    return this.recommendationHistory.get(fanId) || [];
  }
}

// Export singleton instance
export const smartRecommendationsEngine = new SmartRecommendationsEngine();
