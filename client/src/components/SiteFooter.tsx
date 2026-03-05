export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-600 md:flex-row">
        <p>Smart Entry & CrowdFlow</p>
        <p className="text-center">منصة إدارة تدفّق الحشود الذكية</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
