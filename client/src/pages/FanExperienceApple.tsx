/**
 * Fan Experience - Apple Wallet Style
 * CrowdOS - Smart Stadium Operating System
 * 
 * تجربة المشجع - بأسلوب Apple Wallet
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Clock, Navigation, AlertCircle } from 'lucide-react';

export default function FanExperienceApple() {
  const [location, setLocation] = useLocation();
  const [entryWindow, setEntryWindow] = useState('18:30 – 19:00');
  const [walkingTime, setWalkingTime] = useState(3);
  const [gateAssigned, setGateAssigned] = useState(4);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-black sticky top-0 z-50">
        <div className="container py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 max-w-md mx-auto">
        {/* Digital Ticket Card */}
        <div className="mb-8">
          <div className="relative">
            {/* Ticket Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-2xl border border-blue-500/30 backdrop-blur-xl">
              {/* Ticket Header */}
              <div className="mb-8">
                <p className="text-blue-100 text-sm font-medium mb-2">تذكرتك الرقمية</p>
                <h2 className="text-3xl font-bold">Digital Ticket</h2>
              </div>

              {/* Event Info */}
              <div className="mb-8 pb-8 border-b border-blue-400/30">
                <p className="text-blue-100 text-sm mb-1">الحدث</p>
                <p className="text-2xl font-bold">مباراة كرة القدم</p>
                <p className="text-blue-200 text-sm mt-2">الملعب الرئيسي - 20 مارس 2026</p>
              </div>

              {/* Ticket Details */}
              <div className="space-y-6">
                {/* Gate */}
                <div>
                  <p className="text-blue-100 text-xs font-medium mb-2 uppercase">البوابة</p>
                  <p className="text-4xl font-bold">{gateAssigned}</p>
                </div>

                {/* Entry Window */}
                <div>
                  <p className="text-blue-100 text-xs font-medium mb-2 uppercase">نافذة الدخول</p>
                  <p className="text-lg font-semibold">{entryWindow}</p>
                </div>

                {/* Seat */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-100 text-xs font-medium mb-2 uppercase">المقعد</p>
                    <p className="text-xl font-bold">A-145</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs font-medium mb-2 uppercase">القسم</p>
                    <p className="text-xl font-bold">North</p>
                  </div>
                </div>
              </div>

              {/* Barcode */}
              <div className="mt-8 pt-8 border-t border-blue-400/30">
                <div className="bg-white rounded-lg p-4 flex items-center justify-center h-20">
                  <div className="text-blue-900 font-mono text-xs text-center">
                    █ ██ █ █ ██ █ █ ██ █ █ ██ █ █ ██ █ █ ██ █ █
                  </div>
                </div>
                <p className="text-blue-200 text-xs text-center mt-3 font-mono">1234-5678-9012-3456</p>
              </div>
            </div>

            {/* Add to Wallet Button */}
            <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg font-semibold transition-all duration-300">
              إضافة إلى المحفظة
            </Button>
          </div>
        </div>

        {/* Smart Navigation Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">الملاحة الذكية</h3>

          {/* Navigation Card */}
          <Card className="rounded-3xl bg-gray-900/40 border-gray-800 backdrop-blur-xl mb-4">
            <CardContent className="pt-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">الاتجاه إلى البوابة</p>
                  <p className="text-2xl font-bold">شمال غرب</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-gray-400 text-xs">وقت المشي</p>
                    <p className="text-white font-semibold">{walkingTime} دقائق</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-xs">المسافة</p>
                    <p className="text-white font-semibold">450 متر</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Navigation Button */}
          <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full py-6 text-lg font-semibold transition-all duration-300">
            ابدأ الملاحة
          </Button>
        </div>

        {/* Recommendations Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">التوصيات الذكية</h3>

          {/* Best Entry Time */}
          <Card className="rounded-2xl bg-green-950/30 border-green-800/50 backdrop-blur-xl mb-4">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">أفضل وقت للدخول</p>
                  <p className="text-gray-400 text-xs">الآن - لا ازدحام على البوابة 4</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crowd Status */}
          <Card className="rounded-2xl bg-yellow-950/30 border-yellow-800/50 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">حالة الازدحام</p>
                  <p className="text-gray-400 text-xs">البوابة 2 مزدحمة - استخدم البوابة 4</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full rounded-full py-6 border-gray-700 hover:bg-gray-900/50">
            اتصل بالدعم
          </Button>
          <Button variant="outline" className="w-full rounded-full py-6 border-gray-700 hover:bg-gray-900/50">
            عرض خريطة الملعب
          </Button>
        </div>
      </div>
    </div>
  );
}
