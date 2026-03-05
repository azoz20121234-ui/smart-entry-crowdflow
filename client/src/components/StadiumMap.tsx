/**
 * Stadium Map Component - Smart Entry & CrowdFlow
 * 
 * Interactive stadium map showing facilities and crowd density
 * Helps fans navigate to less crowded areas
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Droplet, UtensilsCrossed, LogOut, AlertCircle } from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  type: 'restroom' | 'food' | 'exit' | 'info';
  x: number;
  y: number;
  crowdLevel: number; // 0-100
  waitTime: number; // minutes
  distance: number; // meters
}

interface StadiumMapProps {
  userLocation?: { x: number; y: number };
  onFacilitySelect?: (facility: Facility) => void;
}

export function StadiumMap({ userLocation, onFacilitySelect }: StadiumMapProps) {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [hoveredFacility, setHoveredFacility] = useState<string | null>(null);

  // Mock facilities data
  const facilities: Facility[] = [
    // Restrooms
    {
      id: 'rest-1',
      name: 'دورات مياه - الجناح الشمالي',
      type: 'restroom',
      x: 25,
      y: 20,
      crowdLevel: 65,
      waitTime: 5,
      distance: 120,
    },
    {
      id: 'rest-2',
      name: 'دورات مياه - الجناح الجنوبي',
      type: 'restroom',
      x: 75,
      y: 80,
      crowdLevel: 45,
      waitTime: 3,
      distance: 85,
    },
    {
      id: 'rest-3',
      name: 'دورات مياه - الجناح الشرقي',
      type: 'restroom',
      x: 85,
      y: 50,
      crowdLevel: 78,
      waitTime: 8,
      distance: 150,
    },
    {
      id: 'rest-4',
      name: 'دورات مياه - الجناح الغربي',
      type: 'restroom',
      x: 15,
      y: 50,
      crowdLevel: 35,
      waitTime: 2,
      distance: 95,
    },
    // Food stalls
    {
      id: 'food-1',
      name: 'كشك الطعام - الشمال',
      type: 'food',
      x: 30,
      y: 15,
      crowdLevel: 72,
      waitTime: 10,
      distance: 140,
    },
    {
      id: 'food-2',
      name: 'كشك الطعام - الجنوب',
      type: 'food',
      x: 70,
      y: 85,
      crowdLevel: 55,
      waitTime: 6,
      distance: 110,
    },
    {
      id: 'food-3',
      name: 'كشك الطعام - الشرق',
      type: 'food',
      x: 88,
      y: 45,
      crowdLevel: 88,
      waitTime: 15,
      distance: 170,
    },
    {
      id: 'food-4',
      name: 'كشك الطعام - الغرب',
      type: 'food',
      x: 12,
      y: 45,
      crowdLevel: 42,
      waitTime: 4,
      distance: 80,
    },
    // Exits
    {
      id: 'exit-1',
      name: 'بوابة الخروج - الشمالية',
      type: 'exit',
      x: 50,
      y: 5,
      crowdLevel: 35,
      waitTime: 2,
      distance: 100,
    },
    {
      id: 'exit-2',
      name: 'بوابة الخروج - الجنوبية',
      type: 'exit',
      x: 50,
      y: 95,
      crowdLevel: 68,
      waitTime: 7,
      distance: 130,
    },
    {
      id: 'exit-3',
      name: 'بوابة الخروج - الشرقية',
      type: 'exit',
      x: 95,
      y: 50,
      crowdLevel: 52,
      waitTime: 4,
      distance: 160,
    },
    {
      id: 'exit-4',
      name: 'بوابة الخروج - الغربية',
      type: 'exit',
      x: 5,
      y: 50,
      crowdLevel: 28,
      waitTime: 1,
      distance: 75,
    },
  ];

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'restroom':
        return <Droplet className="w-5 h-5" />;
      case 'food':
        return <UtensilsCrossed className="w-5 h-5" />;
      case 'exit':
        return <LogOut className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getCrowdColor = (level: number) => {
    if (level >= 80) return '#ef4444'; // Red
    if (level >= 60) return '#f59e0b'; // Orange
    if (level >= 40) return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  const getCrowdLabel = (level: number) => {
    if (level >= 80) return 'مزدحم جداً';
    if (level >= 60) return 'مزدحم';
    if (level >= 40) return 'متوسط';
    return 'فارغ';
  };

  const getRecommendedFacilities = (type: string) => {
    return facilities
      .filter(f => f.type === type)
      .sort((a, b) => a.crowdLevel - b.crowdLevel)
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Map */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            خريطة الملعب التفاعلية
          </CardTitle>
          <CardDescription>اضغط على المرافق للحصول على معلومات التوجيه</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full bg-gradient-to-br from-green-100 to-green-50 rounded-lg border-2 border-green-300 p-4" style={{ aspectRatio: '1' }}>
            {/* Stadium field */}
            <svg className="w-full h-full" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
              {/* Field background */}
              <rect x="10" y="10" width="80" height="80" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />

              {/* Field lines */}
              <line x1="50" y1="10" x2="50" y2="90" stroke="#fff" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
              <circle cx="50" cy="50" r="8" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
              <circle cx="50" cy="50" r="0.5" fill="#fff" opacity="0.5" />

              {/* Facilities */}
              {facilities.map(facility => (
                <g
                  key={facility.id}
                  onClick={() => {
                    setSelectedFacility(facility);
                    onFacilitySelect?.(facility);
                  }}
                  onMouseEnter={() => setHoveredFacility(facility.id)}
                  onMouseLeave={() => setHoveredFacility(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Facility circle */}
                  <circle
                    cx={facility.x}
                    cy={facility.y}
                    r="3"
                    fill={getCrowdColor(facility.crowdLevel)}
                    stroke="#fff"
                    strokeWidth="0.5"
                    opacity={hoveredFacility === facility.id ? 1 : 0.8}
                    style={{
                      transition: 'all 0.2s ease',
                      filter: hoveredFacility === facility.id ? 'drop-shadow(0 0 3px rgba(0,0,0,0.3))' : 'none',
                    }}
                  />

                  {/* Hover effect */}
                  {hoveredFacility === facility.id && (
                    <circle
                      cx={facility.x}
                      cy={facility.y}
                      r="5"
                      fill="none"
                      stroke={getCrowdColor(facility.crowdLevel)}
                      strokeWidth="0.5"
                      opacity="0.5"
                      style={{
                        animation: 'pulse 2s infinite',
                      }}
                    />
                  )}
                </g>
              ))}

              {/* User location */}
              {userLocation && (
                <g>
                  <circle cx={userLocation.x} cy={userLocation.y} r="2" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
                  <circle
                    cx={userLocation.x}
                    cy={userLocation.y}
                    r="4"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                </g>
              )}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-md border border-slate-200">
              <p className="text-xs font-semibold text-slate-900 mb-2">وسيلة الإيضاح</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>فارغ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span>متوسط</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>مزدحم</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>مزدحم جداً</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Restrooms */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-600" />
              دورات المياه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecommendedFacilities('restroom').map(facility => (
                <button
                  key={facility.id}
                  onClick={() => {
                    setSelectedFacility(facility);
                    onFacilitySelect?.(facility);
                  }}
                  className="w-full text-left p-3 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900">{facility.name}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-600">
                    <span>انتظار: {facility.waitTime} دقائق</span>
                    <span className="text-blue-600 font-semibold">{getCrowdLabel(facility.crowdLevel)}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Food Stalls */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              كشاكي الطعام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecommendedFacilities('food').map(facility => (
                <button
                  key={facility.id}
                  onClick={() => {
                    setSelectedFacility(facility);
                    onFacilitySelect?.(facility);
                  }}
                  className="w-full text-left p-3 rounded-lg border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900">{facility.name}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-600">
                    <span>انتظار: {facility.waitTime} دقائق</span>
                    <span className="text-orange-600 font-semibold">{getCrowdLabel(facility.crowdLevel)}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exits */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <LogOut className="w-4 h-4 text-purple-600" />
              بوابات الخروج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecommendedFacilities('exit').map(facility => (
                <button
                  key={facility.id}
                  onClick={() => {
                    setSelectedFacility(facility);
                    onFacilitySelect?.(facility);
                  }}
                  className="w-full text-left p-3 rounded-lg border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900">{facility.name}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-600">
                    <span>انتظار: {facility.waitTime} دقائق</span>
                    <span className="text-purple-600 font-semibold">{getCrowdLabel(facility.crowdLevel)}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Facility Details */}
      {selectedFacility && (
        <Card className="shadow-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-lg">{getFacilityIcon(selectedFacility.type)}</div>
                <div>
                  <CardTitle>{selectedFacility.name}</CardTitle>
                  <CardDescription>مسافة: {selectedFacility.distance} متر</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedFacility(null)}>
                إغلاق
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-2">مستوى الازدحام</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-slate-900">{selectedFacility.crowdLevel}%</p>
                  <p className="text-sm font-semibold text-slate-600 mb-1">{getCrowdLabel(selectedFacility.crowdLevel)}</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${selectedFacility.crowdLevel}%`,
                      backgroundColor: getCrowdColor(selectedFacility.crowdLevel),
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-2">وقت الانتظار المتوقع</p>
                <p className="text-3xl font-bold text-slate-900">{selectedFacility.waitTime}</p>
                <p className="text-sm text-slate-600 mt-1">دقيقة</p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-2">المسافة</p>
                <p className="text-3xl font-bold text-slate-900">{selectedFacility.distance}</p>
                <p className="text-sm text-slate-600 mt-1">متر</p>
              </div>
            </div>

            {selectedFacility.crowdLevel >= 70 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">تنبيه</p>
                  <p className="text-sm text-yellow-800 mt-1">هذه المرافق مزدحمة حالياً. يوصى باختيار بديل أقل ازدحاماً.</p>
                </div>
              </div>
            )}

            <Button className="w-full mt-4 bg-blue-700 hover:bg-blue-800 h-12">
              احصل على التوجيهات
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="shadow-md bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-sm">نصائح للتنقل</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ اختر المرافق ذات اللون الأخضر للحصول على أسرع خدمة</li>
            <li>✓ تجنب المرافق ذات اللون الأحمر إن أمكن</li>
            <li>✓ الأوقات الأمثل للتنقل هي قبل بدء المباراة مباشرة</li>
            <li>✓ بوابات الخروج الغربية عادة ما تكون الأقل ازدحاماً</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
