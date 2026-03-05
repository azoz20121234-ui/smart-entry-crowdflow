/**
 * Fan Navigation Page - Smart Entry & CrowdFlow
 * 
 * Indoor smart routing for fans
 * Guides them to less crowded facilities
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { StadiumMap } from '@/components/StadiumMap';
import { ArrowRight, MapPin, Navigation } from 'lucide-react';

export default function FanNavigation() {
  const [, setLocation] = useLocation();
  const [selectedFacility, setSelectedFacility] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
                onClick={() => setLocation('/fan')}
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">التوجيه المكاني الذكي</h1>
                <p className="text-blue-100 mt-1">ابحث عن أقرب المرافق الفارغة</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">موقعك الحالي</p>
              <p className="text-lg font-semibold flex items-center gap-2 justify-end">
                <MapPin className="w-5 h-5" />
                المدخل الرئيسي
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <StadiumMap
          userLocation={{ x: 50, y: 10 }}
          onFacilitySelect={setSelectedFacility}
        />

        {/* Current Location Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-600">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">موقعك الحالي</h3>
            <p className="text-lg font-bold text-slate-900">المدخل الرئيسي</p>
            <p className="text-xs text-slate-500 mt-2">أنت هنا الآن</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-green-600">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">أقرب مرفق فارغ</h3>
            <p className="text-lg font-bold text-slate-900">دورات مياه - الغرب</p>
            <p className="text-xs text-slate-500 mt-2">95 متر - 2 دقائق مشي</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-orange-600">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">أقرب كشك طعام</h3>
            <p className="text-lg font-bold text-slate-900">كشك الطعام - الغرب</p>
            <p className="text-xs text-slate-500 mt-2">80 متر - 4 دقائق انتظار</p>
          </div>
        </div>

        {/* Navigation Tips */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 shadow-md">
          <div className="flex items-start gap-4">
            <Navigation className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">نصائح التوجيه</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>🎯 استخدم الخريطة التفاعلية للعثور على أقرب مرفق</li>
                <li>⏱️ الأوقات المعروضة هي متوسطات بناءً على البيانات الحية</li>
                <li>🚶 المسافات المعروضة هي المسافات الفعلية داخل الملعب</li>
                <li>📍 اضغط على أي مرفق للحصول على تفاصيل كاملة والتوجيهات</li>
                <li>⚠️ تجنب المرافق ذات اللون الأحمر إن أمكن</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Access Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            دورات المياه الأقرب
          </Button>
          <Button className="h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold">
            كشاكي الطعام الأقرب
          </Button>
          <Button className="h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold">
            بوابات الخروج الآمنة
          </Button>
        </div>
      </div>
    </div>
  );
}
