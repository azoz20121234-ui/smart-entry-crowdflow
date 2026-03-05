/**
 * Advanced Dynamic Ticketing System
 * Smart Entry & CrowdFlow
 * 
 * Intelligent ticket pricing and routing based on real-time conditions
 */

export interface DynamicTicket {
  id: string;
  holderId: string;
  eventId: string;
  originalPrice: number;
  currentPrice: number;
  assignedGate: string;
  assignedCorridor: string;
  assignedPath: string[];
  purchaseTime: Date;
  entryTime?: Date;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  queuePosition: number;
  estimatedWaitTime: number; // minutes
  priceAdjustmentReason: string;
  discountPercentage: number;
}

export interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  conditions: {
    crowdDensity: { min: number; max: number };
    timeUntilEvent: { min: number; max: number };
    gateLoad: { min: number; max: number };
  };
  priceMultiplier: number;
  incentiveBonus: number; // percentage discount
}

export interface TicketRecommendation {
  ticketId: string;
  currentGate: string;
  recommendedGate: string;
  reason: string;
  estimatedTimeSaving: number; // minutes
  priceAdjustment: number;
}

class AdvancedTicketingSystem {
  private tickets: Map<string, DynamicTicket> = new Map();
  private pricingStrategies: Map<string, PricingStrategy> = new Map();
  private gateLoads: Map<string, number> = new Map();
  private ticketsSold: number = 0;
  private totalRevenue: number = 0;

  constructor() {
    this.initializeDefaultStrategies();
    this.initializeGateLoads();
  }

  private initializeDefaultStrategies() {
    const strategies: PricingStrategy[] = [
      {
        id: 'strategy-peak',
        name: 'استراتيجية الذروة',
        description: 'سعر مرتفع عند الازدحام الشديد',
        conditions: {
          crowdDensity: { min: 80, max: 100 },
          timeUntilEvent: { min: 0, max: 30 },
          gateLoad: { min: 70, max: 100 },
        },
        priceMultiplier: 1.4,
        incentiveBonus: 0,
      },
      {
        id: 'strategy-normal',
        name: 'استراتيجية عادية',
        description: 'سعر عادي في الأوقات العادية',
        conditions: {
          crowdDensity: { min: 40, max: 79 },
          timeUntilEvent: { min: 30, max: 120 },
          gateLoad: { min: 40, max: 69 },
        },
        priceMultiplier: 1.0,
        incentiveBonus: 0,
      },
      {
        id: 'strategy-offpeak',
        name: 'استراتيجية الفترة الهادئة',
        description: 'سعر منخفض وحوافز في الأوقات الهادئة',
        conditions: {
          crowdDensity: { min: 0, max: 39 },
          timeUntilEvent: { min: 120, max: 300 },
          gateLoad: { min: 0, max: 39 },
        },
        priceMultiplier: 0.7,
        incentiveBonus: 15,
      },
      {
        id: 'strategy-incentive',
        name: 'استراتيجية الحافز',
        description: 'حافز لتوجيه الجماهير إلى البوابات الأقل ازدحاماً',
        conditions: {
          crowdDensity: { min: 50, max: 100 },
          timeUntilEvent: { min: 0, max: 60 },
          gateLoad: { min: 20, max: 50 },
        },
        priceMultiplier: 0.85,
        incentiveBonus: 20,
      },
    ];

    strategies.forEach(strategy => this.pricingStrategies.set(strategy.id, strategy));
  }

  private initializeGateLoads() {
    this.gateLoads.set('gate-1', 65);
    this.gateLoads.set('gate-2', 78);
    this.gateLoads.set('gate-3', 45);
    this.gateLoads.set('gate-4', 92);
  }

  // Create dynamic ticket
  createDynamicTicket(
    holderId: string,
    eventId: string,
    basePrice: number,
    crowdDensity: number,
    timeUntilEvent: number
  ): DynamicTicket {
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const strategy = this.selectPricingStrategy(crowdDensity, timeUntilEvent);

    // Calculate price
    let finalPrice = basePrice * strategy.priceMultiplier;
    const discountPercentage = strategy.incentiveBonus;
    if (discountPercentage > 0) {
      finalPrice = finalPrice * (1 - discountPercentage / 100);
    }

    // Assign optimal gate
    const assignedGate = this.assignOptimalGate();

    const ticket: DynamicTicket = {
      id: ticketId,
      holderId,
      eventId,
      originalPrice: basePrice,
      currentPrice: Math.round(finalPrice * 100) / 100,
      assignedGate,
      assignedCorridor: this.getCorridorForGate(assignedGate),
      assignedPath: this.generateOptimalPath(assignedGate),
      purchaseTime: new Date(),
      status: 'active',
      queuePosition: Math.floor(Math.random() * 500) + 1,
      estimatedWaitTime: Math.floor(Math.random() * 15) + 2,
      priceAdjustmentReason: strategy.name,
      discountPercentage,
    };

    this.tickets.set(ticketId, ticket);
    this.ticketsSold++;
    this.totalRevenue += ticket.currentPrice;

    return ticket;
  }

