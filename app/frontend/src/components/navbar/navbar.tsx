import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

type NavbarProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
  backTo?: string;
  className?: string;
};

export default function Navbar({
  title,
  subtitle,
  action,
  showBack = false,
  backTo,
  className,
}: NavbarProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/60 bg-card/90 backdrop-blur-xl transition-all duration-300 py-3 md:py-4",
        className,
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10 rounded-2xl hover:bg-primary/10 hover:text-primary/80 transition-all border border-border/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="min-w-0">
            {subtitle && (
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-1">
                {subtitle}
              </p>
            )}
            <h1 className="truncate text-xl font-black tracking-tighter text-foreground sm:text-2xl font-heading">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10 rounded-2xl hover:bg-primary/10 hover:text-primary/80 transition-all border border-border/50"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {action && <div className="flex items-center">{action}</div>}
        </div>
      </div>
    </nav>
  );
}




