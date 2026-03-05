import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Compass,
  Crown,
  Home,
  Lightbulb,
  MapPinned,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";

export interface PlatformRoute {
  path: string;
  title: string;
  description: string;
  category: "الانطلاق" | "التشغيل" | "التحليلات" | "الإدارة" | "تجربة المشجع";
  icon: LucideIcon;
  featured?: boolean;
}

export const platformRoutes: PlatformRoute[] = [
  {
    path: "/",
    title: "الرئيسية",
    description: "نظرة عامة على المنصة ومسارات الوصول السريع.",
    category: "الانطلاق",
    icon: Home,
    featured: true,
  },
  {
    path: "/operator",
    title: "لوحة المنظمين",
    description: "تشغيل البوابات ومتابعة الطوابير والتنبيهات الحرجة.",
    category: "التشغيل",
    icon: ShieldCheck,
    featured: true,
  },
  {
    path: "/executive",
    title: "اللوحة التنفيذية",
    description: "مؤشرات الأداء والتنبؤات والرؤية الاستراتيجية.",
    category: "التشغيل",
    icon: Crown,
    featured: true,
  },
  {
    path: "/admin",
    title: "لوحة الإدارة",
    description: "إدارة العمليات اليومية وتوزيع الموارد.",
    category: "الإدارة",
    icon: Users,
    featured: true,
  },
  {
    path: "/fan",
    title: "تطبيق المشجع",
    description: "تجربة المشجع والتذكرة الذكية وتتبع الدخول.",
    category: "تجربة المشجع",
    icon: Compass,
    featured: true,
  },
  {
    path: "/fan-navigation",
    title: "التوجيه الذكي للمشجع",
    description: "أفضل المسارات داخل الملعب وتحديثات الحركة.",
    category: "تجربة المشجع",
    icon: MapPinned,
  },
  {
    path: "/analytics",
    title: "لوحة التحليلات",
    description: "تحليلات الأداء اللحظية والاتجاهات الزمنية.",
    category: "التحليلات",
    icon: BarChart3,
    featured: true,
  },
  {
    path: "/crowd-dna",
    title: "تحليلات Crowd DNA",
    description: "تحليل أنماط الحضور والسلوك الجماهيري.",
    category: "التحليلات",
    icon: Activity,
  },
  {
    path: "/strategic",
    title: "التحكم الاستراتيجي",
    description: "سيناريوهات القرار وتحسين توزيع التدفقات.",
    category: "التحليلات",
    icon: BarChart3,
  },
  {
    path: "/innovative",
    title: "الميزات الابتكارية",
    description: "القدرات المتقدمة والمزايا المستقبلية.",
    category: "الانطلاق",
    icon: Lightbulb,
  },
  {
    path: "/system-admin",
    title: "إدارة النظام",
    description: "ضبط الصلاحيات، التكاملات، ومراقبة الصحة التشغيلية.",
    category: "الإدارة",
    icon: Settings2,
    featured: true,
  },
];

export function getRouteByPath(pathname: string): PlatformRoute | undefined {
  return platformRoutes.find(route => route.path === pathname);
}
