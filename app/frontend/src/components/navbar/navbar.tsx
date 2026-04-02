import { BackButton } from "@/components/ui/BackButton/backButton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type NavbarProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
  backLabel?: string;
  backTo?: string;
  className?: string;
};

export default function Navbar({
  title,
  subtitle,
  action,
  showBack = false,
  backLabel,
  backTo,
  className,
}: NavbarProps) {
  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl transition-all duration-300",
        className,
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 h-16 sm:px-6">
        <div className="flex items-center gap-4 min-w-0">
          {showBack && (
            <div className="shrink-0">
              <BackButton
                iconOnly
                fallbackTo={backTo ?? undefined}
                label={backLabel}
                className="h-10 w-10 rounded-xl bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm"
              />
            </div>
          )}
          <div className="min-w-0">
            {subtitle && (
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600/80 leading-none mb-1">
                {subtitle}
              </p>
            )}
            <h1 className="truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        {action && (
          <div className="flex items-center shrink-0 ml-4">{action}</div>
        )}
      </div>
    </nav>
  );
}
