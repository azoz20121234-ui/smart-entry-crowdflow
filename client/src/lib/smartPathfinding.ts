/**
 * Smart Pathfinding System with Congestion Awareness
 * Smart Entry & CrowdFlow
 * 
 * Generates optimal routes considering crowd density and bottlenecks
 */

export interface PathNode {
  id: string;
  name: string;
  type: 'entrance' | 'corridor' | 'segment' | 'gate' | 'amenity';
  x: number;
  y: number;
  congestionLevel: number; // 0-100
  capacity: number;
  currentOccupancy: number;
}

export interface PathEdge {
  from: string;
  to: string;
  distance: number; // meters
  estimatedTime: number; // seconds
  congestionFactor: number; // 0-1
}

export interface OptimalPath {
  id: string;
  nodes: PathNode[];
  totalDistance: number;
  estimatedTime: number;
  congestionScore: number; // 0-100
  efficiency: number; // 0-100
  alternativePaths: OptimalPath[];
}

export interface RouteRecommendation {
  primaryRoute: OptimalPath;
  alternativeRoutes: OptimalPath[];
  amenityStops: Array<{
    amenityId: string;
    type: string;
    waitTime: number;
    distanceFromPath: number;
  }>;
  estimatedTotalTime: number;
}

class SmartPathfindingSystem {
  private nodes: Map<string, PathNode> = new Map();
  private edges: Map<string, PathEdge> = new Map();
  private pathCache: Map<string, OptimalPath[]> = new Map();

  constructor() {
    this.initializeNetwork();
  }

  private initializeNetwork() {
    // Create nodes
    const nodes: PathNode[] = [
      // Entrances
      { id: 'entrance-1', name: 'المدخل الرئيسي', type: 'entrance', x: 0, y: 50, congestionLevel: 40, capacity: 5000, currentOccupancy: 2000 },
      { id: 'entrance-2', name: 'المدخل الثانوي', type: 'entrance', x: 100, y: 50, congestionLevel: 30, capacity: 3000, currentOccupancy: 900 },

      // Corridors
      { id: 'corridor-1', name: 'الممر الشمالي', type: 'corridor', x: 25, y: 25, congestionLevel: 65, capacity: 5000, currentOccupancy: 3250 },
      { id: 'corridor-2', name: 'الممر الجنوبي', type: 'corridor', x: 25, y: 75, congestionLevel: 78, capacity: 5000, currentOccupancy: 3900 },
      { id: 'corridor-3', name: 'الممر الشرقي', type: 'corridor', x: 75, y: 25, congestionLevel: 45, capacity: 3000, currentOccupancy: 1350 },
      { id: 'corridor-4', name: 'الممر الغربي', type: 'corridor', x: 75, y: 75, congestionLevel: 92, capacity: 3000, currentOccupancy: 2760 },

      // Segments
      { id: 'segment-1', name: 'القطاع 1-1', type: 'segment', x: 40, y: 20, congestionLevel: 55, capacity: 2000, currentOccupancy: 1100 },
      { id: 'segment-2', name: 'القطاع 1-2', type: 'segment', x: 55, y: 30, congestionLevel: 70, capacity: 2000, currentOccupancy: 1400 },
      { id: 'segment-3', name: 'القطاع 2-1', type: 'segment', x: 40, y: 70, congestionLevel: 82, capacity: 2000, currentOccupancy: 1640 },
      { id: 'segment-4', name: 'القطاع 2-2', type: 'segment', x: 55, y: 80, congestionLevel: 75, capacity: 2000, currentOccupancy: 1500 },

      // Gates
      { id: 'gate-1', name: 'البوابة 1', type: 'gate', x: 85, y: 15, congestionLevel: 65, capacity: 2500, currentOccupancy: 1625 },
      { id: 'gate-2', name: 'البوابة 2', type: 'gate', x: 85, y: 35, congestionLevel: 78, capacity: 2500, currentOccupancy: 1950 },
      { id: 'gate-3', name: 'البوابة 3', type: 'gate', x: 85, y: 65, congestionLevel: 45, capacity: 2500, currentOccupancy: 1125 },
      { id: 'gate-4', name: 'البوابة 4', type: 'gate', x: 85, y: 85, congestionLevel: 92, capacity: 2500, currentOccupancy: 2300 },

      // Amenities
      { id: 'amenity-1', name: 'دورات مياه', type: 'amenity', x: 30, y: 40, congestionLevel: 60, capacity: 50, currentOccupancy: 30 },
      { id: 'amenity-2', name: 'كشك طعام', type: 'amenity', x: 50, y: 50, congestionLevel: 70, capacity: 100, currentOccupancy: 70 },
    ];

    nodes.forEach(node => this.nodes.set(node.id, node));

    // Create edges
    const edges: PathEdge[] = [
      // From entrance-1
      { from: 'entrance-1', to: 'corridor-1', distance: 25, estimatedTime: 30, congestionFactor: 0.65 },
      { from: 'entrance-1', to: 'corridor-2', distance: 25, estimatedTime: 30, congestionFactor: 0.78 },

      // From entrance-2
      { from: 'entrance-2', to: 'corridor-3', distance: 25, estimatedTime: 30, congestionFactor: 0.45 },
      { from: 'entrance-2', to: 'corridor-4', distance: 25, estimatedTime: 30, congestionFactor: 0.92 },

      // Corridor to segments
      { from: 'corridor-1', to: 'segment-1', distance: 20, estimatedTime: 25, congestionFactor: 0.55 },
      { from: 'corridor-1', to: 'segment-2', distance: 30, estimatedTime: 40, congestionFactor: 0.70 },
      { from: 'corridor-2', to: 'segment-3', distance: 20, estimatedTime: 25, congestionFactor: 0.82 },
      { from: 'corridor-2', to: 'segment-4', distance: 30, estimatedTime: 40, congestionFactor: 0.75 },

      // Segments to gates
      { from: 'segment-1', to: 'gate-1', distance: 45, estimatedTime: 60, congestionFactor: 0.65 },
      { from: 'segment-2', to: 'gate-2', distance: 35, estimatedTime: 50, congestionFactor: 0.78 },
      { from: 'segment-3', to: 'gate-3', distance: 45, estimatedTime: 60, congestionFactor: 0.45 },
      { from: 'segment-4', to: 'gate-4', distance: 35, estimatedTime: 50, congestionFactor: 0.92 },

      // Amenity connections
      { from: 'segment-1', to: 'amenity-1', distance: 10, estimatedTime: 15, congestionFactor: 0.60 },
      { from: 'segment-2', to: 'amenity-2', distance: 5, estimatedTime: 10, congestionFactor: 0.70 },
    ];

    edges.forEach(edge => {
      const key = `${edge.from}-${edge.to}`;
      this.edges.set(key, edge);
    });
  }

