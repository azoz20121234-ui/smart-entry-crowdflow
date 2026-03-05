/**
 * Smart Corridor Management System
 * Smart Entry & CrowdFlow
 * 
 * Manages stadium corridors with real-time crowd density monitoring
 */

export interface Corridor {
  id: string;
  name: string;
  location: string;
  maxCapacity: number;
  currentDensity: number; // 0-100%
  width: number; // meters
  length: number; // meters
  connectedGates: string[];
  connectedAmenities: string[]; // restrooms, food, shops
  status: 'normal' | 'warning' | 'critical' | 'closed';
  lastUpdated: Date;
}

export interface CorridorSegment {
  id: string;
  corridorId: string;
  segmentNumber: number;
  density: number;
  flow: number; // people per minute
  bottlenecks: number; // count of bottlenecks
}

export interface AmenityLocation {
  id: string;
  name: string;
  type: 'restroom' | 'food' | 'shop' | 'medical' | 'information';
  corridorId: string;
  waitTime: number; // minutes
  capacity: number;
  currentOccupancy: number;
  status: 'available' | 'busy' | 'full';
}

class CorridorManagementSystem {
  private corridors: Map<string, Corridor> = new Map();
  private segments: Map<string, CorridorSegment> = new Map();
  private amenities: Map<string, AmenityLocation> = new Map();
  private densityHistory: Map<string, number[]> = new Map();

  constructor() {
    this.initializeDefaultCorridors();
  }