  // Select pricing strategy
  private selectPricingStrategy(crowdDensity: number, timeUntilEvent: number): PricingStrategy {
    let bestStrategy: PricingStrategy | null = null;
    let maxScore = -1;

    this.pricingStrategies.forEach(strategy => {
      const conditions = strategy.conditions;
      const densityMatch =
        crowdDensity >= conditions.crowdDensity.min && crowdDensity <= conditions.crowdDensity.max;
      const timeMatch =
        timeUntilEvent >= conditions.timeUntilEvent.min && timeUntilEvent <= conditions.timeUntilEvent.max;

      if (densityMatch && timeMatch) {
        const score = strategy.priceMultiplier + strategy.incentiveBonus / 100;
        if (score > maxScore) {
          maxScore = score;
          bestStrategy = strategy;
        }
      }
    });

    return bestStrategy || Array.from(this.pricingStrategies.values())[1]; // Default to normal
  }

  // Assign optimal gate
  private assignOptimalGate(): string {
    const gates = Array.from(this.gateLoads.entries())
      .sort((a, b) => a[1] - b[1]);
    return gates[0][0];
  }

  // Get corridor for gate
  private getCorridorForGate(gateId: string): string {
    const corridorMap: Record<string, string> = {
      'gate-1': 'corridor-1',
      'gate-2': 'corridor-1',
      'gate-3': 'corridor-2',
      'gate-4': 'corridor-2',
    };
    return corridorMap[gateId] || 'corridor-1';
  }

  // Generate optimal path
  private generateOptimalPath(gateId: string): string[] {
    const pathMap: Record<string, string[]> = {
      'gate-1': ['entrance', 'corridor-1', 'segment-1-1', 'segment-1-2', 'gate-1'],
      'gate-2': ['entrance', 'corridor-1', 'segment-1-2', 'segment-1-3', 'gate-2'],
      'gate-3': ['entrance', 'corridor-2', 'segment-2-1', 'segment-2-2', 'gate-3'],
      'gate-4': ['entrance', 'corridor-2', 'segment-2-2', 'segment-2-3', 'gate-4'],
    };
    return pathMap[gateId] || ['entrance', 'corridor-1', 'gate-1'];
  }

  // Get ticket by ID
  getTicket(ticketId: string): DynamicTicket | undefined {
    return this.tickets.get(ticketId);
  }

  // Get all tickets
  getAllTickets(): DynamicTicket[] {
    return Array.from(this.tickets.values());
  }

  // Get ticket recommendations
  getTicketRecommendations(crowdDensity: number): TicketRecommendation[] {
    const recommendations: TicketRecommendation[] = [];

    this.tickets.forEach(ticket => {
      if (ticket.status === 'active') {
        const currentGateLoad = this.gateLoads.get(ticket.assignedGate) || 50;
        const bestGate = this.assignOptimalGate();
        const bestGateLoad = this.gateLoads.get(bestGate) || 50;

        if (bestGateLoad < currentGateLoad - 15) {
          const timeSaving = Math.round((currentGateLoad - bestGateLoad) / 10);
          const priceAdjustment = timeSaving > 5 ? -5 : 0;

          recommendations.push({
            ticketId: ticket.id,
            currentGate: ticket.assignedGate,
            recommendedGate: bestGate,
            reason: `البوابة ${bestGate} أقل ازدحاماً وتوفر ${timeSaving} دقائق`,
            estimatedTimeSaving: timeSaving,
            priceAdjustment,
          });
        }
      }
    });

    return recommendations;
  }

  // Update gate load
  updateGateLoad(gateId: string, newLoad: number) {
    this.gateLoads.set(gateId, Math.min(100, Math.max(0, newLoad)));
  }

  // Get pricing statistics
  getPricingStats() {
    const tickets = Array.from(this.tickets.values());
    const activeTickets = tickets.filter(t => t.status === 'active');
    const avgPrice = activeTickets.length > 0
      ? activeTickets.reduce((sum, t) => sum + t.currentPrice, 0) / activeTickets.length
      : 0;

    return {
      totalTicketsSold: this.ticketsSold,
      totalRevenue: Math.round(this.totalRevenue * 100) / 100,
      activeTickets: activeTickets.length,
      averagePrice: Math.round(avgPrice * 100) / 100,
      totalDiscountsGiven: tickets.reduce((sum, t) => sum + (t.discountPercentage * t.originalPrice / 100), 0),
    };
  }

  // Get pricing strategies
  getAllPricingStrategies(): PricingStrategy[] {
    return Array.from(this.pricingStrategies.values());
  }

  // Simulate dynamic pricing
  simulateDynamicPricing(crowdDensity: number, timeUntilEvent: number) {
    const strategy = this.selectPricingStrategy(crowdDensity, timeUntilEvent);
    return {
      strategy: strategy.name,
      multiplier: strategy.priceMultiplier,
      incentive: strategy.incentiveBonus,
      recommendation: `السعر الموصى به: ${strategy.priceMultiplier}x السعر الأساسي`,
    };
  }
}

export const advancedTicketing = new AdvancedTicketingSystem();