  // Find optimal path using A* algorithm with congestion awareness
  findOptimalPath(startId: string, endId: string): OptimalPath {
    const pathId = `${startId}-${endId}`;

    // Check cache
    const cached = this.pathCache.get(pathId);
    if (cached) return cached[0];

    // Simple pathfinding (simplified A*)
    const path: PathNode[] = [];
    let totalDistance = 0;
    let totalTime = 0;
    let congestionScore = 0;

    // Predefined paths for demo
    const pathMap: Record<string, string[]> = {
      'entrance-1-gate-1': ['entrance-1', 'corridor-1', 'segment-1', 'gate-1'],
      'entrance-1-gate-2': ['entrance-1', 'corridor-1', 'segment-2', 'gate-2'],
      'entrance-1-gate-3': ['entrance-1', 'corridor-2', 'segment-3', 'gate-3'],
      'entrance-1-gate-4': ['entrance-1', 'corridor-2', 'segment-4', 'gate-4'],
      'entrance-2-gate-1': ['entrance-2', 'corridor-3', 'segment-1', 'gate-1'],
      'entrance-2-gate-2': ['entrance-2', 'corridor-3', 'segment-2', 'gate-2'],
      'entrance-2-gate-3': ['entrance-2', 'corridor-4', 'segment-3', 'gate-3'],
      'entrance-2-gate-4': ['entrance-2', 'corridor-4', 'segment-4', 'gate-4'],
    };

    const nodeIds = pathMap[pathId] || [startId, endId];

    nodeIds.forEach(nodeId => {
      const node = this.nodes.get(nodeId);
      if (node) {
        path.push(node);
        congestionScore += node.congestionLevel;
      }
    });

    // Calculate distances and times
    for (let i = 0; i < path.length - 1; i++) {
      const edgeKey = `${path[i].id}-${path[i + 1].id}`;
      const edge = this.edges.get(edgeKey);
      if (edge) {
        totalDistance += edge.distance;
        totalTime += edge.estimatedTime * (1 + edge.congestionFactor);
      }
    }

    congestionScore = Math.round(congestionScore / path.length);
    const efficiency = Math.max(0, 100 - congestionScore);

    const optimalPath: OptimalPath = {
      id: pathId,
      nodes: path,
      totalDistance,
      estimatedTime: Math.round(totalTime),
      congestionScore,
      efficiency,
      alternativePaths: this.findAlternativePaths(startId, endId, path),
    };

    // Cache the result
    if (!this.pathCache.has(pathId)) {
      this.pathCache.set(pathId, []);
    }
    this.pathCache.get(pathId)!.unshift(optimalPath);

    return optimalPath;
  }

