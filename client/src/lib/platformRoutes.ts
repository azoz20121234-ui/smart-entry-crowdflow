import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Crown,
  Home,
  ShieldCheck,
  Users,
} from "lucide-react";

export type PlatformRouteTone = "blue" | "emerald" | "amber" | "rose" | "indigo" | "slate";

export interface PlatformRoute {
  path: string;
  title: string;
  description: string;
  category: "الانطلاق" | "التشغيل" | "التحليلات" | "الإدارة" | "تجربة المشجع";
  icon: LucideIcon;
  tone: PlatformRouteTone;
  featured?: boolean;
  showInNavigation?: boolean;
}

export const platformRoutes: PlatformRoute[] = [
  {
    path: "/",
    title: "الرئيسية",
    description: "نظرة عامة على المنصة ومسارات الوصول السريع.",
    category: "الانطلاق",
    icon: Home,
    tone: "blue",
    featured: true,
    showInNavigation: true,
  },
  {
    path: "/operator",
    title: "لوحة المنظمين",
    description: "تشغيل البوابات ومتابعة الطوابير والتنبيهات الحرجة.",
    category: "التشغيل",
    icon: ShieldCheck,
    tone: "emerald",
    featured: true,
    showInNavigation: true,
  },
  {
    path: "/executive",
    title: "اللوحة التنفيذية",
    description: "مؤشرات الأداء والتنبؤات والرؤية الاستراتيجية.",
    category: "التشغيل",
    icon: Crown,
    tone: "amber",
    featured: true,
    showInNavigation: true,
  },
  {
    path: "/admin",
    title: "لوحة الإدارة",
    description: "إدارة العمليات اليومية وتوزيع الموارد.",
    category: "الإدارة",
    icon: Users,
    tone: "slate",
    featured: false,
    showInNavigation: false,
  },
  {
    path: "/fan",
    title: "تطبيق المشجع",
    description: "تجربة المشجع والتذكرة الذكية وتتبع الدخول.",
    category: "تجربة المشجع",
    icon: Compass,
    tone: "indigo",
    featured: true,
    showInNavigation: true,
  },
];

export function getRouteByPath(pathname: string): PlatformRoute | undefined {
  return platformRoutes.find(route => route.path === pathname);
}

export function getRouteToneClasses(tone: PlatformRouteTone): {
  iconWrapper: string;
  iconColor: string;
  badge: string;
} {
  switch (tone) {
    case "emerald":
      return {
        iconWrapper: "bg-emerald-50 border-emerald-100",
        iconColor: "text-emerald-700",
        badge: "bg-emerald-100 text-emerald-700",
      };
    case "amber":
      return {
        iconWrapper: "bg-amber-50 border-amber-100",
        iconColor: "text-amber-700",
        badge: "bg-amber-100 text-amber-800",
      };
    case "rose":
      return {
        iconWrapper: "bg-rose-50 border-rose-100",
        iconColor: "text-rose-700",
        badge: "bg-rose-100 text-rose-700",
      };
    case "indigo":
      return {
        iconWrapper: "bg-indigo-50 border-indigo-100",
        iconColor: "text-indigo-700",
        badge: "bg-indigo-100 text-indigo-700",
      };
    case "slate":
      return {
        iconWrapper: "bg-slate-100 border-slate-200",
        iconColor: "text-slate-700",
        badge: "bg-slate-100 text-slate-700",
      };
    case "blue":
    default:
      return {
        iconWrapper: "bg-blue-50 border-blue-100",
        iconColor: "text-blue-700",
        badge: "bg-blue-100 text-blue-700",
      };
  }
}
