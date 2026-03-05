import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Compass, Copy, Home, Keyboard, MoveUpRight } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { platformRoutes, getRouteByPath, getRouteToneClasses } from "@/lib/platformRoutes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PlatformQuickAccess() {
  const [open, setOpen] = useState(false);
  const [pathname, setLocation] = useLocation();

  const currentRoute = useMemo(() => getRouteByPath(pathname), [pathname]);
  const routeGroups = useMemo(() => {
    const categoryOrder = ["الانطلاق", "التشغيل", "التحليلات", "تجربة المشجع", "الإدارة"] as const;
    return categoryOrder
      .map(category => ({
        category,
        routes: platformRoutes.filter(
          route => route.category === category && route.showInNavigation !== false,
        ),
      }))
      .filter(group => group.routes.length > 0);
  }, []);
  const currentIconStyles = currentRoute ? getRouteToneClasses(currentRoute.tone) : getRouteToneClasses("blue");
  const CurrentIcon = currentRoute?.icon ?? Compass;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const navigateTo = (path: string) => {
    setLocation(path);
    setOpen(false);
  };

  const copyCurrentLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${pathname}`);
      toast.success("تم نسخ رابط الصفحة الحالية");
    } catch {
      toast.error("تعذر نسخ الرابط");
    } finally {
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        className="fixed bottom-4 left-4 z-50 h-11 rounded-full bg-slate-900 px-4 text-white shadow-lg hover:bg-slate-800 md:bottom-6 md:left-6"
        onClick={() => setOpen(true)}
      >
        <span className={cn("mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md border", currentIconStyles.iconWrapper)}>
          <CurrentIcon className={cn("h-3.5 w-3.5", currentIconStyles.iconColor)} />
        </span>
        <span className="hidden md:inline">تنقل سريع</span>
        <span className="md:hidden">تنقل</span>
        <span className="mx-2 hidden h-4 w-px bg-white/30 md:inline" />
        <span className="hidden text-xs text-white/80 md:inline">{currentRoute?.title ?? "المنصة"}</span>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="الوصول السريع"
        description="ابحث عن صفحة أو نفّذ إجراء سريع"
      >
        <CommandInput placeholder="ابحث عن صفحة أو إجراء..." />
        <CommandList>
          <CommandEmpty>لا توجد نتائج مطابقة.</CommandEmpty>
          {routeGroups.map(group => (
            <CommandGroup key={group.category} heading={group.category}>
              {group.routes.map(route => {
                const Icon = route.icon;
                const tone = getRouteToneClasses(route.tone);
                return (
                  <CommandItem
                    key={route.path}
                    value={`${route.title} ${route.description} ${route.category}`}
                    onSelect={() => navigateTo(route.path)}
                  >
                    <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md border", tone.iconWrapper)}>
                      <Icon className={cn("h-3.5 w-3.5", tone.iconColor)} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{route.title}</span>
                      <span className="truncate text-xs text-slate-500">{route.description}</span>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", tone.badge)}>
                      {route.category}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="إجراءات سريعة">
            <CommandItem onSelect={() => navigateTo("/")}>
              <Home className="h-4 w-4" />
              الصفحة الرئيسية
            </CommandItem>
            <CommandItem onSelect={copyCurrentLink}>
              <Copy className="h-4 w-4" />
              نسخ رابط الصفحة الحالية
              <CommandShortcut>⌘/Ctrl + C</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setOpen(false);
              }}
            >
              <MoveUpRight className="h-4 w-4" />
              الانتقال إلى أعلى الصفحة
            </CommandItem>
            <CommandItem
              onSelect={() => {
                toast("اختصار فتح التنقل السريع: Ctrl/Cmd + K");
                setOpen(false);
              }}
            >
              <Keyboard className="h-4 w-4" />
              عرض اختصارات التنقل
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