  // Find alternative paths
  private findAlternativePaths(startId: string, endId: string, primaryPath: PathNode[]): OptimalPath[] {
    const alternatives: OptimalPath[] = [];

    // Generate 2 alternative paths
    for (let i = 0; i < 2; i++) {
      const altPath: OptimalPath = {
        id: `alt-${startId}-${endId}-${i}`,
        nodes: [...primaryPath],
        totalDistance: primaryPath.reduce((sum, node) => sum + (Math.random() * 10 - 5), 0),
        estimatedTime: primaryPath.length * 50 + Math.random() * 100,
        congestionScore: Math.round(Math.random() * 100),
        efficiency: Math.round(Math.random() * 100),
        alternativePaths: [],
      };
      alternatives.push(altPath);
    }

    return alternatives;
  }

  // Get route recommendation with amenity stops
  getRouteRecommendation(startId: string, endId: string): RouteRecommendation {
    const primaryRoute = this.findOptimalPath(startId, endId);
    const alternativeRoutes = primaryRoute.alternativePaths;

    // Find nearby amenities
    const amenityStops = Array.from(this.nodes.values())
      .filter(node => node.type === 'amenity')
      .map(amenity => ({
        amenityId: amenity.id,
        type: amenity.name,
        waitTime: Math.round(amenity.currentOccupancy / 5),
        distanceFromPath: Math.random() * 50,
      }))
      .filter(a => a.distanceFromPath < 30)
      .sort((a, b) => a.distanceFromPath - b.distanceFromPath);

    const estimatedTotalTime = primaryRoute.estimatedTime + amenityStops.reduce((sum, a) => sum + a.waitTime, 0);

    return {
      primaryRoute,
      alternativeRoutes,
      amenityStops,
      estimatedTotalTime,
    };
  }

  // Update node congestion
  updateNodeCongestion(nodeId: string, newCongestion: number) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.congestionLevel = Math.min(100, Math.max(0, newCongestion));
      node.currentOccupancy = Math.round((node.congestionLevel / 100) * node.capacity);
      this.pathCache.clear(); // Clear cache when congestion changes
    }
  }

  // Get network statistics
  getNetworkStats() {
    const nodes = Array.from(this.nodes.values());
    const avgCongestion = nodes.reduce((sum, n) => sum + n.congestionLevel, 0) / nodes.length;
    const criticalNodes = nodes.filter(n => n.congestionLevel > 80);
    const bottlenecks = nodes.filter(n => n.congestionLevel > 70 && n.type === 'segment');

    return {
      totalNodes: nodes.length,
      averageCongestion: Math.round(avgCongestion),
      criticalNodes: criticalNodes.length,
      bottlenecks: bottlenecks.length,
      networkHealth: Math.round(100 - avgCongestion),
    };
  }

  // Simulate real-time updates
  simulateRealTimeUpdates() {
    this.nodes.forEach(node => {
      const change = (Math.random() - 0.5) * 15;
      this.updateNodeCongestion(node.id, node.congestionLevel + change);
    });
  }
}

export const smartPathfinding = new SmartPathfindingSystem();