  private initializeDefaultCorridors() {
    // Create default corridors
    const defaultCorridors: Corridor[] = [
      {
        id: 'corridor-1',
        name: 'الممر الشمالي الرئيسي',
        location: 'North Main',
        maxCapacity: 5000,
        currentDensity: 65,
        width: 8,
        length: 150,
        connectedGates: ['gate-1', 'gate-2'],
        connectedAmenities: ['amenity-1', 'amenity-2'],
        status: 'normal',
        lastUpdated: new Date(),
      },
      {
        id: 'corridor-2',
        name: 'الممر الجنوبي الرئيسي',
        location: 'South Main',
        maxCapacity: 5000,
        currentDensity: 78,
        width: 8,
        length: 150,
        connectedGates: ['gate-3', 'gate-4'],
        connectedAmenities: ['amenity-3', 'amenity-4'],
        status: 'warning',
        lastUpdated: new Date(),
      },
      {
        id: 'corridor-3',
        name: 'الممر الشرقي الثانوي',
        location: 'East Secondary',
        maxCapacity: 3000,
        currentDensity: 45,
        width: 6,
        length: 100,
        connectedGates: ['gate-1'],
        connectedAmenities: ['amenity-5'],
        status: 'normal',
        lastUpdated: new Date(),
      },
      {
        id: 'corridor-4',
        name: 'الممر الغربي الثانوي',
        location: 'West Secondary',
        maxCapacity: 3000,
        currentDensity: 92,
        width: 6,
        length: 100,
        connectedGates: ['gate-4'],
        connectedAmenities: ['amenity-6'],
        status: 'critical',
        lastUpdated: new Date(),
      },
    ];

    defaultCorridors.forEach(corridor => {
      this.corridors.set(corridor.id, corridor);
      this.densityHistory.set(corridor.id, [corridor.currentDensity]);
    });

    // Create corridor segments
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 3; j++) {
        const segmentId = `segment-${i}-${j}`;
        const segment: CorridorSegment = {
          id: segmentId,
          corridorId: `corridor-${i}`,
          segmentNumber: j,
          density: Math.random() * 100,
          flow: Math.floor(Math.random() * 200 + 50),
          bottlenecks: Math.floor(Math.random() * 3),
        };
        this.segments.set(segmentId, segment);
      }
    }

    // Create amenities
    const defaultAmenities: AmenityLocation[] = [
      {
        id: 'amenity-1',
        name: 'دورات المياه - الشمال 1',
        type: 'restroom',
        corridorId: 'corridor-1',
        waitTime: 5,
        capacity: 20,
        currentOccupancy: 18,
        status: 'busy',
      },
      {
        id: 'amenity-2',
        name: 'كشك الطعام - الشمال',
        type: 'food',
        corridorId: 'corridor-1',
        waitTime: 12,
        capacity: 50,
        currentOccupancy: 45,
        status: 'busy',
      },
      {
        id: 'amenity-3',
        name: 'دورات المياه - الجنوب 1',
        type: 'restroom',
        corridorId: 'corridor-2',
        waitTime: 8,
        capacity: 20,
        currentOccupancy: 20,
        status: 'full',
      },
      {
        id: 'amenity-4',
        name: 'كشك الطعام - الجنوب',
        type: 'food',
        corridorId: 'corridor-2',
        waitTime: 15,
        capacity: 50,
        currentOccupancy: 48,
        status: 'full',
      },
      {
        id: 'amenity-5',
        name: 'دورات المياه - الشرق',
        type: 'restroom',
        corridorId: 'corridor-3',
        waitTime: 2,
        capacity: 15,
        currentOccupancy: 8,
        status: 'available',
      },
      {
        id: 'amenity-6',
        name: 'كشك الطعام - الغرب',
        type: 'food',
        corridorId: 'corridor-4',
        waitTime: 20,
        capacity: 40,
        currentOccupancy: 39,
        status: 'full',
      },
    ];

    defaultAmenities.forEach(amenity => this.amenities.set(amenity.id, amenity));
  }

  // Get all corridors
  getAllCorridors(): Corridor[] {
    return Array.from(this.corridors.values());
  }

  // Get corridor by ID
  getCorridor(id: string): Corridor | undefined {
    return this.corridors.get(id);
  }

  // Update corridor density
  updateCorridorDensity(corridorId: string, newDensity: number): Corridor | null {
    const corridor = this.corridors.get(corridorId);
    if (!corridor) return null;

    corridor.currentDensity = Math.min(100, Math.max(0, newDensity));
    corridor.lastUpdated = new Date();

    // Determine status
    if (corridor.currentDensity >= 90) {
      corridor.status = 'critical';
    } else if (corridor.currentDensity >= 75) {
      corridor.status = 'warning';
    } else {
      corridor.status = 'normal';
    }

    // Track history
    const history = this.densityHistory.get(corridorId) || [];
    history.push(corridor.currentDensity);
    if (history.length > 100) history.shift();
    this.densityHistory.set(corridorId, history);

    return corridor;
  }

  // Get corridor segments
  getCorridorSegments(corridorId: string): CorridorSegment[] {
    return Array.from(this.segments.values()).filter(s => s.corridorId === corridorId);
  }

  // Update segment density
  updateSegmentDensity(segmentId: string, newDensity: number): CorridorSegment | null {
    const segment = this.segments.get(segmentId);
    if (!segment) return null;

    segment.density = Math.min(100, Math.max(0, newDensity));
    return segment;
  }

  // Get amenities in corridor
  getCorridorAmenities(corridorId: string): AmenityLocation[] {
    return Array.from(this.amenities.values()).filter(a => a.corridorId === corridorId);
  }

  // Get all amenities
  getAllAmenities(): AmenityLocation[] {
    return Array.from(this.amenities.values());
  }

  // Find best amenity by type
  findBestAmenity(type: AmenityLocation['type'], excludeCorridorId?: string): AmenityLocation | null {
    const amenities = Array.from(this.amenities.values())
      .filter(a => a.type === type && a.status !== 'full')
      .filter(a => !excludeCorridorId || a.corridorId !== excludeCorridorId)
      .sort((a, b) => a.waitTime - b.waitTime);

    return amenities.length > 0 ? amenities[0] : null;
  }

  // Get corridor recommendations
  getCorridorRecommendations(): Array<{
    corridor: Corridor;
    recommendation: string;
    priority: number;
  }> {
    const recommendations: Array<{
      corridor: Corridor;
      recommendation: string;
      priority: number;
    }> = [];

    this.corridors.forEach(corridor => {
      if (corridor.status === 'critical') {
        recommendations.push({
          corridor,
          recommendation: `الممر ${corridor.name} في حالة حرجة - يرجى إعادة توجيه الجماهير فوراً`,
          priority: 100,
        });
      } else if (corridor.status === 'warning') {
        recommendations.push({
          corridor,
          recommendation: `الممر ${corridor.name} يقترب من الامتلاء - يرجى مراقبة الوضع`,
          priority: 50,
        });
      }
    });

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  // Calculate corridor efficiency
  getCorridorEfficiency(corridorId: string): number {
    const corridor = this.corridors.get(corridorId);
    if (!corridor) return 0;

    const segments = this.getCorridorSegments(corridorId);
    const avgDensity = segments.reduce((sum, s) => sum + s.density, 0) / (segments.length || 1);
    const avgFlow = segments.reduce((sum, s) => sum + s.flow, 0) / (segments.length || 1);

    // Efficiency = (flow / (density + 1)) * 100
    return Math.round((avgFlow / (avgDensity + 1)) * 100);
  }

  // Get bottleneck analysis
  getBottleneckAnalysis(): Array<{
    segmentId: string;
    corridorName: string;
    bottleneckCount: number;
    severity: 'low' | 'medium' | 'high';
  }> {
    const bottlenecks: Array<{
      segmentId: string;
      corridorName: string;
      bottleneckCount: number;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    this.segments.forEach(segment => {
      if (segment.bottlenecks > 0) {
        const corridor = this.corridors.get(segment.corridorId);
        const severity = segment.bottlenecks >= 3 ? 'high' : segment.bottlenecks >= 2 ? 'medium' : 'low';

        bottlenecks.push({
          segmentId: segment.id,
          corridorName: corridor?.name || 'Unknown',
          bottleneckCount: segment.bottlenecks,
          severity,
        });
      }
    });

    return bottlenecks.sort((a, b) => b.bottleneckCount - a.bottleneckCount);
  }

  // Simulate real-time updates
  simulateRealTimeUpdates() {
    this.corridors.forEach((corridor, id) => {
      const change = (Math.random() - 0.5) * 10;
      this.updateCorridorDensity(id, corridor.currentDensity + change);
    });

    this.segments.forEach(segment => {
      segment.density = Math.min(100, Math.max(0, segment.density + (Math.random() - 0.5) * 8));
      segment.flow = Math.max(0, segment.flow + (Math.random() - 0.5) * 30);
    });
  }
}

export const corridorManagement = new CorridorManagementSystem();
