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
import { platformRoutes, getRouteByPath } from "@/lib/platformRoutes";
import { toast } from "sonner";

export default function PlatformQuickAccess() {
  const [open, setOpen] = useState(false);
  const [pathname, setLocation] = useLocation();

  const currentRoute = useMemo(() => getRouteByPath(pathname), [pathname]);

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
        <Compass className="mr-2 h-4 w-4" />
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
          <CommandGroup heading="الصفحات">
            {platformRoutes.map(route => {
              const Icon = route.icon;
              return (
                <CommandItem
                  key={route.path}
                  value={`${route.title} ${route.description} ${route.category}`}
                  onSelect={() => navigateTo(route.path)}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{route.title}</span>
                    <span className="truncate text-xs text-slate-500">{route.description}</span>
                  </div>
                  <CommandShortcut>{route.category}</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
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

