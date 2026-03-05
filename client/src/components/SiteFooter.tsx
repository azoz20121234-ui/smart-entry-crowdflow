import { Link } from "wouter";

const footerLinks = [
  { path: "/fan", label: "المشجع" },
  { path: "/operator", label: "المنظم" },
  { path: "/executive", label: "التنفيذية" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-6xl gap-3 px-4 py-4 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
        <div className="text-center sm:text-right">
          <p className="font-bold text-slate-800">منصة إدارة الحشود الذكية</p>
          <p className="mt-1">منصة إدارة تدفّق الحشود الذكية</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-2">
          {footerLinks.map(link => (
            <Link
              key={link.path}
              href={link.path}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-center sm:text-right lg:text-right">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
